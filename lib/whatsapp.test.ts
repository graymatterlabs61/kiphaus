import { describe, it, expect } from "vitest"
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp"
import { propertyById } from "@/lib/mock-data"

describe("buildWhatsAppMessage", () => {
  it("includes the property title and id", () => {
    const property = propertyById("p1")!
    const message = buildWhatsAppMessage(property, {})
    expect(message).toContain(property.title)
    expect(message).toContain(property.id)
  })

  it("includes check-in/check-out dates and guest count when provided", () => {
    const property = propertyById("p1")!
    const message = buildWhatsAppMessage(property, {
      checkin: "2026-08-01",
      checkout: "2026-08-03",
      guests: 2,
    })
    expect(message).toContain("2026-08-01")
    expect(message).toContain("2026-08-03")
    expect(message).toContain("Guests: 2")
  })
})

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with a digits-only phone number and url-encoded text", () => {
    const property = propertyById("p1")!
    const link = buildWhatsAppLink(property, { guests: 2 })
    expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    expect(link).not.toContain(" ")
  })
})
