// Menu configuration file
// This makes it easy to add/remove menu items

// Main navigation items (Top menu)
export const mainMenuItems = [
    {
      key: 'start',
      icon: 'PlayCircleOutlined',
      label: 'Start',
      path: '/dashboard'
    },
    {
      key: 'maintenance',
      icon: 'ToolOutlined',
      label: 'Maintenance',
      path: '/maintenance/component'
    },
    {
      key: 'inventory',
      icon: 'DatabaseOutlined',
      label: 'Inventory',
      path: '/inventory'
    },
    {
      key: 'purchase',
      icon: 'ShoppingCartOutlined',
      label: 'Purchase',
      path: '/purchase'
    },
    {
      key: 'certificates',
      icon: 'FileDoneOutlined',
      label: 'Certificates',
      path: '/certificates'
    },
    {
      key: 'crewing',
      icon: 'TeamOutlined',
      label: 'Crewing',
      path: '/crewing'
    },
    {
      key: 'qhse',
      icon: 'CheckCircleOutlined',
      label: 'QHSE',
      path: '/qhse'
    },
    {
      key: 'update',
      icon: 'SyncOutlined',
      label: 'Update',
      path: '/update'
    },
    {
      key: 'fullscreen',
      icon: 'FullscreenOutlined',
      label: 'Full window mode',
      path: null, // This would trigger a function instead of navigation
      action: 'toggleFullscreen'
    }
  ];
  
  // Sub navigation items (Left sidebar - changes based on main menu selection)
  export const subMenuItems = {
    // Maintenance sub-menu
    maintenance: [
      {
        key: 'component',
        icon: 'AppstoreOutlined',
        label: 'Component',
        path: '/maintenance/component'
      },
      {
        key: 'worklist',
        icon: 'OrderedListOutlined',
        label: 'Worklists',
        path: '/maintenance/worklists'
      },
      {
        key: 'counters',
        icon: 'DashboardOutlined',
        label: 'Counters',
        path: '/maintenance/counters'
      },
      {
        key: 'week-remarks',
        icon: 'CalendarOutlined',
        label: 'Week remarks',
        path: '/maintenance/week-remarks'
      },
      {
        key: 'maintenance-settings',
        icon: 'SettingOutlined',
        label: 'Maintenance Settings',
        path: '/maintenance/settings'
      },
      {
        key: 'logs',
        icon: 'FileOutlined',
        label: 'Logs',
        path: '/maintenance/logs'
      },
      {
        key: 'history',
        icon: 'HistoryOutlined',
        label: 'History',
        path: '/maintenance/history'
      },
      {
        key: 'cost-estimation',
        icon: 'DollarOutlined',
        label: 'Cost Estimation',
        path: '/maintenance/cost-estimation'
      },
      {
        key: 'library',
        icon: 'BookOutlined',
        label: 'Library',
        path: '/maintenance/library'
      }
    ],
    
    // Inventory sub-menu
    inventory: [
    {
        key: 'items',
        icon: 'TagsOutlined',
        label: 'Items',
        path: '/inventory'
      },
      {
        key: 'stock-levels',
        icon: 'BarChartOutlined',
        label: 'Stock Levels',
        path: '/inventory/stock-levels'
      },
      {
        key: 'transactions',
        icon: 'SwapOutlined',
        label: 'Transactions',
        path: '/inventory/transactions'
      }
    ],
    
    // Add more sub-menus for other main menu items...
    
    // Default empty sub-menu
    default: []
  };
  
  // Function to get sub-menu based on main menu selection
  export const getSubMenu = (mainMenuKey) => {
    return subMenuItems[mainMenuKey] || subMenuItems.default;
  };