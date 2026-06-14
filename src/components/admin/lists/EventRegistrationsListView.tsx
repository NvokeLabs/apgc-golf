'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'event-registrations',
  title: 'Event Registrations',
  description: 'Review and manage event registrations.',
  searchField: 'playerName',
  searchPlaceholder: 'Search by player name...',
  defaultSort: '-createdAt',
  depth: 1,
  filters: [
    {
      field: 'status',
      label: 'All Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Waitlist', value: 'waitlist' },
      ],
    },
  ],
  columns: [
    { key: 'playerName', header: 'Player', isTitle: true },
    { key: 'email', header: 'Email' },
    { key: 'event', header: 'Event', type: 'relationship', relationshipLabel: 'title' },
    { key: 'category', header: 'Category' },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badge: {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'error',
        waitlist: 'default',
      },
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      type: 'badge',
      badge: {
        unpaid: 'error',
        pending: 'warning',
        paid: 'success',
        expired: 'error',
        failed: 'error',
      },
    },
    { key: 'createdAt', header: 'Submitted', type: 'date' },
  ],
}

const EventRegistrationsListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default EventRegistrationsListView
