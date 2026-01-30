'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Users } from 'lucide-react'
import type { ReactNode } from 'react'

interface EventDetailsTabsProps {
  detailsContent: ReactNode
  participantsContent: ReactNode
  participantCount: number
}

export function EventDetailsTabs({
  detailsContent,
  participantsContent,
  participantCount,
}: EventDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'participants'>('details')

  const tabs = [
    { id: 'details' as const, label: 'Detail', icon: FileText },
    { id: 'participants' as const, label: 'Peserta', icon: Users, count: participantCount },
  ]

  return (
    <div className="w-full">
      {/* Glassy Tab Bar */}
      <div className="relative mb-8">
        <div className="relative flex gap-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl border border-[#0b3d2e]/10 shadow-lg shadow-[#0b3d2e]/5">
          {/* Animated background indicator */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-br from-[#0b3d2e] to-[#145c44] shadow-lg shadow-[#0b3d2e]/30"
            layoutId="activeTab"
            initial={false}
            animate={{
              left: activeTab === 'details' ? '6px' : '50%',
              width: activeTab === 'details' ? 'calc(50% - 10px)' : 'calc(50% - 10px)',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          />

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === tab.id ? 'text-white' : 'text-[#0b3d2e]/70 hover:text-[#0b3d2e]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`ml-1 px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/25 text-white'
                      : 'bg-[#0b3d2e]/10 text-[#0b3d2e]'
                  }`}
                >
                  {tab.count}
                </motion.span>
              )}
            </button>
          ))}
        </div>

        {/* Decorative glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#0b3d2e]/20 to-transparent blur-xl opacity-50 -z-10" />
      </div>

      {/* Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {activeTab === 'details' ? (
            <div className="space-y-12">{detailsContent}</div>
          ) : (
            participantsContent
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
