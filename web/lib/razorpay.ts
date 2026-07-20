export interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description?: string
  handler: (response: RazorpaySuccessResponse) => void
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
}

interface RazorpayCheckout {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout
  }
}

let scriptPromise: Promise<void> | null = null

/** Loads Razorpay's Checkout script once and caches the promise across calls. */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.Razorpay) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Couldn't load the payment form. Check your connection and try again."))
      document.body.appendChild(script)
    })
  }
  return scriptPromise
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  if (!window.Razorpay) throw new Error("Payment form isn't ready yet.")
  new window.Razorpay(options).open()
}
