"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks"
import { AuthError } from "@/lib/auth"
import { createPaymentOrder, verifyPayment } from "@/lib/api"
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay"
import type { SubscriptionPlanId } from "@/types"

type PlanDetail = {
  id: SubscriptionPlanId
  name: string
  price: number
  features: string[]
}

export const SUBSCRIPTION_PLANS: PlanDetail[] = [
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    features: ["1 listing", "WhatsApp booking integration", "Basic search visibility", "Identity & property verification"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 4999,
    features: [
      "Unlimited listings",
      "Featured placement in search",
      "Enhanced analytics",
      "Premium Verified badge",
      "Priority verification review",
    ],
  },
]

export function SubscriptionPlanCard({
  plan,
  isCurrent,
  onSubscribed,
}: {
  plan: PlanDetail
  isCurrent?: boolean
  onSubscribed?: () => void
}) {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setIsProcessing(true)
    setError(null)
    try {
      await loadRazorpayScript()
      const order = await createPaymentOrder(plan.id)
      openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Kiphaus",
        description: `${plan.name} host subscription`,
        prefill: { name: user?.full_name, email: user?.email, contact: user?.phone },
        theme: { color: "#0f172a" },
        handler: (response) => {
          verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
            .then(() => onSubscribed?.())
            .catch(() => setError("Payment succeeded but confirmation failed — contact support."))
        },
      })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : err instanceof Error ? err.message : "Couldn't start checkout.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`rounded-2xl border p-6 ${isCurrent ? "border-primary" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">{plan.name}</h3>
        {isCurrent && <Badge>Current plan</Badge>}
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-heading font-semibold text-ink-black leading-heading">
          ₹{plan.price.toLocaleString("en-IN")}
        </span>
        <span className="text-body-sm text-smoke tracking-body-sm">/year</span>
      </p>
      <ul className="mt-5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-body-sm text-graphite tracking-body-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-body-sm text-destructive tracking-body-sm">{error}</p>}
      <Button
        variant={isCurrent ? "outline" : "default"}
        disabled={isCurrent || isProcessing}
        onClick={handleSubscribe}
        className={`mt-6 w-full rounded-full h-[50px] font-semibold ${
          isCurrent ? "border-border text-graphite" : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
      >
        {isCurrent ? "Current plan" : isProcessing ? "Starting checkout…" : "Switch to " + plan.name}
      </Button>
    </div>
  )
}
