// Everything that used to live here (properties, trips, messages, host dashboard
// data, etc.) is now real — see lib/api.ts. What's left is marketing-page content
// with no backend: the blog has no CMS, and city autocomplete is a static list.

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  readMinutes: number
  publishedAt: string
  image: string
  featured?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-kiphaus-verifies-every-host",
    title: "How Kiphaus verifies every host before they go live",
    excerpt: "A look inside the four-level verification framework — identity, property, video, and on-site — that every Kiphaus listing passes before guests can book.",
    category: "Trust & Safety",
    readMinutes: 6,
    publishedAt: "2026-06-18",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    featured: true,
  },
  {
    slug: "why-we-dont-hide-fees",
    title: "Why the price you see is the price you pay",
    excerpt: "Fee-reveal-at-checkout inflates a ₹4,000 listing to ₹6,000 by the time you pay. Here's why Kiphaus shows the all-in total from the first screen.",
    category: "Transparent Pricing",
    readMinutes: 4,
    publishedAt: "2026-05-30",
    image: "https://images.unsplash.com/photo-1542690969-5a2050285637",
  },
  {
    slug: "goa-villas-for-family-weekends",
    title: "8 verified Goa villas built for family weekends",
    excerpt: "Private pools, real host reviews, and WhatsApp-direct contact — a shortlist of Goa stays we'd actually book for our own families.",
    category: "Destination Guide",
    readMinutes: 7,
    publishedAt: "2026-05-12",
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff",
  },
  {
    slug: "talking-to-your-host-on-whatsapp",
    title: "Why every Kiphaus conversation happens on WhatsApp",
    excerpt: "No platform inbox, no gatekeeping. Here's the thinking behind routing every guest-host conversation straight to WhatsApp.",
    category: "Product",
    readMinutes: 3,
    publishedAt: "2026-04-22",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  },
  {
    slug: "hosting-without-a-tech-team",
    title: "Listing your first homestay without a tech team",
    excerpt: "From onboarding to your first booking — what it actually takes for a first-time host to get verified and start hosting on Kiphaus.",
    category: "For Hosts",
    readMinutes: 8,
    publishedAt: "2026-04-02",
    image: "https://images.unsplash.com/photo-1682414180825-c0df1934387f",
  },
]

export const searchCities = [
  "Gurugram",
  "Golf Course Road",
  "DLF Phase 3",
  "Cyber City",
  "Sohna Road",
  "Sector 56",
  "Aravali Hills",
  "New Delhi",
  "Noida",
]
