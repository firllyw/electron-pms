import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Typography, Space } from 'antd';
import {
  ToolOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { UserContext } from '../components/Auth/UserContext';

const { Title } = Typography;

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [maintenanceStats, setMaintenanceStats] = useState({
    pending: 0,
    completed: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    // In a real app, this would call window.api methods to get data from the database
    setTimeout(() => {
      setMaintenanceStats({
        pending: 14,
        completed: 23,
        overdue: 8
      });
      
      setRecentTasks([
        {
          id: 1,
          component: 'Main Engine',
          task: 'Oil Change',
          dueDate: '2025-03-25',
          status: 'overdue',
          priority: 'high'
        },
        {
          id: 2,
          component: 'Gearbox',
          task: 'Inspect camshaft',
          dueDate: '2025-03-27',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: 3,
          component: 'Cooling System',
          task: 'Check coolant levels',
          dueDate: '2025-03-24',
          status: 'completed',
          priority: 'low'
        },
        {
          id: 4,
          component: 'Fuel System',
          task: 'Replace filter',
          dueDate: '2025-03-30',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: 5,
          component: 'Steering',
          task: 'Lubricate bearings',
          dueDate: '2025-03-26',
          status: 'pending',
          priority: 'high'
        },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge status="success" text="Completed" />;
      case 'pending':
        return <Badge status="processing" text="Pending" />;
      case 'overdue':
        return <Badge status="error" text="Overdue" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getPriorityTag = (priority) => {
    switch(priority) {
      case 'high':
        return <Badge color="red" text="High" />;
      case 'medium':
        return <Badge color="orange" text="Medium" />;
      case 'low':
        return <Badge color="green" text="Low" />;
      default:
        return <Badge color="blue" text={priority} />;
    }
  };

  const columns = [
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusBadge(status)
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: priority => getPriorityTag(priority)
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Title level={5} style={{ marginTop: 0 }}>
        Welcome back, {user?.name || 'User'}
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Maintenance"
              value={maintenanceStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={maintenanceStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Overdue Tasks"
              value={maintenanceStats.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Components"
              value={25}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Recent Maintenance Tasks">
            <Table
              columns={columns}
              dataSource={recentTasks}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Inventory Summary">
            <Statistic
              title="Low Stock Items"
              value={7}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical">
                <div>Engine Oil: 2 units remaining</div>
                <div>Fuel Filters: 5 units remaining</div>
                <div>Coolant: 10L remaining</div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Crew Status">
            <Statistic
              title="Active Crew Members"
              value={15}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical">
                <div>On-duty: 12 crew members</div>
                <div>Off-duty: 3 crew members</div>
                <div>Next crew change: April 5, 2025</div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;