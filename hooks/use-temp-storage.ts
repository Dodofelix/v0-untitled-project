"use client"

import { useState, useCallback, useEffect } from "react"

interface StoredImage {
  originalUrl: string | null
  enhancedUrl: string | null
  originalThumbnail?: string | null
  enhancedThumbnail?: string | null
  timestamp: number
}

export function useTempStorage() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(typeof window !== "undefined")
  }, [])

  // Function to create a thumbnail from a base64 image
  const createThumbnail = useCallback(async (base64Image: string): Promise<string | null> => {
    if (!base64Image || !base64Image.startsWith("data:")) return null

    try {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          // Create a small thumbnail (100x100 pixels)
          const canvas = document.createElement("canvas")
          const MAX_THUMB_SIZE = 100

          // Calculate thumbnail dimensions while maintaining aspect ratio
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_THUMB_SIZE) {
              height = Math.round(height * (MAX_THUMB_SIZE / width))
              width = MAX_THUMB_SIZE
            }
          } else {
            if (height > MAX_THUMB_SIZE) {
              width = Math.round(width * (MAX_THUMB_SIZE / height))
              height = MAX_THUMB_SIZE
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw the image at the reduced size
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            // Get the thumbnail as base64
            const thumbnailBase64 = canvas.toDataURL("image/jpeg", 0.5) // Use JPEG with 50% quality
            resolve(thumbnailBase64)
          } else {
            resolve(null)
          }
        }

        img.onerror = () => resolve(null)
        img.src = base64Image
      })
    } catch (error) {
      console.error("Error creating thumbnail:", error)
      return null
    }
  }, [])

  // Store only image references or small thumbnails
  const storeImage = useCallback(
    async (image: StoredImage) => {
      if (!isReady) return

      try {
        // Create thumbnails for preview
        let originalThumbnail = null
        let enhancedThumbnail = null

        if (image.originalUrl && image.originalUrl.startsWith("data:")) {
          originalThumbnail = await createThumbnail(image.originalUrl)
        }

        if (image.enhancedUrl && image.enhancedUrl.startsWith("data:")) {
          enhancedThumbnail = await createThumbnail(image.enhancedUrl)
        }

        // Store only the image IDs or URLs, not the full base64 data
        const storageItem = {
          // For base64 images, we'll store only thumbnails
          originalUrl: image.originalUrl?.startsWith("data:") ? null : image.originalUrl,
          enhancedUrl: image.enhancedUrl?.startsWith("data:") ? null : image.enhancedUrl,
          originalThumbnail,
          enhancedThumbnail,
          timestamp: image.timestamp,
        }

        // Get existing images
        const storedImagesJson = localStorage.getItem("tempImages")
        const storedImages: StoredImage[] = storedImagesJson ? JSON.parse(storedImagesJson) : []

        // Add new image
        const updatedImages = [...storedImages, storageItem]

        // Limit to 3 images to save space
        const limitedImages = updatedImages.slice(-3)

        // Save to localStorage with error handling
        try {
          localStorage.setItem("tempImages", JSON.stringify(limitedImages))
        } catch (storageError) {
          console.error("Storage quota exceeded, clearing old data and trying again")

          // If we hit quota limits, clear everything and try to save just the latest
          localStorage.removeItem("tempImages")
          try {
            localStorage.setItem("tempImages", JSON.stringify([storageItem]))
          } catch (finalError) {
            console.error("Still unable to store data in localStorage:", finalError)
            // At this point, we can't use localStorage at all
          }
        }
      } catch (error) {
        console.error("Error storing image in localStorage:", error)
      }
    },
    [isReady, createThumbnail],
  )

  const getStoredImages = useCallback(async (): Promise<StoredImage[]> => {
    if (!isReady) return []

    try {
      const storedImagesJson = localStorage.getItem("tempImages")
      return storedImagesJson ? JSON.parse(storedImagesJson) : []
    } catch (error) {
      console.error("Error retrieving images from localStorage:", error)
      return []
    }
  }, [isReady])

  const clearStorage = useCallback(() => {
    if (!isReady) return

    try {
      localStorage.removeItem("tempImages")
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }, [isReady])

  return {
    storeImage,
    getStoredImages,
    clearStorage,
    isReady,
  }
}
