import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
}

export default function StatCard({ icon, label, value, color, subtitle }: StatCardProps) {
  return (
    <div
      className="stat-card glass-card p-7 flex items-start gap-5 cursor-default"
      style={{ '--stat-color': color } as React.CSSProperties}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `${color}18`,
          color,
          boxShadow: `0 4px 16px ${color}20`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-4xl font-black tracking-tight leading-none" style={{ color }}>{value}</div>
        <div className="text-[14px] text-[#1a2547] mt-2 font-semibold">{label}</div>
        {subtitle && <div className="text-[12px] text-[#94a3b8] mt-0.5 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}
