import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, CreditCard, Gift, StickyNote, ClipboardCheck, Clock, Pencil, Save, X, Plus, Trash2, XCircle } from 'lucide-react';
import { useGetOrderByIdQuery, useUpdateOrderMutation, useUpdateOrderStatusMutation } from '../../api/orderApi';
import { useGetSystemConfigQuery } from '../../api/configApi';
import { formatCurrency, paymentMethodLabel, formatDateTime } from '../../utils/format';
import { showToast } from '../../utils/toastService';
import StatusBadge from '../../components/shared/StatusBadge';
import { getVehiclePrice } from '../../types';
import type { CustomerInfo, VehicleInfo, PaymentInfo, PromotionInfo, AddonItem, Order } from '../../types';

function InfoRow({ label, value, accent, mono }: { label: string; value: string; accent?: string; mono?: boolean }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-value ${mono ? 'font-mono' : ''}`} style={accent ? { color: accent, fontWeight: 700 } : undefined}>{value}</span>
    </div>
  );
}

type EditSection = 'customer' | 'vehicle' | 'promo' | 'payment' | 'addons' | 'note' | null;

export default function SaleOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: order } = useGetOrderByIdQuery(id || '', { skip: !id });
  const { data: config } = useGetSystemConfigQuery();
  const [updateOrder] = useUpdateOrderMutation();
  const [updateStatus] = useUpdateOrderStatusMutation();

  // Edit states
  const [editing, setEditing] = useState<EditSection>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerInfo>({} as CustomerInfo);
  const [editVehicles, setEditVehicles] = useState<VehicleInfo[]>([]);
  const [editPayment, setEditPayment] = useState<PaymentInfo>({} as PaymentInfo);
  const [editPromo, setEditPromo] = useState<PromotionInfo>({} as PromotionInfo);
  const [editAddons, setEditAddons] = useState<AddonItem[]>([]);
  const [editNote, setEditNote] = useState('');

  if (!order) {
    return (
      <div className="p-6 lg:p-10 text-center text-[#94a3b8]">
        <p className="font-bold text-[16px]">Không tìm thấy đơn hàng.</p>
        <button className="btn-ghost mt-4" onClick={() => navigate('/sale')}><ArrowLeft className="w-4 h-4" /> Quay lại</button>
      </div>
    );
  }

  const canEdit = order.status === 'WAITING_KTBH';
  const canCancel = order.status === 'WAITING_KTBH' || order.status === 'INFO_CONFIRMED';

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.')) return;
    await updateStatus({ id: order.id, status: 'CANCELLED' });
    showToast('Đã hủy đơn hàng', 'info');
  };

  const startEdit = (section: EditSection) => {
    if (!canEdit) return;
    setEditing(section);
    if (section === 'customer') setEditCustomer({ ...order.customerInfo });
    if (section === 'vehicle') setEditVehicles((order.vehicleItems ?? []).map(v => ({ ...v })));
    if (section === 'payment') setEditPayment({ ...order.paymentInfo });
    if (section === 'promo') setEditPromo({ ...order.promotionInfo });
    if (section === 'addons') setEditAddons(order.addons.map(a => ({ ...a })));
    if (section === 'note') setEditNote(order.note || '');
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async (section: string) => {
    const patch: Partial<Order> = {};
    if (section === 'customer') patch.customerInfo = editCustomer;
    if (section === 'vehicle') patch.vehicleItems = editVehicles;
    if (section === 'payment') patch.paymentInfo = editPayment;
    if (section === 'promo') patch.promotionInfo = editPromo;
    if (section === 'addons') patch.addons = editAddons;
    if (section === 'note') patch.note = editNote;
    
    await updateOrder({ id: order.id, data: patch });
    setEditing(null);
    showToast('Đã cập nhật thông tin', 'success');
  };

  const toggleGift = (g: string) => {
    setEditPromo(prev => ({
      ...prev,
      gifts: prev.gifts.includes(g) ? prev.gifts.filter(x => x !== g) : [...prev.gifts, g],
    }));
  };

  // Vehicle helpers
  const updateEditVehicle = (idx: number, patch: Partial<VehicleInfo>) => {
    setEditVehicles(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v));
  };
  const addEditVehicle = () => setEditVehicles(prev => [...prev, { model: '', version: '', color: '', quantity: 1, listPrice: 0, salePrice: 0 }]);
  const removeEditVehicle = (idx: number) => {
    if (editVehicles.length <= 1) return;
    setEditVehicles(prev => prev.filter((_, i) => i !== idx));
  };

  const selectedAddons = order.addons.filter((a) => a.selected);
  const stepLabels = ['Tạo đơn', 'Chờ KTBH', 'Xác nhận', 'Hợp đồng', 'Hoàn tất'];
  const currentIdx = (() => {
    if (order.status === 'COMPLETED' || order.status === 'CONTRACT_EXPORTED') return 4;
    if (order.status === 'READY_TO_EXPORT_CONTRACT') return 3;
    if (order.status === 'INFO_CONFIRMED') return 2;
    return 1;
  })();

  const editHeader = (label: React.ReactNode, section: EditSection) => (
    <div className="flex items-center justify-between">
      <div className="section-title flex-1">{label}</div>
      {canEdit && editing !== section && (
        <button className="btn-ghost text-[12px] py-1.5 px-3" onClick={() => startEdit(section)}>
          <Pencil className="w-3.5 h-3.5" /> Sửa
        </button>
      )}
    </div>
  );

  const editActions = (section: string) => (
    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#e2e5ee]">
      <button className="btn-success text-[13px] px-5 py-2.5" onClick={() => saveEdit(section)}>
        <Save className="w-4 h-4" /> <span>Lưu</span>
      </button>
      <button className="btn-ghost text-[13px]" onClick={cancelEdit}>
        <X className="w-4 h-4" /> Hủy
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in max-w-[900px] mx-auto">
      <button className="btn-ghost mb-6 lg:mb-8 -ml-2" onClick={() => navigate('/sale/orders')}><ArrowLeft className="w-4 h-4" /> Quay lại danh sách</button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-primary-500/25 to-primary-500/5 flex items-center justify-center ring-1 ring-primary-500/20 flex-shrink-0">
            <ClipboardCheck className="w-5 h-5 lg:w-6 lg:h-6 text-primary-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-black text-[#1a2547] tracking-tight">
              Đơn hàng <span className="gradient-text font-mono text-lg lg:text-2xl">{order.id}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="text-[12px] text-[#94a3b8] font-medium">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Cancelled banner */}
      {order.status === 'CANCELLED' && (
        <div className="glass-card p-4 mb-5 border-l-4 border-l-red-500 flex items-center gap-3 bg-red-50/60">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-[13px] text-red-700 font-semibold">Đơn hàng này đã bị hủy.</p>
        </div>
      )}

      {/* Editable hint */}
      {canEdit && (
        <div className="glass-card p-4 mb-5 border-l-4 border-l-amber-400 flex items-center gap-3">
          <Pencil className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-[13px] text-[#475569]">Đơn hàng chưa được KTBH xử lý — bạn có thể <strong className="text-[#1a2547]">chỉnh sửa</strong> thông tin bằng cách bấm nút <span className="text-primary-500 font-semibold">Sửa</span> ở mỗi mục.</p>
        </div>
      )}

      {/* Progress */}
      <div className="glass-card p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex items-center gap-1">
          {stepLabels.map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`h-2 flex-1 rounded-full transition-all ${i <= currentIdx ? 'bg-gradient-to-r from-primary-500 to-accent-violet' : 'bg-[#f0f1f5]'}`} />
              {i < stepLabels.length - 1 && <div className="w-1.5" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3">
          {stepLabels.map((s, i) => (
            <span key={s} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[1px] ${i <= currentIdx ? 'text-primary-400' : 'text-[#cbd5e1]'}`}>{s}</span>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-4 lg:space-y-5">

        {/* ── Customer ── */}
        <div className="glass-card p-5 lg:p-7">
          {editHeader(<div className="flex items-center gap-2"><User className="w-4 h-4" /> Khách hàng</div>, 'customer')}
          {editing === 'customer' ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                <div className="form-group"><label className="form-label">Họ tên <span className="required">*</span></label><input className="form-input" value={editCustomer.fullName} onChange={e => setEditCustomer({ ...editCustomer, fullName: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Điện thoại <span className="required">*</span></label><input className="form-input" value={editCustomer.phone} onChange={e => setEditCustomer({ ...editCustomer, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">CCCD <span className="required">*</span></label><input className="form-input" value={editCustomer.idNumber} onChange={e => setEditCustomer({ ...editCustomer, idNumber: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={editCustomer.email || ''} onChange={e => setEditCustomer({ ...editCustomer, email: e.target.value })} /></div>
                <div className="form-group sm:col-span-2"><label className="form-label">Địa chỉ <span className="required">*</span></label><input className="form-input" value={editCustomer.address} onChange={e => setEditCustomer({ ...editCustomer, address: e.target.value })} /></div>
              </div>
              {editActions('customer')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <InfoRow label="Họ tên" value={order.customerInfo.fullName || '—'} />
              <InfoRow label="Điện thoại" value={order.customerInfo.phone || '—'} mono />
              <InfoRow label="CCCD" value={order.customerInfo.idNumber || '—'} mono />
              {order.customerInfo.email && <InfoRow label="Email" value={order.customerInfo.email} />}
              <div className="sm:col-span-2"><InfoRow label="Địa chỉ" value={order.customerInfo.address || '—'} /></div>
            </div>
          )}
        </div>

        {/* ── Vehicles ── */}
        <div className="glass-card p-5 lg:p-7">
          <div className="flex items-center justify-between">
            <div className="section-title flex-1"><div className="flex items-center gap-2"><Package className="w-4 h-4" /> Thông tin xe ({(order.vehicleItems ?? []).length} xe)</div></div>
            {canEdit && editing !== 'vehicle' && (
              <button className="btn-ghost text-[12px] py-1.5 px-3" onClick={() => startEdit('vehicle')}>
                <Pencil className="w-3.5 h-3.5" /> Sửa
              </button>
            )}
          </div>
          {editing === 'vehicle' ? (
            <div>
              <div className="flex items-center justify-end mb-3">
                <button className="btn-ghost text-[11px]" onClick={addEditVehicle}><Plus className="w-3.5 h-3.5" /> Thêm xe</button>
              </div>
              <div className="space-y-5">
                {editVehicles.map((v, idx) => {
                  const md = config?.vehicles && v.model ? config.vehicles[v.model] : null;
                  return (
                    <div key={idx} className={`${editVehicles.length > 1 ? 'p-4 rounded-xl border border-[#e2e5ee] bg-white/60' : ''}`}>
                      {editVehicles.length > 1 && (
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[12px] font-bold text-[#1a2547]">🏍️ Xe #{idx + 1}</span>
                          <button className="btn-ghost text-[11px] text-red-500 hover:bg-red-50" onClick={() => removeEditVehicle(idx)}><Trash2 className="w-3 h-3" /> Xóa</button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Dòng xe</label>
                          <select className="form-select" value={v.model} onChange={e => {
                            const m = e.target.value;
                            const mData = config?.vehicles ? config.vehicles[m] : null;
                            const firstVer = mData?.versions[0];
                            const firstColor = mData?.colors[0] || '';
                            const price = getVehiclePrice(config?.vehicles, m, firstVer?.name || '', firstColor);
                            updateEditVehicle(idx, { model: m, version: firstVer?.name || '', color: firstColor, listPrice: price, salePrice: price });
                          }}>
                            {config?.vehicles && Object.keys(config.vehicles).map(m => <option key={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phiên bản</label>
                          <select className="form-select" value={v.version} onChange={e => {
                            const vName = e.target.value;
                            const price = getVehiclePrice(config?.vehicles, v.model, vName, v.color);
                            updateEditVehicle(idx, { version: vName, listPrice: price, salePrice: price });
                          }}>
                            {md?.versions.map(ver => <option key={ver.name}>{ver.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Màu xe</label>
                          <select className="form-select" value={v.color} onChange={e => {
                            const color = e.target.value;
                            const price = getVehiclePrice(config?.vehicles, v.model, v.version, color);
                            updateEditVehicle(idx, { color, listPrice: price, salePrice: price });
                          }}>
                            {md?.colors.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="form-group"><label className="form-label">Số lượng</label><input type="number" className="form-input" min={1} value={v.quantity} onChange={e => updateEditVehicle(idx, { quantity: Number(e.target.value) || 1 })} /></div>
                        <div className="form-group"><label className="form-label">Giá niêm yết</label><input className="form-input bg-[#f0f1f5] cursor-not-allowed opacity-70" value={v.listPrice ? formatCurrency(v.listPrice) : 'Tự động'} readOnly /></div>
                        <div className="form-group"><label className="form-label">Giá bán</label><input type="number" className="form-input" value={v.salePrice || ''} onChange={e => updateEditVehicle(idx, { salePrice: Number(e.target.value) })} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {editActions('vehicle')}
            </div>
          ) : (
            <div className="space-y-0">
              {(order.vehicleItems ?? []).map((v, idx) => (
                <div key={idx} className={`${idx > 0 ? 'mt-4 pt-4 border-t border-[#e2e5ee]' : ''}`}>
                  {(order.vehicleItems ?? []).length > 1 && (
                    <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Xe #{idx + 1}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <InfoRow label="Dòng xe" value={v.model} />
                    <InfoRow label="Phiên bản" value={v.version} />
                    <InfoRow label="Màu xe" value={v.color} />
                    <InfoRow label="Số lượng" value={String(v.quantity)} />
                    <InfoRow label="Giá niêm yết" value={formatCurrency(v.listPrice)} />
                    <InfoRow label="Giá bán" value={formatCurrency(v.salePrice)} accent="#cc0000" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Promo + Payment ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {/* Promotion */}
          <div className="glass-card p-5 lg:p-7">
            {editHeader(<div className="flex items-center gap-2"><Gift className="w-4 h-4" /> Khuyến mãi</div>, 'promo')}
            {editing === 'promo' ? (
              <div>
                <div className="form-group mt-1"><label className="form-label">Giảm giá (VNĐ)</label><input type="number" className="form-input" value={editPromo.discountAmount || ''} onChange={e => setEditPromo({ ...editPromo, discountAmount: Number(e.target.value) })} /></div>
                <div className="form-group mt-4">
                  <label className="form-label">Quà tặng</label>
                  <div className="space-y-2 mt-1">{config?.gifts && config.gifts.map(g => (
                    <label key={g} className={`checkbox-wrapper text-[12px] py-2.5 px-3 ${editPromo.gifts.includes(g) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={editPromo.gifts.includes(g)} onChange={() => toggleGift(g)} />
                      <span className="text-[12px] text-[#1a2547]">{g}</span>
                    </label>
                  ))}</div>
                </div>
                {editActions('promo')}
              </div>
            ) : (
              <>
                <InfoRow label="Giảm giá" value={formatCurrency(order.promotionInfo.discountAmount)} accent="#dc2626" />
                {order.promotionInfo.gifts.length > 0 && <InfoRow label="Quà tặng" value={order.promotionInfo.gifts.join(', ')} />}
              </>
            )}
          </div>

          {/* Payment */}
          <div className="glass-card p-5 lg:p-7">
            {editHeader(<div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Thanh toán</div>, 'payment')}
            {editing === 'payment' ? (
              <div>
                <div className="space-y-4 mt-1">
                  <div className="form-group"><label className="form-label">Phương thức</label>
                    <select className="form-select" value={editPayment.paymentMethod} onChange={e => setEditPayment({ ...editPayment, paymentMethod: e.target.value as PaymentInfo['paymentMethod'] })}>
                      <option value="CASH">Tiền mặt</option>
                      <option value="TRANSFER">Chuyển khoản</option>
                      <option value="INSTALLMENT">Trả góp</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Tiền cọc (VNĐ)</label><input type="number" className="form-input" value={editPayment.depositAmount || ''} onChange={e => setEditPayment({ ...editPayment, depositAmount: Number(e.target.value) })} /></div>
                </div>
                {editActions('payment')}
              </div>
            ) : (
              <>
                <InfoRow label="Phương thức" value={paymentMethodLabel(order.paymentInfo.paymentMethod)} />
                <InfoRow label="Tiền cọc" value={formatCurrency(order.paymentInfo.depositAmount)} />
                <InfoRow label="Tổng tiền" value={formatCurrency(order.totalAmount)} accent="#cc0000" />
                <InfoRow label="Còn lại" value={formatCurrency(order.paymentInfo.remainingAmount)} accent="#059669" />
              </>
            )}
          </div>
        </div>

        {/* ── Addons ── */}
        <div className="glass-card p-5 lg:p-7">
          {editHeader(<>Phụ kiện & dịch vụ</>, 'addons')}
          {editing === 'addons' ? (
            <div>
              <div className="space-y-2 mt-1">
                {editAddons.map((a, idx) => (
                  <label key={a.id} className={`checkbox-wrapper text-[13px] ${a.selected ? 'checked' : ''}`}>
                    <input type="checkbox" checked={a.selected} onChange={() => setEditAddons(prev => prev.map((x, i) => i === idx ? { ...x, selected: !x.selected } : x))} />
                    <div className="flex-1 flex items-center justify-between gap-3">
                      <span className="text-[#1a2547] font-medium">{a.name}</span>
                      <span className="text-primary-500 font-bold text-[13px] whitespace-nowrap">{formatCurrency(a.price)}</span>
                    </div>
                  </label>
                ))}
              </div>
              {editActions('addons')}
            </div>
          ) : (
            selectedAddons.length > 0
              ? selectedAddons.map(a => <InfoRow key={a.id} label={a.name} value={formatCurrency(a.price)} />)
              : <p className="text-[13px] text-[#94a3b8] italic">Không có phụ kiện</p>
          )}
        </div>

        {/* ── Note ── */}
        <div className="glass-card p-5 lg:p-7">
          {editHeader(<div className="flex items-center gap-2"><StickyNote className="w-4 h-4" /> Ghi chú</div>, 'note')}
          {editing === 'note' ? (
            <div>
              <textarea className="form-textarea mt-1" value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Nhập ghi chú..." />
              {editActions('note')}
            </div>
          ) : (
            <p className="text-[13px] text-[#475569] leading-relaxed">{order.note || <span className="italic text-[#94a3b8]">Không có ghi chú</span>}</p>
          )}
        </div>

        {/* Contract info if available */}
        {order.contractInfo && (
          <div className="glass-card p-5 lg:p-7 border-l-4 border-l-primary-500">
            <div className="section-title">Thông tin hợp đồng</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <InfoRow label="Số hợp đồng" value={order.contractInfo.contractNumber} mono accent="#cc0000" />
              <InfoRow label="Ngày lập" value={order.contractInfo.contractDate} />
              <InfoRow label="NV kế toán" value={order.contractInfo.accountantName} />
              {order.contractInfo.deliveryDate && <InfoRow label="Ngày giao xe" value={order.contractInfo.deliveryDate} />}
              {order.contractInfo.deliveryLocation && <InfoRow label="Địa điểm giao" value={order.contractInfo.deliveryLocation} />}
              <div className="sm:col-span-2"><InfoRow label="Bảo hành" value={order.contractInfo.warrantyPolicy} /></div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel */}
      {canCancel && (
        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 text-[13px] text-red-400 hover:text-red-600 font-semibold transition-colors" onClick={handleCancel}>
            <XCircle className="w-4 h-4" /> Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  );
}
