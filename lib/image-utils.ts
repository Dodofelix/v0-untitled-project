/**
 * Utility functions for image processing
 */

/**
 * Compresses an image file to a specified maximum size
 * @param file The original image file
 * @param maxSizeMB Maximum size in MB
 * @param quality Compression quality (0-1)
 * @returns A promise that resolves to a compressed File object
 */
export const compressImage = async (file: File, maxSizeMB = 5, quality = 0.7): Promise<File> => {
  // If the file is already smaller than the max size, return it as is
  if (file.size / 1024 / 1024 < maxSizeMB) {
    return file
  }

  // Create a canvas element to draw the image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Create an image element to load the file
  const img = await createImageFromFile(file)

  // Calculate dimensions while maintaining aspect ratio
  const { width, height } = calculateDimensions(img, maxSizeMB)

  // Set canvas dimensions
  canvas.width = width
  canvas.height = height

  // Draw the image on the canvas
  ctx.drawImage(img, 0, 0, width, height)

  // Convert canvas to blob with quality setting
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          // If blob creation fails, return original file
          console.warn("Canvas to Blob conversion failed, using original file")
          resolve(file)
        }
      },
      file.type,
      quality,
    )
  })

  // If the compressed size is still larger than the max size, try again with lower quality
  if (blob.size / 1024 / 1024 > maxSizeMB && quality > 0.3) {
    return compressImage(file, maxSizeMB, quality - 0.1)
  }

  // Create a new File object from the blob
  return new File([blob], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  })
}

/**
 * Creates an Image object from a File
 * @param file The file to create an image from
 * @returns A promise that resolves to an Image object
 */
const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculates dimensions for resizing an image while maintaining aspect ratio
 * @param img The image element
 * @param maxSizeMB Maximum size in MB (used to determine max dimensions)
 * @returns An object with width and height properties
 */
const calculateDimensions = (img: HTMLImageElement, maxSizeMB: number) => {
  const MAX_WIDTH = maxSizeMB <= 1 ? 1200 : maxSizeMB <= 3 ? 1800 : 2400
  const MAX_HEIGHT = maxSizeMB <= 1 ? 1200 : maxSizeMB <= 3 ? 1800 : 2400

  let { width, height } = img

  // Resize if width or height exceeds maximum
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    if (width > height) {
      height = Math.round(height * (MAX_WIDTH / width))
      width = MAX_WIDTH
    } else {
      width = Math.round(width * (MAX_HEIGHT / height))
      height = MAX_HEIGHT
    }
  }

  return { width, height }
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
