import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SiteFooter } from "@/components/layout/site-footer"
import { searchCities } from "@/lib/mock-data"

describe("SiteFooter", () => {
  it("renders the brand line and a legal link", () => {
    render(<SiteFooter />)
    expect(screen.getByText("Kiphaus")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
  })

  it("renders a search link for every city", () => {
    render(<SiteFooter />)
    expect(screen.getByRole("link", { name: searchCities[0] })).toHaveAttribute(
      "href",
      `/s?city=${encodeURIComponent(searchCities[0])}`
    )
  })
})
