import type { GlobalConfig } from 'payload'

import { revalidateSponsorsPage } from './hooks/revalidateSponsorsPage'

export const SponsorsPage: GlobalConfig = {
  slug: 'sponsors-page',
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
          label: 'Page Header',
          fields: [
            {
              name: 'header',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Our Partners',
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'The Driving',
                  admin: { description: 'First part of the title' },
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Force',
                  admin: { description: 'Highlighted part of the title' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'We are proud to partner with world-leading brands who share our passion for excellence, tradition, and the future of golf.',
                },
              ],
            },
          ],
        },
        {
          label: 'Become a Sponsor',
          fields: [
            {
              name: 'becomeASponsor',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Become a',
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Sponsor',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Join an elite group of global brands and connect with a passionate audience of affluent golf enthusiasts.',
                },
              ],
            },
          ],
        },
        {
          label: 'Why Partner Section',
          fields: [
            {
              name: 'whyPartner',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Why',
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Partner With Us?',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Align your brand with excellence. Our tournament offers a unique platform to engage with a sophisticated audience and drive tangible business results.',
                },
                {
                  name: 'benefits',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      options: [
                        { label: 'Globe', value: 'globe' },
                        { label: 'Users', value: 'users' },
                        { label: 'Handshake', value: 'handshake' },
                        { label: 'Trophy', value: 'trophy' },
                        { label: 'Star', value: 'star' },
                      ],
                      admin: { width: '30%' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: { width: '70%' },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'CTA Section',
          fields: [
            {
              name: 'ctaSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Have specific questions?',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Our dedicated sponsorship team is here to answer your questions and help customize a package that meets your specific business objectives.',
                },
                {
                  name: 'buttonText',
                  type: 'text',
                  defaultValue: 'Contact Customer Service',
                },
                {
                  name: 'buttonLink',
                  type: 'text',
                  defaultValue: '/register/sponsor',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSponsorsPage],
  },
}
