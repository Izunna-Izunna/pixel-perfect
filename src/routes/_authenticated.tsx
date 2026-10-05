import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Authorized admin email whitelist — kept in sync with auth-context.tsx
const AUTHORIZED_ADMIN_EMAILS = ["caryadmin@gmail.com"];

/**
 * _authenticated — a pathless layout route.
 *
 * Every child route nested under this layout (by filename prefix _authenticated.)
 * is protected. The `beforeLoad` runs server-side before any component renders,
 * so there is NO flash of protected content. If the session is missing or the
 * authenticated user is not on the admin whitelist, they are immediately
 * redirected to /login with no way around it.
 */
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: { session }, error } = await supabase.auth.getSession();

    // No session — kick to login
    if (error || !session || !session.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    const email = (session.user.email ?? "").toLowerCase();
    const role = (
      session.user.user_metadata?.["role"] ||
      session.user.app_metadata?.["role"] ||
      ""
    )
      .toString()
      .toLowerCase();

    const isAdmin =
      role === "admin" ||
      role === "superadmin" ||
      role === "operator" ||
      AUTHORIZED_ADMIN_EMAILS.includes(email);

    if (!isAdmin) {
      // Valid Supabase user but not an admin — sign them out and redirect
      await supabase.auth.signOut();
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
