'use client';

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth';
import { showErrorAlert, showToast } from '@/lib/sweetalert';

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

interface UpdatePaymentMethodFormProps {
  paymentMethod: PaymentMethod;
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UpdatePaymentMethodForm({ 
  paymentMethod,
  clientSecret, 
  onSuccess, 
  onCancel 
}: UpdatePaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/metodos-pago`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.status === 'succeeded') {
        // First, confirm and attach the new payment method via our Stripe-only API
        const confirmResponse = await fetch('/api/stripe/confirm-payment-method', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            setup_intent_id: setupIntent.id,
            user_id: user.id,
          }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || 'Failed to confirm new payment method');
        }

        const { payment_method: newPaymentMethodData } = await confirmResponse.json();

        // If the old payment method is different, detach it from Stripe
        if (paymentMethod.stripe_payment_method_id !== newPaymentMethodData.stripe_payment_method_id) {
          const detachResponse = await fetch('/api/stripe/detach-payment-method', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payment_method_id: paymentMethod.stripe_payment_method_id,
              user_id: user.id,
            }),
          });

          if (!detachResponse.ok) {
            console.warn('Failed to detach old payment method, but new one was attached successfully');
          }
        }

        await showToast('Método de pago actualizado exitosamente', 'success');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      await showErrorAlert('Error', error.message || 'No se pudo actualizar el método de pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Actualizar Método de Pago
        </h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-2xl">💳</div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Método actual: {paymentMethod.card_brand.toUpperCase()} •••• {paymentMethod.last4}
              </p>
              <p className="text-sm text-blue-700">
                Expira: {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          Ingresa la información de tu nueva tarjeta. La anterior será automáticamente reemplazada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-md">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Actualizando...' : 'Actualizar Método de Pago'}
          </button>
        </div>
      </form>
    </div>
  );
}
