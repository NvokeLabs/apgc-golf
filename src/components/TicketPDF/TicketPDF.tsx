import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { TICKET_BG, SLOTS } from './layout'
import { formatTicketFrom } from '@/utilities/ticketing/formatTicketFrom'

// Read the committed artwork once at module load and embed it as a data URL so it
// is available in the serverless bundle (see next.config.mjs outputFileTracingIncludes).
const BG_PATH = path.join(process.cwd(), 'src/components/TicketPDF/assets/ticket-bg.jpg')
const BG_DATA_URL = `data:image/jpeg;base64,${readFileSync(BG_PATH).toString('base64')}`

// Fixed portrait page width; height follows the artwork's aspect ratio.
const PAGE_WIDTH = 595
const PAGE_HEIGHT = PAGE_WIDTH * (TICKET_BG.height / TICKET_BG.width)

const px = (fx: number) => fx * PAGE_WIDTH
const py = (fy: number) => fy * PAGE_HEIGHT

const styles = StyleSheet.create({
  page: { position: 'relative' },
  bg: { position: 'absolute', top: 0, left: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT },
  overlayText: {
    position: 'absolute',
    fontFamily: 'Times-Roman',
    color: '#1a1a1a',
    textAlign: 'center',
    justifyContent: 'center',
  },
  qr: { position: 'absolute' },
})

export type TicketPDFProps = {
  playerName: string
  category?: string | null
  alumniMajor?: string | null
  alumniClassYear?: number | null
  qrCodeDataUrl: string
}

export function TicketPDF({
  playerName,
  category,
  alumniMajor,
  alumniClassYear,
  qrCodeDataUrl,
}: TicketPDFProps) {
  const fromText = formatTicketFrom(category, alumniMajor, alumniClassYear)

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        {/* Full-bleed artwork */}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt */}
        <Image src={BG_DATA_URL} style={styles.bg} />

        {/* PLAYER slot */}
        <Text
          style={[
            styles.overlayText,
            {
              left: px(SLOTS.player.x),
              top: py(SLOTS.player.y),
              width: px(SLOTS.player.w),
              height: py(SLOTS.player.h),
              fontSize: py(SLOTS.player.h) * 0.6,
            },
          ]}
        >
          {playerName}
        </Text>

        {/* FROM slot */}
        <Text
          style={[
            styles.overlayText,
            {
              left: px(SLOTS.from.x),
              top: py(SLOTS.from.y),
              width: px(SLOTS.from.w),
              height: py(SLOTS.from.h),
              fontSize: py(SLOTS.from.h) * 0.6,
            },
          ]}
        >
          {fromText}
        </Text>

        {/* QR slot */}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt */}
        <Image
          src={qrCodeDataUrl}
          style={[
            styles.qr,
            {
              left: px(SLOTS.qr.x),
              top: py(SLOTS.qr.y),
              width: px(SLOTS.qr.w),
              height: py(SLOTS.qr.h),
            },
          ]}
        />
      </Page>
    </Document>
  )
}
