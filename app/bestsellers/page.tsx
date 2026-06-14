import { getAllProducts } from '@/lib/db'
import { slugify, formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import BestsellersClient from '@/components/BestsellersClient'

export const metadata: Metadata = {
  title: 'Хіт продажу — найпопулярніші меблі | Олійник Меблі',
  description: 'Найпопулярніші класичні меблі з різьбою на ЧПК від Олійник Меблі. Столи, крісла, спальні та вітальні — хіти продажу з масиву вільхи та шпону.',
  alternates: { canonical: '/bestsellers' },
  openGraph: {
    title: 'Хіт продажу — Олійник Меблі',
    description: 'Найпопулярніші класичні меблі з різьбою на ЧПК. Хіти продажу від майстерні Олійник Меблі.',
    type: 'website',
  },
}

export default async function BestsellersPage() {
  const products = await getAllProducts()
  const hits = products.filter(p => p.hit)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Хіт продажу — Олійник Меблі',
    itemListElement: hits.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        url: `https://oliynyk-mebli.ua/product/${slugify(p.name)}`,
        offers: { '@type': 'Offer', price: p.price, priceCurrency: 'UAH' },
      },
    })),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://oliynyk-mebli.ua/' },
      { '@type': 'ListItem', position: 2, name: 'Хіт продажу', item: 'https://oliynyk-mebli.ua/bestsellers' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <BestsellersClient hits={hits} totalCount={products.length} />
    </>
  )
}
