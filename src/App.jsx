import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileUp,
  GraduationCap,
  HardDrive,
  Highlighter,
  Library,
  List,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react'
import { prepareSpeechText } from './speech'
import { getImportedAsset, getImportedPageData, importTextbookPackage, listImportedBooks, storageEstimate } from './textbookStore'

const CATALOG_URL = '/textbooks/data/catalog.json'
const PAGE_KEY = 'xiaoyi-textbook-position-v1'
const IPAD_LIBRARY_ONLY = new URLSearchParams(window.location.search).has('ipad')

function speak(text, onEnd) {
  if (!text || !('speechSynthesis' in window)) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  const prepared = prepareSpeechText(text)
  const chunks = (prepared.match(/[^.!?]+[.!?]?/g) || [prepared])
    .map(item => item.trim())
    .filter(Boolean)
    .flatMap(item => item.length <= 180 ? [item] : (item.match(/.{1,180}(?:\s|$)/g) || [item]))
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find(item => item.lang.toLowerCase().startsWith('en-gb'))
    || voices.find(item => item.lang.toLowerCase().startsWith('en'))
  let index = 0
  const next = () => {
    if (index >= chunks.length) { onEnd?.(); return }
    const utterance = new SpeechSynthesisUtterance(chunks[index++])
    utterance.lang = 'en-GB'
    utterance.rate = 0.78
    utterance.pitch = 1.03
    if (voice) utterance.voice = voice
    utterance.onend = next
    utterance.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  }
  next()
}

function assetPath(pattern, page) {
  return pattern.replace('{page}', String(page).padStart(3, '0'))
}

function storedPosition() {
  try { return JSON.parse(localStorage.getItem(PAGE_KEY)) || {} } catch { return {} }
}

function LoadingScreen() {
  return (
    <main className="status-screen">
      <div className="status-mark"><BookOpen /></div>
      <span>正在打开本地教材</span>
      <h1>把课本摊开来。</h1>
      <p>正在读取这台 iPad 中的教材和点读文字层。</p>
      <i className="loading-line"><b /></i>
    </main>
  )
}

function formatStorage(bytes = 0) {
  return `${Math.max(0, bytes / 1024 / 1024).toFixed(0)} MB`
}

function BookImporter({ onImported, compact = false }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const chooseFiles = async event => {
    const files = [...(event.target.files || [])]
    event.target.value = ''
    if (!files.length) return
    setBusy(true)
    setError('')
    const imported = []
    try {
      for (let index = 0; index < files.length; index += 1) {
        setMessage(`第 ${index + 1}/${files.length} 册：${files[index].name}`)
        imported.push(await importTextbookPackage(files[index], setMessage))
      }
      const estimate = await storageEstimate()
      setMessage(`${imported.length} 册已存入 iPad${estimate ? ` · 已用约 ${formatStorage(estimate.usage)}` : ''}`)
      onImported(imported)
    } catch (reason) {
      setError(reason?.message || '教材导入失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`book-importer ${compact ? 'compact' : ''}`}>
      <input ref={input} type="file" accept=".xiaoyi" multiple hidden onChange={chooseFiles} />
      <button type="button" onClick={() => input.current?.click()} disabled={busy}><FileUp />{busy ? '正在存入 iPad…' : compact ? '加入更多课本' : '从“文件”加入课本'}</button>
      {!compact && <small>可一次选择多册，每册约 18–20 MB。</small>}
      {message && <p className="import-message"><HardDrive />{message}</p>}
      {error && <p className="import-error"><CircleAlert />{error}</p>}
    </div>
  )
}

function SetupScreen({ onImported }) {
  return (
    <main className="status-screen setup-screen">
      <div className="status-mark warning"><HardDrive /></div>
      <span>iPad 教材库</span>
      <h1>第一次，把课本装进 iPad。</h1>
      <p>选择“小译同学”教材包后，课本会保存在这台 iPad 中。以后不需要电脑，也不需要联网。</p>
      <div className="setup-card">
        <div><b>1</b><span><strong>先添加到主屏幕</strong><small>Safari“共享”→“添加到主屏幕”，再从桌面打开。</small></span></div>
        <div><b>2</b><span><strong>选择 .xiaoyi 教材包</strong><small>从 iPad“文件”中一次选择一册或多册。</small></span></div>
        <div><b>3</b><span><strong>导入完成即可离线点读</strong><small>教材、文字层和练习都只保存在本机。</small></span></div>
      </div>
      <BookImporter onImported={onImported} />
    </main>
  )
}

function BookCover({ book }) {
  const [source, setSource] = useState(book.storage === 'indexeddb' ? '' : book.cover)
  useEffect(() => {
    let objectUrl = ''
    let cancelled = false
    if (book.storage !== 'indexeddb') { setSource(book.cover); return undefined }
    setSource('')
    getImportedAsset(book.id, 'pages/page-001.jpg').then(blob => {
      objectUrl = URL.createObjectURL(blob)
      if (cancelled) URL.revokeObjectURL(objectUrl)
      else setSource(objectUrl)
    }).catch(() => {})
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [book.id, book.cover, book.storage])
  return source ? <img src={source} alt="" /> : <span className="cover-placeholder"><BookOpen /></span>
}

function Bookshelf({ books, activeBook, chooseBook, page, choosePage, open, close, onImported }) {
  return (
    <aside className={`bookshelf ${open ? 'open' : ''}`}>
      <header className="shelf-brand">
        <span className="brand-stamp">译</span>
        <div><strong>小译同学</strong><small>本地课本点读</small></div>
        <button className="shelf-close" onClick={close} aria-label="关闭书架"><X /></button>
      </header>
      <p className="shelf-label"><Library size={14} /> 我的{books.length}册课本</p>
      <div className="book-stack">
        {books.map(book => (
          <button key={book.id} className={`book-spine ${book.id === activeBook.id ? 'active' : ''}`} onClick={() => { chooseBook(book); close() }}>
            <BookCover book={book} />
            <span><strong>{book.label}</strong><small>{book.edition}</small></span>
            {book.id === activeBook.id && <i>正在读</i>}
          </button>
        ))}
      </div>
      <div className="unit-shelf">
        <p className="shelf-label"><List size={14} /> 本册目录</p>
        <button className={page === 1 ? 'active' : ''} onClick={() => { choosePage(1); close() }}>封面与目录</button>
        {activeBook.units.map(unit => (
          <button key={`${activeBook.id}-${unit.number}`} className={page >= unit.startPage && page <= unit.endPage ? 'active' : ''} onClick={() => { choosePage(unit.startPage); close() }}>
            <b>U{unit.number}</b><span>{unit.title}</span><small>P{unit.startPage}</small>
          </button>
        ))}
      </div>
      <footer className="shelf-note"><Sparkles size={16} /><div className="shelf-note-body">课本已保存在这台 iPad<BookImporter compact onImported={onImported} /><a href="./guide.html" target="_blank" rel="noreferrer">查看使用说明</a></div></footer>
    </aside>
  )
}

function ReaderToolbar({ book, unit, page, pageCount, setPage, zoom, setZoom, pointMode, setPointMode, openShelf }) {
  const [pageInput, setPageInput] = useState(String(page))
  useEffect(() => setPageInput(String(page)), [page])
  const submitPage = event => {
    event.preventDefault()
    const next = Math.min(pageCount, Math.max(1, Number.parseInt(pageInput, 10) || page))
    setPage(next)
  }
  return (
    <header className="reader-toolbar">
      <button className="shelf-toggle" onClick={openShelf} aria-label="打开书架"><Menu /></button>
      <div className="reader-title">
        <span>{book.label} · {book.edition}</span>
        <strong>{unit ? `Unit ${unit.number} · ${unit.title}` : '封面与课本目录'}</strong>
      </div>
      <nav className="page-controls" aria-label="翻页">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1} aria-label="上一页"><ChevronLeft /></button>
        <form onSubmit={submitPage}><input value={pageInput} onChange={event => setPageInput(event.target.value)} inputMode="numeric" aria-label="页码" /><span>/ {pageCount}</span></form>
        <button onClick={() => setPage(page + 1)} disabled={page >= pageCount} aria-label="下一页"><ChevronRight /></button>
      </nav>
      <div className="reader-tools">
        <button onClick={() => setZoom(Math.max(.8, +(zoom - .1).toFixed(1)))} disabled={zoom <= .8} aria-label="缩小"><Minus /></button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(1.6, +(zoom + .1).toFixed(1)))} disabled={zoom >= 1.6} aria-label="放大"><Plus /></button>
        <button className={`point-toggle ${pointMode ? 'active' : ''}`} onClick={() => setPointMode(value => !value)} aria-pressed={pointMode}><Highlighter /> 点读提示</button>
      </div>
    </header>
  )
}

function TextbookPage({ book, page, pageData, pageImageUrl, zoom, pointMode }) {
  const [activeLine, setActiveLine] = useState(-1)
  const [loadedImage, setLoadedImage] = useState('')
  const imageReady = Boolean(pageImageUrl) && loadedImage === pageImageUrl
  useEffect(() => { setActiveLine(-1); window.speechSynthesis?.cancel() }, [book.id, page])
  const playLine = (line, index) => {
    setActiveLine(index)
    speak(line.text, () => setActiveLine(-1))
  }
  return (
    <section className="page-stage" aria-label={`课本第${page}页`}>
      <div className="desk-ruler"><span>{book.label}</span><b>PAGE {String(page).padStart(3, '0')}</b></div>
      <div className="page-scroll">
        <div
          className={`textbook-page ${imageReady ? 'ready' : ''}`}
          style={{ '--page-width': `${Math.round(790 * zoom)}px`, '--zoom-percent': `${zoom * 100}%`, '--reader-zoom': zoom }}
        >
          {pageImageUrl && <img src={pageImageUrl} alt={`${book.label}第${page}页`} onLoad={() => setLoadedImage(pageImageUrl)} />}
          {pageData && (
            <div className={`ocr-layer ${pointMode ? 'show-guides' : ''}`} aria-label="可点读英文文字层">
              {pageData.lines.map((line, index) => (
                <span
                  key={`${page}-${index}-${line.text}`}
                  className={`ocr-line ${activeLine === index ? 'playing' : ''}`}
                  style={{ left: `${line.x * 100}%`, top: `${line.y * 100}%`, width: `${line.width * 100}%`, height: `${Math.max(line.height * 100, 1.1)}%`, fontSize: `${Math.max(line.height * 82, .72)}cqw` }}
                  role="button"
                  tabIndex={0}
                  title={line.text}
                  onClick={() => playLine(line, index)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') playLine(line, index) }}
                >{line.text}</span>
              ))}
            </div>
          )}
          {!imageReady && <div className="page-loading">正在翻到第 {page} 页…</div>}
        </div>
      </div>
      <p className="page-help"><Highlighter size={16} /> 黄色区域可以直接点读；也可以长按拖动选择英文，再点“朗读选中内容”。</p>
    </section>
  )
}

function SourcePill({ page }) {
  return <small className="source-pill">课本 P{page}</small>
}

function WordPractice({ words }) {
  const [playing, setPlaying] = useState('')
  if (!words.length) return <p className="practice-empty">本单元暂时没有达到可信度要求的词汇数据。</p>
  return (
    <div className="practice-words">
      {words.slice(0, 12).map(word => (
        <button key={`${word.text}-${word.page}`} className={playing === word.text ? 'playing' : ''} onClick={() => { setPlaying(word.text); speak(word.text, () => setPlaying('')) }}>
          <Volume2 /><span><strong>{word.text}</strong><SourcePill page={word.page} /></span>
        </button>
      ))}
    </div>
  )
}

function ListenPractice({ lines }) {
  const options = lines.slice(0, 3)
  const answer = options[0]
  const [selected, setSelected] = useState('')
  if (options.length < 2) return <p className="practice-empty">可用的高可信度句子不足，暂不自动出题。</p>
  return (
    <div className="quiz-block">
      <button className="listen-source" onClick={() => speak(answer.text)}><span><Volume2 /></span><strong>播放课本原句</strong><small>可以多听几遍</small></button>
      <div className="quiz-options">
        {[...options].sort((a, b) => a.text.localeCompare(b.text)).map(option => (
          <button key={option.text} className={selected ? (option.text === answer.text ? 'correct' : selected === option.text ? 'wrong' : '') : ''} disabled={Boolean(selected)} onClick={() => setSelected(option.text)}>
            <span>{option.text}</span><SourcePill page={option.page} />
          </button>
        ))}
      </div>
      {selected && <p className={`quiz-feedback ${selected === answer.text ? 'correct' : 'wrong'}`}>{selected === answer.text ? <><Check /> 听对了！</> : <><CircleAlert /> 再听一次课本原句。</>}</p>}
    </div>
  )
}

function FillPractice({ lines, words }) {
  const sentence = lines.find(item => (item.text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length >= 5)
  const sentenceWords = sentence?.text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []
  const target = sentenceWords.filter(word => word.length >= 4).sort((a, b) => b.length - a.length)[0]
  const distractors = words.map(item => item.text).filter(word => target && word.toLowerCase() !== target.toLowerCase()).slice(0, 2)
  const options = target ? [target, ...distractors].sort((a, b) => a.localeCompare(b)) : []
  const [selected, setSelected] = useState('')
  if (!sentence || !target || options.length < 3) return <p className="practice-empty">本单元没有足够可靠的数据生成补全题。</p>
  const prompt = sentence.text.replace(new RegExp(`\\b${target}\\b`, 'i'), '______')
  return (
    <div className="quiz-block fill-quiz">
      <p className="source-sentence">{prompt}</p>
      <SourcePill page={sentence.page} />
      <div className="word-options">
        {options.map(option => <button key={option} disabled={Boolean(selected)} className={selected ? (option === target ? 'correct' : selected === option ? 'wrong' : '') : ''} onClick={() => setSelected(option)}>{option}</button>)}
      </div>
      {selected && <p className={`quiz-feedback ${selected === target ? 'correct' : 'wrong'}`}>{selected === target ? <><Check /> 填对了：{sentence.text}</> : <><CircleAlert /> 看看课本第 {sentence.page} 页再试试。</>}</p>}
    </div>
  )
}

function OrderPractice({ lines }) {
  const source = lines.find(item => {
    const count = (item.text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length
    return count >= 4 && count <= 9
  })
  const answer = source?.text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []
  const scrambled = useMemo(() => answer.map((word, index) => ({ word, id: index })).sort((a, b) => ((a.id * 7 + 3) % answer.length) - ((b.id * 7 + 3) % answer.length)), [source?.text])
  const [chosen, setChosen] = useState([])
  const complete = chosen.length === answer.length
  const correct = complete && chosen.map(item => item.word.toLowerCase()).join(' ') === answer.map(item => item.toLowerCase()).join(' ')
  if (!source) return <p className="practice-empty">本单元没有适合排列的高可信度原句。</p>
  return (
    <div className="quiz-block order-quiz">
      <div className="order-answer">{chosen.length ? chosen.map(item => <button key={item.id} onClick={() => setChosen(current => current.filter(value => value.id !== item.id))}>{item.word}</button>) : <span>按课本原句顺序点选单词</span>}</div>
      <div className="order-words">{scrambled.filter(item => !chosen.some(value => value.id === item.id)).map(item => <button key={item.id} onClick={() => setChosen(current => [...current, item])}>{item.word}</button>)}</div>
      <div className="order-actions"><SourcePill page={source.page} /><button onClick={() => setChosen([])}><RotateCcw /> 重新排列</button></div>
      {complete && <p className={`quiz-feedback ${correct ? 'correct' : 'wrong'}`}>{correct ? <><Check /> 顺序正确！</> : <><CircleAlert /> 顺序还不对，点上面的词撤回。</>}</p>}
    </div>
  )
}

function PracticePanel({ book, unit }) {
  const [mode, setMode] = useState('words')
  useEffect(() => setMode('words'), [book.id, unit?.number])
  if (!unit) {
    return (
      <aside className="practice-panel empty-panel">
        <GraduationCap />
        <h2>先进入一个 Unit</h2>
        <p>练习只会使用该单元PDF中识别可靠的词句。</p>
      </aside>
    )
  }
  const lines = unit.lines || []
  const words = unit.words || []
  return (
    <aside className="practice-panel">
      <header><span>TEXTBOOK PRACTICE</span><h2>课本原句练习</h2><p>Unit {unit.number} · P{unit.startPage}-{unit.endPage}</p></header>
      <nav className="practice-tabs">
        {[['words', '点词跟读'], ['listen', '听音辨句'], ['fill', '原句补全'], ['order', '句子排序']].map(([value, label]) => <button key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)}>{label}</button>)}
      </nav>
      <div className="practice-body" key={`${book.id}-${unit.number}-${mode}`}>
        {mode === 'words' && <WordPractice words={words} />}
        {mode === 'listen' && <ListenPractice lines={lines} />}
        {mode === 'fill' && <FillPractice lines={lines} words={words} />}
        {mode === 'order' && <OrderPractice lines={lines} />}
      </div>
      <footer><Check /> 每道题都标注课本页码，可以随时翻回原页核对。</footer>
    </aside>
  )
}

function SelectionSpeaker() {
  const [selectedText, setSelectedText] = useState('')
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const remember = () => {
      const selection = window.getSelection()
      const text = selection?.toString().replace(/\s+/g, ' ').trim() || ''
      if (text && /[A-Za-z]/.test(text)) setSelectedText(text.slice(0, 800))
    }
    document.addEventListener('selectionchange', remember)
    return () => document.removeEventListener('selectionchange', remember)
  }, [])
  if (!selectedText) return null
  return (
    <div className="selection-speaker" role="status">
      <span>已选中：{selectedText.length > 42 ? `${selectedText.slice(0, 42)}…` : selectedText}</span>
      <button onMouseDown={event => event.preventDefault()} onClick={() => { if (playing) { window.speechSynthesis.cancel(); setPlaying(false) } else { setPlaying(true); speak(selectedText, () => setPlaying(false)) } }}>{playing ? <Square /> : <Volume2 />}{playing ? '停止' : '朗读选中内容'}</button>
      <button className="selection-close" aria-label="关闭" onClick={() => { window.speechSynthesis?.cancel(); setPlaying(false); setSelectedText('') }}><X /></button>
    </div>
  )
}

export default function App() {
  const [catalog, setCatalog] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [libraryRevision, setLibraryRevision] = useState(0)
  const [bookId, setBookId] = useState('')
  const [page, setPageState] = useState(1)
  const [pageData, setPageData] = useState(null)
  const [pageImageUrl, setPageImageUrl] = useState('')
  const [pageError, setPageError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pointMode, setPointMode] = useState(true)
  const [shelfOpen, setShelfOpen] = useState(false)
  const readerTop = useRef(null)

  useEffect(() => {
    let cancelled = false
    const applyCatalog = data => {
      if (cancelled) return
      if (!data.books?.length) throw new Error('教材库中没有课本')
      const saved = storedPosition()
      const initialBook = data.books.find(item => item.id === (bookId || saved.bookId)) || data.books[0]
      setCatalog(data)
      setBookId(initialBook.id)
      setPageState(current => {
        const savedPage = saved.bookId === initialBook.id ? saved.page : null
        const candidate = current > 1 && bookId === initialBook.id ? current : (savedPage || initialBook.units?.[0]?.startPage || 1)
        return Math.min(initialBook.pageCount, Math.max(1, candidate))
      })
      setLoadError('')
    }
    listImportedBooks()
      .then(books => {
        if (books.length) return applyCatalog({ schemaVersion: 1, source: 'iPad本地教材包', books })
        if (IPAD_LIBRARY_ONLY) throw new Error('iPad 教材库中还没有课本')
        return fetch(CATALOG_URL, { cache: 'no-store' })
          .then(response => { if (!response.ok) throw new Error(`教材数据包返回 ${response.status}`); return response.json() })
          .then(data => applyCatalog(data))
      })
      .catch(error => { if (!cancelled) setLoadError(error.message) })
    return () => { cancelled = true }
  }, [libraryRevision])

  const book = catalog?.books.find(item => item.id === bookId)
  const unit = book?.units.find(item => page >= item.startPage && page <= item.endPage)

  useEffect(() => {
    if (!book) return
    let cancelled = false
    let objectUrl = ''
    setPageData(null)
    setPageImageUrl('')
    setPageError('')
    const loadPage = book.storage === 'indexeddb'
      ? Promise.all([
          getImportedAsset(book.id, `pages/page-${String(page).padStart(3, '0')}.jpg`),
          getImportedPageData(book.id, page),
        ]).then(([imageBlob, data]) => {
          objectUrl = URL.createObjectURL(imageBlob)
          if (cancelled) { URL.revokeObjectURL(objectUrl); return }
          setPageImageUrl(objectUrl)
          setPageData(data)
        })
      : fetch(assetPath(book.pageDataPattern, page), { cache: 'no-store' })
          .then(response => { if (!response.ok) throw new Error(`第${page}页点读数据不可用`); return response.json() })
          .then(data => {
            if (cancelled) return
            setPageImageUrl(assetPath(book.pageImagePattern, page))
            setPageData(data)
          })
    loadPage.catch(error => { if (!cancelled) setPageError(error.message) })
    localStorage.setItem(PAGE_KEY, JSON.stringify({ bookId: book.id, page }))
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [book?.id, page])

  const imported = () => setLibraryRevision(value => value + 1)

  if (loadError) return <SetupScreen onImported={imported} />
  if (!catalog || !book) return <LoadingScreen />

  const setPage = next => {
    const normalized = Math.min(book.pageCount, Math.max(1, Number(next) || 1))
    setPageState(normalized)
    readerTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const chooseBook = nextBook => {
    setBookId(nextBook.id)
    setPageState(nextBook.units?.[0]?.startPage || 1)
    setZoom(1)
  }

  return (
    <div className="textbook-app" ref={readerTop}>
      <Bookshelf books={catalog.books} activeBook={book} chooseBook={chooseBook} page={page} choosePage={setPage} open={shelfOpen} close={() => setShelfOpen(false)} onImported={imported} />
      {shelfOpen && <button className="shelf-backdrop" onClick={() => setShelfOpen(false)} aria-label="关闭书架" />}
      <div className="reader-shell">
        <ReaderToolbar book={book} unit={unit} page={page} pageCount={book.pageCount} setPage={setPage} zoom={zoom} setZoom={setZoom} pointMode={pointMode} setPointMode={setPointMode} openShelf={() => setShelfOpen(true)} />
        <main className="learning-desk">
          <TextbookPage book={book} page={page} pageData={pageData} pageImageUrl={pageImageUrl} zoom={zoom} pointMode={pointMode} />
          <PracticePanel book={book} unit={unit} />
        </main>
        {pageError && <div className="page-error"><CircleAlert /> {pageError}</div>}
      </div>
      <SelectionSpeaker />
    </div>
  )
}
