import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { HostCard } from "@/components/features/guest/host-card"

describe("HostCard", () => {
  it("renders the host name and response stats", () => {
    render(
      <HostCard
        host={{ name: "Ritika", responseRate: 98, avgResponseTimeMinutes: 15, badge: "Top Rated Host", otherListingsCount: 2 }}
      />
    )
    expect(screen.getByText("Hosted by Ritika")).toBeInTheDocument()
    expect(screen.getByText("98% response rate · responds in ~15 min")).toBeInTheDocument()
    expect(screen.getByText("2 other listings on Kiphaus")).toBeInTheDocument()
  })

  it("omits the other-listings line when the count is zero", () => {
    render(
      <HostCard host={{ name: "Neha", responseRate: 85, avgResponseTimeMinutes: 90, badge: null, otherListingsCount: 0 }} />
    )
    expect(screen.queryByText(/other listing/)).not.toBeInTheDocument()
  })
})
