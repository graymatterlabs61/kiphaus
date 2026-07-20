"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/host/dashboard", label: "Dashboard" },
  { href: "/host/properties", label: "Properties" },
  { href: "/host/messages", label: "Messages" },
  { href: "/host/verification", label: "Verification" },
  { href: "/host/subscription", label: "Subscription" },
]

export function HostNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Host navigation" className="flex gap-2 overflow-x-auto">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-body-sm font-semibold tracking-body-sm transition-colors",
              active ? "bg-ink-black text-white" : "text-graphite hover:bg-ash-mist"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
