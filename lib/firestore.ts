import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  increment,
} from "firebase/firestore"
import type { User, Subscription, PhotoEnhancement } from "@/models/user"

// User functions
export const createUser = async (userId: string, userData: Partial<User>) => {
  const userRef = doc(db, "users", userId)
  const now = Timestamp.now()

  await setDoc(
    userRef,
    {
      ...userData,
      id: userId,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  )
}

export const getUser = async (userId: string) => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return userSnap.data() as User
  }

  return null
}

// Subscription functions
export const createSubscription = async (subscriptionData: Partial<Subscription>) => {
  const subscriptionRef = doc(collection(db, "subscriptions"))
  const now = Timestamp.now()

  await setDoc(subscriptionRef, {
    ...subscriptionData,
    id: subscriptionRef.id,
    createdAt: now,
    status: "active",
  })

  return subscriptionRef.id
}

export const getUserSubscription = async (userId: string) => {
  const subscriptionsRef = collection(db, "subscriptions")
  const q = query(
    subscriptionsRef,
    where("userId", "==", userId),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(1),
  )

  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Subscription
  }

  return null
}

export const updateSubscriptionCredits = async (subscriptionId: string, credits: number) => {
  const subscriptionRef = doc(db, "subscriptions", subscriptionId)
  await updateDoc(subscriptionRef, {
    remainingCredits: increment(credits),
  })
}

// Photo enhancement functions
export const createPhotoEnhancement = async (enhancementData: Partial<PhotoEnhancement>) => {
  const enhancementRef = doc(collection(db, "photoEnhancements"))
  const now = Timestamp.now()

  await setDoc(enhancementRef, {
    ...enhancementData,
    id: enhancementRef.id,
    createdAt: now,
    status: "processing",
  })

  return enhancementRef.id
}

export const updatePhotoEnhancement = async (enhancementId: string, data: Partial<PhotoEnhancement>) => {
  const enhancementRef = doc(db, "photoEnhancements", enhancementId)
  await updateDoc(enhancementRef, {
    ...data,
  })
}

export const getUserPhotoEnhancements = async (userId: string) => {
  const enhancementsRef = collection(db, "photoEnhancements")
  const q = query(enhancementsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => doc.data() as PhotoEnhancement)
}
