"use client"

import dynamic from "next/dynamic"

// Importar o componente de forma dinâmica
const ImageComparisonSlider = dynamic(() => import("@/components/image-comparison-slider"), { ssr: false })

interface EnhanceImageComparisonProps {
  previewUrl: string | null
  enhancedUrl: string | null
}

export default function EnhanceImageComparison({ previewUrl, enhancedUrl }: EnhanceImageComparisonProps) {
  if (!previewUrl || !enhancedUrl) return null

  return (
    <div className="relative w-full aspect-square">
      <ImageComparisonSlider beforeImage={previewUrl} afterImage={enhancedUrl} />
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Passe o mouse para revelar a transformação
      </div>
    </div>
  )
}
