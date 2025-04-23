"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  browserPopupRedirectResolver,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  googleSignIn: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)
        setInitialized(true)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error in auth state change:", error)
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      throw error
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()

      // Adicionar escopo para o email
      provider.addScope("email")

      // Usar o resolver de popup explicitamente
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver)

      // Verificar se o login foi bem-sucedido
      if (result.user) {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error)

      // Mensagens de erro mais específicas
      if (error.code === "auth/auth-domain-config-required") {
        throw new Error("Authentication domain not configured. Please contact support.")
      } else if (error.code === "auth/popup-blocked") {
        throw new Error("Popup was blocked by your browser. Please allow popups for this site.")
      } else if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Authentication popup was closed before completing the sign in process.")
      } else {
        throw error
      }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw error
    }
  }

  // Renderizar um estado de carregamento até que a autenticação seja inicializada
  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">Initializing...</div>
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logOut, googleSignIn, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
