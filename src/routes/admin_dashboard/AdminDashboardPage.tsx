import * as React from "react"
import {UserRoundPen, ArrowLeft, Computer, type LucideIcon} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset, SidebarProvider,
  SidebarRail, SidebarTrigger,
} from "@/components/ui/sidebar"
import {Separator} from "@/components/ui/separator.tsx";
import {NavMain} from "@/routes/admin_dashboard/components/NavMain.tsx";
import {NavUser} from "@/routes/admin_dashboard/components/NavUser.tsx";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/states/AuthContext.tsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import AdminDashboardUsers from "@/routes/admin_dashboard/components/AdminDashboardUsers.tsx";
import AdminDashboardComputeNodes from "@/routes/admin_dashboard/components/AdminDashboardComputeNodes.tsx";

function Nav({navItems, selectedNavItem, onSelectedItem, ...props}: React.ComponentProps<typeof Sidebar> & {
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
        <NavMain selectedItem={selectedNavItem}
                 onSelectedItem={onSelectedItem}
                 items={navItems}/>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full mb-2" onClick={() => {
          navigate("/dashboard");
        }}>
          <ArrowLeft className="group-data-[collapsible=icon]:block hidden"/>
          <span className="group-data-[collapsible=icon]:hidden">Back</span>
        </Button>
        <NavUser user={user!}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}

function AdminDashboardPage() {
  const navItems = [
    {
      key: "users",
      name: "Users",
      icon: UserRoundPen
    },
    {
      key: "compute-nodes",
      name: "Compute Nodes",
      icon: Computer
    }
  ];

  const [selectedNavItem, setSelectedNavItem] = useState<string>(navItems[0].key);

  return (
    <SidebarProvider>
      <Nav navItems={navItems} selectedNavItem={selectedNavItem} onSelectedItem={setSelectedNavItem}/>
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1"/>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>
                    {navItems.find(item => item.key === selectedNavItem)?.name || "Home"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {
            {
              'users': <AdminDashboardUsers/>,
              'compute-nodes': <AdminDashboardComputeNodes/>
            }[selectedNavItem] || null
          }
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminDashboardPage;