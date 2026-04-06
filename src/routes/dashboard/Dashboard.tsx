import {useState, useEffect, useRef} from "react"
import {Send, Trash2, Share2, Loader2, AlertTriangle, RefreshCw} from "lucide-react"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {Separator} from "@/components/ui/separator"
import {Button} from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {Textarea} from "@/components/ui/textarea"
import {toast} from "sonner"
import {useAuth} from "@/states/AuthContext.tsx"
import {API_URL} from "@/lib/api.ts"
import {useSearchParams} from "react-router-dom"
import {useReactToPrint} from "react-to-print"

import MessageBubble from "@/routes/dashboard/components/MessageBubble.tsx"
import ChatSidebar from "@/routes/dashboard/components/ChatSidebar.tsx"
import {LLMConfigPopover, type RagLevel} from "./components/LLMConfigPopover.tsx"
import {CHAT_MODES, MODE_ICONS, type ChatModeId} from "./types/chatMode"
import {useDashboardData} from "./hooks/useDashboardData.ts"
import {useMessaging} from "./hooks/useMessaging.ts"

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const WELCOME_PHRASES = [
  "How can I help you today 🙂",
  "How may I assist you?",
  "What would you like help with?",
]

const randomWelcome = () => WELCOME_PHRASES[Math.floor(Math.random() * WELCOME_PHRASES.length)]

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — Main dashboard
// ─────────────────────────────────────────────────────────────────────────────

function Dashboard() {
  const [searchParams] = useSearchParams()
  const {token} = useAuth()

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const [selectedChat, setSelectedChat] = useState<number>(
    Number(searchParams.get("chat")) || -1
  )
  const [ragLevel, setRagLevel] = useState<RagLevel>("medium")
  const [useRagAdvanced, setUseRagAdvanced] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(true)
  const [selectedMode, setSelectedMode] = useState<ChatModeId>("chat")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [welcomeMessage] = useState(randomWelcome)
  const [inputHeight, setInputHeight] = useState(0)

  // ─────────────────────────────────────────────────────────────────────────────
  // REFS
  // ─────────────────────────────────────────────────────────────────────────────

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HOOKS — Data and messaging logic
  // ─────────────────────────────────────────────────────────────────────────────

  const {
    nodes, models,
    apiComponents,
    chatsList, chatsMap,
    getMessages, updateMessagesForChat,
    updateChat, removeChat, onNewChatCreated,
    selectedNode, setSelectedNode,
    selectedModel, setSelectedModel,
    loadMessages,
    isGenerating, startGenerating, stopGenerating,
    getMessageState, setMessageState,
  } = useDashboardData({selectedChat})

  const {
    messageInput,
    handleSendMessage,
    handleInputChange,
  } = useMessaging({
    selectedChat, setSelectedChat,
    selectedNode, selectedModel,
    ragLevel, useRagAdvanced, selectedMode,
    onMessagesUpdate: updateMessagesForChat,
    onNewChatCreated,
    onChatUpdate: updateChat,
    onGeneratingStart: startGenerating,
    onGeneratingEnd: stopGenerating,
    onMessageStateChange: setMessageState,
    loadMessages, scrollToBottom,
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // DERIVED — Shorthand values for the currently visible chat
  // ─────────────────────────────────────────────────────────────────────────────

  const messages = getMessages(selectedChat)
  const currentMessageState = getMessageState(selectedChat)
  const gettingAiMessage = isGenerating(selectedChat)

  const selectedChatData = chatsMap.get(selectedChat)
  const chatTitle = selectedChatData?.title ?? ""
  const headerTitle = chatTitle.length > 30 ? chatTitle.slice(0, 30) + "..." : chatTitle || "New Chat"

  // ─────────────────────────────────────────────────────────────────────────────
  // PDF EXPORT
  // ─────────────────────────────────────────────────────────────────────────────

  const handleExportToPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedChatData?.title ?? "Chat",
    onAfterPrint: () => setIsSharing(false),
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // EFFECTS — UI synchronisation
  // ─────────────────────────────────────────────────────────────────────────────

  // Auto-resize textarea to fit its content
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [messageInput])

  // Keep the spacer height in sync with the input bar
  useEffect(() => {
    if (inputRef.current) setInputHeight(inputRef.current.offsetHeight)
  }, [messageInput])

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  // ─────────────────────────────────────────────────────────────────────────────
  // CHAT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  const handleCreateChat = () => {
    setSelectedChat(-1)
    // Messages for -1 are already empty (or cleared on delete) — no manual reset needed
  }

  const handleDeleteChat = async () => {
    if (selectedChat === -1) return

    try {
      const res = await fetch(`${API_URL}/chats/${selectedChat}`, {
        method: "DELETE",
        headers: {Authorization: `Bearer ${token}`},
      })
      if (!res.ok) throw new Error()

      toast.success("Chat deleted successfully")
      removeChat(selectedChat)
    } catch {
      toast.error("Failed to delete chat")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedChat(-1)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider>

      {/* Sidebar */}
      <ChatSidebar
        chats={chatsList}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onCreateChat={handleCreateChat}
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        isGenerating={isGenerating}
      />

      <SidebarInset className="flex flex-col h-[100dvh] w-full">

        {/* Header */}
        <header className="flex flex-shrink-0 h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 overflow-x-hidden">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1"/>
            <Separator orientation="vertical" className="mr-2 h-4"/>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{headerTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Action buttons — delete and PDF export */}
            {selectedChat !== -1 && (
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4"/>
              </Button>
            )}
            {selectedChat !== -1 && messages.length > 0 && (
              <Button
                variant="ghost" size="icon"
                disabled={gettingAiMessage || isSharing}
                onClick={() => { setIsSharing(true); handleExportToPDF() }}
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Share2 className="h-4 w-4"/>}
              </Button>
            )}
          </div>
        </header>

        {/* Knowledge status banner */}
        {(apiComponents?.knowledge === "syncing" || apiComponents?.knowledge === "empty") && (
          <div className="flex-shrink-0 px-4 py-2 border-b">
            <Alert className="border-amber-500/50 bg-amber-500/10 [&>svg]:text-amber-500">
              {apiComponents.knowledge === "syncing"
                ? <RefreshCw className="h-4 w-4 animate-spin"/>
                : <AlertTriangle className="h-4 w-4"/>
              }
              <AlertTitle className="text-amber-700 dark:text-amber-400">
                {apiComponents.knowledge === "syncing" ? "Knowledge Base Syncing" : "Knowledge Base Empty"}
              </AlertTitle>
              <AlertDescription>
                {apiComponents.knowledge === "syncing"
                  ? "The knowledge base is currently syncing. RAG features may return incomplete results."
                  : "The knowledge base is disabled. Results will be worse."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Message list */}
        <div ref={printRef} className="flex-1 flex flex-col overflow-hidden relative">
          <ScrollArea className="flex h-full w-full">
            {selectedChat !== -1 ? (
              <>
                {messages.map((message, i) => (
                  <div key={message.id} className="p-4">
                    <MessageBubble
                      message={message}
                      currentState={i === messages.length - 1 ? currentMessageState : null}
                    />
                  </div>
                ))}

                {/* Spacer to prevent messages from hiding behind the input bar */}
                <div style={{height: inputHeight}}/>
                <div ref={messagesEndRef}/>
              </>
            ) : (
              /* Empty state — mode selector */
              <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
                <h2 className="text-2xl font-semibold">{welcomeMessage}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                  {CHAT_MODES.map(mode => {
                    const ModeIcon = MODE_ICONS[mode.id]
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all text-center cursor-pointer
                          ${selectedMode === mode.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <ModeIcon className="size-3.5 shrink-0"/>
                        <span className="font-medium">{mode.label}</span>
                        <span className="text-xs text-muted-foreground">{mode.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Input bar */}
        <div
          ref={inputRef}
          className="absolute bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-background via-background/90 to-transparent pt-8"
        >
          <div className="w-full max-w-2xl border rounded-xl shadow-sm p-2 flex flex-col gap-2 bg-background">

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              className="min-h-[3rem] resize-none border-none shadow-none focus-visible:ring-0 px-2 overflow-y-auto"
              style={{maxHeight: "22.5rem"}}
              placeholder="Type your message..."
              value={messageInput}
              disabled={gettingAiMessage}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />

            {/* Config popover + send button */}
            <div className="flex items-center justify-between px-1">
              <LLMConfigPopover
                nodes={nodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                ragLevel={ragLevel}
                onRagLevelChange={setRagLevel}
                ragAdvanced={useRagAdvanced}
                onRagAdvancedChange={setUseRagAdvanced}
                webSearch={useWebSearch}
                onWebSearchChange={setUseWebSearch}
                braveWebSearchConfigured={apiComponents?.brave_websearch === "configured"}
                disabled={gettingAiMessage}
              />
              <Button
                onClick={handleSendMessage}
                disabled={gettingAiMessage || !messageInput.trim()}
                size="sm"
              >
                <Send className="h-4 w-4"/>
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarProvider>
  )
}

export default Dashboard