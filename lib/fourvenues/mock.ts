import type { FvEvent, FvTable, FvTableRate, FvZone } from '@/types/fourvenues'

// ─── Mock dataset ────────────────────────────────────────────────────────────
// Mirrors the exact shape of the Channel Manager responses so the whole
// reservation flow is demo-able before the venue's API key is wired in.

const LOCATION = {
  location_id: 'loc_1oak_nyc',
  organization_id: 'org_1oak_nyc',
  name: '1 OAK New York',
  address: '453 W 17th St',
  city: 'New York',
  country: 'US',
  full_address: '453 W 17th St, New York, NY 10011',
  latitude: 40.742_5,
  longitude: -74.005_8,
  timezone: 'America/New_York',
}

function nextWeekday(weekday: number, weeks = 0): Date {
  const d = new Date()
  d.setHours(23, 0, 0, 0)
  const delta = (weekday - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + delta + weeks * 7)
  return d
}

function iso(d: Date) {
  return d.toISOString()
}

function endOf(d: Date) {
  const e = new Date(d)
  e.setHours(e.getHours() + 5)
  return e
}

interface Seed {
  slug: string
  name: string
  weekday: number
  weeks: number
  description: string
  artists: string[]
  genres: string[]
  image: string
}

const SEEDS: Seed[] = [
  {
    slug: 'house-of-oak',
    name: 'House of Oak',
    weekday: 5,
    weeks: 0,
    description:
      'The room at its most itself. Gold-leaf walls, a black lacquer bar and a night that does not ask permission.',
    artists: ['Vito Fusco', 'Kid Capri'],
    genres: ['Open Format', 'Hip-Hop', 'House'],
    image:
      'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1600&q=80',
  },
  {
    slug: 'gilded-saturdays',
    name: 'Gilded',
    weekday: 6,
    weeks: 0,
    description:
      'Saturday, uncut. Champagne parades under the oak slats until the chevron floor gives out.',
    artists: ['Mel DeBarge'],
    genres: ['Open Format', 'R&B'],
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    slug: 'the-fireplace-sessions',
    name: 'The Fireplace Sessions',
    weekday: 4,
    weeks: 1,
    description:
      'A slower burn. Deep house by the Nachum canvases, ostrich leather and low gold light.',
    artists: ['Chus & Ceballos'],
    genres: ['Deep House', 'Melodic'],
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
  },
  {
    slug: 'one-of-a-kind',
    name: 'One of a Kind',
    weekday: 5,
    weeks: 1,
    description:
      'The anniversary bill. Residents, guests and whoever walks in off 17th Street.',
    artists: ['Cassidy', 'Jus Ske'],
    genres: ['Hip-Hop', 'Open Format'],
    image:
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    slug: 'black-marble',
    name: 'Black Marble',
    weekday: 6,
    weeks: 1,
    description:
      'Techno on the main floor, the mezzanine looking down like it always has.',
    artists: ['Fideles'],
    genres: ['Techno', 'Melodic House'],
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
  },
]

export const MOCK_EVENTS: FvEvent[] = SEEDS.map((seed, i) => {
  const start = nextWeekday(seed.weekday, seed.weeks)
  return {
    _id: `evt_mock_${i + 1}`,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    display_date: start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
    start_date: iso(start),
    end_date: iso(endOf(start)),
    organization_id: LOCATION.organization_id,
    age: 21,
    image_url: seed.image,
    outfit: 'smart',
    music_genres: seed.genres,
    artists: seed.artists.map(name => ({ name, image_url: '' })),
    location_id: LOCATION.location_id,
    location: LOCATION,
    currency: 'USD',
  }
})

function rate(
  slug: string,
  name: string,
  price: number,
  included: number,
  max: number,
  content: string,
  depositPct = 30,
): FvTableRate {
  return {
    _id: `rate_${slug}`,
    slug,
    name,
    content,
    max_clients: max,
    price,
    included_persons: included,
    supplement_persons: Math.max(0, max - included),
    supplement_price: 150,
    fee_type: 'percentage',
    fee_quantity: 0,
    full_payment: false,
    deposit: {
      type: 'percentage',
      value: depositPct,
      calculated_amount: Math.round((price * depositPct) / 100),
    },
    color: COLORS[slug.length % COLORS.length],
  }
}

const COLORS = [
  [200, 166, 87],
  [96, 165, 250],
  [232, 201, 138],
  [147, 197, 253],
]

/** `minimum` is the MINIMUM NUMBER OF GUESTS, exactly as the live API means it. */
function table(
  id: string,
  name: string,
  capacity: number,
  minimum: number,
  x: number,
  y: number,
  rates: FvTableRate[],
  available = true,
): FvTable {
  return {
    _id: id,
    name,
    normalized_name: name.toLowerCase().replace(/\s+/g, '-'),
    capacity,
    minimum,
    position: { x, y, scale: 1, rotation: 0, radius: 0 },
    rates,
    available,
    blocked: !available,
    hidden: false,
  }
}

const MAIN_RATES = [
  rate(
    'main-floor-standard',
    'Main Floor Table',
    2500,
    6,
    10,
    'Reserved banquette on the chevron floor. Two premium bottles, mixers and dedicated host.',
  ),
  rate(
    'main-floor-premium',
    'Main Floor Premium',
    4500,
    8,
    12,
    'Front-of-booth position. Four bottles including champagne service and priority entry for the full party.',
  ),
]

const MEZZ_RATES = [
  rate(
    'mezzanine-standard',
    'Mezzanine Table',
    3500,
    6,
    10,
    'Elevated above the room, looking down the length of the bar. Three bottles and mixers.',
  ),
]

const FIREPLACE_RATES = [
  rate(
    'fireplace-vip',
    'The Fireplace',
    8000,
    10,
    16,
    'The corner room under the Nachum canvases. Private host, dedicated security, bespoke champagne program.',
    50,
  ),
]

const BOOTH_RATES = [
  rate(
    'dj-booth',
    'Booth Side',
    6000,
    8,
    12,
    'Shoulder to shoulder with the booth. Champagne parade included on request.',
    50,
  ),
]

export const MOCK_ZONES: FvZone[] = [
  {
    _id: 'zone_main',
    slug: 'main-floor',
    name: 'Main Floor',
    normalized_name: 'main-floor',
    available: true,
    can_select_client: true,
    is_full: false,
    has_discount_codes_enabled: false,
    rates: MAIN_RATES,
    spaces: [
      table('tbl_m1', 'M1', 10, 6, 18, 62, MAIN_RATES),
      table('tbl_m2', 'M2', 10, 6, 30, 70, MAIN_RATES),
      table('tbl_m3', 'M3', 8, 6, 42, 76, MAIN_RATES),
      table('tbl_m4', 'M4', 8, 6, 58, 76, MAIN_RATES, false),
      table('tbl_m5', 'M5', 10, 6, 70, 70, MAIN_RATES),
      table('tbl_m6', 'M6', 12, 8, 82, 62, MAIN_RATES),
      table('tbl_m7', 'M7', 12, 8, 26, 50, MAIN_RATES),
      table('tbl_m8', 'M8', 12, 8, 74, 50, MAIN_RATES),
    ],
  },
  {
    _id: 'zone_booth',
    slug: 'dj-booth',
    name: 'Booth Side',
    normalized_name: 'dj-booth',
    available: true,
    can_select_client: true,
    is_full: false,
    has_discount_codes_enabled: false,
    rates: BOOTH_RATES,
    spaces: [
      table('tbl_b1', 'B1', 12, 8, 38, 28, BOOTH_RATES),
      table('tbl_b2', 'B2', 12, 8, 62, 28, BOOTH_RATES),
    ],
  },
  {
    _id: 'zone_mezzanine',
    slug: 'mezzanine',
    name: 'Mezzanine',
    normalized_name: 'mezzanine',
    available: true,
    can_select_client: true,
    is_full: false,
    has_discount_codes_enabled: false,
    rates: MEZZ_RATES,
    spaces: [
      table('tbl_z1', 'Z1', 10, 6, 14, 20, MEZZ_RATES),
      table('tbl_z2', 'Z2', 10, 6, 14, 36, MEZZ_RATES),
      table('tbl_z3', 'Z3', 8, 6, 86, 20, MEZZ_RATES, false),
      table('tbl_z4', 'Z4', 8, 6, 86, 36, MEZZ_RATES),
    ],
  },
  {
    _id: 'zone_fireplace',
    slug: 'the-fireplace',
    name: 'The Fireplace',
    normalized_name: 'the-fireplace',
    available: true,
    can_select_client: false,
    is_full: false,
    has_discount_codes_enabled: false,
    rates: FIREPLACE_RATES,
    spaces: [table('tbl_f1', 'F1', 16, 10, 50, 12, FIREPLACE_RATES)],
  },
]
