const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/posts-sitemap.xml',
    '/pages-sitemap.xml',
    '/*',
    '/posts/*',
    '/admin/*',
    '/api/*',
    '/next/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/*', '/api/*', '/next/*'],
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
  additionalPaths: async () => {
    return [
      { loc: '/players', changefreq: 'daily', priority: 0.8 },
      { loc: '/events', changefreq: 'daily', priority: 0.9 },
      { loc: '/news', changefreq: 'daily', priority: 0.8 },
      { loc: '/sponsors', changefreq: 'weekly', priority: 0.6 },
      { loc: '/register/sponsor', changefreq: 'monthly', priority: 0.5 },
    ]
  },
}
