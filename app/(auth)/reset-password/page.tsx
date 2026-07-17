import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Set new password</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          Your new password must be different to previously used passwords.
        </p>
      </div>

      <form>
        <StaggerList className="space-y-5" inView={false}>
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-body-sm font-medium text-graphite tracking-body-sm">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors tracking-[0.2em] placeholder:tracking-[0.2em] text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4">
              <Button type="submit" className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                Reset password
              </Button>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>
    </div>
  )
}
