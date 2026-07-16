import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import PropertyDetailPage from "@/app/(guest)/rooms/[id]/page"
import { propertyById } from "@/lib/mock-data"

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

describe("PropertyDetailPage", () => {
  it("renders the property title, price, and host name", async () => {
    const property = propertyById("p1")!
    const jsx = await PropertyDetailPage({ params: Promise.resolve({ id: "p1" }) })
    render(jsx)
    expect(screen.getByRole("heading", { name: property.title })).toBeInTheDocument()
    expect(screen.getByText("₹4,200", { exact: false })).toBeInTheDocument()
    expect(screen.getByText(`Hosted by ${property.hostName}`)).toBeInTheDocument()
  })

  it("calls notFound for an unknown id", async () => {
    await expect(PropertyDetailPage({ params: Promise.resolve({ id: "does-not-exist" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
  })
})
