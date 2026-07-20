"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks"
import { startConversation } from "@/lib/api"
import { WhatsAppGateModal } from "./whatsapp-gate-modal"

export function MessageHostButton({ propertyId }: { propertyId: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const trigger = (
    <Button variant="outline" className="mt-3 w-full rounded-lg py-6 text-base font-semibold">
      <MessageCircle className="size-4" /> Message host
    </Button>
  )

  if (!user) {
    return (
      <WhatsAppGateModal variant="contact" triggerRender={trigger}>
        Message host
      </WhatsAppGateModal>
    )
  }

  async function handleClick() {
    setIsStarting(true)
    try {
      const { conversationId } = await startConversation(propertyId)
      router.push(`/messages/${conversationId}`)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Button variant="outline" className="mt-3 w-full rounded-lg py-6 text-base font-semibold" disabled={isStarting} onClick={handleClick}>
      <MessageCircle className="size-4" /> {isStarting ? "Starting…" : "Message host"}
    </Button>
  )
}
