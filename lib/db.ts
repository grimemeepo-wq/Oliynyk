import { supabase } from './supabase'
import type { Product, Order, Consultation, CategoryDef } from './types'
import crypto from 'crypto'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toProduct(r: Record<string, unknown>): Product {
  return {
    id: r.id as string,
    name: r.name as string,
    cat: r.cat as Product['cat'],
    price: r.price as number,
    oldPrice: (r.old_price as number | null) ?? null,
    badge: (r.badge as Product['badge']) || '',
    emoji: (r.emoji as string) || '🪵',
    rating: (r.rating as number) || 5,
    desc: (r.description as string) || '',
    photos: (r.photos as string[]) || [],
    options: (r.options as Product['options']) || [],
    featured: (r.featured as boolean) || false,
    hit: (r.hit as boolean) || false,
    sortOrder: (r.sort_order as number) ?? 0,
  }
}

function toOrder(r: Record<string, unknown>): Order {
  return {
    id: r.id as string,
    date: r.created_at as string,
    customer: r.customer as Order['customer'],
    items: r.items as Order['items'],
    total: r.total as number,
    status: r.status as Order['status'],
    source: (r.source as string) || 'site',
  }
}

function toConsultation(r: Record<string, unknown>): Consultation {
  return {
    id: r.id as string,
    date: r.created_at as string,
    name: r.name as string,
    phone: r.phone as string,
    email: (r.email as string) || '',
    category: (r.category as string) || '',
    comment: (r.comment as string) || '',
    status: r.status as Consultation['status'],
  }
}

// ─── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_PRODUCTS: Omit<Product, 'id'>[] = [
  { name:'Стіл «Карпати»', cat:'table', price:18500, oldPrice:null, badge:'top', emoji:'🪵', rating:5, desc:'Масивний обідній стіл з вільхи з різьбою на ЧПК', photos:[], featured:false, hit:false, sortOrder:0, options:[{name:'Розмір',type:'chips',values:[{label:'120×80 см',price:0},{label:'150×90 см',price:2000},{label:'180×90 см',price:4500}]},{name:'Матеріал',type:'chips',values:[{label:'Масив вільхи',price:0},{label:'Шпон МДФ',price:-3000}]}] },
  { name:'Крісло «Едельвейс»', cat:'chair', price:12800, oldPrice:15200, badge:'sale', emoji:'🪑', rating:5, desc:'Класичне крісло з різьбою на ЧПК, масив вільхи', photos:[], featured:true, hit:true, sortOrder:1, options:[{name:'Оббивка',type:'chips',values:[{label:'Велюр бежевий',price:0},{label:'Велюр сірий',price:0},{label:'Шкіра',price:2500}]},{name:'Колір дерева',type:'color',values:[{label:'Темний горіх',color:'#2C1A0E',price:0},{label:'Золотий',color:'#C8A96E',price:0}]}] },
  { name:'Гарнітур «Дніпро»', cat:'living', price:38000, oldPrice:null, badge:'new', emoji:'🛋️', rating:5, desc:'Класичний гарнітур для вітальні, шпон МДФ', photos:[], featured:false, hit:false, sortOrder:2, options:[{name:'Конфігурація',type:'chips',values:[{label:'Диван + 2 крісла',price:0},{label:'Тільки диван',price:-12000}]}] },
  { name:'Стіл «Софія»', cat:'table', price:22000, oldPrice:null, badge:'top', emoji:'🪵', rating:5, desc:'Розкладний стіл для 8 осіб, різьба на ЧПК', photos:[], featured:false, hit:true, sortOrder:3, options:[{name:'Розмір',type:'chips',values:[{label:'140×90 см',price:0},{label:'160×90 см',price:3000}]},{name:'Матеріал',type:'chips',values:[{label:'Масив вільхи',price:0},{label:'Шпон МДФ',price:-4000}]}] },
  { name:'Крісло «Полонина»', cat:'chair', price:9800, oldPrice:12000, badge:'sale', emoji:'🪑', rating:4, desc:'Компактне класичне крісло, шпон ДСП', photos:[], featured:false, hit:false, sortOrder:4, options:[{name:'Оббивка',type:'chips',values:[{label:'Тканина бежева',price:0},{label:'Шкіра',price:2000}]}] },
  { name:'Спальня «Верховина»', cat:'bedroom', price:68000, oldPrice:null, badge:'new', emoji:'🛏️', rating:5, desc:"Класичний спальний гарнітур, різьблене узголів'я ЧПК", photos:[], featured:false, hit:false, sortOrder:5, options:[{name:'Розмір ліжка',type:'chips',values:[{label:'160×200 см',price:0},{label:'180×200 см',price:5000}]},{name:'Матеріал',type:'chips',values:[{label:'Масив вільхи',price:0},{label:'Шпон МДФ',price:-12000}]}] },
]

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { slug:'all',     label:'Всі товари',       order:0 },
  { slug:'table',   label:'Столи',            order:1 },
  { slug:'chair',   label:'Крісла',           order:2 },
  { slug:'living',  label:'Меблі у вітальню', order:3 },
  { slug:'bedroom', label:'Спальні',          order:4 },
]

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error

  if (!data || data.length === 0) {
    const rows = DEFAULT_PRODUCTS.map((p, i) => ({
      id: 'p' + (Date.now() + i),
      name: p.name, cat: p.cat, price: p.price,
      old_price: p.oldPrice, badge: p.badge, emoji: p.emoji,
      rating: p.rating, description: p.desc, photos: p.photos,
      options: p.options, featured: p.featured, hit: p.hit, sort_order: p.sortOrder,
    }))
    const { data: seeded } = await supabase.from('products').insert(rows).select()
    return (seeded || []).map(r => toProduct(r as Record<string, unknown>))
  }

  return data.map(r => toProduct(r as Record<string, unknown>))
}

export async function createProduct(p: Omit<Product, 'id' | 'sortOrder'>): Promise<string> {
  const { data: existing } = await supabase.from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const maxSort = existing?.[0]?.sort_order ?? 0
  const id = 'p' + Date.now()

  const { error } = await supabase.from('products').insert({
    id, name: p.name, cat: p.cat, price: p.price,
    old_price: p.oldPrice, badge: p.badge, emoji: p.emoji,
    rating: p.rating, description: p.desc, photos: p.photos,
    options: p.options, featured: p.featured, hit: p.hit,
    sort_order: maxSort + 1,
  })
  if (error) throw error
  return id
}

export async function updateProduct(id: string, p: Partial<Product>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (p.name       !== undefined) patch.name        = p.name
  if (p.cat        !== undefined) patch.cat         = p.cat
  if (p.price      !== undefined) patch.price       = p.price
  if (p.oldPrice   !== undefined) patch.old_price   = p.oldPrice
  if (p.badge      !== undefined) patch.badge       = p.badge
  if (p.emoji      !== undefined) patch.emoji       = p.emoji
  if (p.rating     !== undefined) patch.rating      = p.rating
  if (p.desc       !== undefined) patch.description = p.desc
  if (p.photos     !== undefined) patch.photos      = p.photos
  if (p.options    !== undefined) patch.options     = p.options
  if (p.featured   !== undefined) patch.featured    = p.featured
  if (p.hit        !== undefined) patch.hit         = p.hit
  if (p.sortOrder  !== undefined) patch.sort_order  = p.sortOrder

  const { error } = await supabase.from('products').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function reorderProducts(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, i) =>
      supabase.from('products').update({ sort_order: i }).eq('id', id)
    )
  )
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(r => toOrder(r as Record<string, unknown>))
}

export async function createOrder(o: Omit<Order, 'id' | 'date'>): Promise<string> {
  const id = 'ORD-' + Date.now().toString(36).toUpperCase()
  const { error } = await supabase.from('orders').insert({
    id,
    customer: o.customer,
    items: o.items,
    total: o.total,
    status: o.status,
    source: o.source,
  })
  if (error) throw error
  return id
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

// ─── Consultations ────────────────────────────────────────────────────────────

export async function getAllConsultations(): Promise<Consultation[]> {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(r => toConsultation(r as Record<string, unknown>))
}

export async function createConsultation(c: Omit<Consultation, 'id' | 'date' | 'status'>): Promise<string> {
  const id = 'CON-' + Date.now().toString(36).toUpperCase()
  const { error } = await supabase.from('consultations').insert({
    id,
    name: c.name,
    phone: c.phone,
    email: c.email || null,
    category: c.category || null,
    comment: c.comment || null,
  })
  if (error) throw error
  return id
}

export async function updateConsultationStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('consultations').update({ status }).eq('id', id)
  if (error) throw error
}

// ─── Admin sessions ───────────────────────────────────────────────────────────

export async function saveSession(token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await supabase.from('admin_sessions').insert({ token, expires_at: expiresAt })
  // Cleanup expired sessions
  await supabase.from('admin_sessions').delete().lt('expires_at', new Date().toISOString())
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false
  const { data } = await supabase
    .from('admin_sessions')
    .select('token')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  return !!data
}

export async function deleteSession(token: string): Promise<void> {
  await supabase.from('admin_sessions').delete().eq('token', token)
}

export async function makeToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex')
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<CategoryDef[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error

  if (!data || data.length === 0) {
    const rows = DEFAULT_CATEGORIES.map(c => ({
      slug: c.slug, label: c.label, sort_order: c.order,
    }))
    const { data: seeded } = await supabase.from('categories').insert(rows).select()
    return (seeded || []).map(r => ({
      slug: r.slug as string,
      label: r.label as string,
      order: r.sort_order as number,
    }))
  }

  return data.map(r => ({
    slug: r.slug as string,
    label: r.label as string,
    order: r.sort_order as number,
  }))
}

export async function saveCategories(cats: CategoryDef[]): Promise<void> {
  const rows = cats.map((c, i) => ({ slug: c.slug, label: c.label, sort_order: i }))
  const { error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'slug' })
  if (error) throw error
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const [orders, consultations, products] = await Promise.all([
    getAllOrders(), getAllConsultations(), getAllProducts()
  ])
  const today = new Date().toISOString().slice(0, 10)
  return {
    totalOrders: orders.length,
    newOrders: orders.filter(o => o.status === 'new').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    todayOrders: orders.filter(o => o.date.startsWith(today)).length,
    totalProducts: products.length,
    newConsults: consultations.filter(c => c.status === 'new').length,
    recentOrders: orders.slice(0, 5),
  }
}
