import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function ForgetPasswordPage() {
  return (
    <div className="flex flex-col">
      <Link href="/login" className="mb-6 flex w-fit items-center text-body-sm font-semibold text-smoke hover:text-ink-black transition-colors tracking-body-sm">
        <ArrowLeft className="mr-2 size-4" />
        Back to login
      </Link>
      
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Forgot your password?</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form>
        <StaggerList className="space-y-6" inView={false}>
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
            <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
              Reset password
            </Button>
          </StaggerItem>
        </StaggerList>
      </form>
    </div>
  )
}
