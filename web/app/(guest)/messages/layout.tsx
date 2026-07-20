"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/layout/header"
import { ConversationList } from "@/components/features/chat/conversation-list"
import { cn } from "@/lib/utils"

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isThreadView = pathname !== "/messages"

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex h-[calc(100svh-5rem)] max-w-7xl overflow-hidden">
        <aside
          className={cn(
            "w-full shrink-0 flex-col border-r border-border md:flex md:max-w-sm",
            isThreadView ? "hidden" : "flex"
          )}
        >
          <ConversationList basePath="/messages" />
        </aside>
        <section className={cn("min-w-0 flex-1 flex-col", isThreadView ? "flex" : "hidden md:flex")}>
          {children}
        </section>
      </main>
    </>
  )
}
