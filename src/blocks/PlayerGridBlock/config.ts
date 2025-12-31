import type { Block } from 'payload'

export const PlayerGridBlock: Block = {
  slug: 'playerGridBlock',
  interfaceName: 'PlayerGridBlock',
  labels: {
    singular: 'Player Grid Block',
    plural: 'Player Grid Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Member Directory',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Our',
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
      name: 'showSearch',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showFilters',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 12,
      admin: {
        description: 'Number of players to display per page',
      },
    },
  ],
}
