"use client"

import { useState, type SubmitEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { requestPasswordReset, AuthError } from "@/lib/auth"

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email)
      setIsSent(true)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex flex-col text-center">
        <div className="mb-10 space-y-3">
          <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Check your email</h1>
          <p className="text-smoke text-body leading-body tracking-body max-w-[320px] mx-auto">
            If an account exists for {email}, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <Link href="/login" className="mx-auto flex w-fit items-center text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Link href="/login" className="mb-6 flex w-fit items-center text-body-sm font-semibold text-smoke hover:text-ink-black transition-colors tracking-body-sm">
        <ArrowLeft className="mr-2 size-4" />
        Back to login
      </Link>

      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Forgot your password?</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <StaggerList className="space-y-6" inView={false}>
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
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
              {isSubmitting ? "Sending..." : "Reset password"}
            </Button>
          </StaggerItem>
        </StaggerList>
      </form>
    </div>
  )
}
