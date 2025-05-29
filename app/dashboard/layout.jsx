"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { authService } from "@/lib/auth"
import api from "@/lib/axios"

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [tenantInfo, setTenantInfo] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login")
        return
      }

      // Check if user data exists
      let userData = authService.getUser()

      // If no user data, fetch it
      if (!userData) {
        try {
          userData = await authService.getCurrentUser()
        } catch (error) {
          console.error("Failed to fetch user data:", error)
          router.push("/login")
          return
        }
      }

      setUser(userData)

      // If user has a tenant, fetch tenant info
      if (userData.tenant) {
        try {
          const response = await api.get("/tenants/manage/")
          if (response.data.success) {
            setTenantInfo(response.data.data)
          }
        } catch (error) {
          console.error("Failed to fetch tenant info:", error)
        }
      }

      setLoading(false)
    }

    initializeAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar tenantInfo={tenantInfo} />
      <SidebarInset>
        <Header tenantInfo={tenantInfo} />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
