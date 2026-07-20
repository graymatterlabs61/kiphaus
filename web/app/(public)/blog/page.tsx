import type { Metadata } from "next"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { PageHero } from "@/components/features/public/page-hero"
import { BlogCard } from "@/components/features/public/blog-card"
import { blogPosts } from "@/lib/mock-data"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export const metadata: Metadata = {
  title: "Journal: Homestay Travel & Hosting Guides",
  description:
    "Guides on verified homestays, honest pricing, and zero-commission hosting across India — from the team building Kiphaus. Start reading.",
}

export default function BlogPage() {
  const [featured, ...rest] = blogPosts

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Kiphaus Journal"
          title="Notes on trust, pricing, and travel"
          description="How verification works, why we route every conversation to WhatsApp, and guides to the stays we'd actually book ourselves."
        />

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
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
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
