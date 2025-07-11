'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Star, Edit } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { showErrorAlert, showToast, showConfirmDialog } from '@/lib/sweetalert';
import UpdatePaymentMethod from './update-payment-method';

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

interface PaymentMethodsListProps {
  onEditingStateChange?: (isEditing: boolean) => void;
}

export default function PaymentMethodsList({ onEditingStateChange }: PaymentMethodsListProps) {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateMethod, setUpdateMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  // Notify parent when editing state changes
  useEffect(() => {
    onEditingStateChange?.(updateMethod !== null);
  }, [updateMethod, onEditingStateChange]);

  const fetchPaymentMethods = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/stripe/list-payment-methods?user_id=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      // console.log('Payment methods from Stripe:', data.payment_methods);
      setPaymentMethods(data.payment_methods || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      await showErrorAlert('Error', 'No se pudieron cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (paymentMethod: PaymentMethod) => {

    setUpdateMethod(paymentMethod);
  };

  const handleUpdateSuccess = () => {
    setUpdateMethod(null);
    fetchPaymentMethods(); // Refresh the list
  };

  const handleUpdateCancel = () => {
    setUpdateMethod(null);
  };

  const handleDeletePaymentMethod = async (paymentMethod: PaymentMethod) => {
    const confirmed = await showConfirmDialog(
      '¿Eliminar método de pago?',
      `¿Estás seguro de que quieres eliminar la tarjeta terminada en ${paymentMethod.last4}?`,
      'Eliminar',
      'Cancelar'
    );

    if (!confirmed) return;

    setLoading(true); // Show spinner
    try {
      // Call API to detach from Stripe (no database involved)
      const response = await fetch('/api/stripe/detach-payment-method', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.stripe_payment_method_id, // Use Stripe PM ID
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }

      // Refresh the list from Stripe
      await fetchPaymentMethods();
      await showToast('Método de pago eliminado', 'success');
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      await showErrorAlert('Error', 'No se pudo eliminar el método de pago');
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethod: PaymentMethod) => {
    setLoading(true); // show spinner while setting default
    try {
      // Call API to set default in Stripe
      const response = await fetch('/api/stripe/set-default-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.stripe_payment_method_id,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set default payment method');
      }

      // Refresh the list from Stripe to get updated default status
      await fetchPaymentMethods();
      await showToast('Método de pago predeterminado actualizado', 'success');
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      await showErrorAlert('Error', 'No se pudo actualizar el método predeterminado');
    } finally {
      setLoading(false); // hide spinner
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
      case 'american_express':
        return '💳';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div className="text-gray-700 text-lg font-medium">Procesando...</div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes métodos de pago
          </h3>
          <p className="text-gray-600">
            Agrega una tarjeta para comenzar a realizar compras
          </p>
        </div>
      </div>
    );
  }

  // Show update form if a method is selected for update
  if (updateMethod) {
    return (
      <UpdatePaymentMethod
        paymentMethod={updateMethod}
        onSuccess={handleUpdateSuccess}
        onCancel={handleUpdateCancel}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Métodos de Pago ({paymentMethods.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {paymentMethods.map((paymentMethod) => (
          <div key={paymentMethod.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getCardBrandIcon(paymentMethod.card_brand)}
              </div>
              
              <div>
                  {paymentMethod.is_default && (
                    <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Predeterminada</span>
                    </div>
                  )}
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 capitalize">
                    {paymentMethod.card_brand} •••• {paymentMethod.last4}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Expira {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
                </p>
              </div>
            </div>

            {/* Set breakpoints for responsive design */}
            <div className="flex items-center space-x-2">
              {!paymentMethod.is_default && (
                <button
                  onClick={() => handleSetDefaultPaymentMethod(paymentMethod)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Hacer predeterminada
                </button>
              )}

              <button
                onClick={() => handleUpdatePaymentMethod(paymentMethod)}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="Actualizar método de pago"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleDeletePaymentMethod(paymentMethod)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Eliminar método de pago"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
