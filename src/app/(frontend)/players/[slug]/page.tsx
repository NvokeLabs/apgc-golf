import type { Metadata } from 'next'

import { GlassCard } from '@/components/golf'
import RichText from '@/components/RichText'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
  Award,
  ChevronLeft,
  Flag,
  Hash,
  Mail,
  Trophy,
  TrendingUp,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

type Args = {
  params: Promise<{ slug: string }>
}

const getPlayer = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'players',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  return result.docs[0] || null
})

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const players = await payload.find({
    collection: 'players',
    limit: 100,
    select: {
      slug: true,
    },
  })

  return players.docs.map((player) => ({
    slug: player.slug,
  }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const player = await getPlayer(slug)

  if (!player) {
    return {
      title: 'Player Not Found | APGC Golf',
    }
  }

  return {
    title: `${player.name} | APGC Golf`,
    description: player.memberDescription || `View ${player.name}'s profile on APGC Golf.`,
  }
}

export const revalidate = 3600

function DetailRow({
  label,
  value,
  icon,
  isLast = false,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between py-4 ${!isLast ? 'border-b border-[#0b3d2e]/10' : ''}`}
    >
      <div className="flex items-center gap-2 text-[#636364] text-sm mb-1 sm:mb-0">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-[#0b3d2e] font-medium text-right">{value}</div>
    </div>
  )
}

export default async function PlayerPage({ params }: Args) {
  const { slug } = await params
  const player = await getPlayer(slug)

  if (!player) {
    notFound()
  }

  const imageUrl =
    typeof player.image === 'object' && player.image?.url
      ? player.image.url
      : 'https://images.unsplash.com/photo-1633597470203-77c0986ecc4d?w=600&q=80'

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link
          href="/players"
          className="inline-flex items-center mb-8 text-[#636364] hover:text-[#0b3d2e] pl-0 -ml-4 group transition-colors"
        >
          <ChevronLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Players
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Image */}
          <div className="lg:col-span-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#0b3d2e]/10 h-[400px] lg:h-[600px] shadow-2xl lg:sticky lg:top-32">
              <Image
                src={imageUrl}
                alt={player.name}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d2e] via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h1 className="text-4xl lg:text-5xl font-serif italic text-white mb-2 leading-tight">
                  {player.name}
                </h1>
                {player.country && (
                  <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-widest text-sm">
                    <Flag className="w-4 h-4" /> {player.country}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {player.rank && (
                <GlassCard className="px-6 py-4">
                  <p className="text-[#636364] text-xs uppercase tracking-wider mb-1">World Rank</p>
                  <p className="text-3xl text-[#0b3d2e] font-light">#{player.rank}</p>
                </GlassCard>
              )}
              <GlassCard className="px-6 py-4">
                <p className="text-[#636364] text-xs uppercase tracking-wider mb-1">Tour Wins</p>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#0b3d2e]" />
                  <p className="text-3xl text-[#0b3d2e] font-light">{player.wins ?? 0}</p>
                </div>
              </GlassCard>
              <GlassCard className="px-6 py-4">
                <p className="text-[#636364] text-xs uppercase tracking-wider mb-1">Points</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0b3d2e]" />
                  <p className="text-3xl text-[#0b3d2e] font-light">{player.points ?? 0}</p>
                </div>
              </GlassCard>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Detailed Profile Section */}
              <GlassCard className="p-8">
                <h3 className="text-lg text-[#0b3d2e] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-[#0b3d2e]/10">
                  Member Profile
                </h3>

                <div className="flex flex-col gap-1">
                  {player.memberId && (
                    <DetailRow
                      label="Member ID"
                      value={player.memberId}
                      icon={<Hash className="w-4 h-4" />}
                    />
                  )}
                  <DetailRow
                    label="Full Name"
                    value={player.name}
                    icon={<User className="w-4 h-4" />}
                  />
                  {player.gender && <DetailRow label="Gender" value={player.gender} />}
                  {player.handicap != null && (
                    <DetailRow label="Handicap" value={player.handicap} />
                  )}
                  {player.latestGrossScore != null && (
                    <DetailRow label="Latest Gross Score" value={player.latestGrossScore} />
                  )}
                  {player.email && (
                    <DetailRow
                      label="Email"
                      value={player.email}
                      icon={<Mail className="w-4 h-4" />}
                    />
                  )}
                  {player.status && <DetailRow label="Status" value={player.status} />}
                  <DetailRow
                    label="Match Play"
                    value={
                      player.matchPlayAvailable ? (
                        <span className="flex items-center justify-end gap-2 text-[#0b3d2e]">
                          Available <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-2 text-[#636364]">
                          Unavailable <XCircle className="w-4 h-4" />
                        </span>
                      )
                    }
                    isLast
                  />
                </div>
              </GlassCard>

              {/* Bio & Results Column */}
              <div className="space-y-8">
                {/* Bio */}
                <div>
                  <h3 className="text-xl text-[#0b3d2e] font-light mb-4">
                    About the <span className="font-serif italic font-medium">Player</span>
                  </h3>
                  <GlassCard className="p-6">
                    {player.bio ? (
                      <div className="prose prose-sm max-w-none text-[#636364]">
                        <RichText data={player.bio} />
                      </div>
                    ) : (
                      <p className="text-[#636364] leading-relaxed">
                        No biography available for this player.
                      </p>
                    )}
                    {player.memberDescription && (
                      <div className="mt-4 pt-4 border-t border-[#0b3d2e]/10">
                        <p className="text-sm text-[#0b3d2e]/60 uppercase tracking-wider mb-2">
                          Member Data
                        </p>
                        <p className="text-[#0b3d2e] text-sm">{player.memberDescription}</p>
                      </div>
                    )}
                  </GlassCard>
                </div>

                {/* Career Stats */}
                <div>
                  <h3 className="text-xl text-[#0b3d2e] font-light mb-4">
                    Career <span className="font-serif italic font-medium">Stats</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {player.age && (
                      <GlassCard className="p-4 text-center">
                        <p className="text-2xl font-light text-[#0b3d2e]">{player.age}</p>
                        <p className="text-xs text-[#636364] uppercase tracking-wider">Age</p>
                      </GlassCard>
                    )}
                    {player.turnedPro && (
                      <GlassCard className="p-4 text-center">
                        <p className="text-2xl font-light text-[#0b3d2e]">{player.turnedPro}</p>
                        <p className="text-xs text-[#636364] uppercase tracking-wider">
                          Turned Pro
                        </p>
                      </GlassCard>
                    )}
                    {player.majorChampionships != null && (
                      <GlassCard className="p-4 text-center col-span-2">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-5 h-5 text-[#0b3d2e]" />
                          <p className="text-2xl font-light text-[#0b3d2e]">
                            {player.majorChampionships}
                          </p>
                        </div>
                        <p className="text-xs text-[#636364] uppercase tracking-wider">
                          Major Championships
                        </p>
                      </GlassCard>
                    )}
                  </div>
                </div>

                {/* Recent Results */}
                {player.recentResults && player.recentResults.length > 0 && (
                  <div>
                    <h3 className="text-xl text-[#0b3d2e] font-light mb-4">
                      Recent <span className="font-serif italic font-medium">Results</span>
                    </h3>
                    <div className="space-y-3">
                      {player.recentResults.map((result, index) => (
                        <GlassCard
                          key={index}
                          className="flex items-center justify-between p-4 hover:bg-white/60 transition-colors"
                        >
                          <span className="text-[#0b3d2e] font-medium text-sm">
                            {result.tournament}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              result.position?.includes('1')
                                ? 'bg-[#0b3d2e]/20 text-[#0b3d2e]'
                                : 'bg-[#0b3d2e]/10 text-[#0b3d2e]'
                            }`}
                          >
                            {result.position}
                          </span>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
