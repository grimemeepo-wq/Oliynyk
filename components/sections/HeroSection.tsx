'use client'

import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface HeroProps {
  featured: Product | null
  onOpenProduct: (p: Product) => void
}

export default function HeroSection({ featured, onOpenProduct }: HeroProps) {
  const smoothTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="hero" id="home" aria-label="Головний банер">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-tag">
          <span className="tag-dot" aria-hidden="true" />
          Майстерня Олійник — з 2010 року
        </p>
        <h1>
          Класичні меблі<br />
          з різьбою на <span className="gold">ЧПК</span>
        </h1>
        <p className="hero-desc">
          Виготовляємо класичні меблі з масиву вільхи та шпонованого МДФ з різьбою на ЧПК-станках.
          Столи, крісла, спальні та вітальні — гарантія 5 років, доставка по всій Україні.
        </p>
        <div className="hero-actions">
          <a
            href="#catalog"
            className="btn-primary"
            onClick={e => { e.preventDefault(); smoothTo('catalog') }}
          >
            Переглянути каталог →
          </a>
          <a
            href="#contact"
            className="btn-secondary"
            onClick={e => { e.preventDefault(); smoothTo('contact') }}
          >
            Замовити консультацію
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div
          className="hero-card"
          style={featured ? { cursor: 'pointer' } : {}}
          onClick={() => featured && onOpenProduct(featured)}
        >
          <div className="hero-card-img">
            {featured?.photos?.length ? (
              <img
                src={featured.photos[0]}
                alt={featured.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            ) : (
              <span className="furniture-icon">🪑</span>
            )}
            <span className="hero-card-badge">Хіт продажу</span>
          </div>
          <div className="hero-card-body">
            <div className="hero-card-title">{featured?.name ?? 'Крісло «Едельвейс»'}</div>
            <div className="hero-card-price">
              ₴ {featured ? formatPrice(featured.price) : '12,800'}
            </div>
          </div>
        </div>
        <div className="float-stat s1">
          <div className="num">500+</div>
          <div className="lbl">Задоволених клієнтів</div>
        </div>
        <div className="float-stat s2">
          <div className="num">4.9★</div>
          <div className="lbl">Рейтинг якості</div>
        </div>
      </div>
    </section>
  )
}
