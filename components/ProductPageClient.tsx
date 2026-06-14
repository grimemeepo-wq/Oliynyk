'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Product, CartItem, CategoryDef } from '@/lib/types'
import { calcPrice, formatPrice, getBadgeClass, getBadgeLabel, slugify } from '@/lib/utils'
import Navbar from '@/components/ui/Navbar'
import CartSidebar from '@/components/ui/CartSidebar'
import LogoV1 from '@/components/logos/LogoV1'

const CART_KEY = 'oliynyk-cart'

interface Props {
  product: Product
  related: Product[]
  categories: CategoryDef[]
}

export default function ProductPageClient({ product, related, categories }: Props) {
  const catLabel = (slug: string) => categories.find(c => c.slug === slug)?.label || slug
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch {}
    setCartLoaded(true)
  }, [])

  useEffect(() => {
    if (!cartLoaded) return
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {}
  }, [cart, cartLoaded])

  const [activePhoto, setActivePhoto] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [selections, setSelections] = useState<Record<number, number>>({})
  const [added, setAdded] = useState(false)

  // Gallery swipe
  const galleryTouchRef = useRef<{ x: number; y: number } | null>(null)
  const gallerySwipedRef = useRef(false)

  function onGalleryTouchStart(e: React.TouchEvent) {
    gallerySwipedRef.current = false
    galleryTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onGalleryTouchEnd(e: React.TouchEvent) {
    if (!galleryTouchRef.current) return
    const dx = e.changedTouches[0].clientX - galleryTouchRef.current.x
    const dy = Math.abs(e.changedTouches[0].clientY - galleryTouchRef.current.y)
    galleryTouchRef.current = null
    if (Math.abs(dx) > 45 && dy < 80 && hasPhotos && product.photos.length > 1) {
      gallerySwipedRef.current = true
      setActivePhoto(i => dx < 0
        ? (i + 1) % product.photos.length
        : (i - 1 + product.photos.length) % product.photos.length)
    }
  }

  // Lightbox zoom/pan state
  const [lbScale, setLbScale] = useState(1)
  const [lbPos, setLbPos] = useState({ x: 0, y: 0 })
  const lbScaleRef = useRef(1)
  const lbPosRef = useRef({ x: 0, y: 0 })
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null)
  const lastTapRef = useRef(0)

  const resetLb = useCallback(() => {
    setLbScale(1)
    setLbPos({ x: 0, y: 0 })
    lbScaleRef.current = 1
    lbPosRef.current = { x: 0, y: 0 }
  }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxOpen(false); resetLb() }
      if (e.key === 'ArrowRight') { setLightboxIdx(i => (i + 1) % product.photos.length); resetLb() }
      if (e.key === 'ArrowLeft') { setLightboxIdx(i => (i - 1 + product.photos.length) % product.photos.length); resetLb() }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightboxOpen, product.photos.length, resetLb])

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxOpen(true); resetLb() }

  function onLbTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartRef.current = { dist: Math.hypot(dx, dy), scale: lbScaleRef.current }
      touchStartRef.current = null
    } else if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
      pinchStartRef.current = null
    }
  }

  function onLbTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const newScale = Math.max(1, Math.min(5, pinchStartRef.current.scale * Math.hypot(dx, dy) / pinchStartRef.current.dist))
      lbScaleRef.current = newScale
      setLbScale(newScale)
    } else if (e.touches.length === 1 && lbScaleRef.current > 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y
      const newPos = { x: lbPosRef.current.x + dx, y: lbPosRef.current.y + dy }
      lbPosRef.current = newPos
      setLbPos(newPos)
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: touchStartRef.current.t }
    }
  }

  function onLbTouchEnd(e: React.TouchEvent) {
    if (e.touches.length === 0) pinchStartRef.current = null
    if (e.changedTouches.length !== 1) return

    const touch = e.changedTouches[0]
    const now = Date.now()
    const isDoubleTap = touchStartRef.current &&
      now - lastTapRef.current < 300 &&
      Math.abs(touch.clientX - touchStartRef.current.x) < 20 &&
      Math.abs(touch.clientY - touchStartRef.current.y) < 20

    if (isDoubleTap) {
      lastTapRef.current = 0
      if (lbScaleRef.current > 1) { resetLb() } else { lbScaleRef.current = 2.5; setLbScale(2.5) }
      return
    }
    lastTapRef.current = now

    if (lbScaleRef.current <= 1 && touchStartRef.current) {
      const dx = touch.clientX - touchStartRef.current.x
      const absDy = Math.abs(touch.clientY - touchStartRef.current.y)
      if (Math.abs(dx) > 50 && absDy < 100 && now - touchStartRef.current.t < 500) {
        if (dx < 0) setLightboxIdx(i => (i + 1) % product.photos.length)
        else setLightboxIdx(i => (i - 1 + product.photos.length) % product.photos.length)
        resetLb()
      }
    }
  }

  const finalPrice = calcPrice(product, selections)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const addToCart = () => {
    const optionLabel = (product.options || [])
      .map((og, gi) => {
        const vi = selections[gi] ?? 0
        return og.values[vi]?.label || ''
      })
      .filter(Boolean)
      .join(', ')

    const key = `${product.id}|${optionLabel}|${finalPrice}`
    setCart(prev => {
      const ex = prev.find(c => c.key === key)
      if (ex) return prev.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { key, product, optionLabel, finalPrice, qty: 1 }]
    })
    setAdded(true)
    setCartOpen(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const changeQty = (idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], qty: next[idx].qty + delta }
      if (next[idx].qty <= 0) next.splice(idx, 1)
      return next
    })
  }

  const hasPhotos = product.photos && product.photos.length > 0

  return (
    <>
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <CartSidebar
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onRemove={idx => setCart(prev => prev.filter((_, i) => i !== idx))}
        onClear={() => setCart([])}
        onOrderSuccess={() => setCart([])}
      />

      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div className="product-page-breadcrumb">
          <a href="/">Головна</a>
          <span>›</span>
          <a href={`/?cat=${product.cat}#catalog`}>{catLabel(product.cat)}</a>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        {/* Product section */}
        <section className="product-page-section">
          {/* Gallery */}
          <div className="product-page-gallery">
            <div
              className="ppg-main"
              onClick={() => { if (gallerySwipedRef.current) { gallerySwipedRef.current = false; return } if (hasPhotos) openLightbox(activePhoto) }}
              onTouchStart={onGalleryTouchStart}
              onTouchEnd={onGalleryTouchEnd}
            >
              {hasPhotos ? (
                <>
                  <img src={product.photos[activePhoto]} alt="" className="ppg-blur-bg" aria-hidden="true" />
                  <img src={product.photos[activePhoto]} alt={product.name} className="ppg-main-img" />
                </>
              ) : (
                <span style={{ fontSize: '8rem', opacity: .2 }}>{product.emoji || '🪵'}</span>
              )}
              {hasPhotos && product.photos.length > 1 && (
                <>
                  <button
                    className="ppg-arrow ppg-arrow-left"
                    onClick={e => { e.stopPropagation(); setActivePhoto(i => (i - 1 + product.photos.length) % product.photos.length) }}
                    aria-label="Попереднє фото"
                  >‹</button>
                  <button
                    className="ppg-arrow ppg-arrow-right"
                    onClick={e => { e.stopPropagation(); setActivePhoto(i => (i + 1) % product.photos.length) }}
                    aria-label="Наступне фото"
                  >›</button>
                </>
              )}
              {product.badge && (
                <span className={`product-badge ${getBadgeClass(product.badge)}`} style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  {getBadgeLabel(product.badge)}
                </span>
              )}
            </div>
            {hasPhotos && product.photos.length > 1 && (
              <div className="ppg-thumbs">
                {product.photos.map((url, i) => (
                  <button
                    key={i}
                    className={`ppg-thumb${i === activePhoto ? ' active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Фото ${i + 1}`}
                  >
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-page-info">
            <div className="pm-cat">{catLabel(product.cat)}</div>
            <h1 className="pm-name">{product.name}</h1>
            <p className="pm-desc">{product.desc}</p>

            {/* Rating */}
            <div className="pm-stars" aria-label={`Рейтинг ${product.rating} з 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`star${i < product.rating ? '' : ' empty'}`}>★</span>
              ))}
              <span style={{ marginLeft: '.5rem', color: 'var(--text-dim)', fontSize: '.82rem' }}>
                ({product.rating}.0/5)
              </span>
            </div>

            {/* Price */}
            <div className="pm-price-row" style={{ margin: '1.5rem 0' }}>
              <span className="pm-price">₴ {formatPrice(finalPrice)}</span>
              {product.oldPrice && (
                <span className="pm-old-price">₴ {formatPrice(product.oldPrice)}</span>
              )}
            </div>

            {/* Options */}
            {(product.options || []).length > 0 && (
              <div className="pm-options">
                {product.options.map((og, gi) => (
                  <div key={gi} className="pm-option-group">
                    <div className="pm-option-label">{og.name}</div>
                    <div className="pm-option-chips">
                      {og.values.map((v, vi) => (
                        <button
                          key={vi}
                          className={`pm-chip${og.type === 'color' ? ' color-chip' : ''}${(selections[gi] ?? 0) === vi ? ' selected' : ''}`}
                          style={og.type === 'color' && v.color ? { background: v.color } : undefined}
                          onClick={() => setSelections(prev => ({ ...prev, [gi]: vi }))}
                          title={og.type === 'color' ? v.label : undefined}
                        >
                          {og.type !== 'color' && (
                            <>
                              {v.label}
                              {v.price !== 0 && (
                                <span style={{ marginLeft: '.3rem', opacity: .7 }}>
                                  {v.price > 0 ? `+₴${formatPrice(v.price)}` : `-₴${formatPrice(Math.abs(v.price))}`}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantee badges */}
            <div className="product-page-badges">
              <span>🚚 Безкоштовна доставка</span>
              <span>🛡️ Гарантія 5 років</span>
              <span>🌿 Масив вільхи</span>
            </div>

            {/* Add to cart */}
            <button
              className={`pm-add-btn${added ? ' pm-add-btn--added' : ''}`}
              onClick={addToCart}
              style={{ marginTop: '1.5rem' }}
            >
              {added ? '✓ Додано до кошика!' : '🛒 Додати до кошика'}
            </button>

            {/* Consult CTA */}
            <a href="/#contact" className="product-page-consult-btn">
              Замовити консультацію →
            </a>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="section" style={{ background: 'var(--dark2)' }}>
            <div className="section-tag">Схожі товари</div>
            <h2 className="section-title">Також вам може сподобатись</h2>
            <div className="products-grid" style={{ marginTop: '2rem' }}>
              {related.map(p => (
                <a
                  key={p.id}
                  href={`/product/${slugify(p.name)}`}
                  className="product-card"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="product-img">
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt={p.name} loading="lazy" />
                      : <span className="product-emoji">{p.emoji || '🪵'}</span>}
                    {p.badge && (
                      <span className={`product-badge ${getBadgeClass(p.badge)}`}>{getBadgeLabel(p.badge)}</span>
                    )}
                  </div>
                  <div className="product-body">
                    <div className="product-cat">{catLabel(p.cat)}</div>
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-desc-short">{p.desc}</p>
                    <div className="product-bottom">
                      <div className="product-price">
                        від ₴ {formatPrice(p.price)}
                        {p.oldPrice && <span className="old">₴ {formatPrice(p.oldPrice)}</span>}
                      </div>
                      <div className="product-open-btn">Обрати →</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand"><LogoV1 height={68} /></div>
            <p className="footer-desc">Класичні меблі з різьбою на ЧПК. Масив вільхи, шпон МДФ та ДСП.</p>
          </div>
          <div>
            <div className="footer-heading">Каталог</div>
            <ul className="footer-links">
              <li><a href="/?cat=table#catalog">Столи</a></li>
              <li><a href="/?cat=chair#catalog">Крісла</a></li>
              <li><a href="/?cat=living#catalog">Вітальня</a></li>
              <li><a href="/?cat=bedroom#catalog">Спальні</a></li>
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
          <span>© 2024 Олійник Меблі</span>
          <div className="footer-socials">
            <a href="https://www.instagram.com/oliynyk_mebli" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
            <a href="https://t.me/oliynyk_mebli" target="_blank" rel="noopener" aria-label="Telegram">TG</a>
            <a href="https://www.facebook.com/oliynyk.mebli" target="_blank" rel="noopener" aria-label="Facebook">FB</a>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && hasPhotos && (
        <div
          className="lightbox-overlay"
          style={{ touchAction: 'none' }}
          onClick={() => { setLightboxOpen(false); resetLb() }}
          onTouchStart={onLbTouchStart}
          onTouchMove={onLbTouchMove}
          onTouchEnd={onLbTouchEnd}
        >
          <button className="lightbox-close" onClick={e => { e.stopPropagation(); setLightboxOpen(false); resetLb() }} aria-label="Закрити">✕</button>
          {product.photos.length > 1 && (
            <>
              <button
                className="lightbox-arrow lightbox-arrow-left"
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + product.photos.length) % product.photos.length); resetLb() }}
                aria-label="Попереднє фото"
              >‹</button>
              <button
                className="lightbox-arrow lightbox-arrow-right"
                onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % product.photos.length); resetLb() }}
                aria-label="Наступне фото"
              >›</button>
            </>
          )}
          <img
            className="lightbox-img"
            src={product.photos[lightboxIdx]}
            alt={product.name}
            onClick={e => e.stopPropagation()}
            style={{
              transform: `translate(${lbPos.x}px, ${lbPos.y}px) scale(${lbScale})`,
              transition: lbScale === 1 ? 'transform .25s' : 'none',
              cursor: lbScale > 1 ? 'move' : 'default',
            }}
          />
          <div className="lightbox-counter">
            {product.photos.length > 1 && `${lightboxIdx + 1} / ${product.photos.length}`}
            {product.photos.length > 1 && ' · '}
            {lbScale > 1 ? `${Math.round(lbScale * 100)}%` : 'Стисніть для збільшення'}
          </div>
        </div>
      )}
    </>
  )
}
