import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isRegistrationStaff } from '@/access/roles'

/**
 * Private payment-transfer proofs (Story 0).
 *
 * Unlike `media` (public bucket, `disablePayloadAccessControl: true`, public
 * URLs), proofs hold financial PII and must NOT be world-readable. Access
 * control is ON for every operation, so files are only ever served through
 * Payload's authenticated route — never a guessable public URL. The S3 adapter
 * (see payload.config.ts) stores the bytes in the PRIVATE `proofs` bucket.
 *
 * Registrant uploads happen from an unauthenticated context, so the public
 * upload action (Story 6) creates proof docs server-side with `overrideAccess`;
 * the collection itself stays locked to authenticated admins.
 */
export const Proofs: CollectionConfig = {
  slug: 'proofs',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Registrations',
    description: 'Private payment-transfer proofs. Not publicly accessible.',
    defaultColumns: ['filename', 'registration', 'createdAt'],
    hidden: ({ user }) => isRegistrationStaff(user),
  },
  fields: [
    {
      name: 'registration',
      type: 'relationship',
      relationTo: 'event-registrations',
      admin: {
        description: 'Registration this transfer proof belongs to',
      },
    },
  ],
  upload: {
    // Bytes are stored in the private `proofs` S3 bucket by the s3Storage
    // adapter (disableLocalStorage is set by the plugin). Mirror the bucket's
    // MIME allow-list so invalid types are rejected before they reach storage.
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
}
