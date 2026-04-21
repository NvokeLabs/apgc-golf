import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import {
  revalidateSponsorAfterChange,
  revalidateSponsorAfterDelete,
} from './hooks/revalidateSponsor'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    name: true,
    slug: true,
    logo: true,
    tier: true,
    isActive: true,
    website: true,
    order: true,
  },
  admin: {
    defaultColumns: ['name', 'tier', 'isActive', 'order'],
    useAsTitle: 'name',
    group: 'Golf Content',
  },
  hooks: {
    afterChange: [revalidateSponsorAfterChange],
    afterDelete: [revalidateSponsorAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tier',
          type: 'relationship',
          relationTo: 'sponsorship-tiers',
          required: true,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: {
            width: '33%',
            description: 'Display order within tier (lower = first)',
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
      name: 'website',
      type: 'text',
      admin: {
        description: 'Company website URL',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief company description',
      },
    },
    {
      name: 'benefits',
      type: 'array',
      admin: {
        description: 'Sponsorship benefits received',
      },
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
