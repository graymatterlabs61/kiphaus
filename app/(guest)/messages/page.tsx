import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { AccountNav } from "@/components/features/guest/account-nav"
import { WhatsAppThreadRow } from "@/components/features/guest/whatsapp-thread-row"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { messageThreads } from "@/lib/mock-data"

export default function GuestMessagesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Messages</h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row">
          <AccountNav />

          <div className="min-w-0 flex-1">
            <p className="mb-6 text-body-sm text-smoke tracking-body-sm">
              Every conversation happens directly on WhatsApp with your host — no platform inbox in between.
            </p>
            {messageThreads.length === 0 ? (
              <FadeIn inView={false} className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
                  No conversations yet. Contact a host from any listing to start one on WhatsApp.
                </p>
              </FadeIn>
            ) : (
              <StaggerList inView={false} className="space-y-3">
                {messageThreads.map((thread) => (
                  <StaggerItem key={thread.id}>
                    <WhatsAppThreadRow thread={thread} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
