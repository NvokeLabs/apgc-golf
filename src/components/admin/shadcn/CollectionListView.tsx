'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// A document coming back from the Payload REST API. The shape is collection
// specific, so we keep it as an open record and access values via dot paths.
type Doc = Record<string, unknown> & { id: string }

type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

export type Column = {
  /** dot path into the doc, e.g. "registration.email" */
  key: string
  header: string
  /** renders as a link to /admin/collections/{slug}/{id} */
  isTitle?: boolean
  type?: 'text' | 'date' | 'badge' | 'relationship'
  /** sub-field to show for a populated relationship (e.g. 'title', 'name') */
  relationshipLabel?: string
  /** value → badge variant map */
  badge?: Record<string, BadgeVariant>
  /** escape hatch: render arbitrary content from the doc */
  accessor?: (doc: Doc) => React.ReactNode
}

export type Filter = {
  field: string
  label: string
  options: { label: string; value: string }[]
}

export type ListConfig = {
  slug: string
  title: string
  description?: string
  searchField?: string
  searchPlaceholder?: string
  defaultSort?: string
  depth?: number
  columns: Column[]
  filters?: Filter[]
  disableDelete?: boolean
}

type ListData = {
  docs: Doc[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const LIMIT = 10

/** Read a value from a doc using a dot-separated path. */
function getPath(doc: Doc, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, doc)
}

/** Turn a machine value like "checked_in" into "Checked In". */
function humanize(value: unknown): string {
  if (value == null) return '-'
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(value: unknown): string {
  if (!value || typeof value !== 'string') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CollectionListView({ config }: { config: ListConfig }) {
  const {
    slug,
    title,
    description,
    searchField,
    searchPlaceholder,
    defaultSort,
    depth = 1,
    columns,
    filters = [],
    disableDelete = false,
  } = config

  const [data, setData] = useState<ListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<string>(defaultSort ?? '')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const fetchDocs = async () => {
    setLoading(true)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        depth: depth.toString(),
      })
      if (sort) params.append('sort', sort)
      if (searchQuery && searchField) {
        params.append(`where[${searchField}][contains]`, searchQuery)
      }
      for (const filter of filters) {
        const value = filterValues[filter.field]
        if (value) params.append(`where[${filter.field}][equals]`, value)
      }

      const response = await fetch(`/api/${slug}?${params.toString()}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`Failed to fetch ${slug}`)
      const result = (await response.json()) as ListData
      setData(result)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error(`Error fetching ${slug}:`, error)
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  // Refetch on page / sort / filter changes.
  useEffect(() => {
    fetchDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, JSON.stringify(filterValues)])

  // Debounced search: reset to page 1, or refetch in place if already there.
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 1) {
        fetchDocs()
      } else {
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const toggleSort = (key: string) => {
    setSort((current) => {
      if (current === key) return `-${key}`
      if (current === `-${key}`) return key
      return key
    })
    setPage(1)
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (data.docs.length > 0 && selected.size === data.docs.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(data.docs.map((d) => d.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    if (
      !window.confirm(
        `Delete ${ids.length} item${ids.length === 1 ? '' : 's'}? This cannot be undone.`,
      )
    ) {
      return
    }
    setDeleting(true)
    try {
      await Promise.all(ids.map((id) => fetch(`/api/${slug}/${id}`, { method: 'DELETE' })))
      setSelected(new Set())
      await fetchDocs()
    } catch (error) {
      console.error(`Error deleting ${slug}:`, error)
    } finally {
      setDeleting(false)
    }
  }

  const renderCell = (doc: Doc, column: Column): React.ReactNode => {
    if (column.accessor) return column.accessor(doc)

    const value = getPath(doc, column.key)

    if (column.isTitle) {
      return (
        <Link
          href={`/admin/collections/${slug}/${doc.id}`}
          className="font-medium text-primary underline decoration-1 underline-offset-4"
        >
          {value != null && value !== '' ? String(value) : `(${doc.id})`}
        </Link>
      )
    }

    switch (column.type) {
      case 'date':
        return <span className="text-muted-foreground">{formatDate(value)}</span>

      case 'badge': {
        if (value == null || value === '') return <span className="text-muted-foreground">-</span>
        const variant = column.badge?.[String(value)] ?? 'default'
        return <Badge variant={variant}>{humanize(value)}</Badge>
      }

      case 'relationship': {
        if (value == null) return <span className="text-muted-foreground">-</span>
        if (typeof value === 'object') {
          const obj = value as Record<string, unknown>
          const labelKey = column.relationshipLabel ?? 'title'
          const label = obj[labelKey] ?? obj.name ?? obj.title ?? obj.id
          return <span>{label != null ? String(label) : '-'}</span>
        }
        return <span>{String(value)}</span>
      }

      case 'text':
      default:
        if (value == null || value === '') return <span className="text-muted-foreground">-</span>
        return <span>{String(value)}</span>
    }
  }

  const colSpan = columns.length + 1
  const showDelete = !disableDelete && selected.size > 0

  return (
    <div className="apgc-admin">
      <div className="flex flex-col min-h-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {showDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleting}
                className="gap-2"
              >
                <Trash2 className={cn('h-4 w-4', deleting && 'animate-pulse')} />
                Delete ({selected.size})
              </Button>
            )}
            <Button
              asChild
              size="sm"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href={`/admin/collections/${slug}/create`}>
                <Plus className="h-4 w-4" />
                Create New
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchDocs()} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                searchPlaceholder ?? (searchField ? `Search by ${searchField}...` : 'Search...')
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!searchField}
              className="border-none bg-transparent pl-10 shadow-none focus-visible:ring-0"
            />
          </div>
          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <select
                  key={filter.field}
                  value={filterValues[filter.field] ?? ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFilterValues((current) => ({ ...current, [filter.field]: value }))
                    setPage(1)
                  }}
                  className="h-8 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={data?.docs.length ? selected.size === data.docs.length : false}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                {columns.map((column) => {
                  const active = sort === column.key || sort === `-${column.key}`
                  const descending = sort === `-${column.key}`
                  return (
                    <TableHead key={column.key}>
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:text-foreground group"
                        onClick={() => toggleSort(column.key)}
                      >
                        {column.header}
                        <div
                          className={cn(
                            'flex flex-col',
                            active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100',
                          )}
                        >
                          <ChevronUp
                            className={cn('h-2 w-2', active && !descending && 'text-accent')}
                          />
                          <ChevronDown
                            className={cn('h-2 w-2', active && descending && 'text-accent')}
                          />
                        </div>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !data?.docs.length ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                data.docs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selected.has(doc.id)}
                        onCheckedChange={() => toggleSelect(doc.id)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key}>{renderCell(doc, column)}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {data && data.totalDocs > 0
              ? `${(page - 1) * LIMIT + 1}-${Math.min(page * LIMIT, data.totalDocs)} of ${data.totalDocs}`
              : '0 of 0'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data?.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="px-2">
              Page {data?.page || 1} of {data?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!data?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionListView
