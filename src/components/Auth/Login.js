import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // Call the authenticate method exposed by our preload script
      const result = await window.api.auth.authenticate(values);
      console.log('Login result:', result);
      if (result.success) {
        // Save user data to session storage
        sessionStorage.setItem('user', JSON.stringify(result.user));
        // Navigate immediately too
        navigate('/dashboard');
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred while logging in');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '50px 16px' 
      }}>
        <Card 
          style={{ 
            width: 400, 
            maxWidth: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            marginBottom: 24
          }}>
            <img 
              src="/logo.png" 
              alt="Ship Maintenance System" 
              style={{ 
                height: 64,
                marginBottom: 16
              }} 
            />
            <Title level={3} style={{ margin: 0 }}>
              Ship Maintenance System
            </Title>
            <div style={{ 
              color: '#1890ff', 
              fontSize: 16, 
              marginTop: 8 
            }}>
              Login to your account
            </div>
          </div>
          
          {error && (
            <Alert 
              message={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
          )}
          
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Username" 
                size="large" 
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ width: '100%' }}
                size="large"
              >
                Log in
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center', color: '#888' }}>
              Default login: admin / password
            </div>
          </Form>
        </Card>
      </Content>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '16px',
        color: '#666' 
      }}>
        Ship Maintenance System &copy; 2025 - Version 1.0.0
      </div>
    </Layout>
  );
};

export default Login;