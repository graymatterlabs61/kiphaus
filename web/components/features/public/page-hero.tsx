import type { ReactNode } from "react"

import { FadeIn } from "@/components/motion/fade-in"

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
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
  )
}
