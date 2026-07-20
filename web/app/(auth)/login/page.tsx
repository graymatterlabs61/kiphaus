"use client"

import { useState, type SubmitEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons"
import { useAuth } from "@/hooks"
import { AuthError } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const user = await login(email, password)
      router.push(user.role === "host" ? "/host/dashboard" : "/")
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Welcome to Kiphaus</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          Enter your details to log in to your account
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <StaggerList className="space-y-5" inView={false}>
          {error && (
            <StaggerItem>
              <p role="alert" className="text-body-sm text-destructive text-center">{error}</p>
            </StaggerItem>
          )}
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="flex items-center justify-end pt-1">
              <Link href="/forget-password" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                Forgot password?
              </Link>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4 space-y-4">
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
              <p className="text-body-sm text-smoke text-center tracking-body-sm">
                By continuing, you agree to Kiphaus&apos;s{" "}
                <Link href="/terms" className="font-semibold text-ink-black hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/policy" className="font-semibold text-ink-black hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>

      <SocialAuthButtons
        onSuccess={(user) => router.push(user.role === "host" ? "/host/dashboard" : "/")}
        onError={setError}
      />

      <div className="mt-6 text-center text-body-sm font-medium text-smoke tracking-body-sm">
        New here?{" "}
        <Link href="/signup" className="text-ink-black hover:underline font-semibold">
          Sign up
        </Link>
      </div>
    </div>
  )
}
