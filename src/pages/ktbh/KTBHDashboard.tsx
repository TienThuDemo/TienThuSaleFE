import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, FileText, FolderCheck, ArrowRight, Shield } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import StatCard from '../../components/shared/StatCard';

export default function KTBHDashboard() {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);
  const waiting = orders.filter((o) => o.status === 'WAITING_KTBH').length;
  const confirmed = orders.filter((o) => o.status === 'INFO_CONFIRMED' || o.status === 'READY_TO_EXPORT_CONTRACT').length;
  const exported = orders.filter((o) => o.status === 'CONTRACT_EXPORTED').length;
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 lg:mb-10">
        <div>
          <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-[#f59e0b]/25 to-[#f59e0b]/5 flex items-center justify-center ring-1 ring-[#f59e0b]/20 flex-shrink-0">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-[#f59e0b]" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-[#1a2547] tracking-tight">
              Dashboard <span className="gradient-text-warm">KTBH</span>
            </h1>
          </div>
          <p className="text-[13px] lg:text-[14px] text-[#94a3b8] ml-[52px] lg:ml-16 font-medium">Kế toán bán hàng — Quản lý xử lý đơn & hợp đồng</p>
        </div>
        <button className="btn-primary text-[14px] lg:text-[15px] px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto justify-center" onClick={() => navigate('/ktbh/orders')}>
          <FileText className="w-5 h-5" /> <span>Xem danh sách đơn</span> <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
        <StatCard icon={<Clock className="w-7 h-7" />} label="Chờ xử lý" value={waiting} color="#f59e0b" subtitle="Đơn mới từ Sale" />
        <StatCard icon={<CheckCircle className="w-7 h-7" />} label="Đã xác nhận" value={confirmed} color="#3b82f6" subtitle="Đang lập hợp đồng" />
        <StatCard icon={<FileText className="w-7 h-7" />} label="Đã xuất HĐ" value={exported} color="#8b5cf6" subtitle="Chờ hoàn tất" />
        <StatCard icon={<FolderCheck className="w-7 h-7" />} label="Hoàn tất" value={completed} color="#10b981" subtitle="Đã đóng hồ sơ" />
      </div>

      {/* Alert */}
      {waiting > 0 && (
        <div className="glass-card p-5 lg:p-7 border-l-4 border-l-[#f59e0b]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse" />
            <h3 className="text-[15px] font-bold text-[#1a2547]">Cần xử lý ngay</h3>
            <span className="text-[12px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full">{waiting} đơn</span>
          </div>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            Có <strong className="text-[#1a2547]">{waiting} đơn hàng mới</strong> đang chờ bạn xác nhận. Bấm "Xem danh sách đơn" để bắt đầu xử lý.
          </p>
        </div>
      )}
    </div>
  );
}
