'use client'

import { useState, useEffect, useCallback, useRef, FormEvent, DragEvent } from 'react'
import type { Product, Order, Consultation, CategoryDef, OptionGroup, Category } from '@/lib/types'
import { CAT_LABELS } from '@/lib/types'
import { useRouter } from 'next/navigation'

// ── types ──────────────────────────────────────────────────────────────────────
interface Stats {
  totalOrders: number
  newOrders: number
  revenue: number
  todayOrders: number
  totalProducts: number
  newConsults: number
  recentOrders: Order[]
}

// ── helpers ────────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  new: 'Новий', progress: 'В роботі', done: 'Виконано', cancelled: 'Скасовано',
}
const STATUS_CLASSES: Record<string, string> = {
  new: 'status-new', progress: 'status-progress', done: 'status-done', cancelled: 'status-cancelled',
}
const CONSULT_STATUS_LABELS: Record<string, string> = {
  new: 'Нова', progress: 'В роботі', done: 'Оброблено',
}
const BADGE_LABELS: Record<string, string> = { '': 'Без бейджа', new: 'Новинка', sale: 'Акція', top: 'Хіт' }
const fmtPrice = (n: number) => '₴ ' + n.toLocaleString('uk-UA')
const fmtDate = (s: string) => new Date(s).toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
const CATS: { value: Category | ''; label: string }[] = [
  { value: 'table', label: 'Столи' }, { value: 'chair', label: 'Крісла' },
  { value: 'living', label: 'Вітальня' }, { value: 'bedroom', label: 'Спальня' },
]

// ── empty product form ─────────────────────────────────────────────────────────
const emptyForm = () => ({
  name: '', cat: 'table' as Category, price: '', oldPrice: '', badge: '',
  emoji: '🪵', rating: '5', desc: '', photos: '', featured: false, hit: false,
  options: [] as OptionGroup[],
})

// ── main component ─────────────────────────────────────────────────────────────
export default function AdminClient() {
  const router = useRouter()
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'products' | 'consultations' | 'add' | 'categories'>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Product list drag-and-drop
  const [productDragSrcIdx, setProductDragSrcIdx] = useState<number | null>(null)
  const [productDragOverIdx, setProductDragOverIdx] = useState<number | null>(null)

  // categories state
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [catsDirty, setCatsDirty] = useState(false)
  const [catsSaving, setCatsSaving] = useState(false)
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatLabel, setNewCatLabel] = useState('')
  const [editingCat, setEditingCat] = useState<string | null>(null)

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (r.ok) {
        const d = await r.json()
        urls.push(d.url)
      } else {
        showToast('Помилка завантаження файлу')
      }
    }
    if (urls.length) {
      setForm(v => ({
        ...v,
        photos: v.photos ? v.photos + '\n' + urls.join('\n') : urls.join('\n'),
      }))
    }
    setUploading(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  // helpers
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchStats = useCallback(async () => {
    const r = await fetch('/api/admin/stats')
    if (r.ok) setStats(await r.json())
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/orders')
    if (r.ok) setOrders(await r.json())
    setLoading(false)
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/products')
    if (r.ok) setProducts(await r.json())
    setLoading(false)
  }, [])

  const fetchConsultations = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/consultations')
    if (r.ok) setConsultations(await r.json())
    setLoading(false)
  }, [])

  const fetchCategories = useCallback(async () => {
    const r = await fetch('/api/admin/categories')
    if (r.ok) { setCategories(await r.json()); setCatsDirty(false) }
  }, [])

  useEffect(() => {
    if (tab === 'dashboard') fetchStats()
    if (tab === 'orders') fetchOrders()
    if (tab === 'products') fetchProducts()
    if (tab === 'consultations') fetchConsultations()
    if (tab === 'categories') fetchCategories()
  }, [tab, fetchStats, fetchOrders, fetchProducts, fetchConsultations, fetchCategories])

  // edit product → populate form
  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        cat: editProduct.cat,
        price: String(editProduct.price),
        oldPrice: editProduct.oldPrice ? String(editProduct.oldPrice) : '',
        badge: editProduct.badge,
        emoji: editProduct.emoji,
        rating: String(editProduct.rating),
        desc: editProduct.desc,
        photos: (editProduct.photos || []).join('\n'),
        featured: editProduct.featured,
        hit: editProduct.hit ?? false,
        options: editProduct.options || [],
      })
      setTab('add')
    }
  }, [editProduct])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  async function handleOrderStatus(id: string, status: string) {
    const r = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (r.ok) { fetchOrders(); showToast('Статус оновлено') }
  }

  async function handleConsultStatus(id: string, status: string) {
    const r = await fetch('/api/admin/consultations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (r.ok) { fetchConsultations(); showToast('Статус оновлено') }
  }

  async function handleSaveProduct(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      cat: form.cat,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      badge: form.badge,
      emoji: form.emoji || '🪵',
      rating: Number(form.rating) || 5,
      desc: form.desc,
      photos: form.photos.split('\n').map(s => s.trim()).filter(Boolean),
      featured: form.featured,
      hit: form.hit,
      options: form.options,
    }
    const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products'
    const method = editProduct ? 'PUT' : 'POST'
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (r.ok) {
      showToast(editProduct ? 'Товар оновлено' : 'Товар додано')
      setEditProduct(null)
      setForm(emptyForm())
      fetchProducts()
      setTab('products')
    } else {
      const d = await r.json()
      showToast(d.error || 'Помилка')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const r = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (r.ok) { fetchProducts(); showToast('Товар видалено'); setDeleteConfirm(null) }
  }

  async function handleProductDrop(toIdx: number) {
    const src = productDragSrcIdx
    setProductDragSrcIdx(null)
    setProductDragOverIdx(null)
    if (src === null || src === toIdx) return
    const next = [...products]
    const [item] = next.splice(src, 1)
    next.splice(toIdx, 0, item)
    setProducts(next)
    const r = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map(p => p.id) }),
    })
    if (!r.ok) { showToast('Помилка збереження порядку'); fetchProducts() }
    else showToast('Порядок збережено')
  }

  async function handleMove(idx: number, dir: -1 | 1) {
    const next = [...products]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setProducts(next)
    const r = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map(p => p.id) }),
    })
    if (!r.ok) { showToast('Помилка збереження порядку'); fetchProducts() }
    else showToast('Порядок збережено')
  }

  // ── option helpers ────────────────────────────────────────────────────────────
  function addOptionGroup() {
    setForm(v => ({ ...v, options: [...v.options, { name: '', type: 'chips' as const, values: [] }] }))
  }

  function removeOptionGroup(gi: number) {
    setForm(v => ({ ...v, options: v.options.filter((_, i) => i !== gi) }))
  }

  function updateOptionGroup(gi: number, field: 'name' | 'type', value: string) {
    setForm(v => ({
      ...v,
      options: v.options.map((g, i) => {
        if (i !== gi) return g
        const updated = { ...g, [field]: value } as OptionGroup
        if (field === 'type' && value === 'color')
          updated.values = updated.values.map(val => ({ ...val, color: val.color || '#C8A96E' }))
        return updated
      }),
    }))
  }

  function addOptionValue(gi: number) {
    setForm(v => ({
      ...v,
      options: v.options.map((g, i) => {
        if (i !== gi) return g
        const newVal = g.type === 'color' ? { label: '', price: 0, color: '#C8A96E' } : { label: '', price: 0 }
        return { ...g, values: [...g.values, newVal] }
      }),
    }))
  }

  function removeOptionValue(gi: number, vi: number) {
    setForm(v => ({
      ...v,
      options: v.options.map((g, i) => i === gi ? { ...g, values: g.values.filter((_, j) => j !== vi) } : g),
    }))
  }

  function updateOptionValue(gi: number, vi: number, field: string, value: string | number) {
    setForm(v => ({
      ...v,
      options: v.options.map((g, i) => i === gi
        ? { ...g, values: g.values.map((val, j) => j === vi ? { ...val, [field]: value } : val) }
        : g
      ),
    }))
  }

  // ── category helpers ──────────────────────────────────────────────────────────
  async function handleSaveCategories() {
    setCatsSaving(true)
    const r = await fetch('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories),
    })
    if (r.ok) { showToast('Категорії збережено'); setCatsDirty(false) }
    else showToast('Помилка збереження')
    setCatsSaving(false)
  }

  function handleCatMove(idx: number, dir: -1 | 1) {
    const next = [...categories]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setCategories(next)
    setCatsDirty(true)
  }

  function handleCatLabelChange(slug: string, label: string) {
    setCategories(prev => prev.map(c => c.slug === slug ? { ...c, label } : c))
    setCatsDirty(true)
  }

  function handleAddCat() {
    const slug = newCatSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const label = newCatLabel.trim()
    if (!slug || !label) { showToast('Введіть slug та назву'); return }
    if (categories.find(c => c.slug === slug)) { showToast('Категорія з таким slug вже існує'); return }
    setCategories(prev => [...prev, { slug, label, order: prev.length }])
    setNewCatSlug('')
    setNewCatLabel('')
    setCatsDirty(true)
  }

  function handleDeleteCat(slug: string) {
    if (slug === 'all') { showToast('Категорію «Всі товари» не можна видалити'); return }
    setCategories(prev => prev.filter(c => c.slug !== slug))
    setCatsDirty(true)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="admin-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="admin-confirm-title">Видалити товар?</div>
            <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', marginBottom: '1.5rem' }}>
              Цю дію неможливо скасувати.
            </p>
            <div style={{ display: 'flex', gap: '.8rem' }}>
              <button className="admin-btn admin-btn-red" onClick={() => handleDelete(deleteConfirm)}>
                Видалити
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteConfirm(null)}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">ОЛІЙНИК</div>
        <nav className="admin-sidebar-nav">
          {([
            ['dashboard', '📊', 'Дашборд'],
            ['orders', '📋', 'Замовлення'],
            ['products', '📦', 'Товари'],
            ['add', '➕', 'Додати товар'],
            ['consultations', '📞', 'Заявки'],
            ['categories', '🗂️', 'Категорії'],
          ] as const).map(([key, icon, label]) => (
            <button
              key={key}
              className={`admin-nav-btn${tab === key ? ' active' : ''}`}
              onClick={() => { setTab(key); if (key !== 'add') { setEditProduct(null); setForm(emptyForm()) } }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-btn" onClick={handleLogout}>🚪 Вийти</button>
          <a href="/" className="admin-nav-btn" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', textDecoration: 'none', color: 'var(--text-dim)' }}>
            🌐 Переглянути сайт
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div>
            <h1 className="admin-page-title">Дашборд</h1>
            {stats ? (
              <>
                <div className="admin-stat-grid">
                  {[
                    { n: stats.totalOrders, l: 'Всього замовлень', c: '📋' },
                    { n: stats.newOrders, l: 'Нових замовлень', c: '🆕' },
                    { n: fmtPrice(stats.revenue), l: 'Загальний дохід', c: '💰' },
                    { n: stats.todayOrders, l: 'Замовлень сьогодні', c: '📅' },
                    { n: stats.totalProducts, l: 'Товарів у каталозі', c: '📦' },
                    { n: stats.newConsults, l: 'Нових заявок', c: '📞' },
                  ].map(s => (
                    <div className="admin-stat-card" key={s.l}>
                      <div style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>{s.c}</div>
                      <div className="admin-stat-num">{s.n}</div>
                      <div className="admin-stat-lbl">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="admin-section-title">Останні замовлення</div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Клієнт</th><th>Телефон</th><th>Сума</th><th>Статус</th><th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.length === 0 ? (
                        <tr><td colSpan={6} className="admin-empty">Замовлень ще немає</td></tr>
                      ) : stats.recentOrders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{o.id}</td>
                          <td>{o.customer.name}</td>
                          <td>{o.customer.phone}</td>
                          <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{fmtPrice(o.total)}</td>
                          <td><span className={`admin-status ${STATUS_CLASSES[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                          <td style={{ color: 'var(--text-dim)', fontSize: '.8rem' }}>{fmtDate(o.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="admin-loading">Завантаження...</div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <h1 className="admin-page-title">Замовлення</h1>
            {loading ? <div className="admin-loading">Завантаження...</div> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Клієнт</th><th>Телефон</th><th>Товари</th>
                      <th>Сума</th><th>Статус</th><th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={7} className="admin-empty">Замовлень ще немає</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--text-dim)' }}>{o.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                          {o.customer.email && <div style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>{o.customer.email}</div>}
                          {o.customer.address && <div style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>{o.customer.address}</div>}
                        </td>
                        <td><a href={`tel:${o.customer.phone}`} style={{ color: 'var(--gold)' }}>{o.customer.phone}</a></td>
                        <td>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.78rem', color: 'var(--text-dim)' }}>
                            {o.items.map((it, i) => (
                              <li key={i}>{it.name} ×{it.qty} — {fmtPrice(it.price * it.qty)}</li>
                            ))}
                          </ul>
                        </td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{fmtPrice(o.total)}</td>
                        <td>
                          <select
                            className="form-select"
                            value={o.status}
                            onChange={e => handleOrderStatus(o.id, e.target.value)}
                            style={{ padding: '.4rem .8rem', fontSize: '.78rem', minWidth: 120 }}
                          >
                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-dim)', fontSize: '.78rem' }}>{fmtDate(o.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h1 className="admin-page-title" style={{ margin: 0 }}>Товари</h1>
              <button className="admin-btn admin-btn-gold" onClick={() => { setEditProduct(null); setForm(emptyForm()); setTab('add') }}>
                ➕ Додати товар
              </button>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', marginBottom: '1.5rem' }}>
              Перетягуйте рядки для зміни порядку або використовуйте стрілки ↑↓.
            </p>
            {loading ? <div className="admin-loading">Завантаження...</div> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Порядок</th>
                      <th>Фото</th><th>Назва</th><th>Категорія</th><th>Ціна</th>
                      <th>Бейдж</th><th>🔥 Хіт</th><th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr
                        key={p.id}
                        draggable
                        onDragStart={() => setProductDragSrcIdx(idx)}
                        onDragOver={e => { e.preventDefault(); setProductDragOverIdx(idx) }}
                        onDrop={() => handleProductDrop(idx)}
                        onDragEnd={() => { setProductDragSrcIdx(null); setProductDragOverIdx(null) }}
                        style={{
                          opacity: productDragSrcIdx === idx ? 0.35 : 1,
                          outline: productDragOverIdx === idx && productDragSrcIdx !== idx ? '2px solid var(--gold)' : undefined,
                          outlineOffset: '-2px',
                          transition: 'opacity .15s',
                        }}
                      >
                        <td style={{ cursor: 'grab' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1, marginBottom: 3, letterSpacing: 1 }} title="Перетягніть для зміни порядку">⠿</span>
                            <button
                              className="admin-btn admin-btn-ghost"
                              style={{ padding: '2px 8px', fontSize: '.75rem', lineHeight: 1 }}
                              onClick={() => handleMove(idx, -1)}
                              disabled={idx === 0}
                              title="Перемістити вище"
                            >▲</button>
                            <span style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{idx + 1}</span>
                            <button
                              className="admin-btn admin-btn-ghost"
                              style={{ padding: '2px 8px', fontSize: '.75rem', lineHeight: 1 }}
                              onClick={() => handleMove(idx, 1)}
                              disabled={idx === products.length - 1}
                              title="Перемістити нижче"
                            >▼</button>
                          </div>
                        </td>
                        <td>
                          <div style={{ width: 56, height: 56, background: 'var(--dark3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', overflow: 'hidden' }}>
                            {p.photos?.[0]
                              ? <img src={p.photos[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : p.emoji}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '.76rem', color: 'var(--text-dim)' }}>{p.desc}</div>
                        </td>
                        <td style={{ color: 'var(--text-dim)' }}>{CAT_LABELS[p.cat as keyof typeof CAT_LABELS] || p.cat}</td>
                        <td>
                          <div style={{ color: 'var(--gold)', fontWeight: 700 }}>₴ {p.price.toLocaleString()}</div>
                          {p.oldPrice && <div style={{ fontSize: '.76rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>₴ {p.oldPrice.toLocaleString()}</div>}
                        </td>
                        <td>
                          {p.badge ? <span className={`admin-status status-${p.badge === 'top' ? 'new' : p.badge === 'sale' ? 'cancelled' : 'progress'}`}>{BADGE_LABELS[p.badge]}</span> : <span style={{ color: 'var(--text-dim)', fontSize: '.78rem' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {p.hit ? <span style={{ fontSize: '1.2rem' }}>🔥</span> : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                        </td>
                        <td>
                          <button className="edit-btn" onClick={() => setEditProduct(p)}>✏️ Редагувати</button>
                          <button className="del-btn" onClick={() => setDeleteConfirm(p.id)}>🗑 Видалити</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT PRODUCT ── */}
        {tab === 'add' && (
          <div>
            <h1 className="admin-page-title">{editProduct ? `Редагувати: ${editProduct.name}` : 'Додати новий товар'}</h1>
            <form onSubmit={handleSaveProduct} className="admin-product-form">
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Назва *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="Стіл «Карпати»" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Категорія *</label>
                  <select className="form-select" value={form.cat} onChange={e => setForm(v => ({ ...v, cat: e.target.value as Category }))}>
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ціна (₴) *</label>
                  <input className="form-input" type="number" min={0} value={form.price} onChange={e => setForm(v => ({ ...v, price: e.target.value }))} placeholder="18500" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Стара ціна (₴)</label>
                  <input className="form-input" type="number" min={0} value={form.oldPrice} onChange={e => setForm(v => ({ ...v, oldPrice: e.target.value }))} placeholder="Необов'язково" />
                </div>
                <div className="form-group">
                  <label className="form-label">Бейдж</label>
                  <select className="form-select" value={form.badge} onChange={e => setForm(v => ({ ...v, badge: e.target.value }))}>
                    {Object.entries(BADGE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Емодзі</label>
                  <input className="form-input" value={form.emoji} onChange={e => setForm(v => ({ ...v, emoji: e.target.value }))} placeholder="🪵" />
                </div>
                <div className="form-group">
                  <label className="form-label">Рейтинг (1–5)</label>
                  <select className="form-select" value={form.rating} onChange={e => setForm(v => ({ ...v, rating: e.target.value }))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(v => ({ ...v, featured: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    Показувати на головній
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.hit} onChange={e => setForm(v => ({ ...v, hit: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    🔥 Хіт продажу (сторінка /bestsellers)
                  </label>
                </div>
                <div className="form-group full">
                  <label className="form-label">Короткий опис</label>
                  <input className="form-input" value={form.desc} onChange={e => setForm(v => ({ ...v, desc: e.target.value }))} placeholder="Класичний стіл з масиву вільхи з різьбою ЧПК" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Фото</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => e.target.files && uploadFiles(e.target.files)}
                  />
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--dark4)'}`,
                      borderRadius: 12,
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? 'rgba(200,169,110,.06)' : 'var(--dark2)',
                      transition: 'all .2s',
                      marginBottom: '.8rem',
                    }}
                  >
                    {uploading
                      ? <span style={{ color: 'var(--gold)' }}>⏳ Завантаження...</span>
                      : <span style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>
                          📁 Перетягніть фото сюди або <span style={{ color: 'var(--gold)' }}>натисніть для вибору</span>
                        </span>
                    }
                  </div>

                  {/* Photo previews with delete */}
                  {form.photos && (
                    <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
                      {form.photos.split('\n').filter(Boolean).map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url.trim()} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--dark4)', display: 'block' }} />
                          <button
                            type="button"
                            onClick={() => {
                              const arr = form.photos.split('\n').filter(Boolean)
                              arr.splice(i, 1)
                              setForm(v => ({ ...v, photos: arr.join('\n') }))
                            }}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#c0392b', border: 'none', color: '#fff', fontSize: '.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="form-textarea"
                    value={form.photos}
                    onChange={e => setForm(v => ({ ...v, photos: e.target.value }))}
                    placeholder="або вставте URL-посилання, кожне з нового рядка&#10;https://..."
                    style={{ minHeight: 60, fontSize: '.8rem' }}
                  />
                </div>
              </div>

              {/* ── OPTIONS EDITOR ── */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--dark4)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700 }}>Параметри товару</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '.78rem', marginTop: '.2rem' }}>Опції, які впливають на ціну (Розмір, Оббивка, Колір тощо)</div>
                  </div>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={addOptionGroup} style={{ fontSize: '.82rem' }}>
                    ＋ Додати параметр
                  </button>
                </div>

                {form.options.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', fontSize: '.82rem', padding: '.9rem 1.2rem', background: 'var(--dark3)', borderRadius: 10, border: '1px dashed var(--dark4)' }}>
                    Параметрів немає. Додайте, наприклад: «Розмір», «Оббивка», «Колір дерева».
                  </div>
                )}

                {form.options.map((group, gi) => (
                  <div key={gi} style={{ background: 'var(--dark3)', border: '1px solid var(--dark4)', borderRadius: 14, padding: '1.2rem', marginBottom: '1rem' }}>
                    {/* Group header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '.6rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <input
                        className="form-input"
                        placeholder="Назва параметру (напр. Розмір, Оббивка, Колір дерева)"
                        value={group.name}
                        onChange={e => updateOptionGroup(gi, 'name', e.target.value)}
                        style={{ fontSize: '.88rem' }}
                      />
                      <select
                        className="form-select"
                        value={group.type}
                        onChange={e => updateOptionGroup(gi, 'type', e.target.value)}
                        style={{ fontSize: '.82rem', width: 'auto' }}
                      >
                        <option value="chips">Варіанти (текст)</option>
                        <option value="color">Колір (кружки)</option>
                      </select>
                      <button type="button" className="del-btn" onClick={() => removeOptionGroup(gi)} title="Видалити параметр">🗑</button>
                    </div>

                    {/* Value header */}
                    {group.values.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: group.type === 'color' ? '1fr 130px 36px 28px' : '1fr 130px 28px', gap: '.5rem', marginBottom: '.4rem', padding: '0 .2rem' }}>
                        <span style={{ fontSize: '.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Назва</span>
                        <span style={{ fontSize: '.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>±Ціна (₴)</span>
                        {group.type === 'color' && <span style={{ fontSize: '.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Колір</span>}
                        <span />
                      </div>
                    )}

                    {/* Values list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginBottom: '.8rem' }}>
                      {group.values.map((val, vi) => (
                        <div key={vi} style={{ display: 'grid', gridTemplateColumns: group.type === 'color' ? '1fr 130px 36px 28px' : '1fr 130px 28px', gap: '.5rem', alignItems: 'center' }}>
                          <input
                            className="form-input"
                            placeholder={group.type === 'color' ? 'Назва (напр. Бежевий)' : 'Назва (напр. 120×80 см)'}
                            value={val.label}
                            onChange={e => updateOptionValue(gi, vi, 'label', e.target.value)}
                            style={{ fontSize: '.82rem' }}
                          />
                          <input
                            className="form-input"
                            type="number"
                            placeholder="0"
                            value={val.price || ''}
                            onChange={e => updateOptionValue(gi, vi, 'price', Number(e.target.value) || 0)}
                            step={100}
                            style={{ fontSize: '.82rem' }}
                            title="0 = без доплати, +2000 = доплата 2000₴, -1000 = знижка 1000₴"
                          />
                          {group.type === 'color' && (
                            <input
                              type="color"
                              value={val.color || '#C8A96E'}
                              onChange={e => updateOptionValue(gi, vi, 'color', e.target.value)}
                              style={{ width: 36, height: 36, border: '2px solid var(--dark4)', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'transparent' }}
                              title="Оберіть колір"
                            />
                          )}
                          <button
                            type="button"
                            className="del-btn"
                            onClick={() => removeOptionValue(gi, vi)}
                            style={{ padding: '.3rem .45rem', fontSize: '.7rem' }}
                          >✕</button>
                        </div>
                      ))}
                    </div>

                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => addOptionValue(gi)} style={{ fontSize: '.78rem', padding: '.35rem .8rem' }}>
                      ＋ Додати значення
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="admin-btn admin-btn-gold" disabled={saving}>
                  {saving ? 'Збереження...' : editProduct ? '💾 Зберегти зміни' : '➕ Додати товар'}
                </button>
                {editProduct && (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => { setEditProduct(null); setForm(emptyForm()); setTab('products') }}>
                    Скасувати
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="admin-page-title" style={{ margin: 0 }}>Категорії каталогу</h1>
              <button
                className="admin-btn admin-btn-gold"
                onClick={handleSaveCategories}
                disabled={!catsDirty || catsSaving}
              >
                {catsSaving ? '⏳ Збереження...' : '💾 Зберегти зміни'}
              </button>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', marginBottom: '1.5rem' }}>
              Порядок категорій відображається у фільтрах каталогу. Slug — це технічний ідентифікатор, який використовується в URL і не може збігатися з існуючим.
            </p>

            {/* Category list */}
            <div className="admin-table-wrap" style={{ marginBottom: '2rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Порядок</th>
                    <th style={{ width: 140 }}>Slug</th>
                    <th>Назва категорії</th>
                    <th style={{ width: 100 }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat.slug}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '2px 8px', fontSize: '.75rem' }}
                            onClick={() => handleCatMove(idx, -1)}
                            disabled={idx === 0}
                            title="Вище"
                          >▲</button>
                          <span style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{idx + 1}</span>
                          <button
                            className="admin-btn admin-btn-ghost"
                            style={{ padding: '2px 8px', fontSize: '.75rem' }}
                            onClick={() => handleCatMove(idx, 1)}
                            disabled={idx === categories.length - 1}
                            title="Нижче"
                          >▼</button>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '.82rem', color: 'var(--text-dim)', background: 'var(--dark3)', padding: '.2rem .5rem', borderRadius: 4 }}>
                          {cat.slug}
                        </code>
                      </td>
                      <td>
                        {editingCat === cat.slug ? (
                          <input
                            className="form-input"
                            value={cat.label}
                            autoFocus
                            onChange={e => handleCatLabelChange(cat.slug, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') setEditingCat(null)
                              if (e.key === 'Escape') { handleCatLabelChange(cat.slug, cat.label); setEditingCat(null) }
                            }}
                            style={{ maxWidth: 280 }}
                          />
                        ) : (
                          <span style={{ fontWeight: 500 }}>{cat.label}</span>
                        )}
                      </td>
                      <td>
                        {editingCat === cat.slug ? (
                          <div style={{ display: 'flex', gap: '.4rem' }}>
                            <button
                              className="edit-btn"
                              onClick={() => setEditingCat(null)}
                              title="Зберегти назву"
                              style={{ padding: '.35rem .8rem', fontWeight: 700, fontSize: '.82rem' }}
                            >✓ Готово</button>
                          </div>
                        ) : cat.slug !== 'all' ? (
                          <div style={{ display: 'flex', gap: '.4rem' }}>
                            <button
                              className="edit-btn"
                              onClick={() => setEditingCat(cat.slug)}
                            >✏️ Редагувати</button>
                            <button
                              className="del-btn"
                              onClick={() => handleDeleteCat(cat.slug)}
                              title="Видалити категорію"
                            >🗑 Видалити</button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '.75rem' }}>системна</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add new category */}
            <div style={{ background: 'var(--dark2)', border: '1px solid var(--dark3)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Додати нову категорію
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Slug (латиницею, без пробілів)</label>
                  <input
                    className="form-input"
                    placeholder="napr: hall, kitchen"
                    value={newCatSlug}
                    onChange={e => setNewCatSlug(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Назва</label>
                  <input
                    className="form-input"
                    placeholder="Передпокій"
                    value={newCatLabel}
                    onChange={e => setNewCatLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCat() }}
                  />
                </div>
                <button
                  className="admin-btn admin-btn-gold"
                  onClick={handleAddCat}
                  style={{ height: 42 }}
                >
                  ➕ Додати
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONSULTATIONS ── */}
        {tab === 'consultations' && (
          <div>
            <h1 className="admin-page-title">Заявки на консультацію</h1>
            {loading ? <div className="admin-loading">Завантаження...</div> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Ім&apos;я</th><th>Телефон</th><th>Email</th>
                      <th>Категорія</th><th>Коментар</th><th>Статус</th><th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.length === 0 ? (
                      <tr><td colSpan={8} className="admin-empty">Заявок ще немає</td></tr>
                    ) : consultations.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--text-dim)' }}>{c.id}</td>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td><a href={`tel:${c.phone}`} style={{ color: 'var(--gold)' }}>{c.phone}</a></td>
                        <td style={{ color: 'var(--text-dim)', fontSize: '.8rem' }}>{c.email || '—'}</td>
                        <td style={{ color: 'var(--text-dim)' }}>{c.category || '—'}</td>
                        <td style={{ color: 'var(--text-dim)', fontSize: '.8rem', maxWidth: 200 }}>{c.comment || '—'}</td>
                        <td>
                          <select
                            className="form-select"
                            value={c.status}
                            onChange={e => handleConsultStatus(c.id, e.target.value)}
                            style={{ padding: '.4rem .8rem', fontSize: '.78rem', minWidth: 110 }}
                          >
                            {Object.entries(CONSULT_STATUS_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-dim)', fontSize: '.78rem' }}>{fmtDate(c.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
