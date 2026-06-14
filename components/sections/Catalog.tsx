'use client'

import { useRouter } from 'next/navigation'
import type { Product, CartItem, CategoryDef } from '@/lib/types'
import { getBadgeClass, getBadgeLabel, formatPrice, slugify } from '@/lib/utils'
import Link from 'next/link'

interface CatalogProps {
  products: Product[]
  onAddToCart: (item: Omit<CartItem, 'key'>) => void
  initialFilter?: string
  categories: CategoryDef[]
}

export default function Catalog({ products, onAddToCart, initialFilter = 'all', categories }: CatalogProps) {
  const router = useRouter()
  const filter = initialFilter

  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter)

  function handleTabClick(slug: string) {
    const url = slug === 'all' ? '/#catalog' : `/?cat=${slug}#catalog`
    router.push(url, { scroll: false })
    setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <>
      {/* Tabs */}
      <div className="products-tabs reveal" id="catalogTabs">
        {categories.map(cat => (
          <button
            key={cat.slug}
            className={`tab-btn${filter === cat.slug ? ' active' : ''}`}
            onClick={() => handleTabClick(cat.slug)}
            aria-pressed={filter === cat.slug}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="products-grid reveal">
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', padding: '2rem' }}>Товарів поки немає.</p>
        ) : (
          filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              catLabel={categories.find(c => c.slug === p.cat)?.label || p.cat}
            />
          ))
        )}
      </div>
    </>
  )
}

function ProductCard({ product: p, catLabel }: { product: Product; catLabel: string }) {
  const bc = getBadgeClass(p.badge)
  const bt = getBadgeLabel(p.badge)
  const photos = p.photos || []
  const slug = slugify(p.name)

  return (
    <Link
      href={`/product/${slug}`}
      className="product-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={p.name} />
      <meta itemProp="description" content={p.desc} />

      <div className="product-img">
        {photos.length ? (
          <img
            src={photos[0]}
            alt={`${p.name} — класичні меблі з різьбою на ЧПК від Олійник Меблі`}
            loading="lazy"
            width={300}
            height={280}
          />
        ) : (
          <span className="product-emoji" aria-hidden="true">{p.emoji || '🪵'}</span>
        )}
        {p.badge && <span className={`product-badge ${bc}`}>{bt}</span>}
      </div>

      <div className="product-body">
        <div className="product-cat">{catLabel}</div>
        <h3 className="product-name">{p.name}</h3>
        <p className="product-desc-short">{p.desc}</p>
        <div
          className="product-rating"
          aria-label={`Рейтинг ${p.rating} з 5`}
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
        >
          <meta itemProp="ratingValue" content={String(p.rating)} />
          <meta itemProp="bestRating" content="5" />
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`star${i < p.rating ? '' : ' empty'}`} aria-hidden="true">★</span>
          ))}
        </div>
        <div
          className="product-bottom"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <meta itemProp="priceCurrency" content="UAH" />
          <div className="product-price">
            від{' '}
            <span itemProp="price" content={String(p.price)}>
              ₴ {formatPrice(p.price)}
            </span>
            {p.oldPrice && <span className="old">₴ {formatPrice(p.oldPrice)}</span>}
          </div>
          <div className="product-open-btn">Обрати →</div>
        </div>
      </div>
    </Link>
  )
}
