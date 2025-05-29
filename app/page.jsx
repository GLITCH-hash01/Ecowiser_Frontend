import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, FolderOpen, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 ">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Ecowiser</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Environmental Data Management
          <span className="text-green-600"> Made Simple</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Streamline your environmental projects with our powerful multi-tenant platform. Manage data, collaborate with
          teams, and track progress all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Ecowiser?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Multi-Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Secure tenant isolation with role-based access control for teams of any size.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FolderOpen className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize your environmental data into projects with comprehensive file management.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Invite team members with different permission levels and collaborate seamlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Data Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload CSV files and visualize your environmental data with powerful analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 Ecowiser. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
