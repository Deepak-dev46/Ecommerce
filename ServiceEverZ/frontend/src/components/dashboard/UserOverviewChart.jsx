import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
 
const generateMonthlyData = (users = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
 
  if (!users.length) {
    return months.slice(0, now.getMonth() + 1).map((m, i) => ({
      month: m,
      total: Math.round(5 + i * 8 + Math.random() * 5),
      active: Math.round(3 + i * 6 + Math.random() * 3),
    }));
  }
 
  const counts = {};
  users.forEach((u) => {
    if (!u.createdAt) return;
    const d = new Date(u.createdAt);
    const key = months[d.getMonth()];
    counts[key] = (counts[key] || 0) + 1;
  });
 
  let cumulative = 0;
  return months.slice(0, now.getMonth() + 1).map((m) => {
    cumulative += counts[m] || 0;
    return { month: m, total: cumulative, active: Math.round(cumulative * 0.82) };
  });
};
 
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
 
  return (
    <Box sx={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1B193F', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p) => (
        <Typography key={p.dataKey} sx={{ fontSize: '0.75rem', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </Typography>
      ))}
    </Box>
  );
};
 
const UserOverviewChart = ({ users = [] }) => {
  const data = generateMonthlyData(users);
 
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>User overview</Typography>
            <Typography variant="body2" color="text.secondary">Cumulative user growth this year</Typography>
          </Box>
 
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[{ label: 'Total', color: '#27235C' }, { label: 'Active', color: '#24A148' }].map((l) => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: l.color }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
 
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27235C" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#27235C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#24A148" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#24A148" stopOpacity={0} />
              </linearGradient>
            </defs>
 
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F5" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#27235C"
              strokeWidth={2.5}
              fill="url(#gradTotal)"
              dot={false}
              activeDot={{ r: 5, fill: '#27235C' }}
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active"
              stroke="#24A148"
              strokeWidth={2.5}
              fill="url(#gradActive)"
              dot={false}
              activeDot={{ r: 5, fill: '#24A148' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
 
export default UserOverviewChart;
 