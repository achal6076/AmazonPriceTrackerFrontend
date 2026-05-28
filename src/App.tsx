import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Alerts from './pages/Alerts';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">{title} — coming soon</p>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: 13, borderRadius: 12 } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard"    element={<Dashboard />} />
                <Route path="/products"     element={<Products />} />
                <Route path="/alerts"       element={<Alerts />} />
                <Route path="/history"      element={<Placeholder title="Price History" />} />
                <Route path="/categories"   element={<Placeholder title="Watched Categories" />} />
                <Route path="/deals"        element={<Placeholder title="Top Deals" />} />
                <Route path="/reports"      element={<Placeholder title="Reports" />} />
                <Route path="/integrations" element={<Placeholder title="Integrations" />} />
                <Route path="/settings"     element={<Placeholder title="Settings" />} />
                <Route path="/billing"      element={<Placeholder title="Billing" />} />
                <Route path="/support"      element={<Placeholder title="Help & Support" />} />
                <Route path="*"             element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
