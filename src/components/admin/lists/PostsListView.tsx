'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'posts',
  title: 'Posts',
  description: 'Manage news posts and articles.',
  searchField: 'title',
  searchPlaceholder: 'Search by title...',
  defaultSort: '-createdAt',
  depth: 1,
  columns: [
    { key: 'title', header: 'Title', isTitle: true },
    { key: 'slug', header: 'Slug' },
    { key: 'createdAt', header: 'Created', type: 'date' },
  ],
}

const PostsListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default PostsListView
