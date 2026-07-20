"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Laptop, Menu, Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { LogoMark } from "@/components/shared/logo"
import { useAuth } from "@/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Laptop },
  { value: "dark", label: "Dark", icon: Moon },
] as const

export function Header({ variant = "solid" }: { variant?: "solid" | "floating" }) {
  const [mounted, setMounted] = useState(false)
  const [heroSearchVisible, setHeroSearchVisible] = useState(true)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const floating = variant === "floating"

  // Airbnb-style: once the hero's own search bar scrolls out of view, the
  // floating nav shows a compact search pill in its place.
  useEffect(() => {
    if (!floating) return
    const el = document.getElementById("hero-search")
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setHeroSearchVisible(entry.isIntersecting), {
      rootMargin: "-96px 0px 0px 0px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [floating])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header
      className={
        floating
          ? "fixed inset-x-0 top-0 z-30 flex w-full justify-center pt-4 md:pt-6"
          : "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-200"
      }
    >
      <div
        className={
          floating
            ? "mx-4 flex h-16 w-full max-w-2xl items-center justify-between gap-6 rounded-xl bg-white/70 px-4 shadow-sm backdrop-blur-md md:px-6 dark:bg-black/40"
            : "mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        }
      >
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="text-primary w-8 h-auto" />
          <span className="text-[20px] font-semibold tracking-[-0.36px] text-primary">Kiphaus</span>
        </Link>

        {floating && !heroSearchVisible && (
          <>
            <Link
              href="/s"
              aria-label="Search stays"
              className="flex md:hidden items-center justify-center size-9 rounded-full bg-primary text-primary-foreground shrink-0"
            >
              <Search className="size-4" />
            </Link>
            <Link
              href="/s"
              className="hidden md:flex items-center rounded-full border border-border bg-white py-1 pl-4 pr-1 text-body-sm shadow-sm transition-shadow hover:shadow-md dark:bg-black/60"
            >
              <span className="font-semibold text-ink-black">Where</span>
              <span className="ml-1.5 text-smoke">Gurugram areas</span>
              <span className="mx-3 h-5 w-px bg-border" />
              <span className="font-semibold text-ink-black">When</span>
              <span className="ml-1.5 text-smoke">Add dates</span>
              <span className="mx-3 h-5 w-px bg-border" />
              <span className="font-semibold text-ink-black">Who</span>
              <span className="ml-1.5 mr-2 text-smoke">Add guests</span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Search className="size-3.5" />
              </span>
            </Link>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border p-2 pr-3 hover:shadow-md transition-shadow bg-card outline-none">
            <Menu className="size-4 ml-1 text-foreground" />
            {user ? (
              <Avatar size="sm">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.full_name} />}
                <AvatarFallback>{user.full_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className="block h-5 w-5 fill-current text-muted-foreground"><path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 0 1 13 0 6.51 6.51 0 0 1-3.02 5.5 12.42 12.42 0 0 1 6.45 4.4A12.67 12.67 0 0 1 16 28.7z"></path></svg>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-4">
            {user ? (
              <>
                <DropdownMenuItem render={<Link href="/wishlists" />}>Wishlists</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/trips" />}>Trips</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/messages" />}>Messages</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account" />}>Account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/contact" />}>Help Centre</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/host" />}>Kiphaus your home</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem render={<Link href="/login" />}>Log in</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/signup" />}>Sign up</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/host" />}>Kiphaus your home</DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <div className="px-2 pb-2">
                {mounted && (
                  <ToggleGroup
                    value={theme ? [theme] : ["system"]}
                    onValueChange={(values) => {
                      if (values[0]) setTheme(values[0])
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <ToggleGroupItem key={value} value={value} aria-label={label} className="flex-1">
                        <Icon className="size-4" />
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              </div>
            </DropdownMenuGroup>

            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export { Header as SiteHeader }
