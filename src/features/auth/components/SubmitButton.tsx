import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export default function SubmitButton({
  loading = false,
  children,
  disabled,
  className,
  ...rest
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled ?? loading}
      className={[
        'group relative w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all duration-150',
        'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600',
        'focus:outline-none focus:ring-4 focus:ring-red-200',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-rose-700',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
