'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'sponsorship-tiers',
  title: 'Sponsorship Tiers',
  description: 'Manage sponsorship tiers, pricing, and display order.',
  searchField: 'name',
  searchPlaceholder: 'Search by name...',
  defaultSort: 'order',
  depth: 1,
  columns: [
    { key: 'name', header: 'Name', isTitle: true },
    { key: 'price', header: 'Price' },
    { key: 'order', header: 'Order' },
    {
      key: 'isActive',
      header: 'Active',
      type: 'badge',
      badge: {
        true: 'success',
        false: 'default',
      },
    },
  ],
}

const SponsorshipTiersListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default SponsorshipTiersListView
