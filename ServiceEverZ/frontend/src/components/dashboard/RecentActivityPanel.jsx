import React from 'react';
import { Card, Typography, Box, Avatar, Divider, Chip } from '@mui/material';
import {
  PersonAdd,
  AssignmentInd,
  Security,
  PersonOff,
  Verified,
  LockReset,
} from '@mui/icons-material';
import { formatRelativeTime } from '../../utils/formatters';
 
const TYPE_MAP = {
  USER_CREATED: { icon: PersonAdd, color: '#27235C', bg: '#EEF0FF', label: 'User created' },
  ROLE_ASSIGNED: { icon: AssignmentInd, color: '#97247E', bg: '#FDF4FB', label: 'Role assigned' },
  POLICY_UPDATED: { icon: Security, color: '#E2B93B', bg: '#FFFBEB', label: 'Policy updated' },
  USER_DISABLED: { icon: PersonOff, color: '#E01950', bg: '#FFF1F3', label: 'User disabled' },
  ROLE_CREATED: { icon: Verified, color: '#24A148', bg: '#ECFDF5', label: 'Role created' },
  PASSWORD_RESET: { icon: LockReset, color: '#AC5098', bg: '#F9F0F8', label: 'Password reset' },
};
 
const buildActivities = (users = [], roles = []) => {
  const activities = [];
 
  const recent = [...users]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);
 
  recent.forEach((u) => {
    if (u.createdAt) {
      activities.push({
        type: 'USER_CREATED',
        message: `${u.firstName} ${u.lastName} was added to the system`,
        time: u.createdAt,
        meta: u.department,
      });
    }
  });
 
  users
    .filter((u) => u.status === 'DISABLED')
    .slice(0, 2)
    .forEach((u) => {
      activities.push({
        type: 'USER_DISABLED',
        message: `${u.firstName} ${u.lastName}'s account was disabled`,
        time: u.updatedAt || u.createdAt,
        meta: null,
      });
    });
 
  roles.slice(0, 2).forEach((r) => {
    activities.push({
      type: 'ROLE_CREATED',
      message: `Role "${r.name}" is available for assignment`,
      time: r.createdAt || new Date(Date.now() - 86400000 * 2).toISOString(),
      meta: null,
    });
  });
 
  if (!activities.length) {
    return [
      { type: 'USER_CREATED', message: 'John Doe was added to Engineering', time: new Date(Date.now() - 300000).toISOString() },
      { type: 'ROLE_ASSIGNED', message: 'RMO role assigned to Alice Smith', time: new Date(Date.now() - 3600000).toISOString() },
      { type: 'POLICY_UPDATED', message: 'Password policy updated by Admin', time: new Date(Date.now() - 7200000).toISOString() },
      { type: 'USER_DISABLED', message: 'Account for bob@serviceeverz.com disabled', time: new Date(Date.now() - 86400000).toISOString() },
      { type: 'ROLE_CREATED', message: 'SUPPORT_PERSONNEL role created', time: new Date(Date.now() - 172800000).toISOString() },
    ];
  }
 
  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);
};
 
const RecentActivityPanel = ({ users = [], roles = [] }) => {
  const activities = buildActivities(users, roles);
 
  return (
    <Card sx={{ height: '100%' }}>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid #F0F0F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>Recent activity</Typography>
          <Typography variant="body2" color="text.secondary">Latest system events</Typography>
        </Box>
        <Chip
          label="Live"
          size="small"
          sx={{
            backgroundColor: '#ECFDF5',
            color: '#24A148',
            fontWeight: 600,
            fontSize: '0.68rem',
            height: 20,
          }}
        />
      </Box>
 
      <Box sx={{ overflow: 'auto', maxHeight: 340 }}>
        {activities.map((a, i) => {
          const cfg = TYPE_MAP[a.type] || TYPE_MAP.USER_CREATED;
          const IconComp = cfg.icon;
 
          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.75,
                  px: 2.5,
                  py: 1.75,
                  alignItems: 'flex-start',
                  '&:hover': { backgroundColor: '#F9F9FC' },
                  transition: 'background 0.15s',
                }}
              >
                <Avatar sx={{ width: 30, height: 30, backgroundColor: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                  <IconComp sx={{ fontSize: 15 }} />
                </Avatar>
 
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.4 }}>
                    {a.message}
                  </Typography>
 
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                      {formatRelativeTime(a.time)}
                    </Typography>
                    {a.meta && (
                      <Typography sx={{ fontSize: '0.65rem', color: '#AC5098', fontWeight: 600 }}>
                        {a.meta}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
 
              {i < activities.length - 1 && <Divider sx={{ mx: 2.5 }} />}
            </React.Fragment>
          );
        })}
      </Box>
    </Card>
  );
};
 
export default RecentActivityPanel;
 