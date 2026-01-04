import crypto from 'crypto'

/**
 * Generate a unique ticket code in format APGC-{id}-{hash}
 * @param registrationId - The registration ID to include in the code
 * @returns A unique ticket code string
 */
export function generateTicketCode(registrationId: number | string): string {
  const id = String(registrationId)
  const randomBytes = crypto.randomBytes(4).toString('hex')
  const hash = crypto
    .createHash('sha256')
    .update(`${id}-${randomBytes}-${Date.now()}`)
    .digest('hex')
    .substring(0, 4)

  return `APGC-${id}-${hash}`
}
