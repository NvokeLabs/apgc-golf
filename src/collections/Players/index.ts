import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidatePlayerAfterChange, revalidatePlayerAfterDelete } from './hooks/revalidatePlayer'

export const Players: CollectionConfig = {
  slug: 'players',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'rank', 'country', 'status', 'isFeatured'],
    useAsTitle: 'name',
    group: 'Golf Content',
  },
  hooks: {
    afterChange: [revalidatePlayerAfterChange],
    afterDelete: [revalidatePlayerAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'rank',
          type: 'number',
          admin: {
            width: '25%',
            description: 'Current ranking position',
          },
        },
        {
          name: 'country',
          type: 'text',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'gender',
          type: 'select',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
          admin: {
            width: '25%',
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
          admin: {
            width: '25%',
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
      type: 'tabs',
      tabs: [
        {
          label: 'Stats',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'wins',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    width: '25%',
                  },
                },
                {
                  name: 'points',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    width: '25%',
                  },
                },
                {
                  name: 'handicap',
                  type: 'number',
                  admin: {
                    width: '25%',
                    description: 'Golf handicap',
                  },
                },
                {
                  name: 'latestGrossScore',
                  type: 'number',
                  admin: {
                    width: '25%',
                  },
                },
              ],
            },
            {
              name: 'majorChampionships',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Number of major championships won',
              },
            },
            {
              name: 'recentResults',
              type: 'array',
              admin: {
                description: 'Recent tournament results',
              },
              fields: [
                {
                  name: 'tournament',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'position',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'date',
                  type: 'date',
                },
              ],
            },
          ],
        },
        {
          label: 'Profile',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'age',
                  type: 'number',
                  admin: {
                    width: '33%',
                  },
                },
                {
                  name: 'turnedPro',
                  type: 'number',
                  admin: {
                    width: '33%',
                    description: 'Year turned professional',
                  },
                },
                {
                  name: 'memberId',
                  type: 'text',
                  admin: {
                    width: '33%',
                    description: 'Club membership ID',
                  },
                },
              ],
            },
            {
              name: 'bio',
              type: 'richText',
              admin: {
                description: 'Player biography',
              },
            },
            {
              name: 'memberDescription',
              type: 'textarea',
              admin: {
                description: 'Short description for member listings',
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'email',
              type: 'email',
            },
            {
              name: 'matchPlayAvailable',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Available for match play',
              },
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
        description: 'Show on homepage featured section',
      },
    },
  ],
}
