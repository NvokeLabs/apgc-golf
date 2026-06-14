import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateEventAfterChange, revalidateEventAfterDelete } from './hooks/revalidateEvent'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    date: true,
    location: true,
    status: true,
    tier: true,
    image: true,
  },
  admin: {
    defaultColumns: ['title', 'date', 'tier', 'status'],
    useAsTitle: 'title',
    group: 'Golf Content',
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/EventsListView',
        },
      },
    },
  },
  hooks: {
    afterChange: [revalidateEventAfterChange],
    afterDelete: [revalidateEventAfterDelete],
  },
  fields: [
    // Sidebar — scheduling, classification, and control fields
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Event start date and time',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'For multi-day events',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: [
        { label: 'Major', value: 'major' },
        { label: 'Championship', value: 'championship' },
        { label: 'Qualifier', value: 'qualifier' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Event classification level',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'upcoming',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Open', value: 'open' },
        { label: 'Sold Out', value: 'sold-out' },
        { label: 'Closed', value: 'closed' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Registration / lifecycle status',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature in hero section',
      },
    },
    // Main body
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          description: 'Core event information shown on the public event page.',
          fields: [
            {
              name: 'location',
              type: 'text',
              required: true,
              admin: {
                description: 'Venue / course name',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  admin: {
                    width: '33%',
                    description: 'Registration fee',
                  },
                },
                {
                  name: 'alumniPrice',
                  type: 'number',
                  admin: {
                    width: '33%',
                    description: 'Discounted alumni price',
                  },
                },
                {
                  name: 'prizeFund',
                  type: 'text',
                  admin: {
                    width: '33%',
                    description: 'Prize money description (e.g., "$50,000")',
                  },
                },
              ],
            },
            {
              name: 'description',
              type: 'richText',
            },
          ],
        },
        {
          label: 'Media',
          description: 'Hero image and photo gallery.',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Primary event image',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              admin: {
                description: 'Photo gallery for the event',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Schedule',
          fields: [
            {
              name: 'schedule',
              type: 'array',
              admin: {
                description: 'Event schedule by day',
              },
              fields: [
                {
                  name: 'day',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g., "Day 1 - Thursday"',
                  },
                },
                {
                  name: 'items',
                  type: 'array',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'time',
                          type: 'text',
                          required: true,
                          admin: {
                            width: '25%',
                            description: 'e.g., "7:00 AM"',
                          },
                        },
                        {
                          name: 'activity',
                          type: 'text',
                          required: true,
                          admin: {
                            width: '50%',
                          },
                        },
                        {
                          name: 'location',
                          type: 'text',
                          admin: {
                            width: '25%',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Pairings',
          fields: [
            {
              name: 'pairings',
              type: 'array',
              admin: {
                description: 'Player groupings and tee times',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'group',
                      type: 'number',
                      required: true,
                      admin: {
                        width: '20%',
                        description: 'Group number',
                      },
                    },
                    {
                      name: 'time',
                      type: 'text',
                      required: true,
                      admin: {
                        width: '20%',
                        description: 'e.g., "7:00 AM"',
                      },
                    },
                    {
                      name: 'tee',
                      type: 'text',
                      admin: {
                        width: '20%',
                        description: 'Starting tee (e.g., "1" or "10")',
                      },
                    },
                  ],
                },
                {
                  name: 'players',
                  type: 'array',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sponsors',
          fields: [
            {
              name: 'sponsors',
              type: 'relationship',
              relationTo: 'sponsors',
              hasMany: true,
              admin: {
                description: 'Event sponsors',
              },
            },
          ],
        },
      ],
    },
  ],
}
