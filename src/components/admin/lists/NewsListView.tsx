'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'news',
  title: 'News',
  description: 'Manage articles, categories, and publishing.',
  searchField: 'title',
  searchPlaceholder: 'Search by title...',
  defaultSort: '-publishedDate',
  depth: 1,
  filters: [
    {
      field: 'category',
      label: 'All Categories',
      options: [
        { label: 'Tournament Recap', value: 'tournament-recap' },
        { label: 'Course Design', value: 'course-design' },
        { label: 'Instruction', value: 'instruction' },
        { label: 'Club News', value: 'club-news' },
        { label: 'Member Spotlight', value: 'member-spotlight' },
      ],
    },
  ],
  columns: [
    { key: 'title', header: 'Title', isTitle: true },
    { key: 'category', header: 'Category', type: 'badge' },
    { key: 'publishedDate', header: 'Published', type: 'date' },
    { key: 'author', header: 'Author', type: 'relationship', relationshipLabel: 'name' },
  ],
}

const NewsListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default NewsListView
