import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { OperationsProvider } from "@/features/core/operations-store";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="panel max-w-md p-8 text-center"><p className="font-mono text-5xl">404</p><h1 className="mt-3 text-xl font-semibold">This page is not in the control room.</h1><Link to="/" className="mt-6 inline-flex text-sm font-semibold text-primary">Return to overview</Link></div></div>;
}
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="panel max-w-md p-8 text-center"><h1 className="text-xl font-semibold">The control room did not load.</h1><p className="mt-2 text-sm text-muted-foreground">Try refreshing the workspace.</p><button onClick={() => { router.invalidate(); reset(); }} className="mt-6 text-sm font-semibold text-primary">Try again</button></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Geist:wght@400;500;600;700&display=swap" }] }),
  shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><OperationsProvider><Outlet /></OperationsProvider></QueryClientProvider>; }
