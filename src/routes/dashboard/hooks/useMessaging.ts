import {useState} from "react"
import {toast} from "sonner"
import {io} from "socket.io-client"
import {useAuth} from "@/states/AuthContext.tsx"
import {API_URL} from "@/lib/api.ts"
import type {Chat, Message} from "@/types/chat.ts"
import type {AIState} from "@/routes/dashboard/components/MessageBubble.tsx"
import {ragLevelToLimit, type RagLevel} from "@/routes/dashboard/components/LLMConfigPopover.tsx"
import type {ChatModeId} from "@/routes/dashboard/types/chatMode"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface UseMessagingOptions {
  selectedChat: number
  setSelectedChat: (id: number) => void
  selectedNode: number | null
  selectedModel: string | null
  ragLevel: RagLevel
  useRagAdvanced: boolean
  selectedMode: ChatModeId
  // Semantic callbacks
  onMessagesUpdate: (chatId: number, updater: (msgs: Message[]) => Message[]) => void
  onNewChatCreated: (chat: Chat) => void
  onChatUpdate: (chat: Chat) => void
  onGeneratingStart: (chatId: number) => void
  onGeneratingEnd: (chatId: number) => void
  onMessageStateChange: (chatId: number, state: AIState | null) => void
  loadMessages: (chatId: number) => Promise<void>
  scrollToBottom: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — Message sending and SSE stream processing
// ─────────────────────────────────────────────────────────────────────────────

export function useMessaging({
                               selectedChat, setSelectedChat,
                               selectedNode, selectedModel,
                               ragLevel, useRagAdvanced, selectedMode,
                               onMessagesUpdate, onNewChatCreated, onChatUpdate,
                               onGeneratingStart, onGeneratingEnd, onMessageStateChange,
                               loadMessages, scrollToBottom,
                             }: UseMessagingOptions) {
  const {token} = useAuth()

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const [messageInput, setMessageInput] = useState("")

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIMISTIC UI — Inject placeholder bubbles before the stream arrives
  // ─────────────────────────────────────────────────────────────────────────────

  const injectPlaceholderMessages = (chatId: number, content: string) => {
    onMessagesUpdate(chatId, prev => [
      ...prev,
      {
        id: -1, chat_id: chatId, think: null,
        content, created_at: new Date().toLocaleString(),
        sender_id: null, sender_type: "user", message_rag: null,
      },
      {
        id: -2, chat_id: chatId, think: null,
        content: "", created_at: new Date().toLocaleString(),
        sender_id: null, sender_type: "ai", message_rag: null,
      },
    ])
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STREAM PROCESSOR — Handles each parsed JSON line from the SSE response.
  // Closes over all callbacks from the hook options — no extra params needed.
  // ─────────────────────────────────────────────────────────────────────────────

  const processStreamLine = (
    line: string,
    chatId: number,
    accumulated: {think: string; content: string},
  ) => {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(line)
    } catch {
      return
    }

    if ("error" in data) throw new Error(String(data.error))

    // Streaming thinking tokens
    if ("generated_think" in data) {
      accumulated.think += data.generated_think as string
      onMessagesUpdate(chatId, prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) updated[idx] = {...updated[idx], think: accumulated.think}
        return updated
      })

      // Streaming content tokens
    } else if ("generated_chunk" in data) {
      accumulated.content += data.generated_chunk as string
      onMessagesUpdate(chatId, prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) updated[idx] = {...updated[idx], content: accumulated.content}
        return updated
      })

      // Final AI message saved to DB — replace placeholder, keep accumulated think & rag
    } else if ("generated_message" in data) {
      onMessagesUpdate(chatId, prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) {
          const old = updated[idx]
          updated[idx] = {
            ...(data.generated_message as Message),
            think: old.think,
            message_rag: old.message_rag,
          }
        }
        return updated
      })
      onMessageStateChange(chatId, null)
      scrollToBottom()

      // RAG results attached to the last AI message
    } else if ("rag_results" in data) {
      onMessagesUpdate(chatId, prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) updated[idx] = {...updated[idx], message_rag: data.rag_results as Message["message_rag"]}
        return updated
      })

    } else if ("generation_state" in data) {
      onMessageStateChange(chatId, data.generation_state as AIState)
    } else if ("chat" in data) {
      const chat = data.chat as Chat
      onChatUpdate(chat)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SEND MESSAGE — Initiates the request and drives the stream reader loop.
  // Each invocation is fully independent — multiple chats can stream in parallel.
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    const content = messageInput.trim()
    if (!content || !selectedNode || !selectedModel) return

    // Clear the input immediately so the user can start typing in another chat
    setMessageInput("")

    let chatId = selectedChat
    const setChatId = (id: number) => { chatId = id }
    const accumulated = {think: "", content: ""}

    injectPlaceholderMessages(chatId, content)
    onGeneratingStart(chatId)

    try {
      const res = await fetch(`${API_URL}/chats/${chatId}/message`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({
          node_id: selectedNode,
          model: selectedModel,
          mode: selectedMode,
          rag: {limit: ragLevelToLimit(ragLevel), use_advanced: useRagAdvanced, use_web_search: true},
          content,
        }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      const {jobId, chat, userMessage} = await res.json() as {
        jobId: string
        chat: Chat
        userMessage: Message
      }

      // Apply the confirmed user message and chat from the POST response
      if (chatId === -1) {
        onNewChatCreated(chat)  // migrates messages keyed by -1 → chat.id
        setChatId(chat.id)
        setSelectedChat(chat.id)
        chatId = chat.id
      } else {
        onChatUpdate(chat)
      }
      onMessagesUpdate(chatId, prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("user")
        if (idx !== -1) updated[idx] = userMessage
        return updated
      })
      scrollToBottom()

      await new Promise<void>((resolve, reject) => {
        const socket = io(API_URL, {auth: {token}})
        let lastProcessedSeq = -1

        socket.on("connect", () => {
          socket.emit("subscribe", {jobId})
        })

        socket.on("chunk", (chunk: Record<string, unknown>) => {
          const seq = typeof chunk.seq === "number" ? chunk.seq : -1
          if (seq <= lastProcessedSeq) return;
          lastProcessedSeq = seq
          processStreamLine(JSON.stringify(chunk.data), chatId, accumulated)
        })

        socket.on("sync_complete", ({lastSeq}: {lastSeq: number}) => {
          lastProcessedSeq = Math.max(lastProcessedSeq, lastSeq)
        })

        socket.on("job_complete", () => {
          socket.emit("unsubscribe", {jobId})
          socket.disconnect()
          resolve()
        })

        socket.on("job_error", ({error}: {error: string}) => {
          socket.emit("unsubscribe", {jobId})
          socket.disconnect()
          reject(new Error(error))
        })

        // Only reject on a permanent connection failure (after all retries exhausted)
        socket.io.on("error", (err) => {
          socket.disconnect()
          reject(err)
        })
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to send message")
      await loadMessages(chatId)
    } finally {
      onGeneratingEnd(chatId)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INPUT HANDLER — Triggers model preload on first keystroke
  // ─────────────────────────────────────────────────────────────────────────────

  const handleInputChange = (value: string) => {
    const wasEmpty = !messageInput.trim()
    setMessageInput(value)

    if (wasEmpty && value.trim() && selectedNode && selectedNode !== -1) {
      fetch(`${API_URL}/compute-nodes/${selectedNode}/preload`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({model: selectedModel}),
      }).catch(() => console.error("Model preload failed"))
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    messageInput,
    handleSendMessage,
    handleInputChange,
  }
}