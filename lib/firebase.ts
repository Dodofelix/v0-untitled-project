import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Verificar se estamos no cliente ou no servidor
const isClient = typeof window !== "undefined"

// Usar valores diretos para desenvolvimento local
// Em produção, use as variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAdeTew5i4-e3Lq-EFQUIjRm4wF2plVsU4",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "photo-enhance-ai.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "photo-enhance-ai",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "photo-enhance-ai.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
}

// Verificar se as configurações estão completas e válidas
const isConfigValid =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "undefined" &&
  firebaseConfig.authDomain &&
  firebaseConfig.authDomain !== "undefined" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "undefined"

// Verificar especificamente o authDomain, que é crucial para o erro redirect_uri_mismatch
const hasValidAuthDomain =
  firebaseConfig.authDomain &&
  firebaseConfig.authDomain !== "undefined" &&
  firebaseConfig.authDomain.includes(".firebaseapp.com")

// Inicializar Firebase apenas se a configuração for válida
let app, auth, db, storage

try {
  if (isConfigValid) {
    // Registrar a configuração para depuração (remover em produção)
    if (process.env.NODE_ENV === "development") {
      console.log("Firebase config:", {
        apiKey: firebaseConfig.apiKey ? "Configurado" : "Não configurado",
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        hasValidAuthDomain: hasValidAuthDomain,
      })
    }

    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    // Verificar se o auth foi inicializado corretamente
    if (!auth) {
      throw new Error("Firebase auth could not be initialized")
    }
  } else {
    console.error("Firebase configuration is invalid. Check your environment variables.")

    // Registrar detalhes específicos sobre o que está faltando
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
      console.error("Firebase API key is missing or invalid")
    }
    if (!firebaseConfig.authDomain || firebaseConfig.authDomain === "undefined") {
      console.error("Firebase Auth Domain is missing or invalid")
    }
    if (!hasValidAuthDomain) {
      console.error("Firebase Auth Domain does not appear to be a valid Firebase domain")
    }

    // Criar objetos mock para evitar erros
    if (isClient) {
      // Apenas no cliente, para evitar erros SSR
      const mockApp = { name: "mock-app" }
      app = mockApp as any
      auth = { currentUser: null, onAuthStateChanged: () => () => {} } as any
      db = { collection: () => ({}) } as any
      storage = { ref: () => ({}) } as any
    }
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)

  // Criar objetos mock para evitar erros
  if (isClient) {
    const mockApp = { name: "mock-app" }
    app = mockApp as any
    auth = { currentUser: null, onAuthStateChanged: () => () => {} } as any
    db = { collection: () => ({}) } as any
    storage = { ref: () => ({}) } as any
  }
}

export { app, auth, db, storage }
