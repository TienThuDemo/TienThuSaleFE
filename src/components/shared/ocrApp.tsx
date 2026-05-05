import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface OCRAppProps {
  onScanSuccess?: (data: { idNumber?: string; fullName?: string; address?: string }) => void;
}

export default function OCRApp({ onScanSuccess }: OCRAppProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Gọi thẳng API của FPT.AI
      const response = await fetch('https://api.fpt.ai/vision/idr/vnm', {
        method: 'POST',
        headers: {
          'api-key': 'fL7RdBHvNAwSyr2pxvV8aMGbLccP1i0F',
        },
        body: formData,
      });

      const result = await response.json();
      console.log('FPT AI Result:', result);

      if (result.errorCode === 0 && result.data && result.data.length > 0) {
        const info = result.data[0];

        if (onScanSuccess) {
          onScanSuccess({
            idNumber: info.id || '',
            fullName: info.name ? info.name.toUpperCase() : '',
            address: info.address || '',
          });
        }
      } else {
        console.error('FPT OCR Error:', result);
        alert(`Không thể nhận diện ảnh! Lỗi: ${result.errorMessage || 'Vui lòng chụp lại ảnh rõ nét hơn.'}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('Đã xảy ra lỗi khi kết nối tới dịch vụ FPT OCR. Vui lòng kiểm tra mạng!');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="btn-primary py-2 px-4 text-[13px] flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        {loading ? "Đang AI xử lý..." : "Quét CCCD"}
      </button>
    </div>
  );
}
