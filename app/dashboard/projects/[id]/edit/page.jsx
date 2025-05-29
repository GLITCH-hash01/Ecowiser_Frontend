"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Shield } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/axios"
import { authService } from "@/lib/auth"

export default function EditProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const user = authService.getUser()
  const userRole = user?.role || "Member"
  const canEdit = userRole === "Admin" || userRole === "Owner"

  useEffect(() => {
    if (!canEdit) {
      toast.error("You don't have permission to edit projects")
      router.push(`/dashboard/projects/${id}`)
      return
    }
    fetchProject()
  }, [id, canEdit, router])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}/`)
      if (response.data.success) {
        const projectData = response.data.data
        setProject(projectData)
        setFormData({
          name: projectData.name,
          description: projectData.description,
        })
      }
    } catch (error) {
      toast.error("Failed to fetch project")
      router.push("/dashboard/projects")
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canEdit) {
      toast.error("You don't have permission to edit projects")
      return
    }

    setUpdating(true)

    try {
      const response = await api.patch(`/projects/${id}/`, formData)
      if (response.data.success) {
        toast.success("Project updated successfully!")
        router.push(`/dashboard/projects/${id}`)
      }
    } catch (error) {
      toast.error("Failed to update project")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold">Project not found</h3>
        <p className="text-muted-foreground">The project you're trying to edit doesn't exist.</p>
        <Link href="/dashboard/projects">
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  if (!canEdit) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Permission Denied</h3>
        <p className="text-muted-foreground">You don't have permission to edit this project.</p>
        <Link href={`/dashboard/projects/${id}`}>
          <Button className="mt-4">Back to Project</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">Update project information</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Update the project name and description</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={updating}>
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Project
                </Button>
                <Link href={`/dashboard/projects/${id}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
