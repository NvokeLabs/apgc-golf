import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['ticketCode', 'registration', 'event', 'status', 'checkedInAt'],
    useAsTitle: 'ticketCode',
    group: 'Registrations',
    description: 'Manage event tickets and check-in status',
    components: {
      beforeList: ['@/components/admin/TicketsBeforeList'],
    },
  },
  fields: [
    {
      name: 'ticketCode',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Unique ticket code in format APGC-{id}-{hash}',
      },
    },
    {
      name: 'registration',
      type: 'relationship',
      relationTo: 'event-registrations',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'qrCodeData',
      type: 'text',
      admin: {
        description: 'Base64 encoded QR code data URL',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Checked In', value: 'checked_in' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'checkedInAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'checkedInBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin user who checked in this ticket',
      },
    },
  ],
}
