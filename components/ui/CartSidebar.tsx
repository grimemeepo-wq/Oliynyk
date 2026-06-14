'use client'

import { useState } from 'react'
import type { CartItem } from '@/lib/types'

interface CartSidebarProps {
  open: boolean
  cart: CartItem[]
  onClose: () => void
  onChangeQty: (idx: number, delta: number) => void
  onRemove: (idx: number) => void
  onClear: () => void
  onOrderSuccess: () => void
}

export default function CartSidebar({
  open, cart, onClose, onChangeQty, onRemove, onClear, onOrderSuccess
}: CartSidebarProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', comment:'' })
  const [loading, setLoading] = useState(false)

  const total = cart.reduce((s, c) => s + c.finalPrice * c.qty, 0)
  const totalQty = cart.reduce((s, c) => s + c.qty, 0)

  const handleCheckout = async () => {
    if (!cart.length) return
    if (step === 0) { setStep(1); return }
    if (!form.name || !form.phone) { alert("Введіть ім'я та телефон!"); return }

    setLoading(true)
    try {
      const order = {
        customer: form,
        items: cart.map(c => ({
          name: c.product.name + (c.optionLabel ? ` (${c.optionLabel})` : ''),
          price: c.finalPrice,
          qty: c.qty,
        })),
        total,
        source: 'site',
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      const data = await res.json()
      if (data.ok) {
        onClear()
        onClose()
        setStep(0)
        setForm({ name:'', phone:'', email:'', address:'', comment:'' })
        onOrderSuccess()
        alert(`Замовлення ${data.id} оформлено! Дякуємо, ми зв'яжемося з вами незабаром.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`cart-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`cart-sidebar${open ? ' open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Кошик</h2>
          <div className="cart-close" onClick={onClose}>✕</div>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Кошик порожній</p>
              <p style={{ fontSize: '.82rem', marginTop: '.5rem' }}>Додайте товари з каталогу</p>
            </div>
          ) : (
            cart.map((c, i) => (
              <div className="cart-item" key={c.key}>
                <div className="cart-item-img">
                  {c.product.photos?.length
                    ? <img src={c.product.photos[0]} alt={c.product.name} />
                    : <span style={{ fontSize: '2rem' }}>{c.product.emoji || '🪵'}</span>
                  }
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{c.product.name}</div>
                  {c.optionLabel && <div className="cart-item-cat">{c.optionLabel}</div>}
                  <div className="cart-item-bottom">
                    <div className="cart-item-price">
                      ₴ {(c.finalPrice * c.qty).toLocaleString('uk-UA')}
                    </div>
                    <div className="cart-qty">
                      <button onClick={() => onChangeQty(i, -1)}>−</button>
                      <span>{c.qty}</span>
                      <button onClick={() => onChangeQty(i, 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => onRemove(i)}>
                    Видалити
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout form */}
        {step === 1 && (
          <div className="checkout-form show">
            <div style={{ fontWeight: 700, marginBottom: '.8rem', fontSize: '.9rem' }}>
              Дані для замовлення
            </div>
            {[
              { id: 'name', label: "Ім'я *", type: 'text', placeholder: "Іван" },
              { id: 'phone', label: 'Телефон *', type: 'tel', placeholder: '+380...' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
              { id: 'address', label: 'Адреса', type: 'text', placeholder: 'Місто, адреса' },
            ].map(f => (
              <div key={f.id} className="form-row">
                <div className="form-group full">
                  <input
                    className="form-input"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.id as keyof typeof form]}
                    onChange={e => setForm(v => ({ ...v, [f.id]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
            <div className="form-row">
              <div className="form-group full">
                <textarea
                  className="form-textarea"
                  placeholder="Коментар..."
                  value={form.comment}
                  onChange={e => setForm(v => ({ ...v, comment: e.target.value }))}
                  style={{ minHeight: 60 }}
                />
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="cart-footer" style={{ display: 'block' }}>
            <div className="cart-total">
              <span className="cart-total-label">Разом ({totalQty} товарів):</span>
              <span className="cart-total-price">₴ {total.toLocaleString('uk-UA')}</span>
            </div>
            <button
              className="cart-checkout"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Оформлення...' : step === 0 ? 'Оформити замовлення' : '✓ Підтвердити замовлення'}
            </button>
            <button className="cart-clear" onClick={() => { onClear(); setStep(0) }}>
              Очистити кошик
            </button>
          </div>
        )}
      </div>
    </>
  )
}
