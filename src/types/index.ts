export type OrderStatus =
  | 'DRAFT'
  | 'WAITING_KTBH'
  | 'INFO_CONFIRMED'
  | 'READY_TO_EXPORT_CONTRACT'
  | 'CONTRACT_EXPORTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface VehicleInfo {
  model: string;
  version: string;
  color: string;
  quantity: number;
  listPrice: number;
  salePrice: number;
}

export interface PromotionInfo {
  discountAmount: number;
  gifts: string[];
  promotionNote: string;
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface PaymentInfo {
  paymentMethod: 'cash' | 'transfer' | 'installment';
  depositAmount: number;
  expectedFullPaymentDate: string;
  remainingAmount: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  idNumber: string;
  address: string;
  email: string;
}

export interface ContractInfo {
  contractNumber: string;
  contractDate: string;
  accountantName: string;
  deliveryDate: string;
  deliveryLocation: string;
  warrantyPolicy: string;
  internalNote: string;
}

export interface Order {
  id: string;
  createdAt: string;
  saleName: string;
  status: OrderStatus;
  vehicleItems: VehicleInfo[];
  promotionInfo: PromotionInfo;
  addons: AddonItem[];
  paymentInfo: PaymentInfo;
  customerInfo: CustomerInfo;
  contractInfo?: ContractInfo;
  totalAmount: number;
  note: string;
}

/** Helper: format a short vehicle summary for lists (e.g. "Honda Vision × 1, Yamaha NVX × 2") */
export function vehicleSummary(items?: VehicleInfo[]): string {
  if (!items || items.length === 0) return '—';
  return items.map(v => `${v.model} (${v.color})${v.quantity > 1 ? ` ×${v.quantity}` : ''}`).join(', ');
}

/** Helper: total vehicle amount */
export function vehicleTotalAmount(items?: VehicleInfo[]): number {
  if (!items) return 0;
  return items.reduce((s, v) => s + v.salePrice * v.quantity, 0);
}

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Nháp', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.12)' },
  WAITING_KTBH: { label: 'Chờ KTBH xử lý', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.12)' },
  INFO_CONFIRMED: { label: 'Đã xác nhận', color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.12)' },
  READY_TO_EXPORT_CONTRACT: { label: 'Sẵn sàng xuất HĐ', color: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.12)' },
  CONTRACT_EXPORTED: { label: 'Đã xuất HĐ', color: '#22d3ee', bgColor: 'rgba(34, 211, 238, 0.12)' },
  COMPLETED: { label: 'Hoàn tất', color: '#34d399', bgColor: 'rgba(52, 211, 153, 0.12)' },
  CANCELLED: { label: 'Đã hủy', color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.12)' },
};

export interface VersionDef {
  name: string;
  /** Color → price mapping. Every color in the parent colors array should have an entry. */
  colorPrices: Record<string, number>;
}

export type VehicleModelsConfig = Record<string, { versions: { name: string; colorPrices: Record<string, number> }[]; colors: string[] }>;

/** Lookup list price by model + version + color. Returns 0 if not found. */
export function getVehiclePrice(
  vehiclesConfig: VehicleModelsConfig | undefined,
  model: string,
  version: string,
  color: string
): number {
  if (!vehiclesConfig) return 0;
  const md = vehiclesConfig[model];
  if (!md) return 0;
  const ver = md.versions.find(v => v.name === version);
  if (!ver) return 0;
  return ver.colorPrices[color] ?? Object.values(ver.colorPrices)[0] ?? 0;
}
