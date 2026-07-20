"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { fetchConversations, type ChatConversation } from "@/lib/api"

function timeAgo(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function ConversationList({ basePath }: { basePath: string }) {
  const pathname = usePathname()
  const [conversations, setConversations] = useState<ChatConversation[] | null>(null)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => setError(true))
  }, [])

  const visible = useMemo(() => {
    if (!conversations) return []
    let result = conversations
    if (filter === "unread") result = result.filter((c) => c.unreadCount > 0)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(
        (c) => c.otherUser.name.toLowerCase().includes(q) || c.property.title.toLowerCase().includes(q)
      )
    }
    return result
  }, [conversations, filter, query])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h1 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Messages</h1>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-graphite hover:bg-ash-mist"
          aria-label={searchOpen ? "Close search" : "Search conversations"}
          onClick={() => {
            setSearchOpen((v) => !v)
            if (searchOpen) setQuery("")
          }}
        >
          <Search className="size-4" />
        </Button>
      </div>

      {searchOpen && (
        <div className="border-b border-border p-3">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by host or property"
            className="h-10 rounded-full text-body-sm"
          />
        </div>
      )}

      <div className="flex items-center gap-2 p-4 pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-body-sm font-semibold tracking-body-sm transition-colors",
            filter === "all" ? "bg-ink-black text-white" : "border border-border text-graphite hover:bg-ash-mist"
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-full px-4 py-1.5 text-body-sm font-semibold tracking-body-sm transition-colors",
            filter === "unread" ? "bg-ink-black text-white" : "border border-border text-graphite hover:bg-ash-mist"
          )}
        >
          Unread
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {error ? (
          <p className="p-4 text-body-sm text-destructive tracking-body-sm">Couldn&rsquo;t load conversations.</p>
        ) : !conversations ? (
          <p className="p-4 text-body-sm text-smoke tracking-body-sm">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <MessageSquare className="size-8 text-smoke" strokeWidth={1.5} />
            <p className="font-semibold text-ink-black">
              {conversations.length === 0 ? "You don't have any messages" : "No conversations match"}
            </p>
            <p className="text-body-sm text-smoke tracking-body-sm">
              {conversations.length === 0
                ? "When you receive a new message, it will appear here."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {visible.map((conversation) => {
              const active = pathname === `${basePath}/${conversation.id}`
              return (
                <Link
                  key={conversation.id}
                  href={`${basePath}/${conversation.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-ash-mist",
                    active && "bg-ash-mist"
                  )}
                >
                  <Avatar size="default" className="shrink-0">
                    {conversation.otherUser.avatar && <AvatarImage src={conversation.otherUser.avatar} alt={conversation.otherUser.name} />}
                    <AvatarFallback>{conversation.otherUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-ink-black">{conversation.otherUser.name}</p>
                      {conversation.unreadCount > 0 && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-body-sm text-smoke tracking-body-sm">{conversation.property.title}</p>
                    {conversation.lastMessage && (
                      <p className="mt-0.5 truncate text-body-sm text-graphite tracking-body-sm">{conversation.lastMessage.body}</p>
                    )}
                  </div>

                  <div className="relative hidden size-10 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                    {conversation.property.image && (
                      <Image src={conversation.property.image} alt={conversation.property.title} fill className="object-cover" sizes="40px" />
                    )}
                  </div>

                  {conversation.lastMessage && (
                    <span className="shrink-0 text-body-sm text-smoke tracking-body-sm">{timeAgo(conversation.lastMessage.createdAt)}</span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
