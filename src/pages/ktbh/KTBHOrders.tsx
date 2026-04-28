import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings2, ClipboardList, Filter, ArrowRight } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import StatusBadge from '../../components/shared/StatusBadge';
import type { OrderStatus } from '../../types';
import { vehicleSummary } from '../../types';

export default function KTBHOrders() {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const filtered = orders.filter((o) => {
    if (nameFilter && !o.customerInfo.fullName.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (phoneFilter && !o.customerInfo.phone.includes(phoneFilter)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-[#22d3ee]/25 to-[#22d3ee]/5 flex items-center justify-center ring-1 ring-[#22d3ee]/20 flex-shrink-0">
          <ClipboardList className="w-5 h-5 lg:w-6 lg:h-6 text-[#22d3ee]" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#1a2547] tracking-tight">
          Danh sách đơn <span className="gradient-text">KTBH</span>
        </h1>
      </div>
      <p className="text-[13px] lg:text-[14px] text-[#94a3b8] mb-6 lg:mb-10 ml-[52px] lg:ml-16 font-medium">Quản lý và xử lý đơn hàng từ nhân viên Sale</p>

      {/* Filters */}
      <div className="glass-card p-4 lg:p-6 mb-5 lg:mb-7">
        <div className="flex items-center gap-2 mb-3 lg:mb-4">
          <Filter className="w-4 h-4 text-[#94a3b8]" />
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1.5px]">Bộ lọc tìm kiếm</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input className="form-input pl-11" placeholder="Tìm theo tên khách hàng..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
          </div>
          <div className="relative">
            <input className="form-input" placeholder="Số điện thoại..." value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} />
          </div>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}>
            <option value="">Tất cả trạng thái</option>
            <option value="WAITING_KTBH">Chờ xử lý</option>
            <option value="INFO_CONFIRMED">Đã xác nhận</option>
            <option value="READY_TO_EXPORT_CONTRACT">Sẵn sàng xuất HĐ</option>
            <option value="CONTRACT_EXPORTED">Đã xuất HĐ</option>
            <option value="COMPLETED">Hoàn tất</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[12px] text-[#94a3b8] font-bold">
          Hiển thị <span className="text-[#1a2547]">{filtered.length}</span> đơn hàng
        </span>
      </div>

      {/* Desktop Table */}
      <div className="glass-card overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày tạo</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Xe</th>
                <th>Tổng tiền</th>
                <th>Cọc</th>
                <th>Sale</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="!text-center py-16">
                    <div className="text-[#94a3b8]">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-[15px]">Không tìm thấy đơn nào</p>
                      <p className="text-[13px] mt-1">Thử thay đổi bộ lọc</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((o) => (
                <tr key={o.id} onClick={() => navigate(`/ktbh/orders/${o.id}`)}>
                  <td>
                    <span className="font-mono text-[11px] bg-[#f0f1f5] px-2.5 py-1.5 rounded-lg border border-[#e2e5ee] text-primary-300">{o.id}</span>
                  </td>
                  <td className="text-[12px] whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                  <td className="!font-bold !text-[#1a2547]">{o.customerInfo.fullName || <span className="text-[#f87171] italic font-normal">Chưa nhập</span>}</td>
                  <td className="font-mono text-[12px]">{o.customerInfo.phone || '—'}</td>
                  <td>
                    <div className="text-[13px] font-bold text-[#1a2547]">{o.vehicleItems?.[0]?.model ?? '—'}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">{(o.vehicleItems?.length ?? 0) > 1 ? `+${o.vehicleItems!.length - 1} xe khác` : `${o.vehicleItems?.[0]?.version ?? ''} · ${o.vehicleItems?.[0]?.color ?? ''}`}</div>
                  </td>
                  <td className="!font-black !text-[#1a2547] whitespace-nowrap text-[14px]">{formatCurrency(o.totalAmount)}</td>
                  <td className="whitespace-nowrap text-[13px]">{formatCurrency(o.paymentInfo.depositAmount)}</td>
                  <td className="text-[12px]">{o.saleName}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <button className="btn-ghost text-[12px]" onClick={(e) => { e.stopPropagation(); navigate(`/ktbh/orders/${o.id}`); }}>
                      <Settings2 className="w-3.5 h-3.5" /> Xử lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center text-[#94a3b8]">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-[14px]">Không tìm thấy đơn nào</p>
          </div>
        ) : filtered.map((o) => (
          <div
            key={o.id}
            className="glass-card p-4 sm:p-5 cursor-pointer hover:border-primary-500/30 transition-all group"
            onClick={() => navigate(`/ktbh/orders/${o.id}`)}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-[#1a2547] truncate">{o.customerInfo.fullName || <span className="text-[#f87171] italic font-normal">Chưa nhập tên</span>}</div>
                <div className="text-[11px] text-[#94a3b8] font-mono mt-1">{o.id}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
              <div>
                <span className="text-[#94a3b8]">Xe: </span>
                <span className="text-[#1a2547] font-semibold">{vehicleSummary(o.vehicleItems)}</span>
              </div>
              <div>
                <span className="text-[#94a3b8]">SĐT: </span>
                <span className="text-[#475569] font-mono">{o.customerInfo.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[#94a3b8]">Tổng: </span>
                <span className="text-[#1a2547] font-bold">{formatCurrency(o.totalAmount)}</span>
              </div>
              <div>
                <span className="text-[#94a3b8]">Cọc: </span>
                <span className="text-[#475569]">{formatCurrency(o.paymentInfo.depositAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f1f5]">
              <span className="text-[11px] text-[#94a3b8]">{o.saleName} · {formatDateTime(o.createdAt)}</span>
              <ArrowRight className="w-4 h-4 text-[#3d4460] group-hover:text-primary-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
