import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function SignupPage() {
  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Join Kiphaus</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          Enter your details to create a new account
        </p>
      </div>

      <form>
        <StaggerList className="space-y-5" inView={false}>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-body-sm font-medium text-graphite tracking-body-sm">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4">
              <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                Sign up
              </Button>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>

      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <div className="px-4 text-body-sm text-smoke tracking-body-sm">Or continue with</div>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="space-y-4">
        <Button variant="outline" className="w-full rounded-full h-[50px] bg-transparent border-border hover:bg-ash-mist hover:text-ink-black transition-colors font-semibold text-graphite text-body relative shadow-none">
          <svg className="absolute left-6 size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.53.72 3.26 1.84-2.88 1.62-2.39 5.61.34 6.74-.63 1.6-1.57 3.32-2.27 4.39zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.41-3.74 4.25z" />
          </svg>
          Continue with Apple
        </Button>
        <Button variant="outline" className="w-full rounded-full h-[50px] bg-transparent border-border hover:bg-ash-mist hover:text-ink-black transition-colors font-semibold text-graphite text-body relative shadow-none">
          <svg className="absolute left-6 size-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="mt-10 text-center text-body-sm font-medium text-smoke tracking-body-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black hover:underline font-semibold">
          Log in
        </Link>
      </div>
    </div>
  )
}
