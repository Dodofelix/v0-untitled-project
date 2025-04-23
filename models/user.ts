export interface User {
  id: string
  email: string
  name?: string
  photoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  status: "active" | "canceled" | "past_due"
  priceId: string
  quantity: number
  createdAt: Date
  periodEnd: Date
  remainingCredits: number
}

export interface PhotoEnhancement {
  id: string
  userId: string
  originalUrl: string
  enhancedUrl: string
  createdAt: Date
  status: "processing" | "completed" | "failed"
}
