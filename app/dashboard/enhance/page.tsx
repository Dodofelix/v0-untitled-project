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
import { enhanceImage } from "@/lib/openai"
import type { Subscription } from "@/models/user"
import ImageComparisonSlider from "@/components/image-comparison-slider"

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Reset previous state
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setEnhancedUrl(null)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setPreviewUrl(URL.createObjectURL(droppedFile))
      setEnhancedUrl(null)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
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

      // Call OpenAI API to enhance the image
      const enhancedImageUrl = await enhanceImage(originalUrl)

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

  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setEnhancedUrl(null)
    setError(null)
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
              Faça upload de uma foto para aprimorar com iluminação profissional, enquadramento e efeito bokeh
              semelhante a uma lente Canon 50mm f/1.2.
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
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag and drop your photo here, or click to select a file
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
                <div className="relative w-full aspect-square">
                  <ImageComparisonSlider beforeImage={previewUrl} afterImage={enhancedUrl} />
                  <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Deslize para comparar ← →
                  </div>
                </div>
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
