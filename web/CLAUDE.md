# CLAUDE.md

## Design Context

See `PRODUCT.md` and `DESIGN.md` at the project root before any design work.

- **Register:** product (app UI serves the product — guest booking flows, host dashboards, verification tracking — not a marketing site).
- **Brand:** Kiphaus, India's verified marketplace for homestays/villas/unique stays. Institutional trust register — "a bank statement, not a postcard." Named anti-reference: **Airbnb** (fee-reveal pricing, pill search bars, rounded-full chrome, coral/red accent).
- **DESIGN.md is currently a seed** (`<!-- SEED -->` marker, no resolved hex values). It replaced an unrelated leftover DESIGN.md ("Micro," a productivity-app theme) that had no connection to this product.
- **Known off-brand prior art:** [components/layout/header.tsx](components/layout/header.tsx) and [components/features/guest/listing-card.tsx](components/features/guest/listing-card.tsx) are a structural + stylistic Airbnb clone (pill search, rounded-full nav, `#ff385c` primary, "Guest favourite" copy). They are not the source of truth for the design system — they need to be rebuilt against DESIGN.md's navy/seafoam institutional direction, not extracted from.
- Once real on-brand components exist, re-run `/impeccable document` in scan mode to replace the seed with real tokens.
