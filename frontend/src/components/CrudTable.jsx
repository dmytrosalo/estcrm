import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Space, Popconfirm, message, Typography, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Title, Text } = Typography;

export default function CrudTable({ title, endpoint, columns, formFields, filters, rowKey = 'id' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async (searchTerm, extraFilters) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (extraFilters) {
        Object.entries(extraFilters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params[k] = v;
        });
      }
      const res = await client.get(endpoint, { params });
      setData(res.data);
    } catch (err) {
      message.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(search, filters); }, [fetchData, search, filters]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`${endpoint}/${id}`);
      message.success('Erfolgreich gelöscht');
      fetchData(search, filters);
    } catch {
      message.error('Fehler beim Löschen');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await client.put(`${endpoint}/${editing[rowKey]}`, values);
        message.success('Erfolgreich aktualisiert');
      } else {
        await client.post(endpoint, values);
        message.success('Erfolgreich erstellt');
      }
      setModalOpen(false);
      form.resetFields();
      fetchData(search, filters);
    } catch (err) {
      if (err.response?.data?.detail) {
        message.error(err.response.data.detail);
      }
    }
  };

  const actionColumn = {
    title: 'Aktionen',
    key: 'actions',
    width: 100,
    render: (_, record) => (
      <Space size={4}>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          style={{ color: '#8c8c8c' }}
        />
        <Popconfirm
          title="Wirklich löschen?"
          onConfirm={() => handleDelete(record[rowKey])}
          okText="Ja"
          cancelText="Nein"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div>
          <Title level={3} style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontSize: 20,
          }}>
            {title}
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: 13 }}>{data.length} Einträge</Text>
        </div>
        <Space size={10} wrap>
          <Input.Search
            placeholder="Suchen..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => { if (!e.target.value) handleSearch(''); }}
            style={{ width: 220, minWidth: 150 }}
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              height: 38,
              borderRadius: 8,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #c9a962 0%, #d4b56e 100%)',
              border: 'none',
            }}
          >
            Hinzufügen
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={[...columns, actionColumn]}
        rowKey={rowKey}
        loading={loading}
        scroll={{ x: 600 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) => (
            <span style={{ color: '#8c8c8c', fontSize: 13 }}>
              {range[0]}–{range[1]} von {total}
            </span>
          ),
        }}
        style={{
          background: '#fff',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      />

      <Modal
        title={
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            {editing ? 'Bearbeiten' : 'Neu erstellen'}
          </span>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="Speichern"
        cancelText="Abbrechen"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #c9a962 0%, #d4b56e 100%)',
            border: 'none',
            fontWeight: 500,
          },
        }}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          {formFields}
        </Form>
      </Modal>
    </div>
  );
}
