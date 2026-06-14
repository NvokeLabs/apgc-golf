'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'events',
  title: 'Events',
  description: 'Manage tournaments, schedules, and registration status.',
  searchField: 'title',
  searchPlaceholder: 'Search by title...',
  defaultSort: '-date',
  depth: 1,
  filters: [
    {
      field: 'status',
      label: 'All Status',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Open', value: 'open' },
        { label: 'Sold Out', value: 'sold-out' },
        { label: 'Closed', value: 'closed' },
        { label: 'Completed', value: 'completed' },
      ],
    },
  ],
  columns: [
    { key: 'title', header: 'Title', isTitle: true },
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'location', header: 'Location' },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badge: {
        upcoming: 'default',
        open: 'success',
        'sold-out': 'warning',
        closed: 'error',
        completed: 'default',
      },
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      type: 'badge',
      badge: {
        true: 'success',
        false: 'default',
      },
    },
  ],
}

const EventsListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default EventsListView
