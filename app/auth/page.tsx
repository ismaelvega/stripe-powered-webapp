'use client';

import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/auth/auth-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe payments webapp</h1>
          <p className="text-gray-600">Sistema de gestión de pagos con Stripe</p>
        </div>
        
        <AuthForm 
          mode={mode} 
          onToggleMode={handleToggleMode}
        />
      </div>
    </div>
  );
}
