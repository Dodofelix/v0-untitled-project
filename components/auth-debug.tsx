"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/firebase"

export default function AuthDebug() {
  const { user, firebaseInitialized } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "Não definido",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "Não definido",
    projectId: process.env.FIREBASE_PROJECT_ID || "Não definido",
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? "Fechar Debug" : "Debug Auth"}
      </Button>

      {showDebug && (
        <Card className="mt-2 w-80">
          <CardHeader>
            <CardTitle>Auth Debug</CardTitle>
            <CardDescription>Informações de depuração de autenticação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <p className="font-medium">Firebase Inicializado:</p>
              <p>{firebaseInitialized ? "Sim" : "Não"}</p>
            </div>
            <div>
              <p className="font-medium">Auth Domain:</p>
              <p>{firebaseConfig.authDomain}</p>
            </div>
            <div>
              <p className="font-medium">Auth Tenant ID:</p>
              <p>{auth?.tenantId || "Não definido"}</p>
            </div>
            <div>
              <p className="font-medium">Usuário Logado:</p>
              <p>{user ? "Sim" : "Não"}</p>
            </div>
            {user && (
              <>
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="font-medium">UID:</p>
                  <p>{user.uid}</p>
                </div>
                <div>
                  <p className="font-medium">Método de Login:</p>
                  <p>{user.providerData[0]?.providerId || "Desconhecido"}</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Este componente só é visível em ambiente de desenvolvimento
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
