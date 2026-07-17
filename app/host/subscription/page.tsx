import { HostShell } from "@/components/features/host/host-shell"
import { SubscriptionPlanCard, SUBSCRIPTION_PLANS } from "@/components/features/host/subscription-plan-card"
import { hostSubscription } from "@/lib/mock-data"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function HostSubscriptionPage() {
  const renewalDate = new Date(hostSubscription.renewalDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Subscription</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Kiphaus doesn&rsquo;t take a cut of your bookings — this annual subscription is the only fee. Billed via
        UPI/Razorpay, separate from any guest payment.
      </p>

      <div className="mt-6 rounded-2xl border border-border p-5">
        <p className="text-body-sm text-smoke tracking-body-sm">Current plan</p>
        <p className="mt-1 font-semibold text-ink-black">
          {hostSubscription.plan === "premium" ? "Premium" : "Basic"} — renews {renewalDate}
        </p>
      </div>

      <StaggerList inView={false} className="mt-10 grid gap-6 sm:grid-cols-2">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <StaggerItem key={plan.id}>
            <SubscriptionPlanCard plan={plan} isCurrent={plan.id === hostSubscription.plan} />
          </StaggerItem>
        ))}
      </StaggerList>
    </HostShell>
  )
}
