import type { GlobalConfig } from 'payload'

import { revalidateHomePage } from './hooks/revalidateHomePage'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue: 'The 2025 Season Finale',
                  admin: {
                    description: 'Small text above the main title',
                  },
                },
                {
                  name: 'titleLine1',
                  type: 'text',
                  defaultValue: 'Legacy',
                  admin: {
                    description: 'First line of the hero title',
                  },
                },
                {
                  name: 'titleLine2',
                  type: 'text',
                  defaultValue: 'In The Making',
                  admin: {
                    description: 'Second line of the hero title (italic)',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Witness history at the legendary Cypress Point. Where masters of the craft compete for the ultimate glory.',
                  admin: {
                    description: 'Hero description text',
                  },
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Hero background image',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Featured Event Section',
          fields: [
            {
              name: 'featuredEventSection',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Featured Event',
                },
              ],
            },
          ],
        },
        {
          label: 'Upcoming Events Section',
          fields: [
            {
              name: 'upcomingEventsSection',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Upcoming Events',
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Tournament Schedule',
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Experience championship golf at the finest venues.',
                },
              ],
            },
          ],
        },
        {
          label: 'Broadcast Schedule',
          fields: [
            {
              name: 'broadcastSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Broadcast Schedule',
                },
                {
                  name: 'rounds',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'round',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'day',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'time',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'network',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'highlight',
                      type: 'text',
                      admin: {
                        description:
                          'Special note (e.g., "Opening Tee Shots", "Championship Trophy")',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Partners Section',
          fields: [
            {
              name: 'partnersSection',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Official Partners',
                },
              ],
            },
          ],
        },
        {
          label: 'Featured Players Section',
          fields: [
            {
              name: 'featuredPlayersSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Featured Players',
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Top contenders fighting for the championship title.',
                },
              ],
            },
          ],
        },
        {
          label: 'News Section',
          fields: [
            {
              name: 'newsSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Latest News',
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Updates from the green and behind the scenes.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHomePage],
  },
}
