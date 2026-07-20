"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { LogoMark } from "@/components/shared/logo"

interface KeloFooterProps {
  className?: string
}

export function Footer({ className }: KeloFooterProps) {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <section className={cn("w-full max-w-8xl mx-auto md:px-8", className)}>
      <div className="m-2 rounded-[20px] overflow-hidden relative h-screen min-h-[800px] flex flex-col font-sans">
        {/* Background layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://cdn.jiro.build/Kelo/the-interior-of-a-vintage-retro-train-carriage-wit.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Row 1 — Hero */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-20 pt-20 pb-10">
          <motion.h1
            className="text-[44px] sm:text-[48px] md:text-[80px] font-[800] text-white leading-none tracking-[-0.02em] text-center max-w-4xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Discover Unique Stays. No Hidden Fees.
          </motion.h1>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          >
            <Link
              href="/s"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-white text-[15px] font-semibold transition-all hover:scale-105 shadow-lg"
            >
              <span>Explore Stays</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Row 2 — Frosted footer card */}
        <motion.div
          className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[24px] mx-5 mb-5 p-8 md:p-10 shadow-2xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Footer Row A */}
          <div className="flex flex-col md:flex-row justify-between gap-10">
            {/* Column 1 — Brand & Newsletter CTA */}
            <div className="md:w-[32%] flex flex-col justify-between">
              <div>
                <Link href="/" className="flex items-center gap-2.5 mb-3 group">
                  <LogoMark className="text-white w-7 h-auto transition-transform group-hover:scale-105" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    Kiphaus
                  </span>
                </Link>
                <p className="mt-3 text-white/65 text-[13px] leading-relaxed max-w-[300px]">
                  India&rsquo;s verified marketplace for homestays, villas, and
                  unique stays. Every listing checked, every price final upfront.
                </p>
              </div>

              {/* Newsletter Ad / CTA */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <h5 className="text-white text-[14px] font-semibold mb-1">
                  Join our Newsletter
                </h5>
                <p className="text-white/60 text-[12px] mb-3 leading-snug">
                  Get exclusive stay recommendations & secret deals directly to your inbox.
                </p>
                {subscribed ? (
                  <div className="py-2.5 px-4 bg-white/20 rounded-xl text-[13px] text-white font-medium border border-white/30 text-center">
                    ✨ Thanks for subscribing!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-white/50 text-[13px] rounded-xl px-3.5 py-2.5 outline-none border border-white/20 focus:border-white/40 transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-[#00bc7d] hover:bg-[#00a66e] text-white font-bold text-[12px] tracking-wider px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer uppercase"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Column 2 — Explore */}
            <div>
              <h4 className="text-white text-[13px] font-semibold mb-4">
                Explore Stays
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/s"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Explore Stays
                  </Link>
                </li>
                <li>
                  <Link
                    href="/s?type=villa"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Luxury Villas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/s?type=homestay"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Verified Homestays
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlists"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Wishlists
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    List Your Home
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <h4 className="text-white text-[13px] font-semibold mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Travel Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host/dashboard"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Host Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Company & Legal */}
            <div>
              <h4 className="text-white text-[13px] font-semibold mb-4">
                Company & Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#careers"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policy"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-white/60 text-[13px] hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Row B */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-white/50 text-[12px]">
                © {new Date().getFullYear()} Kiphaus Inc. All rights reserved.
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="text-white/50 text-[12px]">
                Our Story Continues:
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="TikTok"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77 0 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 000 12.68 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>

              {/* X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="YouTube"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M23 7s-.3-1.9-1.2-2.7c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5.1 1 7 1 7S.7 9.1.7 11.2v2c0 2.1.3 4.2.3 4.2s.3 1.9 1.2 2.7c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.5 12 21.5 12 21.5s4.2 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.7 1.2-2.7s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8 3.6-8 3.5z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                >
                  <rect x={2} y={2} width={20} height={20} rx={5} />
                  <circle cx={12} cy={12} r={5} />
                  <circle
                    cx={17.5}
                    cy={6.5}
                    r={1}
                    fill="white"
                    stroke="none"
                  />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { Footer as SiteFooter }

