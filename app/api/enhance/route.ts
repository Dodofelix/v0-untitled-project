import { NextResponse } from "next/server"
import { enhanceImage } from "@/lib/openai"
import { mockEnhanceImage } from "@/lib/mock-enhance"

// Always use mock in development unless explicitly overridden
const USE_MOCK = process.env.NODE_ENV === "development" && process.env.USE_REAL_API !== "true"

export async function POST(req: Request) {
  console.log("API route called with method:", req.method)

  try {
    // Parse the request body
    let body
    try {
      body = await req.json()
      console.log("Request body parsed successfully")
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { imageUrl } = body

    if (!imageUrl) {
      console.error("No image URL provided in request")
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Check if the imageUrl is too large (over 20MB in base64)
    if (imageUrl.length > 20 * 1024 * 1024 && imageUrl.startsWith("data:")) {
      console.error("Image URL is too large")
      return NextResponse.json(
        {
          error: "Image is too large. Please use an image under 20MB.",
          fallback: true,
          enhancedImageUrl: imageUrl, // Return original as fallback
        },
        { status: 200 },
      )
    }

    console.log("Processing image enhancement request...")
    console.log("Using mock:", USE_MOCK)

    let enhancedImageUrl: string

    try {
      if (USE_MOCK) {
        console.log("Using mock enhance function")
        enhancedImageUrl = await mockEnhanceImage(imageUrl)
      } else {
        // Call the OpenAI API to enhance the image
        console.log("Calling OpenAI API...")
        enhancedImageUrl = await enhanceImage(imageUrl)
        console.log("OpenAI API response received")
      }

      console.log("Enhancement complete, returning result")
      return NextResponse.json({ enhancedImageUrl })
    } catch (error: any) {
      console.error("Error enhancing image:", error)

      // Always fall back to mock enhance on error
      console.log("Falling back to mock enhance function")
      try {
        enhancedImageUrl = await mockEnhanceImage(imageUrl)
        return NextResponse.json({
          enhancedImageUrl,
          error: error.message || "Failed to enhance image with AI, using fallback",
          fallback: true,
        })
      } catch (mockError) {
        console.error("Even mock enhance failed:", mockError)
        // If even the mock fails, return the original image
        return NextResponse.json({
          enhancedImageUrl: imageUrl,
          error: "Failed to enhance image",
          fallback: true,
        })
      }
    }
  } catch (error: any) {
    console.error("Unhandled error in enhance API route:", error)
    // Return a 200 with the original image as fallback
    return NextResponse.json(
      {
        error: "Internal server error: " + (error.message || "Unknown error"),
        fallback: true,
        enhancedImageUrl: null,
      },
      { status: 200 },
    ) // Use 200 to allow client to handle the error gracefully
  }
}
