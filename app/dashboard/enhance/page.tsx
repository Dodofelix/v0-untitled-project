"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadImage, saveEnhancedImage } from "@/lib/storage"
import {
  createPhotoEnhancement,
  updatePhotoEnhancement,
  getUserSubscription,
  updateSubscriptionCredits,
} from "@/lib/firestore"
import type { Subscription } from "@/models/user"
import ClientImage from "@/components/client-image"
import EnhanceImageComparison from "@/components/enhance-image-comparison"
// First, import the compression utility
import { compressImage, formatFileSize } from "@/lib/image-utils"

export default function EnhancePage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  // Add a file size state
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [originalFileSize, setOriginalFileSize] = useState<string | null>(null)
  const [compressedFileSize, setCompressedFileSize] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const userSubscription = await getUserSubscription(user.uid)
          setSubscription(userSubscription)
        } catch (error) {
          console.error("Error fetching subscription:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchSubscription()
  }, [user])

  const validateFile = (file: File): boolean => {
    // Check file size (15MB limit)
    const MAX_FILE_SIZE = 15 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the maximum limit of 15MB.`)
      return false
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.")
      return false
    }

    return true
  }

  // Update the handleFileChange function to compress images
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Store original file size
      setOriginalFileSize(formatFileSize(selectedFile.size))

      if (!validateFile(selectedFile)) {
        return
      }

      try {
        // Show loading state while compressing
        setIsProcessing(true)

        // Compress the image (max 5MB, 70% quality)
        const compressed = await compressImage(selectedFile, 5, 0.7)

        // Update file size information
        setCompressedFileSize(formatFileSize(compressed.size))
        setFileSize(`${formatFileSize(compressed.size)} (compressed from ${formatFileSize(selectedFile.size)})`)

        // Reset previous state
        setFile(compressed)
        setPreviewUrl(URL.createObjectURL(compressed))
        setEnhancedUrl(null)
        setError(null)
      } catch (error) {
        console.error("Error compressing image:", error)
        // Fall back to original file if compression fails
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setFileSize(formatFileSize(selectedFile.size))
      } finally {
        setIsProcessing(false)
      }
    }
  }

  // Update the handleDrop function to compress images
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      // Store original file size
      setOriginalFileSize(formatFileSize(droppedFile.size))

      if (!validateFile(droppedFile)) {
        return
      }

      try {
        // Show loading state while compressing
        setIsProcessing(true)

        // Compress the image (max 5MB, 70% quality)
        const compressed = await compressImage(droppedFile, 5, 0.7)

        // Update file size information
        setCompressedFileSize(formatFileSize(compressed.size))
        setFileSize(`${formatFileSize(compressed.size)} (compressed from ${formatFileSize(droppedFile.size)})`)

        // Reset previous state
        setFile(compressed)
        setPreviewUrl(URL.createObjectURL(compressed))
        setEnhancedUrl(null)
        setError(null)
      } catch (error) {
        console.error("Error compressing image:", error)
        // Fall back to original file if compression fails
        setFile(droppedFile)
        setPreviewUrl(URL.createObjectURL(droppedFile))
        setFileSize(formatFileSize(droppedFile.size))
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Call the API route instead of directly using OpenAI
  const callEnhanceAPI = async (imageUrl: string) => {
    console.log("Calling enhance API with image URL...")

    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Get the response text first for debugging
      const responseText = await response.text()
      console.log("API response text:", responseText)

      // Try to parse the response as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("API response parsed:", data)
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error("Invalid response from server: " + responseText.substring(0, 100))
      }

      // Check if we have an error but also a fallback URL
      if (data.error && data.fallback && data.enhancedImageUrl) {
        console.warn("API returned an error but provided fallback:", data.error)
        toast({
          title: "Enhancement limited",
          description: data.error,
          variant: "warning",
        })
        return data.enhancedImageUrl
      }

      // Check if we have the enhanced image URL
      if (!data.enhancedImageUrl) {
        console.error("No enhanced image URL in response:", data)
        throw new Error(data.error || "No enhanced image URL returned")
      }

      return data.enhancedImageUrl
    } catch (error) {
      console.error("Error in callEnhanceAPI:", error)
      // Return the original image as fallback in case of error
      console.log("Returning original image as fallback")
      return imageUrl
    }
  }

  const handleEnhance = async () => {
    if (!file || !user) return

    // Check if user has credits
    if (!subscription || subscription.remainingCredits <= 0) {
      setError("You have no credits left. Please purchase a subscription.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Upload original image to Firebase Storage
      const { downloadUrl: originalUrl, fileName } = await uploadImage(user.uid, file)

      // Create a record in Firestore
      const enhancementId = await createPhotoEnhancement({
        userId: user.uid,
        originalUrl,
        status: "processing",
      })

      // Call API to enhance the image instead of directly using OpenAI
      const enhancedImageUrl = await callEnhanceAPI(originalUrl)

      // Save the enhanced image to Firebase Storage
      const { downloadUrl: storedEnhancedUrl } = await saveEnhancedImage(user.uid, enhancedImageUrl, fileName)

      // Update the record in Firestore
      await updatePhotoEnhancement(enhancementId, {
        enhancedUrl: storedEnhancedUrl,
        status: "completed",
      })

      // Update user's subscription credits
      await updateSubscriptionCredits(subscription.id, -1)

      // Update UI
      setEnhancedUrl(storedEnhancedUrl)

      toast({
        title: "Photo enhanced successfully",
        description: "Your photo has been enhanced and is ready to download.",
      })
    } catch (error) {
      console.error("Error enhancing image:", error)
      setError("Failed to enhance the image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Update the handleReset function to clear file size
  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setEnhancedUrl(null)
    setError(null)
    setFileSize(null)
    setOriginalFileSize(null)
    setCompressedFileSize(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enhance Photos</h1>
        <p className="text-muted-foreground">Upload a photo and let our AI enhance it for you.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Photo</CardTitle>
            <CardDescription>
              Envie suas fotos para que nossa IA Avançada torne elas em fotografias profissionais para seu negócio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full aspect-square">
                  <ClientImage src={previewUrl} alt="Preview" className="object-contain w-full h-full" />
                  {fileSize && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {fileSize}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag and drop your photo here, or click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tamanho máximo: 15MB. Formatos: JPG, PNG
                    <br />
                    As imagens serão comprimidas automaticamente para melhor desempenho
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="hidden"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset} disabled={isProcessing || !file}>
              Reset
            </Button>
            <Button onClick={handleEnhance} disabled={isProcessing || !file}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Enhance Photo"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enhanced Result</CardTitle>
            <CardDescription>Your enhanced photo will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Enhancing your photo...</p>
                </div>
              ) : previewUrl && enhancedUrl ? (
                <EnhanceImageComparison previewUrl={previewUrl} enhancedUrl={enhancedUrl} />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">Enhanced photo will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {enhancedUrl && (
              <Button asChild className="w-full">
                <a href={enhancedUrl} download="enhanced-photo.png">
                  Download Enhanced Photo
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credits Remaining</CardTitle>
          <CardDescription>
            You have {subscription?.remainingCredits || 0} photo enhancement credits remaining.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.remainingCredits ? (
            <p className="text-sm">
              Each photo enhancement uses 1 credit. You can enhance {subscription.remainingCredits} more photos with
              your current subscription.
            </p>
          ) : (
            <p className="text-sm">You have no credits left. Please purchase a subscription to enhance more photos.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant={subscription?.remainingCredits ? "outline" : "default"} className="w-full">
            <a href="/dashboard/subscription">
              {subscription?.remainingCredits ? "Manage Subscription" : "Get More Credits"}
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
