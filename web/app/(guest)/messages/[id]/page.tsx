import { ConversationThread } from "@/components/features/chat/conversation-thread"

export default async function GuestConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="h-full p-4">
      <ConversationThread conversationId={id} backHref="/messages" />
    </div>
  )
}
