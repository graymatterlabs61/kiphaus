import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PropertyCard } from "@/components/features/guest/property-card"
import { propertyById } from "@/lib/mock-data"

describe("PropertyCard", () => {
  const property = propertyById("p1")!

  it("renders title, formatted price, and rating", () => {
    render(<PropertyCard property={property} />)
    expect(screen.getByText(property.title)).toBeInTheDocument()
    expect(screen.getByText("₹4,200", { exact: false })).toBeInTheDocument()
    expect(screen.getByText(`★ ${property.rating.toFixed(1)} (${property.reviewCount})`)).toBeInTheDocument()
  })

  it("links to the property detail page", () => {
    render(<PropertyCard property={property} />)
    const links = screen.getAllByRole("link")
    expect(links[0]).toHaveAttribute("href", `/rooms/${property.id}`)
  })

  it("opens the save-stays gate modal from the wishlist heart", async () => {
    render(<PropertyCard property={property} />)
    const { default: userEvent } = await import("@testing-library/user-event")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: `Save ${property.title} to wishlist` }))
    expect(await screen.findByText("Log in to save stays")).toBeInTheDocument()
  })
})
