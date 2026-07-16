import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReviewCard } from "@/components/features/guest/review-card"

describe("ReviewCard", () => {
  it("renders author, text, and host reply when present", () => {
    render(
      <ReviewCard
        review={{ id: "r1", author: "Ananya", date: "2026-05-10", rating: 5, text: "Great stay!", hostReply: "Thanks!" }}
      />
    )
    expect(screen.getByText("Ananya")).toBeInTheDocument()
    expect(screen.getByText("Great stay!")).toBeInTheDocument()
    expect(screen.getByText("Thanks!")).toBeInTheDocument()
  })

  it("omits the host reply block when absent", () => {
    render(<ReviewCard review={{ id: "r2", author: "Rahul", date: "2026-05-11", rating: 4, text: "Good." }} />)
    expect(screen.queryByText("Host reply:")).not.toBeInTheDocument()
  })
})
