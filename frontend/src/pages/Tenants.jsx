import { useState, useMemo } from 'react';
import { Form, Input, InputNumber, Tag, Select, Space } from 'antd';
import CrudTable from '../components/CrudTable';

function schufaTag(score) {
  if (score >= 97.5) return <Tag color="green">{score}%</Tag>;
  if (score >= 90) return <Tag color="orange">{score}%</Tag>;
  return <Tag color="red">{score}%</Tag>;
}

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  {
    title: 'Name',
    key: 'name',
    render: (_, r) => `${r.first_name} ${r.last_name}`,
  },
  { title: 'E-Mail', dataIndex: 'email', key: 'email' },
  { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
  {
    title: 'Schufa Score',
    dataIndex: 'schufa_score',
    key: 'schufa_score',
    render: (v) => schufaTag(v),
  },
  {
    title: 'Kaution',
    dataIndex: 'deposit',
    key: 'deposit',
    render: (v) => `${v?.toFixed(2)} €`,
  },
  {
    title: 'Bürge',
    dataIndex: 'guarantor',
    key: 'guarantor',
    render: (v) => v || '—',
  },
];

const formFields = (
  <>
    <Form.Item name="first_name" label="Vorname" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="last_name" label="Nachname" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="email" label="E-Mail" rules={[{ required: true, type: 'email' }]}>
      <Input />
    </Form.Item>
    <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="schufa_score" label="Schufa Score (%)" rules={[{ required: true }]}>
      <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
    </Form.Item>
    <Form.Item name="deposit" label="Kaution (€)" rules={[{ required: true }]}>
      <InputNumber min={0} step={100} style={{ width: '100%' }} />
    </Form.Item>
    <Form.Item name="guarantor" label="Mietbürge">
      <Input placeholder="Optional" />
    </Form.Item>
  </>
);

export default function Tenants() {
  const [schufaFilter, setSchufaFilter] = useState(undefined);
  const [guarantorFilter, setGuarantorFilter] = useState(undefined);

  const filters = useMemo(() => {
    const f = {};
    if (schufaFilter === 'green') { f.schufa_min = 97.5; }
    else if (schufaFilter === 'yellow') { f.schufa_min = 90; f.schufa_max = 97.49; }
    else if (schufaFilter === 'red') { f.schufa_max = 89.99; }
    if (guarantorFilter !== undefined) f.has_guarantor = guarantorFilter;
    return f;
  }, [schufaFilter, guarantorFilter]);

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Select
          placeholder="Schufa filtern"
          allowClear
          style={{ width: 180 }}
          onChange={(v) => setSchufaFilter(v)}
        >
          <Select.Option value="green"><Tag color="green">≥ 97.5%</Tag> Sehr gut</Select.Option>
          <Select.Option value="yellow"><Tag color="orange">90–97.5%</Tag> Gut</Select.Option>
          <Select.Option value="red"><Tag color="red">&lt; 90%</Tag> Risiko</Select.Option>
        </Select>
        <Select
          placeholder="Bürge filtern"
          allowClear
          style={{ width: 160 }}
          onChange={(v) => setGuarantorFilter(v)}
        >
          <Select.Option value={true}>Mit Bürge</Select.Option>
          <Select.Option value={false}>Ohne Bürge</Select.Option>
        </Select>
      </Space>
      <CrudTable
        title="Mieter"
        endpoint="/api/tenants"
        columns={columns}
        formFields={formFields}
        filters={filters}
      />
    </div>
  );
}
