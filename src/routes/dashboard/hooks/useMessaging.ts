import {useState} from "react"
import {toast} from "sonner"
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
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  loadMessages: (id: number) => Promise<void>
  scrollToBottom: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — Handles message sending and SSE stream processing
// ─────────────────────────────────────────────────────────────────────────────

export function useMessaging({
                               selectedChat, setSelectedChat,
                               selectedNode, selectedModel,
                               ragLevel, useRagAdvanced, selectedMode,
                               setMessages, setChats, loadMessages, scrollToBottom
                             }: UseMessagingOptions) {
  const {token} = useAuth()

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const [messageInput, setMessageInput] = useState("")
  const [gettingAiMessage, setGettingAiMessage] = useState(false)
  const [currentMessageState, setCurrentMessageState] = useState<AIState | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIMISTIC UI — Inject placeholder bubbles before the stream arrives
  // ─────────────────────────────────────────────────────────────────────────────

  const injectPlaceholderMessages = (chatId: number, content: string) => {
    setMessages(prev => [
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
  // STREAM PROCESSOR — Handles each parsed JSON line from the SSE response
  // ─────────────────────────────────────────────────────────────────────────────

  const processStreamLine = (
    line: string,
    chatId: number,
    setChatId: (id: number) => void,
    accumulated: {think: string; content: string},
    scrollToBottom: () => void,
  ) => {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(line)
    } catch {
      return // Invalid JSON — caller will prepend line back into the buffer
    }

    if ("error" in data) throw new Error(String(data.error))

    // Saved user message with a real DB id
    if ("message" in data) {
      setMessages(prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("user")
        if (idx !== -1) updated[idx] = data.message as Message
        return updated
      })

      scrollToBottom()

      // Streaming thinking tokens
    } else if ("generated_think" in data) {
      accumulated.think += data.generated_think as string
      setMessages(prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) updated[idx] = {...updated[idx], think: accumulated.think}
        return updated
      })

      // Streaming content tokens
    } else if ("generated_chunk" in data) {
      accumulated.content += data.generated_chunk as string
      setMessages(prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) updated[idx] = {...updated[idx], content: accumulated.content}
        return updated
      })

      // Final AI message saved to DB — replace placeholder, keep accumulated think & rag
    } else if ("generated_message" in data) {
      setMessages(prev => {
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
      setCurrentMessageState(null)
      scrollToBottom()

      // New chat created or existing chat updated (e.g. title generated)
    } else if ("chat" in data) {
      const chat = data.chat as Chat
      if (chatId === -1) {
        setChatId(chat.id)
        setChats(prev => [chat, ...prev])
        setMessages(prev => prev.map(m => ({...m, chat_id: chat.id})))
        setSelectedChat(chat.id)
      } else {
        setChats(prev => {
          const updated = [...prev]
          const idx = updated.findIndex(c => c.id === chatId)
          if (idx !== -1) updated[idx] = chat
          return updated
        })
      }

      // RAG results attached to the last AI message
    } else if ("rag_results" in data) {
      setMessages(prev => {
        const updated = [...prev]
        const idx = updated.map(m => m.sender_type).lastIndexOf("ai")
        if (idx !== -1) updated[idx] = {...updated[idx], message_rag: data.rag_results as Message["message_rag"]}
        return updated
      })

      // Generation state update (e.g. "searching", "thinking")
    } else if ("generation_state" in data) {
      setCurrentMessageState(data.generation_state as AIState)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SEND MESSAGE — Initiates the request and drives the stream reader loop
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedNode || !selectedModel) return

    setGettingAiMessage(true)
    setCurrentMessageState(null)

    let chatId = selectedChat
    const setChatId = (id: number) => { chatId = id }
    const accumulated = {think: "", content: ""}

    injectPlaceholderMessages(chatId, messageInput)

    try {
      const res = await fetch(`${API_URL}/chats/${chatId}/message`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({
          node_id: selectedNode,
          model: selectedModel,
          mode: selectedMode,
          rag: {limit: ragLevelToLimit(ragLevel), use_advanced: useRagAdvanced, use_web_search: true},
          content: messageInput,
        }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader()
      if (!reader) throw new Error("Failed to read response stream")

      // Read chunks and process complete newline-delimited JSON lines
      let buffer = ""
      while (true) {
        const {value, done} = await reader.read()
        if (done) break
        if (!value) continue

        buffer += value
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (line.trim()) processStreamLine(line, chatId, setChatId, accumulated, scrollToBottom)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to send message")
      await loadMessages(chatId)
    } finally {
      setGettingAiMessage(false)
      setMessageInput("")
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
    gettingAiMessage,
    currentMessageState,
    handleSendMessage,
    handleInputChange,
  }
}