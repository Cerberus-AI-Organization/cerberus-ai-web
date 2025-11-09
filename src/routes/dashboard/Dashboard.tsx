import {useState, useEffect, useRef} from "react"
import {Send, Trash2} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {Separator} from "@/components/ui/separator"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {ScrollArea} from "@/components/ui/scroll-area"
import type {ComputeNode, ComputeNodeModel} from "@/types/computeNode.ts";
import type {Chat, Message} from "@/types/chat.ts";
import MessageBubble from "@/routes/dashboard/components/MessageBubble.tsx";
import ChatSidebar from "@/routes/dashboard/components/ChatSidebar.tsx";
import {toast} from "sonner";
import {useAuth} from "@/states/AuthContext.tsx";
import {API_URL} from "@/lib/api.ts";

function Dashboard() {
  const {isAuthenticated, token} = useAuth();
  const [nodes, setNodes] = useState<ComputeNode[]>([])
  const [models, setModels] = useState<ComputeNodeModel[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [selectedNode, setSelectedNode] = useState<number | null>(() => {
    const saved = localStorage.getItem('preferredComputeNode');
    return saved ? Number(saved) : null;
  })
  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    return localStorage.getItem('preferredModel');
  })
  const [selectedChat, setSelectedChat] = useState<number>(-1);
  const [messageInput, setMessageInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gettingAiMessage, setGettingAiMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated)
      return

    loadNodes()
    loadChats()

    const interval = setInterval(async () => {
      await loadNodes();
    }, 15_000);

    return () => clearInterval(interval);
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    loadModels(selectedNode || nodes[0]?.id);

    if (selectedNode)
      localStorage.setItem('preferredComputeNode', String(selectedNode));
  }, [isAuthenticated, nodes, selectedNode]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('preferredModel', selectedModel);
    }
  }, [selectedModel])

  useEffect(() => {
    if (selectedChat && isAuthenticated && !gettingAiMessage) {
      loadMessages(selectedChat)
    }
  }, [selectedChat, isAuthenticated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  const loadNodes = async () => {
    try {
      const response = await fetch(`${API_URL}/compute-nodes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load nodes');
      }

      const data: ComputeNode[] = await response.json();
      setNodes(data)
      if (data.length > 0 && !selectedNode) {
        const savedNodeId = localStorage.getItem('preferredComputeNode');
        const preferredNode = savedNodeId ? data.find(n =>
          n.id === Number(savedNodeId) && n.status == "online") : null;

        setSelectedNode(preferredNode?.id || data.find(n => n.status === 'online')?.id || data[0].id);
      }
      // toast.success("Nodes loaded successfully");
    } catch {
      toast.error("Failed to load nodes");
    }
  }

  const loadModels = async (nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) {
      setModels([]);
      console.log("Node not found")
      return
    } else if (node.status !== 'online') {
      setModels([]);
      console.log("Skipping loading models because node is not online")
      return
    }

    try {
      const response = await fetch(`${API_URL}/compute-nodes/${nodeId}/models`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load models');
      }

      const data: ComputeNodeModel[] = await response.json();
      setModels(data)
      if (data.length > 0 && !selectedModel) {
        const savedModel = localStorage.getItem('preferredModel');
        const preferredModel = savedModel ? data.find(m => m.name === savedModel) : null;
        setSelectedModel(preferredModel?.name || data[0].name);
      }
      // toast.success("Models loaded successfully");
    } catch {
      toast.error("Failed to load models");
    }
  }

  const loadChats = async () => {
    try {
      const response = await fetch(`${API_URL}/chats`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load chats');
      }

      const data = await response.json();
      setChats(data)
      // toast.success("Chats loaded successfully");
    } catch {
      toast.error("Failed to load chats");
    }
  }

  const loadMessages = async (chatId: number) => {
    if (chatId == -1)
      return

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data)
      // toast.success("Messages loaded successfully");
    } catch {
      toast.error("Failed to load messages");
    }
  }

  const handleCreateChat = async () => {
    setSelectedChat(-1);
    setMessages([]);
  }

  const handleDeleteChat = async () => {
    if (selectedChat == -1) return

    try {
      const response = await fetch(`${API_URL}/chats/${selectedChat}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("Chat deleted successfully");
        const updatedChats = chats.filter(c => c.id !== selectedChat);
        setChats(updatedChats);

      } else {
        throw new Error("API request failed");
      }
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeleteDialogOpen(false);
      setMessages([]);
      setSelectedChat(-1);
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !selectedNode || !selectedModel) return

    setGettingAiMessage(true)
    let chatId = selectedChat;

    try {
      setMessages(prev => [
        ...prev, {
          id: -1,
          chat_id: chatId,
          content: messageInput,
          created_at: new Date().toLocaleString(),
          sender_id: null,
          sender_type: 'user'
        }, {
          id: -2,
          chat_id: chatId,
          content: '',
          created_at: new Date().toLocaleString(),
          sender_id: null,
          sender_type: 'ai'
        }
      ]);

      const response = await fetch(`${API_URL}/chats/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageInput,
          node_id: selectedNode,
          model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();

      if (!reader) {
        throw new Error('Failed to read response');
      }

      let currentContent = '';
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;

        const lines = value.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line);
          // console.log(data)

          if ('message' in data) {
            setMessages(prev => {
              const updated = [...prev]
              const userMessageIndex = updated.map(m => m.sender_type).lastIndexOf('user');
              if (userMessageIndex === -1) return updated;
              updated[userMessageIndex] = data.message;
              return updated;
            });
          } else if ('generated_chunk' in data) {
            currentContent += data.generated_chunk.content;
            setMessages(prev => {
              const updated = [...prev]
              const aiMessageIndex = updated.map(m => m.sender_type).lastIndexOf('ai');
              if (aiMessageIndex === -1) return updated;
              updated[aiMessageIndex] = {...updated[aiMessageIndex], content: currentContent};
              return updated;
            });
          } else if ('generated_message' in data) {
            setMessages(prev => {
              const updated = [...prev]
              const aiMessageIndex = updated.map(m => m.sender_type).lastIndexOf('ai');
              if (aiMessageIndex === -1) return updated;
              updated[aiMessageIndex] = data.generated_message;
              return updated;
            });
          } else if ('chat' in data) {
            if (chatId === -1) {
              chatId = data.chat.id;

              setChats(prev => [data.chat, ...prev]);
              setMessages(prev => {
                const updated = [...prev]
                for (const m of updated) {
                  m.chat_id = chatId;
                }
                return updated;
              })
              setSelectedChat(chatId);
            }
          } else if ('error' in data) {
            throw new Error(data.error);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      loadMessages(chatId);
    } finally {
      setGettingAiMessage(false)
      setMessageInput('')
    }
  }

  const selectedChatData = chats.find(c => c.id === selectedChat);

  return (
    <SidebarProvider>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onCreateChat={handleCreateChat}
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={setSelectedNode}
      />
      <SidebarInset className="flex flex-col h-[100dvh] w-full overflow-x-hidden">
        <header
          className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 overflow-x-hidden">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1"/>
            <Separator orientation="vertical" className="mr-2 h-4"/>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {selectedChatData?.title || 'New Chat'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {selectedChat != -1 && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4"/>
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col w-full overflow-x-hidden">
          <ScrollArea className="flex-1 min-h-0 w-full">
            <div className="p-4 w-full space-y-4">
              {selectedChat ? (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message}/>
                  ))}
                  <div ref={messagesEndRef}/>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </ScrollArea>

          {selectedChat && (
            <div className="border-t p-4 shrink-0 overflow-x-hidden">
              <div className="max-w-4xl w-full space-y-2">
                <div className="flex gap-2">
                  <Select value={selectedModel || undefined} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select model"/>
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))}
                      {models.length === 0 && <SelectItem value={"no-models"} disabled>No Models Found</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={gettingAiMessage}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={gettingAiMessage || !messageInput.trim()}
                  >
                    <Send className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

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
  );
}

export default Dashboard;