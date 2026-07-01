import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { authenticatedFieldAccess } from '@/access/authenticatedFieldAccess'

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
      // Public can create registrations, but only authenticated staff (or
      // server-side flows via the local API, which override access) may set the
      // payment state. Prevents an anonymous REST caller self-advancing payment.
      access: {
        create: authenticatedFieldAccess,
        update: authenticatedFieldAccess,
      },
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Expired', value: 'expired' },
        { label: 'Failed', value: 'failed' },
        // Manual bank-transfer lifecycle (Story 1)
        { label: 'Awaiting Payment', value: 'awaiting-payment' },
        { label: 'Awaiting Verification', value: 'awaiting-verification' },
        { label: 'Rejected', value: 'rejected' },
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
              name: 'tshirtSize',
              type: 'select',
              required: true,
              label: 'Ukuran Kaos Golf',
              options: [
                { label: 'S', value: 'S' },
                { label: 'M', value: 'M' },
                { label: 'L', value: 'L' },
                { label: 'XL', value: 'XL' },
                { label: 'XXL', value: 'XXL' },
              ],
              admin: { description: 'Ukuran kaos golf peserta' },
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
              name: 'amountDue',
              type: 'number',
              // Set server-side at registration so the amount shown to the
              // registrant can't drift if the event price is later edited.
              access: {
                create: authenticatedFieldAccess,
                update: authenticatedFieldAccess,
              },
              admin: {
                description: 'Expected amount in IDR (snapshot at registration time)',
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
            // Manual bank-transfer verification (Story 1)
            {
              name: 'transferProof',
              type: 'upload',
              relationTo: 'proofs',
              admin: {
                description: 'Uploaded bank-transfer proof (stored privately)',
              },
            },
            {
              name: 'rejectionReason',
              type: 'textarea',
              admin: {
                description: 'Why the transfer was rejected (shown to the registrant)',
                condition: (data) => data?.paymentStatus === 'rejected',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'verifiedBy',
                  type: 'relationship',
                  relationTo: 'users',
                  // Verification metadata is staff-only — never settable by a
                  // public (unauthenticated) registration create/update.
                  access: {
                    create: authenticatedFieldAccess,
                    update: authenticatedFieldAccess,
                  },
                  admin: {
                    width: '50%',
                    description: 'Admin who verified this transfer',
                  },
                },
                {
                  name: 'verifiedAt',
                  type: 'date',
                  access: {
                    create: authenticatedFieldAccess,
                    update: authenticatedFieldAccess,
                  },
                  admin: {
                    width: '50%',
                    description: 'When the transfer was verified',
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
              ],
            },
            {
              name: 'ticketEmailSent',
              type: 'checkbox',
              defaultValue: false,
              access: {
                create: authenticatedFieldAccess,
                update: authenticatedFieldAccess,
              },
              admin: {
                description: 'Whether the ticket email was successfully sent',
              },
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
