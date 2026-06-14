'use client'

import React, { useState, useCallback, useEffect } from 'react'
import type { Product, CartItem, Category, CategoryDef } from '@/lib/types'
import Navbar from '@/components/ui/Navbar'
import CartSidebar from '@/components/ui/CartSidebar'
import LogoV1 from '@/components/logos/LogoV1'
import HeroSection from '@/components/sections/HeroSection'
import Catalog from '@/components/sections/Catalog'
import ProductModal from '@/components/ui/ProductModal'
import ReviewsCarousel from '@/components/sections/ReviewsCarousel'
import ContactForm from '@/components/sections/ContactForm'
import RevealInit from '@/components/sections/RevealInit'

const CART_KEY = 'oliynyk-cart'

interface ShopClientProps {
  products: Product[]
  initialCat?: string
  categories: CategoryDef[]
}

export default function ShopClient({ products, initialCat, categories }: ShopClientProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [heroModal, setHeroModal] = useState<Product | null>(null)

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

  const featured = products.find(p => p.featured) ?? null

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
      <RevealInit />

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

      {/* Hero modal (for featured product card click) */}
      <ProductModal
        product={heroModal}
        onClose={() => setHeroModal(null)}
        onAddToCart={addToCart}
      />

      <main id="main-content">
        {/* HERO */}
        <HeroSection
          featured={featured}
          onOpenProduct={p => setHeroModal(p)}
        />

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {/* 4× repeated so the seamless loop works at any viewport width */}
            {[0,1,2,3].map(i => (
              <React.Fragment key={i}>
                <span className="marquee-item"><span className="sep" />Різьба на ЧПК</span>
                <span className="marquee-item"><span className="sep" />Масив вільхи</span>
                <span className="marquee-item"><span className="sep" />Шпонований МДФ</span>
                <span className="marquee-item"><span className="sep" />Шпонований ДСП</span>
                <span className="marquee-item"><span className="sep" />Преміум меблі</span>
                <span className="marquee-item"><span className="sep" />Гарантія 5 років</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="section" id="features" aria-labelledby="features-title">
          <div className="reveal">
            <div className="section-tag">Чому ми</div>
            <h2 className="section-title" id="features-title">Переваги Олійник Меблі</h2>
            <p className="section-desc">
              Точна різьба на ЧПК-верстатах, натуральні матеріали та класичний стиль — у кожному виробі
            </p>
          </div>
          <div className="features reveal">
            {[
              { icon: '⚙️', title: 'Різьба на ЧПК-верстатах', text: 'Точна фрезерна різьба на верстатах з ЧПК. Ідеальна геометрія орнаменту та повторюваність деталей.' },
              { icon: '🌿', title: 'Масив вільхи', text: 'Екологічно чиста деревина вільхи — тепла на дотик, міцна, з рівномірною текстурою.' },
              { icon: '🪵', title: 'Шпонований МДФ та ДСП', text: 'Натуральний шпон на МДФ та ДСП — естетика масивного дерева за доступнішою ціною.' },
              { icon: '🚚', title: 'Доставка по Україні', text: 'Безкоштовна доставка та збірка по всій Україні включені у вартість.' },
              { icon: '🎨', title: 'Меблі під індивідуальні розміри', text: 'Виготовляємо під ваші точні розміри. Безкоштовна 3D-візуалізація перед виробництвом.' },
              { icon: '🛡️', title: 'Гарантія 5 років', text: 'Розширена гарантія та безкоштовне сервісне обслуговування протягом 5 років.' },
            ].map(f => (
              <article className="feature-card" key={f.title}>
                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CATALOG */}
        <section className="section" id="catalog" style={{ background: 'var(--dark2)' }} aria-labelledby="catalog-title">
          <div className="reveal">
            <div className="section-tag">Каталог</div>
            <h2 className="section-title" id="catalog-title">Каталог класичних меблів</h2>
            <p className="section-desc">Класичні меблі з масиву вільхи та шпону з різьбою на ЧПК для кожної кімнати</p>
          </div>
          <Catalog products={products} onAddToCart={addToCart} initialFilter={initialCat} categories={categories} />
        </section>

        {/* ABOUT */}
        <section className="section" id="about" aria-labelledby="about-title">
          <div className="reveal">
            <div className="section-tag">Про нас</div>
            <h2 className="section-title" id="about-title">Майстерня Олійник Меблі — 14 років на ринку</h2>
          </div>
          <div className="about-grid reveal">
            <div className="about-text">
              <p>Компанія «Олійник Меблі» заснована у 2010 році в Львівській області. Ми спеціалізуємось на виготовленні <strong>класичних меблів з різьбою на ЧПК-станках</strong>.</p>
              <p>Використовуємо <strong>масив вільхи</strong>, шпонований МДФ та шпонований ДСП. Це поєднує красу класичних форм з довговічністю та доступною ціною.</p>
              <p>Кожен виріб проходить ретельний контроль якості. <a href="#contact" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}>Замовте зараз</a> і отримайте безкоштовну 3D-візуалізацію.</p>
            </div>
            <div className="stats-grid">
              {[['14+','Років досвіду'],['2800+','Виготовлених виробів'],['500+','Задоволених клієнтів'],['30+','Майстрів у команді']].map(([n,l]) => (
                <div className="stat-card" key={l}>
                  <div className="stat-num">{n}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="section" style={{ background: 'var(--dark2)' }} aria-labelledby="process-title">
          <div className="reveal">
            <div className="section-tag">Як це працює</div>
            <h2 className="section-title" id="process-title">Від ідеї до готових меблів</h2>
          </div>
          <ol className="process-steps reveal">
            {[
              ['01','Безкоштовна консультація','Обговорюємо стиль, розміри та бюджет. Підбираємо матеріал — масив вільхи або шпон.'],
              ['02','3D-проєкт безкоштовно','Розробляємо 3D-візуалізацію з орнаментами різьби ЧПК до початку виробництва.'],
              ['03','Виготовлення 14–30 днів','Фрезеруємо різьбу на ЧПК-станках. Складання та оздоблення вручну.'],
              ['04','Доставка та збірка','Безкоштовна доставка та збірка по всій Україні. Гарантія 5 років.'],
            ].map(([n,t,d]) => (
              <li className="step" key={n}>
                <div className="step-num" aria-hidden="true">{n}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* REVIEWS */}
        <ReviewsCarousel />

        {/* CTA BANNER */}
        <div className="cta-banner reveal">
          <div className="cta-banner-bg" aria-hidden="true" />
          <h2>Готові створити меблі мрії?</h2>
          <p>Безкоштовна консультація та 3D-візуалізація вашого проєкту</p>
          <a
            href="#contact"
            className="btn-primary"
            onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
          >
            Замовити консультацію →
          </a>
        </div>

        {/* CONTACT */}
        <section className="section" id="contact" aria-labelledby="contact-title">
          <div className="reveal">
            <div className="section-tag">Контакти</div>
            <h2 className="section-title" id="contact-title">Замовити класичні меблі у Львові</h2>
            <p className="section-desc">Залиште заявку — зв&apos;яжемося протягом 30 хвилин та надамо безкоштовну консультацію</p>
          </div>
          <div className="contact-grid reveal">
            <address className="contact-info">
              {[
                { icon:'📍', label:'Шоурум', value:'Львівська обл., смт Красне, вул. Зарічна 4' },
                { icon:'📞', label:'Телефон', value:'+380 (67) 123-45-67', href:'tel:+380671234567' },
                { icon:'✉️', label:'Email', value:'info@oliynyk-mebli.ua', href:'mailto:info@oliynyk-mebli.ua' },
                { icon:'🕐', label:'Графік роботи', value:'Пн–Сб: 09:00 – 19:00' },
              ].map(c => (
                <div className="contact-card" key={c.label}>
                  <div className="contact-icon" aria-hidden="true">{c.icon}</div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-value">
                      {c.href ? <a href={c.href}>{c.value}</a> : c.value}
                    </div>
                  </div>
                </div>
              ))}
            </address>
            <ContactForm />
          </div>
          <div className="google-map-wrap reveal">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d652.9!2d24.6227!3d49.8961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473251f5a8c90001%3A0x1!2z0LLRg9C70LjRhtGPINCX0LDRgNGW0YfQvdCwIDQsINCz0LrRgiDQmtGA0LDRgdC90LUsINCb0LLRltCy0YHRjNC60LAg0L7QsdC7Liwg0KPQutGA0LDRl9C90LA!5e0!3m2!1suk!2sua!4v1700000000001!5m2!1suk!2sua"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Олійник Меблі — Шоурум"
            />
          </div>
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
              {[['Столи з масиву','table'],['Крісла з різьбою','chair'],['Меблі у вітальню','living'],['Спальні гарнітури','bedroom']].map(([l,cat]) => (
                <li key={l}><a href={`/?cat=${cat}#catalog`}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-heading">Компанія</div>
            <ul className="footer-links">
              {[['Про нас','about'],['Відгуки клієнтів','reviews'],['Контакти та шоурум','contact']].map(([l,id]) => (
                <li key={l}><a href={`#${id}`} onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }}>{l}</a></li>
              ))}
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
