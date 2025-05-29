"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Check, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/axios"

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/billings/subscription/")
      if (response.data.success) {
        setSubscription(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      toast.error("Failed to load subscription data")
      // Provide mock data when API is not available
      console.warn("Billing API not available, using mock data")
      setSubscription({
        id: 0,
        subscription_tier: "Free",
        current_cycle_start_date: new Date().toISOString(),
        current_cycle_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_subscription_tier: "Free",
        auto_renew: true,
        created_at: new Date().toISOString(),
        tenant: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan) => {
    setUpgrading(true)
    try {
      const response = await api.post("/billings/upgrade/", { subscription_tier: plan })
      if (response.data.success) {
        toast.success(`Successfully upgraded to ${plan} plan!`)
        fetchSubscription()
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      toast.error("Failed to upgrade subscription")
    } finally {
      setUpgrading(false)
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
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan and billing</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </div>
            <Badge
              className={
                subscription?.subscription_tier === "Free"
                  ? "bg-gray-100 text-gray-800"
                  : subscription?.subscription_tier === "Pro"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
              }
            >
              {subscription?.subscription_tier} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Current Cycle Start</p>
              <p className="text-sm text-muted-foreground">
                {subscription?.current_cycle_start_date
                  ? new Date(subscription.current_cycle_start_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Current Cycle End</p>
              <p className="text-sm text-muted-foreground">
                {subscription?.current_cycle_end_date
                  ? new Date(subscription.current_cycle_end_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Next Subscription Tier</p>
              <p className="text-sm text-muted-foreground">{subscription?.next_subscription_tier || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Auto Renew</p>
              <p className="text-sm text-muted-foreground">{subscription?.auto_renew ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free Plan */}
        <Card className={subscription?.subscription_tier === "Free" ? "border-green-500" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For individuals and small teams</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>2 Projects</span>
              </li>
            </ul>
            <Button
              variant={subscription?.subscription_tier === "Free" ? "outline" : "default"}
              className="w-full"
              disabled={subscription?.subscription_tier === "Free"}
            >
              {subscription?.subscription_tier === "Free" ? "Current Plan" : "Downgrade"}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={subscription?.subscription_tier === "Pro" ? "border-green-500" : ""}>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing teams and organizations</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>5 Projects</span>
              </li>
            </ul>
            <Button
              variant={subscription?.subscription_tier === "Pro" ? "outline" : "default"}
              className="w-full"
              disabled={subscription?.subscription_tier === "Pro" || upgrading}
              onClick={() => handleUpgrade("Pro")}
            >
              {upgrading && subscription?.subscription_tier !== "Pro" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : subscription?.subscription_tier === "Pro" ? (
                "Current Plan"
              ) : subscription?.subscription_tier === "Enterprise" ? (
                "Downgrade"
              ) : (
                "Upgrade"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card className={subscription?.subscription_tier === "Enterprise" ? "border-green-500" : ""}>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>For large organizations with advanced needs</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">$29.99</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Unlimited Projects</span>
              </li>
            </ul>
            <Button
              variant={subscription?.subscription_tier === "Enterprise" ? "outline" : "default"}
              className="w-full"
              disabled={subscription?.subscription_tier === "Enterprise" || upgrading}
              onClick={() => handleUpgrade("Enterprise")}
            >
              {upgrading && subscription?.subscription_tier !== "Enterprise" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : subscription?.subscription_tier === "Enterprise" ? (
                "Current Plan"
              ) : (
                "Upgrade"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
