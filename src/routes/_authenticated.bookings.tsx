import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/bookings")({ component: BookingsLayout });

function BookingsLayout() { return <Outlet />; }
