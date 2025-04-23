"use client"

import dynamic from "next/dynamic"

// Importar o componente de forma dinâmica
const ImageComparisonSlider = dynamic(() => import("@/components/image-comparison-slider"), { ssr: false })

interface ClientImageComparisonProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
}

export default function ClientImageComparison({
  beforeImage,
  afterImage,
  beforeAlt = "Before enhancement",
  afterAlt = "After enhancement",
}: ClientImageComparisonProps) {
  return (
    <div className="w-full h-full">
      <ImageComparisonSlider
        beforeImage={beforeImage}
        afterImage={afterImage}
        beforeAlt={beforeAlt}
        afterAlt={afterAlt}
      />
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Passe o mouse para revelar a transformação
      </div>
    </div>
  )
}
