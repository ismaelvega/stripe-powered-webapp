'use client';

import React, { useState } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement 
} from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth';
import { showErrorAlert } from '@/lib/sweetalert';

interface PaymentMethodFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentMethodForm({ clientSecret, onSuccess, onCancel }: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // If Stripe or Elements are not loaded, or user is not authenticated, exit early
    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true); // Start processing state

    try {
      // Confirm the setup intent
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        console.error('Stripe error:', error);
        await showErrorAlert(
          'Error de pago',
          error.message || 'No se pudo procesar el método de pago'
        );
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Save payment method to database
        const response = await fetch('/api/stripe/confirm-payment-method', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            setup_intent_id: setupIntent.id,
            user_id: user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error saving payment method:', errorData);
          console.log(response);
          throw new Error(errorData.error || 'Failed to save payment method');
        }

        onSuccess();
      }
    } catch (error) {
      console.error('Error processing payment method:', error);
      await showErrorAlert('Error', 'No se pudo guardar el método de pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          disabled={isProcessing}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Procesando...' : 'Guardar Método de Pago'}
        </button>
      </div>
    </form>
  );
}
