// Adapter layer: maps the real Django API's JSON shape onto the existing
// frontend types (types/index.ts) so presentational components never had to
// change. See docs/AUTH-PLAN.md for the auth transport these calls ride on.
//
// Public reads (properties/reviews) use a plain unauthenticated fetch — they're
// AllowAny on the backend and these callers are mostly Server Components, which
// have no access to the in-memory access token anyway. User-scoped reads
// (wishlist/trips) go through `apiFetch` from lib/auth.ts and must be called
// from Client Components (that's where the access token lives).

import { apiFetch } from "@/lib/auth"
import type {
  CancellationPolicy,
  HostBadge,
  Property,
  PropertyType,
  SearchParams,
  Trip,
  VerificationLevel,
} from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ponytail: backend's PropertyType choices (apartment/house/villa/studio/cabin/
// hotel_room/hostel/other) are generic rental categories, not the India-homestay
// taxonomy the frontend displays. This is a lossy best-effort map, not a real
// mapping — fix by changing Property.property_type choices backend-side
// (api/properties/models.py) to match, if/when that's prioritized.
const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  villa: "Villa",
  house: "Homestay",
  apartment: "Homestay",
  studio: "Homestay",
  cabin: "Farm Stay",
  hotel_room: "Heritage Home",
  hostel: "Homestay",
  other: "Homestay",
}

const CANCELLATION_MAP: Record<string, CancellationPolicy> = {
  flexible: "Flexible",
  moderate: "Moderate",
  firm: "Firm",
}

interface RawPropertyListItem {
  id: number
  title: string
  property_type: string
  city: string
  country: string
  latitude: string | null
  longitude: string | null
  price_per_night: string
  cleaning_fee: string
  max_guests: number
  bedrooms: number
  beds: number
  bathrooms: string
  avg_rating: string
  total_reviews: number
  cancellation_policy: string
  cover_photo: string | null
  host_name: string
  host_phone: string
  status: string
  verification_level: VerificationLevel
}

interface RawUser {
  id: number
  full_name: string
  phone: string
  avatar: string | null
}

interface RawPhoto {
  image: string | null
}

interface RawAmenity {
  name: string
}

interface RawPropertyDetail {
  id: number
  host: RawUser
  title: string
  description: string
  property_type: string
  city: string
  state: string
  country: string
  latitude: string | null
  longitude: string | null
  max_guests: number
  beds: number
  price_per_night: string
  house_rules: string
  cancellation_policy: string
  amenities: RawAmenity[]
  photos: RawPhoto[]
  avg_rating: string
  total_reviews: number
  verification_level: VerificationLevel
}

interface RawReview {
  id: number
  guest_name: string
  created_at: string
  overall: number
  comment: string
  host_response: string | null
}

interface RawReviewsResponse {
  ratings: {
    avg_overall: number
    avg_cleanliness: number
    avg_communication: number
    avg_location: number
    avg_value: number
  }
  results: RawReview[]
}

// Property rating is used as a proxy for host quality (backend doesn't expose
// HostProfile.is_superhost/response_rate through the properties endpoints yet).
function hostBadgeFor(rating: number, reviews: number): HostBadge {
  if (reviews >= 10 && rating >= 4.8) return "Top Rated Host"
  if (reviews >= 3 && rating >= 4.5) return "Super Responsive Host"
  return null
}

function adaptListItem(raw: RawPropertyListItem): Property {
  const rating = Number(raw.avg_rating)
  return {
    id: String(raw.id),
    slug: String(raw.id), // no backend slug — nothing routes on it, see docs note in AUTH-PLAN history
    title: raw.title,
    propertyType: PROPERTY_TYPE_MAP[raw.property_type] ?? "Homestay",
    city: raw.city,
    region: raw.country === "India" ? raw.city : raw.country, // backend has no "region" grouping — see fetchProperties note
    lat: raw.latitude ? Number(raw.latitude) : 0,
    lng: raw.longitude ? Number(raw.longitude) : 0,
    guests: raw.max_guests,
    beds: raw.beds,
    pricePerNight: Number(raw.price_per_night),
    rating,
    reviewCount: raw.total_reviews,
    verificationLevel: raw.verification_level,
    hostName: raw.host_name,
    hostBadge: hostBadgeFor(rating, raw.total_reviews),
    image: raw.cover_photo ?? undefined,
    images: raw.cover_photo ? [raw.cover_photo] : [],
    description: "",
    amenities: [],
    houseRules: [],
    cancellationPolicy: CANCELLATION_MAP[raw.cancellation_policy] ?? "Moderate",
    whatsappNumber: raw.host_phone,
    reviewBreakdown: { cleanliness: rating, accuracy: rating, checkIn: rating, communication: rating, location: rating, value: rating },
    reviews: [],
    host: {
      name: raw.host_name,
      responseRate: 0,
      avgResponseTimeMinutes: 60,
      badge: hostBadgeFor(rating, raw.total_reviews),
      otherListingsCount: 0,
    },
  }
}

function adaptReview(raw: RawReview) {
  return {
    id: String(raw.id),
    author: raw.guest_name,
    date: raw.created_at.slice(0, 10),
    rating: raw.overall,
    text: raw.comment,
    ...(raw.host_response ? { hostReply: raw.host_response } : {}),
  }
}

async function adaptDetail(raw: RawPropertyDetail): Promise<Property> {
  const rating = Number(raw.avg_rating)
  const images = raw.photos.map((p) => p.image).filter((img): img is string => Boolean(img))

  let reviews: Property["reviews"] = []
  let reviewBreakdown: Property["reviewBreakdown"] = {
    cleanliness: rating, accuracy: rating, checkIn: rating, communication: rating, location: rating, value: rating,
  }
  try {
    const res = await fetch(`${API_URL}/api/v1/reviews/property/${raw.id}/`)
    if (res.ok) {
      const data: RawReviewsResponse = await res.json()
      reviews = data.results.map(adaptReview)
      // backend doesn't track "accuracy"/"checkIn" categories — stand in with the overall average
      reviewBreakdown = {
        cleanliness: data.ratings.avg_cleanliness,
        accuracy: data.ratings.avg_overall,
        checkIn: data.ratings.avg_overall,
        communication: data.ratings.avg_communication,
        location: data.ratings.avg_location,
        value: data.ratings.avg_value,
      }
    }
  } catch {
    // reviews are a progressive enhancement of the detail page — don't fail the page for them
  }

  return {
    id: String(raw.id),
    slug: String(raw.id),
    title: raw.title,
    propertyType: PROPERTY_TYPE_MAP[raw.property_type] ?? "Homestay",
    city: raw.city,
    region: raw.state,
    lat: raw.latitude ? Number(raw.latitude) : 0,
    lng: raw.longitude ? Number(raw.longitude) : 0,
    guests: raw.max_guests,
    beds: raw.beds,
    pricePerNight: Number(raw.price_per_night),
    rating,
    reviewCount: raw.total_reviews,
    verificationLevel: raw.verification_level,
    hostName: raw.host.full_name,
    hostBadge: hostBadgeFor(rating, raw.total_reviews),
    image: images[0],
    images,
    description: raw.description,
    amenities: raw.amenities.map((a) => a.name),
    houseRules: raw.house_rules ? raw.house_rules.split("\n").filter(Boolean) : [],
    cancellationPolicy: CANCELLATION_MAP[raw.cancellation_policy] ?? "Moderate",
    whatsappNumber: raw.host.phone,
    reviewBreakdown,
    reviews,
    host: {
      name: raw.host.full_name,
      photo: raw.host.avatar ?? undefined,
      responseRate: 0,
      avgResponseTimeMinutes: 60,
      badge: hostBadgeFor(rating, raw.total_reviews),
      otherListingsCount: 0,
    },
  }
}

function searchQueryString(params: SearchParams): string {
  const qs = new URLSearchParams()
  if (params.city) qs.set("city", params.city)
  if (params.guests) qs.set("min_guests", String(params.guests))
  if (params.priceMin != null) qs.set("min_price", String(params.priceMin))
  if (params.priceMax != null) qs.set("max_price", String(params.priceMax))
  if (params.verification) qs.set("min_rating", "0") // no direct verification filter on the backend yet
  switch (params.sort) {
    case "price-asc": qs.set("ordering", "price_per_night"); break
    case "price-desc": qs.set("ordering", "-price_per_night"); break
    case "rating": qs.set("ordering", "-avg_rating"); break
    default: break
  }
  return qs.toString()
}

/** Server-safe (no auth needed — AllowAny on the backend). */
export async function fetchProperties(params: SearchParams = {}): Promise<Property[]> {
  const qs = searchQueryString(params)
  try {
    const res = await fetch(`${API_URL}/api/v1/properties/${qs ? `?${qs}` : ""}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    const results: RawPropertyListItem[] = Array.isArray(data) ? data : data.results ?? []
    return results.map(adaptListItem)
  } catch {
    // API unreachable (down, network blip) — an unhandled rejection here crashes
    // the whole page's Server Component render every time it's hit, which Next's
    // dev overlay retries immediately, causing a fetch-fail/reload loop.
    return []
  }
}

/** Server-safe (no auth needed). Returns null if the property doesn't exist. */
export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/properties/${id}/`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const raw: RawPropertyDetail = await res.json()
    return adaptDetail(raw)
  } catch {
    return null
  }
}

/** Client-only (needs the Bearer token). */
export async function toggleWishlist(propertyId: string): Promise<boolean> {
  const data = await apiFetch("/api/v1/wishlist/toggle/", {
    method: "POST",
    body: JSON.stringify({ property_id: Number(propertyId) }),
  })
  return data.saved as boolean
}

/** Client-only (needs the Bearer token). */
export async function fetchWishlistStatus(propertyIds: string[]): Promise<Set<string>> {
  if (propertyIds.length === 0) return new Set()
  const data = await apiFetch(`/api/v1/wishlist/status/?property_ids=${propertyIds.join(",")}`)
  return new Set((data.saved_ids as number[]).map(String))
}

/** Client-only (needs the Bearer token). */
export async function fetchSavedProperties(): Promise<Property[]> {
  const data: RawPropertyListItem[] = await apiFetch("/api/v1/wishlist/saved/")
  return data.map(adaptListItem)
}

interface RawBooking {
  id: number
  listing: RawPropertyListItem
  check_in: string
  check_out: string
  num_guests: number
  status: string
  total_price: string
}

const TRIP_STATUS_MAP: Record<string, Trip["status"]> = {
  pending: "upcoming",
  confirmed: "upcoming",
  completed: "completed",
  cancelled: "cancelled",
  rejected: "cancelled",
}

/** Client-only (needs the Bearer token). */
export async function fetchMyTrips(): Promise<Trip[]> {
  const data: RawBooking[] = await apiFetch("/api/v1/bookings/my-trips/")
  return data.map((b) => ({
    id: String(b.id),
    property: adaptListItem(b.listing),
    checkIn: b.check_in,
    checkOut: b.check_out,
    guests: b.num_guests,
    status: TRIP_STATUS_MAP[b.status] ?? "upcoming",
    totalPaid: b.status === "cancelled" || b.status === "rejected" ? 0 : Number(b.total_price),
  }))
}
