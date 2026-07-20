import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { blogPosts } from "@/lib/mock-data"
import { FadeIn } from "@/components/motion/fade-in"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((candidate) => candidate.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [post.image],
    },
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts.find((candidate) => candidate.slug === slug)
  if (!post) notFound()

  return (
    <>
      <SiteHeader />
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
      <SiteFooter />
    </>
  )
}
