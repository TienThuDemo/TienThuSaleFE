import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Info, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { listeners } from '../../utils/toastService';
import type { ToastData, ToastType } from '../../utils/toastService';

const TOAST_AUTO_DISMISS_MS = 4000;

const TOAST_ICON: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  info: Info,
  error: AlertCircle,
  warning: AlertTriangle,
};

const TOAST_STYLES: Record<ToastType, { ring: string; iconBg: string; iconColor: string }> = {
  success: {
    ring: 'border-emerald-200',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  info: {
    ring: 'border-sky-200',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  error: {
    ring: 'border-red-200',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  warning: {
    ring: 'border-amber-200',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: ToastData) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, TOAST_AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[1000] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = TOAST_ICON[toast.type];
        const style = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-white shadow-lg border ${style.ring} animate-[slideIn_.2s_ease-out]`}
          >
            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${style.iconBg}`}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>
            <div className="flex-1 text-sm font-medium text-slate-800 leading-snug pt-1.5">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
              className="flex-shrink-0 mt-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
