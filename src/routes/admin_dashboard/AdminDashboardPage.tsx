import {Avatar, Button, Dropdown, Flex, Layout, Menu, type MenuProps, Space, Typography} from "antd";
import {UserOutlined, LogoutOutlined, TeamOutlined, MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import {Content, Header} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";

const {Title} = Typography;
import {useAuth} from "../../states/AuthContext.tsx";
import {useState} from "react";
import UserManagement from "./components/UserManagement.tsx";

function AdminDashboardPage() {
  const {user, logout} = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const userDropboxMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined/>,
      label: user?.name
    },
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: 'Logout',
      onClick: logout
    }
  ];

  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized access');
  }

  return (
    <Layout
      style={{minHeight: '100dvh'}}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth="56px"
        style={{
          background: '#141414',
          borderRight: '1px solid #303030',
        }}
      >
        <Flex
          justify="flex-start"
          align="center"
          vertical
        >
          <Flex
            justify={collapsed ? "center" : "end"}
            align="center"
            style={{
              transition: "justify-content 1s ease"
            }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined style={{color: 'white'}}/> :
                <MenuFoldOutlined style={{color: 'white'}}/>}
              onClick={() => setCollapsed(!collapsed)}
              style={{margin: 6, fontSize: 24}}
            />
          </Flex>

          <Menu
            mode="inline"
            defaultSelectedKeys={['users']}
            style={{background: 'transparent', border: 'none'}}
            items={[
              {
                key: 'users',
                icon: <TeamOutlined/>,
                label: 'Users'
              }
            ]}
          />

          <Avatar style={{marginBottom: 16}}>
            {user.name[0]}
          </Avatar>
        </Flex>
      </Sider>

      <Layout>
        <Content style={{
          background: '#000000',
          padding: 16,
          display: 'flex',
        }}>
          <div
            style={{
              flex: 1,
              background: '#141414',
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              minHeight: '100%',
            }}>
            <UserManagement/>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminDashboardPage;