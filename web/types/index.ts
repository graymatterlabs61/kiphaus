export type VerificationLevel = 1 | 2 | 3 | 4

export type PropertyType = "Homestay" | "Villa" | "Farm Stay" | "Heritage Home"

export type HostBadge = "Top Rated Host" | "Super Responsive Host" | null

export type CancellationPolicy = "Flexible" | "Moderate" | "Firm"

export const verificationLabel: Record<VerificationLevel, string> = {
  1: "Identity Verified",
  2: "Property Verified",
  3: "Video Verified",
  4: "On-Site Verified",
}

export type PropertyAmenity = {
  name: string
  icon: string
  category: string
}

export type ReviewBreakdown = {
  cleanliness: number
  accuracy: number
  checkIn: number
  communication: number
  location: number
  value: number
}

export type Review = {
  id: string
  author: string
  date: string
  rating: number
  text: string
  hostReply?: string
}

export type Host = {
  name: string
  photo?: string
  responseRate: number
  avgResponseTimeMinutes: number
  badge: HostBadge
  otherListingsCount: number
}

export type Property = {
  id: string
  slug: string
  title: string
  propertyType: PropertyType
  city: string
  region: string
  lat: number
  lng: number
  guests: number
  beds: number
  pricePerNight: number
  rating: number
  reviewCount: number
  verificationLevel: VerificationLevel
  hostName: string
  hostBadge: HostBadge
  image?: string
  images: string[]
  featured?: boolean
  description: string
  amenities: PropertyAmenity[]
  houseRules: string[]
  cancellationPolicy: CancellationPolicy
  whatsappNumber: string
  reviewBreakdown: ReviewBreakdown
  reviews: Review[]
  host: Host
}

export type SubscriptionPlanId = "basic" | "premium"

export type TripStatus = "upcoming" | "completed" | "cancelled"

export type Trip = {
  id: string
  property: Property
  checkIn: string
  checkOut: string
  guests: number
  status: TripStatus
  totalPaid: number
}

export type SearchParams = {
  city?: string
  type?: PropertyType
  guests?: number
  priceMin?: number
  priceMax?: number
  verification?: VerificationLevel
  sort?: "relevance" | "price-asc" | "price-desc" | "rating" | "verified"
}
