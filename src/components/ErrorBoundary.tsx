'use client'

import React from 'react'
import { GlassCard } from '@/components/golf'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <GlassCard className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-[#0b3d2e]">Something went wrong</h3>
            <p className="text-[#636364] max-w-md">
              We encountered an error while loading this content. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b3d2e] text-white rounded-xl font-medium hover:bg-[#091f18] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        </GlassCard>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for use with Suspense
export function DataErrorFallback() {
  return (
    <GlassCard className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-[#0b3d2e]">Unable to load data</h3>
        <p className="text-[#636364] max-w-md">
          We couldn&apos;t fetch the data at this time. Please try again later.
        </p>
      </div>
    </GlassCard>
  )
}
