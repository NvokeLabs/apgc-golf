import type { Block } from 'payload'

export const LatestNewsBlock: Block = {
  slug: 'latestNewsBlock',
  interfaceName: 'LatestNewsBlock',
  labels: {
    singular: 'Latest News Block',
    plural: 'Latest News Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Stay Updated',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Latest',
    },
    {
      name: 'titleHighlight',
      type: 'text',
      defaultValue: 'News',
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
        description: 'Number of news articles to display',
      },
    },
  ],
}
