import React, { useState } from 'react';
import { Typography, Card, Table, Button, Input, Row, Col, Select, Tag, Space, Tabs, Badge, Statistic, Steps } from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  SendOutlined,
  DollarOutlined,
  InboxOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

const PurchasePage = () => {
  const [searchText, setSearchText] = useState('');
  
  // Sample purchase orders data
  const purchaseOrders = [
    {
      id: 'PO-2025-001',
      date: '2025-03-15',
      supplier: 'Marine Supplies Ltd.',
      items: 12,
      total: 4850.00,
      status: 'delivered',
      paymentStatus: 'paid'
    },
    {
      id: 'PO-2025-002',
      date: '2025-03-18',
      supplier: 'Engine Parts Co.',
      items: 5,
      total: 2340.00,
      status: 'ordered',
      paymentStatus: 'pending'
    },
    {
      id: 'PO-2025-003',
      date: '2025-03-20',
      supplier: 'Global Ship Supply',
      items: 8,
      total: 1780.00,
      status: 'in-transit',
      paymentStatus: 'pending'
    },
    {
      id: 'PO-2025-004',
      date: '2025-03-22',
      supplier: 'Marine Electronics Inc.',
      items: 3,
      total: 6720.00,
      status: 'draft',
      paymentStatus: 'pending'
    },
    {
      id: 'PO-2025-005',
      date: '2025-03-23',
      supplier: 'Engine Parts Co.',
      items: 7,
      total: 3450.00,
      status: 'draft',
      paymentStatus: 'pending'
    }
  ];

  // Filter purchase orders based on search text
  const filteredPurchaseOrders = purchaseOrders.filter(po => 
    po.id.toLowerCase().includes(searchText.toLowerCase()) ||
    po.supplier.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusTag = (status) => {
    let color = 'default';
    let text = status;
    
    switch (status) {
      case 'draft':
        color = 'default';
        text = 'Draft';
        break;
      case 'ordered':
        color = 'blue';
        text = 'Ordered';
        break;
      case 'in-transit':
        color = 'orange';
        text = 'In Transit';
        break;
      case 'delivered':
        color = 'green';
        text = 'Delivered';
        break;
      case 'cancelled':
        color = 'red';
        text = 'Cancelled';
        break;
      default:
        break;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  const getPaymentStatusTag = (status) => {
    let color = 'default';
    let text = status;
    
    switch (status) {
      case 'paid':
        color = 'green';
        text = 'Paid';
        break;
      case 'pending':
        color = 'gold';
        text = 'Pending';
        break;
      case 'overdue':
        color = 'red';
        text = 'Overdue';
        break;
      default:
        break;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      sorter: (a, b) => a.supplier.localeCompare(b.supplier),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      sorter: (a, b) => a.items - b.items,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: total => `$${total.toFixed(2)}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status),
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Ordered', value: 'ordered' },
        { text: 'In Transit', value: 'in-transit' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: status => getPaymentStatusTag(status),
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Overdue', value: 'overdue' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<FileTextOutlined />}>View</Button>
          {record.status === 'draft' && (
            <Button size="small" type="primary" icon={<SendOutlined />}>Send</Button>
          )}
          {record.status === 'delivered' && record.paymentStatus === 'pending' && (
            <Button size="small" type="primary" icon={<DollarOutlined />}>Pay</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ShoppingCartOutlined /> Purchase Management
      </Title>
      
      <Card>
        <Tabs defaultActiveKey="purchase-orders">
          <TabPane tab="Purchase Orders" key="purchase-orders">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Search purchase orders..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />}>
                      New Purchase Order
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
            
            <Table 
              columns={columns} 
              dataSource={filteredPurchaseOrders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
              bordered
              title={() => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Purchase Orders</span>
                  <div>
                    <Badge count={purchaseOrders.filter(po => po.status === 'draft').length} style={{ backgroundColor: '#d9d9d9', marginRight: 8 }}>
                      <Tag>Drafts</Tag>
                    </Badge>
                    <Badge count={purchaseOrders.filter(po => po.status === 'ordered' || po.status === 'in-transit').length} style={{ backgroundColor: '#1890ff', marginRight: 8 }}>
                      <Tag color="blue">Active</Tag>
                    </Badge>
                  </div>
                </div>
              )}
            />
          </TabPane>
          
          <TabPane tab="Requisitions" key="requisitions">
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={4}>Requisition Requests</Title>
                    <div>
                      <Button type="primary" icon={<PlusOutlined />}>
                        New Requisition
                      </Button>
                    </div>
                  </div>
                  
                  <Table
                    columns={[
                      {
                        title: 'Requisition #',
                        dataIndex: 'id',
                        key: 'id',
                      },
                      {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                      },
                      {
                        title: 'Requested By',
                        dataIndex: 'requestedBy',
                        key: 'requestedBy',
                      },
                      {
                        title: 'Department',
                        dataIndex: 'department',
                        key: 'department',
                      },
                      {
                        title: 'Items',
                        dataIndex: 'items',
                        key: 'items',
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: status => {
                          let color = 'default';
                          if (status === 'Approved') color = 'green';
                          else if (status === 'Pending') color = 'gold';
                          else if (status === 'Rejected') color = 'red';
                          return <Tag color={color}>{status}</Tag>;
                        }
                      },
                      {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, record) => (
                          <Space size="small">
                            <Button size="small">View</Button>
                            {record.status === 'Pending' && (
                              <>
                                <Button size="small" type="primary">Approve</Button>
                                <Button size="small" danger>Reject</Button>
                              </>
                            )}
                            {record.status === 'Approved' && !record.poCreated && (
                              <Button size="small" type="primary">Create PO</Button>
                            )}
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={[
                      {
                        id: 'REQ-2025-001',
                        date: '2025-03-20',
                        requestedBy: 'Chief Engineer',
                        department: 'Engine',
                        items: 5,
                        status: 'Approved',
                        poCreated: true
                      },
                      {
                        id: 'REQ-2025-002',
                        date: '2025-03-21',
                        requestedBy: 'Deck Officer',
                        department: 'Deck',
                        items: 3,
                        status: 'Pending',
                        poCreated: false
                      },
                      {
                        id: 'REQ-2025-003',
                        date: '2025-03-22',
                        requestedBy: 'Chief Engineer',
                        department: 'Engine',
                        items: 7,
                        status: 'Approved',
                        poCreated: false
                      },
                      {
                        id: 'REQ-2025-004',
                        date: '2025-03-23',
                        requestedBy: 'Captain',
                        department: 'Bridge',
                        items: 2,
                        status: 'Rejected',
                        poCreated: false
                      },
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane tab="Suppliers" key="suppliers">
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={4}>Supplier Directory</Title>
                    <div>
                      <Button type="primary" icon={<PlusOutlined />}>
                        Add Supplier
                      </Button>
                    </div>
                  </div>
                  
                  <Table
                    columns={[
                      {
                        title: 'Supplier Name',
                        dataIndex: 'name',
                        key: 'name',
                        sorter: (a, b) => a.name.localeCompare(b.name),
                      },
                      {
                        title: 'Contact Person',
                        dataIndex: 'contact',
                        key: 'contact',
                      },
                      {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email',
                      },
                      {
                        title: 'Phone',
                        dataIndex: 'phone',
                        key: 'phone',
                      },
                      {
                        title: 'Categories',
                        dataIndex: 'categories',
                        key: 'categories',
                        render: categories => (
                          <span>
                            {categories.map(category => (
                              <Tag key={category}>{category}</Tag>
                            ))}
                          </span>
                        ),
                      },
                      {
                        title: 'Rating',
                        dataIndex: 'rating',
                        key: 'rating',
                        render: rating => {
                          const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
                          return <span style={{ color: '#faad14' }}>{stars}</span>;
                        },
                        sorter: (a, b) => a.rating - b.rating,
                      },
                      {
                        title: 'Actions',
                        key: 'actions',
                        render: () => (
                          <Space size="small">
                            <Button size="small">Edit</Button>
                            <Button size="small">View Orders</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={[
                      {
                        id: 1,
                        name: 'Marine Supplies Ltd.',
                        contact: 'John Williams',
                        email: 'jwilliams@marinesupplies.com',
                        phone: '+1 555-123-4567',
                        categories: ['Engine Parts', 'Safety Equipment', 'Consumables'],
                        rating: 4
                      },
                      {
                        id: 2,
                        name: 'Engine Parts Co.',
                        contact: 'Sarah Johnson',
                        email: 'sales@engineparts.com',
                        phone: '+1 555-987-6543',
                        categories: ['Engine Parts', 'Filters', 'Lubricants'],
                        rating: 5
                      },
                      {
                        id: 3,
                        name: 'Global Ship Supply',
                        contact: 'Robert Chen',
                        email: 'robert@globalshipsupply.com',
                        phone: '+1 555-456-7890',
                        categories: ['Deck Equipment', 'Navigation', 'Safety Equipment'],
                        rating: 3
                      },
                      {
                        id: 4,
                        name: 'Marine Electronics Inc.',
                        contact: 'Emily Davis',
                        email: 'edavis@marineelectronics.com',
                        phone: '+1 555-789-0123',
                        categories: ['Electronics', 'Communication', 'Navigation'],
                        rating: 4
                      },
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane tab="Deliveries" key="deliveries">
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Active Deliveries" bordered={false}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="In Transit"
                            value={1}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<InboxOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="Ready for Pickup"
                            value={2}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<InboxOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="Delivered This Month"
                            value={5}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<InboxOutlined />}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={24}>
                  <Card title="Upcoming Deliveries" bordered={false}>
                    {['PO-2025-002', 'PO-2025-003'].map((po, index) => (
                      <Card key={po} style={{ marginBottom: 16 }} size="small">
                        <Row gutter={16} align="middle">
                          <Col span={6}>
                            <strong>PO Number:</strong> {po}
                          </Col>
                          <Col span={6}>
                            <strong>Supplier:</strong> {index === 0 ? 'Engine Parts Co.' : 'Global Ship Supply'}
                          </Col>
                          <Col span={6}>
                            <strong>ETA:</strong> {index === 0 ? '2025-03-28' : '2025-04-02'}
                          </Col>
                          <Col span={6}>
                            <Button type="primary" size="small">Track Delivery</Button>
                          </Col>
                        </Row>
                        <div style={{ marginTop: 16 }}>
                          <Steps size="small" current={index === 0 ? 1 : 2}>
                            <Step title="Ordered" description="Confirmed" />
                            <Step title="Processing" description={index === 0 ? 'In progress' : 'Completed'} />
                            <Step title="Shipped" description={index === 0 ? 'Pending' : '2025-03-25'} />
                            <Step title="Delivered" description="Pending" />
                          </Steps>
                        </div>
                      </Card>
                    ))}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PurchasePage;