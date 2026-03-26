import { useState, useEffect } from 'react';
import { Row, Col, Table, Tag, Typography, Spin } from 'antd';
import {
  HomeOutlined,
  WarningOutlined,
  TeamOutlined,
  AppstoreOutlined,
  EuroCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import client from '../api/client';

const { Text } = Typography;

const GOLD = '#c9a962';
const PIE_SCHUFA = ['#52c41a', '#faad14', '#ff4d4f'];
const PIE_OCCUPANCY = [GOLD, '#e8e2d0'];

const cardStyle = {
  background: '#fff',
  borderRadius: 14,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  padding: 20,
  height: '100%',
};

const cardTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#1a1a1a',
  fontFamily: "'Space Grotesk', sans-serif",
  marginBottom: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const vacantCols = [
  { title: 'Wohnung', dataIndex: 'name', key: 'name' },
  { title: 'Adresse', key: 'p', render: (_, r) => <Text style={{ color: '#6b6b6b', fontSize: 13 }}>{r.property?.address || '-'}</Text>, ellipsis: true, responsive: ['md'] },
  { title: 'Miete', dataIndex: 'cold_rent', key: 'r', width: 80, align: 'right', render: (v) => <span style={{ fontWeight: 600, color: GOLD, fontFamily: "'Space Grotesk'" }}>{v?.toFixed(0)} €</span> },
];

const overdueCols = [
  { title: 'Mieter', key: 't', render: (_, r) => r.tenant ? `${r.tenant.first_name} ${r.tenant.last_name}` : '-' },
  { title: 'Wohnung', key: 'u', render: (_, r) => r.unit?.name || '-', width: 90, responsive: ['md'] },
  { title: 'Ablauf', dataIndex: 'end_date', key: 'e', width: 100, align: 'right', render: (v) => <Tag color="error" bordered={false} style={{ fontWeight: 500, margin: 0 }}>{v}</Tag> },
];

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: '14px 16px',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: color || '#1a1a1a', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: color ? `${color}12` : 'rgba(0,0,0,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color || '#999', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.97)',
      border: '1px solid #f0f0ec',
      borderRadius: 10,
      padding: '8px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Space Grotesk'" }}>
        {payload[0].value.toLocaleString('de-DE')} €
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/dashboard').then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spin size="large" />
    </div>
  );
  if (!data) return null;

  const occupancyPct = data.total_units > 0 ? Math.round(((data.total_units - data.vacant_count) / data.total_units) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h2>
        <Text style={{ color: '#999', fontSize: 13 }}>Übersicht Ihrer Immobilienverwaltung</Text>
      </div>

      {/* Stat Cards — 3 cols on mobile, 6 on desktop */}
      <Row gutter={[10, 10]} style={{ marginBottom: 14 }}>
        <Col xs={8} lg={4}><StatCard icon={<HomeOutlined />} label="Immobilien" value={data.total_properties} /></Col>
        <Col xs={8} lg={4}><StatCard icon={<AppstoreOutlined />} label="Einheiten" value={data.total_units} /></Col>
        <Col xs={8} lg={4}><StatCard icon={<TeamOutlined />} label="Mieter" value={data.total_tenants} /></Col>
        <Col xs={8} lg={4}><StatCard icon={<WarningOutlined />} label="Leerstehend" value={data.vacant_count} color={data.vacant_count > 0 ? '#faad14' : '#52c41a'} /></Col>
        <Col xs={8} lg={4}><StatCard icon={<EuroCircleOutlined />} label="Einnahmen" value={`${data.monthly_revenue?.toLocaleString('de-DE')}€`} color={GOLD} /></Col>
        <Col xs={8} lg={4}><StatCard icon={<RiseOutlined />} label="Überfällig" value={data.overdue_count} color={data.overdue_count > 0 ? '#ff4d4f' : '#52c41a'} /></Col>
      </Row>

      {/* Charts — stack on mobile */}
      <Row gutter={[10, 10]} style={{ marginBottom: 14 }}>
        <Col xs={24} lg={10}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
              Mieteinnahmen nach Immobilie
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data.rent_by_property} margin={{ top: 0, right: 0, left: -15, bottom: 20 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={1} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#aaa' }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={55} dy={5} />
                <YAxis tick={{ fontSize: 9, fill: '#aaa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(201,169,98,0.06)' }} />
                <Bar dataKey="value" fill="url(#goldGrad)" radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col xs={12} lg={7}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a', flexShrink: 0 }} />
              Belegung
            </div>
            <ResponsiveContainer width="100%" height={195}>
              <PieChart>
                <Pie data={data.occupancy} cx="50%" cy="42%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {data.occupancy.map((_, i) => <Cell key={i} fill={PIE_OCCUPANCY[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} Einheiten`} />
                <Legend verticalAlign="bottom" iconSize={8} iconType="circle" formatter={(v) => <span style={{ fontSize: 11, color: '#999' }}>{v}</span>} />
                <text x="50%" y="38%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk'", fill: '#1a1a1a' }}>{occupancyPct}%</text>
                <text x="50%" y="49%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 10, fill: '#aaa', fontWeight: 500 }}>belegt</text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col xs={12} lg={7}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#faad14', flexShrink: 0 }} />
              Schufa Verteilung
            </div>
            <ResponsiveContainer width="100%" height={195}>
              <PieChart>
                <Pie data={data.schufa_distribution} cx="50%" cy="42%" innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {data.schufa_distribution.map((_, i) => <Cell key={i} fill={PIE_SCHUFA[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} Mieter`} />
                <Legend verticalAlign="bottom" iconSize={8} iconType="circle" formatter={(v) => <span style={{ fontSize: 10, color: '#999' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      {/* Tables — stack on mobile */}
      <Row gutter={[10, 10]}>
        <Col xs={24} lg={12}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <AppstoreOutlined style={{ color: '#faad14', fontSize: 14 }} />
              Leerstehende Wohnungen
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: '#999', fontFamily: 'Inter' }}>{data.vacant_units.length}</span>
            </div>
            <Table
              dataSource={data.vacant_units}
              columns={vacantCols}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 300 }}
              locale={{ emptyText: <span style={{ color: '#ccc', fontSize: 13 }}>Keine leerstehenden Wohnungen</span> }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <WarningOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />
              Überfällige Mietverträge
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: '#999', fontFamily: 'Inter' }}>{data.overdue_leases.length}</span>
            </div>
            <Table
              dataSource={data.overdue_leases}
              columns={overdueCols}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 300 }}
              locale={{ emptyText: <span style={{ color: '#ccc', fontSize: 13 }}>Keine überfälligen Verträge</span> }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
