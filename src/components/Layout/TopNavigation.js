import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import * as Icons from '@ant-design/icons';

// Helper to dynamically render icon components from strings
const getIcon = (iconName) => {
  const Icon = Icons[iconName];
  return Icon ? <Icon /> : null;
};

const TopNavigation = ({ selectedKey, onSelect, menuItems }) => {
  const handleClick = (e) => {
    onSelect(e.key);
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #d9d9d9' }}>
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        onClick={handleClick}
        style={{ 
          display: 'flex',
          borderBottom: 'none'
        }}
      >
        {menuItems.map((item) => (
          <Menu.Item 
            key={item.key} 
            icon={getIcon(item.icon)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              padding: '4px 16px',
              marginTop: '12px'
            }}
          >
            {item.path ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              item.label
            )}
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default TopNavigation;