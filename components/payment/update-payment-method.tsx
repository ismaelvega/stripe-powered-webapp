'use client';

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import { useAuth } from '@/lib/auth';
import { showErrorAlert, showToast } from '@/lib/sweetalert';
import UpdatePaymentMethodForm from './update-payment-method-form';

interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  card_brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}

interface UpdatePaymentMethodProps {
  paymentMethod: PaymentMethod;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UpdatePaymentMethod({ 
  paymentMethod, 
  onSuccess, 
  onCancel 
}: UpdatePaymentMethodProps) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePaymentMethod = async () => {
    if (!user) {
      await showErrorAlert('Error', 'Debes estar autenticado para actualizar un método de pago');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setup intent');
      }

      setClientSecret(data.client_secret);
    } catch (error: any) {
      console.error('Error creating setup intent:', error);
      await showErrorAlert('Error', 'No se pudo inicializar el proceso de actualización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async () => {
    setClientSecret(null);
    await showToast('Método de pago actualizado exitosamente', 'success');
    onSuccess();
  };

  const handleCancel = () => {
    setClientSecret(null);
    onCancel();
  };

  // Auto-initialize when component mounts
  React.useEffect(() => {
    handleUpdatePaymentMethod();
  }, []);

  if (isLoading || !clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Inicializando actualización...</span>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: STRIPE_CONFIG.appearance,
        locale: STRIPE_CONFIG.locale,
      }}
    >
      <UpdatePaymentMethodForm
        paymentMethod={paymentMethod}
        clientSecret={clientSecret}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Elements>
  );
}
