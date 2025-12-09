import type { Metadata } from 'next'
import type { Player } from '@/payload-types'

import { GlassCard } from '@/components/golf'
import RichText from '@/components/RichText'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Award, Calendar, Mail, MapPin, Trophy, User } from 'lucide-react'

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

export const revalidate = 3600 // Revalidate every hour

export default async function PlayerPage({ params }: Args) {
  const { slug } = await params
  const player = await getPlayer(slug)

  if (!player) {
    notFound()
  }

  const imageUrl =
    typeof player.image === 'object' && player.image?.url
      ? player.image.url
      : '/placeholder-player.jpg'

  return (
    <div className="container py-16">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Photo & Quick Stats */}
        <div className="lg:col-span-1">
          <GlassCard className="overflow-hidden">
            <div className="relative aspect-[3/4]">
              <Image
                src={imageUrl}
                alt={player.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {player.rank && (
                <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                  #{player.rank}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white">{player.name}</h1>
                {player.country && (
                  <div className="mt-2 flex items-center gap-2 text-white/70">
                    <MapPin className="h-4 w-4" />
                    <span>{player.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 p-6">
              {player.wins != null && (
                <StatItem icon={Trophy} label="Wins" value={player.wins.toString()} />
              )}
              {player.points != null && (
                <StatItem icon={Award} label="Points" value={player.points.toString()} />
              )}
              {player.handicap != null && (
                <StatItem icon={User} label="Handicap" value={player.handicap.toString()} />
              )}
              {player.age != null && (
                <StatItem icon={Calendar} label="Age" value={player.age.toString()} />
              )}
            </div>
          </GlassCard>

          {/* Contact */}
          {player.email && (
            <GlassCard className="mt-6 p-6">
              <h3 className="mb-4 font-semibold text-white">Contact</h3>
              <a
                href={`mailto:${player.email}`}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
              >
                <Mail className="h-4 w-4" />
                <span>{player.email}</span>
              </a>
              {player.matchPlayAvailable && (
                <p className="mt-3 text-sm text-white/60">Available for match play</p>
              )}
            </GlassCard>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          {player.bio && (
            <GlassCard className="p-6">
              <h2 className="mb-4 text-xl font-bold text-white">About</h2>
              <div className="prose prose-invert max-w-none">
                <RichText data={player.bio} />
              </div>
            </GlassCard>
          )}

          {player.memberDescription && !player.bio && (
            <GlassCard className="p-6">
              <h2 className="mb-4 text-xl font-bold text-white">About</h2>
              <p className="text-white/80">{player.memberDescription}</p>
            </GlassCard>
          )}

          {/* Career Info */}
          <GlassCard className="p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Career</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {player.turnedPro && (
                <div>
                  <p className="text-sm text-white/50">Turned Pro</p>
                  <p className="text-lg font-semibold text-white">{player.turnedPro}</p>
                </div>
              )}
              {player.majorChampionships !== undefined && (
                <div>
                  <p className="text-sm text-white/50">Major Championships</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {player.majorChampionships}
                  </p>
                </div>
              )}
              {player.memberId && (
                <div>
                  <p className="text-sm text-white/50">Member ID</p>
                  <p className="text-lg font-semibold text-white">{player.memberId}</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Recent Results */}
          {player.recentResults && player.recentResults.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Recent Results</h2>
              <div className="space-y-3">
                {player.recentResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{result.tournament}</p>
                      {result.date && (
                        <p className="text-sm text-white/50">
                          {new Date(result.date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="rounded-full bg-emerald-600/20 px-4 py-2">
                      <span className="font-bold text-emerald-400">{result.position}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-5 w-5 text-emerald-400" />
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  )
}
