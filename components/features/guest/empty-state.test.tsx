import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "@/components/features/guest/empty-state"

describe("EmptyState", () => {
  it("renders the city-specific SECURITY.md copy when a city is given", () => {
    render(<EmptyState city="Mumbai" />)
    expect(
      screen.getByText("No properties found for those dates in Mumbai. Try adjusting your filters or exploring nearby destinations.")
    ).toBeInTheDocument()
  })

  it("renders the generic copy when no city is given", () => {
    render(<EmptyState />)
    expect(
      screen.getByText("No properties found for those dates. Try adjusting your filters or exploring nearby destinations.")
    ).toBeInTheDocument()
  })
})
