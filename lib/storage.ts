import { storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export const uploadImage = async (userId: string, file: File) => {
  const fileExtension = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExtension}`
  const storageRef = ref(storage, `images/${fileName}`)

  await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(storageRef)

  return {
    fileName,
    downloadUrl,
  }
}

export const saveEnhancedImage = async (userId: string, imageUrl: string, originalFileName: string) => {
  // For images returned from OpenAI API as URLs
  const response = await fetch(imageUrl)
  const blob = await response.blob()

  const fileExtension = "png" // OpenAI typically returns PNG
  const fileName = `${userId}/enhanced_${Date.now()}.${fileExtension}`
  const storageRef = ref(storage, `enhanced/${fileName}`)

  await uploadBytes(storageRef, blob)
  const downloadUrl = await getDownloadURL(storageRef)

  return {
    fileName,
    downloadUrl,
  }
}
