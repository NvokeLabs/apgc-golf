'use client'

import React from 'react'
import { TicketsList } from '../collections/TicketsList'

const TicketsListView: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <TicketsList />
    </div>
  )
}

export default TicketsListView
