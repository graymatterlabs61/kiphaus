import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SiteHeader } from "@/components/layout/site-header"

describe("SiteHeader", () => {
  it("renders the brand and the search-stays nav link", () => {
    render(<SiteHeader />)
    expect(screen.getByText("Kiphaus")).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Search stays" })[0]).toHaveAttribute("href", "/s")
  })

  it("toggles the mobile menu open and closed", async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close menu" }))
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument()
  })
})
