import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Avatar, Menu, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import SideNavigation from './SideNavigation';
import { mainMenuItems, getSubMenu } from '../../utils/menuConfig';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMainMenu, setSelectedMainMenu] = useState('start');
  const [shipName, setShipName] = useState('Marseus V');
  const [user, setUser] = useState({ name: 'Demo' });

  // Determine which main menu item is selected based on the current path
  useEffect(() => {
    const path = location.pathname;
    const mainMenu = mainMenuItems.find(item => 
      path.startsWith(item.path) && item.path !== '/dashboard'
    );
    
    if (mainMenu) {
      setSelectedMainMenu(mainMenu.key);
    } else if (path === '/' || path === '/dashboard') {
      setSelectedMainMenu('start');
    }
  }, [location]);

  // Handle main menu selection
  const handleMainMenuSelect = (key) => {
    setSelectedMainMenu(key);
    
    // Find the menu item
    const menuItem = mainMenuItems.find(item => item.key === key);
    
    if (menuItem) {
      if (menuItem.path) {
        navigate(menuItem.path);
      } else if (menuItem.action === 'toggleFullscreen') {
        // Handle fullscreen toggle
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
    }
  };

  // User dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => navigate('/login')}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top header with ship name and version */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '48px',
        background: 'linear-gradient(to right, #1e88e5, #0d47a1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0, color: 'white' }}>
            Location: {shipName}
          </Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <span>Components - Marad - v5.5.19.26851</span>
        </div>
      </Header>
      
      {/* Main top navigation */}
      <TopNavigation 
        selectedKey={selectedMainMenu}
        onSelect={handleMainMenuSelect}
        menuItems={mainMenuItems}
      />
      
      <Layout>
        {/* Side navigation (left sidebar) */}
        <Sider
          width={200}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{ 
            borderRight: '1px solid #f0f0f0', 
            overflow: 'auto', 
            height: 'calc(100vh - 104px)' 
          }}
        >
          <SideNavigation 
            mainMenuKey={selectedMainMenu}
            items={getSubMenu(selectedMainMenu)}
          />
        </Sider>
        
        {/* Main content area */}
        <Layout style={{ padding: '0 0 0 0' }}>
          <Content style={{ 
            margin: '0',
            minHeight: 'calc(100vh - 104px)', 
            background: '#fff',
            padding: '16px'
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
      
      {/* Status bar */}
      <div style={{ 
        height: '24px', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        borderTop: '1px solid #d9d9d9'
      }}>
        <div>
          Jobs: 22
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown overlay={userMenu} placement="topRight">
            <span style={{ cursor: 'pointer', marginLeft: '16px' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px' }}>{user.name}</span>
            </span>
          </Dropdown>
        </div>
      </div>
    </Layout>
  );
};

export default AppLayout;