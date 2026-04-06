import {useState, useEffect, useRef} from "react"
import {toast} from "sonner"
import {useAuth} from "@/states/AuthContext.tsx"
import {API_URL} from "@/lib/api.ts"
import type {ComputeNode, ComputeNodeModel} from "@/types/computeNode.ts"
import type {Chat, Message} from "@/types/chat.ts"
import type {AIState} from "@/routes/dashboard/components/MessageBubble.tsx"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface UseDashboardDataOptions {
  selectedChat: number
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — Nodes, models, chats (Map) and messages (Map), multi-chat generating
// ─────────────────────────────────────────────────────────────────────────────

export function useDashboardData({selectedChat}: UseDashboardDataOptions) {
  const {isAuthenticated, token} = useAuth()

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const [nodes, setNodes] = useState<ComputeNode[]>([])
  const [models, setModels] = useState<ComputeNodeModel[]>([])

  // Chats stored as ordered id list + lookup Map for O(1) access
  const [chatIds, setChatIds] = useState<number[]>([])
  const [chatsMap, setChatsMap] = useState<Map<number, Chat>>(new Map())

  // Messages keyed by chat id — preserved across chat switches
  const [messagesMap, setMessagesMap] = useState<Map<number, Message[]>>(new Map())

  // Ids of chats that are currently streaming a response
  const [generatingChats, setGeneratingChatsState] = useState<number[]>([])

  // Per-chat AI state label (e.g. "thinking", "searching")
  const [messageStates, setMessageStates] = useState<Map<number, AIState | null>>(new Map())

  // Ref mirror of generatingChats — avoids stale closures in loadMessages
  const generatingRef = useRef<number[]>([])

  const [selectedNode, setSelectedNode] = useState<number | null>(() => {
    const saved = localStorage.getItem("preferredComputeNode")
    return saved ? Number(saved) : null
  })
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // DERIVED
  // ─────────────────────────────────────────────────────────────────────────────

  // Ordered chat list for the sidebar
  const chatsList = chatIds.map(id => chatsMap.get(id)).filter(Boolean) as Chat[]

  const getMessages = (chatId: number): Message[] => messagesMap.get(chatId) ?? []
  const isGenerating = (chatId: number): boolean => generatingRef.current.includes(chatId)
  const getMessageState = (chatId: number): AIState | null => messageStates.get(chatId) ?? null

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATIONS — Chats
  // ─────────────────────────────────────────────────────────────────────────────

  const addChat = (chat: Chat) => {
    setChatsMap(prev => new Map(prev).set(chat.id, chat))
    setChatIds(prev => [chat.id, ...prev.filter(id => id !== chat.id)])
  }

  const updateChat = (chat: Chat) => {
    setChatsMap(prev => new Map(prev).set(chat.id, chat))
  }

  const removeChat = (chatId: number) => {
    setChatsMap(prev => { const m = new Map(prev); m.delete(chatId); return m })
    setChatIds(prev => prev.filter(id => id !== chatId))
    setMessagesMap(prev => { const m = new Map(prev); m.delete(chatId); return m })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATIONS — Messages
  // ─────────────────────────────────────────────────────────────────────────────

  const updateMessagesForChat = (
    chatId: number,
    updater: (msgs: Message[]) => Message[],
  ) => {
    setMessagesMap(prev => {
      const next = new Map(prev)
      next.set(chatId, updater(prev.get(chatId) ?? []))
      return next
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATIONS — Generating state
  // ─────────────────────────────────────────────────────────────────────────────

  const startGenerating = (chatId: number) => {
    const next = [...generatingRef.current, chatId]
    generatingRef.current = next
    setGeneratingChatsState(next)
  }

  const stopGenerating = (chatId: number) => {
    const next = generatingRef.current.filter(id => id !== chatId)
    generatingRef.current = next
    setGeneratingChatsState(next)
    // Clear the AI state label for this chat
    setMessageStates(prev => new Map(prev).set(chatId, null))
  }

  const setMessageState = (chatId: number, state: AIState | null) => {
    setMessageStates(prev => new Map(prev).set(chatId, state))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATIONS — New chat migration (temp id -1 → real DB id)
  // ─────────────────────────────────────────────────────────────────────────────

  const onNewChatCreated = (chat: Chat) => {
    setMessagesMap(prev => {
      const next = new Map(prev)
      const msgs = (prev.get(-1) ?? []).map(m => ({...m, chat_id: chat.id}))
      next.delete(-1)
      next.set(chat.id, msgs)
      return next
    })

    // Transition generating: -1 → real id
    const next = generatingRef.current.filter(id => id !== -1).concat(chat.id)
    generatingRef.current = next
    setGeneratingChatsState(next)

    // Migrate pending AI state label if present
    setMessageStates(prev => {
      const m = new Map(prev)
      const current = m.get(-1) ?? null
      m.delete(-1)
      m.set(chat.id, current)
      return m
    })

    addChat(chat)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCHERS
  // ─────────────────────────────────────────────────────────────────────────────

  const loadNodes = async () => {
    try {
      const res = await fetch(`${API_URL}/compute-nodes`, {
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) throw new Error()

      const data: ComputeNode[] = await res.json()
      setNodes(data)
      if (data.length === 0) return

      const savedId = localStorage.getItem("preferredComputeNode")
      const preferred = savedId ? data.find(n => n.id === Number(savedId)) : undefined

      if (preferred?.status === "online") {
        setSelectedNode(preferred.id)
        return
      }

      const fallback = [...data].sort((a, b) => a.priority - b.priority).find(n => n.status === "online")
      setSelectedNode(fallback?.id ?? selectedNode ?? null)
    } catch (error) {
      console.error("Failed to load compute nodes", error)
    }
  }

  const loadModels = async (nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node || node.status !== "online") {
      setModels([])
      return
    }

    try {
      const res = await fetch(`${API_URL}/compute-nodes/${nodeId}/models`, {
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) throw new Error()

      const data: ComputeNodeModel[] = await res.json()
      setModels(data)

      if (data.length > 0) {
        const saved = localStorage.getItem("preferredModel")
        const preferred = saved ? data.find(m => m.name === saved) ?? null : null
        setSelectedModel(preferred?.name ?? null)
      } else {
        setSelectedModel(null)
      }
    } catch {
      toast.error("Failed to load models")
      setSelectedModel(null)
    }
  }

  const loadChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chats`, {
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) throw new Error()

      const data: Chat[] = await res.json()
      setChatsMap(new Map(data.map(c => [c.id, c])))
      setChatIds(data.map(c => c.id))
    } catch {
      toast.error("Failed to load chats")
    }
  }

  const loadMessages = async (chatId: number) => {
    if (chatId === -1) return
    // Skip reload while streaming — we already have live data in the Map
    if (isGenerating(chatId)) return

    try {
      const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) throw new Error()

      const data: Message[] = await res.json()
      updateMessagesForChat(chatId, () => data)
    } catch {
      toast.error("Failed to load messages")
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────

  // Initial load + periodic node polling every 15 s
  useEffect(() => {
    if (!isAuthenticated) return
    loadNodes()
    loadChats()

    const interval = setInterval(loadNodes, 15_000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Reload models whenever the selected node changes
  useEffect(() => {
    if (!isAuthenticated) return
    loadModels(selectedNode ?? nodes[0]?.id)
    if (selectedNode) localStorage.setItem("preferredComputeNode", String(selectedNode))
  }, [isAuthenticated, nodes, selectedNode])

  // Persist preferred model
  useEffect(() => {
    if (selectedModel) localStorage.setItem("preferredModel", selectedModel)
  }, [selectedModel])

  // Load messages when switching to a chat whose messages aren't cached yet
  useEffect(() => {
    if (!isAuthenticated) return
    if (messagesMap.has(selectedChat)) return // already cached
    loadMessages(selectedChat)
  }, [selectedChat, isAuthenticated])

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    nodes, models,
    chatsList, chatsMap,
    getMessages,
    addChat, updateChat, removeChat, onNewChatCreated,
    updateMessagesForChat,
    selectedNode, setSelectedNode,
    selectedModel, setSelectedModel,
    loadMessages,
    generatingChats, isGenerating, startGenerating, stopGenerating,
    getMessageState, setMessageState,
  }
}