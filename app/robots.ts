import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin1', '/api/'] },
    ],
    sitemap: 'https://oliynyk-mebli.ua/sitemap.xml',
  }
}
