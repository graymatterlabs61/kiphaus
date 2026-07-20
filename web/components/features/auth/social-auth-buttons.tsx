"use client"

import * as React from "react"
import Script from "next/script"
import { useAuth } from "@/hooks"
import { AuthError, type AuthUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void
        signIn: () => Promise<{ authorization: { id_token: string } }>
      }
    }
  }
}

interface SocialAuthButtonsProps {
  onSuccess: (user: AuthUser) => void
  onError: (message: string) => void
}

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { loginWithGoogle, loginWithApple } = useAuth()
  const googleButtonRef = React.useRef<HTMLDivElement>(null)

  const handleGoogleCredential = React.useCallback(
    async (credential: string) => {
      try {
        onSuccess(await loginWithGoogle(credential))
      } catch (err) {
        onError(err instanceof AuthError ? err.message : "Google sign-in failed. Please try again.")
      }
    },
    [loginWithGoogle, onSuccess, onError]
  )

  const handleAppleClick = React.useCallback(async () => {
    if (!window.AppleID) return
    try {
      const result = await window.AppleID.auth.signIn()
      onSuccess(await loginWithApple(result.authorization.id_token))
    } catch (err) {
      onError(err instanceof AuthError ? err.message : "Apple sign-in failed. Please try again.")
    }
  }, [loginWithApple, onSuccess, onError])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
          if (!clientId || !window.google || !googleButtonRef.current) return
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (resp) => handleGoogleCredential(resp.credential),
          })
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            shape: "pill",
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: 260,
          })
        }}
      />
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={() => {
          const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
          if (!clientId || !window.AppleID) return
          window.AppleID.auth.init({
            clientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: true,
          })
        }}
      />

      <div className="my-5 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <div className="px-4 text-body-sm text-smoke tracking-body-sm">Or continue with</div>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleAppleClick}
          className="rounded-full h-[50px] bg-ash-mist border-transparent hover:bg-ash-mist hover:border-graphite/30 transition-colors font-semibold text-ink-black text-body shadow-none"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.53.72 3.26 1.84-2.88 1.62-2.39 5.61.34 6.74-.63 1.6-1.57 3.32-2.27 4.39zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.41-3.74 4.25z" />
          </svg>
          Apple
        </Button>
        <div ref={googleButtonRef} className="flex justify-center [&>div]:w-full" />
      </div>
    </>
  )
}
