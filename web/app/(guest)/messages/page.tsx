import { MessageSquare } from "lucide-react"

export default function GuestMessagesPage() {
  return (
    <div className="hidden h-full flex-col items-center justify-center gap-3 text-center md:flex">
      <MessageSquare className="size-10 text-smoke" strokeWidth={1.5} />
      <p className="font-semibold text-ink-black">Select a conversation</p>
      <p className="max-w-xs text-body-sm text-smoke tracking-body-sm">
        Pick a conversation from the list to see the full message thread.
      </p>
    </div>
  )
}
