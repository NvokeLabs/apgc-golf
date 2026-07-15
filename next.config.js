import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const SUPABASE_STORAGE_ENDPOINT = process.env.SUPABASE_STORAGE_ENDPOINT
const supabaseImagePatterns = SUPABASE_STORAGE_ENDPOINT
  ? (() => {
      const s3Host = new URL(SUPABASE_STORAGE_ENDPOINT).hostname
      const publicHost = s3Host.replace('.storage.supabase.co', '.supabase.co')
      return [
        { hostname: publicHost, protocol: 'https' },
        { hostname: s3Host, protocol: 'https' },
      ]
    })()
  : []

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
      ...supabaseImagePatterns,
    ],
    // Image optimization settings
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  // The ticket artwork is read at runtime via process.cwd(), which @vercel/nft
  // cannot statically trace — so every serverless bundle that renders a ticket
  // PDF must be told to ship the jpg. TicketPDF is imported by the on-demand
  // download route AND transitively by both ticket-issuance paths
  // (manual-transfers/approve and payments/webhook via issueTicketForRegistration).
  // Top-level (Next 15 promoted this out of `experimental`).
  outputFileTracingIncludes: {
    '/api/tickets/[id]/pdf': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    '/api/manual-transfers/approve': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    '/api/payments/webhook': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
    '/api/sponsor-tickets': ['./src/components/TicketPDF/assets/ticket-bg.jpg'],
  },
  experimental: {
    // Proof uploads (Story 6) post through a Server Action; Next's default body
    // limit is 1MB, which would reject the advertised 10MB receipts before our
    // own validation runs. Allow headroom for multipart overhead.
    serverActions: {
      bodySizeLimit: '11mb',
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
