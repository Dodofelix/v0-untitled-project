"use client"

import type React from "react"

import { useState, useRef } from "react"

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
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = (x / rect.width) * 100
    setPosition(percentage)
  }

  const handleMouseLeave = () => {
    setPosition(50)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-lg cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Before Image (Base layer) */}
      <div className="absolute inset-0 w-full h-full">
        <img src={beforeImage || "/placeholder.svg"} alt={beforeAlt} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded z-20">Before</div>
      </div>

      {/* After Image (Revealed layer) */}
      <div className="absolute inset-0 h-full overflow-hidden" style={{ width: `${position}%` }}>
        <img src={afterImage || "/placeholder.svg"} alt={afterAlt} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded z-20">After</div>
      </div>

      {/* Divider Line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{ left: `${position}%` }}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
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
  )
}
