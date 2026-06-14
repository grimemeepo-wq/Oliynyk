'use client'

import { useState, useEffect, useRef } from 'react'
import type { Product, CartItem } from '@/lib/types'
import { calcPrice, getBadgeClass, getBadgeLabel, formatPrice } from '@/lib/utils'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (item: Omit<CartItem, 'key'>) => void
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selections, setSelections] = useState<Record<number, number>>({})
  const [photoIdx, setPhotoIdx] = useState(0)
  const modalTouchRef = useRef<number | null>(null)

  function onModalTouchStart(e: React.TouchEvent) {
    modalTouchRef.current = e.touches[0].clientX
  }
  function onModalTouchEnd(e: React.TouchEvent) {
    if (modalTouchRef.current === null) return
    const dx = e.changedTouches[0].clientX - modalTouchRef.current
    modalTouchRef.current = null
    const total = photos.length
    if (Math.abs(dx) > 45 && total > 1) {
      setPhotoIdx(i => dx < 0 ? (i + 1) % total : (i - 1 + total) % total)
    }
  }

  useEffect(() => {
    if (!product) return
    setPhotoIdx(0)
    const init: Record<number, number> = {}
    product.options.forEach((_, i) => { init[i] = 0 })
    setSelections(init)
  }, [product])

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [product])

  if (!product) return null

  const price = calcPrice(product, selections)
  const photos = product.photos || []
  const bc = getBadgeClass(product.badge)
  const bt = getBadgeLabel(product.badge)
  const catLabels: Record<string, string> = {
    table: 'Столи', chair: 'Крісла', living: 'Меблі у вітальню', bedroom: 'Спальні'
  }

  const handleAdd = () => {
    const selLabels = product.options.map((og, gi) => {
      const vi = selections[gi] ?? 0
      return og.values[vi]?.label || ''
    }).filter(Boolean).join(', ')

    onAddToCart({ product, optionLabel: selLabels, finalPrice: price, qty: 1 })
    onClose()
  }

  return (
    <div
      className="product-modal-overlay open"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="product-modal">
        <div className="pm-grid">
          {/* Gallery */}
          <div className="pm-gallery" onTouchStart={onModalTouchStart} onTouchEnd={onModalTouchEnd}>
            <div className="pm-close" onClick={onClose}>✕</div>
            {photos.length ? (
              <>
                <img src={photos[photoIdx]} alt="" className="pm-blur-bg" aria-hidden="true" />
                <img className="pm-main-img" src={photos[photoIdx]} alt={product.name} />
                {photos.length > 1 && (
                  <>
                    <button
                      className="pm-arrow pm-arrow-left"
                      onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                      aria-label="Попереднє фото"
                    >‹</button>
                    <button
                      className="pm-arrow pm-arrow-right"
                      onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                      aria-label="Наступне фото"
                    >›</button>
                    <div className="pm-thumbs">
                      {photos.map((src, i) => (
                        <div
                          key={i}
                          className={`pm-thumb${i === photoIdx ? ' active' : ''}`}
                          onClick={() => setPhotoIdx(i)}
                        >
                          <img src={src} alt="" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="pm-gallery-emoji">{product.emoji || '🪵'}</span>
            )}
            {product.badge && (
              <span className={`pm-gallery-badge ${bc}`}>{bt}</span>
            )}
          </div>

          {/* Info */}
          <div className="pm-info">
            <div className="pm-cat">{catLabels[product.cat] || product.cat}</div>
            <div className="pm-name">{product.name}</div>
            <div className="pm-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`star${i < product.rating ? '' : ' empty'}`}>★</span>
              ))}
            </div>
            <div className="pm-desc">{product.desc}</div>
            <div className="pm-price-row">
              <div className="pm-price">₴ {formatPrice(price)}</div>
              {product.oldPrice && (
                <div className="pm-old-price">₴ {formatPrice(product.oldPrice)}</div>
              )}
            </div>

            {product.options.length > 0 && (
              <>
                <div className="pm-options">
                  {product.options.map((og, gi) => (
                    <div className="pm-option-group" key={gi}>
                      <div className="pm-option-label">{og.name}</div>
                      <div className="pm-option-chips">
                        {og.values.map((v, vi) => {
                          const pd = v.price || 0
                          const pt = pd > 0 ? ` (+${formatPrice(pd)} ₴)` : pd < 0 ? ` (${formatPrice(pd)} ₴)` : ''
                          const selected = (selections[gi] ?? 0) === vi
                          if (v.color) {
                            return (
                              <div
                                key={vi}
                                className={`pm-chip color-chip${selected ? ' selected' : ''}`}
                                style={{ background: v.color }}
                                title={`${v.label}${pt}`}
                                onClick={() => setSelections(s => ({ ...s, [gi]: vi }))}
                              />
                            )
                          }
                          return (
                            <div
                              key={vi}
                              className={`pm-chip${selected ? ' selected' : ''}`}
                              onClick={() => setSelections(s => ({ ...s, [gi]: vi }))}
                            >
                              {v.label}
                              {pt && <span style={{ fontSize: '.7rem', opacity: .7 }}> {pt}</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pm-price-note">* Ціна змінюється залежно від обраних параметрів</div>
              </>
            )}

            <button className="pm-add-btn" onClick={handleAdd}>
              Додати в кошик →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
