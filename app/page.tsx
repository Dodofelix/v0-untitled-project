import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PricingSection from "@/components/pricing-section"
import { ArrowRight, ImageIcon, Zap, Shield } from "lucide-react"
import ClientImageComparison from "@/components/client-image-comparison"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-950" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Transform Your Photos with AI
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300">
                  Upload low-quality photos and get professional-looking results instantly. Our AI enhances lighting,
                  color, sharpness, and removes imperfections.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="font-medium">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-medium">
                    <Link href="#pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-[4/3] w-full">
                  <ClientImageComparison
                    beforeImage="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1EFAE062-2B00-4FB0-AAC5-6D9FA2E00F38.PNG-cSovq5mlhLSYm5jIkh9HQlYYQUYv0w.jpeg"
                    afterImage="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38437EF2-5BC6-4AB5-AF9B-889A8350BC0D.PNG-qVeJ6axYTPRxWd1lARiX1oUdDzpuMz.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Powerful Features</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our AI-powered platform offers everything you need to transform your photos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                  <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Enhancement</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our advanced AI algorithms analyze and enhance your photos, improving lighting, color balance, and
                  sharpness.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Instant Results</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get professional-quality enhancements in seconds. No waiting, no complicated editing tools.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secure Storage</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your photos are securely stored and processed. We prioritize your privacy and data security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
          <PricingSection />
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Photos?</h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Join thousands of users who are already enhancing their photos with our AI technology.
            </p>
            <Button asChild size="lg" className="mt-10 bg-white text-purple-600 hover:bg-white/90">
              <Link href="/register">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
