# UI Polish, Motion, Widgets & Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up stray files, build two real widgets (booking calendar, interactive map) on the property detail page, build a shared Framer Motion (`motion` package) primitives kit, and sweep every page/shared component in the app to use it — without changing the existing Portal design system's shape (pill radii, search bar, property card skeleton, nav stay as-is per explicit user decision).

**Architecture:** Five dependency-ordered phases. Phase 0 (cleanup) and Phase 1 (widgets) touch shared types/config and must land first. Phase 2 builds the motion primitives kit that every later task imports. Phase 3 sweeps every page/component in four independent tracks (guest / host / auth / public+legal+chrome) that share no files with each other and can run in parallel once Phase 2 lands. Phase 4 is a manual verification pass.

**Tech Stack:** Next.js 16 App Router, React 19, `motion` v12 (Framer Motion's current package, already installed — import from `"motion/react"`), `react-leaflet` + `leaflet` (new, free OSM tiles, no API key), Tailwind v4, shadcn/ui on `@base-ui/react`.

## Global Constraints

- **No automated tests are added.** Per the spec, this pass removes the remaining test files/tooling and does not reintroduce them. Every task's verification step is manual: run `npm run dev` and check the affected page/component in a browser, plus `npm run typecheck` after structural changes. There is no "write failing test" step in this plan — that step is replaced by "manually verify in the browser."
- **No shape changes.** Do not change border-radius, the search bar's segmented-pill layout, the property card's heart/star/price skeleton, or the nav's pill shape. Only add motion, fix spacing/interaction/empty/loading states, and build the two named widgets.
- **Respect `prefers-reduced-motion`.** Every motion primitive must degrade to no animation (instant, final state) when the user has reduced motion enabled. `app/globals.css` already zeroes CSS transitions/animations via a media query (lines 216-223) — that does **not** cover Motion's JS-driven animations, so each primitive must separately call `useReducedMotion()` from `motion/react` and branch.
- **Composition, not directives.** A Server Component (a page, or a component like `PropertyCard`/`PageHero`/`LegalShell` that has no `"use client"`) may render a Client Component (anything under `components/motion/`) as JSX without itself becoming a Client Component. Do not add `"use client"` to a file just because it now renders a motion primitive — only add it if the file itself uses hooks/state.
- **Money/copy is exact.** Any currency string must keep the existing `₹` + `toLocaleString("en-IN")` formatting already used throughout the codebase. Don't reformat prices while touching a file for motion.
- Run `npm run typecheck` after any task that adds/removes a dependency or changes a shared type (`Property`, `BaseProperty`) before moving to the next task.

---

## Phase 0 — Cleanup

### Task 1: Remove remaining test files and test tooling

**Files:**
- Delete: `app/(guest)/rooms/[id]/page.test.tsx`
- Delete: `app/(guest)/s/page.test.tsx`
- Delete: `components/ui/button.test.tsx`
- Delete: `lib/mock-data.test.ts`
- Delete: `lib/utils.test.ts`
- Delete: `lib/whatsapp.test.ts`
- Delete: `vitest.config.ts`
- Delete: `vitest.setup.ts`
- Modify: `package.json`

**Interfaces:** None — this task removes code, nothing downstream depends on it.

- [ ] **Step 1: Delete the test files and vitest config**

```bash
git rm "app/(guest)/rooms/[id]/page.test.tsx" "app/(guest)/s/page.test.tsx" components/ui/button.test.tsx lib/mock-data.test.ts lib/utils.test.ts lib/whatsapp.test.ts vitest.config.ts vitest.setup.ts
```

- [ ] **Step 2: Remove test tooling from package.json**

In `package.json`, remove these two script entries:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

And remove these devDependencies entries:

```json
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@vitejs/plugin-react": "^6.0.3",
    "jsdom": "^29.1.1",
    "vitest": "^4.1.10",
```

- [ ] **Step 3: Sync the lockfile**

```bash
npm install
```

Expected: `package-lock.json` updates, no errors.

- [ ] **Step 4: Verify nothing else references vitest**

```bash
npm run typecheck
```

Expected: passes with no errors (no remaining file imports `vitest` or `@testing-library/*`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove remaining test files and test tooling"
```

---

### Task 2: Remove stale `.gitkeep` files and merged worktree cruft

**Context:** `git branch --merged master` confirms all 15 `worktree-agent-*` local branches are already merged into `master` — they were created by earlier parallel-agent sessions and are safe to delete. Three of them (`agent-a3820a62d6fbb0016`, `agent-a8657025e416726a7`, `agent-a9c67e1596b1268a5`) left behind full checkout directories under `.claude/worktrees/` and matching admin metadata under `.git/worktrees/` that `git worktree list` no longer reports as active — these are orphaned and safe to remove.

**Files:**
- Delete: `components/.gitkeep`, `components/features/.gitkeep`, `components/layout/.gitkeep`, `components/shared/.gitkeep`, `components/ui/.gitkeep`
- Delete (directory): `.claude/worktrees/agent-a3820a62d6fbb0016`, `.claude/worktrees/agent-a8657025e416726a7`, `.claude/worktrees/agent-a9c67e1596b1268a5`
- Delete (git refs): the 15 `worktree-agent-*` local branches

**Interfaces:** None.

- [ ] **Step 1: Confirm every worktree-agent branch is merged (safety check before deleting)**

```bash
git branch --merged master
```

Expected: lists `master` plus all 15 `worktree-agent-*` branches. If any `worktree-agent-*` branch is **missing** from this output, stop and do not delete it — it has unmerged commits.

- [ ] **Step 2: Delete the stale `.gitkeep` files**

```bash
git rm components/.gitkeep components/features/.gitkeep components/layout/.gitkeep components/shared/.gitkeep components/ui/.gitkeep
```

- [ ] **Step 3: Remove the orphaned worktree checkout directories and prune git's admin metadata**

```bash
rm -rf .claude/worktrees/agent-a3820a62d6fbb0016 .claude/worktrees/agent-a8657025e416726a7 .claude/worktrees/agent-a9c67e1596b1268a5
git worktree prune
```

Expected: `git worktree list` still shows only the main worktree afterward (unchanged — confirms these were never actually registered as live worktrees).

- [ ] **Step 4: Delete the merged branches**

```bash
git branch -d worktree-agent-a0e00c39e44a18509 worktree-agent-a2c0badb97fe2b3a7 worktree-agent-a3820a62d6fbb0016 worktree-agent-a3ad67f69855395cb worktree-agent-a404ed7ccae0173e8 worktree-agent-a6d3b98b11714f17c worktree-agent-a6df3ba345ba793c4 worktree-agent-a6e3ac6487dbb35ee worktree-agent-a861c16bcef68d055 worktree-agent-a8657025e416726a7 worktree-agent-a9c67e1596b1268a5 worktree-agent-ae09327172b3bc868 worktree-agent-ae8beded4c2653981 worktree-agent-ae9b57e908395277a worktree-agent-afa389455cb532e57
```

Expected: `Deleted branch ...` for all 15 (git's `-d` flag refuses any branch with unmerged commits, so this is safe even if Step 1's check was wrong).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove stale .gitkeep files and merged worktree-agent branches"
```

---

## Phase 1 — Widgets

### Task 3: Add coordinates to the Property type and mock data

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/mock-data.ts`

**Interfaces:**
- Produces: `Property.lat: number`, `Property.lng: number` — consumed by Task 5 (map widget).

- [ ] **Step 1: Add lat/lng to the Property type**

In `types/index.ts`, add two fields to the `Property` type (after `region`):

```typescript
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
  ...
```

- [ ] **Step 2: Add lat/lng to BaseProperty and every mock entry**

In `lib/mock-data.ts`, add the fields to the `BaseProperty` type:

```typescript
type BaseProperty = {
  id: string
  slug: string
  title: string
  propertyType: PropertyType
  city: string
  region: string
  lat: number
  lng: number
  guests: number
  ...
```

Add `lat`/`lng` to each of the 15 entries in `baseProperties` (insert after each entry's `region` line):

```typescript
  { id: "p1", ..., region: "Delhi NCR", lat: 28.4211, lng: 77.0431, guests: 3, ... },   // Aravali Ridge Studio, Gurugram
  { id: "p2", ..., region: "Delhi NCR", lat: 28.4165, lng: 77.0900, guests: 4, ... },   // Sector 56 Family Flat, Gurugram
  { id: "p3", ..., region: "Delhi NCR", lat: 28.4909, lng: 77.0879, guests: 2, ... },   // DLF Phase 3 Loft, Gurugram
  { id: "p4", ..., region: "Delhi NCR", lat: 28.2903, lng: 77.0483, guests: 10, ... },  // Sohna Road Farmhouse, Gurugram
  { id: "p5", ..., region: "Delhi NCR", lat: 28.5535, lng: 77.2004, guests: 3, ... },   // Hauz Khas Heritage Haveli, Delhi
  { id: "p6", ..., region: "Delhi NCR", lat: 28.5581, lng: 77.1588, guests: 4, ... },   // Vasant Vihar Garden Flat, Delhi
  { id: "p7", ..., region: "Delhi NCR", lat: 28.5459, lng: 77.3610, guests: 5, ... },   // Noida Sector 94 High-Rise
  { id: "p8", ..., region: "Goa", lat: 15.5439, lng: 73.7553, guests: 8, ... },         // Calangute Pool Villa
  { id: "p9", ..., region: "Goa", lat: 15.5928, lng: 73.7826, guests: 6, ... },         // Assagao Jungle Villa
  { id: "p10", ..., region: "Goa", lat: 15.6469, lng: 73.7469, guests: 3, ... },        // Siolim Riverside Flat
  { id: "p11", ..., region: "Goa", lat: 15.5553, lng: 73.7517, guests: 2, ... },        // Baga Beachfront Studio
  { id: "p12", ..., region: "Himachal Pradesh", lat: 32.2549, lng: 77.1734, guests: 4, ... }, // Old Manali Riverside
  { id: "p13", ..., region: "Uttarakhand", lat: 30.1298, lng: 78.2870, guests: 3, ... }, // Tapovan Ganga-View, Rishikesh
  { id: "p14", ..., region: "Rajasthan", lat: 24.5764, lng: 73.6797, guests: 2, ... },  // Lake Pichola Heritage, Udaipur
  { id: "p15", ..., region: "Karnataka", lat: 12.3375, lng: 75.8069, guests: 5, ... },  // Coorg Coffee Estate Cottage
```

Insert the real `lat`/`lng` value pair into each entry's existing object literal at the position shown (right after `region`), keeping every other existing field exactly as-is — the `...` above stands for the unchanged surrounding fields already in the file, not literal code to paste.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: passes — `enrich()`'s `{...base, ...}` spread automatically carries `lat`/`lng` onto `Property` since they're now part of `BaseProperty`.

- [ ] **Step 4: Commit**

```bash
git add types/index.ts lib/mock-data.ts
git commit -m "feat: add lat/lng coordinates to Property and mock data"
```

---

### Task 4: Real booking calendar widget on property detail

**Files:**
- Create: `components/features/guest/booking-calendar.tsx`
- Modify: `app/(guest)/rooms/[id]/page.tsx:128-135`

**Interfaces:**
- Consumes: `Calendar` component from `@/components/ui/calendar` (same `mode="range"` / `selected` / `onSelect` / `disabled` API already used in `components/features/guest/search-bar.tsx:161-167`).
- Produces: `BookingCalendar({ city, pricePerNight }: { city: string; pricePerNight: number })` — a client component with no external state dependency, consumed by Task 4 only.

- [ ] **Step 1: Create the BookingCalendar component**

```tsx
"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"

function nightsBetween(range?: DateRange) {
  if (!range?.from || !range?.to) return 0
  const ms = range.to.getTime() - range.from.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function BookingCalendar({
  city,
  pricePerNight,
}: {
  city: string
  pricePerNight: number
}) {
  const [range, setRange] = useState<DateRange | undefined>()
  const nights = nightsBetween(range)
  const total = nights * pricePerNight

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-ink-black mb-1">
        {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} in ${city}` : `Select dates in ${city}`}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {nights > 0
          ? `₹${pricePerNight.toLocaleString("en-IN")} x ${nights} ${nights === 1 ? "night" : "nights"} = ₹${total.toLocaleString("en-IN")}`
          : "Select dates for exact pricing"}
      </p>
      <div className="rounded-xl border border-border p-3">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          disabled={{ before: new Date() }}
          className="mx-auto"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace the placeholder on the property detail page**

In `app/(guest)/rooms/[id]/page.tsx`, add the import:

```tsx
import { BookingCalendar } from "@/components/features/guest/booking-calendar"
```

Replace lines 128-135:

```tsx
            {/* Calendar Placeholder */}
            <div>
               <h2 className="text-[22px] font-semibold text-ink-black mb-1">7 nights in {property.city}</h2>
               <p className="text-sm text-muted-foreground mb-6">Select dates for exact pricing</p>
               <div className="h-[300px] bg-muted/30 rounded-xl border border-border flex items-center justify-center text-muted-foreground">
                  Calendar Widget Placeholder
               </div>
            </div>
```

with:

```tsx
            {/* Calendar */}
            <BookingCalendar city={property.city} pricePerNight={property.pricePerNight} />
```

- [ ] **Step 3: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/rooms/p1`, scroll to the calendar section, select a date range, confirm the heading and price line update live and disabled past dates can't be selected.

- [ ] **Step 4: Commit**

```bash
git add components/features/guest/booking-calendar.tsx "app/(guest)/rooms/[id]/page.tsx"
git commit -m "feat: real booking calendar widget on property detail"
```

---

### Task 5: Real interactive map widget on property detail

**Files:**
- Modify: `package.json` (new deps)
- Create: `components/features/guest/leaflet-map.tsx`
- Create: `components/features/guest/property-map.tsx`
- Modify: `app/(guest)/rooms/[id]/page.tsx:233-241`

**Interfaces:**
- Consumes: `Property.lat`, `Property.lng` from Task 3.
- Produces: `PropertyMap({ lat, lng, label }: { lat: number; lng: number; label: string })`, default export `LeafletMap` (internal, only imported by `property-map.tsx`).

- [ ] **Step 1: Install dependencies**

```bash
npm install react-leaflet leaflet
npm install -D @types/leaflet
```

- [ ] **Step 2: Create the Leaflet map implementation (client-only internals)**

```tsx
"use client"

import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const markerIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="#e8562b"/><circle cx="16" cy="16" r="6" fill="#ffffff"/></svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
})

export default function LeafletMap({
  lat,
  lng,
  label,
}: {
  lat: number
  lng: number
  label: string
}) {
  return (
    <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon} alt={label} />
    </MapContainer>
  )
}
```

- [ ] **Step 3: Create the lazy-loaded wrapper (avoids SSR crash — Leaflet touches `window` at import time)**

```tsx
"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
})

export function PropertyMap({
  lat,
  lng,
  label,
}: {
  lat: number
  lng: number
  label: string
}) {
  return (
    <div className="h-[480px] w-full overflow-hidden rounded-xl border border-border">
      <LeafletMap lat={lat} lng={lng} label={label} />
    </div>
  )
}
```

- [ ] **Step 4: Replace the placeholder on the property detail page**

In `app/(guest)/rooms/[id]/page.tsx`, add the import:

```tsx
import { PropertyMap } from "@/components/features/guest/property-map"
```

Replace lines 233-241:

```tsx
        {/* Map / Location */}
        <div className="mt-12 pt-12 border-t border-border">
           <h2 className="text-[22px] font-semibold text-ink-black mb-6">Where you&rsquo;ll be</h2>
           <p className="mb-6 text-ink-black">{property.city}, {property.region}, India</p>
           <div className="h-[480px] bg-muted/30 rounded-xl border border-border flex items-center justify-center text-muted-foreground">
             Map View Placeholder
           </div>
           <p className="mt-6 text-ink-black font-semibold">Exact location provided after booking.</p>
        </div>
```

with:

```tsx
        {/* Map / Location */}
        <div className="mt-12 pt-12 border-t border-border">
           <h2 className="text-[22px] font-semibold text-ink-black mb-6">Where you&rsquo;ll be</h2>
           <p className="mb-6 text-ink-black">{property.city}, {property.region}, India</p>
           <PropertyMap lat={property.lat} lng={property.lng} label={`${property.city}, ${property.region}`} />
           <p className="mt-6 text-ink-black font-semibold">Exact location provided after booking.</p>
        </div>
```

- [ ] **Step 5: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/rooms/p1`, scroll to "Where you'll be", confirm the map renders OSM tiles centered on Gurugram with a coral pin, no console errors about `window is not defined`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json components/features/guest/leaflet-map.tsx components/features/guest/property-map.tsx "app/(guest)/rooms/[id]/page.tsx"
git commit -m "feat: real interactive map widget on property detail"
```

---

## Phase 2 — Motion Primitives Kit

### Task 6: Build the shared motion primitives

**Files:**
- Create: `components/motion/transitions.ts`
- Create: `components/motion/fade-in.tsx`
- Create: `components/motion/stagger-list.tsx`
- Create: `components/motion/hover-lift.tsx`

**Interfaces:**
- Produces:
  - `EASE_OUT: [number, number, number, number]`, `DURATION: { fast: 0.15, base: 0.35, slow: 0.6 }` from `transitions.ts`
  - `FadeIn({ children, delay?, y?, className?, inView?, once? })` — `inView` defaults `true` (scroll-triggered reveal, for below-fold content); pass `inView={false}` for above-the-fold content that should animate on mount instead of on scroll-into-view.
  - `StaggerList({ children, className?, inView? })` + `StaggerItem({ children, className? })` — `StaggerList` is the container (orchestrates timing via Motion variants), `StaggerItem` wraps each individual child. Same `inView` semantics as `FadeIn`.
  - `HoverLift({ children, className?, lift? })` — `lift` defaults `4` (pixels raised on hover).
- All four are Client Components (`"use client"`) and are safe to import into Server Components as JSX (see Global Constraints).

- [ ] **Step 1: Create shared transition constants**

```typescript
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const DURATION = {
  fast: 0.15,
  base: 0.35,
  slow: 0.6,
} as const
```

- [ ] **Step 2: Create FadeIn**

```tsx
"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { DURATION, EASE_OUT } from "./transitions"

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
  inView = true,
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  inView?: boolean
  once?: boolean
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const trigger = inView
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once, margin: "-80px" } }
    : { animate: { opacity: 1, y: 0 } }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ duration: DURATION.base, delay, ease: EASE_OUT }}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Create StaggerList and StaggerItem**

```tsx
"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { ReactNode } from "react"
import { DURATION, EASE_OUT } from "./transitions"

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
}

export function StaggerList({
  children,
  className,
  inView = true,
}: {
  children: ReactNode
  className?: string
  inView?: boolean
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-80px" } }
    : { animate: "show" }

  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" {...trigger}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Create HoverLift**

```tsx
"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

export function HoverLift({
  children,
  className,
  lift = 4,
}: {
  children: ReactNode
  className?: string
  lift?: number
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 5: Manually verify**

```bash
npm run typecheck
npm run dev
```

Temporarily drop `<FadeIn>Test</FadeIn>` into `app/page.tsx`, confirm it fades in on load, remove the temporary line before committing. In your OS accessibility settings, enable "reduce motion", reload, confirm the same element now appears instantly with no animation.

- [ ] **Step 6: Commit**

```bash
git add components/motion/
git commit -m "feat: shared motion primitives kit (FadeIn, StaggerList, HoverLift)"
```

---

## Phase 3a — Guest Sweep

### Task 7: Landing page motion

**Files:**
- Modify: `app/page.tsx`

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: Wrap the search bar and each listing grid**

In `app/page.tsx`, add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace the search bar section:

```tsx
        <section className="flex justify-center pt-8 pb-10 px-4">
          <div className="w-full max-w-4xl">
            <SearchBar className="w-full" />
          </div>
        </section>
```

with:

```tsx
        <section className="flex justify-center pt-8 pb-10 px-4">
          <FadeIn inView={false} className="w-full max-w-4xl">
            <SearchBar className="w-full" />
          </FadeIn>
        </section>
```

Replace each of the three listing grids (repeat this transform for `popularGoa`, `chandigarhWeekend`, `noidaStays` — shown here for the first):

```tsx
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {popularGoa.map((property) => (
                <PropertyCard key={`goa-${property.id}`} property={property} />
              ))}
            </div>
```

with:

```tsx
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {popularGoa.map((property) => (
                <StaggerItem key={`goa-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
```

Apply the identical swap to the `chandigarhWeekend` grid:

```tsx
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {chandigarhWeekend.map((property) => (
                <PropertyCard key={`chd-${property.id}`} property={property} />
              ))}
            </div>
```

becomes:

```tsx
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {chandigarhWeekend.map((property) => (
                <StaggerItem key={`chd-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
```

And the `noidaStays` grid:

```tsx
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {noidaStays.map((property) => (
                <PropertyCard key={`noida-${property.id}`} property={property} />
              ))}
            </div>
```

becomes:

```tsx
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {noidaStays.map((property) => (
                <StaggerItem key={`noida-${property.id}`}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000`, confirm the search bar fades in on load and each of the three card rows staggers in as you scroll to it.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: motion on landing page search bar and listing grids"
```

---

### Task 8: Search results motion

**Files:**
- Modify: `app/(guest)/s/page.tsx`

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: Wrap the search bar, results grid, and empty state**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
        <SearchBar className="mb-10 max-w-4xl" />
```

with:

```tsx
        <FadeIn inView={false} className="mb-10 max-w-4xl">
          <SearchBar className="w-full" />
        </FadeIn>
```

Replace:

```tsx
            {results.length === 0 ? (
              <EmptyState city={params.city} />
            ) : (
              <>
                <p className="mb-6 text-sm font-medium text-foreground">
                  {results.length} {results.length === 1 ? "stay" : "stays"}
                  {params.city ? ` in ${params.city}` : ""}
                </p>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </>
            )}
```

with:

```tsx
            {results.length === 0 ? (
              <FadeIn inView={false}>
                <EmptyState city={params.city} />
              </FadeIn>
            ) : (
              <>
                <p className="mb-6 text-sm font-medium text-foreground">
                  {results.length} {results.length === 1 ? "stay" : "stays"}
                  {params.city ? ` in ${params.city}` : ""}
                </p>
                <StaggerList inView={false} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((property) => (
                    <StaggerItem key={property.id}>
                      <PropertyCard property={property} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </>
            )}
```

(`inView={false}` here because search results are the primary page content visible immediately on load, not a below-fold reveal.)

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/s`, confirm results stagger in on load. Visit `http://localhost:3000/s?city=NoCityMatchesThis` to confirm the empty state fades in.

- [ ] **Step 3: Commit**

```bash
git add "app/(guest)/s/page.tsx"
git commit -m "feat: motion on search results page"
```

---

### Task 9: Property detail motion

**Files:**
- Modify: `app/(guest)/rooms/[id]/page.tsx` (after Tasks 4 and 5 have already landed)

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: Fade in the gallery, stagger the similar-stays grid**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
        {/* Gallery */}
        <PropertyGallery images={property.images} title={property.title} />
```

with:

```tsx
        {/* Gallery */}
        <FadeIn inView={false}>
          <PropertyGallery images={property.images} title={property.title} />
        </FadeIn>
```

Replace:

```tsx
        {/* More stays */}
        {similar.length > 0 && (
          <div className="mt-12 pt-12 border-t border-border">
            <h2 className="text-[22px] font-semibold text-ink-black mb-6">More stays in {property.city}</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((candidate) => (
                <PropertyCard key={candidate.id} property={candidate} />
              ))}
            </div>
          </div>
        )}
```

with:

```tsx
        {/* More stays */}
        {similar.length > 0 && (
          <div className="mt-12 pt-12 border-t border-border">
            <h2 className="text-[22px] font-semibold text-ink-black mb-6">More stays in {property.city}</h2>
            <StaggerList className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((candidate) => (
                <StaggerItem key={candidate.id}>
                  <PropertyCard property={candidate} />
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        )}
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/rooms/p1`, confirm the gallery fades in immediately and the "More stays" grid staggers in when scrolled into view.

- [ ] **Step 3: Commit**

```bash
git add "app/(guest)/rooms/[id]/page.tsx"
git commit -m "feat: motion on property detail gallery and similar-stays grid"
```

---

### Task 10: Booking page motion

**Files:**
- Modify: `app/(guest)/rooms/[id]/book/page.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6.

- [ ] **Step 1: Fade in the trip summary and price columns**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
```

with:

```tsx
        <FadeIn inView={false} className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
```

And replace the closing `</div>` immediately before `</main>` (the one that pairs with the grid opened above) with `</FadeIn>`.

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/rooms/p1/book`, confirm the two-column layout fades in on load.

- [ ] **Step 3: Commit**

```bash
git add "app/(guest)/rooms/[id]/book/page.tsx"
git commit -m "feat: motion on booking confirmation page"
```

---

### Task 11: Guest account section motion (account, messages, trips, wishlists)

**Files:**
- Modify: `app/(guest)/account/page.tsx`
- Modify: `app/(guest)/messages/page.tsx`
- Modify: `app/(guest)/trips/page.tsx`
- Modify: `app/(guest)/wishlists/page.tsx`

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: account/page.tsx — stagger the four sections**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Wrap each of the four top-level `<section>` blocks (`personal-info`, `security`, `notifications`, and the final member-since/logout section) in `FadeIn` with an increasing `delay`, e.g. the personal-info section:

```tsx
            <section aria-labelledby="personal-info">
```

becomes:

```tsx
            <FadeIn inView={false} delay={0}>
            <section aria-labelledby="personal-info">
```

...with the matching `</FadeIn>` added right after that section's closing `</section>`. Apply `delay={0.05}` to the `security` section, `delay={0.1}` to `notifications`, and `delay={0.15}` to the final section. Each `<Separator />` between sections stays outside the `FadeIn` wrappers, unchanged.

- [ ] **Step 2: messages/page.tsx — fade heading, stagger threads, fade empty state**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
            {messageThreads.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
                  No conversations yet. Contact a host from any listing to start one on WhatsApp.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messageThreads.map((thread) => (
                  <WhatsAppThreadRow key={thread.id} thread={thread} />
                ))}
              </div>
            )}
```

with:

```tsx
            {messageThreads.length === 0 ? (
              <FadeIn inView={false} className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
                  No conversations yet. Contact a host from any listing to start one on WhatsApp.
                </p>
              </FadeIn>
            ) : (
              <StaggerList inView={false} className="space-y-3">
                {messageThreads.map((thread) => (
                  <StaggerItem key={thread.id}>
                    <WhatsAppThreadRow thread={thread} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
```

- [ ] **Step 3: trips/page.tsx — stagger upcoming/past trip lists, fade empty state**

Add the same imports as Step 2. Replace the empty-state block (the `<div className="flex flex-col items-center gap-4 ...">` containing "No trips yet...") the same way as Step 2 — wrap it in `<FadeIn inView={false} className="...">`.

Replace both:

```tsx
                    <div className="space-y-4">
                      {upcoming.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
```

and the matching block for `past.map`, with:

```tsx
                    <StaggerList inView={false} className="space-y-4">
                      {upcoming.map((trip) => (
                        <StaggerItem key={trip.id}>
                          <TripCard trip={trip} />
                        </StaggerItem>
                      ))}
                    </StaggerList>
```

(swap `upcoming` for `past` in the second occurrence).

- [ ] **Step 4: wishlists/page.tsx — stagger the saved-properties grid, fade empty state**

Add the same imports as Step 2. Wrap the empty-state block the same way as Step 2. Replace:

```tsx
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
```

with:

```tsx
              <StaggerList inView={false} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((property) => (
                  <StaggerItem key={property.id}>
                    <PropertyCard property={property} />
                  </StaggerItem>
                ))}
              </StaggerList>
```

- [ ] **Step 5: Manually verify**

```bash
npm run dev
```

Visit `/account`, `/messages`, `/trips`, `/wishlists` — confirm each loads with its content animating in, and that the empty states in `/messages` (change `messageThreads` to `[]` temporarily to check, then revert) and `/trips`/`/wishlists` fade correctly.

- [ ] **Step 6: Commit**

```bash
git add "app/(guest)/account/page.tsx" "app/(guest)/messages/page.tsx" "app/(guest)/trips/page.tsx" "app/(guest)/wishlists/page.tsx"
git commit -m "feat: motion across guest account, messages, trips, wishlists pages"
```

---

### Task 12: PropertyCard hover-lift

**Files:**
- Modify: `components/features/guest/property-card.tsx`

**Interfaces:** Consumes `HoverLift` from Task 6.

- [ ] **Step 1: Wrap the card root in HoverLift**

Add the import:

```tsx
import { HoverLift } from "@/components/motion/hover-lift"
```

Replace the opening/closing of the component:

```tsx
export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="group relative flex flex-col gap-3">
```

with:

```tsx
export function PropertyCard({ property }: { property: Property }) {
  return (
    <HoverLift className="group relative flex flex-col gap-3">
```

And the final closing `</div>` of the component (the one matching this root, right before the function's closing `}`) becomes `</HoverLift>`.

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Open `http://localhost:3000`, hover over any property card, confirm it lifts slightly (existing image `group-hover:scale-105` and this new lift both apply without conflicting).

- [ ] **Step 3: Commit**

```bash
git add components/features/guest/property-card.tsx
git commit -m "feat: hover-lift on PropertyCard"
```

---

## Phase 3b — Host Sweep

### Task 13: HostShell entrance transition

**Files:**
- Modify: `components/features/host/host-shell.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6. Every host page (dashboard, properties, properties/new, properties/[id]/edit, subscription, verification) renders through this shell, so this one edit covers all six.

- [ ] **Step 1: Wrap `{children}` in FadeIn**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">{children}</main>
```

with:

```tsx
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn inView={false}>{children}</FadeIn>
      </main>
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/host/dashboard`, confirm the whole page content fades in on load.

- [ ] **Step 3: Commit**

```bash
git add components/features/host/host-shell.tsx
git commit -m "feat: entrance transition on HostShell"
```

---

### Task 14: Host dashboard motion

**Files:**
- Modify: `app/host/dashboard/page.tsx`

**Interfaces:** Consumes `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: Stagger the stat cards, inquiries, and property rows**

Add the import:

```tsx
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Eye} label="Listing views" value={totalViews.toLocaleString("en-IN")} />
        <StatCard icon={MessageSquare} label="Inquiries" value={String(totalInquiries)} />
        <StatCard icon={CalendarCheck} label="Bookings" value={String(totalBookings)} />
        <StatCard icon={IndianRupee} label="Est. earnings" value={`₹${estimatedEarnings.toLocaleString("en-IN")}`} hint="Kiphaus doesn't process stay payments" />
      </div>
```

with:

```tsx
      <StaggerList inView={false} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StaggerItem><StatCard icon={Eye} label="Listing views" value={totalViews.toLocaleString("en-IN")} /></StaggerItem>
        <StaggerItem><StatCard icon={MessageSquare} label="Inquiries" value={String(totalInquiries)} /></StaggerItem>
        <StaggerItem><StatCard icon={CalendarCheck} label="Bookings" value={String(totalBookings)} /></StaggerItem>
        <StaggerItem><StatCard icon={IndianRupee} label="Est. earnings" value={`₹${estimatedEarnings.toLocaleString("en-IN")}`} hint="Kiphaus doesn't process stay payments" /></StaggerItem>
      </StaggerList>
```

Replace:

```tsx
            <div className="space-y-3">
              {hostInquiries.map((inquiry) => (
                <InquiryRow key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
```

with:

```tsx
            <StaggerList className="space-y-3">
              {hostInquiries.map((inquiry) => (
                <StaggerItem key={inquiry.id}><InquiryRow inquiry={inquiry} /></StaggerItem>
              ))}
            </StaggerList>
```

Replace:

```tsx
            <div className="space-y-3">
              {hostListings.slice(0, 2).map((listing) => (
                <PropertyRow key={listing.property.id} listing={listing} />
              ))}
            </div>
```

with:

```tsx
            <StaggerList className="space-y-3">
              {hostListings.slice(0, 2).map((listing) => (
                <StaggerItem key={listing.property.id}><PropertyRow listing={listing} /></StaggerItem>
              ))}
            </StaggerList>
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/host/dashboard`, confirm the four stat cards animate in together on load, and the inquiries/properties lists stagger in.

- [ ] **Step 3: Commit**

```bash
git add app/host/dashboard/page.tsx
git commit -m "feat: motion on host dashboard stat cards and lists"
```

---

### Task 15: Host properties list motion

**Files:**
- Modify: `app/host/properties/page.tsx`

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: Fade the empty state, stagger the listing rows**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
        {hostListings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
              You haven&rsquo;t listed a property yet. Add your first one to start getting verified.
            </p>
            <Button
              className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              render={<Link href="/host/properties/new" />}
              nativeButton={false}
            >
              Add your first property
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {hostListings.map((listing) => (
              <PropertyRow key={listing.property.id} listing={listing} />
            ))}
          </div>
        )}
```

with:

```tsx
        {hostListings.length === 0 ? (
          <FadeIn inView={false} className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
              You haven&rsquo;t listed a property yet. Add your first one to start getting verified.
            </p>
            <Button
              className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              render={<Link href="/host/properties/new" />}
              nativeButton={false}
            >
              Add your first property
            </Button>
          </FadeIn>
        ) : (
          <StaggerList inView={false} className="space-y-4">
            {hostListings.map((listing) => (
              <StaggerItem key={listing.property.id}><PropertyRow listing={listing} /></StaggerItem>
            ))}
          </StaggerList>
        )}
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/host/properties`, confirm rows stagger in.

- [ ] **Step 3: Commit**

```bash
git add app/host/properties/page.tsx
git commit -m "feat: motion on host properties list"
```

---

### Task 16: Host onboarding motion

**Files:**
- Modify: `app/host/onboarding/page.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6. This page doesn't use `HostShell` (it has its own standalone header), so it needs its own entrance treatment.

- [ ] **Step 1: Fade in the heading/intro and the "About you" section**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
          Let&rsquo;s get you verified
        </h1>
        <p className="mt-3 text-body text-smoke leading-body tracking-body">
          Tell us about you and your property. Verification starts as soon as you submit — most hosts hear back
          on Level 1 & 2 within 2 business days.
        </p>

        <section aria-labelledby="about-you" className="mt-10">
```

with:

```tsx
      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        <FadeIn inView={false}>
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
          Let&rsquo;s get you verified
        </h1>
        <p className="mt-3 text-body text-smoke leading-body tracking-body">
          Tell us about you and your property. Verification starts as soon as you submit — most hosts hear back
          on Level 1 & 2 within 2 business days.
        </p>

        <section aria-labelledby="about-you" className="mt-10">
```

Find the matching `</section>` that closes `about-you` and add `</FadeIn>` immediately after it (before the following `<Separator className="my-10" />`).

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/host/onboarding`, confirm the heading and "About you" section fade in on load.

- [ ] **Step 3: Commit**

```bash
git add app/host/onboarding/page.tsx
git commit -m "feat: motion on host onboarding page"
```

---

### Task 17: Host subscription and verification motion

**Files:**
- Modify: `app/host/subscription/page.tsx`
- Modify: `app/host/verification/page.tsx`

**Interfaces:** Consumes `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: subscription/page.tsx — stagger the two plan cards**

Add the import:

```tsx
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <SubscriptionPlanCard key={plan.id} plan={plan} isCurrent={plan.id === hostSubscription.plan} />
        ))}
      </div>
```

with:

```tsx
      <StaggerList inView={false} className="mt-10 grid gap-6 sm:grid-cols-2">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <StaggerItem key={plan.id}>
            <SubscriptionPlanCard plan={plan} isCurrent={plan.id === hostSubscription.plan} />
          </StaggerItem>
        ))}
      </StaggerList>
```

- [ ] **Step 2: verification/page.tsx — wrap the tracker's step list**

Add the same import. `VerificationTracker` is rendered directly with a `steps` prop (no `.map()` in the page itself), so wrap its container instead:

```tsx
      <div className="mt-10">
        <VerificationTracker steps={hostVerificationSteps} />
      </div>
```

becomes:

```tsx
      <StaggerList inView={false} className="mt-10">
        <StaggerItem>
          <VerificationTracker steps={hostVerificationSteps} />
        </StaggerItem>
      </StaggerList>
```

(A single `StaggerItem` here just gives the tracker the same entrance fade/slide as everything else for visual consistency — it's not staggering multiple siblings, since `VerificationTracker` owns its own internal step list.)

- [ ] **Step 3: Manually verify**

```bash
npm run dev
```

Visit `/host/subscription` and `/host/verification`, confirm both animate in on load.

- [ ] **Step 4: Commit**

```bash
git add app/host/subscription/page.tsx app/host/verification/page.tsx
git commit -m "feat: motion on host subscription and verification pages"
```

---

### Task 18: Host property form entrance (new + edit)

**Files:**
- Modify: `app/host/properties/new/page.tsx`
- Modify: `app/host/properties/[id]/edit/page.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6.

- [ ] **Step 1: new/page.tsx**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
      <div className="mt-10 max-w-2xl">
        <PropertyForm submitLabel="Submit for verification" onSubmitHref="/host/properties" />
      </div>
```

with:

```tsx
      <FadeIn inView={false} className="mt-10 max-w-2xl">
        <PropertyForm submitLabel="Submit for verification" onSubmitHref="/host/properties" />
      </FadeIn>
```

- [ ] **Step 2: [id]/edit/page.tsx**

Add the same import. Replace:

```tsx
      <div className="mt-10 max-w-2xl">
        <PropertyForm property={property} submitLabel="Save changes" onSubmitHref="/host/properties" />
      </div>
```

with:

```tsx
      <FadeIn inView={false} className="mt-10 max-w-2xl">
        <PropertyForm property={property} submitLabel="Save changes" onSubmitHref="/host/properties" />
      </FadeIn>
```

- [ ] **Step 3: Manually verify**

```bash
npm run dev
```

Visit `/host/properties/new` and `/host/properties/p3/edit`, confirm the form fades in on load.

- [ ] **Step 4: Commit**

```bash
git add app/host/properties/new/page.tsx "app/host/properties/[id]/edit/page.tsx"
git commit -m "feat: motion on host property form pages"
```

---

## Phase 3c — Auth Sweep

### Task 19: Auth layout entrance

**Files:**
- Modify: `app/(auth)/layout.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6. This shared layout wraps all 5 auth pages (login, signup, verify, forget-password, reset-password), so this one edit gives every auth page an entrance transition.

- [ ] **Step 1: Fade the image panel and the form column**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
      <div className="relative hidden p-4 lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Beautiful homestay interior"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay to ensure the image looks nice and not too stark */}
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        </div>
      </div>
```

with:

```tsx
      <div className="relative hidden p-4 lg:block">
        <FadeIn inView={false} className="relative h-full w-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Beautiful homestay interior"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay to ensure the image looks nice and not too stark */}
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        </FadeIn>
      </div>
```

Replace:

```tsx
            {children}
```

with:

```tsx
            <FadeIn inView={false} delay={0.1}>{children}</FadeIn>
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/login`, confirm the hero image and the form both fade in, form slightly after the image.

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/layout.tsx"
git commit -m "feat: entrance transition on shared auth layout"
```

---

### Task 20: Auth form field stagger (login, signup, forget-password, reset-password)

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/signup/page.tsx`
- Modify: `app/(auth)/forget-password/page.tsx`
- Modify: `app/(auth)/reset-password/page.tsx`

**Interfaces:** Consumes `StaggerList`, `StaggerItem` from Task 6. `app/(auth)/verify/page.tsx` has no `<form>` and is skipped — its entrance is already covered by Task 19's layout-level `FadeIn`.

- [ ] **Step 1: login/page.tsx**

Add the import:

```tsx
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="rounded-sm" />
            <Label htmlFor="remember" className="text-body-sm font-medium text-graphite tracking-body-sm cursor-pointer">
              Remember me
            </Label>
          </div>
          <Link href="/forget-password" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
            Forgot password?
          </Link>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
            Log in
          </Button>
        </div>
      </form>
```

with:

```tsx
      <form>
        <StaggerList className="space-y-5" inView={false}>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="rounded-sm" />
                <Label htmlFor="remember" className="text-body-sm font-medium text-graphite tracking-body-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/forget-password" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                Forgot password?
              </Link>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4">
              <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                Log in
              </Button>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>
```

- [ ] **Step 2: signup/page.tsx**

Add the same import. Replace:

```tsx
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-body-sm font-medium text-graphite tracking-body-sm">Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
            Sign up
          </Button>
        </div>
      </form>
```

with:

```tsx
      <form>
        <StaggerList className="space-y-5" inView={false}>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-body-sm font-medium text-graphite tracking-body-sm">Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4">
              <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                Sign up
              </Button>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>
```

- [ ] **Step 3: forget-password/page.tsx**

Add the same import. Replace:

```tsx
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
          />
        </div>

        <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
          Reset password
        </Button>
      </form>
```

with:

```tsx
      <form>
        <StaggerList className="space-y-6" inView={false}>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
              Reset password
            </Button>
          </StaggerItem>
        </StaggerList>
      </form>
```

- [ ] **Step 4: reset-password/page.tsx**

Add the same import. Replace:

```tsx
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-body-sm font-medium text-graphite tracking-body-sm">Confirm password</Label>
          <Input 
            id="confirm-password" 
            type="password" 
            placeholder="••••••••" 
            className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
            Reset password
          </Button>
        </div>
      </form>
```

with:

```tsx
      <form>
        <StaggerList className="space-y-5" inView={false}>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-body-sm font-medium text-graphite tracking-body-sm">Confirm password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4">
              <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                Reset password
              </Button>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>
```

- [ ] **Step 5: Manually verify**

```bash
npm run dev
```

Visit `/login`, `/signup`, `/forget-password`, `/reset-password` — confirm each form's fields stagger in on load and submitting/typing still works normally (staggering is purely visual, no state changes).

- [ ] **Step 6: Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/signup/page.tsx" "app/(auth)/forget-password/page.tsx" "app/(auth)/reset-password/page.tsx"
git commit -m "feat: stagger form fields across auth pages"
```

---

## Phase 3d — Public/Legal + Chrome Sweep

### Task 21: PageHero entrance (covers about, blog, contact)

**Files:**
- Modify: `components/features/public/page-hero.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6. `PageHero` is used identically by `app/(public)/about/page.tsx`, `app/(public)/blog/page.tsx`, and `app/(public)/contact/page.tsx` — this one edit covers all three hero sections.

- [ ] **Step 1: Wrap the hero content**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24 sm:pb-14 lg:px-8">
      {eyebrow && (
        <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-primary">{eyebrow}</p>
      )}
      <h1 className="mt-3 font-perfectly-nineties-regular text-display text-ink-black leading-display">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-5 max-w-xl text-body text-smoke leading-body tracking-body">{description}</p>
      )}
      {children}
    </section>
```

with:

```tsx
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24 sm:pb-14 lg:px-8">
      <FadeIn inView={false}>
        {eyebrow && (
          <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-3 font-perfectly-nineties-regular text-display text-ink-black leading-display">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-xl text-body text-smoke leading-body tracking-body">{description}</p>
        )}
        {children}
      </FadeIn>
    </section>
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/about`, `/blog`, `/contact` — confirm each hero fades in on load.

- [ ] **Step 3: Commit**

```bash
git add components/features/public/page-hero.tsx
git commit -m "feat: entrance transition on shared PageHero"
```

---

### Task 22: LegalShell entrance (covers cookies, policy, terms)

**Files:**
- Modify: `components/features/legal/legal-shell.tsx`

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6. Used identically by all 3 legal pages.

- [ ] **Step 1: Fade the header, stagger the sections**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
      <header className="max-w-2xl">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">{title}</h1>
        <p className="mt-3 text-body-sm text-smoke tracking-body-sm">Last updated {lastUpdated}</p>
        {intro && <p className="mt-5 text-body text-ink-black leading-body tracking-body">{intro}</p>}
      </header>
```

with:

```tsx
      <FadeIn inView={false} className="max-w-2xl">
        <header>
          <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">{title}</h1>
          <p className="mt-3 text-body-sm text-smoke tracking-body-sm">Last updated {lastUpdated}</p>
          {intro && <p className="mt-5 text-body text-ink-black leading-body tracking-body">{intro}</p>}
        </header>
      </FadeIn>
```

Replace:

```tsx
        <div className="min-w-0 max-w-2xl space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-body text-graphite leading-body tracking-body">{section.body}</div>
            </section>
          ))}
        </div>
```

with:

```tsx
        <StaggerList inView={false} className="min-w-0 max-w-2xl space-y-10">
          {sections.map((section) => (
            <StaggerItem key={section.id}>
              <section id={section.id} className="scroll-mt-28">
                <h2 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-body text-graphite leading-body tracking-body">{section.body}</div>
              </section>
            </StaggerItem>
          ))}
        </StaggerList>
```

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/cookies`, `/policy`, `/terms` — confirm the header fades in and sections stagger in on load, and the table-of-contents anchor links still scroll correctly.

- [ ] **Step 3: Commit**

```bash
git add components/features/legal/legal-shell.tsx
git commit -m "feat: motion on shared LegalShell"
```

---

### Task 23: About page principles + verification levels motion

**Files:**
- Modify: `app/(public)/about/page.tsx`
- Modify: `components/features/public/verification-levels.tsx`

**Interfaces:** Consumes `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: about/page.tsx — stagger the principles grid**

Add the import:

```tsx
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
            <div className="grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                  <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{description}</p>
                </div>
              ))}
            </div>
```

with:

```tsx
            <StaggerList className="grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, description }) => (
                <StaggerItem key={title}>
                  <div>
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                    <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
```

- [ ] **Step 2: verification-levels.tsx — stagger the four level cards**

Add the same import. Replace:

```tsx
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => {
          const { icon: Icon, description } = LEVEL_DETAIL[level]
          return (
            <div key={level} className="rounded-2xl border border-border p-6">
              <div className="flex size-11 items-center justify-center rounded-full bg-accent">
                <Icon className="size-5 text-accent-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-ink-black">
                Level {level} · {verificationLabel[level]}
              </h3>
              <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{description}</p>
            </div>
          )
        })}
      </div>
```

with:

```tsx
      <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => {
          const { icon: Icon, description } = LEVEL_DETAIL[level]
          return (
            <StaggerItem key={level}>
              <div className="rounded-2xl border border-border p-6">
                <div className="flex size-11 items-center justify-center rounded-full bg-accent">
                  <Icon className="size-5 text-accent-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-ink-black">
                  Level {level} · {verificationLabel[level]}
                </h3>
                <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{description}</p>
              </div>
            </StaggerItem>
          )
        })}
      </StaggerList>
```

- [ ] **Step 3: Manually verify**

```bash
npm run dev
```

Visit `/about`, confirm the 3-column principles grid and the 4-column verification levels grid both stagger in as scrolled into view.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/about/page.tsx" components/features/public/verification-levels.tsx
git commit -m "feat: motion on about page principles and verification levels"
```

---

### Task 24: Blog list and post motion

**Files:**
- Modify: `app/(public)/blog/page.tsx`
- Modify: `app/(public)/blog/[slug]/page.tsx`

**Interfaces:** Consumes `FadeIn`, `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: blog/page.tsx — fade the featured post, stagger the rest**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
          {featured && (
            <div className="mb-14">
              <BlogCard post={featured} priority />
            </div>
          )}
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
```

with:

```tsx
          {featured && (
            <FadeIn inView={false} className="mb-14">
              <BlogCard post={featured} priority />
            </FadeIn>
          )}
          <StaggerList className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <StaggerItem key={post.slug}>
                <BlogCard post={post} />
              </StaggerItem>
            ))}
          </StaggerList>
```

- [ ] **Step 2: blog/[slug]/page.tsx — fade in the article**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
      <main className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-body-sm font-semibold text-graphite tracking-body-sm hover:text-ink-black">
          <ChevronLeft className="size-4" />
          Back to blog
        </Link>

        <p className="mt-6 text-body-sm font-semibold uppercase tracking-[0.06em] text-primary">{post.category}</p>
        <h1 className="mt-2 font-perfectly-nineties-regular text-display text-ink-black leading-display">{post.title}</h1>
        <p className="mt-4 text-body-sm text-smoke tracking-body-sm">
          {formatDate(post.publishedAt)} · {post.readMinutes} min read
        </p>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={post.image} alt={post.title} fill priority className="object-cover" sizes="(min-width: 1024px) 768px, 100vw" />
        </div>

        <p className="mt-8 text-body text-ink-black leading-body tracking-body">{post.excerpt}</p>
      </main>
```

with:

```tsx
      <main className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-body-sm font-semibold text-graphite tracking-body-sm hover:text-ink-black">
          <ChevronLeft className="size-4" />
          Back to blog
        </Link>

        <FadeIn inView={false}>
          <p className="mt-6 text-body-sm font-semibold uppercase tracking-[0.06em] text-primary">{post.category}</p>
          <h1 className="mt-2 font-perfectly-nineties-regular text-display text-ink-black leading-display">{post.title}</h1>
          <p className="mt-4 text-body-sm text-smoke tracking-body-sm">
            {formatDate(post.publishedAt)} · {post.readMinutes} min read
          </p>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
            <Image src={post.image} alt={post.title} fill priority className="object-cover" sizes="(min-width: 1024px) 768px, 100vw" />
          </div>

          <p className="mt-8 text-body text-ink-black leading-body tracking-body">{post.excerpt}</p>
        </FadeIn>
      </main>
```

- [ ] **Step 3: Manually verify**

```bash
npm run dev
```

Visit `/blog`, confirm the featured post fades in and the rest of the grid staggers in on scroll. Visit `/blog/how-kiphaus-verifies-every-host`, confirm the article fades in on load.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/blog/page.tsx" "app/(public)/blog/[slug]/page.tsx"
git commit -m "feat: motion on blog list and post pages"
```

---

### Task 25: Contact page motion

**Files:**
- Modify: `app/(public)/contact/page.tsx`

**Interfaces:** Consumes `StaggerList`, `StaggerItem` from Task 6.

- [ ] **Step 1: Stagger the contact option cards**

Add the import:

```tsx
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
```

Replace:

```tsx
          <div className="grid gap-6 sm:grid-cols-3">
            {CONTACT_OPTIONS.map(({ icon: Icon, title, description, href, label }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-border p-6 transition-colors hover:border-graphite/50"
              >
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">{description}</p>
                <p className="mt-3 text-body-sm font-semibold text-primary">{label}</p>
              </a>
            ))}
          </div>
```

with:

```tsx
          <StaggerList className="grid gap-6 sm:grid-cols-3">
            {CONTACT_OPTIONS.map(({ icon: Icon, title, description, href, label }) => (
              <StaggerItem key={title}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-border p-6 transition-colors hover:border-graphite/50"
                >
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-ink-black">{title}</h3>
                  <p className="mt-1 text-body-sm text-smoke tracking-body-sm">{description}</p>
                  <p className="mt-3 text-body-sm font-semibold text-primary">{label}</p>
                </a>
              </StaggerItem>
            ))}
          </StaggerList>
```

(`block` added to the anchor's className since it's now a direct child of a flex/grid `StaggerItem` wrapper and needs to fill it the same way it filled the grid cell before.)

- [ ] **Step 2: Manually verify**

```bash
npm run dev
```

Visit `/contact`, confirm the three contact option cards stagger in and each is still fully clickable across its whole area.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/contact/page.tsx"
git commit -m "feat: motion on contact page option cards"
```

---

### Task 26: Site header and footer chrome motion

**Files:**
- Modify: `components/layout/site-header.tsx`
- Modify: `components/layout/site-footer.tsx`

**Interfaces:** Consumes `FadeIn` from Task 6, plus `AnimatePresence`/`motion`/`useReducedMotion` directly from `motion/react` for the mobile nav (an exit animation needs `AnimatePresence`, which the shared primitives don't expose).

- [ ] **Step 1: site-header.tsx — animate the mobile nav dropdown open/close**

Add the import:

```tsx
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
```

Add inside the component, right after the existing `const [open, setOpen] = useState(false)`:

```tsx
  const reduceMotion = useReducedMotion()
```

Replace:

```tsx
        {/* Mobile Nav Dropdown */}
        {open && (
          <nav className="absolute top-full left-0 flex w-full flex-col gap-1 border-b border-border bg-background p-4 shadow-lg md:hidden">
            <Link
              href="/s"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              Search stays
            </Link>
            <Link
              href="/host"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              Become a host
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              Log in
            </Link>
          </nav>
        )}
```

with:

```tsx
        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 flex w-full flex-col gap-1 border-b border-border bg-background p-4 shadow-lg md:hidden"
            >
              <Link
                href="/s"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Search stays
              </Link>
              <Link
                href="/host"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Become a host
              </Link>
              <Link
                href="/login"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Log in
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
```

- [ ] **Step 2: site-footer.tsx — fade the footer content grid**

Add the import:

```tsx
import { FadeIn } from "@/components/motion/fade-in"
```

Replace:

```tsx
    <footer className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">
      <div className="grid gap-10 md:grid-cols-3">
```

with:

```tsx
    <footer className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">
      <FadeIn className="grid gap-10 md:grid-cols-3">
```

And the matching closing `</div>` (right before `<div className="mt-10 border-t border-border pt-6">`) becomes `</FadeIn>`.

- [ ] **Step 3: Manually verify**

```bash
npm run dev
```

Shrink the browser to mobile width, open/close the header's mobile menu a few times, confirm it slides in/out smoothly with no layout jump. Scroll any page down to the footer, confirm the footer's column content fades in.

- [ ] **Step 4: Commit**

```bash
git add components/layout/site-header.tsx components/layout/site-footer.tsx
git commit -m "feat: motion on site header mobile nav and footer"
```

---

## Phase 4 — Verification

### Task 27: Full verification pass

**Files:** None modified — this task only runs checks.

- [ ] **Step 1: Static checks**

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: all three pass with no errors. (`npm run build` also catches the Leaflet SSR issue from Task 5 if the dynamic-import guard was done incorrectly — a build-time crash there means Step 3 of Task 5 needs revisiting.)

- [ ] **Step 2: Golden-path click-through**

```bash
npm run dev
```

Walk through, in a browser:
- Landing (`/`) → search a city → search results (`/s`) → open a property (`/rooms/[id]`) → select calendar dates → confirm price updates → scroll to map, confirm it renders → click Reserve → booking page (`/rooms/[id]/book`).
- `/host/onboarding` → submit → `/host/dashboard` → `/host/properties` → `/host/properties/new` → `/host/subscription` → `/host/verification`.
- `/login` → `/signup` → `/forget-password` → `/reset-password` → `/verify`.
- `/about`, `/blog`, a blog post, `/contact`, `/cookies`, `/policy`, `/terms`.
- Guest account area: `/account`, `/messages`, `/trips`, `/wishlists`.

Confirm on each: no console errors, motion plays once per scroll-into-view (not repeatedly), no layout shift from entrance animations (CLS — content should not visibly jump/resize as it animates, only fade/slide).

- [ ] **Step 3: Reduced-motion check**

Enable "reduce motion" in OS accessibility settings (Windows: Settings → Accessibility → Visual effects → Animation effects, off). Reload a few of the pages above, confirm all content appears instantly with no animation and nothing is hidden/stuck at `opacity: 0`.

- [ ] **Step 4: Mobile viewport check**

Resize the browser to a mobile width (or use devtools device emulation) and re-check the site header's mobile nav (Task 26) and at least one card grid (landing page) to confirm stagger/hover treatments don't break at small widths.

- [ ] **Step 5: Commit (if any fixes were needed)**

If Steps 1-4 surfaced any fixes, commit them individually with a `fix:` prefix describing what broke. If everything passed clean, no commit is needed for this task.
