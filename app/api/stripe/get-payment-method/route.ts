import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { payment_method_id } = await request.json();

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

    if (paymentMethod.type !== 'card' || !paymentMethod.card) {
      return NextResponse.json(
        { error: 'Only card payment methods are supported' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
        },
      },
    });
  } catch (error: any) {
    console.error('Error retrieving payment method:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment method details' },
      { status: 500 }
    );
  }
}
