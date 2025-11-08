import {ChevronsUpDown, LucideServerCog} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type {ComputeNode} from "@/types/computeNode.ts";
import {useEffect, useState} from "react";

export function ComputeNodeSwitcher({nodes, selectedNode, onSelectedNode}: {
  nodes: ComputeNode[],
  selectedNode: number | null,
  onSelectedNode: (node: ComputeNode) => void
}) {
  const {isMobile} = useSidebar();
  const [activeNode, setActiveNode] = useState(nodes.find(value => value.id === selectedNode) || null);

  useEffect(() => {
    setActiveNode(nodes.find(value => value.id === selectedNode) || null);
  }, [nodes, selectedNode]);


  if (!activeNode) {
    return <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div
            className={`bg-orange-700 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg`}>
            <LucideServerCog className="size-4"/>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{"No Compute Notes"}</span>
            <span className="truncate text-xs">{"Contact Admin"}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                className={`${activeNode.status == "online" ? "bg-green-700" : "bg-red-700"} text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg`}>
                <LucideServerCog className="size-4"/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeNode.hostname}</span>
                <span className="truncate text-xs">{activeNode.status === "online" ? "Online" : "Offline"}</span>
              </div>
              <ChevronsUpDown className="ml-auto"/>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Compute Nodes
            </DropdownMenuLabel>
            {nodes.map((node) => (
              <DropdownMenuItem
                key={node.hostname}
                onClick={() => {
                  onSelectedNode(node);
                }
                }
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <LucideServerCog
                    className={`size-3.5 shrink-0 ${node.status === "online" ? "text-green-500" : "text-red-500"}`}/>
                </div>
                {node.hostname}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
