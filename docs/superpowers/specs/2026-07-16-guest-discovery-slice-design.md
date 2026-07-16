# Guest Discovery Slice — Design Spec

Date: 2026-07-16
Status: Approved (design), pending implementation plan

## Purpose

First buildable slice of the Kiphaus homestay marketplace: the guest-facing
discovery path — landing → search → property detail — with the WhatsApp
booking CTA present but gated behind a login stub. Auth, host onboarding/
verification, host dashboard, subscriptions, and admin are explicitly out of
scope and become their own future specs.

This slice is a narrowing of `docs/BUILD-PLAN.md`'s Phase 1+2. That plan
predates two doc/reality drifts worth flagging for whoever picks up the next
slice:

- `docs/ARCHITECTURE.md` still says styling is "Vanilla CSS & CSS Modules
  (Neumorphism Design System)." The repo actually runs Tailwind v4 + shadcn/ui
  against `DESIGN.md`'s Portal system (resolved this session — see below).
  ARCHITECTURE.md's styling section is stale.
- BUILD-PLAN.md's D1 ("Stayos.com vs /kiphaus") is already resolved: the
  product is Kiphaus. PRD.md's "Stayos.com" references are stale.

Neither gets fixed as part of this slice — noting them here so they don't
re-litigate as new confusion later.

## Decisions locked this session

1. **Design system = Portal, as currently written in `DESIGN.md`.**
   `CLAUDE.md` describes DESIGN.md as an unresolved seed pointing toward a
   navy/seafoam institutional direction; that's stale. DESIGN.md is fully
   resolved (iOS-blue `#007aff` accent, Perfectly Nineties/Playfair display
   serif, Inter body, 50px pill buttons, 22-30px card radii, glow-ring
   elevation instead of drop shadows, sunset-gradient hero). `globals.css`
   already implements these tokens. This is now confirmed as the real brand
   direction, superseding CLAUDE.md's navy/seafoam language. `CLAUDE.md`
   should get a follow-up edit to stop pointing at the old direction, but
   that edit is not part of this slice.
2. **Scope = guest-facing only.** Landing, search, property detail. Auth,
   host onboarding/verification, host dashboard, subscriptions, admin panel
   are deferred to later specs.
3. **WhatsApp CTA = stub-gated.** The primary "Book via WhatsApp" button and
   the wishlist heart both open a shared "Log in to contact this host" /
   "Log in to save stays" modal instead of executing. This honors
   `SECURITY.md`'s "unauthenticated guests cannot see host WhatsApp contact"
   rule without building real auth yet. The modal's login button links to
   `/login`, which remains an unbuilt stub this slice.
4. **Build sequencing = hybrid.** Small shared component kit sized to what
   the landing page needs, then vertical-slice landing → search → property
   detail, growing the kit only when a second page actually needs a piece.

## Routes in scope

- `/` — landing
- `/s` — search results (query params: `city`, `checkin`, `checkout`,
  `guests`, `type`, `priceMin`, `priceMax`, `verification`, `sort`)
- `/rooms/[id]` — property detail

Untouched this slice (remain 1-line stubs): `(guest)/rooms/[id]/book`,
`(guest)/trips`, `(guest)/messages`, `(guest)/wishlists`, `(guest)/account`,
everything under `(auth)`, everything under `(host)`.

## Data layer

`lib/mock-data.ts`'s `Property` type is missing fields the detail page needs.
Extend it:

- `images: string[]` (gallery — currently only a single optional `image`)
- `description: string`
- `amenities: string[]`
- `houseRules: string[]`
- `cancellationPolicy: "Flexible" | "Moderate" | "Firm"`
- `whatsappNumber: string` (fake, India-format)
- `reviewBreakdown: { cleanliness, accuracy, checkIn, communication, location, value }`
  (six categories per FEATURES.md §8's Airbnb audit note — five was the
  original spec, checkIn is the added sixth)
- `reviews: Review[]` (small sample list per property)
- `host: { name, photo?, responseRate, avgResponseTime, badge, otherListingsCount }`

Add `searchProperties(params)` filtering over city/type/price/verification/
guests. Move `Property`/`VerificationLevel`/new `Review`/`Host` types out of
`lib/mock-data.ts` into `types/index.ts` (currently an empty stub) so both
`lib` and `components` import from one place.

## Component inventory (new)

`components/layout/`:
- `site-header.tsx` — Portal floating nav capsule. Uses a Kiphaus monogram
  (not Portal's own paper-plane/arrow glyph), signal-blue circle, wordmark
  "Kiphaus" in Inter 600. Nav links: Search stays, Become a host (stub link),
  Log in (stub link). Mobile: collapses to menu button.
- `site-footer.tsx` — editorial footer: about/blog/contact, legal (terms/
  policy/cookies), city shortcut links from `searchCities`.

`components/features/guest/`:
- `search-bar.tsx` — city combobox + date range + guest count. Reused in
  landing hero and pinned atop `/s`.
- `search-filters.tsx` — property type, price range, verification level,
  sort. Sidebar on desktop, drawer (shadcn `Drawer`) on mobile.
- `property-card.tsx` — image, price, rating, verification badge, host
  badge, wishlist heart (opens gate modal).
- `trust-badge-row.tsx` — renders verification level + host badges as a set,
  same visual weight as price per PRD 3.2.
- `host-card.tsx` — host profile block for property detail.
- `review-summary.tsx` — six-category rating breakdown.
- `review-card.tsx` — single review with host reply slot.
- `property-gallery.tsx` — image gallery, lightbox on click.
- `empty-state.tsx` — no-results state, exact SECURITY.md copy.
- `whatsapp-gate-modal.tsx` — shared shadcn `Dialog`, two copy variants
  (contact host / save stays), used by both the WhatsApp CTA and wishlist
  heart.

Everything else (Button, Dialog, Skeleton, Avatar, Carousel, Drawer...)
reuses shadcn primitives already installed in `components/ui`.

## Page structure

**Landing (`/`):** Portal gradient hero with `SearchBar`, trust-proposition
section (zero commission, verified hosts, transparent pricing), featured
verified stays rail (`featuredProperties`, `PropertyCard`), "why Kiphaus"
editorial block, footer.

**Search (`/s`):** Pinned `SearchBar`, `SearchFilters` + sort, result grid of
`PropertyCard`s, `EmptyState` when filters return nothing, `loading.tsx`
skeleton grid for the async filter transition.

**Property detail (`/rooms/[id]`):** `PropertyGallery`, quick facts
(guests/beds/type), sticky price/booking card (all-in price, no fee reveal,
primary WhatsApp CTA + wishlist heart, both gated), `TrustBadgeRow` at equal
visual weight to price, description, amenities, house rules, cancellation
policy, `HostCard`, `ReviewSummary` + `ReviewCard` list, similar-stays rail
(same city/region via `propertiesByCity`/`propertiesByRegion`), approximate
location text (no interactive map this slice — deferred).

## Non-functional requirements (per SECURITY.md)

- Exact copy for empty search results and API-timeout states (Security doc
  §Error Handling / §Edge Cases).
- `loading.tsx` skeleton loaders on `/s` and `/rooms/[id]`.
- Missing-image fallback: branded Portal-style placeholder (ash-mist card +
  icon), never a broken `<img>`.
- `next/image` with blur-up placeholders everywhere.
- WCAG 2.1 AA: keyboard navigation through search, filters, and gallery;
  visible focus rings using the `--ring` token; alt text on all images;
  badges carry text, not just icon+color, so they don't fail on color alone.

## Tooling application

Per component/page: `/frontend-design` + `/taste-design` to keep output
Portal-native rather than generic. 21st-magic MCP as an optional visual
reference when a composition isn't obvious (gallery lightbox, floating nav).
`/senior-frontend` code-review pass per page after it's built. After all
three pages: one `/ui-ux-pro-max` audit pass across the whole slice, then
`/impeccable` in scan mode to re-sync `DESIGN.md` against what actually
shipped — this closes `CLAUDE.md`'s own open TODO ("once real on-brand
components exist, re-run /impeccable document in scan mode"). Playwright MCP
to visually verify each page in-browser (light + dark theme, mobile +
desktop viewport) before considering it done, per CLAUDE.md's UI-change
testing rule.

## Explicitly deferred

Real auth (Firebase OTP/Google), host onboarding, 4-level verification
portal, host dashboard, subscriptions, admin panel, interactive map view,
in-platform Request-to-Book form, real WhatsApp Business API send, i18n, SEO
destination landing pages beyond `/s?city=`.
