import type {Chat} from "@/types/chat.ts";
import type {ComputeNode} from "@/types/computeNode.ts";
import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail
} from "@/components/ui/sidebar.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MessageSquare, Plus, Server} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {NavUser} from "@/components/nav/NavUser.tsx";
import {useAuth} from "@/states/AuthContext.tsx";

function ChatSidebar({chats, selectedChat, onSelectChat, onCreateChat, selectedNode, nodes, onSelectNode}: {
  chats: Chat[]
  selectedChat: number | null
  onSelectChat: (chatId: number) => void
  onCreateChat: () => void
  selectedNode: number | null
  nodes: ComputeNode[]
  onSelectNode: (nodeId: number) => void
}) {
  const {user} = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Compute Node
          </SidebarGroupLabel>
          <div className="px-2 py-1 group-data-[collapsible=icon]:px-1">
            <Select value={selectedNode?.toString() || undefined} onValueChange={value => onSelectNode(Number(value)!)}>
              <SelectTrigger className="w-full group-data-[collapsible=icon]:hidden">
                <SelectValue placeholder="Select node"/>
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${node.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}/>
                      {node.hostname}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="group-data-[collapsible=icon]:block hidden">
              <Button variant="ghost" size="icon" className="w-full">
                <Server className="h-4 w-4"/>
              </Button>
            </div>
          </div>
        </SidebarGroup>

        <Separator/>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:justify-center">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Chats
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCreateChat}
            >
              <Plus className="h-4 w-4"/>
            </Button>
          </div>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  asChild
                  isActive={selectedChat === chat.id}
                  className="transition-all duration-75 ease-in"
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onSelectChat(chat.id)
                    }}
                    className={selectedChat === chat.id ? "text-primary font-medium" : ""}
                  >
                    <MessageSquare className={selectedChat === chat.id ? "text-primary" : ""}/>
                    <span className="group-data-[collapsible=icon]:hidden truncate">
                      {chat.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {chats.length} chat{chats.length !== 1 ? 's' : ''}
        </div>
        <NavUser user={user!} />
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}

export default ChatSidebar;