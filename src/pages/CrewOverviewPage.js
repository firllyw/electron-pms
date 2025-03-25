import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Upload,
    message
} from 'antd';
import {
    TeamOutlined,
    UserAddOutlined,
    FileTextOutlined,
    DownloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const CrewOverviewPage = () => {
    const [loading, setLoading] = useState(true);
    const [crewList, setCrewList] = useState([]);
    const [selectedCrew, setSelectedCrew] = useState(null);
    const [crewDocuments, setCrewDocuments] = useState([]);
    const [addCrewModalVisible, setAddCrewModalVisible] = useState(false);
    const [addDocumentModalVisible, setAddDocumentModalVisible] = useState(false);
    const [addCrewForm] = Form.useForm();
    const [addDocumentForm] = Form.useForm();

    useEffect(() => {
        loadCrewList();
    }, []);

    useEffect(() => {
        if (selectedCrew) {
            loadCrewDocuments(selectedCrew);
        }
    }, [selectedCrew]);

    const loadCrewList = async () => {
        setLoading(true);
        try {
            const crews = await window.api.crewing.getAll();
            setCrewList(crews);

            // Select first crew if no crew is selected
            if (!selectedCrew && crews.length > 0) {
                setSelectedCrew(crews[0].id);
            }
        } catch (error) {
            console.error('Error loading crew list:', error);
            message.error('Failed to load crew list');
        } finally {
            setLoading(false);
        }
    };

    const loadCrewDocuments = async (crewId) => {
        try {
            const documents = await window.api.crewing.getDocuments(crewId);
            setCrewDocuments(documents);
        } catch (error) {
            console.error('Error loading crew documents:', error);
            message.error('Failed to load crew documents');
        }
    };

    const handleAddCrew = async (values) => {
        try {
            const newCrew = await window.api.crewing.create(values);
            message.success('Crew member added successfully');
            loadCrewList();
            setAddCrewModalVisible(false);
            addCrewForm.resetFields();
        } catch (error) {
            console.error('Error adding crew member:', error);
            message.error('Failed to add crew member');
        }
    };

    const handleAddDocument = async (values) => {
        try {
            const documentData = {
                ...values,
                document_type: values.type,
                expiry_date: values.expiry_date.format('YYYY-MM-DD'),
                issued_date: values.issued_date.format('YYYY-MM-DD'),
            };

            console.log('Document data:', documentData);
            const newDocument = await window.api.crewing.addDocument(selectedCrew, documentData);
            if (!newDocument.success) {
                throw new Error(newDocument.message);
            }

            message.success('Document added successfully');
            loadCrewDocuments(selectedCrew);
            setAddDocumentModalVisible(false);
            addDocumentForm.resetFields();
        } catch (error) {
            console.error('Error adding document:', error);
            message.error('Failed to add document');
        }
    };

    const crewColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    <Tag color="blue">{record.employee_id}</Tag>
                    {name}
                </Space>
            )
        },
        {
            title: 'Position',
            dataIndex: 'position',
            key: 'position'
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    'active': 'green',
                    'on-leave': 'orange',
                    'inactive': 'red'
                };
                return <Tag color={statusColors[status] || 'default'}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button size="small">View Details</Button>
                </Space>
            )
        }
    ];

    const documentColumns = [
        {
            title: 'Document Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag>{type}</Tag>
        },
        {
            title: 'Uploaded Date',
            dataIndex: 'uploaded_at',
            key: 'uploaded_at',
            render: (date) => moment(date).format('YYYY-MM-DD')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDocument(record)}
                    >
                        View
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleDownloadDocument(record)}
                    >
                        Download
                    </Button>
                </Space>
            )
        }
    ];

    const handleViewDocument = (document) => {
        // Implement document view logic
        Modal.info({
            title: document.name,
            content: 'Document preview functionality to be implemented'
        });
    };

    const handleDownloadDocument = async (document) => {
        try {
            await window.api.crewing.downloadDocument(document.id);
            message.success('Document download initiated');
        } catch (error) {
            console.error('Error downloading document:', error);
            message.error('Failed to download document');
        }
    };

    const renderAddCrewModal = () => (
        <Modal
            title="Add Crew Member"
            visible={addCrewModalVisible}
            onCancel={() => {
                setAddCrewModalVisible(false);
                addCrewForm.resetFields();
            }}
            footer={null}
        >
            <Form
                form={addCrewForm}
                layout="vertical"
                onFinish={handleAddCrew}
            >
                <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter full name' }]}
                >
                    <Input placeholder="Enter full name" />
                </Form.Item>

                <Form.Item
                    name="employee_id"
                    label="Employee ID"
                    rules={[{ required: true, message: 'Please enter employee ID' }]}
                >
                    <Input placeholder="Enter employee ID" />
                </Form.Item>

                <Form.Item
                    name="position"
                    label="Position"
                    rules={[{ required: true, message: 'Please select position' }]}
                >
                    <Select placeholder="Select position">
                        <Option value="captain">Captain</Option>
                        <Option value="first-officer">First Officer</Option>
                        <Option value="second-officer">Second Officer</Option>
                        <Option value="chief-engineer">Chief Engineer</Option>
                        <Option value="engineer">Engineer</Option>
                        <Option value="deck-cadet">Deck Cadet</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: 'Please select department' }]}
                >
                    <Select placeholder="Select department">
                        <Option value="deck">Deck</Option>
                        <Option value="engine">Engine</Option>
                        <Option value="catering">Catering</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                        Add Crew Member
                    </Button>
                    <Button onClick={() => {
                        addCrewForm.resetFields();
                        setAddCrewModalVisible(false);
                    }}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );

    const renderAddDocumentModal = () => (
        <Modal
            title="Add Document"
            visible={addDocumentModalVisible}
            onCancel={() => {
                setAddDocumentModalVisible(false);
                addDocumentForm.resetFields();
            }}
            footer={null}
        >
            <Form
                form={addDocumentForm}
                layout="vertical"
                onFinish={handleAddDocument}
            >
                <Form.Item
                    name="name"
                    label="Document Name"
                    rules={[{ required: true, message: 'Please enter document name' }]}
                >
                    <Input placeholder="Enter document name" />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Document Type"
                    rules={[{ required: true, message: 'Please select document type' }]}
                >
                    <Select placeholder="Select document type">
                        <Option value="license">License</Option>
                        <Option value="certificate">Certificate</Option>
                        <Option value="medical">Medical</Option>
                        <Option value="passport">Passport</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="document_number"
                    label="Document Number"
                    rules={[{ required: true, message: 'Please enter document number' }]}
                >
                    <Input placeholder="Enter document number" />
                </Form.Item>

                <Form.Item
                    name="issued_date"
                    label="Issue Date"
                    rules={[{ required: true, message: 'Please select issue date' }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="expiry_date"
                    label="Expiry Date"
                    rules={[{ required: true, message: 'Please select expiry date' }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                        Add Document
                    </Button>
                    <Button onClick={() => {
                        addDocumentForm.resetFields();
                        setAddDocumentModalVisible(false);
                    }}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
            {/* Crew Documents Panel - Now Wider */}
            <div style={{ flex: 1, marginRight: 16, overflow: 'auto' }}>
                {selectedCrew ? (
                    <Card
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                    <FileTextOutlined style={{ marginRight: 8 }} />
                                    Crew Documents
                                </span>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => setAddDocumentModalVisible(true)}
                                >
                                    Add Document
                                </Button>
                            </div>
                        }
                    >
                        <Table
                            columns={documentColumns}
                            dataSource={crewDocuments}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                ) : (
                    <Card>
                        <div style={{ textAlign: 'center', padding: 50 }}>
                            <p>Select a crew member to view documents</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Crew List Panel - Now Narrower */}
            <div style={{ width: 400, overflow: 'auto' }}>
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Crew List</span>
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                onClick={() => setAddCrewModalVisible(true)}
                            >
                                Add Crew
                            </Button>
                        </div>
                    }
                >
                    <Table
                        columns={crewColumns}
                        dataSource={crewList}
                        rowKey="id"
                        rowSelection={{
                            type: 'radio',
                            selectedRowKeys: selectedCrew ? [selectedCrew] : [],
                            onChange: (selectedRowKeys) => {
                                setSelectedCrew(selectedRowKeys[0]);
                            }
                        }}
                        pagination={false}
                    />
                </Card>
            </div>

            {renderAddCrewModal()}
            {renderAddDocumentModal()}
        </div>
    );
};

export default CrewOverviewPage;