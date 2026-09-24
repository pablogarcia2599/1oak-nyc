/**
 * Light moving through a dark room.
 *
 * Three soft pools of the house bronze, very large, very slow and very faint,
 * drifting on periods that share no common multiple so the loop never reads as
 * a loop. The discipline is what keeps this from being the animated-blob
 * cliché: one colour, taken from the mark, and nothing bright enough to
 * announce itself.
 *
 * No `filter: blur()` anywhere — a radial gradient is already soft, and
 * blurring a viewport-sized element costs a phone real frames. Only
 * `transform` is animated, so the whole thing stays on the compositor.
 */
export function Ambience() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      // Its own layer, so it never triggers layout or paint on the content.
      style={{ contain: 'strict' }}
    >
      <span
        className="absolute left-[-20%] top-[-25%] block h-[90vmax] w-[90vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(176,135,73,0.22) 0%, rgba(176,135,73,0.08) 38%, transparent 68%)',
          animation: 'drift-a 42s ease-in-out infinite',
        }}
      />
      <span
        className="absolute bottom-[-30%] right-[-20%] block h-[75vmax] w-[75vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(211,174,116,0.17) 0%, rgba(211,174,116,0.06) 40%, transparent 70%)',
          animation: 'drift-b 58s ease-in-out infinite',
        }}
      />
      <span
        className="absolute right-[-10%] top-[30%] block h-[55vmax] w-[55vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(140,108,58,0.20) 0%, rgba(140,108,58,0.07) 42%, transparent 72%)',
          animation: 'drift-c 49s ease-in-out infinite',
        }}
      />

      {/* Keeps the edges dark, so the glow reads as light in a room rather
          than as a coloured background. */}
      <span
        className="absolute inset-0 block"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(7,8,9,0.45) 100%)',
        }}
      />
    </div>
  )
}
