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
    defaultColumns: ['name', 'price', 'logoSize', 'order', 'isActive'],
    useAsTitle: 'name',
    group: 'Golf Content',
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/SponsorshipTiersListView',
        },
      },
    },
  },
  hooks: {
    afterChange: [revalidateTierAfterChange],
    afterDelete: [revalidateTierAfterDelete],
  },
  fields: [
    // Sidebar — display controls and pricing
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order (lower = first)',
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
    {
      name: 'isHighlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show "Most Popular" badge',
      },
    },
    {
      name: 'price',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Display price (e.g., "Rp 500,000,000")',
      },
    },
    {
      name: 'priceNumeric',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Numeric value for sorting/comparison',
      },
    },
    {
      name: 'logoSize',
      type: 'select',
      required: true,
      defaultValue: 'sm',
      options: [
        { label: 'Extra Large (top/hero row)', value: 'xl' },
        { label: 'Large', value: 'lg' },
        { label: 'Medium', value: 'md' },
        { label: 'Small', value: 'sm' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Controls how big sponsor logos are displayed on the public Sponsors page. Bigger = more prominent.',
      },
    },
    // Main body
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g., "Title Sponsor", "Platinum Partner")',
      },
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
  ],
}
