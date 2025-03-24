import React, { useState, useEffect } from 'react';
import { Card, Radio, Button, Typography, Table, Tabs, Descriptions, Tag, Space, Row, Col, Statistic, Timeline, Tree, Spin, message, Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import {
  ToolOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { TabPane } = Tabs;
const { TreeNode } = Tree;

const MaintenanceComponentPage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [componentTree, setComponentTree] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentDetails, setComponentDetails] = useState(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [completeTaskModalVisible, setCompleteTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completeForm] = Form.useForm();

  useEffect(() => {
    loadComponentTree();
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      loadComponentDetails(selectedComponent);
      loadMaintenanceTasks(selectedComponent);
      loadMaintenanceHistory(selectedComponent);
    }
  }, [selectedComponent]);

  const loadComponentTree = async () => {
    setLoading(true);
    try {
      const tree = await window.api.components.getTree();
      setComponentTree(tree);

      // If no component is selected yet, select the first one
      if (!selectedComponent && tree.length > 0) {
        const firstMainEngine = findMainEngineComponent(tree);
        if (firstMainEngine) {
          setSelectedComponent(firstMainEngine.id);
        } else if (tree[0]) {
          setSelectedComponent(tree[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading component tree:', error);
      message.error('Failed to load component tree');
    } finally {
      setLoading(false);
    }
  };

  const findMainEngineComponent = (tree) => {
    for (const node of tree) {
      if (node.sfi_code === '600') {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const result = findMainEngineComponent(node.children);
        if (result) return result;
      }
    }
    return null;
  };

  const loadComponentDetails = async (componentId) => {
    setLoading(true);
    try {
      const details = await window.api.components.getDetails(componentId);
      setComponentDetails(details);
    } catch (error) {
      console.error('Error loading component details:', error);
      message.error('Failed to load component details');
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceTasks = async (componentId) => {
    try {
      const tasks = await window.api.maintenance.getTasks({ componentId });
      setMaintenanceTasks(tasks);
    } catch (error) {
      console.error('Error loading maintenance tasks:', error);
      message.error('Failed to load maintenance tasks');
    }
  };

  const loadMaintenanceHistory = async (componentId) => {
    try {
      const history = await window.api.maintenance.getHistory({
        componentId,
        limit: 10
      });
      setMaintenanceHistory(history);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
      message.error('Failed to load maintenance history');
    }
  };

  const handleComponentSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      setSelectedComponent(selectedKeys[0]);
    }
  };

  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    completeForm.resetFields();
    completeForm.setFieldsValue({
      running_hours: componentDetails?.running_hours || 0
    });
    setCompleteTaskModalVisible(true);
  };

  const submitCompleteTask = async (values) => {
    try {
      const result = await window.api.maintenance.complete(selectedTask.id, {
        performed_by: 1, // Default to admin user for now
        performed_at: values.performed_at.toISOString(),
        running_hours: values.running_hours,
        notes: values.notes
      });

      if (result.success) {
        message.success(`Task "${selectedTask.name}" completed successfully`);
        loadMaintenanceTasks(selectedComponent);
        loadMaintenanceHistory(selectedComponent);
        setCompleteTaskModalVisible(false);
      } else {
        message.error(result.message || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      message.error('Failed to complete task');
    }
  };

  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [addTaskForm] = Form.useForm();

  const addMaintenanceTask = () => {
    addTaskForm.resetFields();
    setAddTaskModalVisible(true);
  };

  const handleAddTask = async (values) => {
    try {
      const taskData = {
        component_id: selectedComponent,
        name: values.name,
        type: values.type,
        interval_hours: values.type === 'scheduled' ? values.interval_hours : null,
        due_at: values.due_at?.toISOString(),
        description: values.remarks
      };

      const res = await window.api.maintenance.create(taskData);
      if (!res.success) {
        console.error('Error creating task:', res.message);
        message.error('Failed to create maintenance task');
        return;
      }
      message.success('Maintenance task created successfully');
      setAddTaskModalVisible(false);
      loadMaintenanceTasks(selectedComponent);
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Failed to create maintenance task');
    }
  };

  const renderTaskModal = () => (
    <Modal
      title="Add Maintenance Task"
      open={addTaskModalVisible}
      onCancel={() => setAddTaskModalVisible(false)}
      footer={null}
    >
      <Form
        form={addTaskForm}
        layout="vertical"
        onFinish={handleAddTask}
        initialValues={{
          type: 'scheduled',
          component_id: selectedComponent,
          component_name: componentDetails?.name
        }}
      >
        <Form.Item
          name="component_name"
          label="Component"
          rules={[{ required: true, message: 'Please select a component' }]}
        >
          <Input maxLength={100} disabled={true} placeholder="Enter maintenance task name" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Task Name"
          rules={[{ required: true, message: 'Please enter task name' }]}
        >
          <Input maxLength={100} placeholder="Enter maintenance task name" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Maintenance Type"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="scheduled">Scheduled</Radio>
            <Radio value="unscheduled">Unscheduled</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) =>
            getFieldValue('type') === 'scheduled' && (
              <Form.Item
                name="interval_hours"
                label="Interval (hours)"
                rules={[{ required: true, message: 'Please enter interval hours' }]}
              >
                <InputNumber
                  min={1}
                  max={100000}
                  style={{ width: '100%' }}
                  placeholder="Enter maintenance interval in hours"
                />
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item
          name="due_at"
          label="Due Date"
          rules={[{ required: true, message: 'Please select due date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < moment().startOf('day')}
            showTime
          />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks"
        >
          <Input.TextArea
            rows={4}
            maxLength={500}
            showCount
            placeholder="Enter any additional notes or remarks"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Create Task
          </Button>
          <Button onClick={() => {
            addTaskForm.resetFields();
            setAddTaskModalVisible(false);
          }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  const renderComponentTree = (data) => {
    return data.map(item => (
      <TreeNode
        title={
          <span>
            {item.sfi_code && <Tag color="blue">{item.sfi_code}</Tag>}
            {item.name}
          </span>
        }
        key={item.id}
      >
        {item.children && item.children.length > 0 && renderComponentTree(item.children)}
      </TreeNode>
    ));
  };

  const getStatusTag = (status) => {
    if (!componentDetails) return null;

    switch (status) {
      case 'operational':
        return <Tag color="green">Operational</Tag>;
      case 'maintenance required':
        return <Tag color="orange">Maintenance Required</Tag>;
      case 'out of service':
        return <Tag color="red">Out of Service</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getMaintenanceStatusTag = (task) => {
    switch (task.status) {
      case 'overdue':
        return <Tag color="red">Overdue</Tag>;
      case 'soon':
        return <Tag color="orange">Due Soon</Tag>;
      default:
        return <Tag color="green">Normal</Tag>;
    }
  };

  const taskColumns = [
    {
      title: 'Task',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Interval',
      dataIndex: 'interval_hours',
      key: 'interval_hours',
      render: (hours) => `${hours} hours`
    },
    {
      title: 'Component',
      dataIndex: 'component_name',
      key: 'component_name',
      render: (name, record) => (
        <span>
          {record.sfi_code && <Tag color="blue">{record.sfi_code}</Tag>}
          {name}
        </span>
      )
    },
    {
      title: 'Last Performed',
      dataIndex: 'last_done_at',
      key: 'last_done_at',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'Never'
    },
    {
      title: 'Due At',
      dataIndex: 'due_at',
      key: 'due_at',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'Not scheduled'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getMaintenanceStatusTag(record)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => handleCompleteTask(record)}
          >
            Complete
          </Button>
          <Button size="small">
            Details
          </Button>
        </Space>
      )
    }
  ];

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'performed_at',
      key: 'performed_at',
      render: (date) => moment(date).format('YYYY-MM-DD'),
      sorter: (a, b) => new Date(b.performed_at) - new Date(a.performed_at)
    },
    {
      title: 'Task',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Component',
      dataIndex: 'component_name',
      key: 'component_name',
      render: (name, record) => (
        <span>
          {record.sfi_code && <Tag color="blue">{record.sfi_code}</Tag>}
          {name}
        </span>
      )
    },
    {
      title: 'Running Hours',
      dataIndex: 'running_hours',
      key: 'running_hours',
      render: (hours) => `${hours} hours`
    },
    {
      title: 'Performed By',
      dataIndex: 'performed_by_name',
      key: 'performed_by_name'
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button size="small">
          View Details
        </Button>
      )
    }
  ];

  if (loading && !componentDetails) {
    return <Card loading={true} />;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      {/* Component Tree Panel */}
      <div style={{ width: 300, marginRight: 16, overflow: 'auto' }}>
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Components</span>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={loadComponentTree}
                size="small"
              />
            </div>
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : (
            <Tree
              showIcon
              defaultExpandAll
              selectedKeys={selectedComponent ? [selectedComponent] : []}
              onSelect={handleComponentSelect}
              icon={<ApartmentOutlined />}
            >
              {renderComponentTree(componentTree)}
            </Tree>
          )}
        </Card>
      </div>

      {/* Main Content Panel */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {componentDetails ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Title level={2}>
                {componentDetails.sfi_code && (
                  <Tag color="blue" style={{ marginRight: 8 }}>
                    {componentDetails.sfi_code}
                  </Tag>
                )}
                {componentDetails.name}
              </Title>
              <Space>
                <Button onClick={
                  () => addMaintenanceTask()
                } type="primary" icon={<ToolOutlined />}>
                  Add Maintenance Task
                </Button>
                <Button icon={<SettingOutlined />}>
                  Edit Component
                </Button>
              </Space>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Running Hours"
                    value={componentDetails.running_hours || 0}
                    suffix="hours"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Criticality"
                    value={componentDetails.criticality || 'medium'}
                    valueStyle={{
                      color:
                        componentDetails.criticality === 'high' ? '#ff4d4f' :
                          componentDetails.criticality === 'medium' ? '#faad14' :
                            '#52c41a'
                    }}
                    prefix={componentDetails.criticality === 'high' ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Upcoming Maintenance"
                    value={maintenanceTasks.filter(t => t.status === 'soon' || t.status === 'overdue').length}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ClockCircleOutlined />}
                    suffix="tasks"
                  />
                </Card>
              </Col>
            </Row>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
            >
              <TabPane
                tab={
                  <span>
                    <ToolOutlined />
                    Maintenance Tasks
                  </span>
                }
                key="tasks"
              >
                <Card>
                  <Table
                    columns={taskColumns}
                    dataSource={maintenanceTasks}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Maintenance History
                  </span>
                }
                key="history"
              >
                <Card>
                  <Table
                    columns={historyColumns}
                    dataSource={maintenanceHistory}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Documents
                  </span>
                }
                key="documents"
              >
                <Card>
                  <p>Component documentation and manuals will be displayed here.</p>
                </Card>
              </TabPane>
            </Tabs>
          </>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: 50 }}>
              <p>Select a component from the tree to view details</p>
            </div>
          </Card>
        )}
      </div>

      <Modal
        title={`Complete Maintenance Task: ${selectedTask?.name}`}
        visible={completeTaskModalVisible}
        onCancel={() => setCompleteTaskModalVisible(false)}
        footer={null}
      >
        <Form
          form={completeForm}
          layout="vertical"
          onFinish={submitCompleteTask}
        >
          <Form.Item
            name="performed_at"
            label="Date Performed"
            rules={[{ required: true, message: 'Please select the date' }]}
            initialValue={moment()}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="running_hours"
            label="Current Running Hours"
            rules={[{ required: true, message: 'Please enter running hours' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="file"
            label="Attachment"
          >
            <Input type="file" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Complete Task
            </Button>
            <Button onClick={() => setCompleteTaskModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {renderTaskModal()}
    </div>
  );
};

export default MaintenanceComponentPage;