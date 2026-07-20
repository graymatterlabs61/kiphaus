"use client"

import { Suspense, useState, type SubmitEvent } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { confirmPasswordReset, AuthError } from "@/lib/auth"

function ResetPasswordForm() {
  const params = useSearchParams()
  const uid = params.get("uid") ?? ""
  const token = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    if (!uid || !token) {
      setError("This reset link is invalid or has expired. Request a new one.")
      return
    }

    setIsSubmitting(true)
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password1: password,
        new_password2: confirmPassword,
      })
      setIsDone(true)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <div className="flex flex-col text-center">
        <div className="mb-10 space-y-3">
          <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Password reset</h1>
          <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
            Your password has been changed. Log in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-full h-[50px] bg-primary hover:bg-primary/90 transition-colors text-primary-foreground text-body font-semibold"
        >
          Log in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Set new password</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          Your new password must be different to previously used passwords.
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
            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
