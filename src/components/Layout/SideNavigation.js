import React, { useState } from 'react';
import { Menu, Tree } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from '@ant-design/icons';

// Helper to dynamically render icon components from strings
const getIcon = (iconName) => {
  const Icon = Icons[iconName];
  return Icon ? <Icon /> : null;
};

const SideNavigation = ({ mainMenuKey, items }) => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Set the selected key based on the current path
  React.useEffect(() => {
    const currentPath = location.pathname;
    const item = items.find(item => currentPath.includes(item.path));
    if (item) {
      setSelectedKeys([item.key]);
    }
  }, [location, items]);

  const handleClick = (e) => {
    setSelectedKeys([e.key]);
  };


  // Regular side menu for other sections
  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={handleClick}
      style={{ borderRight: 0 }}
    >
      {items.map((item) => (
        <Menu.Item 
          key={item.key} 
          icon={getIcon(item.icon)}
        >
          {item.path ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            item.label
          )}
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default SideNavigation;