"use client"

import { motion } from "motion/react"
import { SearchBar } from "@/components/features/guest/search-bar"
import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/bg1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 backdrop-blur-md px-4 py-2 text-sm font-semibold tracking-wide text-white/90 shadow-sm"
        >
          <Sparkles className="size-3.5 text-amber-300" />
          <span>Phase 1 Launch · Exclusively Live in Gurugram</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-perfectly-nineties-regular max-w-4xl text-center text-4xl sm:text-5xl md:text-7xl leading-[0.95] tracking-tight text-white"
        >
          Discover Verified Homestays in Gurugram. No Hidden Fees.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 sm:mt-6 max-w-3xl text-center text-xs sm:text-sm md:text-base leading-relaxed text-white/70"
        >
          Handpicked, 100% in-person verified homestays &amp; retreats across Golf Course Road, DLF Phase 3, Cyber City, and Aravali Hills. Every price final upfront.
        </motion.p>

        {/* Search bar — sits where a CTA button would otherwise go.
            id is the sentinel Header watches to know when the hero's real
            search bar has scrolled out of view (shows its own compact one). */}
        <motion.div
          id="hero-search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-7 sm:mt-8 w-full max-w-5xl"
        >
          <div className="p-2 sm:p-3 md:px-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <SearchBar />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
