import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import LandingPage from "@/app/page"
import { featuredProperties } from "@/lib/mock-data"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("LandingPage", () => {
  it("renders the hero heading, search bar, and one card per featured property", () => {
    render(<LandingPage />)
    expect(
      screen.getByRole("heading", { name: "Verified stays. Zero commission. Direct to the host." })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Search stays" })).toBeInTheDocument()
    for (const property of featuredProperties) {
      expect(screen.getByText(property.title)).toBeInTheDocument()
    }
  })

  it("renders the hero photo from a real featured property", () => {
    render(<LandingPage />)
    const heroImage = screen.getByAltText("Aravali Ridge Studio with Terrace, Gurugram")
    expect(heroImage).toHaveAttribute("src", expect.stringContaining("images.unsplash.com"))
  })
})
