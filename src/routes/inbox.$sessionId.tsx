import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/features/core/workspace";
import { conversations } from "@/features/core/mock-data";
import { ChatView } from "@/features/inbox/chat-view";

export const Route = createFileRoute("/inbox/$sessionId")({ component: InboxConversation });
function InboxConversation() { const { sessionId } = Route.useParams(); const conversation = conversations.find((item) => item.id === sessionId) ?? conversations[0]; if (!conversation) return null; return <Workspace title="Inbox"><div className="-m-4 -mt-4 min-h-[calc(100svh-4rem)] md:-m-7 md:-mt-7"><ChatView conversation={conversation} fullScreen /></div></Workspace>; }