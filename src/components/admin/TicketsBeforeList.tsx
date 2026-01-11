'use client'

import React from 'react'
import Link from 'next/link'
import { QrCode, Info } from 'lucide-react'

const TicketsBeforeList: React.FC = () => {
  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '16px 20px',
        backgroundColor: 'var(--apgc-card-bg, #ffffff)',
        border: '1px solid var(--apgc-border, rgba(23, 16, 70, 0.1))',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(237, 95, 36, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Info size={20} style={{ color: '#ed5f24' }} />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--apgc-text, #171046)',
            }}
          >
            Ticket Management
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--apgc-text-muted, #717182)',
            }}
          >
            View and manage event tickets. Use the scanner to check in attendees.
          </p>
        </div>
      </div>

      {/* Quick Action */}
      <Link
        href="/admin/check-in"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#ed5f24',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#d54e15'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ed5f24'
        }}
      >
        <QrCode size={18} />
        Open Check-In Scanner
      </Link>
    </div>
  )
}

export default TicketsBeforeList
