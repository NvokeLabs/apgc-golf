import type { Block } from 'payload'

export const SponsorsMarqueeBlock: Block = {
  slug: 'sponsorsMarqueeBlock',
  interfaceName: 'SponsorsMarqueeBlock',
  labels: {
    singular: 'Sponsors Marquee Block',
    plural: 'Sponsors Marquee Blocks',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Our Partners',
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Proud',
    },
    {
      name: 'titleHighlight',
      type: 'text',
      defaultValue: 'Sponsors',
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'speed',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Slow', value: 'slow' },
        { label: 'Normal', value: 'normal' },
        { label: 'Fast', value: 'fast' },
      ],
    },
  ],
}
