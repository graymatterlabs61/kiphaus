import Link from "next/link"
import { LogoMark } from "@/components/shared/logo"
import { FadeIn } from "@/components/motion/fade-in"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="relative hidden p-4 lg:block lg:sticky lg:top-0 lg:h-svh">
        <FadeIn inView={false} className="relative h-full w-full overflow-hidden rounded-3xl">
          <video
            src="/bg2.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/5" />
          <div className="absolute inset-x-0 bottom-0 p-10 xl:p-12">
            <p className="font-perfectly-nineties-regular text-[32px] xl:text-[38px] leading-[1.1] text-white max-w-[420px]">
              Verified in person, not just in photos.
            </p>
            <p className="mt-3 text-body-sm leading-body tracking-body-sm text-white/75 max-w-[360px]">
              Kiphaus verifies homestays, villas and unique stays across India before they reach you.
            </p>
          </div>
        </FadeIn>
      </div>
      <div className="flex flex-col p-4 lg:p-8 xl:p-12">
        <div className="flex h-full flex-col justify-center">
          <div className="mx-auto w-full max-w-[440px] py-4">
            <header className="mb-4 flex justify-center">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="text-primary w-8 h-auto" />
                <span className="text-[20px] font-semibold tracking-[-0.36px] text-primary">Kiphaus</span>
              </Link>
            </header>
            <FadeIn inView={false} delay={0.1}>{children}</FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
