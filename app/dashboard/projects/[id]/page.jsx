"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  FolderOpen,
  Upload,
  Download,
  Trash2,
  FileText,
  Calendar,
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Eye,
  Shield,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "react-toastify"
import api from "@/lib/axios"
import { authService } from "@/lib/auth"

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [resources, setResources] = useState([])
  const [csvFiles, setCsvFiles] = useState([])
  const [csvData, setCsvData] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCsvUploadDialog, setShowCsvUploadDialog] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadFileName, setUploadFileName] = useState("")
  const [uploadVisibility, setUploadVisibility] = useState("Private")
  const [uploadDescription, setUploadDescription] = useState("")
  const [csvUploadFile, setCsvUploadFile] = useState(null)
  const [csvUploadName, setCsvUploadName] = useState("")
  const [csvUploadDescription, setCsvUploadDescription] = useState("")
  const [csvColumns, setCsvColumns] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [selectedCsvFile, setSelectedCsvFile] = useState(null)

  const user = authService.getUser()
  const userRole = user?.role || "Member"

  // Check permissions based on role
  const canEdit = userRole === "Admin" || userRole === "Owner"
  const canUpload = true // All roles including Member can upload
  const canDelete = userRole === "Admin" || userRole === "Owner"
  const canChangeVisibility = userRole === "Admin" || userRole === "Owner"

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const projectResponse = await api.get(`/projects/${id}/`)
      if (projectResponse.data.success) {
        setProject(projectResponse.data.data)
      } else {
        toast.error("Project not found")
        router.push("/dashboard/projects")
      }

      // Fetch project resources (media)
      const resourcesResponse = await api.get(`/resources/media/${id}/`)
      if (resourcesResponse.data.success) {
        setResources(resourcesResponse.data.data)
      }

      // Fetch CSV files
      const csvResponse = await api.get(`/resources/csv/?project_id=${id}`)
      if (csvResponse.data.success) {
        setCsvFiles(csvResponse.data.data)
      }
    } catch (error) {
      toast.error("Failed to fetch project data")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadFile(file)
      if (!uploadFileName) {
        setUploadFileName(file.name)
      }
    }
  }

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCsvUploadFile(file)
      if (!csvUploadName) {
        setCsvUploadName(file.name)
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("project", id)
      formData.append("name", uploadFileName)
      formData.append("visibility", uploadVisibility)
      if (uploadDescription) {
        formData.append("description", uploadDescription)
      }

      const response = await api.post(`/resources/upload/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.success("Resource uploaded successfully!")
        setShowUploadDialog(false)
        setUploadFile(null)
        setUploadFileName("")
        setUploadVisibility("Private")
        setUploadDescription("")
        fetchProjectData()
      }
    } catch (error) {
      toast.error("Failed to upload resource")
    } finally {
      setUploading(false)
    }
  }

  const handleCsvUpload = async (e) => {
    e.preventDefault()
    setUploadingCsv(true)

    try {
      const formData = new FormData()
      formData.append("file", csvUploadFile)
      formData.append("project", id)
      formData.append("name", csvUploadName)
      if (csvUploadDescription) {
        formData.append("description", csvUploadDescription)
      }

      const response = await api.post(`/resources/csv/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.success("CSV uploaded successfully!")
        setShowCsvUploadDialog(false)
        setCsvUploadFile(null)
        setCsvUploadName("")
        setCsvUploadDescription("")
        fetchProjectData()
      }
    } catch (error) {
      toast.error("Failed to upload CSV")
    } finally {
      setUploadingCsv(false)
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete resources")
      return
    }

    try {
      const response = await api.delete(`/resources/media/${resourceId}/`)
      if (response.data.success) {
        toast.success("Resource deleted successfully!")
        fetchProjectData()
      }
    } catch (error) {
      toast.error("Failed to delete resource")
    }
  }

  const handleDeleteCsv = async (csvId) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete CSV files")
      return
    }

    try {
      const response = await api.delete(`/resources/csv/?id=${csvId}`)
      if (response.data.success) {
        toast.success("CSV deleted successfully!")
        fetchProjectData()
      }
    } catch (error) {
      toast.error("Failed to delete CSV")
    }
  }

  const handleDownloadResource = async (resourceId, filename) => {
    try {
      const response = await api.get(`/resources/media/${resourceId}/`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error("Failed to download resource")
    }
  }

  const handleChangeVisibility = async (resourceId, newVisibility) => {
    if (!canChangeVisibility) {
      toast.error("You don't have permission to change resource visibility")
      return
    }

    try {
      const response = await api.post(`/resources/media/visibility/${resourceId}/`, {
        visibility: newVisibility,
      })
      if (response.data.success) {
        toast.success(`Visibility changed to ${newVisibility}`)
        fetchProjectData()
      }
    } catch (error) {
      toast.error("Failed to change visibility")
    }
  }

  const handleViewCsv = async (csvId) => {
    try {
      // Use the list API to get all CSV files for the project
      const response = await api.get(`/resources/csv/?project_id=${id}`)
      if (response.data.success) {
        const csvFiles = response.data.data
        // Find the specific CSV file by ID
        const csvFile = csvFiles.find((file) => file.id === csvId)

        if (csvFile && csvFile.JSONData) {
          // Parse the JSON data with the correct format
          const jsonData = csvFile.JSONData

          if (jsonData.rows && jsonData.columns && Array.isArray(jsonData.rows) && Array.isArray(jsonData.columns)) {
            const columns = jsonData.columns
            const rows = jsonData.rows.map((row) =>
              columns.map((col) => (row[col] !== undefined ? String(row[col]) : "")),
            )

            setCsvColumns(columns)
            setCsvRows(rows)
            setSelectedCsvFile(csvId)

            // Switch to CSV viewer tab
            const tabsList = document.querySelector('[role="tablist"]')
            const csvViewerTab = tabsList?.querySelector('[value="csv-viewer"]')
            if (csvViewerTab) {
              csvViewerTab.click()
            }
            toast.success("CSV data loaded successfully!")
          } else {
            toast.error("CSV file has invalid data format")
          }
        } else if (csvFile && !csvFile.JSONData) {
          toast.error("No data available for this CSV file - it may still be processing")
        } else {
          toast.error("CSV file not found")
        }
      }
    } catch (error) {
      toast.error("Failed to load CSV data")
      console.error("CSV loading error:", error)
    }
  }

  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop()?.toLowerCase()
    if (extension === "csv") {
      return <FileText className="h-4 w-4 text-green-600" />
    }
    return <FileText className="h-4 w-4 text-blue-600" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
        <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        <Link href="/dashboard/projects">
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        {canEdit && (
          <Link href={`/dashboard/projects/${id}/edit`}>
            <Button variant="outline">Edit Project</Button>
          </Link>
        )}
        {!canEdit && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-1" />
            <span>View Only</span>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(project.created_at).toLocaleDateString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSV Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{csvFiles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Media Resources</TabsTrigger>
          <TabsTrigger value="csv-files">CSV Files</TabsTrigger>
          <TabsTrigger value="csv-viewer">CSV Viewer</TabsTrigger>
        </TabsList>

        {/* Media Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Media Resources
                  </CardTitle>
                  <CardDescription>Upload and manage project media files</CardDescription>
                </div>
                {canUpload && (
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Media Resource</DialogTitle>
                        <DialogDescription>Add a new media file to this project</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="file">File</Label>
                          <Input id="file" type="file" onChange={handleFileChange} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">File Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter file name"
                            value={uploadFileName}
                            onChange={(e) => setUploadFileName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="visibility">Visibility</Label>
                          <Select value={uploadVisibility} onValueChange={setUploadVisibility}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Private">Private</SelectItem>
                              <SelectItem value="Public">Public</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe this resource..."
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={uploading || !uploadFile}>
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {resources.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="flex items-center gap-2">
                            {getFileIcon(resource.name)}
                            <div>
                              <p className="font-medium">{resource.name}</p>
                              {resource.description && (
                                <p className="text-sm text-muted-foreground">{resource.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={resource.visibility === "Public" ? "default" : "secondary"}>
                              {resource.visibility}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(resource.file_size || 0)}</TableCell>
                          <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {resource.uploaded_by?.first_name?.[0]}
                                  {resource.uploaded_by?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {resource.uploaded_by?.first_name} {resource.uploaded_by?.last_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownloadResource(resource.id, resource.name)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                {canChangeVisibility && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeVisibility(
                                        resource.id,
                                        resource.visibility === "Public" ? "Private" : "Public",
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Make {resource.visibility === "Public" ? "Private" : "Public"}
                                  </DropdownMenuItem>
                                )}
                                {(canDelete || resource.uploaded_by?.id === user?.id) && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{resource.name}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteResource(resource.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No media resources</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Upload your first media file to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Files Tab */}
        <TabsContent value="csv-files" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    CSV Files
                  </CardTitle>
                  <CardDescription>Upload and manage CSV data files</CardDescription>
                </div>
                {canUpload && (
                  <Dialog open={showCsvUploadDialog} onOpenChange={setShowCsvUploadDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload CSV File</DialogTitle>
                        <DialogDescription>Add a new CSV data file to this project</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCsvUpload} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="csvFile">CSV File</Label>
                          <Input id="csvFile" type="file" accept=".csv" onChange={handleCsvFileChange} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="csvName">File Name</Label>
                          <Input
                            id="csvName"
                            placeholder="Enter file name"
                            value={csvUploadName}
                            onChange={(e) => setCsvUploadName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="csvDescription">Description (Optional)</Label>
                          <Textarea
                            id="csvDescription"
                            placeholder="Describe this CSV file..."
                            value={csvUploadDescription}
                            onChange={(e) => setCsvUploadDescription(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowCsvUploadDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={uploadingCsv || !csvUploadFile}>
                            {uploadingCsv && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload CSV
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {csvFiles.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvFiles.map((csvFile) => (
                        <TableRow key={csvFile.id}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium">{csvFile.name}</p>
                              {csvFile.description && (
                                <p className="text-sm text-muted-foreground">{csvFile.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(csvFile.file_size || 0)}</TableCell>
                          <TableCell>{new Date(csvFile.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {csvFile.uploaded_by?.first_name?.[0]}
                                  {csvFile.uploaded_by?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {csvFile.uploaded_by?.first_name} {csvFile.uploaded_by?.last_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewCsv(csvFile.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Data
                                </DropdownMenuItem>
                                {csvFile.file_url && (
                                  <DropdownMenuItem onClick={() => window.open(csvFile.file_url, "_blank")}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                                {(canDelete || csvFile.uploaded_by?.id === user?.id) && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete CSV File</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{csvFile.name}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteCsv(csvFile.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No CSV files</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Upload your first CSV file to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Viewer Tab */}
        <TabsContent value="csv-viewer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Data Viewer</CardTitle>
              <CardDescription>View and analyze CSV data from uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCsvFile && csvColumns.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        Viewing: {csvFiles.find((f) => f.id === selectedCsvFile)?.name || "CSV File"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {csvRows.length} rows, {csvColumns.length} columns
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const csvFile = csvFiles.find((f) => f.id === selectedCsvFile)
                          if (csvFile?.file_url) {
                            window.open(csvFile.file_url, "_blank")
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Original
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCsvFile(null)
                          setCsvColumns([])
                          setCsvRows([])
                        }}
                      >
                        Clear View
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background w-12 text-center">#</TableHead>
                          {csvColumns.map((column, index) => (
                            <TableHead key={index} className="sticky top-0 bg-background min-w-32">
                              <div className="font-medium">{column}</div>
                              <div className="text-xs text-muted-foreground font-normal">Column {index + 1}</div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvRows.slice(0, 100).map((row, rowIndex) => (
                          <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/50" : ""}>
                            <TableCell className="text-center text-xs text-muted-foreground font-mono">
                              {rowIndex + 1}
                            </TableCell>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex} className="max-w-48">
                                <div className="truncate" title={cell}>
                                  {cell || <span className="text-muted-foreground italic">empty</span>}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {csvRows.length > 100
                        ? `Showing first 100 rows of ${csvRows.length} total rows`
                        : `Showing all ${csvRows.length} rows`}
                    </span>
                    <span>Data loaded from JSONData field</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No CSV data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload a CSV file and click "View Data" to see the data here.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>The table will display data from the JSONData field returned by the API</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
