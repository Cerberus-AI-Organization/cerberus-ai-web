import type { Message } from "@/types/chat.ts";
import { Bot, User, Brain, Database, Sparkles, Loader2, ToolCase } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MarkdownViewer from "@/components/markdown/MarkdownViewer.tsx";

// ─── Current State ────────────────────────────────────────────────────────────

export type AIState = "thinking" | "executing_tools" | "preparing_rag" | "generating" | null;

const STATE_CONFIG: Record<
  NonNullable<AIState>,
  { label: string; icon: React.ReactNode; color: string; dotColor: string }
> = {
  thinking: {
    label: "Thinking…",
    icon: <Brain className="w-3.5 h-3.5" />,
    color: "text-violet-400",
    dotColor: "bg-violet-400",
  },
  executing_tools: {
    label: "Getting information's",
    icon: <ToolCase className="w-3.5 h-3.5" />,
    color: "text-orange-400",
    dotColor: "bg-orange-400",
  },
  preparing_rag: {
    label: "Reading and searching in knowledge…",
    icon: <Database className="w-3.5 h-3.5" />,
    color: "text-sky-400",
    dotColor: "bg-sky-400",
  },
  generating: {
    label: "Generation responce…",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
};

function CurrentStateBadge({ state }: { state: NonNullable<AIState> }) {
  const cfg = STATE_CONFIG[state];

  if (!cfg) {
    throw new Error(`Invalid state: ${state}`);
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-muted/60 border border-border/40 backdrop-blur-sm
        text-xs font-medium ${cfg.color} animate-in fade-in slide-in-from-bottom-1 duration-300`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dotColor} opacity-60`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotColor}`} />
      </span>
      {cfg.icon}
      {cfg.label}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  currentState?: AIState;
}

function MessageBubble({ message, currentState }: MessageBubbleProps) {
  const isUser = message.sender_type === "user";
  const isEmpty = message.content.trim() === "";

  const hasRag = message.message_rag ? message.message_rag.length > 0 : false;
  const hasThink = message.think ? message.think.length > 0 : false;

  return (
    <div
      className={`px-2 sm:px-16 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200
        ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`hidden sm:flex w-8 h-8 shrink-0 items-center justify-center rounded-full shadow-sm ring-1
          ${isUser
          ? "bg-primary text-primary-foreground ring-primary/30"
          : "bg-muted text-muted-foreground ring-border/50"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isEmpty ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Current state badge – shown above bubble while streaming */}
        {!isUser && currentState && <CurrentStateBadge state={currentState} />}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 max-w-[65vw] sm:max-w-[50vw] break-words shadow-sm
            ${isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm border border-border/30"
          }`}
        >
          {isEmpty ? (
            <TypingIndicator />
          ) : (
            <div className="flex flex-col gap-2">
              {/* Accordions: RAG + Think */}
              {(hasRag || hasThink) && (
                <Accordion collapsible className="w-full" type="single">
                  {hasRag && (
                    <AccordionItem
                      value="rag"
                      className="border-b border-border/20 last:border-0"
                    >
                      <AccordionTrigger
                        className={`text-xs py-1.5 gap-1.5 hover:no-underline font-medium
                          ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        <Database className="w-3 h-3 shrink-0" />
                        Used Knowledge
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion collapsible className="text-sm" type="single">
                          {message.message_rag!.map((rag) => (
                            <AccordionItem
                              value={rag.source}
                              key={rag.hash}
                              className="border-b border-border/10 last:border-0"
                            >
                              <AccordionTrigger className="text-xs py-1 hover:no-underline">
                                {rag.source}
                              </AccordionTrigger>
                              {rag.chunks.map((chunk, idx) => (
                                <AccordionContent key={idx} className="text-sm">
                                  <p className="font-medium mb-1">
                                    {chunk.page_source.replace(rag.source + " ", "")}
                                  </p>
                                  <MarkdownViewer
                                    content={chunk.text.substring(
                                      chunk.text.indexOf("TEXT: ") + 6
                                    )}
                                    className="text-muted-foreground"
                                    fontSize="0.9rem"
                                  />
                                </AccordionContent>
                              ))}
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {hasThink && (
                    <AccordionItem
                      value="thinking"
                      className="border-b border-border/20 last:border-0"
                    >
                      <AccordionTrigger
                        className={`text-xs py-1.5 gap-1.5 hover:no-underline font-medium
                          ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        <Brain className="w-3 h-3 shrink-0" />
                        Think Process
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {message.think}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              )}

              {/* Main message */}
              <MarkdownViewer content={message.content} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-muted-foreground/60 px-1">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export default MessageBubble;