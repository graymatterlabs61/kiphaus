"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { AccountNav } from "@/components/features/guest/account-nav"
import { FadeIn } from "@/components/motion/fade-in"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks"
import { AuthError } from "@/lib/auth"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export default function GuestAccountPage() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.full_name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [profileError, setProfileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileStatus("saving")
    setProfileError(null)
    const [first_name, ...rest] = name.trim().split(" ")
    try {
      await updateProfile({ first_name, last_name: rest.join(" "), phone })
      setProfileStatus("saved")
    } catch (err) {
      setProfileError(err instanceof AuthError ? err.message : "Couldn't save your changes.")
      setProfileStatus("error")
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordStatus("saving")
    setPasswordError(null)
    try {
      await changePassword({ old_password: currentPassword, new_password: newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setPasswordStatus("saved")
    } catch (err) {
      setPasswordError(err instanceof AuthError ? err.message : "Couldn't update your password.")
      setPasswordStatus("error")
    }
  }

  async function handleLogout() {
    await logout()
    router.push("/login")
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Account</h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row">
          <AccountNav />

          <div className="min-w-0 flex-1 space-y-10">
            <FadeIn inView={false} delay={0}>
              <section aria-labelledby="personal-info">
                <h2 id="personal-info" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Personal info
                </h2>
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">
                  Kiphaus keeps this on file to verify it&rsquo;s really you when contacting a host.
                </p>
                <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className={labelClass}>Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={labelClass}>Phone (WhatsApp)</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className={labelClass}>Email</Label>
                    <Input id="email" type="email" value={user?.email ?? ""} disabled className={fieldClass} />
                  </div>
                  {profileError && <p className="text-body-sm text-destructive tracking-body-sm sm:col-span-2">{profileError}</p>}
                  {profileStatus === "saved" && <p className="text-body-sm text-primary tracking-body-sm sm:col-span-2">Saved.</p>}
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={profileStatus === "saving"} className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      {profileStatus === "saving" ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </form>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.05}>
              <section aria-labelledby="security">
                <h2 id="security" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Login & security
                </h2>
                <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className={labelClass}>Current password</Label>
                    <Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className={labelClass}>New password</Label>
                    <Input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
                  </div>
                  {passwordError && <p className="text-body-sm text-destructive tracking-body-sm sm:col-span-2">{passwordError}</p>}
                  {passwordStatus === "saved" && <p className="text-body-sm text-primary tracking-body-sm sm:col-span-2">Password updated.</p>}
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="outline" disabled={passwordStatus === "saving"} className="rounded-full h-[50px] px-8 border-border font-semibold text-graphite">
                      {passwordStatus === "saving" ? "Updating…" : "Update password"}
                    </Button>
                  </div>
                </form>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.1}>
              <section aria-labelledby="notifications">
                <h2 id="notifications" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Notifications
                </h2>
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">Coming soon — no notification preferences to save yet.</p>
                <div className="mt-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-black">WhatsApp updates from hosts</p>
                      <p className="text-body-sm text-smoke tracking-body-sm">Booking confirmations and host replies</p>
                    </div>
                    <Switch defaultChecked disabled aria-label="WhatsApp updates from hosts" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-black">Email receipts</p>
                      <p className="text-body-sm text-smoke tracking-body-sm">Booking confirmations and payment receipts</p>
                    </div>
                    <Switch defaultChecked disabled aria-label="Email receipts" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-black">Kiphaus offers</p>
                      <p className="text-body-sm text-smoke tracking-body-sm">Occasional deals from verified hosts</p>
                    </div>
                    <Switch disabled aria-label="Kiphaus offers" />
                  </div>
                </div>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.15}>
              <section>
                {user && (
                  <p className="text-body-sm text-smoke tracking-body-sm">
                    Member since {new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-4 rounded-full h-[50px] px-6 border-border font-semibold text-graphite"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Log out
                </Button>
              </section>
            </FadeIn>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
