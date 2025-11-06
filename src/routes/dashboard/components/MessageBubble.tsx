import type {Message} from "@/types/chat.ts";
import {Bot, User} from "lucide-react";
import MarkdownViewer from "@/components/markdown/MarkdownViewer.tsx";

function MessageBubble({message}: { message: Message }) {
  const isUser = message.sender_type === 'user'

  return (
    <div className={`px-2 sm:px-16 flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex w-8 h-8 shrink-0 items-center justify-center rounded-full ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        {isUser ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
      </div>

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-2 max-w-[65vw] sm:max-w-[50vw] break-words ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        }`}>
          <MarkdownViewer content={message.content}/>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

export default MessageBubble;
