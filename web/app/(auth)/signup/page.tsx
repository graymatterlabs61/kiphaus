"use client"

import { useState, type SubmitEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons"
import { useAuth } from "@/hooks"
import { AuthError } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        email,
        username: email,
        password1: password,
        password2: confirmPassword,
        first_name: name,
      })
      router.push("/")
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6 text-center space-y-2">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Join Kiphaus</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          Enter your details to create a new account
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <StaggerList className="space-y-4" inView={false}>
          {error && (
            <StaggerItem>
              <p role="alert" className="text-body-sm text-destructive text-center">{error}</p>
            </StaggerItem>
          )}
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-body-sm font-medium text-graphite tracking-body-sm">Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
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
              <PasswordStrength password={password} className="px-1 pt-1" />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-body-sm font-medium text-graphite tracking-body-sm">Confirm password</Label>
              <PasswordInput
                id="confirm-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-3 space-y-3">
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                {isSubmitting ? "Signing up..." : "Sign up"}
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
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black hover:underline font-semibold">
          Log in
        </Link>
      </div>
    </div>
  )
}
