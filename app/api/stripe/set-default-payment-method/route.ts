import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * API endpoint to set default payment method in Stripe
 */
export async function POST(request: NextRequest) {
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

    // Update default payment method in Stripe
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    return NextResponse.json({
      message: 'Default payment method updated successfully',
    });

  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}
