"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Como funciona o aprimoramento de fotos?",
    answer:
      "Nosso aprimoramento de fotos com IA usa algoritmos avançados de aprendizado de máquina para transformar suas fotos em imagens de qualidade profissional. O sistema melhora a iluminação, o enquadramento e os detalhes para simular uma sessão fotográfica para uma campanha publicitária de alto padrão. Ele aprimora o ângulo para destacar o produto ou pessoa, cria profundidade de campo realista, contraste equilibrado e cores vibrantes. O resultado mantém o foco nítido no assunto com um fundo suavemente desfocado (efeito bokeh), semelhante ao que você conseguiria com uma lente Canon 50mm f/1.2. Para fotografia de alimentos e produtos, também melhora a padronização dos ingredientes ou componentes exibidos.",
  },
  {
    question: "Quais formatos de arquivo são suportados?",
    answer:
      "Atualmente, suportamos os formatos de arquivo JPEG (.jpg, .jpeg) e PNG (.png). Recomendamos o envio da imagem com a maior qualidade possível para obter os melhores resultados.",
  },
  {
    question: "Quantas fotos posso aprimorar?",
    answer:
      "O número de fotos que você pode aprimorar depende do seu plano de assinatura. Cada plano vem com um número específico de créditos, e cada aprimoramento de foto usa um crédito. Você pode ver seus créditos restantes no seu painel.",
  },
  {
    question: "Posso baixar as fotos aprimoradas?",
    answer:
      "Sim, você pode baixar todas as fotos aprimoradas em resolução completa. As fotos aprimoradas são armazenadas com segurança em sua conta, e você pode baixá-las a qualquer momento.",
  },
  {
    question: "Quanto tempo leva o processo de aprimoramento?",
    answer:
      "A maioria das fotos é aprimorada em segundos. No entanto, o tempo de processamento pode variar dependendo do tamanho e da complexidade da imagem, bem como da carga atual do sistema.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim, levamos a segurança muito a sério. Todas as fotos enviadas são armazenadas com segurança usando o Firebase Storage com controles de acesso rigorosos. Não compartilhamos suas fotos com terceiros, e todo o processamento é feito com segurança.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer:
      "Sim, você pode cancelar sua assinatura a qualquer momento. Sua assinatura permanecerá ativa até o final do período de cobrança atual, e você pode usar quaisquer créditos restantes durante esse período.",
  },
  {
    question: "E se eu não estiver satisfeito com os resultados?",
    answer:
      "Se você não estiver satisfeito com os resultados do aprimoramento, entre em contato com nossa equipe de suporte. Estamos comprometidos com sua satisfação e trabalharemos com você para resolver quaisquer preocupações.",
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Ajuda</h1>
        <p className="text-muted-foreground">
          Encontre respostas para perguntas comuns e aprenda a usar nosso serviço.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Primeiros Passos</CardTitle>
            <CardDescription>Aprenda o básico de como usar o PhotoEnhance AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Envie uma foto</h3>
                <p className="text-sm text-muted-foreground">
                  Navegue até a seção Aprimorar Fotos e envie uma foto que deseja aprimorar.
                </p>
              </div>
              <div>
                <h3 className="font-medium">2. Aprimore sua foto</h3>
                <p className="text-sm text-muted-foreground">
                  Clique no botão "Aprimorar Foto" e aguarde a IA processar sua imagem.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3. Baixe o resultado</h3>
                <p className="text-sm text-muted-foreground">
                  Quando o processamento estiver concluído, você pode baixar sua foto aprimorada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato com Suporte</CardTitle>
            <CardDescription>Precisa de ajuda? Entre em contato com nossa equipe de suporte.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Suporte por E-mail</h3>
                <p className="text-sm text-muted-foreground">Para dúvidas gerais: suporte@photoenhance.ai</p>
              </div>
              <div>
                <h3 className="font-medium">Suporte Técnico</h3>
                <p className="text-sm text-muted-foreground">Para problemas técnicos: tech@photoenhance.ai</p>
              </div>
              <div>
                <h3 className="font-medium">Horário Comercial</h3>
                <p className="text-sm text-muted-foreground">Segunda a sexta, das 9:00 às 17:00 (GMT-3)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>Encontre respostas para perguntas comuns sobre nosso serviço.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
