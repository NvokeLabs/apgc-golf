import QRCode from 'qrcode'

/**
 * Generate a QR code as a base64 data URL
 * @param data - The data to encode in the QR code (typically the ticket code)
 * @returns Base64 data URL of the QR code image
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate a QR code as a buffer (useful for PDF generation)
 * @param data - The data to encode in the QR code
 * @returns Buffer containing the QR code image
 */
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return buffer
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code buffer')
  }
}
