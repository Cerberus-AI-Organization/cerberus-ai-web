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
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadNodes()
      loadChats()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedNode && isAuthenticated) {
      loadModels(selectedNode)
      localStorage.setItem('preferredComputeNode', String(selectedNode));
    }
  }, [selectedNode, isAuthenticated])

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('preferredModel', selectedModel);
    }
  }, [selectedModel])

  useEffect(() => {
    if (selectedChat && isAuthenticated) {
      loadMessages(selectedChat)
    }
  }, [selectedChat, isAuthenticated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  const loadNodes = async () => {
    try {
      const response = await fetch('/api/compute-nodes', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load nodes');
      }

      const data:ComputeNode[] = await response.json();
      setNodes(data)
      if (data.length > 0 && !selectedNode) {
        const savedNodeId = localStorage.getItem('preferredComputeNode');
        const preferredNode = savedNodeId ? data.find(n => n.id === Number(savedNodeId)) : null;
        setSelectedNode(preferredNode?.id || data[0].id);
      }
      // toast.success("Nodes loaded successfully");
    } catch {
      toast.error("Failed to load nodes");
    }
  }

  const loadModels = async (nodeId: number) => {
    try {
      const response = await fetch(`/api/compute-nodes/${nodeId}/models`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load models');
      }

      const data:ComputeNodeModel[] = await response.json();
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
      const response = await fetch('/api/chats', {
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
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0].id)
      }
      // toast.success("Chats loaded successfully");
    } catch {
      toast.error("Failed to load chats");
    }
  }

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
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

  const handleCreateChat = async (title: string) => {
    if (!title) return

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({title})
      })

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data = await response.json();
      setChats([data, ...chats])
      setSelectedChat(data.id)
      toast.success("Chat created successfully");
    } catch {
      toast.error("Failed to create chat");
    }
  }

  const handleDeleteChat = async () => {
    if (!selectedChat) return

    try {
      const response = await fetch(`/api/chats/${selectedChat}`,
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
      setDeleteDialogOpen(false)
      setMessages([])
      setSelectedChat(chats.length > 1 ? chats[0].id : null)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !selectedNode || !selectedModel) return

    setLoading(true)

    try {
      const response = await fetch(`/api/chats/${selectedChat}/message`, {
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
          const data = JSON.parse(line);
          console.log(data)

          if ('message' in data) {
            setMessages(prev => [...prev, data.message]);
            setMessages(prev => [...prev, {
              id: -1,
              chat_id: selectedChat,
              content: '',
              created_at: new Date().toLocaleString(),
              sender_id: null,
              sender_type: 'ai'
            }]);
          } else if ('generated_chunk' in data) {
            currentContent += data.generated_chunk.content;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: currentContent
              };
              return updated;
            });
          } else if ('generated_message' in data) {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = data.generated_message;
              return updated;
            });
          } else if ('error' in data) {
            throw new Error(data.error);
          }
        }
      }

      // toast.success("Message sent successfully");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false)
      setMessageInput('')
    }
  }

  const selectedChatData = chats.find(c => c.id === selectedChat)

  return (
    <SidebarProvider>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onCreateChat={() => handleCreateChat('New Chat')}
        selectedNode={selectedNode}
        nodes={nodes}
        onSelectNode={setSelectedNode}
      />
      <SidebarInset className="flex flex-col h-screen w-full overflow-x-hidden">
        <header
          className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1"/>
            <Separator orientation="vertical" className="mr-2 h-4"/>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {selectedChatData?.title || 'Select a chat'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {selectedChat && (
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

        <div className="flex-1 min-h-0 flex flex-col w-full">
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
            <div className="border-t p-4 shrink-0">
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
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !messageInput.trim()}
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