"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Check, ArrowLeft } from "lucide-react"
import { getStripeSession } from "@/lib/stripe"

const pricingPlans = {
  price_basic: {
    name: "Basic",
    price: "R$ 47.90",
    description: "5 enhanced photos",
    credits: 5,
  },
  price_standard: {
    name: "Standard",
    price: "R$ 77.90",
    description: "10 enhanced photos",
    credits: 10,
  },
  price_premium: {
    name: "Premium",
    price: "R$ 111.70",
    description: "15 enhanced photos",
    credits: 15,
  },
  price_pro: {
    name: "Pro",
    price: "R$ 137.90",
    description: "20 enhanced photos",
    credits: 20,
  },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam && Object.keys(pricingPlans).includes(planParam)) {
      setPlan(planParam)
    } else {
      router.push("/dashboard/subscription")
    }
  }, [searchParams, router])

  const handleCheckout = async () => {
    if (!user || !plan) return

    setLoading(true)

    try {
      const session = await getStripeSession(plan, user.uid)

      // Redirect to Stripe Checkout
      window.location.href = session.url as string
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
      })
      setLoading(false)
    }
  }

  if (!plan || !pricingPlans[plan as keyof typeof pricingPlans]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Plan</CardTitle>
            <CardDescription>The selected plan is invalid. Please select a valid plan.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/dashboard/subscription">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Subscription
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const selectedPlan = pricingPlans[plan as keyof typeof pricingPlans]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Complete your purchase to enhance your photos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">{selectedPlan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
              </div>
              <div className="text-xl font-bold">{selectedPlan.price}</div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">{selectedPlan.credits} photo enhancements</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">High-quality results</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Secure cloud storage</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Download in full resolution</span>
              </li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">{selectedPlan.price}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleCheckout} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
          <Button variant="outline" asChild className="w-full">
            <a href="/dashboard/subscription">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subscription
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
