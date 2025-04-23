"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const pricingPlans = [
  {
    name: "Básico",
    price: "R$ 47,90",
    description: "Perfeito para iniciantes",
    features: [
      "5 fotos aprimoradas",
      "Resultados de alta qualidade",
      "Armazenamento seguro na nuvem",
      "Download em resolução completa",
    ],
    priceId: "price_basic",
    credits: 5,
  },
  {
    name: "Padrão",
    price: "R$ 77,90",
    description: "Escolha mais popular",
    features: [
      "10 fotos aprimoradas",
      "Resultados de alta qualidade",
      "Armazenamento seguro na nuvem",
      "Download em resolução completa",
      "Processamento prioritário",
    ],
    priceId: "price_standard",
    credits: 10,
    popular: true,
  },
  {
    name: "Premium",
    price: "R$ 111,70",
    description: "Para entusiastas de fotografia",
    features: [
      "15 fotos aprimoradas",
      "Resultados de alta qualidade",
      "Armazenamento seguro na nuvem",
      "Download em resolução completa",
      "Processamento prioritário",
      "Opções avançadas de aprimoramento",
    ],
    priceId: "price_premium",
    credits: 15,
  },
  {
    name: "Pro",
    price: "R$ 137,90",
    description: "Para profissionais",
    features: [
      "20 fotos aprimoradas",
      "Resultados de alta qualidade",
      "Armazenamento seguro na nuvem",
      "Download em resolução completa",
      "Processamento prioritário",
      "Opções avançadas de aprimoramento",
      "Suporte por email",
    ],
    priceId: "price_pro",
    credits: 20,
  },
]

export default function PricingSection() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Preços Simples e Transparentes</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Escolha o plano que funciona melhor para você
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border ${
              plan.popular ? "border-purple-500 dark:border-purple-400" : "border-transparent"
            }`}
          >
            {plan.popular && (
              <div className="bg-purple-500 text-white text-xs font-medium px-3 py-1 text-center">MAIS POPULAR</div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>

              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
              </div>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-8 w-full" asChild>
                {user ? (
                  <Link href={`/checkout?plan=${plan.priceId}`}>Começar Agora</Link>
                ) : (
                  <Link href="/register">Cadastre-se</Link>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
