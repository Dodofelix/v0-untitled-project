"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const { signIn, googleSignIn, firebaseInitialized } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar se há um parâmetro de redirecionamento
    if (searchParams) {
      const redirect = searchParams.get("redirect")
      if (redirect) {
        setRedirectPath(redirect)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta ao PhotoEnhance AI!",
      })

      // Redirecionar para a página solicitada ou para o dashboard
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Login error:", err)

      // Mensagens de erro mais amigáveis
      if (err.code === "auth/invalid-email") {
        setError("Endereço de e-mail inválido. Por favor, verifique e tente novamente.")
      } else if (err.code === "auth/user-not-found") {
        setError("Nenhuma conta encontrada com este e-mail. Por favor, verifique ou crie uma nova conta.")
      } else if (err.code === "auth/wrong-password") {
        setError("Senha incorreta. Por favor, tente novamente ou redefina sua senha.")
      } else if (err.code === "auth/invalid-api-key") {
        setError("Erro de configuração de autenticação. Por favor, entre em contato com o suporte.")
      } else {
        setError(err.message || "Falha ao fazer login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsGoogleLoading(true)

    try {
      await googleSignIn()
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta ao PhotoEnhance AI!",
      })

      // Redirecionar para a página solicitada ou para o dashboard
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Google Sign In Error:", err)

      // Mensagens de erro mais amigáveis
      if (err.message.includes("auth-domain-config-required") || err.message.includes("Authentication domain")) {
        setError(
          "O domínio de autenticação do Firebase não está configurado corretamente. Entre em contato com o suporte.",
        )
      } else if (err.message.includes("invalid-api-key")) {
        setError("A chave de API do Firebase é inválida. Entre em contato com o suporte.")
      } else if (err.message.includes("redirect_uri_mismatch")) {
        setError(
          "Incompatibilidade de domínio de autenticação. Certifique-se de estar acessando o site a partir de um domínio autorizado.",
        )
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("O popup de login foi fechado. Por favor, tente novamente.")
      } else if (err.code === "auth/popup-blocked") {
        setError(
          "O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site e tente novamente.",
        )
      } else {
        setError(err.message || "Falha ao fazer login com o Google")
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para continuar
            {redirectPath && " e finalizar sua compra"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!firebaseInitialized && (
            <Alert
              variant="warning"
              className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            >
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                A autenticação do Firebase não está inicializada. Alguns recursos podem não funcionar corretamente.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/reset-password" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !firebaseInitialized}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || !firebaseInitialized}
          >
            {isGoogleLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                Entrando...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : "/register"}
              className="text-primary hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
