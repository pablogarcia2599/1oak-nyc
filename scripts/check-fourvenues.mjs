// Connectivity check for the Fourvenues Channel Manager credentials.
// Prints what the API returns — never the key itself.
import { readFileSync } from 'node:fs'

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim()
    }
  } catch {
    // file is optional
  }
}

const apiKey = process.env.FOURVENUES_API_KEY
const baseUrl = process.env.FOURVENUES_BASE_URL ?? 'https://channels-service.fourvenues.com'
const orgId = process.env.FOURVENUES_ORGANIZATION_ID

if (!apiKey) {
  console.error('✗ FOURVENUES_API_KEY no está definida en .env.local — el sitio corre en mock mode.')
  process.exit(1)
}

console.log(`· base url        ${baseUrl}`)
console.log(`· api key         presente (${apiKey.length} caracteres, no se imprime)`)
console.log(`· organization_id ${orgId || '(sin definir)'}`)
console.log('')

// 1 — resolve the channel: confirms the key is valid AND that the venue has
// granted this channel access. A 401/403 here means the grant is missing.
const authRes = await fetch(`${baseUrl}/auth`, {
  headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
})

if (!authRes.ok) {
  console.error(`✗ GET /auth → ${authRes.status} ${authRes.statusText}`)
  console.error(await authRes.text())
  console.error('\n  401 → la key no es válida.')
  console.error('  403 → la key es válida pero el local aún no ha autorizado este canal.')
  process.exit(1)
}

const channel = (await authRes.json()).data?.channel ?? {}
const orgs = [...(channel.anfitrions ?? []), ...(channel.hosts ?? [])]
console.log(`✓ GET /auth → 200 · canal "${channel.name ?? '?'}" · moneda ${channel.currency ?? '?'}`)
// A channel that owns its own venue lists no anfitrions/hosts — those arrays
// only fill in for marketplace collaborations. The real proof of access is
// whether /events returns anything, which is checked next.
console.log(`  channel _id       ${channel._id}  (sirve como organization_id)`)
if (orgs.length > 0) {
  console.log(`  colaboraciones:   ${orgs.length}`)
  for (const org of orgs) console.log(`   ${org.name}  ·  _id ${org._id}`)
}
if (orgId && orgs.length > 0 && !orgs.some(o => o._id === orgId)) {
  console.log(`  Aviso: FOURVENUES_ORGANIZATION_ID (${orgId}) no está entre las autorizadas.`)
}
console.log('')

// 2 — the calendar
const url = new URL(`${baseUrl}/events`)
url.searchParams.set('start_date', new Date().toISOString())
url.searchParams.set('limit', '10')
if (orgId) url.searchParams.set('organization_id', orgId)

const res = await fetch(url, {
  headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
})

if (!res.ok) {
  console.error(`✗ GET /events → ${res.status} ${res.statusText}`)
  console.error(await res.text())
  process.exit(1)
}

const body = await res.json()
const events = body.data ?? []
console.log(`✓ GET /events → 200 · ${events.length} eventos`)

for (const event of events.slice(0, 5)) {
  console.log(`   ${event.start_date?.slice(0, 10)}  ${event.name}`)
  console.log(`      _id ${event._id}   slug ${event.slug}`)
}

if (events.length === 0) {
  console.log('   (sin eventos futuros: revisa el organization_id o publica una fecha)')
  process.exit(0)
}

// 3 — the table floor for the first night
const first = events[0]
const availabilityUrl = new URL(`${baseUrl}/bookings/availability`)
availabilityUrl.searchParams.set('event_id', first._id)
availabilityUrl.searchParams.set('quantity', '6')

const avail = await fetch(availabilityUrl, {
  headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
})

if (!avail.ok) {
  console.error(`\n✗ GET /bookings/availability → ${avail.status} ${avail.statusText}`)
  console.error(await avail.text())
  console.error('\n  Si da 403, la key no tiene el scope de bookings activado.')
  process.exit(1)
}

const zones = (await avail.json()).data ?? []
console.log(`\n✓ GET /bookings/availability (${first.name}, 6 pax) → 200 · ${zones.length} zonas`)

for (const zone of zones) {
  const tables = zone.spaces?.length ?? 0
  const plotted = (zone.spaces ?? []).filter(s => s.position?.x != null).length
  console.log(`   ${zone.name}  ·  ${tables} mesas (${plotted} con coordenadas)  ·  ${zone.rates?.length ?? 0} tarifas`)
}

const unplotted = zones.some(z => (z.spaces ?? []).some(s => s.position?.x == null))
if (unplotted) {
  console.log('\n  Aviso: hay mesas sin coordenadas — el plano las dibujará apiladas.')
}
