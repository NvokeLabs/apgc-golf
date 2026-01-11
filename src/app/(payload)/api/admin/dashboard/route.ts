import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Get counts in parallel
    const [
      playersResult,
      eventsResult,
      pendingRegistrationsResult,
      sponsorsResult,
      recentRegistrations,
      recentSponsorRegistrations,
    ] = await Promise.all([
      // Total players
      payload.count({
        collection: 'players',
      }),
      // Upcoming events (events with date >= today)
      payload.find({
        collection: 'events',
        where: {
          date: {
            greater_than_equal: new Date().toISOString(),
          },
        },
        limit: 10,
        sort: 'date',
      }),
      // Pending registrations
      payload.count({
        collection: 'event-registrations',
        where: {
          paymentStatus: {
            equals: 'pending',
          },
        },
      }),
      // Active sponsors
      payload.count({
        collection: 'sponsors',
      }),
      // Recent event registrations (last 7 days)
      payload.find({
        collection: 'event-registrations',
        limit: 5,
        sort: '-createdAt',
        depth: 1,
      }),
      // Recent sponsor registrations (last 7 days)
      payload.find({
        collection: 'sponsor-registrations',
        limit: 5,
        sort: '-createdAt',
      }),
    ])

    // Format recent activity
    const recentActivity = [
      ...recentRegistrations.docs.map((reg) => ({
        type: 'event-registration' as const,
        id: reg.id,
        title: `New event registration`,
        description: `${reg.playerName} registered for an event`,
        timestamp: reg.createdAt,
      })),
      ...recentSponsorRegistrations.docs.map((reg) => ({
        type: 'sponsor-registration' as const,
        id: reg.id,
        title: `New sponsor inquiry`,
        description: `${reg.companyName} submitted a sponsorship inquiry`,
        timestamp: reg.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)

    // Get next event
    const nextEvent = eventsResult.docs[0] || null

    return NextResponse.json({
      metrics: {
        totalPlayers: playersResult.totalDocs,
        upcomingEvents: eventsResult.totalDocs,
        pendingRegistrations: pendingRegistrationsResult.totalDocs,
        activeSponsors: sponsorsResult.totalDocs,
      },
      nextEvent: nextEvent
        ? {
            id: nextEvent.id,
            title: nextEvent.title,
            date: nextEvent.date,
            location: nextEvent.location,
          }
        : null,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
