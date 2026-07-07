import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { TICKET_BG, SLOTS } from './layout'
import { formatTicketFrom } from '@/utilities/ticketing/formatTicketFrom'

// Read the committed artwork lazily (on first render) and memoize it as a data
// URL. It is loaded INSIDE render — not at module eval — so if the jpg is ever
// missing from a serverless bundle the failure surfaces during renderTicketPdf()
// and is caught by the caller's email-safe try/catch, instead of crashing the
// whole function at import time (before any handler runs). The asset is shipped
// to every ticket-rendering route via `outputFileTracingIncludes` in
// next.config.js (process.cwd()-based paths can't be statically traced).
let bgDataUrlCache: string | undefined
function getBackgroundDataUrl(): string {
  if (bgDataUrlCache === undefined) {
    const bgPath = path.join(process.cwd(), 'src/components/TicketPDF/assets/ticket-bg.jpg')
    bgDataUrlCache = `data:image/jpeg;base64,${readFileSync(bgPath).toString('base64')}`
  }
  return bgDataUrlCache
}

// Fixed portrait page width; height follows the artwork's aspect ratio.
const PAGE_WIDTH = 595
const PAGE_HEIGHT = PAGE_WIDTH * (TICKET_BG.height / TICKET_BG.width)

const px = (fx: number) => fx * PAGE_WIDTH
const py = (fy: number) => fy * PAGE_HEIGHT

const styles = StyleSheet.create({
  page: { position: 'relative' },
  // Single, explicitly-sized flow child. Anchoring the absolute overlays to this
  // relative canvas (instead of directly to the Page) keeps the full-height
  // background + overlays on ONE page — otherwise react-pdf paginates the
  // absolutely-positioned siblings onto a blank page 2.
  canvas: { position: 'relative', width: PAGE_WIDTH, height: PAGE_HEIGHT },
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
  const backgroundDataUrl = getBackgroundDataUrl()

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} wrap={false} style={styles.page}>
        <View style={styles.canvas}>
          {/* Full-bleed artwork */}
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt */}
          <Image src={backgroundDataUrl} style={styles.bg} />

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
        </View>
      </Page>
    </Document>
  )
}
