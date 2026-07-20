import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export function ContactForm() {
  return (
    <form className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className={labelClass}>Name</Label>
          <Input id="contact-name" name="name" required className={fieldClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className={labelClass}>Email</Label>
          <Input id="contact-email" name="email" type="email" required className={fieldClass} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject" className={labelClass}>Subject</Label>
        <Input id="contact-subject" name="subject" required className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message" className={labelClass}>Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="rounded-2xl border-border bg-transparent px-5 py-4 text-body hover:border-graphite/50 transition-colors"
        />
      </div>
      <Button type="submit" className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
        Send message
      </Button>
    </form>
  )
}
