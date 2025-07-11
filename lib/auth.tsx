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

      // Send notification on sign in events (only for actual new logins)
      if (event === 'SIGNED_IN' && session?.user) {
        const now = Date.now();
        const currentToken = session.access_token;
        const lastNotification = lastNotificationRef.current;
        
        // Only send notification if:
        // 1. This is a completely new token (new session), AND
        // 2. At least 30 seconds have passed since last notification (prevents session refreshes)
        const isNewSession = !lastNotification || lastNotification.token !== currentToken;
        const enoughTimePassed = !lastNotification || (now - lastNotification.timestamp > 30000); // 30 seconds
        
        const shouldSendNotification = isNewSession && enoughTimePassed;
        
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
          // Skip sending notification for session refresh/reload
          console.log('Skipping notification - session refresh/reload for:', currentToken.slice(-10), 
            `(last sent ${lastNotification ? Math.round((now - lastNotification.timestamp) / 1000) : 0}s ago)`);
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
        } else {
          // Send welcome email notification via N8N
          try {
            await fetch('/api/auth/signup-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userEmail: data.user.email,
                userName: fullName,
                signupTime: new Date().toISOString(),
                userAgent: navigator?.userAgent || 'Unknown',
              }),
            });
          } catch (notificationError) {
            console.error('Failed to send signup notification:', notificationError);
          }
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
