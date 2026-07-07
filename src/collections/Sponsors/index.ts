import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isRegistrationStaff } from '@/access/roles'
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
    hidden: ({ user }) => isRegistrationStaff(user),
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/SponsorsListView',
        },
      },
    },
  },
  hooks: {
    afterChange: [revalidateSponsorAfterChange],
    afterDelete: [revalidateSponsorAfterDelete],
  },
  fields: [
    // Sidebar — placement and visibility controls
    {
      name: 'tier',
      type: 'relationship',
      relationTo: 'sponsorship-tiers',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Sponsorship tier this sponsor belongs to',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order within tier (lower = first)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Show on website',
      },
    },
    // Main body
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          description: 'Sponsor profile shown on the public Sponsors page.',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Sponsor logo',
              },
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
          ],
        },
        {
          label: 'Benefits',
          description: 'Sponsorship benefits this sponsor receives.',
          fields: [
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
        },
      ],
    },
  ],
}
