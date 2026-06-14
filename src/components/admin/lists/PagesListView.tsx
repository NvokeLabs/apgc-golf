'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'pages',
  title: 'Pages',
  description: 'Manage website pages.',
  searchField: 'title',
  searchPlaceholder: 'Search by title...',
  defaultSort: '-updatedAt',
  depth: 1,
  columns: [
    { key: 'title', header: 'Title', isTitle: true },
    { key: 'slug', header: 'Slug' },
    { key: 'updatedAt', header: 'Last Updated', type: 'date' },
  ],
}

const PagesListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default PagesListView
