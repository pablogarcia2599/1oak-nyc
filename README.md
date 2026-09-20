# 1 OAK New York — reservations microsite

A bespoke FV Site for 1 OAK New York: an editorial front page and a four-step
table-reservation flow wired straight into the Fourvenues **Channel Manager
API**. The API key stays on the server; the browser only ever talks to this app.

## Running it

```bash
npm install
npm run dev     # http://localhost:3050
```

Out of the box it runs in **mock mode** — five nights, four rooms, fifteen
tables and a walkable checkout that ends on the confirmation page without
taking a payment. No credentials needed.

## Going live

Copy `.env.example` to `.env.local` and fill in:

| Variable | What it is |
| --- | --- |
| `FOURVENUES_API_KEY` | Channel Manager key for the venue. Sent as `X-Api-Key`. |
| `FOURVENUES_BASE_URL` | `https://channels-service.fourvenues.com` (prod) or `…-alpha…` (staging). |
| `FOURVENUES_ORGANIZATION_ID` | Optional. Injected as `organization_id` on every request. |
| `FOURVENUES_MOCK` | `1` forces mock data, `0` forces the live API. Omit to auto-detect from the key. |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin used to build the payment redirect URLs. Optional on Vercel, where it is derived from the request; set it once the domain is final so redirects stay stable across preview deployments. |
| `SITE_PASSWORD` | Password for the access gate. Unset disables the gate. |

The moment `FOURVENUES_API_KEY` is set, every screen reads live data. Nothing
else changes.

## Access gate

The preview deployment sits behind a password. The repository is public, so the
password itself lives only in `SITE_PASSWORD` in the hosting environment and
never in the source — the code holds the mechanism, not the secret.

`middleware.ts` guards every route except `/gate` and the few assets that
screen needs. The cookie carries a SHA-256 of the password rather than the
password itself, comparison is constant-time, and the original destination is
preserved so a shared deep link still lands where it was meant to. With
`SITE_PASSWORD` unset the gate is simply off, which keeps local development and
mock deployments unencumbered.

To open the site to the public, remove `SITE_PASSWORD` from the environment and
redeploy. Nothing else changes.

## The reservation flow

```
GET  /events                     → the calendar
GET  /bookings/availability      → zones, tables and rates for a night + party size
POST /bookings/checkout          → booking + hosted payment URL
```

1. **The night** — events from `/events`, plus the party size, which is passed
   to availability as `quantity` so Fourvenues filters out rooms that cannot
   hold the party.
2. **The table** — zones as tabs, tables plotted from the `position` coordinates
   the venue set in its own floor editor (normalised per zone, since that scale
   differs between venues), then the rate card. Table-level rates win over
   zone-level rates when the venue prices per table.
3. **Your details** — name, email, phone, optional DOB, host notes, consent.
4. **Confirm** — summary and deposit, then `POST /bookings/checkout` and a
   redirect to the Fourvenues-hosted payment page.

`redirect_url` → `/reserve/confirmed`, `error_url` → `/reserve/declined`.

Availability is re-read whenever the night or party size changes, and any
selection the new availability no longer offers is dropped rather than carried
forward into checkout.

## Where things live

```
app/
  page.tsx                  front page
  reserve/page.tsx          the flow
  reserve/actions.ts        server action: validate → POST /bookings/checkout
  api/availability/route.ts server-side proxy for /bookings/availability
lib/fourvenues/
  client.ts                 fetch wrapper, auth, mock switch
  events.ts, bookings.ts    the two services the site uses
  mock.ts                   the demo dataset
components/reserve/         the four steps, floor map, stepper
content/venue.ts            all venue copy, addresses and policies
app/globals.css             the design tokens
```

## The design

The house identity — near-black, the mark's own bronze, a serif for the big
moments — on modern app materials. No gradients, no glow, no CSS textures.

- **Colour.** The gold is sampled from the venue's own mark (`#b08749`, a warm
  bronze) and is rationed: one button, hairlines, small-caps labels.
- **Surfaces.** Translucent white over the page (`.material`), not opaque grey
  panels, so a card reads the same wherever it sits. Soft radii throughout.
- **Bars.** The header and the mobile action bar are frosted (`.glass`), with
  an opaque fallback where `backdrop-filter` is unavailable.
- **Type.** Cormorant Garamond for headings, in sentence case; Jost at 300 for
  everything else. Small caps are for eyebrows and field labels only — never
  for buttons, which read as shouting rather than as luxury.
- **Motion.** One easing curve (`--ease-soft`), a short rise on reveal, a
  press-scale on controls. Nothing bounces.

The whole vocabulary is `.heading`, `.label`, `.material`, `.glass`, `.btn`,
`.chip`, `.field` and `.grid-hairline` in `app/globals.css`.

### Brand assets

The mark in `public/logo.png` is the venue's own, pulled from its Fourvenues
channel (`GET /auth` → `channel.logo_url`) rather than recreated. It ships as a
JPEG on a flat black field, so it was keyed to alpha by luminance and trimmed
to its bounds; `public/icon.png` is the same mark at 128px for the tab.

To refresh it after a rebrand, re-download `channel.logo_url` at `w=1200` and
re-run that key-and-trim step.

Event artwork is **not** used: every event in this account points `image_url`
at the same channel logo, so the calendar is typographic until the venue
uploads real flyers.

## The seating plan

The plan is the venue's own chart, cropped to the room and never re-hosted.

- **Crop.** The asset carries its logo and a band of black above the floor — a
  fifth of a very tall portrait image. Cropping to 16.5%–96.8% of its height
  takes the aspect from 0.65 to 0.81. It is a CSS crop, and the markers are
  reprojected into the cropped box (`PLAN_CROP` in `lib/floorplan.ts`).
- **It fits the screen.** No panning: the plan is bounded by height as well as
  width (50svh on a phone, 72svh from `lg`), and entering the step scrolls to
  the step's own content rather than the top of the flow, so the whole room is
  above the fold.
- **Tapping tells you the price.** A selected table shows a frosted pill at the
  marker with its number, room and minimum spend, flipped below or nudged
  sideways so it never leaves the cropped plan. The card underneath repeats it
  in full, and the action bar carries the figure.
- **The dots are not the only way in.** Fitting the plan puts the markers under
  a 44px touch target, so the room rows below are full-size targets: tapping a
  room takes its first free table and opens its table chips for fine-tuning.

## Mobile

Designed for the phone first, since that is where a table gets booked.

- A frosted action bar holds Back, the running total and Continue within thumb
  reach; it respects `env(safe-area-inset-bottom)`.
- The summary collapses into a `<details>` panel on small screens and becomes a
  sticky rail from `lg` up.
- The stepper degrades from four labelled steps to "Step 2 of 4" plus a rule.
- Inputs are 16px so iOS Safari does not zoom on focus, and carry
  `inputMode`/`autoComplete`/`enterKeyHint`.

### Still to swap before launch

- `content/venue.ts` holds the address, phone, email, hours and policies —
  confirm each one with the venue.
