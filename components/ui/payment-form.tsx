'use client';

import React, { useState } from 'react';
import { showLoadingAlert, showSuccessAlert, showErrorAlert, showToast, closeAlert } from '@/lib/sweetalert';

interface PaymentFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function PaymentForm({ onCancel, onSuccess }: PaymentFormProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '01',
    expiryYear: String(currentYear),
    cvv: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading alert
    showLoadingAlert('verificandoooo u waiting', 'Procesando tu método de pago...');
    
    // Simulate API call to check the spinner
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Close loading alert
    closeAlert();
    
    // Randomly show success or error just for checkin u know
    if (Math.random() > 0.3) {
      const result = await showSuccessAlert('Método guardado', 'Tu método de pago ha sido añadido exitosamente');
      if (result.isConfirmed) {
        onSuccess();
      }
    } else {
      await showErrorAlert('Ocurrió un error!', 'No se pudo procesar tu método de pago. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">Añade un método de pago</h2>
      <p className="text-gray-600 mb-6">Rellena los campos requeridos</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Card Number</label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1234 5678 9012 3456"
            required
            maxLength={19}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Expira</label>
          <div className="flex gap-2">
            <select
              value={formData.expiryMonth}
              onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="self-center text-gray-500">//</span>
            <select
              value={formData.expiryYear}
              onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={currentYear + i} value={currentYear + i}>
                  {currentYear + i}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">CVV</label>
          <input
            type="text"
            value={formData.cvv}
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="---"
            maxLength={3}
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 text-xs text-gray-500">
          <div className="flex gap-1">
            <div className="w-8 h-4 bg-gray-200 rounded text-center text-[8px] leading-4">V</div>
            <div className="w-8 h-4 bg-gray-200 rounded text-center text-[8px] leading-4">S</div>
            <div className="w-8 h-4 bg-gray-200 rounded text-center text-[8px] leading-4">M</div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-500 text-white border border-black rounded-md hover:bg-green-600 transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
