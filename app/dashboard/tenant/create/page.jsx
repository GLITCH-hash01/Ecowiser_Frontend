"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Loader2, Upload } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/axios"
import { authService } from "@/lib/auth"

export default function CreateTenantPage() {
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    subscription_tier: "Free",
  })
  const [logo, setLogo] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("contact_email", formData.contact_email)
      submitData.append("subscription_tier", formData.subscription_tier)

      if (logo) {
        submitData.append("logo", logo)
      }

      const response = await api.post("/tenants/create/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.success("Tenant created successfully!")
        // Refresh user data to get updated tenant info
        await authService.refreshUserData()
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create tenant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Tenant</h1>
        <p className="text-muted-foreground">Set up your organization to start collaborating</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tenant Details
            </CardTitle>
            <CardDescription>Provide information about your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter organization name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="contact@organization.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_tier">Subscription Tier</Label>
                <Select
                  value={formData.subscription_tier}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, subscription_tier: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Organization Logo (Optional)</Label>
                <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Tenant
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">• You will become the Owner of this tenant</p>
            <p className="text-sm text-muted-foreground">• You can invite team members and assign roles</p>
            <p className="text-sm text-muted-foreground">• You can create and manage projects</p>
            <p className="text-sm text-muted-foreground">• You can manage billing and subscriptions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
