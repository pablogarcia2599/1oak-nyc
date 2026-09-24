import type { Metadata } from 'next'
import { Wordmark } from '@/components/Wordmark'
import { GateForm } from './GateForm'

export const metadata: Metadata = {
  title: 'Private preview',
  robots: { index: false, follow: false },
}

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <main className="flex min-h-svh flex-col items-center gutter justify-center py-20">
      <Wordmark className="scale-75 sm:scale-90" />
      {/* The page needs a heading for structure, but not one on screen: the
          mark and a single instruction say everything there is to say. */}
      <h1 className="sr-only">Private preview</h1>
      <p className="mt-12 max-w-xs text-center text-[0.95rem] leading-relaxed text-mute">
        Enter the access password to continue.
      </p>

      <GateForm next={next} />
    </main>
  )
}
