import {Button, Result} from 'antd';
import {ExclamationCircleFilled} from '@ant-design/icons'
import {useNavigate} from 'react-router-dom';
import {useTheme} from "../../states/ThemeContext.tsx";

function AccessDeniedPage() {
  const navigate = useNavigate();
  const {themeColors} = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      boxSizing: 'border-box',
      backgroundColor: themeColors.backgroundSecondary,
    }}>
      <Result
        icon={
          <ExclamationCircleFilled style={{fontSize: 48, color: 'orange'}}/>
        }
        title={
          <span style={{color: themeColors.text}}>
            "Unauthorized"
          </span>
        }
        subTitle={
          <span style={{color: themeColors.text}}>
          "Sorry, you are not authorized to access this page."
        </span>
        }
        extra={
          <Button style={{
            background: themeColors.accent,
            borderColor: themeColors.accent
          }}
                  onClick={() => navigate('/')}>
            <span style={{color: themeColors.text}}>Back to Home</span>
          </Button>
        }
      />
    </div>
  );
}

export default AccessDeniedPage;
