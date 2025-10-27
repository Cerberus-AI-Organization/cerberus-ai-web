import {useEffect, useState} from "react";
import {useAuth} from "../../states/AuthContext.tsx";
import {Avatar, Button, Card, Input, message,Space,Typography} from "antd";
import {UserOutlined} from '@ant-design/icons';
import {useNavigate, useSearchParams} from "react-router-dom";

const { Title, Text } = Typography;

function LoginPage () {
  const [searchParams] = useSearchParams();
  const navigate =  useNavigate()

  const {login, isAuthenticated} = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(searchParams.get('redirect_path') || '/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!email || !password) {
      message.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        message.success('Login successful');
      } else {
        message.error('Invalid email or password');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error('Error logging in');
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
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          background: '#141414',
          border: '1px solid #303030'
        }}
      >
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <Avatar size={64} style={{background: '#1890ff', marginBottom: 16}}>
            <UserOutlined style={{fontSize: 32}}/>
          </Avatar>
          <Title level={2} style={{margin: 0, color: '#fff'}}>Welcome Back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Space direction="vertical" size="large" style={{width: '100%'}}>
          <div>
            <div style={{marginBottom: 8, color: '#fff'}}>Email</div>
            <Input
              size="large"
              prefix={<UserOutlined/>}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onPressEnter={handleSubmit}
            />
          </div>

          <div>
            <div style={{marginBottom: 8, color: '#fff'}}>Password</div>
            <Input.Password
              size="large"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleSubmit}
            />
          </div>

          <Button
            type="primary"
            size="large"
            loading={loading}
            block
            style={{height: 42}}
            onClick={handleSubmit}
          >
            Sign In
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default LoginPage;