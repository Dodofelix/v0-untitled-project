"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserSubscription, getUserPhotoEnhancements } from "@/lib/firestore"
import type { Subscription, PhotoEnhancement } from "@/models/user"
import { Loader2, ImageIcon, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"
import DashboardImageComparison from "@/components/dashboard-image-comparison"

export default function DashboardPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [recentEnhancements, setRecentEnhancements] = useState<PhotoEnhancement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [userSubscription, userEnhancements] = await Promise.all([
            getUserSubscription(user.uid),
            getUserPhotoEnhancements(user.uid),
          ])

          setSubscription(userSubscription)
          setRecentEnhancements(userEnhancements.slice(0, 5))
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user])

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
        <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.displayName || user?.email?.split("@")[0] || "Usuário"}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription?.remainingCredits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {subscription ? `${subscription.remainingCredits} fotos restantes` : "Sem assinatura ativa"}
            </p>
            {!subscription && (
              <Button asChild className="mt-4 w-full">
                <Link href="/dashboard/subscription">Obter Créditos</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fotos Aprimoradas</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEnhancements.length}</div>
            <p className="text-xs text-muted-foreground">
              {recentEnhancements.length > 0
                ? `Última aprimorada em ${new Date(recentEnhancements[0].createdAt).toLocaleDateString()}`
                : "Nenhuma foto aprimorada ainda"}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/enhance">Aprimorar Fotos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Assinatura</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription ? "Ativa" : "Inativa"}</div>
            <p className="text-xs text-muted-foreground">
              {subscription
                ? `Válida até ${new Date(subscription.periodEnd).toLocaleDateString()}`
                : "Sem assinatura ativa"}
            </p>
            <Button asChild className="mt-4 w-full" variant={subscription ? "outline" : "default"}>
              <Link href="/dashboard/subscription">{subscription ? "Gerenciar Assinatura" : "Obter Assinatura"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Aprimoramentos Recentes</h2>
        {recentEnhancements.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentEnhancements.map((enhancement) => (
              <Card key={enhancement.id}>
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <DashboardImageComparison
                      originalUrl={enhancement.originalUrl}
                      enhancedUrl={enhancement.enhancedUrl}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Aprimorada em {new Date(enhancement.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Passe o mouse para revelar a transformação</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma foto aprimorada ainda</CardTitle>
              <CardDescription>Comece a aprimorar suas fotos para vê-las aqui.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/enhance">
                  Aprimorar Fotos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
