import { renderToBuffer } from '@react-pdf/renderer'
import { TicketPDF } from '@/components/TicketPDF/TicketPDF'
import type { TicketPDFProps } from '@/components/TicketPDF/TicketPDF'

export type RenderTicketPdfParams = TicketPDFProps

/**
 * Single source of ticket PDF bytes. Used by the on-demand download route AND the
 * confirmation email so the two paths never drift.
 */
export async function renderTicketPdf(params: RenderTicketPdfParams): Promise<Buffer> {
  return renderToBuffer(TicketPDF(params))
}
