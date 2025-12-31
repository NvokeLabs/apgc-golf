import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'heroBlock',
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero Block',
    plural: 'Hero Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'titleHighlight',
      type: 'text',
      admin: {
        description: 'Italic highlighted portion of the title',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ctaButton',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
    {
      name: 'overlayOpacity',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Medium', value: 'medium' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
}
