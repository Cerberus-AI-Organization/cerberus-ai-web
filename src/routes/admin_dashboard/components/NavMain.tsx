import {type LucideIcon} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

export function NavMain({selectedItem, onSelectedItem, items}: {
  selectedItem: string,
  onSelectedItem: (item: string) => void,
  items: {
    key: string,
    name: string
    icon: LucideIcon
  }[]
}) {

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={selectedItem == item.key}
                               className={"transition-all duration-75 ease-in"}>
              <a
                href={"#"}
                className={selectedItem == item.key ? "text-primary font-medium" : ""}
                onClick={event => {
                  event.preventDefault();
                  onSelectedItem(item.key);
                }}
              >
                <item.icon className={selectedItem == item.key ? "text-primary" : ""}/>
                <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}