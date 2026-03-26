import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import theme from './styles/theme';

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/properties" element={<Layout><Properties /></Layout>} />
            <Route path="/units" element={<Layout><Units /></Layout>} />
            <Route path="/tenants" element={<Layout><Tenants /></Layout>} />
            <Route path="/leases" element={<Layout><Leases /></Layout>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
