import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ToastContainer from './components/shared/Toast';
import SaleDashboard from './pages/sale/SaleDashboard';
import CreateOrder from './pages/sale/CreateOrder';
import SaleOrders from './pages/sale/SaleOrders';
import SaleOrderDetail from './pages/sale/SaleOrderDetail';
import KTBHDashboard from './pages/ktbh/KTBHDashboard';
import KTBHOrders from './pages/ktbh/KTBHOrders';
import OrderDetail from './pages/ktbh/OrderDetail';
import ContractPreview from './pages/ktbh/ContractPreview';
import SystemConfig from './pages/admin/SystemConfig';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { AUTH_ROUTES } from './features/auth/auth.constants';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public auth routes */}
        <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={AUTH_ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Sale routes */}
            <Route path="/sale" element={<SaleDashboard />} />
            <Route path="/sale/create-order" element={<CreateOrder />} />
            <Route path="/sale/orders" element={<SaleOrders />} />
            <Route path="/sale/orders/:id" element={<SaleOrderDetail />} />

            {/* KTBH routes */}
            <Route path="/ktbh" element={<KTBHDashboard />} />
            <Route path="/ktbh/orders" element={<KTBHOrders />} />
            <Route path="/ktbh/orders/:id" element={<OrderDetail />} />
            <Route path="/ktbh/contracts/:id" element={<ContractPreview />} />

            {/* Admin routes */}
            <Route path="/admin/config" element={<SystemConfig />} />

            {/* Default */}
            <Route path="/" element={<Navigate to="/sale" replace />} />
            <Route path="*" element={<Navigate to="/sale" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
