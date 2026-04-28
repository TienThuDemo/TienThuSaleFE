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

export const VEHICLE_MODELS: Record<string, { versions: VersionDef[]; colors: string[] }> = {
  'Honda Vision': {
    colors: ['Trắng ngọc trai', 'Đỏ tươi', 'Xanh lá', 'Đen nhám', 'Bạc'],
    versions: [
      { name: 'Tiêu chuẩn', colorPrices: { 'Trắng ngọc trai': 32290000, 'Đỏ tươi': 31490000, 'Xanh lá': 31490000, 'Đen nhám': 31990000, 'Bạc': 31490000 } },
      { name: 'Đặc biệt',   colorPrices: { 'Trắng ngọc trai': 34290000, 'Đỏ tươi': 33490000, 'Xanh lá': 33490000, 'Đen nhám': 33990000, 'Bạc': 33490000 } },
      { name: 'Cá tính',     colorPrices: { 'Trắng ngọc trai': 35290000, 'Đỏ tươi': 34490000, 'Xanh lá': 34490000, 'Đen nhám': 34990000, 'Bạc': 34490000 } },
    ],
  },
  'Honda SH Mode': {
    colors: ['Trắng ngọc trai', 'Xanh đậm', 'Đỏ đen', 'Bạc', 'Đen'],
    versions: [
      { name: 'Thời trang', colorPrices: { 'Trắng ngọc trai': 55990000, 'Xanh đậm': 54990000, 'Đỏ đen': 54990000, 'Bạc': 54990000, 'Đen': 54990000 } },
      { name: 'Cá tính',    colorPrices: { 'Trắng ngọc trai': 57990000, 'Xanh đậm': 56990000, 'Đỏ đen': 56990000, 'Bạc': 56990000, 'Đen': 56990000 } },
      { name: 'Thể thao',   colorPrices: { 'Trắng ngọc trai': 58990000, 'Xanh đậm': 57990000, 'Đỏ đen': 57990000, 'Bạc': 57990000, 'Đen': 57990000 } },
    ],
  },
  'Yamaha Grande': {
    colors: ['Trắng xanh', 'Hồng', 'Xanh dương', 'Đỏ', 'Đen'],
    versions: [
      { name: 'Tiêu chuẩn', colorPrices: { 'Trắng xanh': 41000000, 'Hồng': 40500000, 'Xanh dương': 40500000, 'Đỏ': 40500000, 'Đen': 40500000 } },
      { name: 'Đặc biệt',   colorPrices: { 'Trắng xanh': 46500000, 'Hồng': 46000000, 'Xanh dương': 46000000, 'Đỏ': 46000000, 'Đen': 46000000 } },
      { name: 'Hybrid',      colorPrices: { 'Trắng xanh': 51000000, 'Hồng': 50500000, 'Xanh dương': 50500000, 'Đỏ': 50500000, 'Đen': 50500000 } },
    ],
  },
  'Honda Air Blade': {
    colors: ['Đen đỏ', 'Xanh đen', 'Trắng', 'Bạc đen', 'Đỏ đen'],
    versions: [
      { name: 'Tiêu chuẩn 125cc', colorPrices: { 'Đen đỏ': 41190000, 'Xanh đen': 41190000, 'Trắng': 41690000, 'Bạc đen': 41190000, 'Đỏ đen': 41190000 } },
      { name: 'Đặc biệt 125cc',   colorPrices: { 'Đen đỏ': 42490000, 'Xanh đen': 42490000, 'Trắng': 42990000, 'Bạc đen': 42490000, 'Đỏ đen': 42490000 } },
      { name: 'Tiêu chuẩn 160cc',  colorPrices: { 'Đen đỏ': 56490000, 'Xanh đen': 56490000, 'Trắng': 56990000, 'Bạc đen': 56490000, 'Đỏ đen': 56490000 } },
    ],
  },
  'Yamaha NVX': {
    colors: ['Đen nhám', 'Xanh GP', 'Đỏ', 'Trắng xanh', 'Xám'],
    versions: [
      { name: '155 Tiêu chuẩn', colorPrices: { 'Đen nhám': 53500000, 'Xanh GP': 53000000, 'Đỏ': 53000000, 'Trắng xanh': 53000000, 'Xám': 53000000 } },
      { name: '155 Đặc biệt',   colorPrices: { 'Đen nhám': 56000000, 'Xanh GP': 55500000, 'Đỏ': 55500000, 'Trắng xanh': 55500000, 'Xám': 55500000 } },
      { name: '155 VVA',         colorPrices: { 'Đen nhám': 57500000, 'Xanh GP': 57000000, 'Đỏ': 57000000, 'Trắng xanh': 57000000, 'Xám': 57000000 } },
    ],
  },
};

/** Lookup list price by model + version + color. Returns 0 if not found. */
export function getVehiclePrice(model: string, version: string, color: string): number {
  const md = VEHICLE_MODELS[model];
  if (!md) return 0;
  const ver = md.versions.find(v => v.name === version);
  if (!ver) return 0;
  return ver.colorPrices[color] ?? Object.values(ver.colorPrices)[0] ?? 0;
}

export const DEFAULT_ADDONS: AddonItem[] = [
  { id: 'insurance', name: 'Bảo hiểm xe máy (1 năm)', price: 66000, selected: false },
  { id: 'maintenance', name: 'Gói bảo dưỡng 12 tháng', price: 1500000, selected: false },
  { id: 'accessories', name: 'Phụ kiện lắp thêm', price: 2000000, selected: false },
  { id: 'registration', name: 'Phí đăng ký biển số', price: 4000000, selected: false },
];

export const GIFT_OPTIONS = [
  'Mũ bảo hiểm chính hãng',
  'Áo mưa cao cấp',
  'Voucher bảo dưỡng 500K',
  'Thảm lót chân',
  'Khóa chống trộm',
  'Bọc yên xe',
];
