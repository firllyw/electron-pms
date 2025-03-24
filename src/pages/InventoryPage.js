import React, { useState } from 'react';
import { Typography, Card, Table, Button, Input, Row, Col, Select, Tag, Space, Tabs, Badge, Statistic } from 'antd';
import {
  DatabaseOutlined,
  SearchOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  PrinterOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const InventoryPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample inventory data
  const inventoryItems = [
    {
      id: 1,
      code: 'ME-OIL-001',
      name: 'Engine Oil 15W-40',
      category: 'Oils & Lubricants',
      quantity: 15,
      unit: 'Liters',
      location: 'Main Store',
      min_stock: 10,
      max_stock: 50,
      last_updated: '2025-03-15',
      status: 'ok'
    },
    {
      id: 2,
      code: 'FLT-AIR-002',
      name: 'Air Filter',
      category: 'Filters',
      quantity: 5,
      unit: 'Pcs',
      location: 'Engine Room',
      min_stock: 5,
      max_stock: 20,
      last_updated: '2025-03-10',
      status: 'warning'
    },
    {
      id: 3,
      code: 'FLT-OIL-003',
      name: 'Oil Filter',
      category: 'Filters',
      quantity: 8,
      unit: 'Pcs',
      location: 'Engine Room',
      min_stock: 5,
      max_stock: 20,
      last_updated: '2025-03-12',
      status: 'ok'
    },
    {
      id: 4,
      code: 'GSKT-001',
      name: 'Gasket Set',
      category: 'Engine Parts',
      quantity: 2,
      unit: 'Sets',
      location: 'Main Store',
      min_stock: 2,
      max_stock: 10,
      last_updated: '2025-03-18',
      status: 'warning'
    },
    {
      id: 5,
      code: 'BRG-001',
      name: 'Ball Bearing',
      category: 'Engine Parts',
      quantity: 12,
      unit: 'Pcs',
      location: 'Main Store',
      min_stock: 5,
      max_stock: 20,
      last_updated: '2025-02-25',
      status: 'ok'
    },
    {
      id: 6,
      code: 'COOLANT-001',
      name: 'Engine Coolant',
      category: 'Oils & Lubricants',
      quantity: 30,
      unit: 'Liters',
      location: 'Main Store',
      min_stock: 20,
      max_stock: 100,
      last_updated: '2025-03-20',
      status: 'ok'
    },
    {
      id: 7,
      code: 'BELT-001',
      name: 'V-Belt',
      category: 'Engine Parts',
      quantity: 0,
      unit: 'Pcs',
      location: 'Main Store',
      min_stock: 3,
      max_stock: 15,
      last_updated: '2025-03-05',
      status: 'danger'
    }
  ];

  // Filter the inventory data based on search text and category
  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from inventory data
  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))];

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.filter(cat => cat !== 'all').map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity, record) => {
        let color = 'green';
        if (quantity === 0) {
          color = 'red';
        } else if (quantity <= record.min_stock) {
          color = 'orange';
        }
        return <span style={{ color }}>{quantity} {record.unit}</span>;
      }
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Min Stock',
      dataIndex: 'min_stock',
      key: 'min_stock',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        if (status === 'danger') {
          return <Tag color="red">Out of Stock</Tag>;
        } else if (status === 'warning') {
          return <Tag color="orange">Low Stock</Tag>;
        } else {
          return <Tag color="green">In Stock</Tag>;
        }
      }
    },
    {
      title: 'Last Updated',
      dataIndex: 'last_updated',
      key: 'last_updated',
      sorter: (a, b) => new Date(a.last_updated) - new Date(b.last_updated),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="small">
          <Button size="small">Edit</Button>
          <Button size="small">Issue</Button>
          <Button size="small">Receive</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <DatabaseOutlined /> Inventory Management
      </Title>
      
      <Card>
        <Tabs defaultActiveKey="items">
          <TabPane tab="Items" key="items">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8} md={6}>
                  <Input
                    placeholder="Search items..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Filter by category"
                    value={selectedCategory}
                    onChange={value => setSelectedCategory(value)}
                  >
                    {categories.map(category => (
                      <Option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={12}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: 8 }}>
                      Add Item
                    </Button>
                    <Button icon={<ImportOutlined />} style={{ marginRight: 8 }}>
                      Import
                    </Button>
                    <Button icon={<ExportOutlined />} style={{ marginRight: 8 }}>
                      Export
                    </Button>
                    <Button icon={<PrinterOutlined />}>
                      Print
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
            
            <Table 
              columns={columns} 
              dataSource={filteredInventory}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
              bordered
              title={() => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Inventory Items</span>
                  <div>
                    <Badge count={inventoryItems.filter(item => item.status === 'danger').length} style={{ backgroundColor: '#ff4d4f', marginRight: 8 }}>
                      <Tag color="red">Out of Stock</Tag>
                    </Badge>
                    <Badge count={inventoryItems.filter(item => item.status === 'warning').length} style={{ backgroundColor: '#faad14', marginRight: 8 }}>
                      <Tag color="orange">Low Stock</Tag>
                    </Badge>
                  </div>
                </div>
              )}
            />
          </TabPane>
          
          <TabPane tab="Transactions" key="transactions">
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={4}>Inventory Transactions</Title>
                    <div>
                      <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: 8 }}>
                        New Transaction
                      </Button>
                      <Button icon={<ExportOutlined />}>
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <Table
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                        sorter: (a, b) => new Date(a.date) - new Date(b.date),
                      },
                      {
                        title: 'Type',
                        dataIndex: 'type',
                        key: 'type',
                        render: type => {
                          let color = 'blue';
                          if (type === 'Issue') color = 'red';
                          else if (type === 'Receive') color = 'green';
                          return <Tag color={color}>{type}</Tag>;
                        }
                      },
                      {
                        title: 'Item Code',
                        dataIndex: 'itemCode',
                        key: 'itemCode',
                      },
                      {
                        title: 'Item Name',
                        dataIndex: 'itemName',
                        key: 'itemName',
                      },
                      {
                        title: 'Quantity',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: 'Reference',
                        dataIndex: 'reference',
                        key: 'reference',
                      },
                      {
                        title: 'User',
                        dataIndex: 'user',
                        key: 'user',
                      },
                      {
                        title: 'Notes',
                        dataIndex: 'notes',
                        key: 'notes',
                      }
                    ]}
                    dataSource={[
                      {
                        id: 1,
                        date: '2025-03-22',
                        type: 'Receive',
                        itemCode: 'ME-OIL-001',
                        itemName: 'Engine Oil 15W-40',
                        quantity: '5 Liters',
                        reference: 'PO-2025-032',
                        user: 'John Smith',
                        notes: 'Regular resupply'
                      },
                      {
                        id: 2,
                        date: '2025-03-20',
                        type: 'Issue',
                        itemCode: 'FLT-AIR-002',
                        itemName: 'Air Filter',
                        quantity: '2 Pcs',
                        reference: 'MS-2025-045',
                        user: 'Robert Johnson',
                        notes: 'Scheduled maintenance'
                      },
                      {
                        id: 3,
                        date: '2025-03-18',
                        type: 'Adjustment',
                        itemCode: 'GSKT-001',
                        itemName: 'Gasket Set',
                        quantity: '1 Set',
                        reference: 'ADJ-2025-008',
                        user: 'Admin',
                        notes: 'Inventory count adjustment'
                      },
                      {
                        id: 4,
                        date: '2025-03-15',
                        type: 'Receive',
                        itemCode: 'COOLANT-001',
                        itemName: 'Engine Coolant',
                        quantity: '20 Liters',
                        reference: 'PO-2025-030',
                        user: 'John Smith',
                        notes: 'New stock'
                      },
                      {
                        id: 5,
                        date: '2025-03-12',
                        type: 'Issue',
                        itemCode: 'FLT-OIL-003',
                        itemName: 'Oil Filter',
                        quantity: '1 Pc',
                        reference: 'MS-2025-042',
                        user: 'Robert Johnson',
                        notes: 'Emergency replacement'
                      },
                    ]}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane tab="Stock Levels" key="stock-levels">
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Stock Level Summary" bordered={false}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="Total Items"
                            value={inventoryItems.length}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="Low Stock Items"
                            value={inventoryItems.filter(item => item.status === 'warning').length}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<WarningOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="Out of Stock Items"
                            value={inventoryItems.filter(item => item.status === 'danger').length}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<WarningOutlined />}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={24}>
                  <Card title="Critical Items" bordered={false}>
                    <Table
                      columns={[
                        {
                          title: 'Code',
                          dataIndex: 'code',
                          key: 'code',
                        },
                        {
                          title: 'Name',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Quantity',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          render: (quantity, record) => {
                            let color = 'green';
                            if (quantity === 0) {
                              color = 'red';
                            } else if (quantity <= record.min_stock) {
                              color = 'orange';
                            }
                            return <span style={{ color }}>{quantity} {record.unit}</span>;
                          }
                        },
                        {
                          title: 'Min Stock',
                          dataIndex: 'min_stock',
                          key: 'min_stock',
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: status => {
                            if (status === 'danger') {
                              return <Tag color="red">Out of Stock</Tag>;
                            } else if (status === 'warning') {
                              return <Tag color="orange">Low Stock</Tag>;
                            }
                          }
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: () => (
                            <Button size="small" type="primary">Order</Button>
                          ),
                        },
                      ]}
                      dataSource={inventoryItems.filter(item => item.status === 'danger' || item.status === 'warning')}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
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

export default InventoryPage;