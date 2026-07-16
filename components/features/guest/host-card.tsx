import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Host } from "@/types"

export function HostCard({ host }: { host: Host }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <Avatar size="lg">
        {host.photo && <AvatarImage src={host.photo} alt={host.name} />}
        <AvatarFallback>{host.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">Hosted by {host.name}</p>
          {host.badge && <Badge variant="outline">{host.badge}</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {host.responseRate}% response rate · responds in ~
          {host.avgResponseTimeMinutes} min
        </p>
        {host.otherListingsCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {`${host.otherListingsCount} other ${host.otherListingsCount === 1 ? "listing" : "listings"} on Kiphaus`}
          </p>
        )}
      </div>
    </div>
  )
}
