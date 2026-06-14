'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'users',
  title: 'Users',
  description: 'Manage admin users.',
  searchField: 'email',
  searchPlaceholder: 'Search by email...',
  defaultSort: 'email',
  depth: 0,
  disableDelete: true,
  columns: [
    { key: 'email', header: 'Email', isTitle: true },
    { key: 'name', header: 'Name' },
    { key: 'createdAt', header: 'Created', type: 'date' },
  ],
}

const UsersListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default UsersListView
