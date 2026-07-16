"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/s", label: "Search stays" },
  { href: "/host", label: "Become a host" },
  { href: "/login", label: "Log in" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-5xl">
      <div className="relative flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2 shadow-glow">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-button">
            K
          </span>
          <span className="text-[18px] font-semibold tracking-[-0.36px] text-foreground">Kiphaus</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        {open && (
          <nav className="absolute top-full left-0 mt-2 flex w-full origin-top flex-col gap-1 rounded-lg border border-border bg-card p-3 shadow-glow duration-100 animate-in fade-in-0 zoom-in-95 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
