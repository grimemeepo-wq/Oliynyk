// ─── Product ──────────────────────────────────────────────────────────────────
export interface OptionValue {
  label: string
  price: number
  color?: string
}

export interface OptionGroup {
  name: string
  type: 'chips' | 'color'
  values: OptionValue[]
}

export interface Product {
  id: string
  name: string
  cat: 'table' | 'chair' | 'living' | 'bedroom'
  price: number
  oldPrice: number | null
  badge: 'new' | 'sale' | 'top' | ''
  emoji: string
  rating: number
  desc: string
  photos: string[]
  options: OptionGroup[]
  featured: boolean
  hit: boolean
  sortOrder: number
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface OrderItem {
  name: string
  price: number
  qty: number
}

export interface Customer {
  name: string
  phone: string
  email: string
  address: string
  comment: string
}

export interface Order {
  id: string
  date: string
  customer: Customer
  items: OrderItem[]
  total: number
  status: 'new' | 'progress' | 'done' | 'cancelled'
  source: string
}

// ─── Consultation ─────────────────────────────────────────────────────────────
export interface Consultation {
  id: string
  date: string
  name: string
  phone: string
  email: string
  category: string
  comment: string
  status: 'new' | 'progress' | 'done'
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  key: string
  product: Product
  optionLabel: string
  finalPrice: number
  qty: number
}

// ─── Categories ───────────────────────────────────────────────────────────────
export type Category = string

export interface CategoryDef {
  slug: string
  label: string
  order: number
}

export const CAT_LABELS: Record<string, string> = {
  all: 'Всі товари',
  table: 'Столи',
  chair: 'Крісла',
  living: 'Меблі у вітальню',
  bedroom: 'Спальні',
}

export const CATEGORIES = Object.keys(CAT_LABELS) as Category[]
