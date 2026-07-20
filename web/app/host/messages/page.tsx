import { HostShell } from "@/components/features/host/host-shell"
import { ConversationList } from "@/components/features/chat/conversation-list"

export default function HostMessagesPage() {
  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Messages</h1>
      <div className="mt-8">
        <ConversationList basePath="/host/messages" />
      </div>
    </HostShell>
  )
}
