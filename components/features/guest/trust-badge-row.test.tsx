import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TrustBadgeRow } from "@/components/features/guest/trust-badge-row"

describe("TrustBadgeRow", () => {
  it("renders the verification label for the given level", () => {
    render(<TrustBadgeRow verificationLevel={3} hostBadge={null} />)
    expect(screen.getByText("Video Verified")).toBeInTheDocument()
  })

  it("renders the host badge when provided", () => {
    render(<TrustBadgeRow verificationLevel={4} hostBadge="Top Rated Host" />)
    expect(screen.getByText("On-Site Verified")).toBeInTheDocument()
    expect(screen.getByText("Top Rated Host")).toBeInTheDocument()
  })

  it("omits a host badge element when null", () => {
    render(<TrustBadgeRow verificationLevel={1} hostBadge={null} />)
    expect(screen.queryByText("Top Rated Host")).not.toBeInTheDocument()
    expect(screen.queryByText("Super Responsive Host")).not.toBeInTheDocument()
  })
})
