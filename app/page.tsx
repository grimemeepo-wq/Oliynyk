import { getAllProducts, getAllCategories } from '@/lib/db'
import ShopClient from '@/components/ShopClient'
import type { Metadata } from 'next'
import { slugify } from '@/lib/utils'
import type { Category } from '@/lib/types'

// ─── Per-category SEO metadata ────────────────────────────────────────────────
const CAT_META: Record<string, { title: string; description: string; canonical: string }> = {
  table: {
    title: 'Столи з масиву вільхи та різьбою ЧПК — Олійник Меблі | Львів',
    description: 'Класичні столи з масиву вільхи та шпону з різьбою на ЧПК. Обідні, письмові, журнальні. Майстерня Олійник Меблі, Львівська обл. Гарантія 5 років.',
    canonical: '/?cat=table',
  },
  chair: {
    title: 'Крісла з різьбою ЧПК — класичні меблі | Олійник Меблі | Львів',
    description: 'Класичні крісла з масиву вільхи та різьбою на ЧПК. Вітальні, обідні, офісні. Індивідуальні розміри. Майстерня Олійник Меблі. Гарантія 5 років.',
    canonical: '/?cat=chair',
  },
  living: {
    title: 'Меблі для вітальні з різьбою ЧПК | Олійник Меблі | Львів',
    description: 'Класичні меблі для вітальні з масиву вільхи з різьбою на ЧПК: тумби, серванти, комоди. Індивідуальне виготовлення. Майстерня Олійник Меблі.',
    canonical: '/?cat=living',
  },
  bedroom: {
    title: 'Спальні гарнітури з масиву вільхи та різьбою ЧПК | Олійник Меблі',
    description: 'Класичні спальні гарнітури з масиву вільхи та шпону з різьбою на ЧПК. Ліжка, шафи-купе, тумбочки. Виготовлення під розміри. Олійник Меблі.',
    canonical: '/?cat=bedroom',
  },
}

const DEFAULT_META = {
  title: 'Класичні меблі з різьбою на ЧПК — Олійник Меблі | Львів',
  description: 'Меблі з масиву вільхи та шпону з різьбою на ЧПК. Столи, крісла, спальні та вітальні. Майстерня Олійник Меблі, Львівська обл. Замовте безкоштовну 3D-візуалізацію!',
  canonical: '/',
}

interface Props {
  searchParams: Promise<{ cat?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat } = await searchParams
  const m = (cat && CAT_META[cat]) ? CAT_META[cat] : DEFAULT_META

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.canonical },
  }
}

// Generate Product ItemList schema on the server
function buildProductSchema(products: Awaited<ReturnType<typeof getAllProducts>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Каталог класичних меблів Олійник',
    itemListElement: products.slice(0, 12).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        '@id': `https://oliynyk-mebli.ua/product/${slugify(p.name)}`,
        name: p.name,
        description: p.desc,
        url: `https://oliynyk-mebli.ua/product/${slugify(p.name)}`,
        brand: { '@type': 'Brand', name: 'Олійник Меблі' },
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'UAH',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: p.rating,
          reviewCount: 12,
          bestRating: 5,
        },
      },
    })),
  }
}

// Server Component — fetches data at request time
export default async function HomePage({ searchParams }: Props) {
  const { cat } = await searchParams
  const validCats: Category[] = ['all', 'table', 'chair', 'living', 'bedroom']
  const initialCat: Category = (cat && validCats.includes(cat as Category)) ? cat as Category : 'all'

  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()])
  const schema = buildProductSchema(products)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ShopClient products={products} initialCat={initialCat} categories={categories} />
    </>
  )
}
