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
  admin: {
    defaultColumns: ['playerName', 'event', 'category', 'status', 'createdAt'],
    useAsTitle: 'playerName',
    group: 'Registrations',
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
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
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { label: 'Alumni', value: 'alumni' },
            { label: 'Guest', value: 'guest' },
            { label: 'Member', value: 'member' },
            { label: 'VIP', value: 'vip' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'paymentMethod',
          type: 'select',
          options: [
            { label: 'Bank Transfer', value: 'bank-transfer' },
            { label: 'Credit Card', value: 'credit-card' },
            { label: 'Cash', value: 'cash' },
          ],
          admin: {
            width: '33%',
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
            width: '33%',
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
    },
  ],
}
