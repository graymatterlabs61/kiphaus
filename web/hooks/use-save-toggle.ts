"use client"

import { useState, useTransition } from "react"
import { useAuth } from "./use-auth"
import { toggleWishlist } from "@/lib/api"

/** Real wishlist toggle for an authenticated guest. Unauthenticated callers should
 * show WhatsAppGateModal instead of using this — isAuthed tells them which. */
export function useSaveToggle(propertyId: string) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      try {
        setSaved(await toggleWishlist(propertyId))
      } catch {
        // ponytail: best-effort — leave state unchanged, user can just click again
      }
    })
  }

  return { isAuthed: Boolean(user), saved, isPending, toggle }
}
