import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Класичні меблі з різьбою на ЧПК — Олійник Меблі | Львів',
  description: 'Меблі з масиву вільхи та шпону з різьбою на ЧПК. Столи, крісла, спальні та вітальні. Майстерня Олійник Меблі, Львівська обл. Замовте безкоштовну 3D-візуалізацію!',
  keywords: 'класичні меблі, меблі з масиву, меблі Львів, різьба на ЧПК, меблі вільха',
  authors: [{ name: 'Олійник Меблі' }],
  metadataBase: new URL('https://oliynyk-mebli.ua'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Олійник Меблі',
    title: 'Класичні меблі з різьбою на ЧПК — Олійник Меблі',
    description: 'Меблі з масиву вільхи з різьбою на ЧПК. Майстерня на Львівщині з 2010 року. Гарантія 5 років.',
    url: 'https://oliynyk-mebli.ua',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Олійник Меблі' }],
    locale: 'uk_UA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Класичні меблі з різьбою на ЧПК — Олійник Меблі',
    description: 'Меблі з масиву вільхи та шпону. Різьба на ЧПК. Майстерня на Львівщині.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

const schema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness', 'FurnitureStore'],
  '@id': 'https://oliynyk-mebli.ua/#organization',
  name: 'Олійник Меблі',
  url: 'https://oliynyk-mebli.ua',
  description: 'Виробник класичних меблів з різьбою на ЧПК. Масив вільхи, шпонований МДФ та ДСП.',
  foundingDate: '2010',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'вул. Зарічна, 4',
    addressLocality: 'смт Красне',
    addressRegion: 'Львівська область',
    postalCode: '80561',
    addressCountry: 'UA',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 49.8961, longitude: 24.6227 },
  telephone: '+380671234567',
  email: 'info@oliynyk-mebli.ua',
  openingHours: 'Mo-Sa 09:00-19:00',
  priceRange: '₴₴',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127', bestRating: '5' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="geo.region" content="UA-46" />
        <meta name="geo.placename" content="Красне, Львівська область" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
