import { Form, Input } from 'antd';
import CrudTable from '../components/CrudTable';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Adresse', dataIndex: 'address', key: 'address' },
  { title: 'Eigentümer', dataIndex: 'owner', key: 'owner' },
  { title: 'Flurstück', dataIndex: 'land_plot', key: 'land_plot' },
];

const formFields = (
  <>
    <Form.Item name="address" label="Adresse" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="owner" label="Eigentümer" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="land_plot" label="Flurstück" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </>
);

export default function Properties() {
  return (
    <CrudTable
      title="Immobilien"
      endpoint="/api/properties"
      columns={columns}
      formFields={formFields}
    />
  );
}
