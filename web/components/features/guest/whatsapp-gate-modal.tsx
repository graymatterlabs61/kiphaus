"use client"

import Link from "next/link"
import type { ReactElement, ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type GateVariant = "contact" | "save"

const COPY: Record<GateVariant, { title: string; description: string }> = {
  contact: {
    title: "Log in to contact this host",
    description: "Create a free Kiphaus account to message hosts directly on WhatsApp.",
  },
  save: {
    title: "Log in to save stays",
    description: "Create a free Kiphaus account to save stays to your wishlist.",
  },
}

export function WhatsAppGateModal({
  variant,
  triggerRender,
  children,
}: {
  variant: GateVariant
  triggerRender: ReactElement
  children: ReactNode
}) {
  const copy = COPY[variant]

  return (
    <Dialog>
      <DialogTrigger render={triggerRender}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button render={<Link href="/login" />}>Log in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
