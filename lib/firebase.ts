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

// Verificar se as configurações estão completas
const isConfigValid =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "undefined" &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId

// Inicializar Firebase apenas se a configuração for válida
let app, auth, db, storage

try {
  if (isConfigValid) {
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } else {
    console.error("Firebase configuration is invalid. Check your environment variables.")

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
