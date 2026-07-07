import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isRegistrationStaff } from '@/access/roles'
import { notifySponsorInquiry } from './hooks/notifyWhatsApp'

export const SponsorRegistrations: CollectionConfig = {
  slug: 'sponsor-registrations',
  access: {
    create: anyone, // Allow public form submissions
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [notifySponsorInquiry],
  },
  admin: {
    defaultColumns: ['companyName', 'contactName', 'selectedTier', 'status', 'createdAt'],
    useAsTitle: 'companyName',
    group: 'Registrations',
    hidden: ({ user }) => isRegistrationStaff(user),
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/SponsorRegistrationsListView',
        },
      },
    },
  },
  fields: [
    // Sidebar — tier selection and review status
    {
      name: 'selectedTier',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Tier key from SponsorshipTiers, or "custom"',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Approved', value: 'approved' },
        { label: 'Declined', value: 'declined' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Review status',
      },
    },
    // Main body
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Applicant',
          description: 'Company and contact details submitted by the applicant.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'companyName',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'contactName',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'phone',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'website',
              type: 'text',
              admin: {
                description: 'Company website',
              },
            },
            {
              name: 'message',
              type: 'textarea',
              admin: {
                description: 'Additional information or questions',
              },
            },
          ],
        },
        {
          label: 'Admin',
          description: 'Internal review notes.',
          fields: [
            {
              name: 'adminNotes',
              type: 'textarea',
              admin: {
                description: 'Internal notes (not visible to applicant)',
              },
            },
          ],
        },
      ],
    },
  ],
}
