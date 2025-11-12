import {SidebarUser} from "@/components/sidebar/SidebarUser.tsx";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/states/AuthContext.tsx";
import {ArrowLeft, type LucideIcon} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail
} from "@/components/ui/sidebar.tsx";

function AdminSidebar({navItems, selectedNavItem, onSelectedItem, ...props}: React.ComponentProps<typeof Sidebar> & {
  navItems: {
    key: string,
    name: string,
    icon: LucideIcon
  }[],
  selectedNavItem: string,
  onSelectedItem: (item: string) => void,
}) {
  const navigate = useNavigate();
  const {user} = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={selectedNavItem == item.key}
                                   className={"transition-all duration-75 ease-in"}>
                  <Link
                    to={`/dashboard/admin?page=${item.key}`}
                    className={selectedNavItem == item.key ? "text-primary font-medium" : ""}
                    onClick={() => {
                      onSelectedItem(item.key);
                    }}
                  >
                    <item.icon className={selectedNavItem == item.key ? "text-primary" : ""}/>
                    <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full mb-2" onClick={() => {
          navigate("/dashboard");
        }}>
          <ArrowLeft className="group-data-[collapsible=icon]:block hidden"/>
          <span className="group-data-[collapsible=icon]:hidden">Back</span>
        </Button>
        <SidebarUser user={user!}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}

export default AdminSidebar;