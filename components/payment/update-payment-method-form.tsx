'use client';

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { showErrorAlert } from '@/lib/sweetalert';

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
        // Get the new payment method details from Stripe
        const newPaymentMethodId = setupIntent.payment_method as string;
        
        // We need to call our API to get payment method details since client-side Stripe
        // doesn't have access to retrieve payment method details
        const response = await fetch('/api/stripe/get-payment-method', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_method_id: newPaymentMethodId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve payment method details');
        }

        const { paymentMethod: paymentMethodDetails } = await response.json();

        if (paymentMethodDetails.type !== 'card' || !paymentMethodDetails.card) {
          throw new Error('Only card payment methods are supported');
        }

        // Update the payment method in our database
        const { error: updateError } = await supabase
          .from('payment_methods')
          .update({
            stripe_payment_method_id: newPaymentMethodId,
            card_brand: paymentMethodDetails.card.brand,
            last4: paymentMethodDetails.card.last4,
            exp_month: paymentMethodDetails.card.exp_month,
            exp_year: paymentMethodDetails.card.exp_year,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentMethod.id);

        if (updateError) {
          throw new Error('Failed to update payment method in database');
        }

        console.log('Payment method updated successfully in database');
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
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="text-sm text-gray-600">
            <strong>Método actual:</strong> {paymentMethod.card_brand.toUpperCase()} •••• {paymentMethod.last4}
          </p>
          <p className="text-sm text-gray-600">
            Expira: {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
          </p>
        </div>
        <p className="text-gray-600 text-sm">
          Ingresa la información de tu nueva tarjeta. La anterior será reemplazada.
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
