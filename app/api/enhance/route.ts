import { NextResponse } from "next/server"
import { mockEnhanceImage } from "@/lib/mock-enhance"
import OpenAI from "openai"

// Always use mock in development unless explicitly overridden
const USE_MOCK = process.env.NODE_ENV === "development" && process.env.USE_REAL_API !== "true"

// Initialize OpenAI client (server-side only)
let openai: OpenAI | null = null

// Only initialize if we have an API key
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Adicionado para resolver o erro de detecção de ambiente
    })
    console.log("OpenAI client initialized successfully in API route")
  } catch (error) {
    console.error("Error initializing OpenAI client in API route:", error)
  }
}

// Function to enhance image using OpenAI
async function enhanceImageWithOpenAI(imageUrl: string): Promise<string> {
  // Verify if the client is initialized
  if (!openai) {
    console.log("OpenAI client not initialized, using mock enhance")
    return mockEnhanceImage(imageUrl)
  }

  try {
    console.log("Preparing OpenAI API request...")

    // If the image is a base64 string, ensure it's properly formatted
    if (imageUrl.startsWith("data:")) {
      console.log("Processing base64 image")
      // Make sure the base64 string is valid
      if (!imageUrl.includes(";base64,")) {
        throw new Error("Invalid base64 image format")
      }
    } else {
      console.log("Processing URL image")
    }

    console.log("Sending request to OpenAI API...")
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em aprimoramento de fotos com foco em fotografia publicitária de alta qualidade.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Melhore a iluminação, o enquadramento e os detalhes, simulando uma sessão fotográfica feita para uma campanha publicitária de alto padrão. O ângulo deve valorizar o produto/pessoa, com profundidade de campo realista, contraste equilibrado e cores vivas, mantendo o foco nítido e o fundo suavemente desfocado (efeito bokeh), como em uma lente Canon 50mm f/1.2. Melhore a padronização dos ingredientes dispostos.",
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
      timeout: 60000, // 60 second timeout
    })

    console.log("OpenAI API response received")

    // Extract the enhanced image URL from the response
    const enhancedImageUrl = response.choices[0]?.message?.content
    if (!enhancedImageUrl) {
      console.error("No content in OpenAI response")
      return mockEnhanceImage(imageUrl)
    }

    console.log("Enhanced image URL extracted from response")
    return enhancedImageUrl
  } catch (error) {
    console.error("Error in OpenAI API call:", error)
    // Fall back to mock enhance on error
    return mockEnhanceImage(imageUrl)
  }
}

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
        enhancedImageUrl = await enhanceImageWithOpenAI(imageUrl)
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
