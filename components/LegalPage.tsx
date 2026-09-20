import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function LegalPage({
  title,
  sections,
}: {
  title: string
  sections: { heading: string; body: string }[]
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="label label-gold">Legal</p>
        <h1 className="heading heading-lg mt-4 text-bone">{title}</h1>
        <div className="mt-12 border-t border-hairline-soft">
          {sections.map(section => (
            <section key={section.heading} className="border-b border-hairline-soft py-8">
              <h2 className="heading heading-md text-bone">{section.heading}</h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-mute">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
