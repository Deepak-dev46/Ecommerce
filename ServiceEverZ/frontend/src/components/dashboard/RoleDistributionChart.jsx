import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
 
const COLORS = [
  '#27235C', '#97247E', '#AC5098',
  '#24A148', '#E2B93B', '#E01950',
  '#6B5CE7', '#0EA5E9'
];
 


// ✅ Uses userRolesMap (passed from DashboardPage) — NOT user.roles
const END_USER_ROLES = ['APPROVAL_MANAGER_L1', 'APPROVAL_MANAGER_L2']; // ✅ roles to group together
 
const computeDistribution = (users = [], userRolesMap = {}) => {
  if (!users.length) return [];
 
  const map = {};
 
  users.forEach((u) => {
    const roles = userRolesMap?.[u.id] || [];
 
    if (!roles.length) {
      map['No Role'] = (map['No Role'] || 0) + 1;
    } else {
      roles.forEach((r) => {
        const roleName = typeof r === 'string' ? r : r.name;
 
        // ✅ Group L1 and L2 as "End User" for visualization
        const displayName = END_USER_ROLES.includes(roleName?.toUpperCase())
          ? 'END_USER'
          : roleName;
 
        map[displayName] = (map[displayName] || 0) + 1;
      });
    }
  });
 
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};
 
 
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
 
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        px: 2,
        py: 1.5,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <Typography
        sx={{ fontWeight: 700, fontSize: '0.78rem', color: payload[0].payload.fill }}
      >
        {payload[0].name}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#1B193F' }}>
        {payload[0].value} user{payload[0].value !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};
 
// ✅ Receives userRolesMap from DashboardPage (bug was there — wrong method name)
const RoleDistributionChart = ({ users = [], userRolesMap = {} }) => {
    console.log('userRolesMap:', userRolesMap);
  const data = computeDistribution(users, userRolesMap);
  console.log('chart data',data);
     
 
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Role distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Users per assigned role
        </Typography>
 
        {data.length === 0 ? (
          <Typography align="center" sx={{ mt: 4, color: '#9CA3AF' }}>
            No role data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="44%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.72rem', paddingTop: 8 }}
                formatter={(v) => (
                  <span style={{ color: '#374151' }}>
                    {v.replaceAll('_', ' ')}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
 
export default RoleDistributionChart;
 