import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/payments")({ component: PaymentsLayout });
function PaymentsLayout() { return <Outlet />; }
