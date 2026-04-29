import type { ReactNode } from 'react';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Bảo mật doanh nghiệp',
    description: 'JWT + xoay refresh token, phát hiện tái sử dụng theo chuẩn OWASP.',
  },
  {
    icon: Zap,
    title: 'Hiệu năng tối ưu',
    description: 'Caching thông minh, deduplicate request, tải dữ liệu song song.',
  },
  {
    icon: Sparkles,
    title: 'Trải nghiệm mượt mà',
    description: 'Giao diện hiện đại, phản hồi tức thì cho mọi luồng nghiệp vụ.',
  },
];

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Brand panel */}
      <aside className="hidden lg:flex relative w-1/2 xl:w-2/5 flex-col justify-between p-12 overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1a2547 0%, #243056 45%, #cc0000 130%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(204,0,0,0.4) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
            <img
              src="https://www.tienthu.com.vn/frontend/images/tuyendung/icon-1.png"
              alt="Tiến Thu"
              className="w-7 h-7"
            />
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-lg">Tiến Thu</div>
            <div className="text-xs text-white/60">Hệ thống quản lý hợp đồng</div>
          </div>
        </div>

        <div className="relative z-10 space-y-7">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
              Quản lý đơn hàng &amp; hợp đồng
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-red-300 bg-clip-text text-transparent">
                hiệu quả từ ngày đầu tiên.
              </span>
            </h2>
            <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-md">
              Nền tảng nội bộ dành cho đội ngũ Sale, Kế toán bán hàng và quản trị viên — luôn đồng bộ, luôn an toàn.
            </p>
          </div>

          <ul className="space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/15">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-white/70 leading-snug">{item.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Tiến Thu. All rights reserved.
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg">
              <img
                src="https://www.tienthu.com.vn/frontend/images/tuyendung/icon-1.png"
                alt="Tiến Thu"
                className="w-7 h-7"
              />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight">Tiến Thu</div>
              <div className="text-[11px] text-slate-500">Hệ thống quản lý hợp đồng</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          {children}

          {footer ? <div className="mt-8 text-center text-sm text-slate-500">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
