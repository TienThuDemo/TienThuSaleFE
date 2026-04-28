import type { OrderStatus } from '../../types';
import { ORDER_STATUS_MAP } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const info = ORDER_STATUS_MAP[status];
  return (
    <span
      className="status-badge"
      style={{
        color: info.color,
        backgroundColor: info.bgColor,
      }}
    >
      {info.label}
    </span>
  );
}
