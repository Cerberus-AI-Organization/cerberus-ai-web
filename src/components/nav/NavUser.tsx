import {BadgeCheck, ChevronsUpDown, LogOut, Moon, Settings, Sun} from "lucide-react"
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar.tsx"
import {toast} from "sonner";
import {useAuth} from "@/states/AuthContext.tsx";
import {useTheme} from "@/states/ThemeProvider.tsx";
import type {User} from "@/types/user.ts";

type UserAvatarProps = {
  user: User;
  className?: string;
};

function UserAvatar({user, className}: UserAvatarProps) {
  const avatarStyle = user.role === 'admin' ? 'bg-red-700 text-white' : 'bg-blue-300 text-black';
  return (
    <Avatar className={`h-8 w-8 rounded-lg ${className || ''}`}>
      <AvatarFallback className={`rounded-lg ${avatarStyle}`}>
        {user.name[0].toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function NavUser({user}: {
  user: User
}) {
  const {isMobile} = useSidebar();
  const {logout} = useAuth();
  const {theme, setTheme} = useTheme();

  const handlers = {
    account: () => toast.info("Account settings coming soon"),
    settings: () => toast.info("Settings coming soon"),
    logout: () => {
      logout();
      toast.success("Logged out successfully");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar user={user}/>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-primary/75">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4"/>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user}/>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-primary/75">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handlers.account}>
                <BadgeCheck/>
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlers.settings}>
              <Settings/>
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <Sun /> : <Moon />}
              Toggle theme
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={handlers.logout}>
            <LogOut/>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
