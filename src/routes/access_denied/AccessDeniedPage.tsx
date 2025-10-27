import {Button, Result} from 'antd';
import {ExclamationCircleFilled} from '@ant-design/icons'
import {useNavigate} from 'react-router-dom';

function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      boxSizing: 'border-box',
    }}>
      <Result
        icon={
          <ExclamationCircleFilled style={{fontSize: 48, color: 'orange'}}/>
        }
        title="Unauthorized"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        }
      />
    </div>
  );
}

export default AccessDeniedPage;
