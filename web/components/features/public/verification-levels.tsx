import { ShieldCheck, Home, Video, MapPin } from "lucide-react"
import type { VerificationLevel } from "@/types"
import { verificationLabel } from "@/types"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

const LEVEL_DETAIL: Record<VerificationLevel, { icon: typeof ShieldCheck; description: string }> = {
  1: {
    icon: ShieldCheck,
    description: "Every host's government ID is checked before they can list a property.",
  },
  2: {
    icon: Home,
    description: "Ownership or management documents are verified against the listed address.",
  },
  3: {
    icon: Video,
    description: "A live video walkthrough confirms the property matches its photos and amenities.",
  },
  4: {
    icon: MapPin,
    description: "A Kiphaus team member visits in person — the highest trust level on the platform.",
  },
}

export function VerificationLevels() {
  const levels = [1, 2, 3, 4] as VerificationLevel[]

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
          Four levels of verification
        </h2>
        <p className="mt-4 text-body text-smoke leading-body tracking-body">
          Trust isn&rsquo;t a badge in the fine print — it&rsquo;s the first thing you see on every listing.
        </p>
      </div>

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
    </section>
  )
}
