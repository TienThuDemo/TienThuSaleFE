import { Car, ChevronDown, ChevronUp, Gift, Plus, Save, Settings, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetSystemConfigQuery, useUpdateSystemConfigMutation } from '../../api/configApi';
import { showToast } from '../../utils/toastService';

type VehicleFormItem = {
  modelName: string;
  colorsText: string;
  versions: {
    name: string;
    colorPrices: Record<string, number>;
  }[];
  expanded?: boolean;
};

export default function SystemConfig() {
  const { data: config, isLoading } = useGetSystemConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateSystemConfigMutation();

  const [vehicles, setVehicles] = useState<VehicleFormItem[]>([]);
  const [addons, setAddons] = useState(config?.addons || []);
  const [gifts, setGifts] = useState(config?.gifts || []);

  useEffect(() => {
    if (config) {
      const vList = Object.entries(config.vehicles).map(([mName, data]) => ({
        modelName: mName,
        colorsText: (data.colors || []).join(', '),
        versions: data.versions.map((v: { name: string; colorPrices: Record<string, number> }) => ({
          name: v.name,
          colorPrices: { ...v.colorPrices }
        })),
        expanded: false
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVehicles(vList);
      setAddons(config.addons);
      setGifts(config.gifts);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      const parsedVehicles: Record<string, { colors: string[]; versions: { name: string; colorPrices: Record<string, number> }[] }> = {};
      vehicles.forEach(v => {
        if (!v.modelName.trim()) return;
        parsedVehicles[v.modelName.trim()] = {
          colors: v.colorsText.split(',').map(c => c.trim()).filter(Boolean),
          versions: v.versions.map(ver => ({
            name: ver.name.trim(),
            colorPrices: ver.colorPrices
          }))
        };
      });
      await updateConfig({ vehicles: parsedVehicles, addons, gifts }).unwrap();
      showToast('Cập nhật cấu hình thành công', 'success');
    } catch {
      showToast('Lỗi khi lưu cấu hình', 'info');
    }
  };

  if (isLoading) return <div className="p-10 text-center">Đang tải cấu hình...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 ring-1 ring-purple-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1a2547]">Cấu hình hệ thống</h1>
            <p className="text-[#94a3b8] text-sm">Quản lý giá xe, dịch vụ bảo dưỡng, quà tặng</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={isUpdating}>
          <Save className="w-4 h-4" /> {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Vehicles UI Config */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a2547] flex items-center gap-2">
              <Car className="w-5 h-5 text-indigo-500" /> Bảng Giá Dòng Xe
            </h2>
            <button
              className="btn-primary text-[13px] py-1.5 px-3 flex items-center gap-1.5"
              onClick={() => setVehicles([{ modelName: '', colorsText: '', versions: [], expanded: true }, ...vehicles])}
            >
              <Plus className="w-4 h-4" /> Thêm dòng xe
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {vehicles.map((v, vIdx) => (
              <div key={vIdx} className="bg-white/50 rounded-2xl border border-[#e2e5ee] p-4 transition-all">
                <div className="flex gap-3 items-center">
                  <button onClick={() => setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, expanded: !item.expanded } : item))} className="btn-ghost p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                    {v.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <input className="form-input font-bold text-[#1a2547]" value={v.modelName} onChange={e => setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, modelName: e.target.value } : item))} placeholder="Tên dòng xe (VD: Honda Vision)" />
                  </div>
                  <button className="btn-ghost text-red-500 p-2 hover:bg-red-50 rounded-xl" onClick={() => setVehicles(prev => prev.filter((_, i) => i !== vIdx))}><Trash2 className="w-4 h-4" /></button>
                </div>

                {v.expanded && (
                  <div className="pl-[42px] mt-4 space-y-5">
                    <div>
                      <label className="form-label text-[#64748b]">Các màu sắc (phân cách bằng dấu phẩy)</label>
                      <input className="form-input" value={v.colorsText} onChange={e => setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, colorsText: e.target.value } : item))} placeholder="VD: Trắng ngọc trai, Đỏ tươi, Bạc" />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <label className="form-label mb-0 text-[#1a2547] font-bold">Các phiên bản & Giá</label>
                        <button className="btn-ghost text-[12px] py-1.5 px-3 bg-white shadow-sm border border-slate-200" onClick={() => {
                          setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, versions: [...item.versions, { name: '', colorPrices: {} }] } : item));
                        }}><Plus className="w-3.5 h-3.5" /> Thêm phiên bản</button>
                      </div>

                      <div className="space-y-3">
                        {v.versions.map((ver, verIdx) => {
                          const currentColors = Array.from(new Set(v.colorsText.split(',').map(c => c.trim()).filter(Boolean)));
                          return (
                            <div key={verIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                              <div className="flex gap-2 mb-3">
                                <input className="form-input flex-1 font-semibold text-sm" value={ver.name} onChange={e => {
                                  setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, versions: item.versions.map((vr, vi) => vi === verIdx ? { ...vr, name: e.target.value } : vr) } : item))
                                }} placeholder="Tên phiên bản (VD: Tiêu chuẩn)" />
                                <button className="btn-ghost text-red-500 p-2 hover:bg-red-50 rounded-lg" onClick={() => {
                                  setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, versions: item.versions.filter((_, vi) => vi !== verIdx) } : item))
                                }}><Trash2 className="w-4 h-4" /></button>
                              </div>

                              {currentColors.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {currentColors.map(c => (
                                    <div key={c}>
                                      <div className="text-[11px] font-semibold text-[#64748b] mb-1 truncate" title={c}>{c}</div>
                                      <input type="number" className="form-input text-sm px-2.5 py-1.5" value={ver.colorPrices[c] || ''} onChange={e => {
                                        const val = Number(e.target.value);
                                        setVehicles(prev => prev.map((item, i) => i === vIdx ? { ...item, versions: item.versions.map((vr, vi) => vi === verIdx ? { ...vr, colorPrices: { ...vr.colorPrices, [c]: val } } : vr) } : item))
                                      }} placeholder="Giá (VNĐ)" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[12px] text-amber-600 italic bg-amber-50 p-2 rounded">Vui lòng nhập màu sắc trước để cài đặt giá.</div>
                              )}
                            </div>
                          );
                        })}
                        {v.versions.length === 0 && (
                          <div className="text-center p-4 text-sm text-slate-400 border border-dashed rounded-xl">Chưa có phiên bản nào</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          {/* Addons Config */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a2547] flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" /> Dịch Vụ Lắp Thêm
              </h2>
              <button
                className="btn-ghost text-sm py-1.5 px-3"
                onClick={() => setAddons([...addons, { id: Date.now().toString(), name: '', price: 0, selected: false }])}
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            <div className="space-y-3">
              {addons.map((addon, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    className="form-input flex-1"
                    value={addon.name}
                    placeholder="Tên dịch vụ"
                    onChange={(e) => setAddons(prev => prev.map((a, idx) => idx === i ? { ...a, name: e.target.value } : a))}
                  />
                  <input
                    className="form-input w-32"
                    type="number"
                    value={addon.price}
                    placeholder="Giá (VNĐ)"
                    onChange={(e) => setAddons(prev => prev.map((a, idx) => idx === i ? { ...a, price: Number(e.target.value) } : a))}
                  />
                  <button className="btn-ghost text-red-500 p-2" onClick={() => setAddons(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gifts Config */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a2547] flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-500" /> Quà Tặng Kèm
              </h2>
              <button
                className="btn-ghost text-sm py-1.5 px-3"
                onClick={() => setGifts([...gifts, ''])}
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            <div className="space-y-3">
              {gifts.map((gift, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="form-input flex-1"
                    value={gift}
                    placeholder="Tên quà tặng"
                    onChange={(e) => setGifts(prev => prev.map((g, idx) => idx === i ? e.target.value : g))}
                  />
                  <button className="btn-ghost text-red-500 p-2" onClick={() => setGifts(prev => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
