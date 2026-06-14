'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { Product, CartItem, Category } from '@/lib/types'
import { CAT_LABELS } from '@/lib/types'
import { slugify, formatPrice, getBadgeClass, getBadgeLabel } from '@/lib/utils'
import Navbar from '@/components/ui/Navbar'
import CartSidebar from '@/components/ui/CartSidebar'
import LogoV1 from '@/components/logos/LogoV1'

const CART_KEY = 'oliynyk-cart'

interface Props {
  hits: Product[]
  totalCount: number
}

export default function BestsellersClient({ hits, totalCount }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {}
  }, [cart])

  const addToCart = useCallback((item: Omit<CartItem, 'key'>) => {
    const key = `${item.product.id}|${item.optionLabel}|${item.finalPrice}`
    setCart(prev => {
      const ex = prev.find(c => c.key === key)
      if (ex) return prev.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, key }]
    })
    setCartOpen(true)
  }, [])

  const changeQty = useCallback((idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], qty: next[idx].qty + delta }
      if (next[idx].qty <= 0) next.splice(idx, 1)
      return next
    })
  }, [])

  const removeItem = useCallback((idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  return (
    <>
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <CartSidebar
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onRemove={removeItem}
        onClear={clearCart}
        onOrderSuccess={clearCart}
      />

      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div className="product-page-breadcrumb">
          <a href="/">Головна</a>
          <span>›</span>
          <span>Хіт продажу</span>
        </div>

        {/* Hero header */}
        <section className="section" style={{ paddingBottom: '1rem' }}>
          <div className="section-tag">Популярне</div>
          <h1 className="section-title">🔥 Хіт продажу</h1>
          <p className="section-desc">
            Найпопулярніші класичні меблі з різьбою на ЧПК — вибір наших клієнтів
          </p>
        </section>

        {/* Products grid */}
        <section className="section" style={{ background: 'var(--dark2)', paddingTop: '2rem' }}>
          {hits.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '4rem 0' }}>
              Хіти продажу ще не вибрані. Зайдіть в адмінку та позначте товари.
            </p>
          ) : (
            <div className="products-grid">
              {hits.map(p => {
                const slug = slugify(p.name)
                const bc = getBadgeClass(p.badge)
                const bt = getBadgeLabel(p.badge)
                return (
                  <Link
                    key={p.id}
                    href={`/product/${slug}`}
                    className="product-card"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    itemScope
                    itemType="https://schema.org/Product"
                  >
                    <meta itemProp="name" content={p.name} />
                    <div className="product-img">
                      {p.photos?.[0] ? (
                        <img src={p.photos[0]} alt={`${p.name} — хіт продажу Олійник Меблі`} loading="lazy" width={300} height={280} />
                      ) : (
                        <span className="product-emoji" aria-hidden="true">{p.emoji || '🪵'}</span>
                      )}
                      {p.badge && <span className={`product-badge ${bc}`}>{bt}</span>}
                      <span className="product-badge" style={{ top: p.badge ? '2.4rem' : '.6rem', background: '#c0392b', color: '#fff', left: '.6rem', right: 'auto', borderRadius: 6 }}>
                        🔥 Хіт
                      </span>
                    </div>
                    <div className="product-body">
                      <div className="product-cat">{CAT_LABELS[p.cat as Category] || p.cat}</div>
                      <h2 className="product-name" style={{ fontSize: '1rem' }}>{p.name}</h2>
                      <p className="product-desc-short">{p.desc}</p>
                      <div className="product-rating" aria-label={`Рейтинг ${p.rating} з 5`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`star${i < p.rating ? '' : ' empty'}`} aria-hidden="true">★</span>
                        ))}
                      </div>
                      <div className="product-bottom" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <meta itemProp="priceCurrency" content="UAH" />
                        <div className="product-price">
                          від <span itemProp="price" content={String(p.price)}>₴ {formatPrice(p.price)}</span>
                          {p.oldPrice && <span className="old">₴ {formatPrice(p.oldPrice)}</span>}
                        </div>
                        <div className="product-open-btn">Обрати →</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="section" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: '1.6rem' }}>Переглянути весь каталог</h2>
          <p className="section-desc" style={{ marginBottom: '2rem' }}>
            Понад {totalCount} моделей класичних меблів з різьбою на ЧПК
          </p>
          <a href="/#catalog" className="btn-primary">Перейти до каталогу →</a>
        </section>
      </main>

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand"><LogoV1 height={68} /></div>
            <p className="footer-desc">Класичні меблі з різьбою на ЧПК. Масив вільхи, шпон МДФ та ДСП. Майстерня у смт Красне, Львівська область.</p>
          </div>
          <div>
            <div className="footer-heading">Каталог</div>
            <ul className="footer-links">
              <li><a href="/?cat=table#catalog">Столи</a></li>
              <li><a href="/?cat=chair#catalog">Крісла</a></li>
              <li><a href="/?cat=living#catalog">Вітальня</a></li>
              <li><a href="/?cat=bedroom#catalog">Спальні</a></li>
              <li><a href="/bestsellers">🔥 Хіт продажу</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Компанія</div>
            <ul className="footer-links">
              <li><a href="/#about">Про нас</a></li>
              <li><a href="/#reviews">Відгуки</a></li>
              <li><a href="/#contact">Контакти</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 Олійник Меблі — класичні меблі з різьбою, смт Красне, Львівська обл.</span>
          <div className="footer-socials">
            <a href="https://www.instagram.com/oliynyk_mebli" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
            <a href="https://t.me/oliynyk_mebli" target="_blank" rel="noopener" aria-label="Telegram">TG</a>
            <a href="https://www.facebook.com/oliynyk.mebli" target="_blank" rel="noopener" aria-label="Facebook">FB</a>
          </div>
        </div>
      </footer>
    </>
  )
}
