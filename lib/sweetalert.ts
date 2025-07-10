import Swal from 'sweetalert2';

const customSwalClass = {
  popup: 'rounded-lg border border-gray-200 shadow-lg',
  title: 'text-lg font-semibold text-gray-900',
  htmlContainer: 'text-gray-600',
//   confirmButton: 'px-6 py-2 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
  confirmButton: 'px-6 py-2 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
  cancelButton: 'px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
  actions: 'gap-3',
};

export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Continuar',
    confirmButtonColor: '#10b981',
    customClass: {
      ...customSwalClass,
      confirmButton: `${customSwalClass.confirmButton} bg-green-600 hover:bg-green-700 focus:ring-green-500`,
    },
    buttonsStyling: false,
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Continuar',
    confirmButtonColor: '#ef4444',
    customClass: {
      ...customSwalClass,
      confirmButton: `${customSwalClass.confirmButton} bg-red-600 hover:bg-red-700 focus:ring-red-500`,
    },
    buttonsStyling: false,
  });
};

export const showLoadingAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: customSwalClass,
  });
};

export const showConfirmAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    customClass: {
      ...customSwalClass,
      confirmButton: `${customSwalClass.confirmButton} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`,
    },
    buttonsStyling: false,
  });
};

export const showInfoAlert = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#3b82f6',
    customClass: {
      ...customSwalClass,
      confirmButton: `${customSwalClass.confirmButton} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`,
    },
    buttonsStyling: false,
  });
};

export const showToast = (title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
      popup: 'rounded-lg border border-gray-200 shadow-lg',
      title: 'text-sm font-medium',
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

export const closeAlert = () => {
  Swal.close();
};
