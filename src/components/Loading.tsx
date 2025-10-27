import {Result, Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';
import {useTheme} from "../states/ThemeContext.tsx";

type LoadingProps = {
  title?: string;
  description?: string;
  extra?: React.ReactNode;
}

function Loading({title, description, extra}: LoadingProps) {
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
          <Spin indicator={<LoadingOutlined style={{fontSize: 48, color: themeColors.accent}} spin/>}/>
        }
        title={
          <span style={{color: themeColors.text}}>
            {title ? title : 'Loading...'}
          </span>
        }
        subTitle={
          <span style={{color: themeColors.text}}>
            {description ? description : 'Please wait while we load the page.'}
          </span>
        }
        extra={extra}
      />
    </div>
  );
}

export default Loading;
