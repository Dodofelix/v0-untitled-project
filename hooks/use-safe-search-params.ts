"use client"

import { useState, useEffect } from "react"

/**
 * Hook personalizado para obter parâmetros de URL de forma segura
 * Evita erros "Cannot read properties of undefined (reading 'query')"
 */
export function useSafeSearchParams() {
  const [params, setParams] = useState<URLSearchParams | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      // Verificar se estamos no cliente
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search)
        setParams(urlParams)
        setIsReady(true)
      }
    } catch (error) {
      console.error("Error accessing search params:", error)
      setError(error as Error)
      setIsReady(true)
    }
  }, [])

  /**
   * Obtém um parâmetro de consulta
   * @param name Nome do parâmetro
   * @returns Valor do parâmetro ou null se não existir
   */
  const getParam = (name: string): string | null => {
    if (!params) return null
    return params.get(name)
  }

  /**
   * Verifica se um parâmetro existe
   * @param name Nome do parâmetro
   * @returns true se o parâmetro existir, false caso contrário
   */
  const hasParam = (name: string): boolean => {
    if (!params) return false
    return params.has(name)
  }

  /**
   * Obtém todos os parâmetros como um objeto
   * @returns Objeto com todos os parâmetros
   */
  const getAllParams = (): Record<string, string> => {
    if (!params) return {}

    const result: Record<string, string> = {}
    params.forEach((value, key) => {
      result[key] = value
    })

    return result
  }

  return {
    isReady,
    error,
    getParam,
    hasParam,
    getAllParams,
  }
}
