import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch {
      message.error('Ungültige Anmeldedaten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #EFEFE8 0%, #e4e0d4 50%, #EFEFE8 100%)',
      position: 'relative',
    }}>
      {/* Subtle decorative elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,98,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,98,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Card style={{
        width: 420,
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
        padding: '8px 4px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #c9a962 0%, #e0c882 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 4px 16px rgba(201, 169, 98, 0.3)',
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1a1a1a',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>E</span>
          </div>
          <Title level={2} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#1a1a1a',
            marginBottom: 6,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}>
            Willkommen
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
            Melden Sie sich bei EstCRM an
          </Text>
        </div>

        <Form onFinish={onFinish} size="large" layout="vertical">
          <Form.Item
            name="username"
            label={<span style={{ fontSize: 13, fontWeight: 500, color: '#6b6b6b' }}>Benutzername</span>}
            rules={[{ required: true, message: 'Benutzername eingeben' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bbb' }} />}
              placeholder="admin"
              style={{ height: 44 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ fontSize: 13, fontWeight: 500, color: '#6b6b6b' }}>Passwort</span>}
            rules={[{ required: true, message: 'Passwort eingeben' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              placeholder="Passwort"
              style={{ height: 44 }}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 28 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #c9a962 0%, #d4b56e 100%)',
                border: 'none',
              }}
            >
              Anmelden
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
