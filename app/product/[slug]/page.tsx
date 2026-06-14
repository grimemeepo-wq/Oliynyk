import { notFound } from 'next/navigation'
import { getAllProducts, getAllCategories } from '@/lib/db'
import { slugify, getBadgeClass, getBadgeLabel, formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import ProductPageClient from '@/components/ProductPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map(p => ({ slug: slugify(p.name) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const products = await getAllProducts()
  const product = products.find(p => slugify(p.name) === slug)
  if (!product) return { title: 'Товар не знайдено' }

  const catLabels: Record<string, string> = { table: 'Стіл', chair: 'Крісло', living: 'Меблі для вітальні', bedroom: 'Спальня' }
  const catLabel = catLabels[product.cat] || product.cat

  return {
    title: `${product.name} — ${catLabel} з різьбою ЧПК | Олійник Меблі`,
    description: `${product.desc}. Ціна від ₴${formatPrice(product.price)}. Гарантія 5 років. Доставка по Україні. Виготовлення 14–30 днів.`,
    openGraph: {
      title: `${product.name} | Олійник Меблі`,
      description: `${product.desc}. Ціна від ₴${formatPrice(product.price)}.`,
      images: product.photos?.[0] ? [{ url: product.photos[0], width: 800, height: 600 }] : [],
      type: 'website',
    },
    alternates: { canonical: `/product/${slug}` },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()])
  const product = products.find(p => slugify(p.name) === slug)
  if (!product) notFound()

  const related = products
    .filter(p => p.cat === product.cat && p.id !== product.id)
    .slice(0, 4)

  const catLabel2 = categories.find(c => c.slug === product.cat)?.label || product.cat
  const catUrl = `/?cat=${product.cat}#catalog`

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc,
    image: product.photos?.[0] || '',
    brand: { '@type': 'Brand', name: 'Олійник Меблі' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UAH',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Олійник Меблі' },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: 14,
      bestRating: 5,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://oliynyk-mebli.ua/' },
      { '@type': 'ListItem', position: 2, name: catLabel2, item: `https://oliynyk-mebli.ua${catUrl}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://oliynyk-mebli.ua/product/${slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductPageClient product={product} related={related} categories={categories} />
    </>
  )
}
