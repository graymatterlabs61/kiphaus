"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthError, confirmVerificationEmail, resendVerificationEmail } from "@/lib/auth"

function VerifyEmailConfirm({ uid, token }: { uid: string; token: string }) {
  const [status, setStatus] = useState<"checking" | "done" | "error">("checking")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    confirmVerificationEmail({ uid, token })
      .then(() => setStatus("done"))
      .catch((err) => {
        setError(err instanceof AuthError ? err.message : "This verification link is invalid or has expired.")
        setStatus("error")
      })
  }, [uid, token])

  return (
    <div className="flex flex-col text-center">
      <div className="mb-10 space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
          {status === "checking" ? "Verifying…" : status === "done" ? "Email verified" : "Verification failed"}
        </h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          {status === "checking" && "Hang on a moment."}
          {status === "done" && "Your email address is confirmed."}
          {status === "error" && error}
        </p>
      </div>
      {status !== "checking" && (
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full h-[50px] bg-primary hover:bg-primary/90 transition-colors text-primary-foreground text-body font-semibold"
        >
          Continue
        </Link>
      )}
    </div>
  )
}

function VerifyEmailPending() {
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle")

  async function handleResend() {
    setResendState("sending")
    try {
      await resendVerificationEmail()
    } finally {
      setResendState("sent")
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Verify your email</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          We sent a verification link to your email address. Please click the link to verify your account.
        </p>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Button
          className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold"
          render={<a href="mailto:" />}
          nativeButton={false}
        >
          Open Email App
        </Button>
        <div className="text-center text-body-sm font-medium text-smoke tracking-body-sm mt-4">
          {resendState === "sent" ? (
            "Link resent — check your inbox."
          ) : (
            <>
              Didn&rsquo;t receive the email?{" "}
              <button
                onClick={handleResend}
                disabled={resendState === "sending"}
                className="text-ink-black hover:underline font-semibold transition-colors disabled:opacity-50"
              >
                {resendState === "sending" ? "Sending…" : "Click to resend"}
              </button>
            </>
          )}
        </div>
        <div className="mt-8 text-center text-body-sm font-semibold text-smoke tracking-body-sm">
          <Link href="/login" className="text-ink-black hover:underline transition-colors">
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  )
}

function VerifyPageContent() {
  const params = useSearchParams()
  const uid = params.get("uid")
  const token = params.get("token")

  if (uid && token) return <VerifyEmailConfirm uid={uid} token={token} />
  return <VerifyEmailPending />
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyPageContent />
    </Suspense>
  )
}
