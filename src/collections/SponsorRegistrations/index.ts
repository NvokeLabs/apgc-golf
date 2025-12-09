import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const SponsorRegistrations: CollectionConfig = {
  slug: 'sponsor-registrations',
  access: {
    create: anyone, // Allow public form submissions
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['companyName', 'contactName', 'selectedTier', 'status', 'createdAt'],
    useAsTitle: 'companyName',
    group: 'Registrations',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'companyName',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'contactName',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'selectedTier',
          type: 'select',
          required: true,
          options: [
            { label: 'Title Sponsor - $2,000,000', value: 'title' },
            { label: 'Platinum Partner - $750,000', value: 'platinum' },
            { label: 'Gold Partner - $250,000', value: 'gold' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Approved', value: 'approved' },
            { label: 'Declined', value: 'declined' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        description: 'Additional information or questions',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Company website',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to applicant)',
      },
    },
  ],
}
