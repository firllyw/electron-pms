import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Typography, Table, Tag, Space, Badge, Input } from 'antd';
import { 
  ToolOutlined, 
  ClockCircleOutlined, 
  SearchOutlined,
  PlusOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;
const { TabPane } = Tabs;

const MaintenancePage = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMaintenanceTasks([
        {
          id: 1,
          component: 'Main Engine',
          task: '100-hours maintenance',
          category: 'Regular',
          dueHours: 100,
          lastDoneHours: 0,
          currentHours: 92,
          status: 'upcoming',
          interval: '100 hours'
        },
        {
          id: 2,
          component: 'Main Engine',
          task: 'Change engine oil',
          category: 'Regular',
          dueHours: 500,
          lastDoneHours: 300,
          currentHours: 392,
          status: 'upcoming',
          interval: '200 hours'
        },
        {
          id: 3,
          component: 'Main Engine',
          task: 'Check crankshaft alignment',
          category: 'Regular',
          dueHours: 1000,
          lastDoneHours: 0,
          currentHours: 392,
          status: 'upcoming',
          interval: '1000 hours'
        },
        {
          id: 4,
          component: 'Main Engine',
          task: 'Check engine fastening bolts',
          category: 'Regular',
          dueHours: 1000,
          lastDoneHours: 0,
          currentHours: 392,
          status: 'upcoming',
          interval: '1000 hours'
        },
        {
          id: 5,
          component: 'Cooling System',
          task: 'Check water pump',
          category: 'Regular',
          dueHours: 500,
          lastDoneHours: 300,
          currentHours: 490,
          status: 'upcoming',
          interval: '500 hours'
        },
        {
          id: 6,
          component: 'Fuel System',
          task: 'Replace fuel filters',
          category: 'Regular',
          dueHours: 500,
          lastDoneHours: 100,
          currentHours: 490,
          status: 'upcoming',
          interval: '500 hours'
        },
        {
          id: 7,
          component: 'Gearbox',
          task: 'Check oil level',
          category: 'Regular',
          dueHours: 200,
          lastDoneHours: 100,
          currentHours: 210,
          status: 'overdue',
          interval: '100 hours'
        },
        {
          id: 8,
          component: 'Propeller',
          task: 'Inspect shaft seals',
          category: 'Regular',
          dueHours: 1000,
          lastDoneHours: 500,
          currentHours: 490,
          status: 'upcoming',
          interval: '1000 hours'
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge status="success" text="Completed" />;
      case 'upcoming':
        return <Badge status="processing" text="Upcoming" />;
      case 'overdue':
        return <Badge status="error" text="Overdue" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getDueStatus = (task) => {
    const remainingHours = task.dueHours - task.currentHours;
    if (remainingHours < 0) {
      return <Tag color="red">Overdue by {Math.abs(remainingHours)} hours</Tag>;
    } else if (remainingHours < 20) {
      return <Tag color="orange">Due soon ({remainingHours} hours remaining)</Tag>;
    } else {
      return <Tag color="green">{remainingHours} hours remaining</Tag>;
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredTasks = maintenanceTasks.filter(task => 
    task.component.toLowerCase().includes(searchText.toLowerCase()) ||
    task.task.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
      sorter: (a, b) => a.component.localeCompare(b.component),
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
      sorter: (a, b) => a.task.localeCompare(b.task),
    },
    {
      title: 'Interval',
      dataIndex: 'interval',
      key: 'interval',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getDueStatus(record),
      sorter: (a, b) => (a.dueHours - a.currentHours) - (b.dueHours - b.currentHours),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small">
            Complete
          </Button>
          <Button size="small">
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Title level={2}>Maintenance</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            New Task
          </Button>
          <Button icon={<FilterOutlined />}>
            Filters
          </Button>
        </Space>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
      >
        <TabPane 
          tab={
            <span>
              <ToolOutlined />
              Jobs
            </span>
          } 
          key="jobs"
        >
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search tasks or components"
                prefix={<SearchOutlined />}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredTasks}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              History
            </span>
          } 
          key="history"
        >
          <Card>
            <p>Maintenance history will be displayed here.</p>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MaintenancePage;