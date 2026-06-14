import type { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/db'
import { slugify } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://oliynyk-mebli.ua'
  const today = new Date().toISOString()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: today, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/?cat=table`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/?cat=chair`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/?cat=living`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/?cat=bedroom`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/#about`, lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/#reviews`, lastModified: today, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/#contact`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await getAllProducts()
    productRoutes = products.map(p => ({
      url: `${BASE}/product/${slugify(p.name)}`,
      lastModified: today,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB not ready yet during build — skip product routes
  }

  return [...staticRoutes, ...productRoutes]
}
