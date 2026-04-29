import { ArrowRight, Clock, FileCheck2, FilePlus2, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { useGetOrdersQuery } from '../../api/orderApi';
import { vehicleSummary } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function SaleDashboard() {
  const navigate = useNavigate();
  const { data: orders = [] } = useGetOrdersQuery();
  const totalOrders = orders.length;
  const waitingKTBH = orders.filter((o) => o.status === 'WAITING_KTBH').length;
  const contractExported = orders.filter((o) => o.status === 'CONTRACT_EXPORTED' || o.status === 'COMPLETED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 lg:mb-10">
        <div>
          <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-primary-500/25 to-primary-700/10 flex items-center justify-center ring-1 ring-primary-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-primary-400" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-[#1a2547] tracking-tight">
              Dashboard <span className="gradient-text">Sale</span>
            </h1>
          </div>
          <p className="text-[13px] lg:text-[14px] text-[#94a3b8] ml-[52px] lg:ml-16 font-medium">Tổng quan đơn hàng và quản lý chốt xe</p>
        </div>
        <button className="btn-primary text-[14px] lg:text-[15px] px-6 lg:px-8 py-3 lg:py-4 shadow-xl shadow-primary-500/20 w-full sm:w-auto justify-center" onClick={() => navigate('/sale/create-order')}>
          <FilePlus2 className="w-5 h-5" />
          <span>Tạo đơn chốt xe</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
        <StatCard icon={<TrendingUp className="w-6 h-6 lg:w-7 lg:h-7" />} label="Tổng đơn đã tạo" value={totalOrders} color="#6366f1" subtitle="Tất cả trạng thái" />
        <StatCard icon={<Clock className="w-6 h-6 lg:w-7 lg:h-7" />} label="Chờ KTBH xử lý" value={waitingKTBH} color="#f59e0b" subtitle="Đang chờ xác nhận" />
        <StatCard icon={<FileCheck2 className="w-6 h-6 lg:w-7 lg:h-7" />} label="Đã xuất hợp đồng" value={contractExported} color="#10b981" subtitle="Hoàn thành quy trình" />
      </div>

      {/* Recent Orders */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 lg:px-8 py-4 lg:py-6 border-b-2 border-[#e2e5ee]">
          <h2 className="text-[15px] lg:text-[16px] font-bold text-[#1a2547]">Đơn hàng gần đây</h2>
          <p className="text-[12px] text-[#94a3b8] mt-1 font-medium">Hiển thị {Math.min(5, orders.length)} đơn hàng mới nhất</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 lg:py-20 text-[#94a3b8]">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl bg-[#f0f1f5] flex items-center justify-center mx-auto mb-4 lg:mb-5 ring-1 ring-[#e2e5ee]">
              <FilePlus2 className="w-7 h-7 lg:w-8 lg:h-8 opacity-40" />
            </div>
            <p className="font-bold text-[14px] lg:text-[15px] mb-1">Chưa có đơn nào</p>
            <p className="text-[12px] lg:text-[13px]">Bấm "Tạo đơn chốt xe" để bắt đầu</p>
          </div>
        ) : (
          <div>
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 lg:px-8 py-4 lg:py-5 border-b border-[#f0f1f5] last:border-b-0 hover:bg-[#f0f1f5] transition-colors group cursor-pointer"
                onClick={() => navigate(`/sale/orders/${order.id}`)}
              >
                <div className="flex items-center gap-3 lg:gap-5 flex-1 min-w-0">
                  <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0 group-hover:bg-primary-500/15 transition-colors ring-1 ring-primary-500/10">
                    <FileCheck2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] lg:text-[14px] font-bold text-[#1a2547] truncate">
                      {order.customerInfo.fullName || 'Chưa có tên'}
                    </div>
                    <div className="text-[11px] lg:text-[12px] text-[#94a3b8] mt-0.5 lg:mt-1 flex items-center gap-2 font-medium flex-wrap">
                      <span className="font-mono text-[10px] lg:text-[11px] bg-[#f0f1f5] px-1.5 lg:px-2 py-0.5 rounded-md">{order.id}</span>
                      <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#3d4460]" />
                      <span className="hidden sm:inline">{vehicleSummary(order.vehicleItems)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0 mt-2 sm:mt-0 ml-[52px] sm:ml-0">
                  <span className="text-[12px] text-[#94a3b8] hidden xl:block font-medium">{formatDateTime(order.createdAt)}</span>
                  <span className="text-[13px] lg:text-[15px] font-extrabold text-[#1a2547]">{formatCurrency(order.totalAmount)}</span>
                  <StatusBadge status={order.status} />
                  <ArrowRight className="w-4 h-4 text-[#3d4460] group-hover:text-primary-400 transition-colors hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
