'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'players',
  title: 'Players',
  description: 'Manage player profiles, rankings, and featured status.',
  searchField: 'name',
  searchPlaceholder: 'Search by name...',
  defaultSort: 'rank',
  depth: 1,
  filters: [
    {
      field: 'status',
      label: 'All Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ],
  columns: [
    { key: 'name', header: 'Name', isTitle: true },
    { key: 'role', header: 'Role' },
    { key: 'rank', header: 'Rank' },
    { key: 'country', header: 'Country' },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badge: {
        active: 'success',
        inactive: 'default',
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

const PlayersListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default PlayersListView
