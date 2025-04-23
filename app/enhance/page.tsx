"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, ImageIcon, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadImage, saveEnhancedImage } from "@/lib/storage"
import { createPhotoEnhancement, updatePhotoEnhancement } from "@/lib/firestore"
import ClientImage from "@/components/client-image"
import EnhanceImageComparison from "@/components/enhance-image-comparison"
import { compressImage, formatFileSize } from "@/lib/image-utils"

// Maximum file size in bytes (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024

export default function PublicEnhancePage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Add file size states
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [originalFileSize, setOriginalFileSize] = useState<string | null>(null)
  const [compressedFileSize, setCompressedFileSize] = useState<string | null>(null)

  // Store the full base64 images in memory
  const [currentSessionImages, setCurrentSessionImages] = useState<{
    originalFull: string | null
    enhancedFull: string | null
  }>({
    originalFull: null,
    enhancedFull: null,
  })

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      return false
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.")
      return false
    }

    return true
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Clear previous states
    setError(null)
    setEnhancedUrl(null)

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

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(compressed)
      setPreviewUrl(objectUrl)
      setFile(compressed)

      // Convert to base64 for API processing
      const reader = new FileReader()
      reader.onloadend = () => {
        setCurrentSessionImages((prev) => ({
          ...prev,
          originalFull: reader.result as string,
        }))
      }
      reader.readAsDataURL(compressed)
    } catch (error) {
      console.error("Error processing image:", error)
      // Fall back to original file if compression fails
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setFileSize(formatFileSize(selectedFile.size))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    // Clear previous states
    setError(null)
    setEnhancedUrl(null)

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

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(compressed)
      setPreviewUrl(objectUrl)
      setFile(compressed)

      // Convert to base64 for API processing
      const reader = new FileReader()
      reader.onloadend = () => {
        setCurrentSessionImages((prev) => ({
          ...prev,
          originalFull: reader.result as string,
        }))
      }
      reader.readAsDataURL(compressed)
    } catch (error) {
      console.error("Error processing image:", error)
      // Fall back to original file if compression fails
      setFile(droppedFile)
      setPreviewUrl(URL.createObjectURL(droppedFile))
      setFileSize(formatFileSize(droppedFile.size))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const callEnhanceAPI = async (imageUrl: string): Promise<string> => {
    console.log("Calling enhance API...")

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

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

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
        throw new Error(data.error || "No enhanced image URL returned")
      }

      return data.enhancedImageUrl
    } catch (error) {
      console.error("Error in callEnhanceAPI:", error)
      throw error
    }
  }

  const handleEnhance = async () => {
    if (!file && !currentSessionImages.originalFull) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // If user is authenticated, use the normal flow with Firebase
      if (user) {
        if (!file) throw new Error("No file available")

        // Upload original image to Firebase Storage
        const { downloadUrl: originalUrl, fileName } = await uploadImage(user.uid, file)

        // Create a record in Firestore
        const enhancementId = await createPhotoEnhancement({
          userId: user.uid,
          originalUrl,
          status: "processing",
        })

        // Call API to enhance the image
        const enhancedImageUrl = await callEnhanceAPI(originalUrl)

        // Save the enhanced image to Firebase Storage
        const { downloadUrl: storedEnhancedUrl } = await saveEnhancedImage(user.uid, enhancedImageUrl, fileName)

        // Update the record in Firestore
        await updatePhotoEnhancement(enhancementId, {
          enhancedUrl: storedEnhancedUrl,
          status: "completed",
        })

        // Update UI
        setEnhancedUrl(storedEnhancedUrl)
        setIsReady(true)
      } else {
        // For unauthenticated users, use base64 and in-memory storage
        const imageToProcess = currentSessionImages.originalFull || previewUrl

        if (!imageToProcess) {
          throw new Error("No image data available")
        }

        // Call the API to enhance the image
        const enhancedImageUrl = await callEnhanceAPI(imageToProcess)

        // If the response is a URL, fetch the image and convert to base64
        if (enhancedImageUrl.startsWith("http")) {
          const response = await fetch(enhancedImageUrl)
          const blob = await response.blob()

          const reader = new FileReader()
          reader.onloadend = () => {
            const enhancedBase64 = reader.result as string
            setCurrentSessionImages((prev) => ({
              ...prev,
              enhancedFull: enhancedBase64,
            }))
            setEnhancedUrl(enhancedBase64)
            setIsReady(true)
          }
          reader.readAsDataURL(blob)
        } else {
          // If already base64, use directly
          setCurrentSessionImages((prev) => ({
            ...prev,
            enhancedFull: enhancedImageUrl,
          }))
          setEnhancedUrl(enhancedImageUrl)
          setIsReady(true)
        }
      }

      toast({
        title: "Foto aprimorada com sucesso!",
        description: "Sua foto foi aprimorada e está pronta para visualização.",
      })
    } catch (error: any) {
      console.error("Error enhancing image:", error)
      setError(error.message || "Falha ao aprimorar a imagem. Por favor, tente novamente.")

      toast({
        title: "Erro ao aprimorar imagem",
        description: error.message || "Ocorreu um erro ao processar sua imagem",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setEnhancedUrl(null)
    setError(null)
    setIsReady(false)
    setFileSize(null)
    setOriginalFileSize(null)
    setCompressedFileSize(null)
    setCurrentSessionImages({
      originalFull: null,
      enhancedFull: null,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProceedToCheckout = () => {
    if (user) {
      // If user is already authenticated, go directly to checkout
      router.push("/checkout?plan=price_basic")
    } else {
      // If not authenticated, redirect to login with redirect parameter
      router.push("/login?redirect=/checkout?plan=price_basic")
    }
  }

  // For downloads, use the full images from memory if available
  const getDownloadUrl = () => {
    if (currentSessionImages.enhancedFull) {
      return currentSessionImages.enhancedFull
    }
    return enhancedUrl || ""
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Aprimoramento de Fotos com IA</h1>
            <p className="text-muted-foreground mt-2">Transforme suas fotos com nossa tecnologia de IA avançada</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Envie sua Foto</CardTitle>
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
                        Arraste e solte sua foto aqui, ou clique para selecionar um arquivo
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
                  Limpar
                </Button>
                <Button onClick={handleEnhance} disabled={isProcessing || !file}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Aprimorar Foto"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado Aprimorado</CardTitle>
                <CardDescription>Sua foto aprimorada aparecerá aqui.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Aprimorando sua foto...</p>
                    </div>
                  ) : previewUrl && enhancedUrl ? (
                    <EnhanceImageComparison
                      previewUrl={currentSessionImages.originalFull || previewUrl}
                      enhancedUrl={currentSessionImages.enhancedFull || enhancedUrl}
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground text-center">A foto aprimorada aparecerá aqui</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {enhancedUrl && (
                  <>
                    <Button asChild className="w-full">
                      <a href={getDownloadUrl()} download="enhanced-photo.png">
                        Baixar Foto Aprimorada
                      </a>
                    </Button>
                    <Button onClick={handleProceedToCheckout} className="w-full" variant="default">
                      Continuar para o Checkout
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>

          {isReady && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Pronto para Mais?</CardTitle>
                <CardDescription>Aprimore mais fotos com nossos planos acessíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Sua foto foi aprimorada com sucesso! Escolha um plano para continuar aprimorando mais fotos.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium">Básico</h3>
                      <p className="text-2xl font-bold my-2">R$ 47,90</p>
                      <p className="text-sm text-muted-foreground">5 fotos</p>
                      <Button onClick={() => handleProceedToCheckout()} className="mt-4 w-full" size="sm">
                        Escolher
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 text-center border-purple-500 dark:border-purple-400 relative">
                      <div className="absolute top-0 right-0 left-0 bg-purple-500 text-white text-xs py-1">POPULAR</div>
                      <h3 className="font-medium mt-2">Padrão</h3>
                      <p className="text-2xl font-bold my-2">R$ 77,90</p>
                      <p className="text-sm text-muted-foreground">10 fotos</p>
                      <Button
                        onClick={() => {
                          if (user) {
                            router.push("/checkout?plan=price_standard")
                          } else {
                            router.push("/login?redirect=/checkout?plan=price_standard")
                          }
                        }}
                        className="mt-4 w-full"
                        size="sm"
                      >
                        Escolher
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium">Premium</h3>
                      <p className="text-2xl font-bold my-2">R$ 111,70</p>
                      <p className="text-sm text-muted-foreground">15 fotos</p>
                      <Button
                        onClick={() => {
                          if (user) {
                            router.push("/checkout?plan=price_premium")
                          } else {
                            router.push("/login?redirect=/checkout?plan=price_premium")
                          }
                        }}
                        className="mt-4 w-full"
                        size="sm"
                      >
                        Escolher
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium">Pro</h3>
                      <p className="text-2xl font-bold my-2">R$ 137,90</p>
                      <p className="text-sm text-muted-foreground">20 fotos</p>
                      <Button
                        onClick={() => {
                          if (user) {
                            router.push("/checkout?plan=price_pro")
                          } else {
                            router.push("/login?redirect=/checkout?plan=price_pro")
                          }
                        }}
                        className="mt-4 w-full"
                        size="sm"
                      >
                        Escolher
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
