'use client'

import React from 'react'
import Link from 'next/link'
import { QrCode, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TicketsBeforeList: React.FC = () => {
  return (
    <div className="apgc-admin">
      <Card className="mb-6 flex items-center justify-between gap-4 p-4">
        {/* Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Info size={20} />
          </div>
          <div>
            <h3 className="m-0 text-sm font-semibold text-primary">Ticket Management</h3>
            <p className="m-0 text-sm text-muted-foreground">
              View and manage event tickets. Use the scanner to check in attendees.
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <Button asChild className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/admin/check-in">
            <QrCode size={18} />
            Open Check-In Scanner
          </Link>
        </Button>
      </Card>
    </div>
  )
}

export default TicketsBeforeList
