import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    backgroundColor: '#059669',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtext: {
    color: '#d1fae5',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  eventSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  eventDetail: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 6,
  },
  eventDetailLabel: {
    fontWeight: 'bold',
    color: '#374151',
  },
  attendeeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  attendeeCategory: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  qrCode: {
    width: 150,
    height: 150,
  },
  ticketCode: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'Courier',
  },
  instructions: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 9,
    color: '#92400e',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

export type TicketPDFProps = {
  playerName: string
  playerEmail: string
  category: string
  eventName: string
  eventDate: string
  eventLocation: string
  ticketCode: string
  qrCodeDataUrl: string
}

export function TicketPDF({
  playerName,
  playerEmail,
  category,
  eventName,
  eventDate,
  eventLocation,
  ticketCode,
  qrCodeDataUrl,
}: TicketPDFProps) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>APGC Golf</Text>
          <Text style={styles.headerSubtext}>Event Ticket</Text>
        </View>

        <View style={styles.content}>
          {/* Event Details */}
          <View style={styles.eventSection}>
            <Text style={styles.eventTitle}>{eventName}</Text>
            <Text style={styles.eventDetail}>
              <Text style={styles.eventDetailLabel}>Date: </Text>
              {eventDate}
            </Text>
            <Text style={styles.eventDetail}>
              <Text style={styles.eventDetailLabel}>Location: </Text>
              {eventLocation}
            </Text>
          </View>

          {/* Attendee Info */}
          <View style={styles.attendeeSection}>
            <Text style={styles.sectionTitle}>Attendee</Text>
            <Text style={styles.attendeeName}>{playerName}</Text>
            <Text style={styles.attendeeCategory}>{category} • {playerEmail}</Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            <Image src={qrCodeDataUrl} style={styles.qrCode} />
            <Text style={styles.ticketCode}>{ticketCode}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Check-in Instructions</Text>
            <Text style={styles.instructionsText}>
              Present this QR code at the event entrance. Each ticket can only be scanned once.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} APGC Golf. This ticket is non-transferable.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
