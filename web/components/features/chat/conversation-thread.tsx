"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import Link from "next/link"
import { ChevronLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth, useChatSocket } from "@/hooks"
import { cn } from "@/lib/utils"

export function ConversationThread({ conversationId, backHref }: { conversationId: string; backHref: string }) {
  const { user } = useAuth()
  const { messages, status, send } = useChatSocket(conversationId)
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [messages.length])

  function handleSend() {
    const body = draft.trim()
    if (!body) return
    send(body)
    setDraft("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Link href={backHref} className="text-graphite hover:text-ink-black">
          <ChevronLeft className="size-5" />
        </Link>
        <p className="text-body-sm font-semibold tracking-body-sm text-ink-black">
          {status === "open" ? "Connected" : status === "connecting" ? "Connecting…" : "Disconnected — reload to retry"}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const isMine = message.sender_id === user?.id
          return (
            <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-body-sm tracking-body-sm",
                  isMine ? "bg-primary text-primary-foreground" : "bg-ash-mist text-ink-black"
                )}
              >
                {message.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-border p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Write a message…"
          className="min-h-10 flex-1 resize-none rounded-2xl border-border bg-transparent px-4 py-2 text-body-sm"
        />
        <Button
          size="icon"
          className="size-10 shrink-0 rounded-full bg-primary hover:bg-primary/90"
          disabled={!draft.trim() || status !== "open"}
          onClick={handleSend}
          aria-label="Send message"
        >
          <Send className="size-4 text-primary-foreground" />
        </Button>
      </div>
    </div>
  )
}
