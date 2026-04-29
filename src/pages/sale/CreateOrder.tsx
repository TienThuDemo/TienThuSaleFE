import { ArrowLeft, ArrowRight, Check, Plus, Send, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toastService';
import { useCreateOrderMutation } from '../../api/orderApi';
import { useGetSystemConfigQuery } from '../../api/configApi';
import type { AddonItem, CustomerInfo, PaymentInfo, PromotionInfo, VehicleInfo } from '../../types';
import { getVehiclePrice, vehicleTotalAmount } from '../../types';
import { formatCurrency, generateOrderId } from '../../utils/format';
import OrderSummary from './OrderSummary';

const STEPS = [
  { label: 'Thông tin xe', icon: '🏍️' },
  { label: 'Khuyến mãi', icon: '🎁' },
  { label: 'Phụ kiện', icon: '🔧' },
  { label: 'Thanh toán', icon: '💳' },
  { label: 'Khách hàng', icon: '👤' },
];

const emptyVehicle = (): VehicleInfo => ({ model: '', version: '', color: '', quantity: 1, listPrice: 0, salePrice: 0 });

export default function CreateOrder() {
  const navigate = useNavigate();
  const [createOrder] = useCreateOrderMutation();
  const { data: config, isLoading } = useGetSystemConfigQuery();
  const [step, setStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const [vehicles, setVehicles] = useState<VehicleInfo[]>([emptyVehicle()]);
  const [promo, setPromo] = useState<PromotionInfo>({ discountAmount: 0, gifts: [], promotionNote: '' });
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [addonsInitialized, setAddonsInitialized] = useState(false);

  if (config && !addonsInitialized) {
    setAddons(config.addons.map((a) => ({ ...a, selected: false })));
    setAddonsInitialized(true);
  }
  const [payment, setPayment] = useState<PaymentInfo>({ paymentMethod: 'cash', depositAmount: 0, expectedFullPaymentDate: '', remainingAmount: 0 });
  const [customer, setCustomer] = useState<CustomerInfo>({ fullName: '', phone: '', idNumber: '', address: '', email: '' });
  const [note, setNote] = useState('');

  const addonTotal = addons.filter((a) => a.selected).reduce((s, a) => s + a.price, 0);
  const vTotal = vehicleTotalAmount(vehicles);
  const totalAmount = vTotal - promo.discountAmount + addonTotal;
  const remaining = totalAmount - payment.depositAmount;

  const toggleAddon = (id: string) => setAddons((prev) => prev.map((a) => a.id === id ? { ...a, selected: !a.selected } : a));
  const toggleGift = (g: string) => setPromo((p) => ({ ...p, gifts: p.gifts.includes(g) ? p.gifts.filter((x) => x !== g) : [...p.gifts, g] }));

  const updateVehicle = (idx: number, patch: Partial<VehicleInfo>) => {
    setVehicles(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v));
  };

  const addVehicle = () => setVehicles(prev => [...prev, emptyVehicle()]);
  const removeVehicle = (idx: number) => {
    if (vehicles.length <= 1) return;
    setVehicles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    await createOrder({
      id: generateOrderId(), createdAt: new Date().toISOString(), saleName: 'Trần Văn Hùng',
      status: 'WAITING_KTBH', vehicleItems: vehicles, promotionInfo: promo, addons,
      paymentInfo: { ...payment, remainingAmount: remaining }, customerInfo: customer, totalAmount, note,
    }).unwrap();
    showToast('Đã gửi đơn sang KTBH thành công!', 'success');
    navigate('/sale');
  };

  if (showSummary) {
    return <OrderSummary vehicles={vehicles} promo={promo} addons={addons} payment={{ ...payment, remainingAmount: remaining }} customer={customer} totalAmount={totalAmount} note={note} onBack={() => setShowSummary(false)} onSubmit={handleSubmit} />;
  }

  if (isLoading || !config) return <div className="p-10 text-center">Đang tải cấu hình...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in max-w-[900px] mx-auto">
      {/* Back */}
      <button className="btn-ghost mb-6 lg:mb-8 -ml-2" onClick={() => navigate('/sale')}>
        <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-primary-500/25 to-accent-violet/10 flex items-center justify-center ring-1 ring-primary-500/20 flex-shrink-0">
          <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-primary-400" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#1a2547] tracking-tight">
          Tạo đơn <span className="gradient-text">chốt xe</span>
        </h1>
      </div>
      <p className="text-[13px] lg:text-[14px] text-[#94a3b8] mb-6 lg:mb-10 ml-[52px] lg:ml-16 font-medium">Điền đầy đủ thông tin để tạo đơn hàng mới</p>

      {/* Step Indicator */}
      <div className="glass-card p-4 lg:p-6 mb-6 lg:mb-8 overflow-x-auto">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-3 cursor-pointer transition-all duration-300 ${i === step ? 'scale-105' : ''}`}
              >
                <div className="step-dot">
                  <div className={`dot ${i === step ? 'active' : i < step ? 'completed' : 'inactive'}`}>
                    {i < step ? <Check className="w-4 h-4" /> : <span className="text-sm">{s.icon}</span>}
                  </div>
                </div>
                <span className={`text-[12px] font-bold hidden lg:block whitespace-nowrap ${i === step ? 'text-primary-300' : i < step ? 'text-[#34d399]' : 'text-[#94a3b8]'
                  }`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`step-connector mx-4 ${i < step ? 'active' : 'inactive'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card p-5 sm:p-7 lg:p-10">
        {/* Step 0: Vehicles (multi) */}
        {step === 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <div className="section-title !mb-0 !pb-0">Thông tin xe ({vehicles.length} xe)</div>
              <button className="btn-ghost text-[12px] py-1.5 px-3" onClick={addVehicle}>
                <Plus className="w-3.5 h-3.5" /> Thêm xe
              </button>
            </div>

            <div className="space-y-6 mt-4">
              {vehicles.map((v, idx) => {
                const md = v.model ? config.vehicles[v.model] : null;
                return (
                  <div key={idx} className={`${vehicles.length > 1 ? 'p-5 rounded-2xl border-2 border-[#e2e5ee] bg-white/60' : ''}`}>
                    {vehicles.length > 1 && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[13px] font-bold text-[#1a2547]">🏍️ Xe #{idx + 1}</span>
                        <button className="btn-ghost text-[11px] text-red-500 hover:bg-red-50" onClick={() => removeVehicle(idx)}>
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      <div className="form-group">
                        <label className="form-label">Dòng xe <span className="required">*</span></label>
                        <select className="form-select" value={v.model} onChange={(e) => {
                          const m = e.target.value;
                          const mData = config.vehicles[m];
                          const firstVer = mData?.versions[0];
                          const firstColor = mData?.colors[0] || '';
                          const price = getVehiclePrice(config.vehicles, m, firstVer?.name || '', firstColor);
                          updateVehicle(idx, { model: m, version: firstVer?.name || '', color: firstColor, listPrice: price, salePrice: price });
                        }}>
                          <option value="">Chọn dòng xe</option>
                          {Object.keys(config.vehicles).map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phiên bản <span className="required">*</span></label>
                        <select className="form-select" value={v.version} onChange={(e) => {
                          const vName = e.target.value;
                          const color = v.color || md?.colors[0] || '';
                          const price = getVehiclePrice(config.vehicles, v.model, vName, color);
                          updateVehicle(idx, { version: vName, listPrice: price, salePrice: price });
                        }} disabled={!md}>
                          <option value="">Chọn phiên bản</option>
                          {md?.versions.map((ver) => <option key={ver.name} value={ver.name}>{ver.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Màu xe <span className="required">*</span></label>
                        <select className="form-select" value={v.color} onChange={(e) => {
                          const color = e.target.value;
                          const price = v.version ? getVehiclePrice(config.vehicles, v.model, v.version, color) : 0;
                          updateVehicle(idx, { color, listPrice: price, salePrice: price });
                        }} disabled={!md}>
                          <option value="">Chọn màu xe</option>
                          {md?.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Số lượng</label>
                        <input type="number" className="form-input" min={1} value={v.quantity} onChange={(e) => updateVehicle(idx, { quantity: Number(e.target.value) || 1 })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Giá niêm yết (VNĐ)</label>
                        <input className="form-input bg-[#f0f1f5] cursor-not-allowed opacity-70" value={v.listPrice ? formatCurrency(v.listPrice) : 'Tự động theo phiên bản + màu xe'} readOnly />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Giá bán thực tế (VNĐ) <span className="required">*</span></label>
                        <input type="number" className="form-input" value={v.salePrice || ''} onChange={(e) => updateVehicle(idx, { salePrice: Number(e.target.value) })} placeholder="VD: 32.000.000" />
                      </div>
                    </div>
                    {v.salePrice > 0 && v.listPrice > 0 && (
                      <div className="mt-4 p-4 rounded-xl bg-[#34d399]/10 border border-[#34d399]/20 flex items-center gap-4">
                        <div className="text-[12px] text-[#34d399] font-semibold">💰 Chênh lệch:</div>
                        <div className="text-[15px] font-black text-[#34d399]">{formatCurrency(v.listPrice - v.salePrice)}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total vehicles summary */}
            {vehicles.length > 1 && vTotal > 0 && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary-500/12 to-accent-violet/8 border border-primary-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider">Tổng giá trị {vehicles.length} xe</div>
                    <div className="text-2xl font-black text-primary-400 mt-1">{formatCurrency(vTotal)}</div>
                  </div>
                  <div className="text-[12px] text-[#94a3b8] font-semibold bg-[#f0f1f5] px-4 py-2 rounded-xl">{vehicles.length} xe</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Promotion */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="section-title">Khuyến mãi & quà tặng</div>
            <div className="space-y-6 mt-3">
              <div className="form-group">
                <label className="form-label">Giảm giá trực tiếp (VNĐ)</label>
                <input type="number" className="form-input" value={promo.discountAmount || ''} onChange={(e) => setPromo({ ...promo, discountAmount: Number(e.target.value) })} placeholder="VD: 1.000.000" />
              </div>
              <div className="form-group">
                <label className="form-label mb-1">Quà tặng kèm theo</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  {config.gifts.map((g) => (
                    <label key={g} className={`checkbox-wrapper ${promo.gifts.includes(g) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={promo.gifts.includes(g)} onChange={() => toggleGift(g)} />
                      <span className="text-[13px] font-semibold text-[#1a2547]">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú khuyến mãi</label>
                <textarea className="form-textarea" value={promo.promotionNote} onChange={(e) => setPromo({ ...promo, promotionNote: e.target.value })} placeholder="Mô tả chương trình khuyến mãi..." />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Addons */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="section-title">Phụ kiện & dịch vụ đi kèm</div>
            <div className="space-y-3 mt-3">
              {addons.map((a) => (
                <label key={a.id} className={`checkbox-wrapper justify-between ${a.selected ? 'checked' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={a.selected} onChange={() => toggleAddon(a.id)} />
                    <span className="text-[14px] font-semibold text-[#1a2547]">{a.name}</span>
                  </div>
                  <span className={`text-[14px] font-bold ${a.selected ? 'text-primary-400' : 'text-[#94a3b8]'}`}>{formatCurrency(a.price)}</span>
                </label>
              ))}
            </div>
            <div className="mt-7 p-6 rounded-2xl bg-gradient-to-r from-primary-500/12 to-accent-violet/8 border border-primary-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-[#94a3b8] font-bold uppercase tracking-wider">Tổng phụ kiện & dịch vụ</div>
                  <div className="text-3xl font-black text-primary-400 mt-2">{formatCurrency(addonTotal)}</div>
                </div>
                <div className="text-[13px] text-[#94a3b8] font-semibold bg-[#f0f1f5] px-4 py-2 rounded-xl">{addons.filter(a => a.selected).length}/{addons.length} đã chọn</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="section-title">Thanh toán & đặt cọc</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
              <div className="form-group">
                <label className="form-label">Phương thức thanh toán</label>
                <select className="form-select" value={payment.paymentMethod} onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value as PaymentInfo['paymentMethod'] })}>
                  <option value="cash">💵 Tiền mặt</option>
                  <option value="transfer">🏦 Chuyển khoản</option>
                  <option value="installment">📋 Trả góp</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền cọc (VNĐ)</label>
                <input type="number" className="form-input" value={payment.depositAmount || ''} onChange={(e) => setPayment({ ...payment, depositAmount: Number(e.target.value) })} placeholder="VD: 5.000.000" />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Ngày dự kiến thanh toán đủ</label>
                <input type="date" className="form-input" value={payment.expectedFullPaymentDate} onChange={(e) => setPayment({ ...payment, expectedFullPaymentDate: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7 lg:w-3/4 mx-auto">
              <div className="p-6 rounded-2xl bg-[#ffffff] border-2 border-[#e2e5ee]">
                <div className="text-[12px] text-[#94a3b8] font-bold uppercase tracking-wider">Tổng đơn hàng</div>
                <div className="text-2xl font-black text-[#1a2547] mt-2">{formatCurrency(totalAmount)}</div>
              </div>
              <div className="p-6 rounded-2xl bg-[#34d399]/8 border-2 border-[#34d399]/20">
                <div className="text-[12px] text-[#94a3b8] font-bold uppercase tracking-wider">Còn lại sau cọc</div>
                <div className="text-2xl font-black text-[#34d399] mt-2">{formatCurrency(remaining > 0 ? remaining : 0)}</div>
              </div>
            </div>

            <div className="form-group mt-6">
              <label className="form-label">Ghi chú đơn hàng</label>
              <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm cho đơn hàng..." />
            </div>
          </div>
        )}

        {/* Step 4: Customer */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="section-title">Thông tin khách hàng</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
              <div className="form-group">
                <label className="form-label">Họ và tên <span className="required">*</span></label>
                <input className="form-input" value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại <span className="required">*</span></label>
                <input className="form-input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="0901234567" />
              </div>
              <div className="form-group">
                <label className="form-label">CCCD / CMND <span className="required">*</span></label>
                <input className="form-input" value={customer.idNumber} onChange={(e) => setCustomer({ ...customer, idNumber: e.target.value })} placeholder="079201001234" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Địa chỉ <span className="required">*</span></label>
                <input className="form-input" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện, TP" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between mt-8 lg:mt-10 pt-5 lg:pt-7 border-t-2 border-[#e2e5ee] gap-3">
          <button className="btn-secondary justify-center" onClick={() => step > 0 ? setStep(step - 1) : navigate('/sale')}>
            <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Hủy' : 'Quay lại'}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary text-[14px] lg:text-[15px] px-6 lg:px-8 py-3 lg:py-3.5 justify-center" onClick={() => setStep(step + 1)}>
              <span>Tiếp theo</span> <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="btn-success text-[14px] lg:text-[15px] px-6 lg:px-8 py-3 lg:py-3.5 justify-center" onClick={() => setShowSummary(true)}>
              <Send className="w-5 h-5" /> <span>Tổng kết deal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
