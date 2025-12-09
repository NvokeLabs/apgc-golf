import type { RequiredDataFromCollectionSlug } from 'payload'

type NewsSeedData = Omit<RequiredDataFromCollectionSlug<'news'>, 'image' | 'author' | 'relatedArticles' | 'content'> & {
  contentText: string // We'll convert this to Lexical format in seed/index.ts
}

export const golfNews: NewsSeedData[] = [
  {
    title: 'Ahmad Rizki Claims Third APGC Championship Title',
    slug: 'ahmad-rizki-claims-third-apgc-championship',
    subtitle: 'Veteran golfer secures historic three-peat with stunning final round performance',
    category: 'tournament-recap',
    publishedDate: '2024-03-17T10:00:00.000Z',
    readTime: '5 min read',
    _status: 'published',
    contentText: `Ahmad Rizki Pratama has cemented his legacy as one of APGC's greatest players by capturing his third consecutive Annual Championship title at Taman Dayu Golf Club.

The 32-year-old veteran entered the final round with a two-stroke lead and never looked back, finishing with a 4-under 68 to win by five strokes over Budi Santoso.

"This one means everything to me," said Rizki after his victory. "The competition gets tougher every year, and to win three in a row is something I never imagined possible."

Rizki's final round featured five birdies against just one bogey, showcasing the consistent play that has made him the player to beat on the APGC circuit.

The championship drew a record 120 participants from across Indonesia, marking the largest field in the tournament's 15-year history.

Next up for Rizki is the upcoming Spring Championship, where he'll look to continue his dominant run.`,
  },
  {
    title: 'New Driving Range Opens at Club Headquarters',
    slug: 'new-driving-range-opens-club-headquarters',
    subtitle: 'State-of-the-art practice facility features TrackMan technology and covered hitting bays',
    category: 'club-news',
    publishedDate: '2024-02-28T09:00:00.000Z',
    readTime: '3 min read',
    _status: 'published',
    contentText: `APGC is proud to announce the opening of our brand new driving range facility at the club headquarters in Surabaya.

The 50-bay range features the latest in golf technology, including TrackMan launch monitors at every station, allowing members to track their ball flight and improve their game with data-driven insights.

Key features include:
- 30 covered hitting bays for all-weather practice
- 20 outdoor bays with natural grass
- TrackMan technology at every station
- Short game practice area with bunkers
- Professional instruction available daily

"This investment represents our commitment to helping our members improve their game," said Club President Ir. Hadi Sutanto. "We want APGC to be the premier golf community in East Java."

The facility is open daily from 6 AM to 9 PM. Members can book hitting bays through the new APGC mobile app.`,
  },
  {
    title: 'Citra Dewi Makes History as First Female Champion',
    slug: 'citra-dewi-makes-history-first-female-champion',
    subtitle: "26-year-old's victory opens new chapter for women's golf at APGC",
    category: 'member-spotlight',
    publishedDate: '2024-02-25T14:00:00.000Z',
    readTime: '4 min read',
    _status: 'published',
    contentText: `In a groundbreaking moment for APGC, Citra Dewi Lestari became the first woman to win a mixed-gender championship event, capturing the Women's Invitational title in dominant fashion.

The 26-year-old shot a tournament-record 6-under 66 in the final round to finish at 10-under par, four strokes ahead of her nearest competitor.

"I hope this inspires more women to take up competitive golf," said Citra. "The support from the APGC community has been incredible."

Citra joined APGC in 2019 after graduating from Polinema with a degree in Sports Science. She quickly made her mark on the amateur circuit before turning professional last year.

Her victory has sparked discussions about creating more opportunities for women golfers at the club, including a proposed Women's Championship series.

APGC President Ir. Hadi Sutanto congratulated Citra on her achievement: "Citra represents everything we value at APGC - dedication, sportsmanship, and excellence. We're proud to have her as a member."`,
  },
  {
    title: 'Improve Your Short Game: Tips from Coach Wawan',
    slug: 'improve-short-game-tips-coach-wawan',
    subtitle: 'APGC Head Professional shares secrets to lower your scores around the green',
    category: 'instruction',
    publishedDate: '2024-02-10T08:00:00.000Z',
    readTime: '6 min read',
    _status: 'published',
    contentText: `A strong short game is the fastest way to lower your scores. APGC Head Professional Coach Wawan shares his top tips for improving around the green.

**1. Master the Basic Chip**
Keep your weight forward, hands ahead of the ball, and make a pendulum motion with your shoulders. The key is consistency - same setup, same swing, every time.

**2. Learn Multiple Trajectories**
Sometimes you need a high, soft shot; other times a low runner. Practice both by adjusting ball position and club selection.

**3. Distance Control is Key**
Spend 80% of your practice time on distance control rather than direction. Most amateurs leave chips short or blast them past the hole.

**4. Read the Green First**
Before choosing your shot, read the green as if you were putting. Understand where the ball needs to land and how it will roll.

**5. Practice Under Pressure**
Create games and challenges during practice. Try to get up-and-down from 10 different positions to simulate on-course pressure.

Coach Wawan offers private lessons at the APGC practice facility. Contact the pro shop to book your session.`,
  },
]
