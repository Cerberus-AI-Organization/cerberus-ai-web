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
import {Button} from "@/components/ui/button.tsx";
import {MessageSquare, Plus} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {SidebarUser} from "@/components/sidebar/SidebarUser.tsx";
import {useAuth} from "@/states/AuthContext.tsx";
import {ComputeNodeSwitcher} from "@/routes/dashboard/components/ComputeNodeSwitcher.tsx";
import {Link} from "react-router-dom";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

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
          <ComputeNodeSwitcher
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectedNode={node => {
              onSelectNode(node.id);
            }}/>
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
                  <Link
                    to={`/dashboard?chat=${chat.id}`}
                    onClick={() => {
                      onSelectChat(chat.id)
                    }}
                    className={selectedChat === chat.id ? "text-primary font-medium" : ""}
                  >
                    <MessageSquare className={selectedChat === chat.id ? "text-primary" : ""}/>
                    <span className="group-data-[collapsible=icon]:hidden truncate">
                      {chat.title}
                    </span>
                  </Link>
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
        <SidebarUser user={user!}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}

export default ChatSidebar;