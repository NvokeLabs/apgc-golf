import type { Block } from 'payload'

export const FeaturedPlayersBlock: Block = {
  slug: 'featuredPlayersBlock',
  interfaceName: 'FeaturedPlayersBlock',
  labels: {
    singular: 'Featured Players Block',
    plural: 'Featured Players Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Our Champions',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Featured',
    },
    {
      name: 'titleHighlight',
      type: 'text',
      defaultValue: 'Players',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      admin: {
        description: 'Number of featured players to display',
      },
    },
  ],
}
