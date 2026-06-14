/**
 * lib/db.ts
 * JSON-based database — no native modules, works on any OS without compilation.
 * Stores data in data/*.json files. Safe for single-server deployments.
 */

import path from 'path'
import fs from 'fs'
import type { Product, Order, Consultation, CategoryDef } from './types'
import crypto from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJSON<T>(file: string, fallback: T): T {
  ensureDir()
  const p = path.join(DATA_DIR, file)
  if (!fs.existsSync(p)) return fallback
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return fallback }
}

function writeJSON(file: string, data: unknown) {
  ensureDir()
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2))
}

// ─── Seed defaults ────────────────────────────────────────────────────────────
const DEFAULT_PRODUCTS: Product[] = [
  { id:'p1', name:'Стіл «Карпати»', cat:'table', price:18500, oldPrice:null, badge:'top', emoji:'🪵', rating:5, desc:'Масивний обідній стіл з вільхи з різьбою на ЧПК', photos:[], featured:false, hit:false, sortOrder:0, options:[{name:'Розмір',type:'chips',values:[{label:'120×80 см',price:0},{label:'150×90 см',price:2000},{label:'180×90 см',price:4500}]},{name:'Матеріал',type:'chips',values:[{label:'Масив вільхи',price:0},{label:'Шпон МДФ',price:-3000}]}] },
  { id:'p2', name:'Крісло «Едельвейс»', cat:'chair', price:12800, oldPrice:15200, badge:'sale', emoji:'🪑', rating:5, desc:'Класичне крісло з різьбою на ЧПК, масив вільхи', photos:[], featured:true, hit:true, sortOrder:1, options:[{name:'Оббивка',type:'chips',values:[{label:'Велюр бежевий',price:0},{label:'Велюр сірий',price:0},{label:'Шкіра',price:2500}]},{name:'Колір дерева',type:'color',values:[{label:'Темний горіх',color:'#2C1A0E',price:0},{label:'Золотий',color:'#C8A96E',price:0}]}] },
  { id:'p3', name:'Гарнітур «Дніпро»', cat:'living', price:38000, oldPrice:null, badge:'new', emoji:'🛋️', rating:5, desc:'Класичний гарнітур для вітальні, шпон МДФ', photos:[], featured:false, hit:false, sortOrder:2, options:[{name:'Конфігурація',type:'chips',values:[{label:'Диван + 2 крісла',price:0},{label:'Тільки диван',price:-12000}]}] },
  { id:'p4', name:'Стіл «Софія»', cat:'table', price:22000, oldPrice:null, badge:'top', emoji:'🪵', rating:5, desc:'Розкладний стіл для 8 осіб, різьба на ЧПК', photos:[], featured:false, hit:true, sortOrder:3, options:[{name:'Розмір',type:'chips',values:[{label:'140×90 см',price:0},{label:'160×90 см',price:3000}]},{name:'Матеріал',type:'chips',values:[{label:'Масив вільхи',price:0},{label:'Шпон МДФ',price:-4000}]}] },
  { id:'p5', name:'Крісло «Полонина»', cat:'chair', price:9800, oldPrice:12000, badge:'sale', emoji:'🪑', rating:4, desc:'Компактне класичне крісло, шпон ДСП', photos:[], featured:false, hit:false, sortOrder:4, options:[{name:'Оббивка',type:'chips',values:[{label:'Тканина бежева',price:0},{label:'Шкіра',price:2000}]}] },
  { id:'p6', name:'Спальня «Верховина»', cat:'bedroom', price:68000, oldPrice:null, badge:'new', emoji:'🛏️', rating:5, desc:"Класичний спальний гарнітур, різьблене узголів'я ЧПК", photos:[], featured:false, hit:false, sortOrder:5, options:[{name:'Розмір ліжка',type:'chips',values:[{label:'160×200 см',price:0},{label:'180×200 см',price:5000}]},{name:'Матеріал',type:'chips',values:[{label:'Масив вільхи',price:0},{label:'Шпон МДФ',price:-12000}]}] },
  { id:'p7', name:'Стіл «Говерла»', cat:'table', price:15800, oldPrice:18000, badge:'sale', emoji:'🪵', rating:5, desc:'Журнальний столик з різьбою ЧПК', photos:[], featured:false, hit:false, sortOrder:6, options:[{name:'Розмір',type:'chips',values:[{label:'80×50 см',price:0},{label:'100×60 см',price:2000}]}] },
  { id:'p8', name:'Диван «Львів»', cat:'living', price:45000, oldPrice:null, badge:'top', emoji:'🛋️', rating:5, desc:'Класичний диван з різьбленою рамою, масив вільхи', photos:[], featured:false, hit:true, sortOrder:7, options:[{name:'Розмір',type:'chips',values:[{label:'200 см',price:0},{label:'230 см',price:5000}]},{name:'Тканина',type:'chips',values:[{label:'Велюр бежевий',price:0},{label:'Шкіра',price:8000}]}] },
  { id:'p9', name:'Спальня «Буковина»', cat:'bedroom', price:82000, oldPrice:null, badge:'top', emoji:'🛏️', rating:5, desc:'Розкішний спальний гарнітур з масиву вільхи', photos:[], featured:false, hit:false, sortOrder:8, options:[{name:'Розмір ліжка',type:'chips',values:[{label:'160×200 см',price:0},{label:'180×200 см',price:6000}]}] },
  { id:'p10', name:'Стіл «Писанка»', cat:'table', price:13200, oldPrice:null, badge:'', emoji:'🪵', rating:4, desc:'Робочий стіл, шпон МДФ', photos:[], featured:false, hit:false, sortOrder:9, options:[{name:'Розмір',type:'chips',values:[{label:'120×60 см',price:0},{label:'140×70 см',price:2500}]}] },
  { id:'p11', name:'Крісло «Козак»', cat:'chair', price:11200, oldPrice:13500, badge:'sale', emoji:'🪑', rating:5, desc:'Класичне крісло-качалка, масив вільхи', photos:[], featured:false, hit:false, sortOrder:10, options:[] },
  { id:'p12', name:'Вітальня «Галичина»', cat:'living', price:54000, oldPrice:null, badge:'', emoji:'🛋️', rating:4, desc:'Комплект меблів для вітальні, шпон МДФ', photos:[], featured:false, hit:false, sortOrder:11, options:[{name:'Комплектація',type:'chips',values:[{label:'Повний комплект',price:0},{label:'Тільки диван',price:-18000}]}] },
]

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  const data = readJSON<Product[]>('products.json', [])
  if (data.length === 0) {
    writeJSON('products.json', DEFAULT_PRODUCTS)
    return DEFAULT_PRODUCTS
  }
  return data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export async function createProduct(p: Omit<Product, 'sortOrder'>): Promise<string> {
  const all = await getAllProducts()
  const id = 'p' + Date.now()
  const maxSort = all.reduce((m, x) => Math.max(m, x.sortOrder ?? 0), 0)
  all.push({ ...p, id, sortOrder: maxSort + 1 })
  writeJSON('products.json', all)
  return id
}

export async function updateProduct(id: string, p: Partial<Product>): Promise<void> {
  const all = await getAllProducts()
  const idx = all.findIndex(x => x.id === id)
  if (idx >= 0) all[idx] = { ...all[idx], ...p, id }
  writeJSON('products.json', all)
}

export async function deleteProduct(id: string): Promise<void> {
  const all = await getAllProducts()
  writeJSON('products.json', all.filter(p => p.id !== id))
}

// Reorder products by passing ordered array of ids
export async function reorderProducts(ids: string[]): Promise<void> {
  const all = await getAllProducts()
  const map = new Map(all.map(p => [p.id, p]))
  const reordered = ids.map((id, i) => {
    const p = map.get(id)
    return p ? { ...p, sortOrder: i } : null
  }).filter(Boolean) as Product[]
  // Keep any products not in the ids list at the end
  const rest = all.filter(p => !ids.includes(p.id)).map((p, i) => ({ ...p, sortOrder: ids.length + i }))
  writeJSON('products.json', [...reordered, ...rest])
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getAllOrders(): Promise<Order[]> {
  return readJSON<Order[]>('orders.json', [])
}

export async function createOrder(o: Omit<Order, 'id' | 'date'>): Promise<string> {
  const all = await getAllOrders()
  const id = 'ORD-' + Date.now().toString(36).toUpperCase()
  const order: Order = { ...o, id, date: new Date().toISOString() }
  all.unshift(order)
  writeJSON('orders.json', all)
  return id
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const all = await getAllOrders()
  const o = all.find(x => x.id === id)
  if (o) o.status = status as Order['status']
  writeJSON('orders.json', all)
}

// ─── Consultations ────────────────────────────────────────────────────────────
export async function getAllConsultations(): Promise<Consultation[]> {
  return readJSON<Consultation[]>('consultations.json', [])
}

export async function createConsultation(c: Omit<Consultation, 'id' | 'date' | 'status'>): Promise<string> {
  const all = await getAllConsultations()
  const id = 'CON-' + Date.now().toString(36).toUpperCase()
  all.unshift({ ...c, id, date: new Date().toISOString(), status: 'new' })
  writeJSON('consultations.json', all)
  return id
}

// ─── Admin sessions ───────────────────────────────────────────────────────────
interface Session { token: string; expiresAt: string }

export async function saveSession(token: string): Promise<void> {
  const sessions = readJSON<Session[]>('sessions.json', [])
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  sessions.push({ token, expiresAt })
  writeJSON('sessions.json', sessions.filter(s => new Date(s.expiresAt) > new Date()))
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false
  const sessions = readJSON<Session[]>('sessions.json', [])
  const s = sessions.find(x => x.token === token)
  return !!s && new Date(s.expiresAt) > new Date()
}

export async function deleteSession(token: string): Promise<void> {
  const sessions = readJSON<Session[]>('sessions.json', [])
  writeJSON('sessions.json', sessions.filter(s => s.token !== token))
}

export async function makeToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex')
}

// ─── Categories ───────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: CategoryDef[] = [
  { slug: 'all', label: 'Всі товари', order: 0 },
  { slug: 'table', label: 'Столи', order: 1 },
  { slug: 'chair', label: 'Крісла', order: 2 },
  { slug: 'living', label: 'Меблі у вітальню', order: 3 },
  { slug: 'bedroom', label: 'Спальні', order: 4 },
]

export async function getAllCategories(): Promise<CategoryDef[]> {
  const data = readJSON<CategoryDef[]>('categories.json', [])
  if (data.length === 0) {
    writeJSON('categories.json', DEFAULT_CATEGORIES)
    return DEFAULT_CATEGORIES
  }
  return [...data].sort((a, b) => a.order - b.order)
}

export async function saveCategories(cats: CategoryDef[]): Promise<void> {
  writeJSON('categories.json', cats.map((c, i) => ({ ...c, order: i })))
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export async function getStats() {
  const [orders, consultations, products] = await Promise.all([
    getAllOrders(), getAllConsultations(), getAllProducts()
  ])
  return {
    totalOrders: orders.length,
    newOrders: orders.filter(o => o.status === 'new').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    todayOrders: orders.filter(o => o.date.startsWith(new Date().toISOString().slice(0, 10))).length,
    totalProducts: products.length,
    newConsults: consultations.filter(c => c.status === 'new').length,
    recentOrders: orders.slice(0, 5),
  }
}
