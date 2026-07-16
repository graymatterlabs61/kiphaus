import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReviewSummary } from "@/components/features/guest/review-summary"

describe("ReviewSummary", () => {
  it("renders the overall rating and every category", () => {
    render(
      <ReviewSummary
        rating={4.9}
        reviewCount={34}
        breakdown={{ cleanliness: 4.9, accuracy: 4.8, checkIn: 4.7, communication: 4.9, location: 4.8, value: 4.7 }}
      />
    )
    expect(screen.getByText("★ 4.9", { exact: false })).toBeInTheDocument()
    expect(screen.getByText("(34 reviews)")).toBeInTheDocument()
    expect(screen.getByText("Cleanliness")).toBeInTheDocument()
    expect(screen.getByText("Check-in")).toBeInTheDocument()
  })
})
