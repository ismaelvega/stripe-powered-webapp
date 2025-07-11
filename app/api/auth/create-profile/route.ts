import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName } = await req.json();

    if (!userId || !email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name: fullName,
      metadata: {
        supabase_user_id: userId,
      },
    });

    console.log('Stripe customer created:', stripeCustomer.id);

    // Insert profile into database
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        stripe_customer_id: stripeCustomer.id,
      });

    if (profileError) {
      // If profile creation fails, delete the Stripe customer to avoid orphaned records
      await stripe.customers.del(stripeCustomer.id);
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    console.log('Profile created successfully:', { userId, email, stripeCustomerId: stripeCustomer.id });

    return NextResponse.json({
      success: true,
      stripeCustomerId: stripeCustomer.id,
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
