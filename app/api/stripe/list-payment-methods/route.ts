import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * API endpoint to fetch payment methods directly from Stripe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    });

    // Get the customer's default payment method
    const customer = await stripe.customers.retrieve(profile.stripe_customer_id) as Stripe.Customer;
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method as string || null;

    // Transform Stripe data to match our frontend interface
    const transformedMethods = paymentMethods.data.map(pm => ({
      id: pm.id, // Using Stripe PM ID as the ID
      stripe_payment_method_id: pm.id,
      card_brand: pm.card?.brand || 'unknown',
      last4: pm.card?.last4 || '0000',
      exp_month: pm.card?.exp_month || 1,
      exp_year: pm.card?.exp_year || 2025,
      is_default: pm.id === defaultPaymentMethodId,
      created_at: new Date(pm.created * 1000).toISOString(), // Convert Unix timestamp
    }));

    return NextResponse.json({
      payment_methods: transformedMethods,
    });

  } catch (error: any) {
    console.error('Error fetching payment methods from Stripe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
