import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EFEFE8' }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={250}
          styles={{ body: { padding: 0, background: '#232323' }, header: { display: 'none' } }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header isMobile={isMobile} onMenuClick={() => setMobileOpen(true)} />
        <div style={{
          flex: 1,
          padding: isMobile ? '16px 12px' : '28px 32px',
          background: '#EFEFE8',
          overflow: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
