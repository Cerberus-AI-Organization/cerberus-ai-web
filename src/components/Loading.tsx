import {Result, Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';

type LoadingProps = {
  title?: string;
  description?: string;
  extra?: React.ReactNode;
}

function Loading({ title, description, extra }: LoadingProps) {
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
          <Spin indicator={<LoadingOutlined style={{fontSize: 48, color: 'orange'}}  spin />} />
        }
        title={title ? title : 'Loading...'}
        subTitle={description ? description : 'Please wait while we load the page.'}
        extra={extra}
      />
    </div>
  );
}

export default Loading;
