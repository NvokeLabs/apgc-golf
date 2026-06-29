export type PriceableEvent = {
  price?: number | null
  alumniPrice?: number | null
}

/**
 * The amount (IDR) a registrant owes for an event, by category. Alumni pay
 * `alumniPrice` when set, otherwise the base price; general always pays base.
 */
export function resolveEventPrice(event: PriceableEvent, category: 'general' | 'alumni'): number {
  if (category === 'alumni' && event.alumniPrice) {
    return event.alumniPrice
  }
  return event.price || 0
}
