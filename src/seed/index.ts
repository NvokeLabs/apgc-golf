/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payload } from 'payload'

export async function seedDatabase(payload: Payload) {
  console.log('🌱 Starting database seed...')

  // Seed Players
  const players = await seedPlayers(payload)
  console.log(`✅ Created ${players.length} players`)

  // Seed Events
  const events = await seedEvents(payload)
  console.log(`✅ Created ${events.length} events`)

  // Seed News
  const news = await seedNews(payload)
  console.log(`✅ Created ${news.length} news articles`)

  // Seed Sponsors
  const sponsors = await seedSponsors(payload)
  console.log(`✅ Created ${sponsors.length} sponsors`)

  console.log('🎉 Database seed completed!')
}

async function seedPlayers(payload: Payload) {
  const playersData = [
    {
      name: 'Ricky Wijaya',
      slug: 'ricky-wijaya',
      rank: 1,
      country: 'Indonesia',
      wins: 12,
      points: 2450,
      age: 35,
      turnedPro: '2012',
      bio: 'Ricky Wijaya is a seasoned golfer with over a decade of professional experience. Known for his precise iron play and calm demeanor under pressure.',
      memberId: 'APGC-001',
      gender: 'male' as const,
      handicap: 2,
      latestGrossScore: 72,
      email: 'ricky.wijaya@example.com',
      status: 'active' as const,
      isFeatured: true,
    },
    {
      name: 'Budi Santoso',
      slug: 'budi-santoso',
      rank: 2,
      country: 'Indonesia',
      wins: 8,
      points: 2100,
      age: 42,
      turnedPro: '2005',
      bio: 'A veteran of the game, Budi brings experience and consistency to every tournament he enters.',
      memberId: 'APGC-002',
      gender: 'male' as const,
      handicap: 4,
      latestGrossScore: 74,
      email: 'budi.santoso@example.com',
      status: 'active' as const,
      isFeatured: true,
    },
    {
      name: 'Dewi Kusuma',
      slug: 'dewi-kusuma',
      rank: 3,
      country: 'Indonesia',
      wins: 6,
      points: 1850,
      age: 28,
      turnedPro: '2018',
      bio: 'Rising star Dewi Kusuma has quickly made a name for herself with aggressive play and exceptional putting skills.',
      memberId: 'APGC-003',
      gender: 'female' as const,
      handicap: 5,
      latestGrossScore: 75,
      email: 'dewi.kusuma@example.com',
      status: 'active' as const,
      isFeatured: true,
    },
    {
      name: 'Ahmad Hidayat',
      slug: 'ahmad-hidayat',
      rank: 4,
      country: 'Indonesia',
      wins: 5,
      points: 1720,
      age: 31,
      turnedPro: '2015',
      bio: 'Ahmad is known for his powerful drives and strategic course management.',
      memberId: 'APGC-004',
      gender: 'male' as const,
      handicap: 6,
      latestGrossScore: 76,
      email: 'ahmad.hidayat@example.com',
      status: 'active' as const,
      isFeatured: true,
    },
    {
      name: 'Siti Rahayu',
      slug: 'siti-rahayu',
      rank: 5,
      country: 'Indonesia',
      wins: 4,
      points: 1580,
      age: 26,
      turnedPro: '2020',
      bio: 'One of the youngest members, Siti has shown remarkable improvement each season.',
      memberId: 'APGC-005',
      gender: 'female' as const,
      handicap: 7,
      latestGrossScore: 77,
      email: 'siti.rahayu@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Hendra Pratama',
      slug: 'hendra-pratama',
      rank: 6,
      country: 'Indonesia',
      wins: 3,
      points: 1450,
      age: 38,
      turnedPro: '2010',
      bio: 'Hendra brings years of competitive experience and mentors younger players.',
      memberId: 'APGC-006',
      gender: 'male' as const,
      handicap: 8,
      latestGrossScore: 78,
      email: 'hendra.pratama@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Maya Putri',
      slug: 'maya-putri',
      rank: 7,
      country: 'Indonesia',
      wins: 3,
      points: 1380,
      age: 29,
      turnedPro: '2017',
      bio: 'Maya is celebrated for her consistent performance and sportsmanship.',
      memberId: 'APGC-007',
      gender: 'female' as const,
      handicap: 9,
      latestGrossScore: 79,
      email: 'maya.putri@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Dian Permana',
      slug: 'dian-permana',
      rank: 8,
      country: 'Indonesia',
      wins: 2,
      points: 1250,
      age: 33,
      turnedPro: '2014',
      bio: 'Dian excels in challenging course conditions and adverse weather.',
      memberId: 'APGC-008',
      gender: 'male' as const,
      handicap: 10,
      latestGrossScore: 80,
      email: 'dian.permana@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Rina Wulandari',
      slug: 'rina-wulandari',
      rank: 9,
      country: 'Indonesia',
      wins: 2,
      points: 1180,
      age: 25,
      turnedPro: '2021',
      bio: 'A promising newcomer with exceptional short game skills.',
      memberId: 'APGC-009',
      gender: 'female' as const,
      handicap: 11,
      latestGrossScore: 81,
      email: 'rina.wulandari@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Eko Prasetyo',
      slug: 'eko-prasetyo',
      rank: 10,
      country: 'Indonesia',
      wins: 1,
      points: 1050,
      age: 40,
      turnedPro: '2008',
      bio: 'Eko is a club favorite known for his friendly demeanor and steady play.',
      memberId: 'APGC-010',
      gender: 'male' as const,
      handicap: 12,
      latestGrossScore: 82,
      email: 'eko.prasetyo@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Fitri Handayani',
      slug: 'fitri-handayani',
      rank: 11,
      country: 'Indonesia',
      wins: 1,
      points: 980,
      age: 27,
      turnedPro: '2019',
      bio: 'Fitri has shown great potential and continues to improve her game.',
      memberId: 'APGC-011',
      gender: 'female' as const,
      handicap: 13,
      latestGrossScore: 83,
      email: 'fitri.handayani@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
    {
      name: 'Agus Setiawan',
      slug: 'agus-setiawan',
      rank: 12,
      country: 'Indonesia',
      wins: 1,
      points: 920,
      age: 36,
      turnedPro: '2013',
      bio: 'Agus combines technical skill with strategic thinking on the course.',
      memberId: 'APGC-012',
      gender: 'male' as const,
      handicap: 14,
      latestGrossScore: 84,
      email: 'agus.setiawan@example.com',
      status: 'active' as const,
      isFeatured: false,
    },
  ]

  const created = []
  for (const player of playersData) {
    try {
      const existing = await payload.find({
        collection: 'players',
        where: { slug: { equals: player.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        const doc = await payload.create({
          collection: 'players',
          data: player as any,
        })
        created.push(doc)
      }
    } catch (error) {
      console.error(`Failed to create player ${player.name}:`, error)
    }
  }
  return created
}

async function seedEvents(payload: Payload) {
  const eventsData = [
    {
      title: 'APGC Championship 2025',
      slug: 'apgc-championship-2025',
      date: new Date('2025-03-15').toISOString(),
      location: 'Pondok Indah Golf Course, Jakarta',
      tier: 'major' as const,
      prizeFund: 'Rp 500.000.000',
      status: 'open' as const,
      price: 2500000,
      description:
        'The flagship event of the APGC calendar. Join us for three days of world-class golf competition featuring the best alumni players.',
      isFeatured: true,
      schedule: [
        { day: 'Day 1 - Friday', activities: 'Registration & Practice Round' },
        { day: 'Day 2 - Saturday', activities: 'Round 1 & Round 2' },
        { day: 'Day 3 - Sunday', activities: 'Final Round & Awards Ceremony' },
      ],
    },
    {
      title: 'Spring Invitational 2025',
      slug: 'spring-invitational-2025',
      date: new Date('2025-04-20').toISOString(),
      location: 'Sentul Highlands Golf Club',
      tier: 'championship' as const,
      prizeFund: 'Rp 250.000.000',
      status: 'open' as const,
      price: 1500000,
      description:
        'A prestigious invitational tournament set in the beautiful highlands of Sentul. Limited spots available.',
      isFeatured: false,
      schedule: [
        { day: 'Day 1 - Saturday', activities: 'Round 1 (18 holes)' },
        { day: 'Day 2 - Sunday', activities: 'Round 2 & Prize Giving' },
      ],
    },
    {
      title: 'Monthly Medal - January',
      slug: 'monthly-medal-january-2025',
      date: new Date('2025-01-25').toISOString(),
      location: 'Royale Jakarta Golf Club',
      tier: 'qualifier' as const,
      prizeFund: 'Rp 50.000.000',
      status: 'open' as const,
      price: 500000,
      description:
        'Monthly qualifying event open to all APGC members. Great opportunity to earn ranking points.',
      isFeatured: false,
      schedule: [{ day: 'Saturday', activities: 'Shotgun Start 7:00 AM, 18 holes stroke play' }],
    },
    {
      title: 'Corporate Cup 2025',
      slug: 'corporate-cup-2025',
      date: new Date('2025-05-10').toISOString(),
      location: 'Damai Indah Golf - BSD',
      tier: 'championship' as const,
      prizeFund: 'Rp 300.000.000',
      status: 'upcoming' as const,
      price: 2000000,
      description:
        'Team competition where alumni represent their companies. Network while you play!',
      isFeatured: false,
      schedule: [
        { day: 'Day 1', activities: 'Team Registration & Practice' },
        { day: 'Day 2', activities: 'Tournament Round & Gala Dinner' },
      ],
    },
    {
      title: 'Season Finale 2025',
      slug: 'season-finale-2025',
      date: new Date('2025-11-22').toISOString(),
      location: 'Emeralda Golf Club',
      tier: 'major' as const,
      prizeFund: 'Rp 400.000.000',
      status: 'upcoming' as const,
      price: 2000000,
      description:
        'The grand finale of the 2025 season. Top 50 ranked players compete for the season championship.',
      isFeatured: false,
      schedule: [
        { day: 'Day 1 - Friday', activities: 'Welcome Dinner & Player Meeting' },
        { day: 'Day 2 - Saturday', activities: 'Round 1 & Round 2' },
        { day: 'Day 3 - Sunday', activities: 'Final Round & Season Awards' },
      ],
    },
  ]

  const created = []
  for (const event of eventsData) {
    try {
      const existing = await payload.find({
        collection: 'events',
        where: { slug: { equals: event.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        const doc = await payload.create({
          collection: 'events',
          data: event as any,
        })
        created.push(doc)
      }
    } catch (error) {
      console.error(`Failed to create event ${event.title}:`, error)
    }
  }
  return created
}

async function seedNews(payload: Payload) {
  const newsData = [
    {
      title: 'Ricky Wijaya Claims Third Consecutive Championship Title',
      slug: 'ricky-wijaya-third-championship',
      subtitle: 'Dominant performance secures his place in APGC history',
      category: 'Tournament',
      publishedDate: new Date('2024-12-01').toISOString(),
      readTime: 5,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'In a stunning display of skill and composure, Ricky Wijaya has secured his third consecutive APGC Championship title, cementing his legacy as one of the greatest players in the organization\'s history.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'The final round saw Wijaya maintain a steady lead throughout, finishing with a tournament total of 12-under par. His consistent performance across all three days demonstrated why he remains the player to beat in every event he enters.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'published' as const,
    },
    {
      title: 'New Partnership Announced with Leading Golf Equipment Brand',
      slug: 'new-partnership-golf-equipment',
      subtitle: 'Members to receive exclusive benefits and discounts',
      category: 'Announcement',
      publishedDate: new Date('2024-11-15').toISOString(),
      readTime: 3,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'APGC is proud to announce a new strategic partnership with TaylorMade, one of the world\'s premier golf equipment manufacturers. This partnership will bring exclusive benefits to all APGC members.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Members will enjoy 20% discounts on all equipment, priority access to new product launches, and complimentary club fitting sessions at participating retailers.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'published' as const,
    },
    {
      title: '2025 Tournament Calendar Released',
      slug: '2025-tournament-calendar',
      subtitle: 'Exciting new venues and increased prize pools announced',
      category: 'News',
      publishedDate: new Date('2024-11-01').toISOString(),
      readTime: 4,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'The APGC committee has officially released the 2025 tournament calendar, featuring 12 events across some of Indonesia\'s most prestigious golf courses.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Highlights include the return of the Championship to Pondok Indah Golf Course and a new Corporate Cup format that promises exciting team-based competition.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'published' as const,
    },
    {
      title: 'Youth Development Program Launches in January',
      slug: 'youth-development-program-launch',
      subtitle: 'Nurturing the next generation of golf talent',
      category: 'Community',
      publishedDate: new Date('2024-10-20').toISOString(),
      readTime: 4,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'APGC is launching a comprehensive youth development program aimed at introducing golf to children of members and the broader community.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'The program will offer weekly coaching sessions, equipment loans, and junior tournaments throughout the year.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'published' as const,
    },
  ]

  const created = []
  for (const article of newsData) {
    try {
      const existing = await payload.find({
        collection: 'news',
        where: { slug: { equals: article.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        const doc = await payload.create({
          collection: 'news',
          data: article as any,
        })
        created.push(doc)
      }
    } catch (error) {
      console.error(`Failed to create news article ${article.title}:`, error)
    }
  }
  return created
}

async function seedSponsors(payload: Payload) {
  const sponsorsData = [
    {
      name: 'Bank Central Asia',
      slug: 'bank-central-asia',
      tier: 'title' as const,
      website: 'https://www.bca.co.id',
      description: 'Indonesia\'s largest private bank and proud title sponsor of APGC.',
      isActive: true,
      order: 1,
      benefits: [
        { benefit: 'Exclusive naming rights' },
        { benefit: 'Premium logo placement' },
        { benefit: 'VIP hospitality tent' },
      ],
    },
    {
      name: 'Pertamina',
      slug: 'pertamina',
      tier: 'platinum' as const,
      website: 'https://www.pertamina.com',
      description: 'Indonesia\'s national oil company supporting Indonesian sports.',
      isActive: true,
      order: 2,
      benefits: [{ benefit: 'Logo on all event materials' }, { benefit: 'Speaking opportunity' }],
    },
    {
      name: 'Telkomsel',
      slug: 'telkomsel',
      tier: 'platinum' as const,
      website: 'https://www.telkomsel.com',
      description: 'Leading mobile network provider in Indonesia.',
      isActive: true,
      order: 3,
      benefits: [{ benefit: 'Digital presence' }, { benefit: 'Event activation booth' }],
    },
    {
      name: 'Garuda Indonesia',
      slug: 'garuda-indonesia',
      tier: 'gold' as const,
      website: 'https://www.garuda-indonesia.com',
      description: 'The national airline of Indonesia.',
      isActive: true,
      order: 4,
      benefits: [{ benefit: 'Logo placement' }, { benefit: 'Prize contribution' }],
    },
    {
      name: 'Tokopedia',
      slug: 'tokopedia',
      tier: 'gold' as const,
      website: 'https://www.tokopedia.com',
      description: 'Indonesia\'s leading e-commerce platform.',
      isActive: true,
      order: 5,
      benefits: [{ benefit: 'Digital presence' }, { benefit: 'Member discounts' }],
    },
    {
      name: 'Indofood',
      slug: 'indofood',
      tier: 'gold' as const,
      website: 'https://www.indofood.com',
      description: 'One of Indonesia\'s largest food processing companies.',
      isActive: true,
      order: 6,
      benefits: [{ benefit: 'Catering partnership' }, { benefit: 'Brand visibility' }],
    },
    {
      name: 'Astra International',
      slug: 'astra-international',
      tier: 'platinum' as const,
      website: 'https://www.astra.co.id',
      description: 'Indonesia\'s largest diversified conglomerate.',
      isActive: true,
      order: 7,
      benefits: [{ benefit: 'Vehicle display' }, { benefit: 'Premium sponsorship' }],
    },
    {
      name: 'Semen Indonesia',
      slug: 'semen-indonesia',
      tier: 'gold' as const,
      website: 'https://www.semenindonesia.com',
      description: 'Indonesia\'s largest cement producer.',
      isActive: true,
      order: 8,
      benefits: [{ benefit: 'Event signage' }, { benefit: 'Brand presence' }],
    },
    {
      name: 'Bank Mandiri',
      slug: 'bank-mandiri',
      tier: 'platinum' as const,
      website: 'https://www.bankmandiri.co.id',
      description: 'One of Indonesia\'s largest banks.',
      isActive: true,
      order: 9,
      benefits: [{ benefit: 'Banking services' }, { benefit: 'Member benefits' }],
    },
    {
      name: 'Unilever Indonesia',
      slug: 'unilever-indonesia',
      tier: 'gold' as const,
      website: 'https://www.unilever.co.id',
      description: 'Global consumer goods company with strong Indonesian presence.',
      isActive: true,
      order: 10,
      benefits: [{ benefit: 'Product sampling' }, { benefit: 'Gift bags' }],
    },
    {
      name: 'TaylorMade Golf',
      slug: 'taylormade-golf',
      tier: 'gold' as const,
      website: 'https://www.taylormadegolf.com',
      description: 'Official equipment partner of APGC.',
      isActive: true,
      order: 11,
      benefits: [{ benefit: 'Equipment discounts' }, { benefit: 'Pro shop presence' }],
    },
    {
      name: 'Titleist',
      slug: 'titleist',
      tier: 'gold' as const,
      website: 'https://www.titleist.com',
      description: 'Premium golf ball and equipment manufacturer.',
      isActive: true,
      order: 12,
      benefits: [{ benefit: 'Ball sponsorship' }, { benefit: 'Fitting days' }],
    },
  ]

  const created = []
  for (const sponsor of sponsorsData) {
    try {
      const existing = await payload.find({
        collection: 'sponsors',
        where: { slug: { equals: sponsor.slug } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        const doc = await payload.create({
          collection: 'sponsors',
          data: sponsor as any,
        })
        created.push(doc)
      }
    } catch (error) {
      console.error(`Failed to create sponsor ${sponsor.name}:`, error)
    }
  }
  return created
}
