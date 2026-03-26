import { Menu } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/properties', icon: <HomeOutlined />, label: 'Immobilien' },
  { key: '/units', icon: <AppstoreOutlined />, label: 'Wohneinheiten' },
  { key: '/tenants', icon: <TeamOutlined />, label: 'Mieter' },
  { key: '/leases', icon: <FileTextOutlined />, label: 'Mietverträge' },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = ({ key }) => {
    navigate(key);
    onNavigate?.();
  };

  return (
    <div style={{
      width: 250,
      minHeight: '100vh',
      background: '#232323',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #c9a962 0%, #e0c882 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#1a1a1a',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>E</div>
          <div>
            <div style={{ color: '#ffffff', fontSize: 15, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 }}>EstCRM</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 400, letterSpacing: '0.02em' }}>Hausverwaltung</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: 8, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>Navigation</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleClick}
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </div>
    </div>
  );
}
