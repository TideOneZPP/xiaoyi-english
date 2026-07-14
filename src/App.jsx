import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, Check, ChevronDown, FilePenLine, Headphones, Home, Lightbulb, Menu, RotateCcw, Save, Sparkles, Square, Star, Trash2, Trophy, Volume2, X } from 'lucide-react'
import { books, editionByBook, getUnits } from './curriculum'

const STORAGE_KEY = 'xiaoyi-learning-progress-v2'
const TEXTBOOK_STORAGE_KEY = 'xiaoyi-textbook-content-v1'

function getStoredProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

function prepareSpeechText(text) {
  return text
    .replace(/\bMrs\.?(?=\s|$|[,;:!?])/gi, 'Missus')
    .replace(/\bMr\.?(?=\s|$|[,;:!?])/gi, 'Mister')
    .replace(/\bMs\.?(?=\s|$|[,;:!?])/gi, 'Miz')
    .replace(/\bDr\.?(?=\s|$|[,;:!?])/gi, 'Doctor')
}

function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  const speechText = prepareSpeechText(text)
  const sentences = (speechText.match(/[^.!?]+[.!?]?/g) || [speechText]).map(item => item.trim()).filter(Boolean)
  const chunks = sentences.flatMap(sentence => sentence.length <= 180 ? [sentence] : (sentence.match(/.{1,180}(?:\s|$)/g) || [sentence]).map(item => item.trim()))
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find(item => item.lang.toLowerCase().startsWith('en-gb')) || voices.find(item => item.lang.toLowerCase().startsWith('en'))
  let current = 0
  const playNext = () => {
    if (current >= chunks.length) { onEnd?.(); return }
    const utterance = new SpeechSynthesisUtterance(chunks[current++])
    utterance.lang = 'en-GB'
    utterance.rate = 0.78
    utterance.pitch = 1.05
    if (voice) utterance.voice = voice
    utterance.onend = playNext
    utterance.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  }
  playNext()
}

function getStoredTextbookContent() {
  try { return JSON.parse(localStorage.getItem(TEXTBOOK_STORAGE_KEY)) || {} } catch { return {} }
}

function Mascot({ mood = 'happy', small = false }) {
  return (
    <div className={`mascot mascot--${mood} ${small ? 'mascot--small' : ''}`} aria-label="小译同学吉祥物">
      <span className="mascot-ear left" /><span className="mascot-ear right" />
      <span className="mascot-face"><i className="eye left" /><i className="eye right" /><i className="mouth" /></span>
      {!small && <span className="mascot-book">ABC</span>}
    </div>
  )
}

function Sidebar({ activeUnit, onUnit, book, onBook, currentUnits, isOpen, close }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="brand"><span className="brand-mark">译</span><div><strong>小译同学</strong><small>英语同步练</small></div></div>
      <button className="mobile-close" onClick={close} aria-label="关闭目录"><X size={22} /></button>
      <button className="home-link"><Home size={19} /><span>学习首页</span></button>
      <div className="book-label">我的课本</div>
      <label className="book-select">
        <BookOpen size={18} />
        <select value={book} onChange={e => onBook(e.target.value)} aria-label="选择课本">
          {books.map(item => <option key={item}>{item}</option>)}
        </select>
        <ChevronDown size={16} />
      </label>
      <span className="edition-badge">{editionByBook[book]}</span>
      <div className="units-list">
        {currentUnits.map((unit, index) => (
          <button key={unit.id} className={`unit-link ${activeUnit.id === unit.id ? 'active' : ''}`} onClick={() => (onUnit(unit), close())}>
            <span className="unit-number" style={{ '--unit': unit.color }}>{index + 1}</span>
            <span><strong>Unit {unit.number} · {unit.title}</strong><small>{unit.zh}</small></span>
          </button>
        ))}
      </div>
      <div className="sidebar-tip"><Sparkles size={18} /><p><strong>今天也要开口说</strong><br />每天 10 分钟，英语更自信。</p></div>
    </aside>
  )
}

function Topbar({ openMenu, stars, learnedSteps }) {
  const today = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date())
  return (
    <header className="topbar">
      <button className="menu-button" onClick={openMenu} aria-label="打开目录"><Menu /></button>
      <span className="today">{today} · 今日学习</span>
      <div className="top-stats">
        <span className="streak"><Check size={18} /> 已学 {learnedSteps} 关</span>
        <span className="stars"><Star size={19} fill="currentColor" /> {stars}</span>
        <span className="avatar">小</span>
      </div>
    </header>
  )
}

function UnitHero({ unit, book, progress, onStart }) {
  const completed = progress?.completed || 0
  const percent = Math.round(completed / unit.activities.length * 100)
  return (
    <section className="unit-hero" style={{ '--unit': unit.color }}>
      <div className="hero-copy">
        <div className="breadcrumb">{book} · {unit.edition} <span>/</span> Unit {unit.number}</div>
        <span className="unit-kicker">UNIT {String(unit.number).padStart(2, '0')}</span>
        <h1>{unit.title}</h1>
        <p>{unit.zh} · 本单元重点：<b>{unit.focus}</b></p>
        <div className="hero-actions">
          <button className="primary-button" onClick={onStart}>{completed ? '继续练习' : '开始学习'} <span>→</span></button>
          <div className="unit-progress"><span><b>{percent}%</b> 已完成</span><i><em style={{ width: `${percent}%` }} /></i></div>
        </div>
      </div>
      <div className="hero-scene" aria-hidden="true">
        <span className="speech-card">{unit.focus.split(' / ')[0]} <i>★</i></span>
        <Mascot />
        <span className="pencil">✎</span><span className="paper-plane">➤</span>
      </div>
    </section>
  )
}

function WordShelf({ unit }) {
  const [playing, setPlaying] = useState('')
  return (
    <section className="section-block">
      <div className="section-heading"><div><span>WORDS</span><h2>本单元词语</h2></div><p>点一下，听标准发音</p></div>
      <div className="word-grid">
        {unit.words.map(word => (
          <button key={word.en} className={`word-tile ${playing === word.en ? 'playing' : ''}`} onClick={() => { setPlaying(word.en); speak(word.en, () => setPlaying('')) }}>
            <span className="word-emoji">{word.emoji}</span>
            <span><strong>{word.en}</strong><small>{word.zh}</small></span>
            <Volume2 size={18} />
          </button>
        ))}
      </div>
    </section>
  )
}

function TextbookReader({ unit }) {
  const [contents, setContents] = useState(getStoredTextbookContent)
  const [draft, setDraft] = useState(contents[unit.id] || '')
  const [editing, setEditing] = useState(!contents[unit.id])
  const [playing, setPlaying] = useState(false)
  const savedText = contents[unit.id] || ''

  useEffect(() => {
    setDraft(contents[unit.id] || '')
    setEditing(!contents[unit.id])
    setPlaying(false)
    window.speechSynthesis?.cancel()
  }, [unit.id])

  const save = () => {
    const cleaned = draft.trim()
    const next = { ...contents }
    if (cleaned) next[unit.id] = cleaned
    else delete next[unit.id]
    setContents(next)
    localStorage.setItem(TEXTBOOK_STORAGE_KEY, JSON.stringify(next))
    setEditing(!cleaned)
  }

  const remove = () => {
    const next = { ...contents }
    delete next[unit.id]
    setContents(next)
    localStorage.setItem(TEXTBOOK_STORAGE_KEY, JSON.stringify(next))
    setDraft('')
    setEditing(true)
    setPlaying(false)
    window.speechSynthesis?.cancel()
  }

  const play = () => {
    if (playing) {
      window.speechSynthesis?.cancel()
      setPlaying(false)
      return
    }
    setPlaying(true)
    speak(savedText, () => setPlaying(false))
  }

  return (
    <section className="section-block textbook-reader">
      <div className="section-heading">
        <div><span>TEXTBOOK READER</span><h2>课本点读</h2></div>
        <p>按您手中的教材录入，只保存在本机</p>
      </div>
      {editing ? (
        <div className="textbook-editor">
          <label htmlFor="textbook-content">粘贴 Unit {unit.number} 的单词、句型或课文原文</label>
          <textarea id="textbook-content" value={draft} onChange={event => setDraft(event.target.value)} placeholder={'例如：\nHello! I\'m ...\nWhat\'s your name?'} rows="7" />
          <div className="textbook-actions">
            {savedText && <button className="reader-secondary" onClick={() => { setDraft(savedText); setEditing(false) }}>取消</button>}
            <button className="reader-primary" onClick={save} disabled={!draft.trim()}><Save size={17} /> 保存到本机</button>
          </div>
        </div>
      ) : (
        <div className="textbook-content">
          <button className={`reader-play ${playing ? 'playing' : ''}`} onClick={play} aria-label={playing ? '停止播报' : '播报课文'}>
            {playing ? <Square size={23} fill="currentColor" /> : <Volume2 size={27} />}
          </button>
          <p>{savedText}</p>
          <div className="textbook-actions">
            <button className="reader-secondary" onClick={() => setEditing(true)}><FilePenLine size={16} /> 修改</button>
            <button className="reader-danger" onClick={remove}><Trash2 size={16} /> 删除</button>
          </div>
        </div>
      )}
    </section>
  )
}

function LessonPath({ unit, progress, onStep }) {
  const labels = unit.activities.map(item => item.label)
  return (
    <section className="section-block practice-section">
      <div className="section-heading"><div><span>PRACTICE</span><h2>闯关练习</h2></div><p>完成 {unit.activities.length} 关，收集一枚单元徽章</p></div>
      <div className="lesson-path" style={{ '--steps': unit.activities.length }}>
        <div className="path-line" />
        {labels.map((label, index) => {
          const done = index < (progress?.completed || 0)
          const current = index === (progress?.completed || 0)
          return (
            <button key={label} className={`path-step ${done ? 'done' : ''} ${current ? 'current' : ''}`} onClick={() => (done || current) && onStep(index)} disabled={!done && !current}>
              <span className="path-bubble">{done ? <Check size={23} /> : index + 1}</span>
              <strong>{label}</strong><small>{done ? '已完成' : current ? '+ 2 颗星' : '完成上一关解锁'}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Feedback({ correct, hint }) {
  return (
    <div className={`feedback ${correct ? 'correct' : 'wrong'}`} role="status">
      <span>{correct ? '🎉' : '💡'}</span>
      <div><strong>{correct ? '答对啦，真棒！' : '再想一想'}</strong><p>{correct ? '你已经掌握这一题了。' : hint || '看看提示，再试一次吧。'}</p></div>
    </div>
  )
}

function Exercise({ unit, index, onClose, onComplete }) {
  const item = unit.activities[index]
  const [selected, setSelected] = useState('')
  const [input, setInput] = useState('')
  const [ordered, setOrdered] = useState([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  useEffect(() => { setSelected(''); setInput(''); setOrdered([]); setChecked(false); setCorrect(false) }, [index, unit.id])

  const check = () => {
    let isCorrect = false
    if (item.type === 'choice' || item.type === 'listen' || item.type === 'read') isCorrect = selected === item.answer
    if (item.type === 'fill') isCorrect = [item.answer, ...(item.alternatives || [])].some(answer => answer.toLowerCase() === input.trim().toLowerCase())
    if (item.type === 'order') isCorrect = ordered.join(' ') === item.answer.join(' ')
    setCorrect(isCorrect); setChecked(true)
  }

  const canCheck = selected || input.trim() || ordered.length === item?.words?.length
  const stepLabel = item.label

  return (
    <div className="lesson-overlay">
      <div className="lesson-shell">
        <header className="lesson-header">
          <button onClick={onClose} aria-label="返回单元"><ArrowLeft /></button>
          <div className="lesson-progress"><i><em style={{ width: `${(index + 1) / unit.activities.length * 100}%` }} /></i><span>{index + 1} / {unit.activities.length}</span></div>
          <span className="lesson-stars"><Star size={18} fill="currentColor" /> 每关 +2</span>
        </header>
        <main className="exercise-card">
          <div className="exercise-label">第 {index + 1} 关 · {stepLabel}</div>
          {item.type === 'word' && (
            <div className="word-exercise">
              <p className="instruction">逐个听一听，跟着大声读</p>
              <div className="word-practice-grid">
                {item.words.map(word => <button key={word.en} onClick={() => speak(word.en)}><span>{word.emoji}</span><strong>{word.en}</strong><small>{word.zh}</small><Volume2 size={17} /></button>)}
              </div>
              <button className="record-button" onClick={() => { setCorrect(true); setChecked(true) }}><Check /> 4 个词都跟读好了</button>
            </div>
          )}
          {item.type === 'choice' && (
            <div className="question-exercise">
              <p className="instruction">{item.prompt}</p>
              <div className="scene-illustration"><span>👩‍🏫</span><i>🌤️</i><span>🧒</span></div>
              <div className="options">{item.options.map((option, i) => <button key={option} disabled={checked} className={`${selected === option ? 'selected' : ''} ${checked && option === item.answer ? 'answer' : ''}`} onClick={() => setSelected(option)}><kbd>{String.fromCharCode(65 + i)}</kbd>{option}</button>)}</div>
            </div>
          )}
          {item.type === 'listen' && (
            <div className="question-exercise listen-exercise">
              <p className="instruction">{item.prompt}</p>
              <button className="listen-button" onClick={() => speak(item.speech)}><span><Headphones /></span><strong>播放听力</strong><small>可以多听几遍</small></button>
              <div className="options">{item.options.map((option, i) => <button key={option} disabled={checked} className={`${selected === option ? 'selected' : ''} ${checked && option === item.answer ? 'answer' : ''}`} onClick={() => setSelected(option)}><kbd>{String.fromCharCode(65 + i)}</kbd>{option}</button>)}</div>
            </div>
          )}
          {item.type === 'fill' && (
            <div className="question-exercise fill-exercise">
              <p className="instruction">{item.prompt}</p>
              <div className="dialogue"><span>🧒</span><p>{item.before}<input autoFocus value={input} onChange={e => setInput(e.target.value)} disabled={checked} aria-label="填写答案" />{item.after}</p></div>
              <div className="hint"><Lightbulb size={18} /><span>{item.hint}</span></div>
            </div>
          )}
          {item.type === 'order' && (
            <div className="question-exercise order-exercise">
              <p className="instruction">{item.prompt}</p>
              <div className="answer-slots">{ordered.length ? ordered.map((word, i) => <button key={`${word}-${i}`} onClick={() => !checked && setOrdered(ordered.filter((_, j) => j !== i))}>{word}</button>) : <span>点下面的单词，组成句子</span>}</div>
              <div className="word-chips">{item.words.map((word, i) => { const used = ordered.filter(x => x === word).length >= item.words.slice(0, i + 1).filter(x => x === word).length; return <button key={`${word}-${i}`} disabled={used || checked} onClick={() => setOrdered([...ordered, word])}>{word}</button> })}</div>
              {ordered.length > 0 && !checked && <button className="reset-order" onClick={() => setOrdered([])}><RotateCcw size={15} /> 重新排列</button>}
            </div>
          )}
          {item.type === 'read' && (
            <div className="question-exercise read-exercise">
              <p className="instruction">{item.prompt}</p>
              <div className="reading-passage"><BookOpen size={24} /><p>{item.passage}</p></div>
              <div className="options">{item.options.map((option, i) => <button key={option} disabled={checked} className={`${selected === option ? 'selected' : ''} ${checked && option === item.answer ? 'answer' : ''}`} onClick={() => setSelected(option)}><kbd>{String.fromCharCode(65 + i)}</kbd>{option}</button>)}</div>
            </div>
          )}
          {checked && <Feedback correct={correct} hint={item.tip || item.hint} />}
          <div className="exercise-footer">
            {!checked && item.type !== 'word' && <button className="check-button" disabled={!canCheck} onClick={check}>检查答案</button>}
            {checked && !correct && <button className="check-button retry" onClick={() => { setChecked(false); setSelected(''); setInput(''); setOrdered([]) }}>再试一次</button>}
            {checked && correct && <button className="check-button next" onClick={onComplete}>{index === unit.activities.length - 1 ? '完成本单元' : '下一关'} <span>→</span></button>}
          </div>
        </main>
      </div>
    </div>
  )
}

function Celebration({ unit, onClose }) {
  return <div className="celebration"><div className="celebration-card"><span className="confetti">✦　★　✦</span><Trophy size={70} /><h2>Unit {unit.number} 闯关成功！</h2><p>你完成了 <b>{unit.activities.length}</b> 个练习，收集了 <b>{unit.activities.length * 2} 颗星星</b>。</p><div className="badge">{unit.emoji}<span>单元小达人</span></div><button className="primary-button" onClick={onClose}>返回学习地图</button></div></div>
}

export default function App() {
  const [book, setBook] = useState('三年级上册')
  const [activeUnit, setActiveUnit] = useState(getUnits('三年级上册')[0])
  const [progress, setProgress] = useState(getStoredProgress)
  const [lesson, setLesson] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const currentUnits = getUnits(book)
  const unitProgress = progress[activeUnit.id] || { completed: 0 }
  const learnedSteps = useMemo(() => Object.values(progress).reduce((sum, item) => sum + (item.completed || 0), 0), [progress])
  const stars = learnedSteps * 2

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) }, [progress])

  const completeStep = () => {
    const next = lesson + 1
    setProgress(current => ({ ...current, [activeUnit.id]: { completed: Math.max(current[activeUnit.id]?.completed || 0, next) } }))
    if (next >= activeUnit.activities.length) { setLesson(null); setCelebrating(true) } else setLesson(next)
  }

  const changeBook = value => {
    setBook(value)
    setActiveUnit(getUnits(value)[0])
    setLesson(null)
    setCelebrating(false)
  }

  return (
    <div className="app-shell">
      <Sidebar activeUnit={activeUnit} onUnit={setActiveUnit} book={book} onBook={changeBook} currentUnits={currentUnits} isOpen={menuOpen} close={() => setMenuOpen(false)} />
      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="关闭目录" />}
      <div className="content-shell">
        <Topbar openMenu={() => setMenuOpen(true)} stars={stars} learnedSteps={learnedSteps} />
        <main className="main-content">
          <><UnitHero unit={activeUnit} book={book} progress={unitProgress} onStart={() => setLesson(Math.min(unitProgress.completed, activeUnit.activities.length - 1))} /><WordShelf unit={activeUnit} /><TextbookReader unit={activeUnit} /><LessonPath unit={activeUnit} progress={unitProgress} onStep={setLesson} /></>
        </main>
      </div>
      {lesson !== null && <Exercise unit={activeUnit} index={lesson} onClose={() => setLesson(null)} onComplete={completeStep} />}
      {celebrating && <Celebration unit={activeUnit} onClose={() => setCelebrating(false)} />}
    </div>
  )
}
