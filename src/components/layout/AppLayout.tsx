import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  FilePlus2,
  LayoutDashboard,
  Menu,
  Settings,
  X
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const saleNav = [
  { to: '/sale', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/sale/create-order', icon: FilePlus2, label: 'Tạo đơn chốt xe' },
  { to: '/sale/orders', icon: FileCheck2, label: 'Đơn hàng của tôi' },
];

const ktbhNav = [
  { to: '/ktbh', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/ktbh/orders', icon: ClipboardList, label: 'Danh sách đơn' },
];

const adminNav = [
  { to: '/admin/config', icon: Settings, label: 'Cấu hình hệ thống', end: false },
];

/* ── Sidebar color tokens ── */
const S = {
  bg: '#162040',          // sidebar background
  bgHover: '#1e2d55',    // item hover bg
  bgActive: '#243565',   // active item bg
  border: '#1e2d55',     // subtle borders
  textMuted: '#7b8ab3',  // inactive text
  textHover: '#c8d1ec',  // hover text
  textActive: '#ffffff',  // active text
  accent: '#ef4444',     // red accent highlight
  accentGlow: 'rgba(239,68,68,0.15)', // red glow
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isKTBH = location.pathname.startsWith('/ktbh');
  const isAdmin = location.pathname.startsWith('/admin');
  const currentNav = isAdmin ? adminNav : isKTBH ? ktbhNav : saleNav;
  const roleLabel = isAdmin ? 'QUẢN TRỊ HỆ THỐNG' : isKTBH ? 'KẾ TOÁN BÁN HÀNG' : 'NHÂN VIÊN SALE';
  const roleBadgeColor = isAdmin ? 'from-purple-500 to-indigo-600' : isKTBH ? 'from-amber-500 to-orange-600' : 'from-red-500 to-red-700';
  const userName = isAdmin ? 'Admin' : isKTBH ? 'Nguyễn Thị Lan' : 'Trần Văn Hùng';
  const userRole = isAdmin ? 'ADMIN' : isKTBH ? 'KTBH' : 'SALE';
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className="relative flex items-center gap-3 px-5 lg:px-6 h-[72px] flex-shrink-0"
        style={{ borderBottom: `1px solid ${S.border}` }}
      >
        <div >
          <img src="https://www.tienthu.com.vn/frontend/images/tuyendung/icon-1.png" alt="logo" className="w-8 h-8" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <div className="font-extrabold text-base text-white tracking-tight">Tiến Thu</div>
            <div className="text-[11px] font-medium" style={{ color: S.textMuted }}>Quản lý hợp đồng</div>
          </div>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: S.textMuted }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = S.bgHover; }}
          onMouseLeave={e => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role label */}
      {!collapsed && (
        <div className="px-5 lg:px-6 pt-5 pb-2">
          <span className="text-[10px] font-bold tracking-[2px]" style={{ color: S.textMuted, opacity: 0.5 }}>{roleLabel}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 lg:px-4 py-3 space-y-1 overflow-y-auto">
        {currentNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 sidebar-link ${isActive ? 'sidebar-active' : 'sidebar-inactive'}`
            }
            style={({ isActive }) => isActive ? {
              background: S.bgActive,
              color: S.textActive,
              borderLeft: `3px solid ${S.accent}`,
              boxShadow: `inset 0 0 20px ${S.accentGlow}`,
            } : {
              color: S.textMuted,
              borderLeft: '3px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? S.accent : 'inherit',
                  }}
                >
                  <item.icon className="w-[17px] h-[17px]" />
                </div>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Role Switcher */}
      <div className="px-3 lg:px-4 pb-3 flex flex-col gap-2">
        {!isAdmin && (
          <NavLink
            to="/admin/config"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{ color: S.textMuted, border: `1px dashed ${S.border}` }}
            onMouseEnter={e => { e.currentTarget.style.color = S.textHover; e.currentTarget.style.background = S.bgHover; e.currentTarget.style.borderColor = S.textMuted; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = S.border; }}
          >
            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Chuyển Admin</span>}
          </NavLink>
        )}
        {!isKTBH && (
          <NavLink
            to="/ktbh"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{ color: S.textMuted, border: `1px dashed ${S.border}` }}
            onMouseEnter={e => { e.currentTarget.style.color = S.textHover; e.currentTarget.style.background = S.bgHover; e.currentTarget.style.borderColor = S.textMuted; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = S.border; }}
          >
            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Chuyển KTBH</span>}
          </NavLink>
        )}
        {(isAdmin || isKTBH) && (
          <NavLink
            to="/sale"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{ color: S.textMuted, border: `1px dashed ${S.border}` }}
            onMouseEnter={e => { e.currentTarget.style.color = S.textHover; e.currentTarget.style.background = S.bgHover; e.currentTarget.style.borderColor = S.textMuted; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = S.border; }}
          >
            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Chuyển Sale</span>}
          </NavLink>
        )}
      </div>

      {/* Collapse — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex mx-4 mb-3 items-center justify-center py-2.5 rounded-xl transition-all"
        style={{ color: S.textMuted }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = S.bgHover; }}
        onMouseLeave={e => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User */}
      <div className="relative px-4 pb-5 pt-4" style={{ borderTop: `1px solid ${S.border}` }}>
        <div className="flex items-center gap-3 px-2">
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleBadgeColor} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
              {userName.charAt(0)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400" style={{ border: `3px solid ${S.bg}` }} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-[13px] font-bold text-white truncate">{userName}</div>
              <div className="text-[11px] font-medium" style={{ color: S.textMuted }}>{userRole}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden flex items-center h-14 px-4" style={{ background: S.bg, borderBottom: `1px solid ${S.border}` }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: S.textMuted }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = S.bgHover; }}
          onMouseLeave={e => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5 ml-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
            <img src="https://www.tienthu.com.vn/frontend/images/tuyendung/icon-1.png" alt="logo" className="w-8 h-8" />
          </div>
          <span className="font-bold text-white text-sm">Tiến Thu</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`relative hidden lg:flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-[80px]' : 'w-[280px]'}`}
        style={{ background: S.bg }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: S.bg }}
      >
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative pt-14 lg:pt-0" style={{ background: '#f5f6fa' }}>
        <Outlet />
      </main>
    </div>
  );
}
