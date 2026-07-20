import type { LucideIcon } from "lucide-react"

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <Icon className="size-5 text-primary" aria-hidden="true" />
      <p className="mt-3 text-heading-sm font-semibold text-ink-black leading-heading-sm">{value}</p>
      <p className="text-body-sm text-smoke tracking-body-sm">{label}</p>
      {hint && <p className="mt-1 text-body-sm text-smoke tracking-body-sm">{hint}</p>}
    </div>
  )
}
