import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WhatsAppGateModal } from "@/components/features/guest/whatsapp-gate-modal"
import { Button } from "@/components/ui/button"

describe("WhatsAppGateModal", () => {
  it("shows the contact-host copy for the contact variant", async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppGateModal variant="contact" triggerRender={<Button />}>
        Book via WhatsApp
      </WhatsAppGateModal>
    )
    await user.click(screen.getByRole("button", { name: "Book via WhatsApp" }))
    expect(await screen.findByText("Log in to contact this host")).toBeInTheDocument()
  })

  it("shows the save-stays copy for the save variant", async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppGateModal variant="save" triggerRender={<Button />}>
        Save
      </WhatsAppGateModal>
    )
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("Log in to save stays")).toBeInTheDocument()
  })

  it("links the login button to /login", async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppGateModal variant="contact" triggerRender={<Button />}>
        Book via WhatsApp
      </WhatsAppGateModal>
    )
    await user.click(screen.getByRole("button", { name: "Book via WhatsApp" }))
    expect(await screen.findByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login")
  })
})
