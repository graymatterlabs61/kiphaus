"use client"

import Link from "next/link"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"
import { WhatsAppGateModal } from "./whatsapp-gate-modal"

/** Logged-out guests see the login gate; logged-in guests go straight to the real
 * booking-confirmation page (real price preview + booking creation live there). */
export function ReserveButton({ propertyId }: { propertyId: string }) {
  const { user } = useAuth()
  const className = "w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold transition-colors"

  if (user) {
    return (
      <Button className={className} render={<Link href={`/rooms/${propertyId}/book`} />} nativeButton={false}>
        Reserve
      </Button>
    )
  }

  return (
    <WhatsAppGateModal variant="contact" triggerRender={<Button className={className}>Reserve</Button>}>
      Reserve
    </WhatsAppGateModal>
  )
}
