# 🏍️ Tiến Thu — Sales Contract Workflow

> Demo web app mô phỏng quy trình **Sale tạo đơn chốt xe → KTBH tiếp nhận → kiểm tra → bổ sung thông tin hợp đồng → xuất hợp đồng** cho đại lý ủy quyền Tiến Thu.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)

---

## 📋 Tổng quan

Ứng dụng frontend thuần (không cần backend), dữ liệu lưu trên `localStorage`. Hai khu vực chính:

| Khu vực | Route | Mô tả |
|---------|-------|-------|
| **Sale** | `/sale/*` | Dashboard, tạo đơn chốt xe, xem & chỉnh sửa đơn hàng |
| **KTBH** | `/ktbh/*` | Dashboard, danh sách đơn, xử lý & xuất hợp đồng |

### Luồng nghiệp vụ

```
Sale tạo đơn → Chờ KTBH → KTBH xác nhận thông tin → Lập hợp đồng → Xuất hợp đồng → Hoàn tất
```

### Tính năng chính

- ✅ **Tạo đơn chốt xe** — chọn xe, phiên bản, màu → giá niêm yết tự động theo phiên bản + màu xe
- ✅ **Inline editing** — Sale sửa đơn trước khi KTBH xử lý; KTBH sửa mọi thông tin
- ✅ **Auto-generate số hợp đồng** — `HD-YYYYMMDD-XXX` khi KTBH xác nhận
- ✅ **Xem trước hợp đồng** — preview HTML chuẩn in ấn
- ✅ **Responsive** — mobile-first, sidebar collapse, slide-over menu
- ✅ **Branding Tiến Thu** — navy sidebar + Honda red accent

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- **Node.js** ≥ 18
- **npm** ≥ 9

### Bước 1 — Clone repo

```bash
git clone https://github.com/HXToanDev/TienThuSale.git
cd TienThuSale
```

### Bước 2 — Cài dependencies

```bash
npm install
```

### Bước 3 — Chạy dev server

```bash
npm run dev
```

Mở trình duyệt tại **http://localhost:5173** (port có thể thay đổi nếu bị trùng).

### Build production

```bash
npm run build
npm run preview
```

---

## 🏗️ Cấu trúc thư mục

```
src/
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx          # Sidebar + routing layout
│   └── shared/
│       ├── EditableSection.tsx     # Reusable editable card
│       ├── StatCard.tsx            # Dashboard stat card
│       ├── StatusBadge.tsx         # Order status badge
│       └── Toast.tsx               # Toast notification
├── pages/
│   ├── sale/
│   │   ├── SaleDashboard.tsx       # Sale dashboard
│   │   ├── CreateOrder.tsx         # Multi-step order form
│   │   ├── OrderSummary.tsx        # Order review before submit
│   │   ├── SaleOrders.tsx          # Sale order list
│   │   └── SaleOrderDetail.tsx     # View + edit order (before KTBH)
│   └── ktbh/
│       ├── KTBHDashboard.tsx       # KTBH dashboard
│       ├── KTBHOrders.tsx          # Order list for KTBH
│       ├── OrderDetail.tsx         # Process + edit order
│       └── ContractPreview.tsx     # Contract HTML preview
├── store/
│   └── useOrderStore.ts            # Zustand + localStorage
├── types/
│   └── index.ts                    # Types, vehicle data, price lookup
├── utils/
│   └── format.ts                   # Currency, date, ID formatters
├── App.tsx                         # Route definitions
├── index.css                       # Tailwind v4 + design system
└── main.tsx                        # Entry point
```

---

## 🛠️ Tech Stack

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **React** | 19 | UI library |
| **TypeScript** | 6 | Type safety |
| **Vite** | 8 | Build tool + dev server |
| **Tailwind CSS** | 4 | Utility-first CSS (`@theme` tokens) |
| **React Router** | 7 | Client-side routing |
| **Zustand** | 5 | State management + persist |
| **Lucide React** | 1.11 | Icon library |

---

## 🎨 Design System

Định nghĩa trong `src/index.css` sử dụng Tailwind v4 `@theme`:

| Token | Giá trị | Mô tả |
|-------|---------|-------|
| `--color-primary-500` | `#cc0000` | Honda Red — primary brand |
| `--color-navy` | `#1a2547` | Sidebar & heading text |
| `--color-surface` | `#f5f6fa` | Main content background |
| `--color-accent-green` | `#059669` | Success states |

Custom components: `.glass-card`, `.btn-primary`, `.btn-success`, `.form-input`, `.section-title`, `.status-badge`, `.data-table`, `.stat-card`

---

## 📝 Scripts

| Lệnh | Mô tả |
|-------|-------|
| `npm run dev` | Chạy dev server (HMR) |
| `npm run build` | Build production (`dist/`) |
| `npm run preview` | Preview bản build |
| `npm run lint` | Chạy ESLint |

---

## 📌 Ghi chú

- **Dữ liệu mock** — 2 đơn hàng mẫu được tạo sẵn trong store, reset bằng cách xóa `localStorage` key `sales-contract-orders`
- **Không cần backend** — toàn bộ logic chạy client-side
- **Giá niêm yết** — tự động theo tổ hợp **dòng xe + phiên bản + màu xe** (xem `getVehiclePrice()` trong `src/types/index.ts`)

---

## 📄 License

Private — Internal use only.
