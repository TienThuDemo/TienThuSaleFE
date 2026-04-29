export type ToastType = 'success' | 'info' | 'error' | 'warning';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
export const listeners: Set<(toast: ToastData) => void> = new Set();

export const showToast = (message: string, type: ToastType = 'success') => {
  const toast: ToastData = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
};
