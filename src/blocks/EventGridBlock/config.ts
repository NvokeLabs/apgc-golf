import type { Block } from 'payload'

export const EventGridBlock: Block = {
  slug: 'eventGridBlock',
  interfaceName: 'EventGridBlock',
  labels: {
    singular: 'Event Grid Block',
    plural: 'Event Grid Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Tournament Calendar',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'All',
    },
    {
      name: 'titleHighlight',
      type: 'text',
      defaultValue: 'Events',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'showFilters',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 9,
      admin: {
        description: 'Number of events to display per page',
      },
    },
  ],
}
