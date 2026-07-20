import { HostShell } from "@/components/features/host/host-shell"
import { ConversationThread } from "@/components/features/chat/conversation-thread"

export default async function HostConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Messages</h1>
      <div className="mt-6">
        <ConversationThread conversationId={id} backHref="/host/messages" />
      </div>
    </HostShell>
  )
}
