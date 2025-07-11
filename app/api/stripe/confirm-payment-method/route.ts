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

    // Check if this is the user's first payment method
    const { data: existingMethods } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('user_id', user_id);

    const isFirstMethod = !existingMethods || existingMethods.length === 0;

    // Save payment method to database
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user_id,
        stripe_payment_method_id: paymentMethodId,
        card_brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        is_default: isFirstMethod, // First method is default
      })
      .select()
      .single();

    console.log('Payment method saved:', data);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save payment method' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payment_method: data,
      message: 'Payment method saved successfully',
    });
  } catch (error) {
    console.error('Error confirming payment method:', error);
    return NextResponse.json(
      { error: 'Failed to process payment method' },
      { status: 500 }
    );
  }
}
