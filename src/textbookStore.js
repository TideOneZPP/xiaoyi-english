import { strFromU8, unzipSync } from 'fflate'

const DB_NAME = 'xiaoyi-textbooks-v1'
const DB_VERSION = 1
const BOOKS_STORE = 'books'
const ASSETS_STORE = 'assets'

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('iPad 本地教材库读取失败'))
  })
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error || new Error('教材保存失败'))
    transaction.onabort = () => reject(transaction.error || new Error('教材保存被中止'))
  })
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('当前浏览器不支持 iPad 本地教材库，请使用 Safari'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(BOOKS_STORE)) database.createObjectStore(BOOKS_STORE, { keyPath: 'id' })
      if (!database.objectStoreNames.contains(ASSETS_STORE)) database.createObjectStore(ASSETS_STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('无法打开 iPad 本地教材库'))
  })
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false
  try { return await navigator.storage.persist() } catch { return false }
}

export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null
  try { return await navigator.storage.estimate() } catch { return null }
}

export async function listImportedBooks() {
  const database = await openDatabase()
  const transaction = database.transaction(BOOKS_STORE, 'readonly')
  const books = await requestResult(transaction.objectStore(BOOKS_STORE).getAll())
  database.close()
  return books.sort((a, b) => a.id.localeCompare(b.id))
}

export async function getImportedAsset(bookId, relativePath) {
  const database = await openDatabase()
  const transaction = database.transaction(ASSETS_STORE, 'readonly')
  const value = await requestResult(transaction.objectStore(ASSETS_STORE).get(`${bookId}/${relativePath}`))
  database.close()
  if (!value) throw new Error(`本地教材缺少 ${relativePath}`)
  return value
}

export async function getImportedPageData(bookId, page) {
  const pageName = `page-${String(page).padStart(3, '0')}.json`
  const value = await getImportedAsset(bookId, `ocr/${pageName}`)
  const text = value instanceof Blob ? await value.text() : strFromU8(value)
  return JSON.parse(text)
}

function contentType(path) {
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.json')) return 'application/json'
  return 'application/octet-stream'
}

export async function importTextbookPackage(file, onProgress = () => {}) {
  if (!file?.name?.toLowerCase().endsWith('.xiaoyi')) throw new Error('请选择扩展名为 .xiaoyi 的教材包')
  const estimate = await storageEstimate()
  const available = estimate?.quota && estimate?.usage !== undefined ? estimate.quota - estimate.usage : null
  if (available !== null && available < file.size * 1.25) throw new Error('iPad 可用网站存储空间不足，请先释放空间')
  onProgress('正在检查教材包…')
  const archive = unzipSync(new Uint8Array(await file.arrayBuffer()))
  if (!archive['book.json']) throw new Error('教材包缺少 book.json')
  const envelope = JSON.parse(strFromU8(archive['book.json']))
  if (envelope.format !== 'xiaoyi-textbook' || envelope.version !== 1 || !envelope.book?.id) {
    throw new Error('教材包格式不正确或版本不受支持')
  }
  const book = { ...envelope.book, storage: 'indexeddb', importedAt: new Date().toISOString() }
  const pageEntries = Object.entries(archive).filter(([path]) => /^pages\/page-\d{3}\.jpg$/i.test(path))
  const ocrEntries = Object.entries(archive).filter(([path]) => /^ocr\/page-\d{3}\.json$/i.test(path))
  if (pageEntries.length !== book.pageCount || ocrEntries.length !== book.pageCount) {
    throw new Error(`教材包页数不完整：应有 ${book.pageCount} 页`)
  }

  onProgress(`正在保存《${book.label}》…`)
  const database = await openDatabase()
  const transaction = database.transaction([BOOKS_STORE, ASSETS_STORE], 'readwrite')
  const booksStore = transaction.objectStore(BOOKS_STORE)
  const assetsStore = transaction.objectStore(ASSETS_STORE)
  assetsStore.delete(IDBKeyRange.bound(`${book.id}/`, `${book.id}/\uffff`))
  booksStore.put(book)
  for (const [path, bytes] of [...pageEntries, ...ocrEntries]) {
    assetsStore.put(new Blob([bytes], { type: contentType(path) }), `${book.id}/${path}`)
  }
  await transactionDone(transaction)
  database.close()
  await requestPersistentStorage()
  onProgress(`《${book.label}》已存入 iPad`)
  return book
}
