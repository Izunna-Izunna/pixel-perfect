import { createFileRoute } from "@tanstack/react-router";
import { InboxPage } from "./_authenticated.inbox";

export const Route = createFileRoute("/_authenticated/inbox/")({ component: InboxPage });