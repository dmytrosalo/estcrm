import { Dropdown, Avatar, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

export default function Header({ isMobile, onMenuClick }) {
  const { logout } = useAuth();

  const items = [
    {
      key: 'logout',
      label: 'Abmelden',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <div style={{
      height: isMobile ? 56 : 64,
      background: '#FFFFFF',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <MenuOutlined
            onClick={onMenuClick}
            style={{ fontSize: 18, color: '#1a1a1a', cursor: 'pointer', padding: 4 }}
          />
        )}
        <Text strong style={{
          fontSize: isMobile ? 14 : 17,
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
          fontWeight: 500,
        }}>
          {isMobile ? 'EstCRM' : 'Hausverwaltungssoftware'}
        </Text>
      </div>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar
            size={isMobile ? 30 : 34}
            icon={<UserOutlined />}
            style={{
              background: 'linear-gradient(135deg, #c9a962 0%, #e0c882 100%)',
              boxShadow: '0 2px 8px rgba(201, 169, 98, 0.25)',
            }}
          />
          {!isMobile && <Text style={{ fontSize: 13, color: '#6b6b6b' }}>Admin</Text>}
        </Space>
      </Dropdown>
    </div>
  );
}
