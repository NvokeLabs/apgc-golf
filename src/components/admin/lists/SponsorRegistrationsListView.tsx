'use client'

import React from 'react'
import { CollectionListView, type ListConfig } from '../shadcn/CollectionListView'

const config: ListConfig = {
  slug: 'sponsor-registrations',
  title: 'Sponsor Registrations',
  description: 'Review and manage sponsorship applications.',
  searchField: 'companyName',
  searchPlaceholder: 'Search by company name...',
  defaultSort: '-createdAt',
  depth: 1,
  filters: [
    {
      field: 'status',
      label: 'All Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Approved', value: 'approved' },
        { label: 'Declined', value: 'declined' },
      ],
    },
  ],
  columns: [
    { key: 'companyName', header: 'Company', isTitle: true },
    { key: 'contactName', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'selectedTier', header: 'Tier' },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badge: {
        pending: 'warning',
        contacted: 'default',
        approved: 'success',
        confirmed: 'success',
        declined: 'error',
        rejected: 'error',
      },
    },
    { key: 'createdAt', header: 'Submitted', type: 'date' },
  ],
}

const SponsorRegistrationsListView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <CollectionListView config={config} />
    </div>
  )
}

export default SponsorRegistrationsListView
