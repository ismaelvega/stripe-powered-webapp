'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showInfoAlert, showConfirmAlert, showToast } from '@/lib/sweetalert';

export default function DemoControls() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 z-40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Demo Controls</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <p className="text-gray-600 font-medium">Navigation:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li>Dashboard: Overview with recent courses</li>
          <li>Mis cursos: Toggle between empty/full states</li>
          <li>Métodos de pago: Add/remove payment methods</li>
        </ul>
        
        <p className="text-gray-600 font-medium pt-2">SweetAlert2 Demos:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => showSuccessAlert('Éxito', 'Operación completada')}
            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
          >
            Success
          </button>
          <button
            onClick={() => showErrorAlert('Error', 'Algo salió mal')}
            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          >
            Error
          </button>
          <button
            onClick={() => showInfoAlert('Info', 'Información importante')}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
          >
            Info
          </button>
          <button
            onClick={() => showConfirmAlert('¿Confirmar?', 'Esta acción no se puede deshacer')}
            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
          >
            Confirm
          </button>
          <button
            onClick={() => showToast('¡Guardado!', 'success')}
            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
          >
            Toast
          </button>
          <button
            onClick={() => showToast('¡Atención!', 'warning')}
            className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200"
          >
            Warning
          </button>
        </div>
      </div>
    </div>
  );
}
