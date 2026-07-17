import Link from "next/link"
import { LogoMark } from "@/components/shared/logo"
import { PillRadio } from "@/components/features/host/pill-radio"
import { PropertyForm } from "@/components/features/host/property-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/motion/fade-in"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export default function HostOnboardingPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-2xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/host" className="flex items-center gap-2">
            <LogoMark className="text-primary w-7 h-auto" />
            <span className="text-body-sm font-semibold tracking-body-sm text-ink-black">
              Kiphaus <span className="text-smoke font-medium">Host</span>
            </span>
          </Link>
        </div>
      </header>

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
          <h2 id="about-you" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">About you</h2>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label className={labelClass}>Hosting as</Label>
              <div className="flex flex-wrap gap-2">
                <PillRadio name="businessType" value="Individual" defaultChecked>Individual</PillRadio>
                <PillRadio name="businessType" value="Business" defaultChecked={false}>Business</PillRadio>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name" className={labelClass}>Full name</Label>
                <Input id="full-name" placeholder="Ritika Malhotra" className={fieldClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host-phone" className={labelClass}>Phone (WhatsApp)</Label>
                <Input id="host-phone" type="tel" placeholder="+91 98000 00137" className={fieldClass} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="host-email" className={labelClass}>Email</Label>
                <Input id="host-email" type="email" placeholder="you@example.com" className={fieldClass} />
              </div>
            </div>
          </div>
        </section>
        </FadeIn>

        <Separator className="my-10" />

        <PropertyForm submitLabel="Submit for verification" onSubmitHref="/host/dashboard" />
      </main>
    </div>
  )
}
