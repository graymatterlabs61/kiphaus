"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { DURATION, EASE_OUT } from "./transitions"

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
  inView = true,
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  inView?: boolean
  once?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const reduceMotion = mounted && prefersReducedMotion

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const trigger = inView
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once, margin: "-80px" } }
    : { animate: { opacity: 1, y: 0 } }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ duration: DURATION.base, delay, ease: EASE_OUT }}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}
