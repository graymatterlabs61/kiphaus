import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import SearchPage from "@/app/(guest)/s/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe("SearchPage", () => {
  it("renders matching results for a city filter", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ city: "Goa" }) })
    render(jsx)
    expect(screen.getByText("4 stays in Goa")).toBeInTheDocument()
  })

  it("renders the empty state for a city with no listings yet", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ city: "Mumbai" }) })
    render(jsx)
    expect(
      screen.getByText("No properties found for those dates in Mumbai. Try adjusting your filters or exploring nearby destinations.")
    ).toBeInTheDocument()
  })
})
