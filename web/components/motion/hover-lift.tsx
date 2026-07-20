"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export function HoverLift({
  children,
  className,
  lift = 4,
}: {
  children: ReactNode
  className?: string
  lift?: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const reduceMotion = mounted && prefersReducedMotion

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
