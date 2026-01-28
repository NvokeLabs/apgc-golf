import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateTierAfterChange, revalidateTierAfterDelete } from './hooks/revalidateTiers'

export const SponsorshipTiers: CollectionConfig = {
  slug: 'sponsorship-tiers',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'tierKey', 'price', 'order', 'isActive'],
    useAsTitle: 'name',
    group: 'Golf Content',
  },
  hooks: {
    afterChange: [revalidateTierAfterChange],
    afterDelete: [revalidateTierAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g., "Title Sponsor", "Platinum Partner")',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tierKey',
          type: 'select',
          required: true,
          options: [
            { label: 'Title Sponsor', value: 'title' },
            { label: 'Platinum Partner', value: 'platinum' },
            { label: 'Gold Partner', value: 'gold' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            width: '33%',
            description: 'Tier level for sorting',
          },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: {
            width: '33%',
            description: 'Display order (lower = first)',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '33%',
            description: 'Show on website',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'Display price (e.g., "Rp 500,000,000")',
          },
        },
        {
          name: 'priceNumeric',
          type: 'number',
          admin: {
            width: '50%',
            description: 'Numeric value for sorting/comparison',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief tier description',
      },
    },
    {
      name: 'benefits',
      type: 'array',
      admin: {
        description: 'List of benefits included in this tier',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'isHighlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show "Most Popular" badge',
      },
    },
  ],
}
