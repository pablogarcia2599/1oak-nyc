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
