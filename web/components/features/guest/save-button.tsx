"use client"

import { cloneElement, type ReactElement, type ReactNode, type MouseEvent } from "react"
import { useSaveToggle } from "@/hooks"
import { WhatsAppGateModal } from "./whatsapp-gate-modal"

/** Drop-in replacement for a bare WhatsAppGateModal(variant="save"): logged-out guests
 * still see the login gate, logged-in guests get a real wishlist toggle instead. */
export function SaveButton({
  propertyId,
  triggerRender,
  children,
}: {
  propertyId: string
  triggerRender: ReactElement
  children: ReactNode
}) {
  const { isAuthed, saved, isPending, toggle } = useSaveToggle(propertyId)

  if (!isAuthed) {
    return (
      <WhatsAppGateModal variant="save" triggerRender={triggerRender}>
        {children}
      </WhatsAppGateModal>
    )
  }

  return cloneElement(triggerRender as ReactElement<Record<string, unknown>>, {
    onClick: (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggle()
    },
    "aria-pressed": saved,
    disabled: isPending,
    children,
  })
}
