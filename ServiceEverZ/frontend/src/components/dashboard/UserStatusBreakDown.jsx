import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
 
const STATUS_ITEMS = [
  {
    key: 'active',
    label: 'Active',
    icon: <CheckCircleIcon sx={{ color: '#24A148', fontSize: 28 }} />,
  },
  {
    key: 'disabled',
    label: 'Disabled',
    icon: <PersonOffIcon sx={{ color: '#E01950', fontSize: 26 }} />,
  },
  {
    key: 'pending',
    label: 'Pending Activation',
    icon: <HourglassEmptyIcon sx={{ color: '#E2B93B', fontSize: 26 }} />,
  },
];
 
const UserStatusBreakdown = ({
  active = 0,
  disabled = 0,
  pending = 0,
  loading = false,
}) => {
  const counts = { active, disabled, pending };
 
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <BarChartIcon sx={{ color: '#27235C', fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700}>
            User Status Breakdown
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Live count by account state
        </Typography>
 
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STATUS_ITEMS.map(({ key, label, icon }) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {icon}
              <Box>
                {loading ? (
                  <Skeleton width={40} height={28} />
                ) : (
                  <Typography variant="h5" fontWeight={700} lineHeight={1.1} sx={{ color: '#1B193F' }}>
                    {counts[key]}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
 
export default UserStatusBreakdown;
 