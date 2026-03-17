import {ChevronsUpDown} from "lucide-react"
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
  useSidebar
} from "@/components/ui/sidebar"
import {type ChatModeId, MODE_ICONS} from "../types/chatMode.ts"
import {CHAT_MODES} from "../types/chatMode.ts"

const MODE_COLORS: Record<ChatModeId, string> = {
  chat: "bg-blue-300",
  malware: "bg-orange-700",
  pentest: "bg-purple-700",
}

export function ChatModeSwitcher({selectedMode, onSelectMode}: {
  selectedMode: ChatModeId
  onSelectMode: (mode: ChatModeId) => void
}) {
  const {isMobile} = useSidebar()
  const activeMode = CHAT_MODES.find(m => m.id === selectedMode)!
  const Icon = MODE_ICONS[selectedMode]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className={`${MODE_COLORS[selectedMode]} text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg`}>
                <Icon className="size-4"/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeMode.label}</span>
                <span className="truncate text-xs">{activeMode.description}</span>
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
              Chat Mode
            </DropdownMenuLabel>
            {CHAT_MODES.map((mode) => {
              const ModeIcon = MODE_ICONS[mode.id]
              return (
                <DropdownMenuItem
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <ModeIcon className="size-3.5 shrink-0"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">{mode.description}</span>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}