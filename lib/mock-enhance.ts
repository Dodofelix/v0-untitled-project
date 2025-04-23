/**
 * Função de aprimoramento de imagem simulada para testes
 * Usada quando a API OpenAI não está disponível ou para desenvolvimento
 */
export const mockEnhanceImage = async (imageUrl: string): Promise<string> => {
  console.log("Mock enhance function called")

  // Simular um atraso para parecer que está processando
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log("Mock processing complete, returning original image")

  // For testing purposes, we'll just return the original image
  // In a real implementation, you might want to apply some basic filters
  // or transformations to simulate enhancement
  return imageUrl
}
