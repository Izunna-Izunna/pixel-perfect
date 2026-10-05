import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/features/core/workspace";
import { ChatView } from "@/features/inbox/chat-view";
import { useOperations } from "@/features/core/operations-store";

export const Route = createFileRoute("/_authenticated/inbox/$sessionId")({ component: InboxConversation });
function InboxConversation() { const { sessionId } = Route.useParams(); const { conversations } = useOperations(); const conversation = conversations.find((item) => item.id === sessionId) ?? conversations[0]; if (!conversation) return null; return <Workspace title="Inbox" immersive><ChatView conversation={conversation} fullScreen /></Workspace>; }