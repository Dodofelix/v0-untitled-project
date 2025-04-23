import OpenAI from "openai"
import { mockEnhanceImage } from "./mock-enhance"

// This file should only be imported from server components or API routes
// Prevent client-side usage by checking for browser environment
if (typeof window !== "undefined") {
  console.error("OpenAI client should not be initialized on the client side")
}

// Initialize OpenAI client (server-side only)
let openai: OpenAI | null = null

// Only initialize if we're on the server
if (typeof window === "undefined") {
  try {
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      console.log("OpenAI client initialized successfully")
    } else {
      console.log("OpenAI API key not found, client not initialized")
    }
  } catch (error) {
    console.error("Error initializing OpenAI client:", error)
  }
}

// This function should only be called from server components or API routes
export const enhanceImage = async (imageUrl: string): Promise<string> => {
  // Verify if the client is initialized
  if (!openai) {
    console.log("OpenAI client not initialized, using mock enhance")
    return mockEnhanceImage(imageUrl)
  }

  try {
    console.log("Preparing OpenAI API request...")

    // Handle base64 images properly
    const imageUrlToSend = imageUrl

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
            { type: "image_url", image_url: { url: imageUrlToSend } },
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
