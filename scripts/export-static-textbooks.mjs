import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const source = resolve(root, 'textbooks', 'data')
const destination = resolve(root, 'docs', 'textbooks', 'data')
const catalogPath = resolve(source, 'catalog.json')

if (!existsSync(catalogPath)) {
  throw new Error('缺少 textbooks/data/catalog.json，请先运行教材数据生成脚本。')
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
if (catalog.books?.length !== 8) throw new Error(`静态教材应为 8 册，当前为 ${catalog.books?.length || 0} 册。`)

rmSync(destination, { recursive: true, force: true })
cpSync(source, destination, { recursive: true })

function measure(directory) {
  let files = 0
  let bytes = 0
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      const child = measure(path)
      files += child.files
      bytes += child.bytes
    } else {
      files += 1
      bytes += statSync(path).size
    }
  }
  return { files, bytes }
}

const exported = measure(destination)
console.log(`[静态教材] ${catalog.books.length} 册，${exported.files} 个文件，${(exported.bytes / 1024 / 1024).toFixed(1)} MB`)

