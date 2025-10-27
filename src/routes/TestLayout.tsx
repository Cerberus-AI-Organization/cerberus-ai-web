import { useTheme } from "../states/ThemeContext";
import {useState} from "react";
import {Avatar, Layout, Menu, Switch} from "antd";
import Sider from "antd/es/layout/Sider";
import {Content} from "antd/es/layout/layout";
import {ClusterOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, SunOutlined, UserOutlined} from "@ant-design/icons";

function TestLayout() {
  const { currentTheme, themeColors, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('users');

  const menuItems = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: 'nodes',
      icon: <ClusterOutlined />,
      label: 'Nodes',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: themeColors.background }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        trigger={null}
        style={{
          backgroundColor: themeColors.backgroundSecondary,
          borderRight: currentTheme === "dark" ? '1px solid #303030' : '1px solid #f0f0f0',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: currentTheme === "dark" ? '1px solid #303030' : '1px solid #f0f0f0',
        }}>
          {!collapsed && (
            <Switch
              checked={currentTheme === "dark"}
              onChange={() => {
                setTheme(currentTheme === "dark" ? "light" : "dark");
              }}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
          )}
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', color: themeColors.text }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          style={{
            backgroundColor: themeColors.backgroundSecondary,
            border: 'none',
            flex: 1,
          }}
          items={menuItems.map(item => ({
            ...item,
            style: {
              color: selectedKey === item.key ? themeColors.text : themeColors.textSecondary,
              backgroundColor: selectedKey === item.key ? themeColors.selected : 'transparent',
              borderLeft: selectedKey === item.key ? `3px solid ${themeColors.accent}` : '3px solid transparent',
              margin: '4px 0',
            },
          }))}
        />

        <div style={{
          padding: '16px',
          borderTop: currentTheme === "dark" ? '1px solid #303030' : '1px solid #f0f0f0',
          backgroundColor: selectedKey === 'profile' ? themeColors.selected : 'transparent',
          borderLeft: selectedKey === 'profile' ? `3px solid ${themeColors.accent}` : '3px solid transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
             onClick={() => setSelectedKey('profile')}
        >
          <Avatar style={{ backgroundColor: themeColors.accent }}>JD</Avatar>
          {!collapsed && <span style={{ color: themeColors.text }}>John Doe</span>}
        </div>
      </Sider>

      <Content style={{ padding: 16, backgroundColor: themeColors.background }}>
        <div style={{
          backgroundColor: themeColors.backgroundSecondary,
          padding: 16,
          borderRadius: 8,
          minHeight: 'calc(100vh - 32px)',
          color: themeColors.text,
        }}>
          <h1 style={{ color: themeColors.text }}>
            {selectedKey === 'users' && 'Users'}
            {selectedKey === 'nodes' && 'Nodes'}
            {selectedKey === 'profile' && 'Profile'}
          </h1>
          <p style={{ color: themeColors.textSecondary }}>
            Content for {selectedKey}
          </p>
        </div>
      </Content>
    </Layout>
  )
}

export default TestLayout;