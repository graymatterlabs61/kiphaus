import Link from "next/link"
import type { ReactNode } from "react"
import { FadeIn } from "@/components/motion/fade-in"
import { LogoMark } from "@/components/shared/logo"
import { HostNav } from "@/components/features/host/host-nav"
import { currentHost } from "@/lib/mock-data"

export function HostShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/host/dashboard" className="flex items-center gap-2">
              <LogoMark className="text-primary w-7 h-auto" />
              <span className="text-body-sm font-semibold tracking-body-sm text-ink-black">
                Kiphaus <span className="text-smoke font-medium">Host</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/s" className="text-body-sm font-semibold text-graphite tracking-body-sm hover:text-ink-black">
              Switch to guest view
            </Link>
            <div className="flex size-9 items-center justify-center rounded-full bg-ash-mist text-body-sm font-semibold text-graphite">
              {currentHost.name.charAt(0)}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <HostNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn inView={false}>{children}</FadeIn>
      </main>

      <footer className="border-t border-border py-6">
        <p className="mx-auto max-w-6xl px-4 text-body-sm text-smoke tracking-body-sm sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Kiphaus. Zero commission, every stay.
        </p>
      </footer>
    </div>
  )
}
