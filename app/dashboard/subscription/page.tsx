"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Check, CreditCard } from "lucide-react"
import { getUserSubscription } from "@/lib/firestore"
import { getStripeSession } from "@/lib/stripe"
import type { Subscription } from "@/models/user"

const pricingPlans = [
  {
    name: "Basic",
    price: "R$ 47.90",
    description: "Perfect for beginners",
    features: ["5 enhanced photos", "High-quality results", "Secure cloud storage", "Download in full resolution"],
    priceId: "price_basic",
    credits: 5,
  },
  {
    name: "Standard",
    price: "R$ 77.90",
    description: "Most popular choice",
    features: [
      "10 enhanced photos",
      "High-quality results",
      "Secure cloud storage",
      "Download in full resolution",
      "Priority processing",
    ],
    priceId: "price_standard",
    credits: 10,
    popular: true,
  },
  {
    name: "Premium",
    price: "R$ 111.70",
    description: "For photo enthusiasts",
    features: [
      "15 enhanced photos",
      "High-quality results",
      "Secure cloud storage",
      "Download in full resolution",
      "Priority processing",
      "Advanced enhancement options",
    ],
    priceId: "price_premium",
    credits: 15,
  },
  {
    name: "Pro",
    price: "R$ 137.90",
    description: "For professionals",
    features: [
      "20 enhanced photos",
      "High-quality results",
      "Secure cloud storage",
      "Download in full resolution",
      "Priority processing",
      "Advanced enhancement options",
      "Email support",
    ],
    priceId: "price_pro",
    credits: 20,
  },
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [isParamsReady, setIsParamsReady] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Verificar parâmetros de URL de forma segura
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar se searchParams está disponível
    if (searchParams) {
      setIsParamsReady(true)

      // Verificar parâmetros de sucesso/erro
      const success = searchParams.get("success")
      const canceled = searchParams.get("canceled")

      if (success === "true") {
        setSuccessMessage("Payment successful! Your subscription has been activated.")
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated successfully.",
          variant: "default",
        })
      }

      if (canceled === "true") {
        setErrorMessage("Payment was canceled. Your subscription has not been activated.")
        toast({
          title: "Payment Canceled",
          description: "Your subscription has not been activated.",
          variant: "destructive",
        })
      }
    }
  }, [searchParams, toast])

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const userSubscription = await getUserSubscription(user.uid)
          setSubscription(userSubscription)
        } catch (error) {
          console.error("Error fetching subscription:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchSubscription()
  }, [user])

  const handleCheckout = async (priceId: string) => {
    if (!user) return

    setCheckoutLoading(priceId)

    try {
      const session = await getStripeSession(priceId, user.uid)

      // Verificar se a sessão e a URL existem antes de redirecionar
      if (session && session.url) {
        window.location.href = session.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
      })
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and credits.</p>
      </div>

      {successMessage && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <p className="text-green-800 dark:text-green-400">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-800 dark:text-red-400">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your current subscription details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm">{subscription.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Remaining Credits</p>
                <p className="text-sm">{subscription.remainingCredits}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Valid Until</p>
                <p className="text-sm">{new Date(subscription.periodEnd).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`overflow-hidden ${plan.popular ? "border-purple-500 dark:border-purple-400" : ""}`}
            >
              {plan.popular && (
                <div className="bg-purple-500 text-white text-xs font-medium px-3 py-1 text-center">MOST POPULAR</div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{plan.price}</div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={checkoutLoading === plan.priceId}
                >
                  {checkoutLoading === plan.priceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
