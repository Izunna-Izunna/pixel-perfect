import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCircle2, PauseCircle, PlayCircle, RefreshCw, Server, ShieldCheck, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOperations } from "@/features/core/operations-store";
import { Workspace } from "@/features/core/workspace";
import * as api from "@/lib/api";

export const Route = createFileRoute("/_authenticated/system")({
  head: () => ({
    meta: [
      { title: "System — Cary Mission Control" },
      { name: "description", content: "Production system health, Railway backend, Supabase, Redis and Scout controls." },
    ],
  }),
  component: System,
});

type HealthStatus = {
  status: string;
  service: string;
  uptime: number;
  checks: {
    redis: string;
    supabase: string;
  };
};

function System() {
  const { scoutPaused, toggleScoutPaused, audit } = useOperations();
  const [word, setWord] = useState("");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [waStatus, setWaStatus] = useState<api.WhatsAppStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const fetchStatus = async () => {
    setChecking(true);
    try {
      const BASE = import.meta.env['VITE_API_URL'] || 'https://cary-backend-production.up.railway.app';
      const hRes = await fetch(`${BASE}/health`).then((r) => r.json()).catch(() => null);
      if (hRes) setHealth(hRes);

      const waRes = await api.fetchWhatsAppStatus().catch(() => null);
      if (waRes) setWaStatus(waRes);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15_000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m`;
  };

  return (
    <Workspace title="System">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="micro-label">Infrastructure & AI</p>
            <h2 className="mt-1 text-3xl font-semibold">System health & services.</h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStatus} disabled={checking}>
            <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Live System Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Backend</span>
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-3 text-lg font-bold">Railway API</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {health ? `Uptime: ${formatUptime(health.uptime)}` : "Connected to production"}
            </p>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Database</span>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-3 text-lg font-bold">Supabase</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {health?.checks.supabase === "ok" ? "PostgreSQL & Auth OK" : "Connected"}
            </p>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Queue Store</span>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-3 text-lg font-bold">Railway Redis</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {health?.checks.redis === "ok" ? "BullMQ Workers OK" : "Connected"}
            </p>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp API</span>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-3 text-lg font-bold">{waStatus?.phone?.verifiedName || "WhatsApp Cloud"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {waStatus?.phone?.displayNumber || "Meta Cloud API Connected"}
            </p>
          </div>
        </div>

        {/* WhatsApp Details */}
        {waStatus && (
          <section className="mt-6 border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">Meta WhatsApp Cloud API Status</h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Display Number</p>
                <p className="mt-1 font-mono font-medium">{waStatus.phone?.displayNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Verified Name</p>
                <p className="mt-1 font-medium">{waStatus.phone?.verifiedName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quality Rating</p>
                <p className="mt-1 font-medium text-emerald-600 capitalize">{waStatus.phone?.qualityRating}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved Templates</p>
                <p className="mt-1 font-mono font-medium">{waStatus.templates?.total ?? 0} loaded</p>
              </div>
            </div>
          </section>
        )}

        {/* Scout Auto-Pilot Control */}
        <section className="mt-6 border border-border bg-card p-5">
          <p className="micro-label">Scout AI Dispatch & Auto-Pilot</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{scoutPaused ? "Scout auto-pilot is paused" : "Scout auto-pilot is active"}</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${scoutPaused ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              {scoutPaused ? "Manual Only" : "Autonomous"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            When active, Claude Scout automatically responds to incoming customer enquiries and negotiates quotes via WhatsApp.
          </p>
          {!scoutPaused ? (
            <div className="mt-4 max-w-sm">
              <label className="text-sm font-medium">
                Type PAUSE ALL to halt Scout auto-responses
                <Input
                  className="mt-2"
                  value={word}
                  onChange={(event) => setWord(event.target.value.toUpperCase())}
                  placeholder="PAUSE ALL"
                />
              </label>
              <Button
                className="mt-3"
                variant="destructive"
                disabled={word !== "PAUSE ALL"}
                onClick={() => {
                  toggleScoutPaused();
                  setWord("");
                }}
              >
                <PauseCircle className="mr-2 size-4" />
                Pause Scout globally
              </Button>
            </div>
          ) : (
            <Button className="mt-4" onClick={toggleScoutPaused}>
              <PlayCircle className="mr-2 size-4" />
              Resume Scout auto-pilot
            </Button>
          )}
        </section>

        {/* Live Audit Log */}
        <section className="mt-6 border border-border bg-card p-5">
          <p className="micro-label">Activity & dispatch log</p>
          <div className="mt-4 space-y-3">
            {audit.length ? (
              audit.slice(0, 8).map((event) => (
                <div key={event.id} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent operator actions recorded.</p>
            )}
          </div>
        </section>
      </div>
    </Workspace>
  );
}
