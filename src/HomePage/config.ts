import type { GlobalConfig } from 'payload'

import { revalidateHomePage } from './hooks/revalidateHomePage'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
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
          label: 'Hero Section',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue: 'The 2025 Season Finale',
                  admin: {
                    description: 'Small text above the main title',
                  },
                },
                {
                  name: 'titleLine1',
                  type: 'text',
                  defaultValue: 'Legacy',
                  admin: {
                    description: 'First line of the hero title',
                  },
                },
                {
                  name: 'titleLine2',
                  type: 'text',
                  defaultValue: 'In The Making',
                  admin: {
                    description: 'Second line of the hero title (italic)',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Witness history at the legendary Cypress Point. Where masters of the craft compete for the ultimate glory.',
                  admin: {
                    description: 'Hero description text',
                  },
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Hero background image',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Stats Section',
          fields: [
            {
              name: 'statsSection',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Dampak APGC' },
                { name: 'title', type: 'text', defaultValue: 'Dampak yang Kami Ciptakan' },
                { name: 'description', type: 'text' },
                {
                  name: 'items',
                  type: 'array',
                  admin: {
                    description:
                      'Angka dampak (mis. value "500+", label "Alumni Terhubung"). Isi sendiri di admin.',
                  },
                  fields: [
                    { name: 'value', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Featured Event Section',
          fields: [
            {
              name: 'featuredEventSection',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Featured Event',
                },
              ],
            },
          ],
        },
        {
          label: 'Upcoming Events Section',
          fields: [
            {
              name: 'upcomingEventsSection',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Upcoming Events',
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Tournament Schedule',
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Experience championship golf at the finest venues.',
                },
              ],
            },
          ],
        },
        {
          label: 'Broadcast Schedule',
          fields: [
            {
              name: 'broadcastSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Broadcast Schedule',
                },
                {
                  name: 'rounds',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'round',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'day',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'time',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'network',
                      type: 'text',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'highlight',
                      type: 'text',
                      admin: {
                        description:
                          'Special note (e.g., "Opening Tee Shots", "Championship Trophy")',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Why Sponsor Section',
          fields: [
            {
              name: 'whySponsorSection',
              type: 'group',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Sponsorship' },
                { name: 'title', type: 'text', defaultValue: 'Mengapa Menjadi Sponsor?' },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue:
                    'Bergabung sebagai sponsor APGC membuka akses ke komunitas profesional sekaligus mendukung program berdampak sosial.',
                },
                {
                  name: 'benefits',
                  type: 'array',
                  admin: { initCollapsed: true },
                  defaultValue: [
                    {
                      icon: 'exposure',
                      title: 'Eksposur Premium',
                      description:
                        'Tampil di hadapan komunitas profesional, alumni, dan pelaku industri.',
                    },
                    {
                      icon: 'network',
                      title: 'Networking Strategis',
                      description:
                        'Bertemu langsung dengan pengambil keputusan dan pemimpin bisnis.',
                    },
                    {
                      icon: 'impact',
                      title: 'Dampak Sosial',
                      description:
                        'Mendukung program pendidikan dan pengembangan generasi masa depan.',
                    },
                    {
                      icon: 'visibility',
                      title: 'Brand Visibility',
                      description:
                        'Promosi melalui event, media sosial, website, dan materi publikasi.',
                    },
                  ],
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      defaultValue: 'exposure',
                      options: [
                        { label: 'Exposure', value: 'exposure' },
                        { label: 'Network', value: 'network' },
                        { label: 'Impact', value: 'impact' },
                        { label: 'Visibility', value: 'visibility' },
                      ],
                      admin: { width: '100%' },
                    },
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'textarea', required: true },
                  ],
                },
                { name: 'ctaLabel', type: 'text', defaultValue: 'Unduh Proposal Sponsorship' },
                {
                  name: 'ctaLink',
                  type: 'text',
                  defaultValue: '/sponsors',
                  admin: { description: 'Tujuan tombol CTA sponsor' },
                },
              ],
            },
          ],
        },
        {
          label: 'Partners Section',
          fields: [
            {
              name: 'partnersSection',
              type: 'group',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Official Partners',
                },
              ],
            },
          ],
        },
        {
          label: 'Featured Players Section',
          fields: [
            {
              name: 'featuredPlayersSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Anggota APGC',
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Mengenal lebih dekat anggota dan pemain komunitas APGC.',
                },
              ],
            },
          ],
        },
        {
          label: 'News Section',
          fields: [
            {
              name: 'newsSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Latest News',
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Updates from the green and behind the scenes.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHomePage],
  },
}
