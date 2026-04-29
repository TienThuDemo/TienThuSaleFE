# 🏍️ Tiến Thu — Sales Contract Workflow

> Demo web app mô phỏng quy trình **Sale tạo đơn chốt xe → KTBH tiếp nhận → kiểm tra → bổ sung thông tin hợp đồng → xuất hợp đồng** cho đại lý ủy quyền Tiến Thu.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)

---

## 📋 Tổng quan

Ứng dụng frontend hỗ trợ **2 chế độ**: mock (localStorage) và API thật — chỉ cần đổi biến `.env`. Hai khu vực chính:

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

### Bước 3 — Cấu hình env

```bash
cp .env.example .env
```

| Biến | Giá trị | Mô tả |
|------|---------|-------|
| `VITE_API_BASE_URL` | _(trống)_ | **Mock mode** — dùng localStorage, không cần server |
| `VITE_API_BASE_URL` | `http://localhost:3001` | **json-server** — fake REST API (khuyên dùng khi dev) |
| `VITE_API_BASE_URL` | `https://api.tienthu.com.vn/v1` | **Real mode** — gọi API thật |
| `VITE_API_TIMEOUT` | `15000` | Timeout request (ms) |

### Bước 4 — Chạy json-server (terminal 1)

```bash
npm run api
```

> json-server chạy ở **http://localhost:3001**, watch `db.json` — sửa file = dữ liệu thay đổi ngay.

### Bước 5 — Chạy dev server (terminal 2)

```bash
npm run dev
```

Mở trình duyệt tại **http://localhost:5173** (port có thể thay đổi nếu bị trùng).

> **Chuyển từ json-server → API thật:** đổi `VITE_API_BASE_URL` → restart dev server → **xong, không cần sửa code.**

### Build production

```bash
npm run build
npm run preview
```

---

## 🏗️ Cấu trúc thư mục

```
src/
├── api/                            ← API Layer (NEW)
│   ├── index.ts                    # Barrel export
│   ├── client.ts                   # HTTP client (fetch wrapper)
│   ├── orderApi.ts                 # Order CRUD — gọi API/mock tuỳ env
│   ├── mockAdapter.ts              # Mock server (localStorage)
│   └── mockData.ts                 # Dữ liệu mẫu
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx           # Sidebar + routing layout
│   └── shared/
│       ├── EditableSection.tsx     # Reusable editable card
│       ├── StatCard.tsx            # Dashboard stat card
│       ├── StatusBadge.tsx         # Order status badge
│       └── Toast.tsx               # Toast notification component
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
│   └── useOrderStore.ts            # Zustand — gọi orderApi
├── types/
│   └── index.ts                    # Types, vehicle data, price lookup
├── utils/
│   ├── format.ts                   # Currency, date, ID formatters
│   └── toastService.ts             # Toast event emitter
├── App.tsx                         # Route definitions + fetchOrders
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
| `npm run dev` | Chạy Vite dev server (HMR) |
| `npm run api` | Chạy json-server (fake REST API, port 3001) |
| `npm run build` | Build production (`dist/`) |
| `npm run preview` | Preview bản build |
| `npm run lint` | Chạy ESLint |

---

## 🔌 API Contract

Khi chuyển sang server thật, backend cần implement các endpoint sau:

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/orders` | — | `{ data: Order[] }` |
| `GET` | `/orders/:id` | — | `{ data: Order }` |
| `POST` | `/orders` | `Order` | `{ data: Order }` |
| `PATCH` | `/orders/:id/status` | `{ status }` | `{ data: Order }` |
| `PUT` | `/orders/:id` | `Partial<Order>` | `{ data: Order }` |
| `PATCH` | `/orders/:id/contract` | `{ contractInfo }` | `{ data: Order }` |
| `DELETE` | `/orders/:id` | — | `{ data: null }` |

> Response format: `{ data: T, message?: string }`

---

## 📌 Ghi chú

- **Dữ liệu mock** — 2 đơn hàng mẫu (reset: xoá `localStorage` key `sales-contract-orders-v3`)
- **Mock ↔ Real** — đổi `VITE_API_BASE_URL` trong `.env` → restart → xong
- **Giá niêm yết** — tự động theo tổ hợp **dòng xe + phiên bản + màu xe** (xem `getVehiclePrice()` trong `src/types/index.ts`)
- **Optimistic updates** — store cập nhật UI ngay, sync API ở background

---

## 📄 License

Private — Internal use only.
