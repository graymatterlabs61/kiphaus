"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/shared/logo"

const NAV_LINKS = [
  { href: "/s", label: "Search stays" },
  { href: "/host", label: "Become a host" },
  { href: "/login", label: "Log in" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="text-primary w-8 h-auto" />
          <span className="text-[20px] font-semibold tracking-[-0.36px] text-primary">Kiphaus</span>
        </Link>

        {/* Center Navigation - mimicking Airbnb style */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/s" className="text-base font-semibold text-foreground">
            Stays
          </Link>
          <span className="text-base font-normal text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Experiences
          </span>
        </nav>

        {/* Right Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/host"
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Kiphaus your home
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-border p-2 pr-4 hover:shadow-md transition-shadow"
          >
            <Menu className="size-4 ml-1" />
            <div className="size-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
               <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className="block h-5 w-5 fill-current text-muted-foreground"><path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 0 1 13 0 6.51 6.51 0 0 1-3.02 5.5 12.42 12.42 0 0 1 6.45 4.4A12.67 12.67 0 0 1 16 28.7z"></path></svg>
            </div>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        
        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 flex w-full flex-col gap-1 border-b border-border bg-background p-4 shadow-lg md:hidden"
            >
              <Link
                href="/s"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Search stays
              </Link>
              <Link
                href="/host"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Become a host
              </Link>
              <Link
                href="/login"
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Log in
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
