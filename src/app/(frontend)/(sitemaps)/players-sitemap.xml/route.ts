import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPlayersSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'players',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    return results.docs
      .filter((doc) => Boolean(doc?.slug))
      .map((doc) => ({
        loc: `${SITE_URL}/players/${doc.slug}`,
        lastmod: doc.updatedAt || dateFallback,
      }))
  },
  ['players-sitemap'],
  {
    tags: ['players-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPlayersSitemap()

  return getServerSideSitemap(sitemap)
}
