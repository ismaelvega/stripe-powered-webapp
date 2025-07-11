import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * API endpoint to detach a payment method from Stripe customer (Stripe-only approach)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { payment_method_id, user_id } = await request.json();

    if (!payment_method_id || !user_id) {
      return NextResponse.json(
        { error: 'Payment method ID and user ID are required' },
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
        { status: 404 }
      );
    }

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
    
    if (paymentMethod.customer !== profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Payment method does not belong to this customer' },
        { status: 403 }
      );
    }

    try {
      // Detach payment method from Stripe customer
      await stripe.paymentMethods.detach(payment_method_id);
      console.log('Payment method detached from Stripe:', payment_method_id);
    } catch (stripeError: any) {
      // Log the error but don't fail if already detached
      console.warn('Stripe detachment warning:', stripeError.message);
      
      // Only fail if it's not an "already detached" error
      if (!stripeError.message?.includes('not attached')) {
        throw stripeError;
      }
    }

    return NextResponse.json({
      message: 'Payment method detached successfully',
    });

  } catch (error: any) {
    console.error('Error detaching payment method:', error);
    return NextResponse.json(
      { error: 'Failed to detach payment method' },
      { status: 500 }
    );
  }
}
