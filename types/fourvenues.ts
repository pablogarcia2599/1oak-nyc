// ─── Fourvenues Channel Manager API types ────────────────────────────────────
// https://docs.fourvenues.com/channel-manager

export interface FvResponse<T> { success: boolean; data: T }

export interface FvLocation {
  location_id: string
  organization_id: string
  name: string
  address: string
  city: string
  country: string
  full_address: string
  latitude: number
  longitude: number
  timezone: string
}

export interface FvArtist { name: string; image_url: string }

export interface FvEvent {
  _id: string
  name: string
  slug: string
  description: string
  display_date: string
  start_date: string
  end_date: string
  organization_id: string
  age: number
  image_url: string
  outfit: 'free' | 'casual' | 'formal' | 'black-tie' | 'smart'
  music_genres: string[]
  artists: FvArtist[]
  location_id: string
  location?: FvLocation
  currency: string
}

// ─── Bookings / tables ───────────────────────────────────────────────────────

/**
 * Coordinates from the venue's own floor editor. They are NOT percentages of
 * the plan image: x is stored against the plan's height, so it has to be
 * rescaled before use. See `lib/floorplan.ts`.
 */
export interface FvTablePosition {
  x: number
  y: number
  scale: number
  rotation?: number
  radius: number
}

export interface FvRateDeposit {
  type: 'none' | 'fixed' | 'percentage'
  value: number
  calculated_amount: number
}

export interface FvTableRate {
  _id: string
  slug: string
  name: string
  content: string
  max_clients: number
  price: number
  included_persons: number
  supplement_persons: number
  supplement_price: number
  fee_type: string
  fee_quantity: number
  full_payment: boolean
  deposit: FvRateDeposit
  /** [r, g, b] — the swatch the venue gave this rate in its floor editor. */
  color?: number[]
  conditions?: string
  whatsapp_contact_enabled?: boolean
}

export interface FvTable {
  _id: string
  name: string
  normalized_name: string
  /** Maximum guests the table seats. */
  capacity: number
  /** MINIMUM GUESTS the table may be booked for — not a money amount. */
  minimum: number
  position: FvTablePosition
  rates: FvTableRate[]
  available: boolean
  blocked: boolean
  hidden: boolean
}

export interface FvZone {
  _id: string
  slug: string
  name: string
  normalized_name: string
  available: boolean
  can_select_client: boolean
  is_full: boolean
  background_image?: string
  spaces: FvTable[]
  /** Absent on venues that price per table rather than per zone. */
  rates?: FvTableRate[]
  has_discount_codes_enabled: boolean
}

export interface FvBookingBilling {
  customer_type: 'individual' | 'company'
  customer_name: string
  document_type: 'dni' | 'nie' | 'passport' | 'other'
  document_number: string
  address: string
  city: string
  postal_code: string
  country: string
}

export interface FvBookingInfo {
  full_name: string
  email: string
  phone: string
  birthdate?: string
  quantity: number
  billing?: FvBookingBilling
}

export interface FvBookingCheckoutRequest {
  redirect_url: string
  error_url: string
  event_id: string
  /**
   * `zone_slug` and `normalized_zone_name` are mutually exclusive, as are
   * `table_id` and `normalized_table_name` — the API rejects a request
   * carrying both halves of either pair. Undocumented; the validator says so.
   */
  zone_slug?: string
  normalized_zone_name?: string
  rate_slug: string
  table_id?: string
  normalized_table_name?: string
  full_payment?: boolean
  observations_client?: string
  marketing_consent?: boolean
  discount_code?: string
  send_resources?: boolean
  external_channel_id?: string
  metadata?: Record<string, unknown>
  info: FvBookingInfo
}

export interface FvBookingCheckoutResponse {
  payment_id: string
  payment_url: string
  total_amount: number
  booking: Record<string, unknown>
}
