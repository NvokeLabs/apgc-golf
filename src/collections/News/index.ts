import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateNewsAfterChange, revalidateNewsAfterDelete } from './hooks/revalidateNews'

export const News: CollectionConfig = {
  slug: 'news',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'category', 'publishedDate', '_status'],
    useAsTitle: 'title',
    group: 'Golf Content',
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  hooks: {
    afterChange: [revalidateNewsAfterChange],
    afterDelete: [revalidateNewsAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Article subheading',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { label: 'Tournament Recap', value: 'tournament-recap' },
            { label: 'Course Design', value: 'course-design' },
            { label: 'Instruction', value: 'instruction' },
            { label: 'Club News', value: 'club-news' },
            { label: 'Member Spotlight', value: 'member-spotlight' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'publishedDate',
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
          name: 'readTime',
          type: 'text',
          admin: {
            width: '33%',
            description: 'e.g., "5 min read"',
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'news',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Related news articles',
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id,
          },
        }
      },
    },
  ],
}
