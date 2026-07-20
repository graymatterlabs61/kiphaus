// Adapter layer: maps the real Django API's JSON shape onto the existing
// frontend types (types/index.ts) so presentational components never had to
// change. See docs/AUTH-PLAN.md for the auth transport these calls ride on.
//
// Public reads (properties/reviews) use a plain unauthenticated fetch — they're
// AllowAny on the backend and these callers are mostly Server Components, which
// have no access to the in-memory access token anyway. User-scoped reads
// (wishlist/trips) go through `apiFetch` from lib/auth.ts and must be called
// from Client Components (that's where the access token lives).

import { apiFetch, apiFetchForm } from "@/lib/auth"
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
  icon: string
  category: string
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
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/v1/reviews/property/${raw.id}/`, {
        signal: AbortSignal.timeout(4000),
      })
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
    amenities: raw.amenities.map((a) => ({ name: a.name, icon: a.icon, category: a.category })),
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
  if (!API_URL) return []
  const qs = searchQueryString(params)
  try {
    const res = await fetch(`${API_URL}/api/v1/properties/${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const results: RawPropertyListItem[] = Array.isArray(data) ? data : data.results ?? []
    return results.map(adaptListItem)
  } catch {
    // API unreachable (down, network blip, or timeout during SSG)
    return []
  }
}

/** Server-safe (no auth needed). Returns null if the property doesn't exist. */
export async function fetchPropertyById(id: string): Promise<Property | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/api/v1/properties/${id}/`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    })
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
  const data = await apiFetch("/api/v1/wishlist/saved/")
  const results: RawPropertyListItem[] = Array.isArray(data) ? data : data.results ?? []
  return results.map(adaptListItem)
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

export interface PricePreview {
  nights: number
  pricePerNight: number
  subtotal: number
  cleaningFee: number
  serviceFee: number
  total: number
}

interface RawPricePreview {
  nights: number
  price_per_night: string
  subtotal: string
  cleaning_fee: string
  service_fee: string
  total: string
}

/** Client-only (needs the Bearer token). Throws AuthError (via apiFetch) on invalid dates/availability. */
export async function fetchPricePreview(input: {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
}): Promise<PricePreview> {
  const raw: RawPricePreview = await apiFetch("/api/v1/bookings/price-preview/", {
    method: "POST",
    body: JSON.stringify({
      property_id: Number(input.propertyId),
      check_in: input.checkIn,
      check_out: input.checkOut,
      num_guests: input.guests,
    }),
  })
  return {
    nights: raw.nights,
    pricePerNight: Number(raw.price_per_night),
    subtotal: Number(raw.subtotal),
    cleaningFee: Number(raw.cleaning_fee),
    serviceFee: Number(raw.service_fee),
    total: Number(raw.total),
  }
}

/** Client-only (needs the Bearer token). Creates a real pending booking request. */
export async function createBooking(input: {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
}): Promise<{ id: string }> {
  const data = await apiFetch("/api/v1/bookings/", {
    method: "POST",
    body: JSON.stringify({
      listing: Number(input.propertyId),
      check_in: input.checkIn,
      check_out: input.checkOut,
      num_guests: input.guests,
    }),
  })
  return { id: String(data.id) }
}

interface RawChatUser {
  id: number
  full_name: string
  avatar: string | null
}

export interface ChatConversation {
  id: string
  property: { id: string; title: string; image?: string }
  otherUser: { id: number; name: string; avatar: string | null }
  lastMessage: { body: string; createdAt: string; senderId: number } | null
  unreadCount: number
  updatedAt: string
}

interface RawConversation {
  id: number
  property: RawPropertyListItem
  other_user: RawChatUser
  last_message: { body: string; created_at: string; sender_id: number } | null
  unread_count: number
  updated_at: string
}

function adaptConversation(raw: RawConversation): ChatConversation {
  return {
    id: String(raw.id),
    property: { id: String(raw.property.id), title: raw.property.title, image: raw.property.cover_photo ?? undefined },
    otherUser: { id: raw.other_user.id, name: raw.other_user.full_name, avatar: raw.other_user.avatar },
    lastMessage: raw.last_message
      ? { body: raw.last_message.body, createdAt: raw.last_message.created_at, senderId: raw.last_message.sender_id }
      : null,
    unreadCount: raw.unread_count,
    updatedAt: raw.updated_at,
  }
}

/** Client-only (needs the Bearer token). */
export async function fetchConversations(): Promise<ChatConversation[]> {
  const data = await apiFetch("/api/v1/chat/conversations/")
  const results: RawConversation[] = Array.isArray(data) ? data : data.results ?? []
  return results.map(adaptConversation)
}

/** Client-only (needs the Bearer token). Starts (or reuses) a conversation with the property's host. */
export async function startConversation(propertyId: string): Promise<{ conversationId: string }> {
  const data = await apiFetch("/api/v1/chat/start/", {
    method: "POST",
    body: JSON.stringify({ property_id: Number(propertyId) }),
  })
  return { conversationId: String(data.conversation_id) }
}

/** Client-only (needs the Bearer token). Booking must be a completed stay of the caller's. */
export async function createReview(input: {
  bookingId: string
  overall: number
  cleanliness: number
  communication: number
  location: number
  value: number
  comment: string
}): Promise<{ id: string }> {
  const data = await apiFetch("/api/v1/reviews/", {
    method: "POST",
    body: JSON.stringify({
      booking: Number(input.bookingId),
      overall: input.overall,
      cleanliness: input.cleanliness,
      communication: input.communication,
      location: input.location,
      value: input.value,
      comment: input.comment,
    }),
  })
  return { id: String(data.id) }
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

// ── Host property management ─────────────────────────────────────────────────
// Uses api/properties' real PropertyType/CancellationPolicy choices directly
// (not the guest-facing PROPERTY_TYPE_MAP above, which is lossy in one direction
// only — see the ponytail note near it).

export const HOST_PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "cabin", label: "Cabin" },
  { value: "hotel_room", label: "Hotel room" },
  { value: "hostel", label: "Hostel" },
  { value: "other", label: "Other" },
]

export const HOST_CANCELLATION_POLICIES: { value: string; label: string }[] = [
  { value: "flexible", label: "Flexible" },
  { value: "moderate", label: "Moderate" },
  { value: "firm", label: "Firm" },
]

export interface Amenity {
  id: number
  name: string
  icon: string
  category: string
}

export interface PropertyPhoto {
  id: string
  image: string | null
  isCover: boolean
}

export interface HostPropertySummary {
  id: string
  title: string
  status: "draft" | "active" | "paused" | "archived"
  city: string
  region: string
  pricePerNight: number
  coverImage?: string
  verificationLevel: VerificationLevel
  avgRating: number
  totalReviews: number
  totalBookings: number
}

export interface PropertyDraft {
  title: string
  description: string
  propertyType: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  pricePerNight: number
  cleaningFee: number
  minNights: number
  maxNights: number
  checkInTime: string
  checkOutTime: string
  houseRules: string
  allowsPets: boolean
  allowsSmoking: boolean
  allowsParties: boolean
  cancellationPolicy: string
  amenityIds: number[]
}

interface RawHostProperty {
  id: number
  title: string
  description: string
  property_type: string
  status: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  country: string
  postal_code: string
  max_guests: number
  bedrooms: number
  beds: number
  bathrooms: string
  price_per_night: string
  cleaning_fee: string
  min_nights: number
  max_nights: number
  check_in_time: string
  check_out_time: string
  house_rules: string
  allows_pets: boolean
  allows_smoking: boolean
  allows_parties: boolean
  cancellation_policy: string
  amenities: { id: number; name: string }[]
  photos: { id: number; image: string | null; is_cover: boolean }[]
  avg_rating: string
  total_reviews: number
  total_bookings: number
  verification_level: VerificationLevel
}

function draftToPayload(draft: PropertyDraft) {
  return {
    title: draft.title,
    description: draft.description,
    property_type: draft.propertyType,
    address_line1: draft.addressLine1,
    address_line2: draft.addressLine2,
    city: draft.city,
    state: draft.state,
    country: draft.country,
    postal_code: draft.postalCode,
    max_guests: draft.maxGuests,
    bedrooms: draft.bedrooms,
    beds: draft.beds,
    bathrooms: draft.bathrooms,
    price_per_night: draft.pricePerNight,
    cleaning_fee: draft.cleaningFee,
    min_nights: draft.minNights,
    max_nights: draft.maxNights,
    check_in_time: draft.checkInTime,
    check_out_time: draft.checkOutTime,
    house_rules: draft.houseRules,
    allows_pets: draft.allowsPets,
    allows_smoking: draft.allowsSmoking,
    allows_parties: draft.allowsParties,
    cancellation_policy: draft.cancellationPolicy,
    amenity_ids: draft.amenityIds,
  }
}

/** Client-only (needs the Bearer token). */
export async function fetchAmenities(): Promise<Amenity[]> {
  const data = await apiFetch("/api/v1/properties/amenities/")
  return Array.isArray(data) ? data : data.results ?? []
}

/** Client-only (needs the Bearer token). */
export async function fetchMyProperties(): Promise<HostPropertySummary[]> {
  const data: RawHostProperty[] = await apiFetch("/api/v1/properties/mine/")
  return data.map((p) => ({
    id: String(p.id),
    title: p.title,
    status: p.status as HostPropertySummary["status"],
    city: p.city,
    region: p.state,
    pricePerNight: Number(p.price_per_night),
    coverImage: p.photos.find((ph) => ph.is_cover)?.image ?? p.photos[0]?.image ?? undefined,
    verificationLevel: p.verification_level,
    avgRating: Number(p.avg_rating),
    totalReviews: p.total_reviews,
    totalBookings: p.total_bookings,
  }))
}

/** Client-only (needs the Bearer token). */
export async function fetchHostProperty(id: string): Promise<PropertyDraft & { id: string; status: string; photos: PropertyPhoto[] }> {
  const p: RawHostProperty = await apiFetch(`/api/v1/properties/${id}/`)
  return {
    id: String(p.id),
    status: p.status,
    title: p.title,
    description: p.description,
    propertyType: p.property_type,
    addressLine1: p.address_line1,
    addressLine2: p.address_line2,
    city: p.city,
    state: p.state,
    country: p.country,
    postalCode: p.postal_code,
    maxGuests: p.max_guests,
    bedrooms: p.bedrooms,
    beds: p.beds,
    bathrooms: Number(p.bathrooms),
    pricePerNight: Number(p.price_per_night),
    cleaningFee: Number(p.cleaning_fee),
    minNights: p.min_nights,
    maxNights: p.max_nights,
    checkInTime: p.check_in_time,
    checkOutTime: p.check_out_time,
    houseRules: p.house_rules,
    allowsPets: p.allows_pets,
    allowsSmoking: p.allows_smoking,
    allowsParties: p.allows_parties,
    cancellationPolicy: p.cancellation_policy,
    amenityIds: p.amenities.map((a) => a.id),
    photos: p.photos.map((ph) => ({ id: String(ph.id), image: ph.image, isCover: ph.is_cover })),
  }
}

/** Client-only (needs the Bearer token). */
export async function createProperty(draft: PropertyDraft): Promise<{ id: string }> {
  const data = await apiFetch("/api/v1/properties/", {
    method: "POST",
    body: JSON.stringify(draftToPayload(draft)),
  })
  return { id: String(data.id) }
}

/** Client-only (needs the Bearer token). */
export async function updateProperty(id: string, draft: PropertyDraft): Promise<void> {
  await apiFetch(`/api/v1/properties/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(draftToPayload(draft)),
  })
}

/** Client-only (needs the Bearer token). Throws AuthError with the backend's reason (e.g. "needs a photo") on failure. */
export async function publishProperty(id: string): Promise<void> {
  await apiFetch(`/api/v1/properties/${id}/publish/`, { method: "POST" })
}

/** Client-only (needs the Bearer token). */
export async function unpublishProperty(id: string): Promise<void> {
  await apiFetch(`/api/v1/properties/${id}/unpublish/`, { method: "POST" })
}

/** Client-only (needs the Bearer token). */
export async function uploadPropertyPhoto(propertyId: string, file: File): Promise<PropertyPhoto> {
  const formData = new FormData()
  formData.append("image_upload", file)
  const data = (await apiFetchForm(`/api/v1/properties/${propertyId}/photos/`, formData)) as {
    id: number
    image: string | null
    is_cover: boolean
  }
  return { id: String(data.id), image: data.image, isCover: data.is_cover }
}

/** Client-only (needs the Bearer token). */
export async function deletePropertyPhoto(photoId: string): Promise<void> {
  await apiFetch(`/api/v1/properties/photos/${photoId}/`, { method: "DELETE" })
}

// ── Host analytics ────────────────────────────────────────────────────────────

export interface HostAnalytics {
  earnings: { total: number; thisMonth: number; thisYear: number; monthlyChart: { month: string; earnings: number }[] }
  bookings: { total: number; byStatus: Record<string, number>; upcoming: UpcomingBooking[] }
  properties: { total: number; active: number }
  reviews: { avgRating: number; total: number }
}

export interface UpcomingBooking {
  id: string
  guestName: string
  property: string
  checkIn: string
  checkOut: string
  nights: number
  total: number
}

/** Client-only (needs the Bearer token). */
export async function fetchHostAnalytics(): Promise<HostAnalytics> {
  const data = await apiFetch("/api/v1/analytics/host/")
  return {
    earnings: {
      total: data.earnings.total,
      thisMonth: data.earnings.this_month,
      thisYear: data.earnings.this_year,
      monthlyChart: data.earnings.monthly_chart,
    },
    bookings: {
      total: data.bookings.total,
      byStatus: data.bookings.by_status,
      upcoming: data.bookings.upcoming.map((b: { id: number; guest_name: string; property: string; check_in: string; check_out: string; nights: number; total: string }) => ({
        id: String(b.id),
        guestName: b.guest_name,
        property: b.property,
        checkIn: b.check_in,
        checkOut: b.check_out,
        nights: b.nights,
        total: Number(b.total),
      })),
    },
    properties: { total: data.properties.total, active: data.properties.active },
    reviews: { avgRating: data.reviews.avg_rating, total: data.reviews.total },
  }
}

// ── Host verification ────────────────────────────────────────────────────────

export interface VerificationStep {
  level: 1 | 2 | 3 | 4
  status: "not_started" | "in_review" | "approved" | "rejected"
  detail: string
  submittedAt: string | null
  reviewedAt: string | null
}

/** Client-only (needs the Bearer token). Auto-creates the 4 rows on first read. */
export async function fetchMyVerificationSteps(): Promise<VerificationStep[]> {
  const data = await apiFetch("/api/v1/verification/me/")
  return data.map((s: { level: number; status: string; detail: string; submitted_at: string | null; reviewed_at: string | null }) => ({
    level: s.level,
    status: s.status,
    detail: s.detail,
    submittedAt: s.submitted_at,
    reviewedAt: s.reviewed_at,
  }))
}

/** Client-only (needs the Bearer token). Enforces sequential level approval server-side. */
export async function submitVerificationLevel(level: number, detail = ""): Promise<VerificationStep> {
  const s = await apiFetch("/api/v1/verification/me/submit/", {
    method: "POST",
    body: JSON.stringify({ level, detail }),
  })
  return { level: s.level, status: s.status, detail: s.detail, submittedAt: s.submitted_at, reviewedAt: s.reviewed_at }
}

// ── Host subscription (Razorpay) ─────────────────────────────────────────────

export interface HostSubscription {
  plan: "basic" | "premium"
  status: "pending" | "active" | "expired" | "cancelled"
  currentPeriodEnd: string | null
}

/** Client-only (needs the Bearer token). Null if the host has never started checkout. */
export async function fetchMySubscription(): Promise<HostSubscription | null> {
  const data = await apiFetch("/api/v1/payments/subscription/")
  if (!data) return null
  return { plan: data.plan, status: data.status, currentPeriodEnd: data.current_period_end }
}

/** Client-only (needs the Bearer token). */
export async function createPaymentOrder(plan: "basic" | "premium"): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  const data = await apiFetch("/api/v1/payments/create-order/", {
    method: "POST",
    body: JSON.stringify({ plan }),
  })
  return { orderId: data.order_id, amount: data.amount, currency: data.currency, keyId: data.key_id }
}

/** Client-only (needs the Bearer token). */
export async function verifyPayment(input: { orderId: string; paymentId: string; signature: string }): Promise<HostSubscription> {
  const data = await apiFetch("/api/v1/payments/verify/", {
    method: "POST",
    body: JSON.stringify({
      razorpay_order_id: input.orderId,
      razorpay_payment_id: input.paymentId,
      razorpay_signature: input.signature,
    }),
  })
  return { plan: data.plan, status: data.status, currentPeriodEnd: data.current_period_end }
}
