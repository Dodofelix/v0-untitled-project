/**
 * Utilitário para obter parâmetros de URL de forma segura
 * Evita erros "Cannot read properties of undefined (reading 'query')"
 */

/**
 * Obtém um parâmetro de consulta da URL atual
 * @param paramName Nome do parâmetro a ser obtido
 * @returns O valor do parâmetro ou null se não existir
 */
export function getQueryParam(paramName: string): string | null {
  // Verificar se estamos no cliente
  if (typeof window === "undefined") {
    return null
  }

  try {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(paramName)
  } catch (error) {
    console.error(`Error getting query param ${paramName}:`, error)
    return null
  }
}

/**
 * Obtém todos os parâmetros de consulta da URL atual
 * @returns Um objeto com todos os parâmetros de consulta
 */
export function getAllQueryParams(): Record<string, string> {
  // Verificar se estamos no cliente
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const params: Record<string, string> = {}

    urlParams.forEach((value, key) => {
      params[key] = value
    })

    return params
  } catch (error) {
    console.error("Error getting all query params:", error)
    return {}
  }
}

/**
 * Constrói uma URL com parâmetros de consulta
 * @param baseUrl URL base
 * @param params Objeto com parâmetros de consulta
 * @returns URL completa com parâmetros
 */
export function buildUrlWithParams(baseUrl: string, params: Record<string, string>): string {
  try {
    const url = new URL(baseUrl, window.location.origin)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    return url.toString()
  } catch (error) {
    console.error("Error building URL with params:", error)
    return baseUrl
  }
}
