import { LegalPage } from '@/components/LegalPage'
import { VENUE } from '@/content/venue'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      sections={[
        {
          heading: 'What we collect',
          body: `When you reserve a table we collect the name, email, phone number and party size you provide, plus any note you write for the host. Payment details are entered on our payment provider's page and are never stored by this site.`,
        },
        {
          heading: 'Why we collect it',
          body: `To create and manage your reservation, to contact you about it, and to admit your party at the door. If you opt in, we also use your email to announce upcoming nights — you can unsubscribe from any message.`,
        },
        {
          heading: 'Who processes it',
          body: `Reservations are managed on Fourvenues, our ticketing and reservation platform, which acts as our processor. Payments are handled by the payment provider integrated with that platform.`,
        },
        {
          heading: 'Your rights',
          body: `You can request access, correction or deletion of your data at any time by writing to ${VENUE.email}.`,
        },
      ]}
    />
  )
}
