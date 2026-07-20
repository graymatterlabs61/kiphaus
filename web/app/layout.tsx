import { JetBrains_Mono, Inter, Playfair_Display } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// DESIGN.md's "Perfectly Nineties Regular" is a paid display serif; Playfair Display
// is the documented substitute.
const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-perfectly-nineties-regular",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://kiphaus.com"),
  title: {
    default: "Verified Homestays & Villas in India | Kiphaus",
    template: "%s | Kiphaus",
  },
  description:
    "Book verified homestays and villas across India at the price you actually see. No hidden fees, direct host contact, four-level verification. Explore now.",
  openGraph: {
    title: "The price you see is the price you pay",
    description:
      "Homestays and villas across India, verified in four levels before they go live. Talk to real hosts, pay what's shown.",
    type: "website",
    siteName: "Kiphaus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiphaus — verified stays, honest prices",
    description:
      "India's verified homestay marketplace. Four-level checks, direct host contact, no checkout surprises.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        fontDisplay.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
