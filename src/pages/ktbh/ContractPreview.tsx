import { ArrowLeft, Download, FolderCheck, Printer } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../../components/shared/StatusBadge';
import { showToast } from '../../utils/toastService';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '../../api/orderApi';
import { formatCurrency, formatDate } from '../../utils/format';

export default function ContractPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: order } = useGetOrderByIdQuery(id || '', { skip: !id });
  const [updateStatusMutation] = useUpdateOrderStatusMutation();

  if (!order || !order.contractInfo) {
    return (
      <div className="p-8 text-center text-text-muted">
        <p className="font-medium">Không tìm thấy hợp đồng.</p>
        <button className="btn-ghost mt-4" onClick={() => navigate('/ktbh/orders')}><ArrowLeft className="w-4 h-4" /> Quay lại</button>
      </div>
    );
  }

  const c = order.contractInfo;
  const selectedAddons = order.addons.filter((a) => a.selected);
  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);

  const handlePrint = () => window.print();
  const handleDownload = () => showToast('Đã tải PDF demo thành công', 'info');
  const handleComplete = async () => {
    await updateStatusMutation({ id: order.id, status: 'COMPLETED' });
    showToast('Hồ sơ đã hoàn tất!', 'success');
    navigate('/ktbh/orders');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in">
      {/* Top Bar */}
      <div className="no-print max-w-[880px] mx-auto mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <button className="btn-ghost -ml-2" onClick={() => navigate(`/ktbh/orders/${order.id}`)}>
            <ArrowLeft className="w-4 h-4" /> Quay lại đơn hàng
          </button>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-extrabold text-text-primary tracking-tight truncate">
              Hợp đồng <span className="gradient-text font-mono">{c.contractNumber}</span>
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Khách hàng: {order.customerInfo.fullName}</p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <button className="btn-secondary text-xs" onClick={handlePrint}><Printer className="w-3.5 h-3.5" /> In</button>
            <button className="btn-secondary text-xs" onClick={handleDownload}><Download className="w-3.5 h-3.5" /> PDF</button>
            {order.status !== 'COMPLETED' && (
              <button className="btn-success text-xs" onClick={handleComplete}><FolderCheck className="w-3.5 h-3.5" /> <span>Hoàn tất</span></button>
            )}
          </div>
        </div>
      </div>

      {/* Contract Document */}
      <div className="contract-page">
        <div style={{ textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
          <div style={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: 1 }}>Độc lập — Tự do — Hạnh phúc</div>
          <div style={{ width: 120, height: 1, background: '#333', margin: '10px auto 28px' }} />
        </div>

        <h1>HỢP ĐỒNG MUA BÁN XE MÁY</h1>
        <h2>Số: {c.contractNumber} — Ngày {formatDate(c.contractDate)}</h2>

        <div className="contract-section">
          <div className="contract-section-title">Điều I. Bên bán (Bên A)</div>
          <div className="contract-row"><span className="contract-label">Đơn vị:</span><span className="contract-value">Công ty TNHH Tiến Thu</span></div>
          <div className="contract-row"><span className="contract-label">Địa chỉ:</span><span className="contract-value">179 Phan Châu Trinh, Phường Hải Châu, TP Đà Nẵng</span></div>
          <div className="contract-row"><span className="contract-label">Điện thoại:</span><span className="contract-value">1800 255 898</span></div>
          <div className="contract-row"><span className="contract-label">Người đại diện:</span><span className="contract-value">{c.accountantName}</span></div>
        </div>

        <div className="contract-section">
          <div className="contract-section-title">Điều II. Bên mua (Bên B)</div>
          <div className="contract-row"><span className="contract-label">Họ và tên:</span><span className="contract-value" style={{ fontWeight: 'bold' }}>{order.customerInfo.fullName}</span></div>
          <div className="contract-row"><span className="contract-label">CCCD/CMND:</span><span className="contract-value">{order.customerInfo.idNumber}</span></div>
          <div className="contract-row"><span className="contract-label">Địa chỉ:</span><span className="contract-value">{order.customerInfo.address}</span></div>
          <div className="contract-row"><span className="contract-label">Điện thoại:</span><span className="contract-value">{order.customerInfo.phone}</span></div>
          {order.customerInfo.email && <div className="contract-row"><span className="contract-label">Email:</span><span className="contract-value">{order.customerInfo.email}</span></div>}
        </div>

        <div className="contract-section">
          <div className="contract-section-title">Điều III. Nội dung xe mua bán ({(order.vehicleItems ?? []).length} xe)</div>
          {(order.vehicleItems ?? []).map((v, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-3 pt-3' : ''} style={idx > 0 ? { borderTop: '1px dashed #cbd5e1' } : undefined}>
              {(order.vehicleItems ?? []).length > 1 && (
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 4 }}>Xe #{idx + 1}</div>
              )}
              <div className="contract-row"><span className="contract-label">Dòng xe:</span><span className="contract-value" style={{ fontWeight: 'bold' }}>{v.model}</span></div>
              <div className="contract-row"><span className="contract-label">Phiên bản:</span><span className="contract-value">{v.version}</span></div>
              <div className="contract-row"><span className="contract-label">Màu sắc:</span><span className="contract-value">{v.color}</span></div>
              <div className="contract-row"><span className="contract-label">Số lượng:</span><span className="contract-value">{v.quantity} chiếc</span></div>
              <div className="contract-row"><span className="contract-label">Giá bán:</span><span className="contract-value" style={{ fontWeight: 'bold' }}>{formatCurrency(v.salePrice)}</span></div>
            </div>
          ))}
        </div>

        <div className="contract-section">
          <div className="contract-section-title">Điều IV. Ưu đãi & phụ kiện</div>
          {order.promotionInfo.discountAmount > 0 && (
            <div className="contract-row"><span className="contract-label">Giảm giá ưu đãi:</span><span className="contract-value">- {formatCurrency(order.promotionInfo.discountAmount)}</span></div>
          )}
          {order.promotionInfo.gifts.length > 0 && (
            <div className="contract-row"><span className="contract-label">Quà tặng kèm:</span><span className="contract-value">{order.promotionInfo.gifts.join('; ')}</span></div>
          )}
          {selectedAddons.length > 0 && selectedAddons.map((a) => (
            <div key={a.id} className="contract-row"><span className="contract-label">{a.name}:</span><span className="contract-value">{formatCurrency(a.price)}</span></div>
          ))}
          {addonTotal > 0 && (
            <div className="contract-row" style={{ fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 6 }}>
              <span className="contract-label">Tổng phụ kiện/DV:</span><span className="contract-value">{formatCurrency(addonTotal)}</span>
            </div>
          )}
        </div>

        <div className="contract-section" style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <div className="contract-section-title" style={{ borderBottom: 'none', paddingBottom: 0 }}>Điều V. Thanh toán</div>
          <div className="contract-row"><span className="contract-label">Tổng giá trị HĐ:</span><span className="contract-value" style={{ fontWeight: 'bold', fontSize: 16, color: '#1a1a1a' }}>{formatCurrency(order.totalAmount)}</span></div>
          <div className="contract-row"><span className="contract-label">Đã đặt cọc:</span><span className="contract-value">{formatCurrency(order.paymentInfo.depositAmount)}</span></div>
          <div className="contract-row"><span className="contract-label">Số tiền còn lại:</span><span className="contract-value" style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(order.paymentInfo.remainingAmount)}</span></div>
        </div>

        <div className="contract-section">
          <div className="contract-section-title">Điều VI. Giao xe & bảo hành</div>
          {c.deliveryDate && <div className="contract-row"><span className="contract-label">Ngày giao xe:</span><span className="contract-value">{formatDate(c.deliveryDate)}</span></div>}
          {c.deliveryLocation && <div className="contract-row"><span className="contract-label">Địa điểm giao xe:</span><span className="contract-value">{c.deliveryLocation}</span></div>}
          <div className="contract-row"><span className="contract-label">Chính sách BH:</span><span className="contract-value">{c.warrantyPolicy}</span></div>
        </div>

        <div className="contract-section">
          <div className="contract-section-title">Điều VII. Điều khoản cam kết</div>
          <div style={{ fontSize: 13, lineHeight: 2.1 }}>
            <p>1. Bên A cam kết giao xe mới 100%, đúng model, phiên bản và màu sắc như đã thỏa thuận trong hợp đồng.</p>
            <p>2. Bên B cam kết thanh toán đầy đủ số tiền còn lại trước hoặc vào thời điểm nhận xe.</p>
            <p>3. Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
            <p>4. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng hòa giải. Trường hợp không đạt được thỏa thuận, hai bên sẽ đưa ra cơ quan có thẩm quyền giải quyết.</p>
          </div>
        </div>

        <div className="signature-area">
          <div className="signature-box">
            <div className="title">Đại diện Bên A</div>
            <div className="note">(Ký, ghi rõ họ tên, đóng dấu)</div>
            <div className="line">{c.accountantName}</div>
          </div>
          <div className="signature-box">
            <div className="title">Bên B (Khách hàng)</div>
            <div className="note">(Ký, ghi rõ họ tên)</div>
            <div className="line">{order.customerInfo.fullName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
