import { useNavigate } from 'react-router-dom';
import { FileCheck2, ArrowRight, ClipboardList } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { vehicleSummary } from '../../types';
import StatusBadge from '../../components/shared/StatusBadge';

export default function SaleOrders() {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in">
      <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-primary-500/25 to-primary-500/5 flex items-center justify-center ring-1 ring-primary-500/20 flex-shrink-0">
          <ClipboardList className="w-5 h-5 lg:w-6 lg:h-6 text-primary-400" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#1a2547] tracking-tight">
          Đơn hàng <span className="gradient-text">của tôi</span>
        </h1>
      </div>
      <p className="text-[13px] lg:text-[14px] text-[#94a3b8] mb-6 lg:mb-10 ml-[52px] lg:ml-16 font-medium">Tất cả đơn hàng bạn đã tạo</p>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center text-[#94a3b8]">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-[15px] mb-1">Chưa có đơn nào</p>
          <p className="text-[13px]">Bấm "Tạo đơn chốt xe" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card p-4 sm:p-5 cursor-pointer hover:border-primary-500/30 transition-all group"
              onClick={() => navigate(`/sale/orders/${order.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0 ring-1 ring-primary-500/10">
                    <FileCheck2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-[#1a2547] truncate">{order.customerInfo.fullName || 'Chưa có tên'}</span>
                      <span className="font-mono text-[10px] lg:text-[11px] bg-[#f0f1f5] px-2 py-0.5 rounded-md text-[#94a3b8]">{order.id}</span>
                    </div>
                    <div className="text-[12px] text-[#94a3b8] mt-1 flex items-center gap-2 font-medium flex-wrap">
                      <span>{vehicleSummary(order.vehicleItems)}</span>
                      <span className="w-1 h-1 rounded-full bg-[#3d4460]" />
                      <span>{formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0 ml-[52px] sm:ml-0">
                  <span className="text-[14px] lg:text-[15px] font-extrabold text-[#1a2547]">{formatCurrency(order.totalAmount)}</span>
                  <StatusBadge status={order.status} />
                  <ArrowRight className="w-4 h-4 text-[#3d4460] group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
