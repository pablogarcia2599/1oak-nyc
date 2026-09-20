import type { FvEvent, FvTable, FvTableRate, FvZone } from '@/types/fourvenues'

export interface Selection {
  event?: FvEvent
  partySize: number
  zone?: FvZone
  table?: FvTable
  rate?: FvTableRate
}

export interface GuestDetails {
  full_name: string
  email: string
  phone: string
  birthdate: string
  observations_client: string
  discount_code: string
  marketing_consent: boolean
  accepts_terms: boolean
}

export const EMPTY_GUEST: GuestDetails = {
  full_name: '',
  email: '',
  phone: '',
  birthdate: '',
  observations_client: '',
  discount_code: '',
  marketing_consent: false,
  accepts_terms: false,
}

export const STEPS = ['The night', 'The table', 'Your details', 'Confirm'] as const

/** Deposit due now for a rate, per the Channel Manager deposit object. */
export function depositFor(rate: FvTableRate): number {
  if (!rate.deposit || rate.deposit.type === 'none') return 0
  if (rate.deposit.calculated_amount) return rate.deposit.calculated_amount
  if (rate.deposit.type === 'percentage') return Math.round((rate.price * rate.deposit.value) / 100)
  return rate.deposit.value
}
