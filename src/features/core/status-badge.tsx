import { Circle, CircleCheck, CircleDotDashed, CircleX, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "live" | "warning" | "danger" | "ink" | "neutral";

const statusTones: Record<string, Tone> = {
  completed: "live", verified: "live", paid: "live", released: "live", approved: "live", read: "live",
  pending_verification: "warning", payment_pending: "warning", quotes_received: "warning", dispatched: "warning", needs_clearer_copy: "warning", submitted: "warning", open: "warning", investigating: "warning",
  failed: "danger", cancelled: "danger", disputed: "danger", rejected: "danger", suspended: "danger", expired: "danger", refunded: "danger", overdue: "danger", missing: "danger",
  in_transit: "ink", operator: "ink",
  deferred: "neutral", not_submitted: "neutral",
};

function readable(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = statusTones[status] ?? "neutral";
  const Icon = tone === "live" ? CircleCheck : tone === "warning" ? Clock3 : tone === "danger" ? CircleX : tone === "ink" ? CircleDotDashed : Circle;
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold", tone === "live" && "status-live", tone === "warning" && "status-warning", tone === "danger" && "status-danger", tone === "ink" && "border-foreground bg-foreground text-primary-foreground", tone === "neutral" && "border-border bg-muted text-muted-foreground")}><Icon size={11} aria-hidden="true" />{label ?? readable(status)}</span>;
}