import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


// Endpoint to create a setup intent for collecting payment method
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    console.log('Creating setup intent for user:', user_id);

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create a setup intent for collecting payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: undefined, // We'll create customer later if needed
      usage: 'off_session',
      metadata: {
        user_id: user_id,
      },
    });

    console.log('Setup intent:', setupIntent);
    console.log('client_secret:', setupIntent.client_secret);

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
