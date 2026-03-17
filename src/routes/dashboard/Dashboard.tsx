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
import MessageBubble, { type AIState } from "@/routes/dashboard/components/MessageBubble.tsx";
import ChatSidebar from "@/routes/dashboard/components/ChatSidebar.tsx";
import {toast} from "sonner";
import {useAuth} from "@/states/AuthContext.tsx";
import {API_URL} from "@/lib/api.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useIsMobile} from "@/hooks/use-mobile.ts";
import {useSearchParams} from "react-router-dom";
import { ModelConfigPopover, ragLevelToLimit, type RagLevel } from "./components/ModelConfigPopover"


function Dashboard() {
  const [searchParams] = useSearchParams();
  const {isAuthenticated, token} = useAuth();
  const [nodes, setNodes] = useState<ComputeNode[]>([])
  const [models, setModels] = useState<ComputeNodeModel[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [ragLevel, setRagLevel] = useState<RagLevel>("medium")
  const [useRagAdvanced, setUseRagAdvanced] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(true)

  const [selectedNode, setSelectedNode] = useState<number | null>(() => {
    const saved = localStorage.getItem('preferredComputeNode');
    return saved ? Number(saved) : null;
  })
  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    return localStorage.getItem('preferredModel');
  })
  const isMobile = useIsMobile()
  const [selectedChat, setSelectedChat] = useState<number>(Number(searchParams.get('chat')) || -1);
  const [messageInput, setMessageInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gettingAiMessage, setGettingAiMessage] = useState(false)
  const [currentMessageState, setCurrentMessageState] = useState<AIState | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getRandomWelcomeMessage = () => {
    const phrases = [
      "How can I help you today 🙂",
      "How may I assist you?",
      "What would you like help with?"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  const [randomWelcomeMessage, setRandomWelcomeMessage] = useState<string>(getRandomWelcomeMessage());

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
    if (gettingAiMessage) return
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
      if (data.length > 0) {
        const savedNodeId = localStorage.getItem('preferredComputeNode');
        const preferredNode = savedNodeId ? data.find(n =>
          n.id === Number(savedNodeId)) : undefined;

        if (preferredNode && preferredNode.status === 'online') {
          setSelectedNode(preferredNode.id);
          return
        }

        const sortedByPriority = data.sort((a, b) => a.priority - b.priority);
        setSelectedNode(sortedByPriority.find(n => n.status === 'online')?.id || null);
      }
      // toast.success("Nodes loaded successfully");
    } catch {
      // toast.error("Failed to load nodes");
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
    setRandomWelcomeMessage(getRandomWelcomeMessage());
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
    setCurrentMessageState(null)
    let chatId = selectedChat;

    try {
      setMessages(prev => [
        ...prev, {
          id: -1,
          chat_id: chatId,
          think: null,
          content: messageInput,
          created_at: new Date().toLocaleString(),
          sender_id: null,
          sender_type: 'user',
          message_rag: null
        }, {
          id: -2,
          chat_id: chatId,
          think: null,
          content: '',
          created_at: new Date().toLocaleString(),
          sender_id: null,
          sender_type: 'ai',
          message_rag: null
        }
      ]);

      const response = await fetch(`${API_URL}/chats/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          node_id: selectedNode,
          model: selectedModel,
          rag: {
            limit: ragLevelToLimit(ragLevel),
            use_advanced: useRagAdvanced,
            use_web_search: true
          },
          content: messageInput,
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

      let currentThink = '';
      let currentContent = '';
      let buffer = '';

      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        if (!value) continue;
        buffer += value;

        const lines = buffer.split('\n')
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line) continue;

          let data;
          try {
            data = JSON.parse(line);
          } catch {
            console.error('Failed to parse JSON:', line, 'Saving into buffer:', buffer);
            buffer = line + "\n" + buffer;
            continue;
          }

          if ('message' in data) {
            setMessages(prev => {
              const updated = [...prev]
              const userMessageIndex = updated.map(m => m.sender_type).lastIndexOf('user');
              if (userMessageIndex === -1) return updated;
              updated[userMessageIndex] = data.message;
              return updated;
            });
          } else if ('generated_think' in data) {
            currentThink += data.generated_think;
            setMessages(prev => {
              const updated = [...prev]
              const aiMessageIndex = updated.map(m => m.sender_type).lastIndexOf('ai');
              if (aiMessageIndex === -1) return updated;
              updated[aiMessageIndex] = {...updated[aiMessageIndex], think: currentThink};
              return updated;
            });
          } else if ('generated_chunk' in data) {
            currentContent += data.generated_chunk;
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
              const oldMessage = updated[aiMessageIndex];
              updated[aiMessageIndex] = data.generated_message;
              updated[aiMessageIndex].think = oldMessage.think;
              updated[aiMessageIndex].message_rag = oldMessage.message_rag;
              return updated;
            });
            setCurrentMessageState(null)
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
            } else {
              setChats(prev => {
                const updated = [...prev]
                const chatIndex = updated.findIndex(c => c.id === chatId);
                if (chatIndex === -1) return updated;
                updated[chatIndex] = data.chat;
                return updated;
              })
            }
          } else if ('rag_results' in data){
            setMessages(prev => {
              const updated = [...prev]
              const aiMessageIndex = updated.map(m => m.sender_type).lastIndexOf('ai');
              if (aiMessageIndex === -1) return updated;
              updated[aiMessageIndex] = {...updated[aiMessageIndex], message_rag: data.rag_results};
              return updated;
            });
          } else if ('generation_state' in data) {
            setCurrentMessageState(data.generation_state);
          } else if ('error' in data) {
            throw new Error(data.error);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      await loadMessages(chatId);
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
      <SidebarInset className="flex flex-col h-[100dvh] w-full">
        <header
          className="flex flex-shrink-0 h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 overflow-x-hidden">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1"/>
            <Separator orientation="vertical" className="mr-2 h-4"/>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {selectedChatData?.title.slice(0, 30) || 'New Chat'}
                    {(selectedChatData?.title || "").length > 30 && '...'}
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex h-full w-full">
            {selectedChat !== -1 ? (
              <>
                {messages.map((message) => (
                  <div className="p-4">
                    <MessageBubble key={message.id} message={message} currentState={messages.indexOf(message) == messages.length - 1 ? currentMessageState : null}/>
                  </div>
                ))}
                <div ref={messagesEndRef}/>
              </>
            ) : (
              <div className="flex justify-center p-16 text-2xl">
                {randomWelcomeMessage}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="border-t p-4 flex-shrink-0">
          <div className={`${isMobile ? "" : "flex"} w-full space-y-2 gap-2`}>
            <ModelConfigPopover
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              ragLevel={ragLevel}
              onRagLevelChange={setRagLevel}
              ragAdvanced={useRagAdvanced}
              onRagAdvancedChange={setUseRagAdvanced}
              webSearch={useWebSearch}
              onWebSearchChange={setUseWebSearch}
              disabled={gettingAiMessage}
            />
            <div className="flex-1 flex gap-2">
              <Textarea
                className="max-h-xs min-h-0"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => {
                  const oldMessageInput = messageInput;
                  setMessageInput(e.target.value);

                  if (oldMessageInput.trim().length == 0 && e.target.value.trim().length > 0) {
                    if (selectedNode == -1) return
                    fetch(`${API_URL}/compute-nodes/${selectedNode}/preload`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({model: selectedModel}),
                    }).then(async res => {
                      if (res.ok) {
                        const data = await res.json()
                        console.log("Preloaded Model: ", data);
                      } else {
                        console.error("Failed to preload model");
                      }
                    })
                  }

                }}
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