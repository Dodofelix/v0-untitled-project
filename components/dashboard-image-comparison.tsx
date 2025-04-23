"use client"

import dynamic from "next/dynamic"
import ClientImage from "@/components/client-image"

// Importar o componente de forma dinâmica
const ImageComparisonSlider = dynamic(() => import("@/components/image-comparison-slider"), { ssr: false })

interface DashboardImageComparisonProps {
  originalUrl: string | null | undefined
  enhancedUrl: string | null | undefined
}

export default function DashboardImageComparison({ originalUrl, enhancedUrl }: DashboardImageComparisonProps) {
  if (!originalUrl || !enhancedUrl) {
    return enhancedUrl ? (
      <ClientImage src={enhancedUrl} alt="Enhanced photo" className="object-cover w-full h-full rounded-t-lg" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">Imagem não disponível</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ImageComparisonSlider
        beforeImage={originalUrl}
        afterImage={enhancedUrl}
        beforeAlt="Original photo"
        afterAlt="Enhanced photo"
      />
    </div>
  )
}
