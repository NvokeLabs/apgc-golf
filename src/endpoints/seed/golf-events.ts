import type { RequiredDataFromCollectionSlug } from 'payload'

type EventSeedData = Omit<RequiredDataFromCollectionSlug<'events'>, 'image' | 'sponsors' | 'gallery'>

export const golfEvents: EventSeedData[] = [
  {
    title: 'APGC Annual Championship 2025',
    slug: 'apgc-annual-championship-2025',
    date: '2025-06-15T07:00:00.000Z',
    endDate: '2025-06-17T18:00:00.000Z',
    location: 'Taman Dayu Golf Club, Pasuruan',
    tier: 'major',
    status: 'open',
    price: 2500000,
    alumniPrice: 2000000,
    prizeFund: 'Rp 150,000,000',
    isFeatured: true,
    schedule: [
      {
        day: 'Day 1 - Friday',
        items: [
          { time: '06:00 AM', activity: 'Registration & Check-in', location: 'Clubhouse Lobby' },
          { time: '06:30 AM', activity: 'Breakfast', location: 'Club Restaurant' },
          { time: '07:00 AM', activity: 'Round 1 Tee Off', location: 'Tee 1 & 10' },
          { time: '12:00 PM', activity: 'Lunch Break', location: 'Club Restaurant' },
          { time: '06:00 PM', activity: 'Welcome Dinner', location: 'Ballroom' },
        ],
      },
      {
        day: 'Day 2 - Saturday',
        items: [
          { time: '06:30 AM', activity: 'Breakfast', location: 'Club Restaurant' },
          { time: '07:00 AM', activity: 'Round 2 Tee Off', location: 'Tee 1 & 10' },
          { time: '12:00 PM', activity: 'Lunch', location: 'Club Restaurant' },
          { time: '07:00 PM', activity: 'Networking Dinner', location: 'Poolside' },
        ],
      },
      {
        day: 'Day 3 - Sunday',
        items: [
          { time: '06:30 AM', activity: 'Breakfast', location: 'Club Restaurant' },
          { time: '07:00 AM', activity: 'Final Round Tee Off', location: 'Tee 1' },
          { time: '02:00 PM', activity: 'Awards Ceremony', location: 'Ballroom' },
          { time: '04:00 PM', activity: 'Closing Celebration', location: 'Clubhouse' },
        ],
      },
    ],
    pairings: [
      {
        group: 1,
        time: '07:00 AM',
        tee: '1',
        players: [{ name: 'Ahmad Rizki Pratama' }, { name: 'Budi Santoso' }, { name: 'Denny Wijaya' }],
      },
      {
        group: 2,
        time: '07:10 AM',
        tee: '1',
        players: [{ name: 'Citra Dewi Lestari' }, { name: 'Eka Putra Mahendra' }, { name: 'Fajar Nugroho' }],
      },
      {
        group: 3,
        time: '07:00 AM',
        tee: '10',
        players: [{ name: 'Gita Purnama Sari' }, { name: 'Hendra Kurniawan' }],
      },
    ],
  },
  {
    title: 'Spring Championship 2025',
    slug: 'spring-championship-2025',
    date: '2025-03-20T07:00:00.000Z',
    endDate: '2025-03-21T18:00:00.000Z',
    location: 'Bukit Darmo Golf, Surabaya',
    tier: 'championship',
    status: 'open',
    price: 1500000,
    alumniPrice: 1200000,
    prizeFund: 'Rp 75,000,000',
    isFeatured: false,
    schedule: [
      {
        day: 'Day 1 - Thursday',
        items: [
          { time: '06:30 AM', activity: 'Registration', location: 'Pro Shop' },
          { time: '07:00 AM', activity: 'Shotgun Start', location: 'All Tees' },
          { time: '01:00 PM', activity: 'Lunch & Scoring', location: 'Club Restaurant' },
        ],
      },
      {
        day: 'Day 2 - Friday',
        items: [
          { time: '07:00 AM', activity: 'Final Round', location: 'All Tees' },
          { time: '01:00 PM', activity: 'Awards & Lunch', location: 'Club Restaurant' },
        ],
      },
    ],
    pairings: [],
  },
  {
    title: 'Monthly Qualifier - February',
    slug: 'monthly-qualifier-february-2025',
    date: '2025-02-15T07:30:00.000Z',
    location: 'Graha Famili Golf, Surabaya',
    tier: 'qualifier',
    status: 'upcoming',
    price: 500000,
    alumniPrice: 400000,
    prizeFund: 'Rp 10,000,000',
    isFeatured: false,
    schedule: [
      {
        day: 'Tournament Day',
        items: [
          { time: '07:00 AM', activity: 'Registration', location: 'Clubhouse' },
          { time: '07:30 AM', activity: 'Shotgun Start', location: 'All Tees' },
          { time: '12:30 PM', activity: 'Lunch & Results', location: 'Restaurant' },
        ],
      },
    ],
    pairings: [],
  },
  {
    title: 'Alumni Reunion Tournament',
    slug: 'alumni-reunion-tournament-2025',
    date: '2025-08-10T07:00:00.000Z',
    location: 'Ciputra Golf Club, Surabaya',
    tier: 'championship',
    status: 'upcoming',
    price: 1800000,
    alumniPrice: 1500000,
    prizeFund: 'Rp 100,000,000',
    isFeatured: false,
    schedule: [],
    pairings: [],
  },
]
