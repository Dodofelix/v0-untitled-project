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
  firebaseInitialized: boolean
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
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      // Verificar se o auth está disponível e inicializado
      if (!auth || !auth.onAuthStateChanged) {
        console.error("Firebase auth is not initialized properly")
        setLoading(false)
        setInitialized(true)
        return () => {}
      }

      setFirebaseInitialized(true)

      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser)
          setLoading(false)
          setInitialized(true)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setAuthError(error)
          setLoading(false)
          setInitialized(true)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setAuthError(error as Error)
      setLoading(false)
      setInitialized(true)
      return () => {}
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized. Please check your configuration.")
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized. Please check your configuration.")
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const logOut = async () => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized. Please check your configuration.")
    }

    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const googleSignIn = async () => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized. Please check your configuration.")
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("email")

      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver)

      if (result.user) {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)

      if (error.code === "auth/invalid-api-key") {
        throw new Error("Firebase API key is invalid. Please check your configuration.")
      } else if (error.code === "auth/auth-domain-config-required") {
        throw new Error("Authentication domain not configured. Please contact support.")
      } else {
        throw error
      }
    }
  }

  const resetPassword = async (email: string) => {
    if (!firebaseInitialized) {
      throw new Error("Firebase authentication is not initialized. Please check your configuration.")
    }

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  // Renderizar um estado de carregamento até que a autenticação seja inicializada
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Initializing...</p>
        </div>
      </div>
    )
  }

  // Renderizar um erro se a inicialização falhou
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Authentication Error</h2>
          <p className="mb-4">{authError.message}</p>
          <p className="text-sm">
            Please check your Firebase configuration and make sure all environment variables are set correctly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseInitialized,
        signIn,
        signUp,
        logOut,
        googleSignIn,
        resetPassword,
      }}
    >
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
