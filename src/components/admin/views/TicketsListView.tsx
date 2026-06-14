'use client'

import React from 'react'
import { TicketsList } from '../collections/TicketsList'

const TicketsListView: React.FC = () => {
  return (
    <div className="apgc-admin">
      <div className="mx-auto max-w-[1200px] p-6">
        <TicketsList />
      </div>
    </div>
  )
}

export default TicketsListView
