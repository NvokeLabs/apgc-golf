import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Events } from './collections/Events'
import { EventRegistrations } from './collections/EventRegistrations'
import { Media } from './collections/Media'
import { News } from './collections/News'
import { Pages } from './collections/Pages'
import { Players } from './collections/Players'
import { Posts } from './collections/Posts'
import { Sponsors } from './collections/Sponsors'
import { SponsorRegistrations } from './collections/SponsorRegistrations'
import { SponsorshipTiers } from './collections/SponsorshipTiers'
import { Tickets } from './collections/Tickets'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { FormContent } from './FormContent/config'
import { Header } from './Header/config'
import { HomePage } from './HomePage/config'
import { SiteLabels } from './SiteLabels/config'
import { SponsorsPage } from './SponsorsPage/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      title: 'APGC Golf Admin',
      description: 'Manage your golf events, players, and sponsors',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon.ico',
        },
      ],
    },
    components: {
      Nav: '@/components/admin/Nav',
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Logo',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    defaultFromName: 'APGC Golf',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  collections: [
    // Content
    Pages,
    Posts,
    // Golf Content
    Players,
    Events,
    News,
    Sponsors,
    SponsorshipTiers,
    // Registrations
    EventRegistrations,
    SponsorRegistrations,
    Tickets,
    // System
    Media,
    Categories,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteLabels, HomePage, SponsorsPage, FormContent],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const endpoint = process.env.SUPABASE_STORAGE_ENDPOINT || ''
            const publicBase = endpoint.replace(
              /\.storage\.supabase\.co\/storage\/v1\/s3\/?$/,
              '.supabase.co/storage/v1/object/public',
            )
            const bucket = process.env.SUPABASE_STORAGE_BUCKET_NAME || ''
            const key = prefix ? `${prefix}/${filename}` : filename
            return `${publicBase}/${bucket}/${key}`
          },
        },
      },
      bucket: process.env.SUPABASE_STORAGE_BUCKET_NAME || '',
      config: {
        endpoint: process.env.SUPABASE_STORAGE_ENDPOINT,
        region: process.env.SUPABASE_STORAGE_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY || '',
          secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
