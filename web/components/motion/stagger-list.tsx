"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { DURATION, EASE_OUT } from "./transitions"

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
}

export function StaggerList({
  children,
  className,
  inView = true,
}: {
  children: ReactNode
  className?: string
  inView?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const reduceMotion = mounted && prefersReducedMotion

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-80px" } }
    : { animate: "show" }

  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" {...trigger}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const reduceMotion = mounted && prefersReducedMotion

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
