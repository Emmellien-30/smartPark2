import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FullPageLoader } from './components/common/LoadingSpinner';

import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import CarsPage           from './pages/CarsPage';
import ServicesPage       from './pages/ServicesPage';
import ServiceRecordsPage from './pages/ServiceRecordsPage';
import PaymentsPage       from './pages/PaymentsPage';
import ReportsPage        from './pages/ReportsPage';

const Private = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"           element={<Public><LoginPage /></Public>} />
    <Route path="/dashboard"       element={<Private><DashboardPage /></Private>} />
    <Route path="/cars"            element={<Private><CarsPage /></Private>} />
    <Route path="/services"        element={<Private><ServicesPage /></Private>} />
    <Route path="/service-records" element={<Private><ServiceRecordsPage /></Private>} />
    <Route path="/payments"        element={<Private><PaymentsPage /></Private>} />
    <Route path="/reports"         element={<Private><ReportsPage /></Private>} />
    <Route path="/"                element={<Navigate to="/dashboard" replace />} />
    <Route path="*"                element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background:'#1e293b', color:'#f1f5f9', borderRadius:'12px', fontSize:'14px' },
          success: { iconTheme: { primary:'#22c55e', secondary:'#fff' } },
          error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
          duration: 3500,
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
