"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/trips", label: "Trips" },
  { href: "/wishlists", label: "Wishlists" },
  { href: "/messages", label: "Messages" },
  { href: "/account", label: "Account" },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Account navigation"
      className="flex gap-2 overflow-x-auto pb-2 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:pb-0"
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-body-sm font-semibold tracking-body-sm transition-colors md:shrink",
              active
                ? "bg-ink-black text-white"
                : "text-graphite hover:bg-ash-mist"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
