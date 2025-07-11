import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_method_id: string;
          card_brand: string;
          last4: string;
          exp_month: number;
          exp_year: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_method_id: string;
          card_brand: string;
          last4: string;
          exp_month: number;
          exp_year: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_method_id?: string;
          card_brand?: string;
          last4?: string;
          exp_month?: number;
          exp_year?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: number;
          created_at: string;
          title: string;
          description: string | null;
          price_cents: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          title: string;
          description?: string | null;
          price_cents: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          title?: string;
          description?: string | null;
          price_cents?: number;
          updated_at?: string;
        };
      };
      user_courses: {
        Row: {
          id: number;
          course_id: number;
          progress_percent: number;
          status: string;
          purchased_at: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: number;
          course_id: number;
          progress_percent?: number;
          status?: string;
          purchased_at?: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: number;
          course_id?: number;
          progress_percent?: number;
          status?: string;
          purchased_at?: string;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
};
