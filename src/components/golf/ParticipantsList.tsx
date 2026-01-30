'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, User, Users, X } from 'lucide-react'
import type { EventParticipant } from '@/utilities/getEventParticipants'

interface ParticipantsListProps {
  participants: EventParticipant[]
  itemsPerPage?: number
}

export function ParticipantsList({ participants, itemsPerPage = 20 }: ParticipantsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants
    const query = searchQuery.toLowerCase()
    return participants.filter((p) => p.playerName.toLowerCase().includes(query))
  }, [participants, searchQuery])

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="space-y-6">
      {/* Header with total count */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#0b3d2e]/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b3d2e] to-[#145c44] shadow-lg shadow-[#0b3d2e]/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0b3d2e]">Peserta Terdaftar</h3>
            <p className="text-sm text-[#636364]">
              {participants.length} pendaftaran terkonfirmasi
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-5 h-5 text-[#0b3d2e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari peserta..."
            className="w-full pl-14 pr-12 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-[#0b3d2e]/10 text-[#0b3d2e] placeholder:text-[#0b3d2e]/40 focus:outline-none focus:border-[#0b3d2e]/30 focus:ring-2 focus:ring-[#0b3d2e]/10 transition-all duration-200"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[#0b3d2e]/10 hover:bg-[#0b3d2e]/20 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#0b3d2e]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search results count */}
        <AnimatePresence>
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-[#636364]"
            >
              Ditemukan{' '}
              <span className="font-semibold text-[#0b3d2e]">{filteredParticipants.length}</span>{' '}
              peserta
              {filteredParticipants.length !== participants.length && (
                <> dari {participants.length}</>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Participants List */}
      {currentParticipants.length > 0 ? (
        <div className="space-y-2">
          {currentParticipants.map((participant, index) => (
            <div
              key={participant.id}
              className="group relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/80 to-white/40 backdrop-blur-sm border border-[#0b3d2e]/5 hover:border-[#0b3d2e]/20 hover:shadow-md hover:shadow-[#0b3d2e]/5 transition-all duration-200"
            >
              {/* Avatar */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#0b3d2e]/10 to-[#0b3d2e]/5 border border-[#0b3d2e]/10">
                <User className="w-5 h-5 text-[#0b3d2e]/60" />
              </div>

              {/* Number and Name */}
              <div className="relative flex items-center gap-3 flex-1 min-w-0">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0b3d2e]/5 text-xs font-bold text-[#0b3d2e]/60">
                  {startIndex + index + 1}
                </span>
                <span className="text-[#0b3d2e] font-medium truncate">
                  {participant.playerName}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0b3d2e]/10 to-[#0b3d2e]/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#0b3d2e]/30" />
          </div>
          <h3 className="text-lg font-semibold text-[#0b3d2e]/60 mb-2">Tidak Ditemukan</h3>
          <p className="text-[#636364] text-sm max-w-xs">
            Tidak ada peserta dengan nama &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-6 border-t border-[#0b3d2e]/10"
        >
          <p className="text-sm text-[#636364]">
            Menampilkan <span className="font-semibold text-[#0b3d2e]">{startIndex + 1}</span>
            {' - '}
            <span className="font-semibold text-[#0b3d2e]">
              {Math.min(endIndex, filteredParticipants.length)}
            </span>
            {' dari '}
            <span className="font-semibold text-[#0b3d2e]">{filteredParticipants.length}</span>
          </p>

          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/60 border border-[#0b3d2e]/10 hover:bg-[#0b3d2e]/10 hover:border-[#0b3d2e]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-[#0b3d2e]" />
            </motion.button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1

                if (!showPage) {
                  if (page === 2 && currentPage > 3) {
                    return (
                      <span key={page} className="px-1 text-[#636364]/50">
                        ...
                      </span>
                    )
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 2) {
                    return (
                      <span key={page} className="px-1 text-[#636364]/50">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => goToPage(page)}
                    className={`relative flex items-center justify-center min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? 'text-white'
                        : 'text-[#0b3d2e]/70 hover:text-[#0b3d2e] hover:bg-[#0b3d2e]/5'
                    }`}
                  >
                    {currentPage === page && (
                      <motion.div
                        layoutId="activePage"
                        className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#0b3d2e] to-[#145c44] shadow-md shadow-[#0b3d2e]/20"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{page}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/60 border border-[#0b3d2e]/10 hover:bg-[#0b3d2e]/10 hover:border-[#0b3d2e]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4 text-[#0b3d2e]" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
