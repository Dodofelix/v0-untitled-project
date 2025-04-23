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

// Função simplificada para aprimorar imagem usando DALL-E 3 diretamente
async function enhanceImageWithOpenAI(imageUrl: string): Promise<string> {
  // Verify if the client is initialized
  if (!openai) {
    console.log("OpenAI client not initialized, using mock enhance")
    return mockEnhanceImage(imageUrl)
  }

  try {
    console.log("Preparing OpenAI API request...")

    // Verificar se a imagem é uma URL ou base64
    if (imageUrl.startsWith("data:")) {
      console.log("Processing base64 image")
      // Garantir que a string base64 é válida
      if (!imageUrl.includes(";base64,")) {
        throw new Error("Invalid base64 image format")
      }
    } else {
      console.log("Processing URL image")
    }

    // Primeiro, usar o modelo Vision para analisar a imagem
    console.log("Analyzing image with Vision model...")
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Descreva esta imagem em detalhes, focando nos elementos principais, cores, composição e iluminação. Seja conciso e objetivo.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const imageDescription = visionResponse.choices[0]?.message?.content || "uma imagem"
    console.log("Image description:", imageDescription)

    // Agora, usar DALL-E 3 para gerar uma versão aprimorada
    console.log("Calling DALL-E 3 API...")
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Recrie esta imagem exatamente como descrita: ${imageDescription}. 
      
Aprimore-a para uma qualidade profissional de fotografia publicitária. 
Melhore a iluminação, o enquadramento e os detalhes, simulando uma sessão fotográfica feita para uma campanha publicitária de alto padrão. 
O ângulo deve valorizar o produto/pessoa, com profundidade de campo realista, contraste equilibrado e cores vivas, 
mantendo o foco nítido e o fundo suavemente desfocado (efeito bokeh), como em uma lente Canon 50mm f/1.2.

IMPORTANTE: Mantenha EXATAMENTE os mesmos elementos, pessoas, objetos e composição da imagem original. 
Não adicione, remova ou altere significativamente nenhum elemento. Apenas melhore a qualidade fotográfica.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    })

    console.log("DALL-E API response received")

    // Extrair a URL da imagem aprimorada da resposta
    const enhancedImageUrl = response.data[0]?.url
    if (!enhancedImageUrl) {
      console.error("No image URL in DALL-E response")
      return mockEnhanceImage(imageUrl)
    }

    console.log("Enhanced image URL extracted from response")
    return enhancedImageUrl
  } catch (error) {
    console.error("Error in OpenAI API call:", error)
    // Usar o mock em caso de erro
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
