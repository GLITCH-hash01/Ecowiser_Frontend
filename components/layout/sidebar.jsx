"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Building2, CreditCard, User, ChevronDown, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { authService } from "@/lib/auth"

export function AppSidebar({ tenantInfo }) {
  const pathname = usePathname()
  const user = authService.getUser()

  // If user has no tenant, only show create tenant option
  if (!user?.tenant) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Building2 className="h-6 w-6" />
            <span className="font-semibold">Ecowiser</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/tenant/create"}>
                    <Link href="/dashboard/tenant/create">
                      <Building2 />
                      <span>Create Tenant</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                    <Link href="/dashboard/profile">
                      <User />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">{user?.role}</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    )
  }

  // Navigation based on user role
  const getNavigation = () => {
    const baseNavigation = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: User,
      },
    ]

    // Projects - accessible to all roles
    const projectsNav = {
      title: "Projects",
      icon: FolderOpen,
      items: [
        {
          title: "All Projects",
          url: "/dashboard/projects",
        },
      ],
    }

    // Add create project for admin/owner
    if (user?.role === "Admin" || user?.role === "Owner") {
      projectsNav.items.push({
        title: "Create Project",
        url: "/dashboard/projects/create",
      })
    }

    baseNavigation.splice(1, 0, projectsNav)

    // Tenant management - only for Owner
    if (user?.role === "Owner") {
      baseNavigation.push({
        title: "Tenant",
        icon: Building2,
        items: [
          {
            title: "Manage Tenant",
            url: "/dashboard/tenant/manage",
          },
        ],
      })
    }

    // Members - for Admin and Owner
    if (user?.role === "Admin" || user?.role === "Owner") {
      baseNavigation.push({
        title: "Members",
        url: "/dashboard/tenant/members",
        icon: Users,
      })
    }

    // Billing - for Admin and Owner
    if (user?.role === "Admin" || user?.role === "Owner") {
      baseNavigation.push({
        title: "Billing",
        icon: CreditCard,
        items: [
          {
            title: "Subscription",
            url: "/dashboard/billing/subscription",
          },
          {
            title: "Invoices",
            url: "/dashboard/billing/invoices",
          },
        ],
      })
    }

    return baseNavigation
  }

  const navigation = getNavigation()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          {tenantInfo?.logo ? (
            <div className="h-8 w-8 relative overflow-hidden rounded-md">
              <Image src={tenantInfo.logo || "/placeholder.svg"} alt={tenantInfo.name} fill className="object-cover" />
            </div>
          ) : (
            <Building2 className="h-6 w-6" />
          )}
          <span className="font-semibold">{tenantInfo?.name || "Ecowiser"}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (item.items) {
                  return (
                    <Collapsible key={item.title} defaultOpen className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-xs text-muted-foreground">{user?.role}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
