import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";

const routes = [
  '/',
  '/attention',
  '/bookings',
  '/customers',
  '/escalations',
  '/inbox',
  '/login',
  '/movers',
  '/notifications',
  '/payments',
  '/reminders',
  '/states',
  '/system',
  '/bookings/ref123',
  '/customers/cust123',
  '/inbox/sess123',
  '/movers/mov123',
  '/quotes/new',
  '/settings/account',
  '/settings/operations',
  '/bookings/ref123/assign',
  '/payments/pay123/refund'
];

describe("Route Health Check", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
  });

  routes.forEach((path) => {
    it(`matches route: ${path}`, () => {
      const matches = router.matchRoutes(path);
      expect(matches.length).toBeGreaterThan(0);
      const lastMatch = matches.at(-1);
      expect(lastMatch?.routeId).not.toBe('__root__');
    });
  });
});
