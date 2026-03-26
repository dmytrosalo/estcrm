import { useState, useEffect, useMemo } from 'react';
import { Form, InputNumber, DatePicker, Select, Switch, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import CrudTable from '../components/CrudTable';
import client from '../api/client';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  {
    title: 'Mieter',
    key: 'tenant',
    render: (_, r) => r.tenant ? `${r.tenant.first_name} ${r.tenant.last_name}` : '-',
  },
  {
    title: 'Wohnung',
    key: 'unit',
    render: (_, r) => r.unit?.name || '-',
  },
  { title: 'Beginn', dataIndex: 'start_date', key: 'start_date' },
  {
    title: 'Ende',
    dataIndex: 'end_date',
    key: 'end_date',
    render: (v) => v || 'Unbefristet',
  },
  {
    title: 'Status',
    key: 'status',
    render: (_, r) => {
      if (!r.end_date) return <Tag color="blue">Unbefristet</Tag>;
      return new Date(r.end_date) < new Date()
        ? <Tag color="red">Überfällig</Tag>
        : <Tag color="green">Aktiv</Tag>;
    },
  },
  {
    title: 'Miete',
    dataIndex: 'monthly_rent',
    key: 'monthly_rent',
    render: (v) => `${v?.toFixed(2)} €`,
  },
  {
    title: 'Indexmiete',
    dataIndex: 'is_index_linked',
    key: 'is_index_linked',
    render: (v) => v ? <Tag color="purple">Ja</Tag> : 'Nein',
  },
];

function LeaseFormFields() {
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    client.get('/api/units').then((res) => setUnits(res.data)).catch(() => {});
    client.get('/api/tenants').then((res) => setTenants(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <Form.Item name="unit_id" label="Wohnung" rules={[{ required: true }]}>
        <Select placeholder="Wohnung wählen">
          {units.map((u) => (
            <Select.Option key={u.id} value={u.id}>{u.name} ({u.property?.address})</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="tenant_id" label="Mieter" rules={[{ required: true }]}>
        <Select placeholder="Mieter wählen">
          {tenants.map((t) => (
            <Select.Option key={t.id} value={t.id}>{t.first_name} {t.last_name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="start_date"
        label="Beginn"
        rules={[{ required: true }]}
        getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
        getValueFromEvent={(v) => v?.format('YYYY-MM-DD')}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="end_date"
        label="Ende (leer = unbefristet)"
        getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
        getValueFromEvent={(v) => v?.format('YYYY-MM-DD') || null}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="notice_period_months" label="Kündigungsfrist (Monate)" initialValue={3}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="monthly_rent" label="Monatsmiete (€)" rules={[{ required: true }]}>
        <InputNumber min={0} step={50} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="is_index_linked" label="Indexmiete" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
    </>
  );
}

export default function Leases() {
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [indexFilter, setIndexFilter] = useState(undefined);
  const [tenants, setTenants] = useState([]);
  const [tenantFilter, setTenantFilter] = useState(undefined);

  useEffect(() => {
    client.get('/api/tenants').then((res) => setTenants(res.data)).catch(() => {});
  }, []);

  const filters = useMemo(() => ({
    is_active: statusFilter,
    is_index_linked: indexFilter,
    tenant_id: tenantFilter,
  }), [statusFilter, indexFilter, tenantFilter]);

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Select
          placeholder="Status filtern"
          allowClear
          style={{ width: 160 }}
          onChange={(v) => setStatusFilter(v)}
        >
          <Select.Option value={true}>Aktiv / Unbefristet</Select.Option>
          <Select.Option value={false}>Überfällig</Select.Option>
        </Select>
        <Select
          placeholder="Indexmiete"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setIndexFilter(v)}
        >
          <Select.Option value={true}>Ja</Select.Option>
          <Select.Option value={false}>Nein</Select.Option>
        </Select>
        <Select
          placeholder="Mieter filtern"
          allowClear
          showSearch
          optionFilterProp="children"
          style={{ width: 200 }}
          onChange={(v) => setTenantFilter(v)}
        >
          {tenants.map((t) => (
            <Select.Option key={t.id} value={t.id}>{t.first_name} {t.last_name}</Select.Option>
          ))}
        </Select>
      </Space>
      <CrudTable
        title="Mietverträge"
        endpoint="/api/leases"
        columns={columns}
        formFields={<LeaseFormFields />}
        filters={filters}
      />
    </div>
  );
}
