import type { Block } from 'payload'

export const SponsorTiersBlock: Block = {
  slug: 'sponsorTiersBlock',
  interfaceName: 'SponsorTiersBlock',
  labels: {
    singular: 'Sponsor Tiers Block',
    plural: 'Sponsor Tiers Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Partnership Opportunities',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Sponsorship',
    },
    {
      name: 'titleHighlight',
      type: 'text',
      defaultValue: 'Packages',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'tiers',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          admin: {
            description: 'e.g., "Rp 100.000.000"',
          },
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'benefits',
          type: 'array',
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
        },
      ],
    },
  ],
}
