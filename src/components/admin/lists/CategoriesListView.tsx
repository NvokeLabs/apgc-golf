'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'categories',
  title: 'Categories',
  description: 'Manage content categories.',
  searchField: 'title',
  searchPlaceholder: 'Search by title...',
  defaultSort: 'title',
  depth: 0,
  columns: [
    { key: 'title', header: 'Title', isTitle: true },
    { key: 'slug', header: 'Slug' },
    { key: 'updatedAt', header: 'Updated', type: 'date' },
  ],
}

const CategoriesListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default CategoriesListView
