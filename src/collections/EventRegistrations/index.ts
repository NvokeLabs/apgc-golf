import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  access: {
    create: anyone, // Allow public form submissions
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  defaultPopulate: {
    playerName: true,
    email: true,
    event: true,
    category: true,
    status: true,
    paymentStatus: true,
  },
  admin: {
    defaultColumns: ['playerName', 'event', 'category', 'paymentStatus', 'status', 'createdAt'],
    useAsTitle: 'playerName',
    group: 'Registrations',
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/EventRegistrationsListView',
        },
      },
    },
  },
  fields: [
    // Sidebar — registration classification and lifecycle status
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Event being registered for',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'General', value: 'general' },
        { label: 'Alumni', value: 'alumni' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Registration category',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Waitlist', value: 'waitlist' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Registration status',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Expired', value: 'expired' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Payment state',
      },
    },
    // Main body
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Registrant',
          description: 'Details submitted by the registrant.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'playerName',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'phone',
              type: 'text',
            },
            {
              name: 'notes',
              type: 'textarea',
              admin: {
                description: 'Additional notes or special requests',
              },
            },
            {
              name: 'agreedToTerms',
              type: 'checkbox',
              required: true,
              admin: {
                description: 'Registrant accepted the terms and conditions',
              },
            },
          ],
        },
        {
          label: 'Payment',
          description: 'Payment method and reconciliation details.',
          fields: [
            {
              name: 'paymentMethod',
              type: 'select',
              options: [
                { label: 'Bank Transfer', value: 'bank-transfer' },
                { label: 'Credit Card', value: 'credit-card' },
                { label: 'Cash', value: 'cash' },
              ],
              admin: {
                description: 'How the registrant intends to pay',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'amountPaid',
                  type: 'number',
                  admin: {
                    width: '50%',
                    description: 'Amount paid in IDR',
                  },
                },
                {
                  name: 'paidAt',
                  type: 'date',
                  admin: {
                    width: '50%',
                    description: 'Timestamp payment was received',
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'xenditSessionId',
      type: 'text',
      admin: {
        description: 'Xendit Payment Session ID',
        position: 'sidebar',
      },
    },
    {
      name: 'xenditCheckoutUrl',
      type: 'text',
      admin: {
        description: 'Xendit Checkout URL',
        position: 'sidebar',
      },
    },
    {
      name: 'ticket',
      type: 'relationship',
      relationTo: 'tickets',
      admin: {
        description: 'Generated ticket for this registration',
        position: 'sidebar',
      },
    },
  ],
}
