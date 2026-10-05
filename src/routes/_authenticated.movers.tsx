import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/movers")({ component: MoversLayout });

function MoversLayout() { return <Outlet />; }
