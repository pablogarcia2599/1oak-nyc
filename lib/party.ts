/**
 * The house rule on who makes up a party.
 *
 * Two limits, both the venue's:
 *
 *  1. Never more men than women. The ratio may tilt towards women freely; it
 *     may not tilt the other way.
 *  2. A table's rate includes a number of guests, and up to four more may be
 *     added on top (every rate here sets `supplement_persons: 4`, which is why
 *     each table's capacity is its included count plus four). At most one of
 *     those four extras may be a man.
 *
 * Together they cap the men in a party of a given size: half of what the table
 * includes, plus the one man allowed among the extras — and never more than
 * half the party, which rule 1 already settles.
 */
export interface Party {
  men: number
  women: number
}

export const partyTotal = (party: Party) => party.men + party.women

/**
 * The most men a party of `total` may contain. `included` is the selected
 * rate's included headcount; without a table chosen only the ratio applies.
 */
export function maxMen(total: number, included?: number): number {
  const byRatio = Math.floor(total / 2)
  if (included === undefined) return byRatio
  const withinTable = Math.min(total, included)
  const extras = total - withinTable
  return Math.min(byRatio, Math.floor(withinTable / 2) + (extras > 0 ? 1 : 0))
}

/** Why a party cannot take another man — for the line under the counters. */
export type Block = 'ratio' | 'extras' | 'size' | null

export function blockedBy(party: Party, max: number, included?: number): Block {
  if (partyTotal(party) >= max) return 'size'
  const next = partyTotal(party) + 1
  if (party.men + 1 > maxMen(next, included)) {
    // Which of the two limits bit: the ratio alone, or the one-man allowance
    // on the extras.
    return party.men + 1 > Math.floor(next / 2) ? 'ratio' : 'extras'
  }
  return null
}

/**
 * Brings a party inside the venue's size limits without breaking the ratio.
 * Women absorb the change: adding them is always allowed, and removing men
 * first would be a judgement nobody asked us to make.
 */
export function clampParty(party: Party, bounds: { min: number; max: number }): Party {
  let { men, women } = party

  while (men + women < bounds.min) women += 1
  while (men + women > bounds.max) {
    if (women > men) women -= 1
    else men -= 1
  }
  // A smaller party may no longer carry the men it had.
  const ceiling = Math.floor((men + women) / 2)
  if (men > ceiling) {
    women += men - ceiling
    men = ceiling
    while (men + women > bounds.max) women -= 1
  }
  return { men, women }
}

/** The line written onto the booking for the venue to read in FV Pro. */
export function partyNote({ men, women }: Party): string {
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  return `Guest mix: ${plural(men, 'man', 'men')}, ${plural(women, 'woman', 'women')}.`
}
