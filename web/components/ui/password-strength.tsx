"use client"

import { cn } from "@/lib/utils"

// ponytail: heuristic scorer (length + character variety), swap for zxcvbn if
// real entropy estimation ever matters. Django's own validators are the
// authority server-side; this is purely feedback UX.
export function scorePassword(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  let variety = 0
  if (/[a-z]/.test(password)) variety++
  if (/[A-Z]/.test(password)) variety++
  if (/\d/.test(password)) variety++
  if (/[^a-zA-Z0-9]/.test(password)) variety++
  if (password.length < 8) return 1
  if (password.length >= 12 && variety >= 3) return 4
  if (variety >= 3 || (password.length >= 10 && variety >= 2)) return 3
  return 2
}

const LEVELS = [
  { label: "", color: "" },
  { label: "Too weak", color: "bg-destructive" },
  { label: "Weak", color: "bg-amber-500" },
  { label: "Good", color: "bg-emerald-500" },
  { label: "Strong", color: "bg-emerald-600" },
] as const

function PasswordStrength({ password, className }: { password: string; className?: string }) {
  const score = scorePassword(password)
  if (score === 0) return null
  const { label, color } = LEVELS[score]

  return (
    <div className={cn("space-y-1.5", className)} aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              segment <= score ? color : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="text-caption text-smoke text-right">{label}</p>
    </div>
  )
}

export { PasswordStrength }
