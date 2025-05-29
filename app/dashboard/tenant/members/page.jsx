"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Users, Plus, MoreHorizontal, Loader2, Trash2, Settings } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/axios"
import { authService } from "@/lib/auth"

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const [inviteData, setInviteData] = useState({
    user_email: "",
    role: "Member",
  })

  const currentUser = authService.getUser()

  useEffect(() => {
    fetchMembers()
  }, [currentPage])

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/tenants/members/?page=${currentPage}`)
      if (response.data.success) {
        setMembers(response.data.data)
        console.log(response.data.pagination)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      toast.error("Failed to fetch members")
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    setInviting(true)

    try {
      const response = await api.post("/tenants/members/", inviteData)
      if (response.data.success) {
        toast.success("Member invited successfully!")
        setShowInviteDialog(false)
        setInviteData({ user_email: "", role: "Member" })
        fetchMembers() // Refresh the members list
      }
    } catch (error) {
      toast.error("Failed to invite member")
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (email, newRole) => {
    try {
      const response = await api.post("/tenants/members/role/", {
        user_email: email,
        role: newRole,
      })
      if (response.data.success) {
        toast.success("Role updated successfully!")
        fetchMembers() // Refresh the members list
      }
    } catch (error) {
      toast.error("Failed to update role")
    }
  }

  const handleRemoveMember = async (email) => {
    try {
      const response = await api.delete("/tenants/members/", {
        data: { user_email: email },
      })
      if (response.data.success) {
        toast.success("Member removed successfully!")
        fetchMembers() // Refresh the members list
      }
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Owner":
        return "bg-red-100 text-red-800"
      case "Admin":
        return "bg-blue-100 text-blue-800"
      case "Member":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canManageUser = (memberRole) => {
    if (currentUser?.role === "Owner") return true
    if (currentUser?.role === "Admin" && memberRole !== "Owner") return true
    return false
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your organization</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={inviteData.user_email}
                  onChange={(e) => setInviteData((prev) => ({ ...prev, user_email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    {currentUser?.role === "Owner" && <SelectItem value="Owner">Owner</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({members.length})
          </CardTitle>
          <CardDescription>Manage roles and permissions for your team</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.email} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.first_name?.[0]}
                        {member.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>

                    {canManageUser(member.role) && member.email !== currentUser?.email && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.email, "Member")}
                            disabled={member.role === "Member"}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.email, "Admin")}
                            disabled={member.role === "Admin"}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                          {currentUser?.role === "Owner" && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.email, "Owner")}
                              disabled={member.role === "Owner"}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Make Owner
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.first_name} {member.last_name} from your
                                  organization? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Member
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No team members</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by inviting your first team member.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && ( pagination.previous != null || pagination.next != null) && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} 
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => pagination.next ? prev + 1 : prev)}
                disabled={currentPage === pagination.page_size}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
