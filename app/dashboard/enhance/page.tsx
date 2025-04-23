"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveEnhancedImage } from "@/lib/storage"
import {
  createPhotoEnhancement,
  updatePhotoEnhancement,
  getUserSubscription,
  updateSubscriptionCredits,
} from "@/lib/firestore"
import type { Subscription } from "@/models/user"
import ClientImage from "@/components/client-image"
import EnhanceImageComparison from "@/components/enhance-image-comparison"
import { compressImage, formatFileSize } from "@/lib/image-utils"

// Maximum file size in bytes (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024

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

  // Add file size states
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [originalFileSize, setOriginalFileSize] = useState<string | null>(null)
  const [compressedFileSize, setCompressedFileSize] = useState<string | null>(null)

  // Store the base64 image for API processing
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const userSubscription = await getUserSubscription(user.uid)
          setSubscription(userSubscription)
        } catch (error) {
          console.error("Erro ao buscar informações da assinatura:", error)
          toast({
            title: "Erro",
            description: "Falha ao buscar informações da assinatura",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchSubscription()
  }, [user, toast])

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`O tamanho do arquivo excede o limite máximo de ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      return false
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Apenas arquivos de imagem são permitidos.")
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
      setFileSize(`${formatFileSize(compressed.size)} (comprimido de ${formatFileSize(selectedFile.size)})`)

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(compressed)
      setPreviewUrl(objectUrl)
      setFile(compressed)

      // Convert to base64 for API processing
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(compressed)
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      // Fall back to original file if compression fails
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setFileSize(formatFileSize(selectedFile.size))

      // Convert original to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
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
      setFileSize(`${formatFileSize(compressed.size)} (comprimido de ${formatFileSize(droppedFile.size)})`)

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(compressed)
      setPreviewUrl(objectUrl)
      setFile(compressed)

      // Convert to base64 for API processing
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(compressed)
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      // Fall back to original file if compression fails
      setFile(droppedFile)
      setPreviewUrl(URL.createObjectURL(droppedFile))
      setFileSize(formatFileSize(droppedFile.size))

      // Convert original to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(droppedFile)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const callEnhanceAPI = async (imageUrl: string): Promise<string> => {
    console.log("Chamando API de aprimoramento...")

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
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Check if we have an error but also a fallback URL
      if (data.error && data.fallback && data.enhancedImageUrl) {
        console.warn("API retornou um erro mas forneceu fallback:", data.error)
        toast({
          title: "Aprimoramento limitado",
          description: data.error,
          variant: "warning",
        })
        return data.enhancedImageUrl
      }

      // Check if we have the enhanced image URL
      if (!data.enhancedImageUrl) {
        throw new Error(data.error || "Nenhuma URL de imagem aprimorada retornada")
      }

      return data.enhancedImageUrl
    } catch (error) {
      console.error("Erro em callEnhanceAPI:", error)
      throw error
    }
  }

  const handleEnhance = async () => {
    if (!file && !imageBase64) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, envie uma imagem primeiro",
        variant: "destructive",
      })
      return
    }

    // Check if user has credits
    if (!subscription || subscription.remainingCredits <= 0) {
      setError("Você não tem créditos restantes. Por favor, adquira uma assinatura.")
      toast({
        title: "Sem créditos disponíveis",
        description: "Por favor, adquira uma assinatura para aprimorar fotos",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      if (!file) {
        throw new Error("Nenhum arquivo disponível")
      }

      // Try to use base64 for API if available (faster)
      const imageToProcess = imageBase64 || previewUrl

      if (!imageToProcess) {
        throw new Error("Nenhum dado de imagem disponível")
      }

      // Create a record in Firestore first
      const enhancementId = await createPhotoEnhancement({
        userId: user.uid,
        originalUrl: previewUrl || "",
        status: "processing",
      })

      // Call API to enhance the image
      const enhancedImageUrl = await callEnhanceAPI(imageToProcess)

      // If we used base64 for the API and got a base64 back, we need to convert to a file
      let enhancedFile: File | null = null

      if (enhancedImageUrl.startsWith("data:")) {
        // Convert base64 to file
        const res = await fetch(enhancedImageUrl)
        const blob = await res.blob()
        enhancedFile = new File([blob], "enhanced.png", { type: "image/png" })
      }

      // Upload to Firebase Storage
      let storedEnhancedUrl: string

      if (enhancedFile) {
        // If we have a file from base64, upload it
        const { downloadUrl } = await saveEnhancedImage(user.uid, enhancedImageUrl, "enhanced.png")
        storedEnhancedUrl = downloadUrl
      } else {
        // If we have a URL, use saveEnhancedImage which handles URL fetching
        const { downloadUrl } = await saveEnhancedImage(user.uid, enhancedImageUrl, "enhanced.png")
        storedEnhancedUrl = downloadUrl
      }

      // Update the record in Firestore
      await updatePhotoEnhancement(enhancementId, {
        enhancedUrl: storedEnhancedUrl,
        status: "completed",
      })

      // Update user's subscription credits
      await updateSubscriptionCredits(subscription.id, -1)

      // Update local subscription state
      setSubscription((prev) => {
        if (!prev) return null
        return {
          ...prev,
          remainingCredits: prev.remainingCredits - 1,
        }
      })

      // Update UI
      setEnhancedUrl(storedEnhancedUrl)

      toast({
        title: "Foto aprimorada com sucesso",
        description: "Sua foto foi aprimorada e está pronta para download.",
      })
    } catch (error: any) {
      console.error("Erro ao aprimorar imagem:", error)
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
    setFileSize(null)
    setOriginalFileSize(null)
    setCompressedFileSize(null)
    setImageBase64(null)
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
        <h1 className="text-3xl font-bold tracking-tight">Aprimorar Fotos</h1>
        <p className="text-muted-foreground">Envie uma foto e deixe nossa IA aprimorá-la para você.</p>
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
            <CardTitle>Enviar Foto</CardTitle>
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
                <EnhanceImageComparison previewUrl={previewUrl} enhancedUrl={enhancedUrl} />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">A foto aprimorada aparecerá aqui</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {enhancedUrl && (
              <Button asChild className="w-full">
                <a href={enhancedUrl} download="foto-aprimorada.png">
                  Baixar Foto Aprimorada
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créditos Restantes</CardTitle>
          <CardDescription>
            Você tem {subscription?.remainingCredits || 0} créditos de aprimoramento de fotos restantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.remainingCredits ? (
            <p className="text-sm">
              Cada aprimoramento de foto usa 1 crédito. Você pode aprimorar mais {subscription.remainingCredits} fotos
              com sua assinatura atual.
            </p>
          ) : (
            <p className="text-sm">
              Você não tem créditos restantes. Por favor, adquira uma assinatura para aprimorar mais fotos.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant={subscription?.remainingCredits ? "outline" : "default"} className="w-full">
            <a href="/dashboard/subscription">
              {subscription?.remainingCredits ? "Gerenciar Assinatura" : "Obter Mais Créditos"}
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
