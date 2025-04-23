"use client"

import type React from "react"

import { useState } from "react"

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
}

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before enhancement",
  afterAlt = "After enhancement",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)

  // Fallback para quando as imagens não estão disponíveis
  if (!beforeImage || !afterImage) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Imagens não disponíveis</p>
      </div>
    )
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value))
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Container */}
      <div className="relative w-full h-full">
        {/* Before Image (Base layer) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={beforeImage || "/placeholder.svg"}
            alt={beforeAlt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=400&width=400"
            }}
          />
          <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded z-20">
            Before
          </div>
        </div>

        {/* After Image (Revealed layer) */}
        <div className="absolute inset-0 h-full overflow-hidden" style={{ width: `${sliderPosition}%` }}>
          <img
            src={afterImage || "/placeholder.svg"}
            alt={afterAlt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=400&width=400"
            }}
          />
          <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded z-20">After</div>
        </div>

        {/* Slider Control */}
        <div className="absolute top-0 bottom-0 w-1 bg-white z-30" style={{ left: `${sliderPosition}%` }}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute bottom-0 w-full opacity-0 cursor-pointer z-40 h-12"
      />
    </div>
  )
}
