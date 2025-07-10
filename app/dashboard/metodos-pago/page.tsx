'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import PaymentForm from '@/components/ui/payment-form';
import { Edit2, Trash2, Plus, CreditCard } from 'lucide-react';
import { showConfirmAlert, showToast } from '@/lib/sweetalert';

interface PaymentMethod {
  id: string;
  type: 'mastercard' | 'visa';
  name: string;
  brand: string;
}

export default function MetodosPagoPage() {
  const [view, setView] = useState<'empty' | 'list' | 'form'>('empty');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const handleAddPaymentMethod = () => {
    setView('form');
  };

  const handleCancelForm = () => {
    setView(paymentMethods.length > 0 ? 'list' : 'empty');
  };

  const handleFormSuccess = () => {
    // Add a new payment method
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: Math.random() > 0.5 ? 'mastercard' : 'visa',
      name: 'Nu CC',
      brand: 'Mastercard',
    };
    
    setPaymentMethods([...paymentMethods, newMethod]);
    setView('list');
  };

  const handleDeleteMethod = async (id: string) => {
    const result = await showConfirmAlert(
      '¿Eliminar método de pago?',
      'Esta acción no se puede deshacer.'
    );
    
    if (result.isConfirmed) {
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedMethods);
      
      if (updatedMethods.length === 0) {
        setView('empty');
      }
      
      await showToast('Método eliminado exitosamente', 'success');
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-2">Tus métodos de pago</h1>
      <p className="text-gray-500 mb-8">No tienes métodos de pago registrados</p>
      
      <div className="flex flex-col items-center">
        <p className="text-gray-600 mb-4">Añade un método de pago</p>
        <button
          onClick={handleAddPaymentMethod}
          className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-8 h-8 text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderListState = () => (
    <div>
      <h1 className="text-2xl font-bold mb-2">Tus métodos de pago</h1>
      <p className="text-gray-500 mb-8">Añade o revisa tus métodos de pago</p>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                method.type === 'mastercard' 
                  ? 'bg-gradient-to-r from-red-500 to-yellow-500' 
                  : 'bg-blue-600'
              }`}>
                {method.type === 'mastercard' ? 'MC' : 'V'}
              </div>
              <span className="font-medium">{method.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-orange-500 hover:bg-orange-50 rounded">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteMethod(method.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddPaymentMethod}
              className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-gray-500">Añadir</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormState = () => (
    <div>
      <div className="mb-8">
        <button
          onClick={handleCancelForm}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Volver
        </button>
      </div>
      
      <PaymentForm
        onCancel={handleCancelForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {view === 'empty' && renderEmptyState()}
        {view === 'list' && renderListState()}
        {view === 'form' && renderFormState()}
      </div>
    </DashboardLayout>
  );
}
