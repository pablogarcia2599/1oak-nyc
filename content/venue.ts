// Editorial copy and venue facts, kept out of the components so the operator
// can hand this file to a copywriter without touching the reservation flow.

export const VENUE = {
  /** The address is the name. There is no other mark. */
  name: '453 W 17th Street',
  /** Used wherever the name has to fit a bar or a tab. */
  shortName: '453 W 17th',
  city: 'New York',
  address: '453 W 17th Street, New York, NY 10011',
  neighborhood: 'Chelsea',
  // TODO: confirm with the venue — these are placeholders, not their numbers.
  phone: '+1 (212) 691-1111',
  email: 'reservations@453w17th.com',
  hours: 'Thursday – Saturday · 11PM – 4AM',
  agePolicy: '21+ with valid government-issued photo ID',
  dressCode: 'Upscale. No athletic wear, no hats, no exceptions at the door.',
  /** Empty until the venue names an account; the footer hides the link. */
  instagram: '',
  mapsUrl: 'https://maps.google.com/?q=453+W+17th+St+New+York',
} as const

/**
 * The venue's own wording for what it settles at the door. It replaces a
 * priced list of fees, so it is quoted verbatim rather than paraphrased.
 */
export const ADDITIONAL_CHARGES =
  'Any additional spend, sales tax, administrative or service fees, and optional gratuity will be charged separately by the venue at the time of service, with your approval.'

/**
 * The card authorisation a guest signs by ticking the box at checkout.
 * Verbatim from the venue, with the merchant named as the party that takes
 * the payment.
 */
export const CHARGE_AUTHORISATION =
  'By checking this box, I authorize Fourvenues to charge my credit card one time for the stated amount corresponding to my reservation or purchase as specified at checkout. I confirm I am the authorized cardholder and have reviewed and accepted the cancellation and refund policy. I understand that all sales are final, and no cancellations, refunds, or credits will be issued under any circumstances. I agree not to dispute or charge back this payment if it matches the agreed terms. Taxes, gratuity, and operational charge are not included. Checking this box equals my electronic signature and full acceptance of these terms.'

export const FAQ = [
  {
    q: 'What does a table reservation include?',
    a: 'Every reservation carries a spend minimum, bottle service for the listed party size, mixers, a dedicated host and priority entry for the full party. The package you select sets the minimum.',
  },
  {
    q: 'How is payment handled?',
    a: 'A deposit is taken at the time of booking through our secure payment provider. The balance settles at the table on the night.',
  },
  {
    q: 'Can I change the party size after booking?',
    a: 'Yes, up to 24 hours before doors. Write to the host on your confirmation email and we will adjust the table.',
  },
  {
    q: 'What is the dress code?',
    a: VENUE.dressCode,
  },
]
