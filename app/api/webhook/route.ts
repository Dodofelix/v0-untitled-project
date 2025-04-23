import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createSubscription } from "@/lib/firestore"

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Retrieve the subscription details
    const userId = session.metadata.userId
    const priceId = session.line_items?.data[0]?.price.id

    // Determine the number of credits based on the price ID
    let credits = 0
    if (priceId === "price_basic") credits = 5
    else if (priceId === "price_standard") credits = 10
    else if (priceId === "price_premium") credits = 15
    else if (priceId === "price_pro") credits = 20

    // Create a subscription record in Firestore
    await createSubscription({
      userId,
      priceId,
      remainingCredits: credits,
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    })
  }

  return NextResponse.json({ received: true })
}
