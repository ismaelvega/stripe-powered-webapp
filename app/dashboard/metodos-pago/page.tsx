'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import Header from '@/components/layout/header';
import PaymentMethodsList from '@/components/payment/payment-methods-list';
import AddPaymentMethod from '@/components/payment/add-payment-method';

export default function MetodosPagoPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePaymentMethodAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Métodos de Pago
              </h1>
              <p className="text-gray-600">
                Gestiona tus métodos de pago de forma segura
              </p>
            </div>
            
            <AddPaymentMethod onPaymentMethodAdded={handlePaymentMethodAdded} />
            
            <PaymentMethodsList key={refreshKey} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
