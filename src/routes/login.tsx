import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, MapPin, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { CaryMark } from "@/features/core/workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Cary Mission Control" },
      { name: "description", content: "Administrator sign in to Cary Mission Control." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgot, setForgot] = useState(false);

  // If already authenticated as admin, redirect to overview
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      void navigate({ to: "/" });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email address and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error || "Authentication failed. Please verify your credentials.");
        setIsSubmitting(false);
      } else {
        // Successful login
        void navigate({ to: "/" });
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while signing in.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      {/* ── LEFT: AUTH FORM ── */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <CaryMark />
          <div className="mt-10 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-muted-foreground">Mission Control</span>
          </div>

          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Welcome back.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with your Cary administrator credentials.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger-tint p-3 text-sm text-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {forgot && (
            <div className="mt-6 rounded-md border border-primary/20 bg-muted/60 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Password Recovery</p>
              <p className="mt-1">
                To reset your administrator password, please check your registered admin email for a reset link or contact the principal system owner.
              </p>
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="admin-email">
                Admin Email
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@cary.com"
                className="mt-1.5 h-11"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="admin-password">
                Password
              </label>
              <div className="relative mt-1.5">
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 pr-11"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShow(!show)}
                  className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
                className="accent-primary rounded"
              />
              Remember me
            </label>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-primary"
              onClick={() => setForgot(!forgot)}
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            className="mt-6 h-11 w-full font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Verifying credentials...
              </>
            ) : (
              <>
                <LockKeyhole size={16} className="mr-2" />
                Sign in to Mission Control
              </>
            )}
          </Button>

          <div className="mt-8 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} className="text-primary" />
              <span>Enterprise encrypted session via Supabase Auth</span>
            </div>
          </div>
        </form>
      </section>

      {/* ── RIGHT: BRANDING PANEL ── */}
      <section className="hidden border-l border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="pulse-dot size-2 rounded-full bg-live" />
          Live across Cardiff & South Wales
        </div>

        <div>
          <p className="text-5xl font-semibold leading-tight">
            Calm control,<br />
            when it counts.
          </p>
          <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">
            Real-time mission control for Cary removals. Track active bookings, review mover onboarding credentials, manage WhatsApp customer conversations, and release payouts.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Mission Control Status</span>
            <span>All systems nominal</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded border border-border bg-background p-2.5">
              <p className="text-muted-foreground">Authorization</p>
              <p className="mt-0.5 font-semibold text-foreground">Role-based access</p>
            </div>
            <div className="rounded border border-border bg-background p-2.5">
              <p className="text-muted-foreground">Environment</p>
              <p className="mt-0.5 font-semibold text-foreground">Production Verified</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
