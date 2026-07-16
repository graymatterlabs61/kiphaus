import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PropertyGallery } from "@/components/features/guest/property-gallery"

describe("PropertyGallery", () => {
  const images = ["https://example.com/1.jpg", "https://example.com/2.jpg"]

  it("renders a thumbnail per image and switches the active one on click", async () => {
    const user = userEvent.setup()
    render(<PropertyGallery images={images} title="Test stay" />)
    const thumbnails = screen.getAllByRole("button", { name: /Show photo/i })
    expect(thumbnails).toHaveLength(2)
    await user.click(thumbnails[1])
    expect(thumbnails[1]).toHaveClass("ring-2")
  })

  it("shows a fallback when there are no images", () => {
    render(<PropertyGallery images={[]} title="Test stay" />)
    expect(screen.getByText("No photos yet")).toBeInTheDocument()
  })
})
