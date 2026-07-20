# Product Requirements Document (PRD)

> **Updated 2026-07-19:** the Django backend (`api/`) was built with full in-app booking-payment
> (Stripe payment intents, cancellation/refund logic on `Booking`) and in-app messaging
> (WebSocket `chat` app — conversations/messages) already implemented — the opposite of the
> "WhatsApp-handoff only" direction this doc originally specified. Decision: **keep that backend
> and move the product direction to match it**, rather than discard working code. The frontend
> (`book/page.tsx` and the WhatsApp-gate modal) has *not* been rebuilt to match yet — it still
> shows WhatsApp-handoff copy/flow. That frontend rebuild (real checkout UI, in-app conversation
> UI) is separate, not-yet-scoped follow-up work. Sections below are updated to reflect the target
> direction; treat any WhatsApp-specific copy still in the live frontend as the interim state.

## Product Vision
To become India's most trusted homestay platform by empowering hosts and making travel more personal, affordable, and transparent.

## Problem Statement
The Indian homestay market is highly fragmented. Travelers face hidden costs, fake listings, misleading photos, and inconsistent experiences when booking stays. Property owners (hosts) struggle with high OTA (Online Travel Agency) commissions (10-20%), lack of visibility control, and limited support for local business operations like GST compliance and onboarding. There is a massive gap for a platform that offers the uniqueness of an Airbnb with the reliability of a hotel, without gouging hosts on fees.

## Target Users
**1. Guests (Travelers)**
- **Demographics:** 20-45 years old, traveling for weekends, workations, family vacations, or religious tourism.
- **Tech Comfort:** Moderate to High. Comfortable using WhatsApp and modern web apps.
- **Goals:** Find verified, unique properties (homestays, villas, rural tourism) at transparent prices.
- **Frustrations:** Hidden taxes at checkout, properties not matching photos, canceled bookings.

**2. Hosts (Property Owners)**
- **Demographics:** 30-60 years old, owning homestays, farm stays, or villas across India.
- **Tech Comfort:** Low to Moderate. Need simple, localized interfaces.
- **Goals:** Maximize earnings, get direct bookings, manage properties easily.
- **Frustrations:** Exorbitant platform commissions, complex algorithms that hide their properties, lack of local language support.

## Core Features
1. **Property Discovery & Search** (Must-have)
   - Search by city/location with date and guest filters.
2. **Trust Badge Ecosystem** (Must-have)
   - Visual indicators for verified properties (Identity, Property, Video, On-Site, Top Rated Host).
3. **In-App Booking & Messaging** (Must-have)
   - Guest books and pays in-app (Stripe); guest/host communicate via in-app messaging.
   - Interim (current live frontend): a direct link to the host's WhatsApp instead — kept until
     the in-app checkout/messaging UI is built against the backend that already supports this.
4. **Host Onboarding & Verification Portal** (Must-have)
   - Multi-level verification flow (Aadhaar/PAN, Document Upload, Video Walkthrough).
5. **Subscription Management for Hosts** (Must-have)
   - Interface for hosts to purchase Basic (₹1,999/yr) or Premium (₹4,999/yr) plans.
6. **Host Dashboard & Analytics** (Nice-to-have for MVP, Must-have for V2)
   - Booking tracking, profile visibility stats, and property management tools.
7. **AI-Powered Pricing Recommendations** (Nice-to-have)
   - Suggestions for dynamic pricing based on occupancy and local events.

## App Flow
**Guest Flow:**
1. **Landing Page:** Guest arrives at Kiphaus. Sees search bar, featured verified stays, and trust propositions.
2. **Search Results:** Guest enters "Goa". Sees a list of properties with clear pricing (no hidden fees) and Trust Badges prominently displayed.
3. **Property Details:** Guest clicks a property. Views high-quality images, verified amenities, and host details.
4. **Booking/Contact (target):** Guest picks dates and pays in-app; a booking request goes to the host and messaging happens in-app.
   **Booking/Contact (current, interim):** Guest clicks "Book via WhatsApp" and is redirected to WhatsApp with a pre-filled message including the property ID and dates.
5. **Confirmation:** Host confirms the booking (in-app) or the pair finalizes directly on WhatsApp (interim).

**Host Flow:**
1. **Host Landing Page:** Host clicks "List your property". Reads about the Zero Commission model.
2. **Registration:** Host enters phone number and completes OTP verification.
3. **Property Onboarding:** Host fills in property details, uploads photos, and sets prices.
4. **Verification Step:** Host uploads Aadhaar/PAN, utility bills, and schedules a video walkthrough.
5. **Subscription Selection:** Host chooses between Basic or Premium yearly plans and completes payment.
6. **Dashboard:** Host accesses their dashboard to manage listings, view profile visits, and handle incoming guest WhatsApp leads.

## Success Metrics
- **Host Acquisition:** Number of verified hosts successfully onboarded and subscribed (Target: 100 in Phase 1).
- **Guest Engagement:** Number of "Book via WhatsApp" clicks per property.
- **Conversion Rate:** Percentage of visitors who initiate a host contact.
- **Trust Metric:** Percentage of properties achieving Level 2 (Property) or Level 3 (Video) verification within the first week of signup.

## What We Are NOT Building in V1
- A native iOS/Android app (starting with a responsive Next.js web application).
- Host subscription billing beyond a placeholder (`api/payments` — real Basic/Premium pricing
  and the Stripe Checkout flow for it are still unbuilt as of 2026-07-19).

(In-app booking payment and messaging were previously listed here as out of scope, deferred to
WhatsApp — see the 2026-07-19 note at the top of this doc for why that changed.)
