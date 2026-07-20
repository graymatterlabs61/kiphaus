import type { SubscriptionPlanId } from "@/types"

export type PlanDetail = {
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
