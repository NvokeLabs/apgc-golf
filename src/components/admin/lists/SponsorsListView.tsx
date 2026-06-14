'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'sponsors',
  title: 'Sponsors',
  description: 'Manage sponsors, tiers, and display order.',
  searchField: 'name',
  searchPlaceholder: 'Search by name...',
  defaultSort: 'order',
  depth: 1,
  columns: [
    { key: 'name', header: 'Name', isTitle: true },
    { key: 'tier', header: 'Tier', type: 'relationship', relationshipLabel: 'name' },
    {
      key: 'isActive',
      header: 'Active',
      type: 'badge',
      badge: {
        true: 'success',
        false: 'default',
      },
    },
    { key: 'order', header: 'Order' },
  ],
}

const SponsorsListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default SponsorsListView
