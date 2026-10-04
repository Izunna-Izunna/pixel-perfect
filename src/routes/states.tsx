import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/features/core/workspace";
export const Route = createFileRoute("/states")({ component: () => <Workspace title="Component states"><div className="panel p-6"><p className="micro-label">Development</p><h2 className="mt-2 text-xl font-semibold">Shared component states</h2><p className="mt-2 text-sm text-muted-foreground">Loading, empty, error and permission variants will appear here as the shared component library expands.</p></div></Workspace> });
