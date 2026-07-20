import type { Property } from "@/types"

export type WhatsAppMessageParams = {
  checkin?: string
  checkout?: string
  guests?: number
}

export function buildWhatsAppMessage(property: Property, params: WhatsAppMessageParams): string {
  const lines = [
    `Hi ${property.hostName}, I'm interested in "${property.title}" (Kiphaus ID: ${property.id}).`,
  ]
  if (params.checkin && params.checkout) {
    lines.push(`Dates: ${params.checkin} to ${params.checkout}.`)
  }
  if (params.guests) {
    lines.push(`Guests: ${params.guests}.`)
  }
  lines.push("Is it available? Could you share more details?")
  return lines.join(" ")
}

export function buildWhatsAppLink(property: Property, params: WhatsAppMessageParams = {}): string {
  const phone = property.whatsappNumber.replace(/[^\d]/g, "")
  const text = encodeURIComponent(buildWhatsAppMessage(property, params))
  return `https://wa.me/${phone}?text=${text}`
}
