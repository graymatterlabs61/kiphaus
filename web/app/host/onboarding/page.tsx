"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogoMark } from "@/components/shared/logo"
import { PropertyForm } from "@/components/features/host/property-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { FadeIn } from "@/components/motion/fade-in"
import { useAuth } from "@/hooks"
import { AuthError } from "@/lib/auth"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export default function HostOnboardingPage() {
  const { user, isLoading, becomeHost, updateAvatar } = useAuth()
  const router = useRouter()

  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileDone, setProfileDone] = useState(false)

  // `user` loads asynchronously (restoreSession on mount) — useState's initializer
  // above only sees it on the very first render, so sync once it's actually available
  // (e.g. reloading this page after already completing the profile step).
  useEffect(() => {
    if (!user) return
    setPhone((current) => current || user.phone || "")
    setBio((current) => current || user.bio || "")
    if (user.role === "host" && user.bio && user.avatar) {
      setProfileDone(true)
    }
  }, [user])

  async function handleProfileSubmit() {
    if (!bio.trim()) {
      setError("Tell guests a bit about yourself as a host.")
      return
    }
    if (!avatarFile && !user?.avatar) {
      setError("Add a profile photo — it's required before you can list a property.")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      if (avatarFile) await updateAvatar(avatarFile)
      await becomeHost({ phone, bio })
      setProfileDone(true)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Couldn't save your host profile. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host-phone" className={labelClass}>Phone (WhatsApp)</Label>
                  <Input id="host-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98000 00137" className={fieldClass} disabled={profileDone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host-avatar" className={labelClass}>Profile photo</Label>
                  <input
                    id="host-avatar"
                    type="file"
                    accept="image/*"
                    disabled={profileDone}
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-body-sm text-graphite file:mr-3 file:rounded-full file:border-0 file:bg-ash-mist file:px-4 file:py-2.5 file:text-body-sm file:font-semibold"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="host-bio" className={labelClass}>About you as a host</Label>
                  <Textarea
                    id="host-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={profileDone}
                    placeholder="Longtime Gurugram resident, happy to help with local recommendations…"
                    className="rounded-2xl border-border bg-transparent px-5 py-4 text-body hover:border-graphite/50 transition-colors"
                  />
                </div>
              </div>
              {error && <p className="text-body-sm text-destructive tracking-body-sm">{error}</p>}
              {!profileDone && (
                <Button
                  className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isSubmitting}
                  onClick={handleProfileSubmit}
                >
                  {isSubmitting ? "Saving…" : "Continue"}
                </Button>
              )}
            </div>
          </section>
        </FadeIn>

        {profileDone && (
          <>
            <Separator className="my-10" />
            <PropertyForm submitLabel="Submit for verification" onSaved={(id) => router.push(`/host/properties/${id}/edit`)} />
          </>
        )}
      </main>
    </div>
  )
}
