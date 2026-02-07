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
    defaultColumns: ['playerName', 'event', 'category', 'paymentStatus', 'status', 'createdAt'],
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
            { label: 'General', value: 'general' },
            { label: 'Alumni', value: 'alumni' },
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
    // Payment tracking fields
    {
      type: 'row',
      fields: [
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
            width: '33%',
          },
        },
        {
          name: 'amountPaid',
          type: 'number',
          admin: {
            width: '33%',
            description: 'Amount paid in IDR',
          },
        },
        {
          name: 'paidAt',
          type: 'date',
          admin: {
            width: '33%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
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
