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
  defaultPopulate: {
    title: true,
    slug: true,
    subtitle: true,
    category: true,
    publishedDate: true,
    readTime: true,
    image: true,
    author: true,
  },
  admin: {
    defaultColumns: ['title', 'category', 'publishedDate', '_status'],
    useAsTitle: 'title',
    group: 'Golf Content',
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/NewsListView',
        },
      },
    },
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
    // Sidebar — classification and publishing metadata
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
        position: 'sidebar',
        description: 'Article category',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Date shown to readers',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'readTime',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'e.g., "5 min read"',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
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
          label: 'Content',
          description: 'Headline, hero image, and article body.',
          fields: [
            {
              name: 'subtitle',
              type: 'text',
              admin: {
                description: 'Article subheading',
              },
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
          ],
        },
      ],
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
