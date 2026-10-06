import { LegalPage } from '@/components/LegalPage'
import { ADDITIONAL_CHARGES, VENUE } from '@/content/venue'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reservation terms' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Reservation terms"
      sections={[
        {
          heading: 'Payment and minimums',
          body: `Every table carries a minimum spend, shown in full before you confirm. The minimum and the processing fee are taken at booking, and that payment is final. ${ADDITIONAL_CHARGES}`,
        },
        {
          heading: 'Admission',
          body: `${VENUE.agePolicy}. The name on the reservation must match the ID presented at the door. ${VENUE.dressCode}`,
        },
        {
          heading: 'Cancellations and refunds',
          body: `All sales are final. Once a reservation is confirmed, no cancellations, refunds or credits are issued under any circumstances — including a no-show, a late arrival or a smaller party than booked. By confirming you also agree not to dispute or charge back the payment where it matches the terms shown at checkout.`,
        },
        {
          heading: 'Changes to your party',
          body: `Party size can be adjusted up to 24 hours before doors by replying to your confirmation email, subject to the table's limits and the door's ratio. The amount already paid does not change: all sales are final.`,
        },
        {
          heading: 'Right of admission',
          body: `Management reserves the right of admission. A reservation does not guarantee entry where house policy or capacity regulations are not met.`,
        },
      ]}
    />
  )
}
