import { createFileRoute } from "@tanstack/react-router";
import { LogOut, ShieldCheck, Mail, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/features/core/workspace";
import { useAuth } from "@/features/auth/auth-context";

export const Route = createFileRoute("/_authenticated/settings/account")({
  head: () => ({
    meta: [
      { title: "My account — Cary Mission Control" },
      { name: "description", content: "Administrator account details and session control." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, adminName, signOut } = useAuth();

  const email = user?.email || "admin@cary.com";
  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Active session";

  return (
    <Workspace title="My account">
      <div className="mx-auto max-w-2xl">
        <p className="micro-label">Account</p>
        <div className="mt-1 flex items-center gap-3">
          <h2 className="text-2xl font-semibold">{adminName}</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Administrator
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{email} · Verified Admin</p>

        {/* ── PROFILE INFO ── */}
        <section className="mt-8 space-y-4 border-y border-border py-5">
          <h3 className="text-sm font-semibold">Administrator Profile</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={14} /> Full Name
              </div>
              <p className="mt-1 font-semibold text-foreground text-sm">{adminName}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} /> Email Address
              </div>
              <p className="mt-1 font-semibold text-foreground text-sm truncate">{email}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck size={14} /> Security Role
              </div>
              <p className="mt-1 font-semibold text-primary text-sm">Full Mission Control Admin</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} /> Last Sign In
              </div>
              <p className="mt-1 font-semibold text-foreground text-sm">{lastSignIn}</p>
            </div>
          </div>
        </section>

        {/* ── APPEARANCE ── */}
        <section className="border-b border-border py-5">
          <p className="font-semibold text-sm">Appearance & Theme</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Toggle between light and dark mode using the sun/moon icon in the navigation bar. Your preference is persisted in your session.
          </p>
        </section>

        {/* ── SESSION CONTROL ── */}
        <section className="border-b border-border py-5">
          <p className="font-semibold text-sm">Active Session</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign out will securely terminate your current Supabase administrator session and return you to the login screen.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void signOut()}
          >
            <LogOut size={16} className="mr-2 text-danger" />
            Sign out of Mission Control
          </Button>
        </section>
      </div>
    </Workspace>
  );
}
