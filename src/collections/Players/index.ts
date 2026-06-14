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
  defaultPopulate: {
    name: true,
    slug: true,
    role: true,
    rank: true,
    country: true,
    status: true,
    image: true,
    isFeatured: true,
  },
  admin: {
    defaultColumns: ['name', 'rank', 'country', 'status', 'isFeatured'],
    useAsTitle: 'name',
    group: 'Golf Content',
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/PlayersListView',
        },
      },
    },
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
      admin: {
        components: {
          Field: '@/components/admin/fields/ShadcnTextField',
        },
      },
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'role',
      type: 'text',
      admin: {
        description:
          'Role/title shown on the Alumni & Professional Network card (e.g. Vice Chairman APGC)',
        components: {
          Field: '@/components/admin/fields/ShadcnTextField',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rank',
          type: 'number',
          admin: {
            width: '33%',
            description: 'Current ranking position',
            components: {
              Field: '@/components/admin/fields/ShadcnNumberField',
            },
          },
        },
        {
          name: 'country',
          type: 'text',
          admin: {
            width: '33%',
            components: {
              Field: '@/components/admin/fields/ShadcnTextField',
            },
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
            width: '33%',
            components: {
              Field: '@/components/admin/fields/ShadcnSelectField',
            },
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Player photo',
      },
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
                    components: {
                      Field: '@/components/admin/fields/ShadcnNumberField',
                    },
                  },
                },
                {
                  name: 'points',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    width: '25%',
                    components: {
                      Field: '@/components/admin/fields/ShadcnNumberField',
                    },
                  },
                },
                {
                  name: 'handicap',
                  type: 'number',
                  admin: {
                    width: '25%',
                    description: 'Golf handicap',
                    components: {
                      Field: '@/components/admin/fields/ShadcnNumberField',
                    },
                  },
                },
                {
                  name: 'latestGrossScore',
                  type: 'number',
                  admin: {
                    width: '25%',
                    components: {
                      Field: '@/components/admin/fields/ShadcnNumberField',
                    },
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
                components: {
                  Field: '@/components/admin/fields/ShadcnNumberField',
                },
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
                    components: {
                      Field: '@/components/admin/fields/ShadcnNumberField',
                    },
                  },
                },
                {
                  name: 'turnedPro',
                  type: 'number',
                  admin: {
                    width: '33%',
                    description: 'Year turned professional',
                    components: {
                      Field: '@/components/admin/fields/ShadcnNumberField',
                    },
                  },
                },
                {
                  name: 'memberId',
                  type: 'text',
                  admin: {
                    width: '33%',
                    description: 'Club membership ID',
                    components: {
                      Field: '@/components/admin/fields/ShadcnTextField',
                    },
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
                components: {
                  Field: '@/components/admin/fields/ShadcnTextareaField',
                },
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
              admin: {
                components: {
                  Field: '@/components/admin/fields/ShadcnTextField',
                },
              },
            },
            {
              name: 'matchPlayAvailable',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Available for match play',
                components: {
                  Field: '@/components/admin/fields/ShadcnCheckboxField',
                },
              },
            },
          ],
        },
      ],
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
        position: 'sidebar',
        description: 'Active players are shown publicly',
        components: {
          Field: '@/components/admin/fields/ShadcnSelectField',
        },
      },
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
