import { ArrowLeft, Send, Receipt } from 'lucide-react';
import { formatCurrency, paymentMethodLabel } from '../../utils/format';
import type { VehicleInfo, PromotionInfo, AddonItem, PaymentInfo, CustomerInfo } from '../../types';

interface Props {
  vehicles: VehicleInfo[]; promo: PromotionInfo; addons: AddonItem[];
  payment: PaymentInfo; customer: CustomerInfo; totalAmount: number;
  note: string; onBack: () => void; onSubmit: () => void;
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-value ${bold ? '!font-bold' : ''}`} style={accent ? { color: accent } : undefined}>{value}</span>
    </div>
  );
}

export default function OrderSummary({ vehicles, promo, addons, payment, customer, totalAmount, note, onBack, onSubmit }: Props) {
  const selectedAddons = addons.filter((a) => a.selected);
  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in max-w-[800px] mx-auto">
      <button className="btn-ghost mb-6 lg:mb-8 -ml-2" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Quay lại chỉnh sửa</button>

      <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-[#34d399]/25 to-[#34d399]/5 flex items-center justify-center ring-1 ring-[#34d399]/20 flex-shrink-0">
          <Receipt className="w-5 h-5 lg:w-6 lg:h-6 text-[#34d399]" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#1a2547] tracking-tight">
          Tổng kết <span className="gradient-text">Deal</span>
        </h1>
      </div>
      <p className="text-[13px] lg:text-[14px] text-[#94a3b8] mb-6 lg:mb-10 ml-[52px] lg:ml-16 font-medium">Xác nhận thông tin trước khi gửi sang KTBH</p>

      <div className="space-y-5">
        <div className="glass-card p-5 lg:p-7">
          <div className="section-title">Khách hàng</div>
          <Row label="Họ tên" value={customer.fullName} bold />
          <Row label="Điện thoại" value={customer.phone} />
          <Row label="CCCD" value={customer.idNumber} />
          <Row label="Địa chỉ" value={customer.address} />
          {customer.email && <Row label="Email" value={customer.email} />}
        </div>

        {/* Vehicles */}
        <div className="glass-card p-5 lg:p-7">
          <div className="section-title">Thông tin xe ({vehicles.length} xe)</div>
          {vehicles.map((v, idx) => (
            <div key={idx} className={`${idx > 0 ? 'mt-5 pt-5 border-t border-[#e2e5ee]' : ''}`}>
              {vehicles.length > 1 && (
                <div className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Xe #{idx + 1}</div>
              )}
              <Row label="Dòng xe" value={v.model} bold />
              <Row label="Phiên bản" value={v.version} />
              <Row label="Màu xe" value={v.color} />
              <Row label="Số lượng" value={String(v.quantity)} />
              <Row label="Giá niêm yết" value={formatCurrency(v.listPrice)} />
              <Row label="Giá bán thực tế" value={formatCurrency(v.salePrice)} bold accent="#818cf8" />
            </div>
          ))}
        </div>

        {(promo.discountAmount > 0 || promo.gifts.length > 0) && (
          <div className="glass-card p-5 lg:p-7">
            <div className="section-title">Khuyến mãi</div>
            {promo.discountAmount > 0 && <Row label="Giảm giá" value={`-${formatCurrency(promo.discountAmount)}`} accent="#f87171" />}
            {promo.gifts.length > 0 && <Row label="Quà tặng" value={promo.gifts.join(', ')} />}
            {promo.promotionNote && <Row label="Ghi chú KM" value={promo.promotionNote} />}
          </div>
        )}

        {selectedAddons.length > 0 && (
          <div className="glass-card p-5 lg:p-7">
            <div className="section-title">Phụ kiện & dịch vụ</div>
            {selectedAddons.map((a) => <Row key={a.id} label={a.name} value={formatCurrency(a.price)} />)}
            <div className="mt-3 pt-4 border-t-2 border-[#e2e5ee]">
              <Row label="Tổng phụ kiện" value={formatCurrency(addonTotal)} bold />
            </div>
          </div>
        )}

        <div className="glass-card p-5 lg:p-7">
          <div className="section-title">Thanh toán</div>
          <Row label="Phương thức" value={paymentMethodLabel(payment.paymentMethod)} />
          <Row label="Tiền cọc" value={formatCurrency(payment.depositAmount)} />
          {payment.expectedFullPaymentDate && <Row label="Ngày TT đủ" value={payment.expectedFullPaymentDate} />}
          <div className="mt-3 pt-4 border-t-2 border-[#e2e5ee]">
            <Row label="TỔNG TIỀN" value={formatCurrency(totalAmount)} bold accent="#818cf8" />
            <Row label="CÒN LẠI" value={formatCurrency(payment.remainingAmount)} bold accent="#34d399" />
          </div>
        </div>

        {note && (
          <div className="glass-card p-5 lg:p-7">
            <div className="section-title">Ghi chú</div>
            <p className="text-[14px] text-[#475569] leading-relaxed">{note}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between mt-8 lg:mt-10 gap-3">
        <button className="btn-secondary justify-center" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Chỉnh sửa</button>
        <button className="btn-success text-[14px] lg:text-[16px] px-8 lg:px-10 py-3.5 lg:py-4 shadow-xl shadow-[#059669]/20 justify-center" onClick={onSubmit}>
          <Send className="w-5 h-5" /> <span>Gửi sang KTBH</span>
        </button>
      </div>
    </div>
  );
}
