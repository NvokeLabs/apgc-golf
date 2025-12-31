import type { Event, Sponsor } from '@/payload-types'

export function generateEventJsonLd(event: Event) {
  const imageUrl = typeof event.image === 'object' && event.image?.url ? event.image.url : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    description:
      typeof event.description === 'object'
        ? 'Golf tournament event'
        : event.description || 'Golf tournament event',
    startDate: event.date,
    endDate: event.endDate || event.date,
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location,
        addressCountry: 'ID',
      },
    },
    image: imageUrl,
    organizer: {
      '@type': 'Organization',
      name: 'APGC Golf',
      url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://apgc.golf',
    },
    eventStatus:
      event.status === 'completed'
        ? 'https://schema.org/EventCompleted'
        : event.status === 'sold-out'
          ? 'https://schema.org/EventMovedOnline'
          : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    offers: event.price
      ? {
          '@type': 'Offer',
          price: event.price,
          priceCurrency: 'IDR',
          availability:
            event.status === 'open'
              ? 'https://schema.org/InStock'
              : event.status === 'sold-out'
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/PreOrder',
          url: `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/register/event/${event.slug}`,
        }
      : undefined,
  }
}

export function generateOrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://apgc.golf'

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'APGC Golf',
    alternateName: 'Alumni Professional Golf Club',
    url: siteUrl,
    logo: `${siteUrl}/apgc-logo.png`,
    description:
      'APGC Golf is a premier golf organization bringing together alumni golfers for competitive tournaments and community events.',
    sport: 'Golf',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ID',
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Indonesian'],
    },
  }
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateArticleJsonLd(article: {
  title: string
  subtitle?: string | null
  publishedDate?: string | null
  author?: string
  imageUrl?: string
  slug?: string | null
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://apgc.golf'

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.subtitle || article.title,
    datePublished: article.publishedDate,
    dateModified: article.publishedDate,
    author: {
      '@type': 'Person',
      name: article.author || 'APGC Staff',
    },
    publisher: {
      '@type': 'Organization',
      name: 'APGC Golf',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/apgc-logo.png`,
      },
    },
    image: article.imageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/news/${article.slug}`,
    },
  }
}
