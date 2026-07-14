#!/usr/bin/env python3
"""Build a local, OCR-backed textbook data pack from the family's PDF files.

The generated images and JSON stay under textbooks/data/ and are ignored by Git.
The web app uses this pack as its only teaching-data source in local mode.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
TEXTBOOKS = ROOT / "textbooks"
DATA_ROOT = TEXTBOOKS / "data"
TESSERACT_DEFAULT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
POPPLER_DEFAULT = Path(
    r"C:\Users\Tide\.cache\codex-runtimes\codex-primary-runtime\dependencies"
    r"\native\poppler\Library\bin\pdftoppm.exe"
)


BOOK_SPECS = [
    ("g3a", "三年级上册", "三年级上册.pdf"),
    ("g3b", "三年级下册", "三年级 下册.pdf"),
    ("g4a", "四年级上册", "四年级上册.pdf"),
    ("g4b", "四年级下册", "四年级下册.pdf"),
    ("g5a", "五年级上册", "五年级上册.pdf"),
    ("g5b", "五年级下册", "五年级下册.pdf"),
    ("g6a", "六年级上册", "六年级上册.pdf"),
    ("g6b", "六年级下册", "六年级下册.pdf"),
]

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
}

STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do",
    "for", "from", "go", "has", "have", "he", "her", "here", "him", "his",
    "how", "i", "in", "is", "it", "its", "let", "like", "me", "my", "no",
    "not", "of", "on", "or", "our", "please", "she", "so", "some", "that",
    "the", "their", "them", "there", "they", "this", "to", "too", "up", "us",
    "we", "what", "when", "where", "which", "who", "why", "with", "you", "your",
    "unit", "english", "story", "time", "page", "look", "listen", "read", "say",
    "act", "answer", "ask", "cartoon", "circle", "class", "find", "grammar", "group",
    "groups", "learning", "letters", "objectives", "partner", "picture", "questions",
    "see", "show", "sound", "talk", "tell", "think", "ticking", "trace", "write",
    # Textbook character/person names are still point-readable, but are not useful
    # as isolated vocabulary drills.
    "bobby", "cinderella", "goldilocks", "hai", "liu", "mark", "mike", "sam", "su", "tao",
    "tina", "wang", "bing", "yang", "ling",
}

INSTRUCTION_PREFIXES = (
    "act out", "ask and", "check your", "choose", "circle", "complete", "draw",
    "find", "follow", "learn more", "listen", "look", "make a", "match", "play the",
    "read", "say", "show", "sing", "talk about", "tell", "think", "tick", "trace",
    "try to", "use the", "work in", "write", "now greet",
)

INSTRUCTION_MARKERS = (
    "big question", "cartoon time", "checkout time", "grammar time", "learning objectives",
    "see page", "sound time", "story time", "ticking time",
)

META_QUESTION_MARKERS = (
    "what can you see", "what are they saying", "what does the story", "what should",
    "who is bobby", "who is sam", "how do the teacher", "how do bobby", "what does dad",
    "what does mike", "what do the students", "what do bobby", "what is the play about",
    "do you share things", "what do you share with", "what does the picture",
    "who is your english teacher", "where are the students", "what do su hai",
    "why does", "what do you think of", "what animals do", "what sport do you like playing",
    "what clothes do", "what can they say", "what do the lion and the mouse do",
)

PRACTICE_REJECT_PATTERNS = (
    r"\.\.\.",
    r"[A-Za-z]\d|\d[A-Za-z]",
    r"\bWhat s\b",
    r"\b(?:thisthat|nowit|foru|Wes)\b",
    r"^I\s+(?:Who|What|Where|When|Why|How)\b",
    r"^Hello,?\s+I'm[.!?]*$",
    r"\b[A-Za-z]+\s+'s\b",
    r"^I class\.$",
    r"\bhimher\b",
    r"\bis in O\.$",
)


@dataclass(frozen=True)
class BookInput:
    id: str
    label: str
    pdf: Path


def resolve_executable(explicit: str | None, fallback: Path, command: str) -> Path:
    if explicit:
        path = Path(explicit)
    elif fallback.exists():
        path = fallback
    else:
        found = shutil.which(command)
        if not found:
            raise FileNotFoundError(f"找不到 {command}，请先安装后重试。")
        path = Path(found)
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def find_books() -> list[BookInput]:
    pdfs = list(TEXTBOOKS.glob("*.pdf"))
    books: list[BookInput] = []
    missing: list[str] = []
    for book_id, label, suffix in BOOK_SPECS:
        matches = [path for path in pdfs if path.name.endswith(suffix)]
        if len(matches) != 1:
            missing.append(f"{label}（匹配到 {len(matches)} 个文件）")
            continue
        books.append(BookInput(book_id, label, matches[0]))
    if missing:
        raise RuntimeError("教材文件不完整：" + "、".join(missing))
    return books


def render_book(book: BookInput, pdftoppm: Path, dpi: int, force: bool) -> tuple[int, Path]:
    book_root = DATA_ROOT / "books" / book.id
    pages_dir = book_root / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    page_count = len(PdfReader(book.pdf).pages)
    complete = all((pages_dir / f"page-{page:03d}.jpg").exists() for page in range(1, page_count + 1))
    if complete and not force:
        return page_count, pages_dir

    print(f"[渲染] {book.label}：{page_count} 页", flush=True)
    for old in pages_dir.glob("*.jpg"):
        old.unlink()
    prefix = pages_dir / "render"
    command = [
        str(pdftoppm), "-jpeg", "-r", str(dpi), "-jpegopt", "quality=84,optimize=y",
        str(book.pdf), str(prefix),
    ]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL)
    rendered = sorted(pages_dir.glob("render-*.jpg"), key=lambda path: int(path.stem.rsplit("-", 1)[1]))
    if len(rendered) != page_count:
        raise RuntimeError(f"{book.label} 渲染页数不符：期望 {page_count}，实际 {len(rendered)}")
    for page, source in enumerate(rendered, start=1):
        source.replace(pages_dir / f"page-{page:03d}.jpg")
    return page_count, pages_dir


def clean_token(text: str) -> str:
    text = text.replace("|", "I").replace("’", "'").strip()
    text = re.sub(r"[^A-Za-z0-9'.,!?;:()\-]", "", text)
    return text


def parse_tsv(tsv: str, image_width: int, image_height: int) -> list[dict]:
    groups: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    reader = csv.DictReader(io.StringIO(tsv), delimiter="\t")
    for row in reader:
        if row.get("level") != "5":
            continue
        token = clean_token(row.get("text", ""))
        if not token or not re.search(r"[A-Za-z]", token):
            continue
        try:
            confidence = float(row.get("conf", "-1"))
            left = int(row["left"])
            top = int(row["top"])
            width = int(row["width"])
            height = int(row["height"])
        except (TypeError, ValueError, KeyError):
            continue
        if confidence < 42 or width <= 0 or height <= 0:
            continue
        groups[(row["block_num"], row["par_num"], row["line_num"])].append(
            {"text": token, "conf": confidence, "left": left, "top": top, "width": width, "height": height}
        )

    lines: list[dict] = []
    for words in groups.values():
        words.sort(key=lambda item: item["left"])
        text = " ".join(item["text"] for item in words)
        if len(text) < 2:
            continue
        left = min(item["left"] for item in words)
        top = min(item["top"] for item in words)
        right = max(item["left"] + item["width"] for item in words)
        bottom = max(item["top"] + item["height"] for item in words)
        confidence = round(sum(item["conf"] for item in words) / len(words), 1)
        lines.append(
            {
                "text": text,
                "confidence": confidence,
                "x": round(left / image_width, 5),
                "y": round(top / image_height, 5),
                "width": round((right - left) / image_width, 5),
                "height": round((bottom - top) / image_height, 5),
            }
        )
    return sorted(lines, key=lambda item: (item["y"], item["x"]))


def jpeg_dimensions(path: Path) -> tuple[int, int]:
    # Pillow is available in the bundled workspace Python runtime.
    from PIL import Image

    with Image.open(path) as image:
        return image.size


def ocr_page(task: tuple[BookInput, int, Path, Path, bool]) -> tuple[str, int, int]:
    book, page_number, image_path, tesseract, force = task
    page_json = DATA_ROOT / "books" / book.id / "ocr" / f"page-{page_number:03d}.json"
    if page_json.exists() and not force:
        payload = json.loads(page_json.read_text(encoding="utf-8"))
        return book.id, page_number, len(payload.get("lines", []))
    page_json.parent.mkdir(parents=True, exist_ok=True)
    width, height = jpeg_dimensions(image_path)
    command = [str(tesseract), str(image_path), "stdout", "-l", "eng", "--psm", "11", "tsv"]
    result = subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
    lines = parse_tsv(result.stdout, width, height)
    payload = {"page": page_number, "width": width, "height": height, "lines": lines}
    page_json.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return book.id, page_number, len(lines)


def unit_number(text: str) -> int | None:
    match = re.search(r"\bUnit\s*([0-9]+|one|two|three|four|five|six|seven|eight|nine|ten)\b", text, re.I)
    if not match:
        return None
    value = match.group(1).lower()
    return int(value) if value.isdigit() else NUMBER_WORDS.get(value)


def line_is_teachable(line: dict) -> bool:
    text = line["text"].strip()
    lower = text.lower()
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", text)
    if line["confidence"] < 82 or not 2 <= len(words) <= 18:
        return False
    if len(text) < 5 or any(lower.startswith(prefix) for prefix in INSTRUCTION_PREFIXES):
        return False
    if any(marker in lower for marker in INSTRUCTION_MARKERS):
        return False
    if not re.match(r"^[A-Z0-9'\"]", text):
        return False
    if not re.search(r"[.!?][\"']?$", text):
        return False
    return True


def line_is_practice(line: dict) -> bool:
    """Keep faithful source sentences, while removing teacher-facing prompts."""
    if not line_is_teachable(line):
        return False
    lower = line["text"].strip().lower()
    if any(marker in lower for marker in META_QUESTION_MARKERS):
        return False
    return not any(re.search(pattern, line["text"]) for pattern in PRACTICE_REJECT_PATTERNS)


def choose_title(page_lines: list[dict], number: int) -> str:
    for index, line in enumerate(page_lines):
        if unit_number(line["text"]) == number:
            for candidate in page_lines[index + 1:index + 5]:
                if line_is_teachable(candidate) and len(candidate["text"]) <= 70:
                    return candidate["text"]
    for line in page_lines:
        if line["text"].lower().startswith(("how ", "what ", "where ", "when ", "who ", "can ")):
            return line["text"]
    return f"Unit {number}"


def build_units(book: BookInput, page_count: int) -> list[dict]:
    pages: dict[int, list[dict]] = {}
    starts: list[tuple[int, int]] = []
    big_question_pages: list[int] = []
    for page in range(1, page_count + 1):
        path = DATA_ROOT / "books" / book.id / "ocr" / f"page-{page:03d}.json"
        payload = json.loads(path.read_text(encoding="utf-8"))
        lines = payload.get("lines", [])
        pages[page] = lines
        numbers = sorted({number for line in lines if (number := unit_number(line["text"])) is not None})
        if len(numbers) == 1:
            supporting = " ".join(line["text"].lower() for line in lines)
            if any(marker in supporting for marker in ("story time", "big question", "learning objectives", "unit")):
                starts.append((numbers[0], page))
        if any("big question" in line["text"].lower() for line in lines):
            big_question_pages.append(page)

    override_path = TEXTBOOKS / "review-overrides.json"
    override_payload = json.loads(override_path.read_text(encoding="utf-8")) if override_path.exists() else {}
    reviewed_units = override_payload.get("books", {}).get(book.id, {}).get("units", [])

    best_by_number: dict[int, int] = {}
    for number, page in starts:
        best_by_number.setdefault(number, page)
    if len(best_by_number) < 4 and len(big_question_pages) >= 4:
        best_by_number = {index: page for index, page in enumerate(big_question_pages, start=1)}
    if reviewed_units:
        best_by_number = {int(item["number"]): int(item["startPage"]) for item in reviewed_units}
    ordered_starts = sorted(best_by_number.items(), key=lambda item: item[1])
    if len(ordered_starts) < 4:
        # Keep the uncertainty explicit; the UI will show page-based study instead of inventing unit data.
        return []

    units: list[dict] = []
    for position, (number, start_page) in enumerate(ordered_starts):
        reviewed = next((item for item in reviewed_units if int(item["number"]) == number), None)
        end_page = int(reviewed["endPage"]) if reviewed else (ordered_starts[position + 1][1] - 1 if position + 1 < len(ordered_starts) else page_count)
        candidate_lines: list[dict] = []
        word_sources: dict[str, dict] = {}
        frequencies: Counter[str] = Counter()
        seen_lines: set[str] = set()
        for page in range(start_page, end_page + 1):
            for line in pages[page]:
                if not line_is_practice(line):
                    continue
                normalized = re.sub(r"\s+", " ", line["text"].strip())
                key = normalized.lower()
                if key in seen_lines:
                    continue
                seen_lines.add(key)
                item = {"text": normalized, "page": page, "confidence": line["confidence"]}
                candidate_lines.append(item)
                for word in re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", normalized):
                    lower = word.lower()
                    if len(lower) < 3 or lower in STOP_WORDS:
                        continue
                    frequencies[lower] += 1
                    word_sources.setdefault(lower, {"text": word, "page": page, "line": normalized})
        # The reviewed Big Question is printed in the textbook but is often split
        # into two OCR boxes by the page artwork. Rejoin that verified title so
        # early-grade units still have a complete sentence for practice.
        reviewed_title = reviewed.get("title", "").strip() if reviewed else ""
        title_words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", reviewed_title)
        if len(title_words) >= 4 and re.search(r"[.!?]$", reviewed_title) and reviewed_title.lower() not in seen_lines:
            candidate_lines.append({"text": reviewed_title, "page": start_page, "confidence": 99.0})
            for word in title_words:
                lower = word.lower()
                if len(lower) < 3 or lower in STOP_WORDS:
                    continue
                frequencies[lower] += 1
                word_sources.setdefault(lower, {"text": word, "page": start_page, "line": reviewed_title})
        candidate_lines.sort(key=lambda item: (-item["confidence"], item["page"], len(item["text"])))
        selected_lines = candidate_lines[:24]
        words = []
        for word, count in frequencies.most_common(18):
            source = word_sources[word]
            words.append({**source, "count": count})
        units.append(
            {
                "number": number,
                "title": reviewed["title"] if reviewed else choose_title(pages[start_page], number),
                "startPage": start_page,
                "endPage": end_page,
                "reviewed": bool(reviewed),
                "lines": selected_lines,
                "words": words,
            }
        )
    return units


def build_catalog(books: list[BookInput], counts: dict[str, int], dpi: int) -> None:
    catalog_books = []
    for book in books:
        title = book.pdf.stem
        units = build_units(book, counts[book.id])
        catalog_books.append(
            {
                "id": book.id,
                "label": book.label,
                "title": title,
                "edition": "2024新版" if "2022年版课程标准修订" in title else "官方平台现行版",
                "pageCount": counts[book.id],
                "cover": f"/textbooks/data/books/{book.id}/pages/page-001.jpg",
                "pageImagePattern": f"/textbooks/data/books/{book.id}/pages/page-{{page}}.jpg",
                "pageDataPattern": f"/textbooks/data/books/{book.id}/ocr/page-{{page}}.json",
                "units": units,
            }
        )
    payload = {
        "schemaVersion": 1,
        "source": "国家中小学智慧教育平台PDF（家庭本地）",
        "renderDpi": dpi,
        "books": catalog_books,
    }
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    (DATA_ROOT / "catalog.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def build_ipad_packages() -> None:
    catalog = json.loads((DATA_ROOT / "catalog.json").read_text(encoding="utf-8"))
    packages_dir = TEXTBOOKS / "packages"
    packages_dir.mkdir(parents=True, exist_ok=True)
    expected: set[Path] = set()
    for book in catalog["books"]:
        package_path = packages_dir / f"小译同学-{book['label']}.xiaoyi"
        expected.add(package_path)
        book_root = DATA_ROOT / "books" / book["id"]
        envelope = {
            "format": "xiaoyi-textbook",
            "version": 1,
            "source": catalog["source"],
            "book": book,
        }
        print(f"[iPad教材包] {book['label']}", flush=True)
        with zipfile.ZipFile(package_path, "w", allowZip64=True) as archive:
            archive.writestr(
                "book.json",
                json.dumps(envelope, ensure_ascii=False, separators=(",", ":")),
                compress_type=zipfile.ZIP_DEFLATED,
                compresslevel=6,
            )
            for page in range(1, int(book["pageCount"]) + 1):
                page_name = f"page-{page:03d}"
                archive.write(book_root / "pages" / f"{page_name}.jpg", f"pages/{page_name}.jpg", compress_type=zipfile.ZIP_STORED)
                archive.write(book_root / "ocr" / f"{page_name}.json", f"ocr/{page_name}.json", compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)
    for old in packages_dir.glob("*.xiaoyi"):
        if old not in expected:
            old.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="从本地教材PDF生成OCR点读数据包")
    parser.add_argument("--workers", type=int, default=max(2, min(10, (os.cpu_count() or 4) - 2)))
    parser.add_argument("--dpi", type=int, default=160)
    parser.add_argument("--force-render", action="store_true")
    parser.add_argument("--force-ocr", action="store_true")
    parser.add_argument("--tesseract")
    parser.add_argument("--pdftoppm")
    parser.add_argument("--packages", action="store_true", help="同时生成可导入 iPad 的 .xiaoyi 教材包")
    args = parser.parse_args()

    tesseract = resolve_executable(args.tesseract, TESSERACT_DEFAULT, "tesseract")
    pdftoppm = resolve_executable(args.pdftoppm, POPPLER_DEFAULT, "pdftoppm")
    books = find_books()
    DATA_ROOT.mkdir(parents=True, exist_ok=True)

    counts: dict[str, int] = {}
    page_dirs: dict[str, Path] = {}
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_map = {
            executor.submit(render_book, book, pdftoppm, args.dpi, args.force_render): book for book in books
        }
        for future in as_completed(future_map):
            book = future_map[future]
            count, pages_dir = future.result()
            counts[book.id] = count
            page_dirs[book.id] = pages_dir
            print(f"[渲染完成] {book.label}：{count} 页", flush=True)

    tasks = []
    for book in books:
        for page in range(1, counts[book.id] + 1):
            tasks.append((book, page, page_dirs[book.id] / f"page-{page:03d}.jpg", tesseract, args.force_ocr))
    total = len(tasks)
    print(f"[OCR] 共 {total} 页，使用 {args.workers} 个并行任务", flush=True)
    completed = 0
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(ocr_page, task) for task in tasks]
        for future in as_completed(futures):
            future.result()
            completed += 1
            if completed % 20 == 0 or completed == total:
                print(f"[OCR进度] {completed}/{total}", flush=True)

    build_catalog(books, counts, args.dpi)
    if args.packages:
        build_ipad_packages()
    print(f"[完成] 教材数据包：{DATA_ROOT / 'catalog.json'}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
