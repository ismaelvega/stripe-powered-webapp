'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastNotificationRef = useRef<{ token: string; timestamp: number } | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });


    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change detected:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      setLoading(false);

      // Send notification on sign in events (only once per session with time window)
      if (event === 'SIGNED_IN' && session?.user) {
        const now = Date.now();
        const currentToken = session.access_token;
        const lastNotification = lastNotificationRef.current;
        
        // Check if this is a new session OR if enough time has passed (5 seconds)
        const shouldSendNotification = !lastNotification || 
          (lastNotification.token !== currentToken) ||
          (now - lastNotification.timestamp > 5000);
        
        if (shouldSendNotification) {
          lastNotificationRef.current = { token: currentToken, timestamp: now };
          
          console.log('Sending login notification for session:', currentToken.slice(-10));
          
          try {
            await fetch('/api/auth/login-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userEmail: session.user.email,
                userName: session.user.user_metadata?.full_name || session.user.email,
                userAgent: navigator?.userAgent || 'Unknown',
              }),
            });
          } catch (notificationError) {
            console.error('Failed to send login notification:', notificationError);
          }
        } else {
          // Skip sending notification if it's a duplicate within the time window
          console.log('Skipping duplicate notification for session:', currentToken.slice(-10), 
            `(last sent ${Math.round((now - lastNotification.timestamp) / 1000)}s ago)`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('signIn function called');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('signIn result:', { hasUser: !!data.user, hasError: !!error });

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // If sign-up was successful and we have a user, create the profile
    if (!error && data.user) {
      try {
        const response = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            fullName,
          }),
        });

        if (!response.ok) {
          console.error('Failed to create user profile');
          // Note: User is already created in Supabase Auth, 
          // but profile creation failed. This should be handled by support.
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // Same as above - user exists but profile creation failed
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
