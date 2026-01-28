import type { GlobalConfig } from 'payload'

import { revalidateSiteLabels } from './hooks/revalidateSiteLabels'

export const SiteLabels: GlobalConfig = {
  slug: 'site-labels',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Status Labels',
          fields: [
            {
              name: 'statusLabels',
              type: 'group',
              fields: [
                {
                  name: 'registrationOpen',
                  type: 'text',
                  defaultValue: 'Registration Open',
                  admin: { width: '50%' },
                },
                {
                  name: 'registrationClosed',
                  type: 'text',
                  defaultValue: 'Registration Closed',
                  admin: { width: '50%' },
                },
                {
                  name: 'soldOut',
                  type: 'text',
                  defaultValue: 'Sold Out',
                  admin: { width: '50%' },
                },
                {
                  name: 'upcoming',
                  type: 'text',
                  defaultValue: 'Upcoming',
                  admin: { width: '50%' },
                },
                {
                  name: 'comingSoon',
                  type: 'text',
                  defaultValue: 'Coming Soon',
                  admin: { width: '50%' },
                },
                {
                  name: 'eventCompleted',
                  type: 'text',
                  defaultValue: 'Event Completed',
                  admin: { width: '50%' },
                },
                {
                  name: 'open',
                  type: 'text',
                  defaultValue: 'Open',
                  admin: { width: '50%' },
                },
                {
                  name: 'closed',
                  type: 'text',
                  defaultValue: 'Closed',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Button Labels',
          fields: [
            {
              name: 'buttonLabels',
              type: 'group',
              fields: [
                {
                  name: 'registerNow',
                  type: 'text',
                  defaultValue: 'Register Now',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewDetails',
                  type: 'text',
                  defaultValue: 'View Details',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewAll',
                  type: 'text',
                  defaultValue: 'View All',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewAllEvents',
                  type: 'text',
                  defaultValue: 'View All Events',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewAllPlayers',
                  type: 'text',
                  defaultValue: 'View All Players',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewAllNews',
                  type: 'text',
                  defaultValue: 'View News Archive',
                  admin: { width: '50%' },
                },
                {
                  name: 'readMore',
                  type: 'text',
                  defaultValue: 'Read More',
                  admin: { width: '50%' },
                },
                {
                  name: 'readArticle',
                  type: 'text',
                  defaultValue: 'Read Article',
                  admin: { width: '50%' },
                },
                {
                  name: 'backToHome',
                  type: 'text',
                  defaultValue: 'Back to Home',
                  admin: { width: '50%' },
                },
                {
                  name: 'continueToPayment',
                  type: 'text',
                  defaultValue: 'Continue to Payment',
                  admin: { width: '50%' },
                },
                {
                  name: 'inquireNow',
                  type: 'text',
                  defaultValue: 'Inquire Now',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewProfile',
                  type: 'text',
                  defaultValue: 'View Profile',
                  admin: { width: '50%' },
                },
                {
                  name: 'eventDetails',
                  type: 'text',
                  defaultValue: 'Event Details',
                  admin: { width: '50%' },
                },
                {
                  name: 'tryAgain',
                  type: 'text',
                  defaultValue: 'Try Again',
                  admin: { width: '50%' },
                },
                {
                  name: 'browseMoreEvents',
                  type: 'text',
                  defaultValue: 'Browse More Events',
                  admin: { width: '50%' },
                },
                {
                  name: 'returnToHome',
                  type: 'text',
                  defaultValue: 'Return to Home',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Field Labels',
          fields: [
            {
              name: 'fieldLabels',
              type: 'group',
              fields: [
                {
                  name: 'prizeFund',
                  type: 'text',
                  defaultValue: 'Prize Fund',
                  admin: { width: '50%' },
                },
                {
                  name: 'location',
                  type: 'text',
                  defaultValue: 'Location',
                  admin: { width: '50%' },
                },
                {
                  name: 'date',
                  type: 'text',
                  defaultValue: 'Date',
                  admin: { width: '50%' },
                },
                {
                  name: 'tournamentDates',
                  type: 'text',
                  defaultValue: 'Tournament Dates',
                  admin: { width: '50%' },
                },
                {
                  name: 'entryFee',
                  type: 'text',
                  defaultValue: 'Entry Fee',
                  admin: { width: '50%' },
                },
                {
                  name: 'careerWins',
                  type: 'text',
                  defaultValue: 'Career Wins',
                  admin: { width: '50%' },
                },
                {
                  name: 'points',
                  type: 'text',
                  defaultValue: 'Points',
                  admin: { width: '50%' },
                },
                {
                  name: 'rank',
                  type: 'text',
                  defaultValue: 'Rank',
                  admin: { width: '50%' },
                },
                {
                  name: 'worldRank',
                  type: 'text',
                  defaultValue: 'World Rank',
                  admin: { width: '50%' },
                },
                {
                  name: 'tourWins',
                  type: 'text',
                  defaultValue: 'Tour Wins',
                  admin: { width: '50%' },
                },
                {
                  name: 'registeredPlayers',
                  type: 'text',
                  defaultValue: 'Registered Players',
                  admin: { width: '50%' },
                },
                {
                  name: 'status',
                  type: 'text',
                  defaultValue: 'Status',
                  admin: { width: '50%' },
                },
                {
                  name: 'alumniPrice',
                  type: 'text',
                  defaultValue: 'Alumni Price',
                  admin: { width: '50%' },
                },
                {
                  name: 'memberId',
                  type: 'text',
                  defaultValue: 'Member ID',
                  admin: { width: '50%' },
                },
                {
                  name: 'fullName',
                  type: 'text',
                  defaultValue: 'Full Name',
                  admin: { width: '50%' },
                },
                {
                  name: 'gender',
                  type: 'text',
                  defaultValue: 'Gender',
                  admin: { width: '50%' },
                },
                {
                  name: 'handicap',
                  type: 'text',
                  defaultValue: 'Handicap',
                  admin: { width: '50%' },
                },
                {
                  name: 'latestGrossScore',
                  type: 'text',
                  defaultValue: 'Latest Gross Score',
                  admin: { width: '50%' },
                },
                {
                  name: 'email',
                  type: 'text',
                  defaultValue: 'Email',
                  admin: { width: '50%' },
                },
                {
                  name: 'matchPlay',
                  type: 'text',
                  defaultValue: 'Match Play',
                  admin: { width: '50%' },
                },
                {
                  name: 'age',
                  type: 'text',
                  defaultValue: 'Age',
                  admin: { width: '50%' },
                },
                {
                  name: 'turnedPro',
                  type: 'text',
                  defaultValue: 'Turned Pro',
                  admin: { width: '50%' },
                },
                {
                  name: 'majorChampionships',
                  type: 'text',
                  defaultValue: 'Major Championships',
                  admin: { width: '50%' },
                },
                {
                  name: 'wins',
                  type: 'text',
                  defaultValue: 'Wins',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Navigation Labels',
          fields: [
            {
              name: 'navigationLabels',
              type: 'group',
              fields: [
                {
                  name: 'backToEventList',
                  type: 'text',
                  defaultValue: 'Back to Event List',
                  admin: { width: '50%' },
                },
                {
                  name: 'backToEvent',
                  type: 'text',
                  defaultValue: 'Back to Event',
                  admin: { width: '50%' },
                },
                {
                  name: 'backToSponsors',
                  type: 'text',
                  defaultValue: 'Back to Sponsors',
                  admin: { width: '50%' },
                },
                {
                  name: 'backToPlayers',
                  type: 'text',
                  defaultValue: 'Back to Players',
                  admin: { width: '50%' },
                },
                {
                  name: 'backToNews',
                  type: 'text',
                  defaultValue: 'Back to News',
                  admin: { width: '50%' },
                },
                {
                  name: 'backToEvents',
                  type: 'text',
                  defaultValue: 'Back to Events',
                  admin: { width: '50%' },
                },
                {
                  name: 'viewOtherEvents',
                  type: 'text',
                  defaultValue: 'View other events',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Section Labels',
          fields: [
            {
              name: 'sectionLabels',
              type: 'group',
              fields: [
                {
                  name: 'aboutTheEvent',
                  type: 'text',
                  defaultValue: 'About the Event',
                  admin: { width: '50%' },
                },
                {
                  name: 'aboutThePlayer',
                  type: 'text',
                  defaultValue: 'About the Player',
                  admin: { width: '50%' },
                },
                {
                  name: 'eventSchedule',
                  type: 'text',
                  defaultValue: 'Event Schedule',
                  admin: { width: '50%' },
                },
                {
                  name: 'teeTimesAndPairings',
                  type: 'text',
                  defaultValue: 'Tee Times & Pairings',
                  admin: { width: '50%' },
                },
                {
                  name: 'eventGallery',
                  type: 'text',
                  defaultValue: 'Event Gallery',
                  admin: { width: '50%' },
                },
                {
                  name: 'registration',
                  type: 'text',
                  defaultValue: 'Registration',
                  admin: { width: '50%' },
                },
                {
                  name: 'eventSponsors',
                  type: 'text',
                  defaultValue: 'Event Sponsors',
                  admin: { width: '50%' },
                },
                {
                  name: 'memberProfile',
                  type: 'text',
                  defaultValue: 'Member Profile',
                  admin: { width: '50%' },
                },
                {
                  name: 'careerStats',
                  type: 'text',
                  defaultValue: 'Career Stats',
                  admin: { width: '50%' },
                },
                {
                  name: 'recentResults',
                  type: 'text',
                  defaultValue: 'Recent Results',
                  admin: { width: '50%' },
                },
                {
                  name: 'topPlayers',
                  type: 'text',
                  defaultValue: 'Top Players',
                  admin: { width: '50%' },
                },
                {
                  name: 'allPlayers',
                  type: 'text',
                  defaultValue: 'All Players',
                  admin: { width: '50%' },
                },
                {
                  name: 'relatedArticles',
                  type: 'text',
                  defaultValue: 'Related Articles',
                  admin: { width: '50%' },
                },
                {
                  name: 'shareArticle',
                  type: 'text',
                  defaultValue: 'Share Article',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Misc Labels',
          fields: [
            {
              name: 'miscLabels',
              type: 'group',
              fields: [
                {
                  name: 'limitedSpots',
                  type: 'text',
                  defaultValue: 'Limited spots available',
                  admin: { width: '50%' },
                },
                {
                  name: 'noResultsFound',
                  type: 'text',
                  defaultValue: 'No results found',
                  admin: { width: '50%' },
                },
                {
                  name: 'noEventsFound',
                  type: 'text',
                  defaultValue: 'No events found.',
                  admin: { width: '50%' },
                },
                {
                  name: 'noPlayersFound',
                  type: 'text',
                  defaultValue: 'No players found',
                  admin: { width: '50%' },
                },
                {
                  name: 'noArticlesFound',
                  type: 'text',
                  defaultValue: 'No articles found',
                  admin: { width: '50%' },
                },
                {
                  name: 'minRead',
                  type: 'text',
                  defaultValue: 'min read',
                  admin: { width: '50%' },
                },
                {
                  name: 'group',
                  type: 'text',
                  defaultValue: 'Group',
                  admin: { width: '50%' },
                },
                {
                  name: 'tee',
                  type: 'text',
                  defaultValue: 'Tee',
                  admin: { width: '50%' },
                },
                {
                  name: 'mostPopular',
                  type: 'text',
                  defaultValue: 'Most Popular',
                  admin: { width: '50%' },
                },
                {
                  name: 'available',
                  type: 'text',
                  defaultValue: 'Available',
                  admin: { width: '50%' },
                },
                {
                  name: 'unavailable',
                  type: 'text',
                  defaultValue: 'Unavailable',
                  admin: { width: '50%' },
                },
                {
                  name: 'mvp',
                  type: 'text',
                  defaultValue: 'MVP',
                  admin: { width: '50%' },
                },
                {
                  name: 'memberData',
                  type: 'text',
                  defaultValue: 'Member Data',
                  admin: { width: '50%' },
                },
                {
                  name: 'noBiographyAvailable',
                  type: 'text',
                  defaultValue: 'No biography available for this player.',
                  admin: { width: '50%' },
                },
                {
                  name: 'pts',
                  type: 'text',
                  defaultValue: 'pts',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteLabels],
  },
}
