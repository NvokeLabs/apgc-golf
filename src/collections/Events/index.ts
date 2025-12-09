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
  admin: {
    defaultColumns: ['title', 'date', 'tier', 'status'],
    useAsTitle: 'title',
    group: 'Golf Content',
  },
  hooks: {
    afterChange: [revalidateEventAfterChange],
    afterDelete: [revalidateEventAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            width: '33%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            width: '33%',
            description: 'For multi-day events',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'location',
          type: 'text',
          required: true,
          admin: {
            width: '33%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
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
            width: '25%',
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
            width: '25%',
          },
        },
        {
          name: 'price',
          type: 'number',
          admin: {
            width: '25%',
            description: 'Registration fee',
          },
        },
        {
          name: 'alumniPrice',
          type: 'number',
          admin: {
            width: '25%',
            description: 'Discounted alumni price',
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'prizeFund',
      type: 'text',
      admin: {
        description: 'Prize money description (e.g., "$50,000")',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      type: 'tabs',
      tabs: [
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
        {
          label: 'Gallery',
          fields: [
            {
              name: 'gallery',
              type: 'array',
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
      ],
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
  ],
}
