"use client"

import { useState } from "react"

interface ClientImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export default function ClientImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg?height=400&width=400",
}: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <img src={imgSrc || "/placeholder.svg"} alt={alt} className={className} onError={() => setImgSrc(fallbackSrc)} />
  )
}
