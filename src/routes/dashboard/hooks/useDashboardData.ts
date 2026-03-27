import {useState, useEffect} from "react"
import {toast} from "sonner"
import {useAuth} from "@/states/AuthContext.tsx"
import {API_URL} from "@/lib/api.ts"
import type {ComputeNode, ComputeNodeModel} from "@/types/computeNode.ts"
import type {Chat, Message} from "@/types/chat.ts"

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — Loads and manages nodes, models, chats and messages
// ─────────────────────────────────────────────────────────────────────────────

interface UseDashboardDataOptions {
  selectedChat: number
  gettingAiMessage: boolean
}

export function useDashboardData({selectedChat, gettingAiMessage}: UseDashboardDataOptions) {
  const {isAuthenticated, token} = useAuth()

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const [nodes, setNodes] = useState<ComputeNode[]>([])
  const [models, setModels] = useState<ComputeNodeModel[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [selectedNode, setSelectedNode] = useState<number | null>(() => {
    const saved = localStorage.getItem("preferredComputeNode")
    return saved ? Number(saved) : null
  })
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCHERS — API calls for each resource type
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

      // Prefer the previously selected node if it is still online
      const savedId = localStorage.getItem("preferredComputeNode")
      const preferred = savedId ? data.find(n => n.id === Number(savedId)) : undefined

      if (preferred?.status === "online") {
        setSelectedNode(preferred.id)
        return
      }

      // Fall back to the highest-priority online node
      const fallback = [...data].sort((a, b) => a.priority - b.priority).find(n => n.status === "online")
      setSelectedNode(fallback?.id ?? selectedNode ?? null)
    } catch {
      // Silent failure — node polling runs in the background
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
      }
    } catch {
      toast.error("Failed to load models")
    }
  }

  const loadChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chats`, {
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) throw new Error()

      setChats(await res.json())
    } catch {
      toast.error("Failed to load chats")
    }
  }

  const loadMessages = async (chatId: number) => {
    if (chatId === -1) return
    if (gettingAiMessage) return

    try {
      const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      })
      if (!res.ok) throw new Error()

      setMessages(await res.json())
    } catch {
      toast.error("Failed to load messages")
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EFFECTS — Data synchronisation with the server
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

    if (selectedNode)
      localStorage.setItem("preferredComputeNode", String(selectedNode))
  }, [isAuthenticated, nodes, selectedNode])

  // Persist the preferred model to localStorage
  useEffect(() => {
    if (selectedModel)
      localStorage.setItem("preferredModel", selectedModel)
  }, [selectedModel])

  // Load messages whenever the active chat changes
  useEffect(() => {
    if (isAuthenticated)
      loadMessages(selectedChat)
  }, [selectedChat, isAuthenticated])

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    nodes, models, chats, setChats,
    messages, setMessages,
    selectedNode, setSelectedNode,
    selectedModel, setSelectedModel,
    loadMessages,
  }
}