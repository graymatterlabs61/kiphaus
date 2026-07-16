import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchFilters } from "@/components/features/guest/search-filters"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("city=Goa"),
}))

describe("SearchFilters", () => {
  beforeEach(() => {
    push.mockClear()
  })

  it("applies a property type filter while preserving the existing city param", async () => {
    const user = userEvent.setup()
    render(<SearchFilters />)
    await user.selectOptions(screen.getByLabelText("Property type"), "Villa")
    await user.click(screen.getByRole("button", { name: "Apply filters" }))
    expect(push).toHaveBeenCalledTimes(1)
    const url = push.mock.calls[0][0] as string
    expect(url).toContain("city=Goa")
    expect(url).toContain("type=Villa")
  })
})
