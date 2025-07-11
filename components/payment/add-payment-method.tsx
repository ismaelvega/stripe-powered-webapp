'use client';

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import { useAuth } from '@/lib/auth';
import { showErrorAlert, showToast } from '@/lib/sweetalert';
import PaymentMethodForm from './payment-method-form';

interface AddPaymentMethodProps {
  onPaymentMethodAdded?: () => void;
}

export default function AddPaymentMethod({ onPaymentMethodAdded }: AddPaymentMethodProps) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPaymentMethod = async () => {
    if (!user) {
      await showErrorAlert('Error', 'Debes estar autenticado para agregar un método de pago');
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

    //   console.log('data.client_secret:', data.client_secret);
      setClientSecret(data.client_secret);
    } catch (error: any) {
      console.error('Error creating setup intent:', error);
      await showErrorAlert('Error', 'No se pudo inicializar el proceso de pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async () => {
    setClientSecret(null);
    await showToast('Método de pago agregado exitosamente', 'success');
    onPaymentMethodAdded?.();
  };

  const handleCancel = () => {
    setClientSecret(null);
  };

  // If clientSecret is available it means we can render the payment method form
  // Otherwise, we show the button to add a new payment method
  if (clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: STRIPE_CONFIG.appearance,
          locale: STRIPE_CONFIG.locale,
        }}
      >
        <PaymentMethodForm
          clientSecret={clientSecret}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Elements>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Agregar Método de Pago
        </h3>
        <p className="text-gray-600 mb-6">
          Agrega una tarjeta para realizar pagos de forma segura
        </p>
        <button
          onClick={handleAddPaymentMethod}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Inicializando...' : 'Agregar Tarjeta'}
        </button>
      </div>
    </div>
  );
}
