import { create } from 'zustand';
import { orderApi } from '../api/orderApi';
import type { Order, OrderStatus } from '../types';
import { store } from './index';

// Wrap the RTK Query promises for Zustand
const apiWrapper = {
  getOrders: () => store.dispatch(orderApi.endpoints.getOrders.initiate()).unwrap(),
  getOrderById: (id: string) => store.dispatch(orderApi.endpoints.getOrderById.initiate(id)).unwrap(),
  createOrder: (order: Order) => store.dispatch(orderApi.endpoints.createOrder.initiate(order)).unwrap(),
  updateOrderStatus: (id: string, status: OrderStatus) => store.dispatch(orderApi.endpoints.updateOrderStatus.initiate({ id, status })).unwrap(),
  updateOrderContract: (id: string, contractInfo: Order['contractInfo']) => store.dispatch(orderApi.endpoints.updateOrderContract.initiate({ id, contractInfo })).unwrap(),
  updateOrder: (id: string, data: Partial<Pick<Order, 'customerInfo' | 'vehicleItems' | 'paymentInfo' | 'promotionInfo' | 'addons' | 'note'>>) => store.dispatch(orderApi.endpoints.updateOrder.initiate({ id, data })).unwrap(),
  deleteOrder: (id: string) => store.dispatch(orderApi.endpoints.deleteOrder.initiate(id)).unwrap(),
};

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null; 
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderContractInfo: (id: string, contractInfo: Order['contractInfo']) => void;
  updateOrderInfo: (
    id: string,
    data: Partial<Pick<Order, 'customerInfo' | 'vehicleItems' | 'paymentInfo' | 'promotionInfo' | 'addons' | 'note'>>,
  ) => void;
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // ── Fetch all orders (call once on mount) ──
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await apiWrapper.getOrders();
      set({ orders, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  // ── Fetch single order ──
  fetchOrderById: async (id) => {
    try {
      const order = await apiWrapper.getOrderById(id);
      if (order) {
        set((s) => {
          const exists = s.orders.some((o) => o.id === id);
          if (exists) {
            return { orders: s.orders.map((o) => (o.id === id ? order : o)) };
          }
          return { orders: [...s.orders, order] };
        });
      }
    } catch (err) {
      console.error('Failed to fetch order', err);
    }
  },

  // ── Create ──
  addOrder: async (order) => {
    // Optimistic: add to state immediately
    set((s) => ({ orders: [order, ...s.orders] }));
    try {
      await apiWrapper.createOrder(order);
    } catch {
      // Rollback on failure
      set((s) => ({ orders: s.orders.filter((o) => o.id !== order.id) }));
    }
  },

  // ── Update status ──
  updateOrderStatus: (id, status) => {
    // Optimistic update
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    // Fire-and-forget sync to server
    apiWrapper.updateOrderStatus(id, status).catch(() => {
      // Could add error handling / rollback here
    });
  },

  // ── Update contract info ──
  updateOrderContractInfo: (id, contractInfo) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, contractInfo } : o,
      ),
    }));
    apiWrapper.updateOrderContract(id, contractInfo).catch(() => {});
  },

  // ── Update order fields ──
  updateOrderInfo: (id, data) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              customerInfo: data.customerInfo
                ? { ...o.customerInfo, ...data.customerInfo }
                : o.customerInfo,
              vehicleItems: data.vehicleItems ?? o.vehicleItems,
              paymentInfo: data.paymentInfo
                ? { ...o.paymentInfo, ...data.paymentInfo }
                : o.paymentInfo,
              promotionInfo: data.promotionInfo
                ? { ...o.promotionInfo, ...data.promotionInfo }
                : o.promotionInfo,
              addons: data.addons ?? o.addons,
              note: data.note !== undefined ? data.note : o.note,
            }
          : o,
      ),
    }));
    apiWrapper.updateOrder(id, data).catch(() => {});
  },

  // ── Get single (from local state) ──
  getOrderById: (id) => get().orders.find((o) => o.id === id),
}));
