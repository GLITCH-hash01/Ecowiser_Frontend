"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, Building2, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { authService } from "@/lib/auth";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    members: 0,
    storage: "0 MB",
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projectsResponse = await api.get("/projects/");
      if (projectsResponse.data.success) {
        setStats((prev) => ({
          ...prev,
          projects: projectsResponse.data.data.length,
        }));
        setRecentProjects(projectsResponse.data.data.slice(0, 5));
      }

      // Fetch tenant members if user has permission
      if (user?.role === "Owner" || user?.role === "Admin") {
        const membersResponse = await api.get("/tenants/members/");
        if (membersResponse.data.success) {
          setStats((prev) => ({
            ...prev,
            members: membersResponse.data.data.length,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name}! Here's what's happening with your
            projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.tenant && (
            <Link href="/dashboard/tenant">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Team
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {user?.tenant && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
              <p className="text-xs text-muted-foreground">
                Active environmental projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.members}</div>
              <p className="text-xs text-muted-foreground">
                Collaborating on projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Storage Used
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.storage}</div>
              <p className="text-xs text-muted-foreground">
                Of available storage
              </p>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Recent Projects */}
      {user?.tenant && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your latest environmental data projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {project.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No projects</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Get started by creating a new project.
                    </p>
                    <div className="mt-6">
                      <Link href="/dashboard/projects/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          New Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/projects/create">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </Link>
              <Link href="/dashboard/tenant/members">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tenant Status */}
      {!user?.tenant && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">
              No Tenant Associated
            </CardTitle>
            <CardDescription className="text-orange-700">
              You're not currently part of any tenant. Create or join a tenant
              to start collaborating.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tenant/create">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Create Tenant
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
