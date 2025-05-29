"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Building2, Loader2, Trash2, Upload, Mail } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/axios"
import { authService } from "@/lib/auth"

export default function ManageTenantPage() {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
  })
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    fetchTenantData()
  }, [])

  const fetchTenantData = async () => {
    try {
      const response = await api.get("/tenants/manage/")
      if (response.data.success) {
        const tenantData = response.data.data
        setTenant(tenantData)
        setFormData({
          name: tenantData.name || "",
          contact_email: tenantData.contact_email || "",
        })
      }
    } catch (error) {
      toast.error("Failed to fetch tenant data")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("contact_email", formData.contact_email)

      if (logo) {
        submitData.append("logo", logo)
      }

      const response = await api.patch("/tenants/manage/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.success("Tenant updated successfully!")
        fetchTenantData()
        setLogo(null)
      }
    } catch (error) {
      toast.error("Failed to update tenant")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTenant = async () => {
    setDeleting(true)

    try {
      const response = await api.delete("/tenants/manage/")
     
        toast.success("Tenant deleted successfully!")
        authService.logout()
      
    } catch (error) {
      toast.error("Failed to delete tenant")
    } finally {
      setDeleting(false)
    }
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)

    try {
      const response = await api.get("/tenants/generate-usage-report/")
      if (response.data.success) {
        toast.success("Usage report has been sent to your email!")
      }
    } catch (error) {
      toast.error("Usage report functionality is not available at the moment")
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Tenant</h1>
        <p className="text-muted-foreground">Update your organization settings and information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tenant Information
            </CardTitle>
            <CardDescription>Update your organization details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Organization Logo</Label>
                <div className="space-y-2">
                  {tenant?.logo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Current logo: {tenant.logo.split("/").pop()}
                    </div>
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {logo && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Upload className="h-4 w-4" />
                      {logo.name}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Tenant
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tenant Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Actions</CardTitle>
            <CardDescription>Manage your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tenant ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{tenant?.id}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm text-muted-foreground">
                {tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button onClick={handleGenerateReport} disabled={generatingReport} variant="outline" className="w-full">
                {generatingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Generate Usage Report
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Tenant
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your tenant and all associated data
                      including projects, members, and files.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTenant}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Tenant
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
