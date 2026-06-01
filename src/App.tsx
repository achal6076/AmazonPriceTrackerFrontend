import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Alerts from './pages/Alerts';
import History from './pages/History';
import Categories from './pages/Categories';
import Deals from './pages/Deals';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Support from './pages/Support';
import Integrations from './pages/Integrations';

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
                <Route path="/history"      element={<History />} />
                <Route path="/categories"   element={<Categories />} />
                <Route path="/deals"        element={<Deals />} />
                <Route path="/reports"      element={<Reports />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings"     element={<Settings />} />
                <Route path="/billing"      element={<Billing />} />
                <Route path="/support"      element={<Support />} />
                <Route path="*"             element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
