import Image from "next/image"
import Link from "next/link"
import type { BlogPost } from "@/lib/mock-data"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function BlogCard({ post, priority }: { post: BlogPost; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 30vw, 90vw"
        />
      </div>
      <div>
        <p className="text-body-sm font-semibold uppercase tracking-[0.06em] text-primary">{post.category}</p>
        <h3 className="mt-1 text-heading-sm font-semibold text-ink-black leading-heading-sm group-hover:underline">
          {post.title}
        </h3>
        <p className="mt-2 text-body-sm text-smoke tracking-body-sm">{post.excerpt}</p>
        <p className="mt-3 text-body-sm text-smoke tracking-body-sm">
          {formatDate(post.publishedAt)} · {post.readMinutes} min read
        </p>
      </div>
    </Link>
  )
}
