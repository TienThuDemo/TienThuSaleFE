import { AlertTriangle, ArrowLeft, CheckCircle, ClipboardCheck, CreditCard, FileText, Gift, Package, Pencil, Plus, Save, StickyNote, Trash2, Truck, User, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../../components/shared/StatusBadge';
import { useGetOrderByIdQuery, useUpdateOrderMutation, useUpdateOrderStatusMutation, useUpdateOrderContractMutation } from '../../api/orderApi';
import { useGetSystemConfigQuery } from '../../api/configApi';
import type { AddonItem, ContractInfo, CustomerInfo, Order, PaymentInfo, PromotionInfo, VehicleInfo } from '../../types';
import { getVehiclePrice } from '../../types';
import { formatCurrency, paymentMethodLabel } from '../../utils/format';
import { showToast } from '../../utils/toastService';

function getMissingFields(c: CustomerInfo): string[] {
  const m: string[] = [];
  if (!c.fullName) m.push('Họ tên');
  if (!c.phone) m.push('SĐT');
  if (!c.idNumber) m.push('CCCD');
  if (!c.address) m.push('Địa chỉ');
  return m;
}

function InfoRow({ label, value, accent, mono, missing }: { label: string; value: string; accent?: string; mono?: boolean; missing?: boolean }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-value ${mono ? 'font-mono' : ''} ${missing ? 'text-[#f87171] italic !font-normal' : ''}`} style={accent ? { color: accent, fontWeight: 700 } : undefined}>
        {missing ? 'Chưa nhập' : value}
      </span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: order } = useGetOrderByIdQuery(id || '', { skip: !id });
  const { data: config } = useGetSystemConfigQuery();
  const [updateStatusMutation] = useUpdateOrderStatusMutation();
  const [updateContractMutation] = useUpdateOrderContractMutation();
  const [updateOrderMutation] = useUpdateOrderMutation();

  const [contract, setContract] = useState<ContractInfo>({
    contractNumber: '', contractDate: new Date().toISOString().slice(0, 10),
    accountantName: 'Nguyễn Thị Lan', deliveryDate: '', deliveryLocation: '',
    warrantyPolicy: 'Bảo hành 3 năm hoặc 30.000km theo chính sách hãng', internalNote: '',
  });

  useEffect(() => {
    if (order?.contractInfo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContract(order.contractInfo);
    }
  }, [order?.contractInfo]);

  // Edit states for each section
  const [editSection, setEditSection] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerInfo>({ fullName: '', phone: '', idNumber: '', address: '', email: '' });
  const [editVehicles, setEditVehicles] = useState<VehicleInfo[]>([]);
  const [editPayment, setEditPayment] = useState<PaymentInfo>({ paymentMethod: 'cash', depositAmount: 0, expectedFullPaymentDate: '', remainingAmount: 0 });
  const [editPromo, setEditPromo] = useState<PromotionInfo>({ discountAmount: 0, gifts: [], promotionNote: '' });
  const [editAddons, setEditAddons] = useState<AddonItem[]>([]);
  const [editNote, setEditNote] = useState('');

  if (!order) {
    return (
      <div className="p-6 lg:p-10 text-center text-[#94a3b8]">
        <p className="font-bold text-[16px]">Không tìm thấy đơn hàng.</p>
        <button className="btn-ghost mt-4" onClick={() => navigate('/ktbh/orders')}><ArrowLeft className="w-4 h-4" /> Quay lại</button>
      </div>
    );
  }

  const canEdit = order.status === 'WAITING_KTBH' || order.status === 'INFO_CONFIRMED';
  const canCancel = order.status === 'WAITING_KTBH' || order.status === 'INFO_CONFIRMED';
  const missingFields = getMissingFields(order.customerInfo);
  const selectedAddons = order.addons.filter((a) => a.selected);

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.')) return;
    await updateStatusMutation({ id: order.id, status: 'CANCELLED' });
    showToast('Đã hủy đơn hàng', 'info');
  };

  const startEdit = (section: string) => {
    setEditSection(section);
    if (section === 'customer') setEditCustomer({ ...order.customerInfo });
    if (section === 'vehicle') setEditVehicles((order.vehicleItems ?? []).map(v => ({ ...v })));
    if (section === 'payment') setEditPayment({ ...order.paymentInfo });
    if (section === 'promo') setEditPromo({ ...order.promotionInfo });
    if (section === 'addons') setEditAddons(order.addons.map(a => ({ ...a })));
    if (section === 'note') setEditNote(order.note);
  };

  const saveEdit = async (section: string) => {
    const patch: Partial<Order> = {};
    if (section === 'customer') patch.customerInfo = editCustomer;
    if (section === 'vehicle') patch.vehicleItems = editVehicles;
    if (section === 'payment') patch.paymentInfo = editPayment;
    if (section === 'promo') patch.promotionInfo = editPromo;
    if (section === 'addons') patch.addons = editAddons;
    if (section === 'note') patch.note = editNote;
    
    await updateOrderMutation({ id: order.id, data: patch });
    setEditSection(null);
    showToast('Đã cập nhật thông tin', 'success');
  };

  const handleConfirmInfo = async () => {
    if (missingFields.length > 0) {
      showToast(`Cần bổ sung: ${missingFields.join(', ')}`, 'info');
      startEdit('customer');
      return;
    }
    // Auto-generate contract number: HD-YYYYMMDD-XXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(now.getTime() % 1000).padStart(3, '0');
    const contractNumber = `HD-${dateStr}-${seq}`;
    setContract(prev => ({ ...prev, contractNumber, contractDate: now.toISOString().slice(0, 10) }));

    await updateStatusMutation({ id: order.id, status: 'INFO_CONFIRMED' });
    showToast('Đã xác nhận — Số hợp đồng: ' + contractNumber, 'success');
  };
  const handleConfirmContract = async () => { await updateContractMutation({ id: order.id, contractInfo: contract }); await updateStatusMutation({ id: order.id, status: 'READY_TO_EXPORT_CONTRACT' }); showToast('Đã xác nhận', 'success'); };
  const handleExportContract = async () => { await updateStatusMutation({ id: order.id, status: 'CONTRACT_EXPORTED' }); showToast('Đã xuất hợp đồng', 'success'); navigate(`/ktbh/contracts/${order.id}`); };

  const stepLabels = ['Tiếp nhận', 'Xác nhận', 'Hợp đồng', 'Xuất HĐ', 'Hoàn tất'];
  const currentIdx = ['WAITING_KTBH', 'INFO_CONFIRMED', 'READY_TO_EXPORT_CONTRACT', 'CONTRACT_EXPORTED', 'COMPLETED'].indexOf(order.status);

  const updateEditVehicle = (idx: number, patch: Partial<VehicleInfo>) => {
    setEditVehicles(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v));
  };
  const addEditVehicle = () => setEditVehicles(prev => [...prev, { model: '', version: '', color: '', quantity: 1, listPrice: 0, salePrice: 0 }]);
  const removeEditVehicle = (idx: number) => {
    if (editVehicles.length <= 1) return;
    setEditVehicles(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleGift = (g: string) => setEditPromo(p => ({ ...p, gifts: p.gifts.includes(g) ? p.gifts.filter(x => x !== g) : [...p.gifts, g] }));

  // Edit header + save/cancel buttons
  const editHeader = (section: string, icon: React.ReactNode, title: string) => (
    <div className="flex items-center justify-between mb-2">
      <div className="section-title !mb-0 !pb-2">{icon} {title}</div>
      {canEdit && editSection !== section && (
        <button className="btn-ghost text-[12px]" onClick={() => startEdit(section)}><Pencil className="w-3.5 h-3.5" /> Sửa</button>
      )}
    </div>
  );

  const editActions = (section: string) => (
    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#e2e5ee]">
      <button className="btn-success text-[13px] px-5 py-2.5" onClick={() => saveEdit(section)}>
        <Save className="w-4 h-4" /> <span>Lưu thay đổi</span>
      </button>
      <button className="btn-ghost text-[13px]" onClick={() => setEditSection(null)}>
        <X className="w-4 h-4" /> Hủy
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in max-w-[900px] mx-auto">
      <button className="btn-ghost mb-6 lg:mb-8 -ml-2" onClick={() => navigate('/ktbh/orders')}><ArrowLeft className="w-4 h-4" /> Quay lại</button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-[#22d3ee]/25 to-[#22d3ee]/5 flex items-center justify-center ring-1 ring-[#22d3ee]/20 flex-shrink-0">
            <ClipboardCheck className="w-5 h-5 lg:w-6 lg:h-6 text-[#22d3ee]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-black text-[#1a2547] tracking-tight">Đơn <span className="gradient-text font-mono">{order.id}</span></h1>
            <p className="text-[12px] text-[#94a3b8] mt-1 font-medium">Sale: {order.saleName}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

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
            <span key={s} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[1px] ${i <= currentIdx ? 'text-primary-400' : 'text-[#3d4460]'}`}>{s}</span>
          ))}
        </div>
      </div>

      {/* Cancelled banner */}
      {order.status === 'CANCELLED' && (
        <div className="glass-card p-4 mb-5 border-l-4 border-l-red-500 flex items-center gap-3 bg-red-50/60">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-[13px] text-red-700 font-semibold">Đơn hàng này đã bị hủy.</p>
        </div>
      )}

      {/* Missing warning */}
      {missingFields.length > 0 && canEdit && (
        <div className="glass-card p-4 mb-5 border-l-4 border-l-[#f59e0b]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[14px] font-bold text-[#1a2547] mb-1">Thông tin chưa đầy đủ</h3>
              <p className="text-[13px] text-[#475569]">Thiếu: <span className="text-[#fbbf24] font-semibold">{missingFields.join(', ')}</span></p>
              <button className="btn-ghost mt-2 text-[#fbbf24]" onClick={() => startEdit('customer')}><Pencil className="w-3.5 h-3.5" /> Bổ sung ngay</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 lg:space-y-5">
        {/* ======= CUSTOMER ======= */}
        <div className="glass-card p-5 lg:p-7">
          {editHeader('customer', <User className="w-4 h-4" />, 'Khách hàng')}
          {editSection === 'customer' ? (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group"><label className="form-label">Họ tên <span className="required">*</span></label><input className="form-input" value={editCustomer.fullName} onChange={e => setEditCustomer({ ...editCustomer, fullName: e.target.value })} placeholder="Nguyễn Văn A" /></div>
                <div className="form-group"><label className="form-label">Điện thoại <span className="required">*</span></label><input className="form-input" value={editCustomer.phone} onChange={e => setEditCustomer({ ...editCustomer, phone: e.target.value })} placeholder="0901234567" /></div>
                <div className="form-group"><label className="form-label">CCCD <span className="required">*</span></label><input className="form-input" value={editCustomer.idNumber} onChange={e => setEditCustomer({ ...editCustomer, idNumber: e.target.value })} placeholder="079201001234" /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={editCustomer.email} onChange={e => setEditCustomer({ ...editCustomer, email: e.target.value })} /></div>
                <div className="form-group sm:col-span-2"><label className="form-label">Địa chỉ <span className="required">*</span></label><input className="form-input" value={editCustomer.address} onChange={e => setEditCustomer({ ...editCustomer, address: e.target.value })} /></div>
              </div>
              {editActions('customer')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <InfoRow label="Họ tên" value={order.customerInfo.fullName} missing={!order.customerInfo.fullName} />
              <InfoRow label="Điện thoại" value={order.customerInfo.phone} mono missing={!order.customerInfo.phone} />
              <InfoRow label="CCCD" value={order.customerInfo.idNumber} mono missing={!order.customerInfo.idNumber} />
              {order.customerInfo.email && <InfoRow label="Email" value={order.customerInfo.email} />}
              <div className="sm:col-span-2"><InfoRow label="Địa chỉ" value={order.customerInfo.address} missing={!order.customerInfo.address} /></div>
            </div>
          )}
        </div>

        {/* ======= VEHICLES ======= */}
        <div className="glass-card p-5 lg:p-7">
          <div className="flex items-center justify-between mb-2">
            <div className="section-title !mb-0 !pb-2"><Package className="w-4 h-4" /> Thông tin xe ({(order.vehicleItems ?? []).length} xe)</div>
            {canEdit && editSection !== 'vehicle' && (
              <button className="btn-ghost text-[12px]" onClick={() => startEdit('vehicle')}><Pencil className="w-3.5 h-3.5" /> Sửa</button>
            )}
          </div>
          {editSection === 'vehicle' ? (
            <div className="animate-fade-in">
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
                        <div className="form-group"><label className="form-label">Dòng xe</label>
                          <select className="form-select" value={v.model} onChange={e => {
                            const m = e.target.value;
                            const mData = config?.vehicles ? config.vehicles[m] : null;
                            const firstVer = mData?.versions[0];
                            const firstColor = mData?.colors[0] || '';
                            const price = getVehiclePrice(config?.vehicles, m, firstVer?.name || '', firstColor);
                            updateEditVehicle(idx, { model: m, version: firstVer?.name || '', color: firstColor, listPrice: price, salePrice: price });
                          }}>
                            <option value="">Chọn</option>
                            {config?.vehicles && Object.keys(config.vehicles).map(m => <option key={m}>{m}</option>)}
                          </select></div>
                        <div className="form-group"><label className="form-label">Phiên bản</label>
                          <select className="form-select" value={v.version} onChange={e => {
                            const vName = e.target.value;
                            const price = getVehiclePrice(config?.vehicles, v.model, vName, v.color);
                            updateEditVehicle(idx, { version: vName, listPrice: price, salePrice: price });
                          }}>
                            <option value="">Chọn</option>
                            {md?.versions.map(ver => <option key={ver.name}>{ver.name}</option>)}
                          </select></div>
                        <div className="form-group"><label className="form-label">Màu xe</label>
                          <select className="form-select" value={v.color} onChange={e => {
                            const color = e.target.value;
                            const price = getVehiclePrice(config?.vehicles, v.model, v.version, color);
                            updateEditVehicle(idx, { color, listPrice: price, salePrice: price });
                          }}>
                            <option value="">Chọn</option>
                            {md?.colors.map(c => <option key={c}>{c}</option>)}
                          </select></div>
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
                    <InfoRow label="Giá bán" value={formatCurrency(v.salePrice)} accent="#818cf8" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======= PROMO + PAYMENT ======= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          <div className="glass-card p-5 lg:p-7">
            {editHeader('promo', <Gift className="w-4 h-4" />, 'Khuyến mãi')}
            {editSection === 'promo' ? (
              <div className="animate-fade-in">
                <div className="form-group mb-4"><label className="form-label">Giảm giá (VNĐ)</label><input type="number" className="form-input" value={editPromo.discountAmount || ''} onChange={e => setEditPromo({ ...editPromo, discountAmount: Number(e.target.value) })} /></div>
                <div className="form-group mb-4"><label className="form-label">Quà tặng</label>
                  <div className="space-y-2 mt-1">{config?.gifts && config.gifts.map(g => (
                    <label key={g} className={`checkbox-wrapper text-[12px] py-2.5 px-3 ${editPromo.gifts.includes(g) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={editPromo.gifts.includes(g)} onChange={() => toggleGift(g)} />
                      <span className="text-[12px] text-[#1a2547]">{g}</span>
                    </label>
                  ))}</div>
                </div>
                <div className="form-group"><label className="form-label">Ghi chú KM</label><textarea className="form-textarea" rows={2} value={editPromo.promotionNote} onChange={e => setEditPromo({ ...editPromo, promotionNote: e.target.value })} /></div>
                {editActions('promo')}
              </div>
            ) : (
              <>
                <InfoRow label="Giảm giá" value={formatCurrency(order.promotionInfo.discountAmount)} accent="#fb7185" />
                {order.promotionInfo.gifts.length > 0 && <InfoRow label="Quà tặng" value={order.promotionInfo.gifts.join(', ')} />}
                {order.promotionInfo.promotionNote && <InfoRow label="Ghi chú" value={order.promotionInfo.promotionNote} />}
              </>
            )}
          </div>

          <div className="glass-card p-5 lg:p-7">
            {editHeader('payment', <CreditCard className="w-4 h-4" />, 'Thanh toán')}
            {editSection === 'payment' ? (
              <div className="animate-fade-in">
                <div className="form-group mb-4"><label className="form-label">Phương thức</label>
                  <select className="form-select" value={editPayment.paymentMethod} onChange={e => setEditPayment({ ...editPayment, paymentMethod: e.target.value as PaymentInfo['paymentMethod'] })}>
                    <option value="cash">Tiền mặt</option><option value="transfer">Chuyển khoản</option><option value="installment">Trả góp</option>
                  </select></div>
                <div className="form-group mb-4"><label className="form-label">Tiền cọc</label><input type="number" className="form-input" value={editPayment.depositAmount || ''} onChange={e => setEditPayment({ ...editPayment, depositAmount: Number(e.target.value) })} /></div>
                <div className="form-group"><label className="form-label">Ngày TT đủ</label><input type="date" className="form-input" value={editPayment.expectedFullPaymentDate} onChange={e => setEditPayment({ ...editPayment, expectedFullPaymentDate: e.target.value })} /></div>
                {editActions('payment')}
              </div>
            ) : (
              <>
                <InfoRow label="Phương thức" value={paymentMethodLabel(order.paymentInfo.paymentMethod)} />
                <InfoRow label="Tiền cọc" value={formatCurrency(order.paymentInfo.depositAmount)} />
                <InfoRow label="Tổng tiền" value={formatCurrency(order.totalAmount)} accent="#818cf8" />
                <InfoRow label="Còn lại" value={formatCurrency(order.paymentInfo.remainingAmount)} accent="#34d399" />
              </>
            )}
          </div>
        </div>

        {/* Addons */}
        <div className="glass-card p-5 lg:p-7">
          {editHeader('addons', null, 'Phụ kiện & dịch vụ')}
          {editSection === 'addons' ? (
            <div className="animate-fade-in space-y-2">
              {editAddons.map((a, idx) => (
                <label key={a.id} className={`checkbox-wrapper text-[13px] ${a.selected ? 'checked' : ''}`}>
                  <input type="checkbox" checked={a.selected} onChange={() => setEditAddons(prev => prev.map((x, i) => i === idx ? { ...x, selected: !x.selected } : x))} />
                  <div className="flex-1 flex items-center justify-between gap-3">
                    <span className="text-[#1a2547] font-medium">{a.name}</span>
                    <span className="text-[#818cf8] font-bold text-[13px] whitespace-nowrap">{formatCurrency(a.price)}</span>
                  </div>
                </label>
              ))}
              {editActions('addons')}
            </div>
          ) : (
            selectedAddons.length > 0
              ? selectedAddons.map(a => <InfoRow key={a.id} label={a.name} value={formatCurrency(a.price)} />)
              : <p className="text-[13px] text-[#94a3b8] italic">Không có phụ kiện</p>
          )}
        </div>

        {/* Note */}
        <div className="glass-card p-5 lg:p-7">
          {editHeader('note', <StickyNote className="w-4 h-4" />, 'Ghi chú')}
          {editSection === 'note' ? (
            <div className="animate-fade-in">
              <textarea className="form-textarea" rows={3} value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Ghi chú đơn hàng..." />
              {editActions('note')}
            </div>
          ) : (
            <p className="text-[13px] text-[#475569] leading-relaxed">{order.note || <span className="italic text-[#94a3b8]">Không có ghi chú</span>}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 lg:mt-10 space-y-6">
        {order.status === 'WAITING_KTBH' && (
          <div className="flex justify-center">
            <button className="btn-success text-[14px] lg:text-[16px] px-8 lg:px-12 py-3.5 lg:py-4 shadow-xl shadow-[#059669]/25 w-full sm:w-auto justify-center" onClick={handleConfirmInfo}>
              <CheckCircle className="w-5 h-5" /> <span>Xác nhận thông tin hợp lệ</span>
            </button>
          </div>
        )}

        {order.status === 'INFO_CONFIRMED' && (
          <div className="glass-card p-5 lg:p-8">
            <div className="section-title"><FileText className="w-4 h-4" /> Thông tin hợp đồng</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-2">
              <div className="form-group"><label className="form-label">Số hợp đồng <span className="text-[#34d399] text-[10px] font-bold">(tự động)</span></label><input className="form-input bg-[#cccdd1] cursor-not-allowed font-mono text-[#161111]" value={contract.contractNumber} readOnly /></div>
              <div className="form-group"><label className="form-label">Ngày lập</label><input type="date" className="form-input" value={contract.contractDate} onChange={e => setContract({ ...contract, contractDate: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">NV kế toán</label><input className="form-input" value={contract.accountantName} onChange={e => setContract({ ...contract, accountantName: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Ngày giao xe</label><input type="date" className="form-input" value={contract.deliveryDate} onChange={e => setContract({ ...contract, deliveryDate: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Địa điểm giao</label><input className="form-input" value={contract.deliveryLocation} onChange={e => setContract({ ...contract, deliveryLocation: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Bảo hành</label><input className="form-input" value={contract.warrantyPolicy} onChange={e => setContract({ ...contract, warrantyPolicy: e.target.value })} /></div>
              <div className="form-group md:col-span-2"><label className="form-label">Ghi chú nội bộ</label><textarea className="form-textarea" value={contract.internalNote} onChange={e => setContract({ ...contract, internalNote: e.target.value })} /></div>
            </div>
            <div className="flex justify-end mt-6"><button className="btn-success text-[14px] px-6 py-3 w-full sm:w-auto justify-center" onClick={handleConfirmContract}><Truck className="w-5 h-5" /> <span>Xác nhận thanh toán & giao nhận</span></button></div>
          </div>
        )}

        {order.status === 'READY_TO_EXPORT_CONTRACT' && (
          <div className="flex justify-center"><button className="btn-primary text-[14px] lg:text-[16px] px-8 lg:px-12 py-3.5 lg:py-4 w-full sm:w-auto justify-center" onClick={handleExportContract}><FileText className="w-5 h-5" /> Xuất hợp đồng</button></div>
        )}

        {order.status === 'CONTRACT_EXPORTED' && (
          <div className="flex justify-center"><button className="btn-outline-primary text-[14px] px-6 py-3 w-full sm:w-auto justify-center" onClick={() => navigate(`/ktbh/contracts/${order.id}`)}><FileText className="w-5 h-5" /> Xem hợp đồng</button></div>
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
