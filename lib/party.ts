/**
 * How many guests a booking is for.
 *
 * The venue holds the room to a ratio at the door, but it is not asked for
 * here: the guest states a headcount and acknowledges the ratio, and who
 * turns up is settled on the night. The number below is only ever bounded by
 * the table — its own minimum, and what its rate will sell.
 */

/** The door's ratio: this many women for each man. Copy reads from it. */
export const WOMEN_PER_MAN = 3

/**
 * The headcount a table opens on: what its rate already includes, bounded by
 * the table, so the first figure a guest sees costs no supplement.
 */
export function sizeForTable(included: number, bounds: { min: number; max: number }): number {
  return Math.min(bounds.max, Math.max(bounds.min, included))
}

/** The line written onto the booking for the venue to read in FV Pro. */
export function ratioNote(): string {
  return `Guest accepted the 1:${WOMEN_PER_MAN} male-to-female ratio at checkout.`
}
