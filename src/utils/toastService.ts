export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'info';
}

let toastId = 0;
export const listeners: Set<(toast: ToastData) => void> = new Set();

export const showToast = (message: string, type: 'success' | 'info' = 'success') => {
  const toast: ToastData = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
};
