import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const enhanceImage = async (imageUrl: string) => {
  try {
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
    })

    // Extract the enhanced image URL from the response
    const enhancedImageUrl = response.choices[0].message.content
    return enhancedImageUrl
  } catch (error) {
    console.error("Error enhancing image:", error)
    throw error
  }
}
