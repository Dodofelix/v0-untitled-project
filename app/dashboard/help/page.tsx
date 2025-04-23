"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does the photo enhancement work?",
    answer:
      "Our AI-powered photo enhancement uses advanced machine learning algorithms to transform your photos into professional-quality images. The system improves lighting, framing, and details to simulate a photoshoot for a high-standard advertising campaign. It enhances the angle to highlight the product or person, creates realistic depth of field, balanced contrast, and vibrant colors. The result maintains sharp focus on the subject with a softly blurred background (bokeh effect), similar to what you'd achieve with a Canon 50mm f/1.2 lens. For food and product photography, it also improves the standardization of displayed ingredients or components.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "Currently, we support JPEG (.jpg, .jpeg) and PNG (.png) file formats. We recommend uploading the highest quality image you have for the best results.",
  },
  {
    question: "How many photos can I enhance?",
    answer:
      "The number of photos you can enhance depends on your subscription plan. Each plan comes with a specific number of credits, and each photo enhancement uses one credit. You can view your remaining credits on your dashboard.",
  },
  {
    question: "Can I download the enhanced photos?",
    answer:
      "Yes, you can download all enhanced photos in full resolution. The enhanced photos are stored securely in your account, and you can download them at any time.",
  },
  {
    question: "How long does the enhancement process take?",
    answer:
      "Most photos are enhanced within seconds. However, processing time may vary depending on the size and complexity of the image, as well as current system load.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take security very seriously. All uploaded photos are stored securely using Firebase Storage with strict access controls. We do not share your photos with third parties, and all processing is done securely.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing period, and you can use any remaining credits during that time.",
  },
  {
    question: "What if I'm not satisfied with the results?",
    answer:
      "If you're not satisfied with the enhancement results, please contact our support team. We're committed to your satisfaction and will work with you to address any concerns.",
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers to common questions and learn how to use our service.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Learn the basics of using PhotoEnhance AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Upload a photo</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to the Enhance Photos section and upload a photo you want to enhance.
                </p>
              </div>
              <div>
                <h3 className="font-medium">2. Enhance your photo</h3>
                <p className="text-sm text-muted-foreground">
                  Click the "Enhance Photo" button and wait for the AI to process your image.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3. Download the result</h3>
                <p className="text-sm text-muted-foreground">
                  Once processing is complete, you can download your enhanced photo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Need help? Contact our support team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground">For general inquiries: support@photoenhance.ai</p>
              </div>
              <div>
                <h3 className="font-medium">Technical Support</h3>
                <p className="text-sm text-muted-foreground">For technical issues: tech@photoenhance.ai</p>
              </div>
              <div>
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-sm text-muted-foreground">Monday to Friday, 9:00 AM to 5:00 PM (GMT-3)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about our service.</CardDescription>
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
