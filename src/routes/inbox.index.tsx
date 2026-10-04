import { createFileRoute } from "@tanstack/react-router";
import { InboxPage } from "./inbox";

export const Route = createFileRoute("/inbox/")({ component: InboxPage });