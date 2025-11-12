import {UserRoundPen, Computer} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {Separator} from "@/components/ui/separator.tsx";
import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import AdminDashboardUsers from "@/routes/admin_dashboard/components/AdminDashboardUsers.tsx";
import AdminDashboardComputeNodes from "@/routes/admin_dashboard/components/AdminDashboardComputeNodes.tsx";
import AdminSidebar from "@/routes/admin_dashboard/components/AdminSidebar.tsx";

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

  const [searchParams] = useSearchParams();
  const [selectedNavItem, setSelectedNavItem] = useState<string>(() => {
    const param = searchParams.get("page");
    if (param && navItems.map(i => i.key).includes(param)) return param;
    return navItems[0].key;
  });

  return (
    <SidebarProvider>
      <AdminSidebar
        navItems={navItems}
        selectedNavItem={selectedNavItem}
        onSelectedItem={setSelectedNavItem}/>
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
                <BreadcrumbItem>
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