import type { Block } from 'payload'

export const EventScheduleBlock: Block = {
  slug: 'eventScheduleBlock',
  interfaceName: 'EventScheduleBlock',
  labels: {
    singular: 'Event Schedule Block',
    plural: 'Event Schedule Blocks',
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
      defaultValue: 'Upcoming',
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
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      admin: {
        description: 'Number of events to display',
      },
    },
  ],
}
