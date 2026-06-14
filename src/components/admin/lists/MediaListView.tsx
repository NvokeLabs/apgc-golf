'use client'

import React from 'react'
import { FileText } from 'lucide-react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'media',
  title: 'Media',
  description: 'Browse and manage uploaded files.',
  searchField: 'filename',
  searchPlaceholder: 'Search by filename...',
  defaultSort: '-createdAt',
  depth: 0,
  columns: [
    {
      key: 'thumbnail',
      header: 'Preview',
      accessor: (doc) => {
        const url = doc.url as string | undefined
        const mimeType = doc.mimeType as string | undefined
        const alt = (doc.alt as string | undefined) ?? (doc.filename as string | undefined) ?? ''
        if (url && mimeType?.startsWith('image/')) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={url} alt={alt} className="h-10 w-10 rounded object-cover" />
        }
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>
        )
      },
    },
    { key: 'filename', header: 'Filename', isTitle: true },
    { key: 'alt', header: 'Alt' },
    { key: 'mimeType', header: 'Type' },
    { key: 'updatedAt', header: 'Updated', type: 'date' },
  ],
}

const MediaListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default MediaListView
