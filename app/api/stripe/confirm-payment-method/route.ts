import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Endpoint to confirm a payment method after setup intent
export async function POST(request: NextRequest) {
  try {
    const { setup_intent_id, user_id } = await request.json();

    if (!setup_intent_id || !user_id) {
      return NextResponse.json(
        { error: 'Setup intent ID and user ID are required' },
        { status: 400 }
      );
    }

    // Retrieve the setup intent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Setup intent not succeeded' },
        { status: 400 }
      );
    }

    const paymentMethodId = setupIntent.payment_method as string;
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    console.log('Payment method retrieved:', paymentMethod);

    if (paymentMethod.type !== 'card' || !paymentMethod.card) {
      return NextResponse.json(
        { error: 'Only card payment methods are supported' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User profile or Stripe customer not found' },
        { status: 400 }
      );
    }

    // Check if payment method is already attached to this Stripe customer
    const existingPaymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    });

    console.log('user payment methods:', existingPaymentMethods.data.map(pm => pm.card));
    const isDuplicate = existingPaymentMethods.data.some(pm => 
      pm.id === paymentMethodId || 
      (pm.card?.last4 === paymentMethod.card?.last4 && 
       pm.card?.brand === paymentMethod.card?.brand &&
       pm.card?.exp_month === paymentMethod.card?.exp_month &&
       pm.card?.exp_year === paymentMethod.card?.exp_year)
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Payment method already exists for this customer' },
        { status: 400 }
      );
    }

    // Attach payment method to customer (if not already attached)
    if (paymentMethod.customer !== profile.stripe_customer_id) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: profile.stripe_customer_id,
      });
      console.log('Payment method attached to customer:', profile.stripe_customer_id);
    }

    // Check if this should be the default payment method (if customer has no payment methods)
    const customerPaymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    });

    const isFirstMethod = customerPaymentMethods.data.length <= 1; // Including the one we just attached

    // Set as default if it's the first payment method
    if (isFirstMethod) {
      await stripe.customers.update(profile.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      console.log('Set as default payment method:', paymentMethodId);
    }

    return NextResponse.json({
      payment_method: {
        id: paymentMethodId,
        stripe_payment_method_id: paymentMethodId,
        card_brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        is_default: isFirstMethod,
      },
      message: 'Payment method processed successfully',
    });
  } catch (error) {
    console.error('Error confirming payment method:', error);
    return NextResponse.json(
      { error: 'Failed to process payment method' },
      { status: 500 }
    );
  }
}
