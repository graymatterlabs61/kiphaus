import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/features/guest/search-bar"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("SearchBar", () => {
  beforeEach(() => {
    push.mockClear()
  })

  it("navigates to /s with the selected city and guest count", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.selectOptions(screen.getByLabelText("City"), "Goa")
    await user.click(screen.getByRole("button", { name: "Search stays" }))
    expect(push).toHaveBeenCalledTimes(1)
    const url = push.mock.calls[0][0] as string
    expect(url).toContain("city=Goa")
    expect(url).toContain("guests=2")
  })
})
