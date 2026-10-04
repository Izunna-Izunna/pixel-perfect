import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, MapPin, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { maskPhone } from "@/lib/format";

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="micro-label">{label}</p><div className="mt-1 text-sm font-medium">{value}</div></div>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-32 border-l border-border pl-4 first:border-l-0 first:pl-0"><p className="micro-label">{label}</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums">{value}</p></div>;
}

export function MaskedPhone({ phone }: { phone: string }) {
  const [revealed, setRevealed] = useState(false);
  return <div className="flex items-center gap-2"><span className="font-mono text-sm">{revealed ? phone : maskPhone(phone)}</span><Button variant="ghost" size="sm" onClick={() => setRevealed((value) => !value)}>{revealed ? <><EyeOff />Mask</> : <><Eye />Reveal</>}</Button></div>;
}

export function ProfileActions({ messageTo, backTo }: { messageTo: string; backTo: "/customers" | "/movers" }) {
  return <div className="flex shrink-0 flex-wrap gap-2"><Button asChild><Link to="/inbox/$sessionId" params={{ sessionId: messageTo }}><MessageCircle />Message</Link></Button><Button asChild variant="outline"><Link to={backTo}><MapPin />All records</Link></Button></div>;
}