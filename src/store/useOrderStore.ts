import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '../types';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderContractInfo: (id: string, contractInfo: Order['contractInfo']) => void;
  updateOrderInfo: (id: string, data: Partial<Pick<Order, 'customerInfo' | 'vehicleItems' | 'paymentInfo' | 'promotionInfo' | 'addons' | 'note'>>) => void;
  getOrderById: (id: string) => Order | undefined;
}

const generateMockOrders = (): Order[] => [
  {
    id: 'ORD-20260425-001',
    createdAt: '2026-04-25T10:30:00',
    saleName: 'Nguyễn Văn An',
    status: 'WAITING_KTBH',
    vehicleItems: [
      {
        model: 'Honda Vision',
        version: 'Đặc biệt',
        color: 'Trắng ngọc trai',
        quantity: 1,
        listPrice: 34290000,
        salePrice: 33000000,
      },
    ],
    promotionInfo: {
      discountAmount: 1490000,
      gifts: ['Mũ bảo hiểm chính hãng', 'Áo mưa cao cấp'],
      promotionNote: 'Khuyến mãi tháng 4 - Giảm giá đặc biệt cho khách hàng mới',
    },
    addons: [
      { id: 'insurance', name: 'Bảo hiểm xe máy (1 năm)', price: 66000, selected: true },
      { id: 'maintenance', name: 'Gói bảo dưỡng 12 tháng', price: 1500000, selected: false },
      { id: 'accessories', name: 'Phụ kiện lắp thêm', price: 2000000, selected: false },
      { id: 'registration', name: 'Phí đăng ký biển số', price: 4000000, selected: true },
    ],
    paymentInfo: {
      paymentMethod: 'transfer',
      depositAmount: 5000000,
      expectedFullPaymentDate: '2026-05-01',
      remainingAmount: 30576000,
    },
    customerInfo: {
      fullName: 'Trần Thị Bình',
      phone: '0901234567',
      idNumber: '079201001234',
      address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
      email: 'binhtt@gmail.com',
    },
    totalAmount: 35576000,
    note: 'Khách hàng muốn nhận xe vào cuối tuần',
  },
  {
    id: 'ORD-20260426-002',
    createdAt: '2026-04-26T14:15:00',
    saleName: 'Lê Minh Tuấn',
    status: 'WAITING_KTBH',
    vehicleItems: [
      {
        model: 'Honda SH Mode',
        version: 'Thể thao',
        color: 'Xanh đậm',
        quantity: 1,
        listPrice: 57990000,
        salePrice: 56500000,
      },
      {
        model: 'Honda Vision',
        version: 'Tiêu chuẩn',
        color: 'Đỏ tươi',
        quantity: 1,
        listPrice: 31490000,
        salePrice: 30500000,
      },
    ],
    promotionInfo: {
      discountAmount: 2490000,
      gifts: ['Mũ bảo hiểm chính hãng', 'Voucher bảo dưỡng 500K', 'Thảm lót chân'],
      promotionNote: 'Ưu đãi đặc biệt — mua 2 xe combo',
    },
    addons: [
      { id: 'insurance', name: 'Bảo hiểm xe máy (1 năm)', price: 66000, selected: true },
      { id: 'maintenance', name: 'Gói bảo dưỡng 12 tháng', price: 1500000, selected: true },
      { id: 'accessories', name: 'Phụ kiện lắp thêm', price: 2000000, selected: true },
      { id: 'registration', name: 'Phí đăng ký biển số', price: 4000000, selected: true },
    ],
    paymentInfo: {
      paymentMethod: 'installment',
      depositAmount: 15000000,
      expectedFullPaymentDate: '2026-06-01',
      remainingAmount: 77076000,
    },
    customerInfo: {
      fullName: 'Phạm Đức Hoàng',
      phone: '0987654321',
      idNumber: '079199005678',
      address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
      email: 'hoangpd@gmail.com',
    },
    totalAmount: 92076000,
    note: 'Khách hàng mua 2 xe — cần hỗ trợ trả góp qua VPBank',
  },
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: generateMockOrders(),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      updateOrderContractInfo: (id, contractInfo) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, contractInfo } : o
          ),
        })),
      updateOrderInfo: (id, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  customerInfo: data.customerInfo ? { ...o.customerInfo, ...data.customerInfo } : o.customerInfo,
                  vehicleItems: data.vehicleItems ?? o.vehicleItems,
                  paymentInfo: data.paymentInfo ? { ...o.paymentInfo, ...data.paymentInfo } : o.paymentInfo,
                  promotionInfo: data.promotionInfo ? { ...o.promotionInfo, ...data.promotionInfo } : o.promotionInfo,
                  addons: data.addons ?? o.addons,
                  note: data.note !== undefined ? data.note : o.note,
                }
              : o
          ),
        })),
      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: 'sales-contract-orders',
      version: 2,
      // Migrate old vehicleInfo (single object) → vehicleItems (array)
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          const state = persisted as { orders?: Array<Record<string, unknown>> };
          if (state.orders) {
            state.orders = state.orders.map((o) => {
              if ('vehicleInfo' in o && !('vehicleItems' in o)) {
                const { vehicleInfo, ...rest } = o;
                return { ...rest, vehicleItems: [vehicleInfo] };
              }
              return o;
            });
          }
        }
        return persisted as OrderStore;
      },
    }
  )
);
