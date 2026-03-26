import { useState, useEffect, useMemo } from 'react';
import { Form, Input, InputNumber, Select, Switch, Tag, Space } from 'antd';
import CrudTable from '../components/CrudTable';
import client from '../api/client';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  {
    title: 'Immobilie',
    key: 'property',
    render: (_, r) => r.property?.address || '-',
  },
  { title: 'Fläche (m²)', dataIndex: 'living_area', key: 'living_area' },
  { title: 'Zimmer', dataIndex: 'rooms', key: 'rooms' },
  {
    title: 'Kaltmiete',
    dataIndex: 'cold_rent',
    key: 'cold_rent',
    render: (v) => `${v?.toFixed(2)} €`,
  },
  {
    title: 'Warmmiete',
    dataIndex: 'warm_rent',
    key: 'warm_rent',
    render: (v) => `${v?.toFixed(2)} €`,
  },
  {
    title: 'Status',
    dataIndex: 'is_vacant',
    key: 'is_vacant',
    render: (v) => v ? <Tag color="orange">Leer</Tag> : <Tag color="green">Vermietet</Tag>,
  },
];

function UnitFormFields() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    client.get('/api/properties').then((res) => setProperties(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <Form.Item name="property_id" label="Immobilie" rules={[{ required: true }]}>
        <Select placeholder="Immobilie wählen">
          {properties.map((p) => (
            <Select.Option key={p.id} value={p.id}>{p.address}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="living_area" label="Wohnfläche (m²)" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="rooms" label="Zimmer" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="cold_rent" label="Kaltmiete (€)" rules={[{ required: true }]}>
        <InputNumber min={0} step={50} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="warm_rent" label="Warmmiete (€)" rules={[{ required: true }]}>
        <InputNumber min={0} step={50} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="is_vacant" label="Leerstehend" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );
}

export default function Units() {
  const [propertyFilter, setPropertyFilter] = useState(undefined);
  const [vacantFilter, setVacantFilter] = useState(undefined);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    client.get('/api/properties').then((res) => setProperties(res.data)).catch(() => {});
  }, []);

  const filters = useMemo(() => ({
    property_id: propertyFilter,
    is_vacant: vacantFilter,
  }), [propertyFilter, vacantFilter]);

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Select
          placeholder="Immobilie filtern"
          allowClear
          style={{ width: 200 }}
          onChange={(v) => setPropertyFilter(v)}
        >
          {properties.map((p) => (
            <Select.Option key={p.id} value={p.id}>{p.address}</Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Status filtern"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setVacantFilter(v)}
        >
          <Select.Option value={true}>Leer</Select.Option>
          <Select.Option value={false}>Vermietet</Select.Option>
        </Select>
      </Space>
      <CrudTable
        title="Wohneinheiten"
        endpoint="/api/units"
        columns={columns}
        formFields={<UnitFormFields />}
        filters={filters}
      />
    </div>
  );
}
