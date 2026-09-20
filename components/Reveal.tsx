'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** A short rise on first sight. Deliberately the only motion on the page. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Component = Tag as React.ElementType

  return (
    <Component
      ref={ref as React.Ref<never>}
      className={cn('opacity-0', shown && 'opacity-100', className)}
      style={shown ? { animation: `rise 700ms ease-out ${delay}ms both` } : undefined}
    >
      {children}
    </Component>
  )
}
