// src/components/roles/RoleCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, Avatar, Tooltip } from '@mui/material';
import {
  AdminPanelSettings, ManageAccounts, SupportAgent,
  Person, HeadsetMic, VerifiedUser, Inventory2, People,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
 
const ICON_MAP = {
  AdminPanelSettings: <AdminPanelSettings />,
  ManageAccounts: <ManageAccounts />,
  SupportAgent: <SupportAgent />,
  Person: <Person />,
  HeadsetMic: <HeadsetMic />,
  VerifiedUser: <VerifiedUser />,
  Inventory2: <Inventory2 />,
};
 
const RoleCard = ({ role, userCount = 0, onManage, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{ height: '100%' }}
    whileHover={{ y: -3 }}
  >
    <Card
      onClick={onManage}
      sx={{
        height: '100%', cursor: 'pointer',
        transition: 'all 0.22s ease',
        '&:hover': {
          boxShadow: `0 8px 32px ${role.color}22`,
          borderColor: `${role.color}44`,
        },
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top gradient bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: role.gradient,
      }} />
 
      {/* Background icon watermark */}
      <Box sx={{
        position: 'absolute', right: -12, bottom: -12,
        opacity: 0.05,
        '& svg': { fontSize: 100, color: role.color },
      }}>
        {ICON_MAP[role.icon] || <Person />}
      </Box>
 
      <CardContent sx={{ p: 2.5, pt: 3 }}>
        {/* Icon + badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2.5,
            background: role.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${role.color}33`,
            '& svg': { fontSize: 24, color: '#fff' },
          }}>
            {ICON_MAP[role.icon] || <Person />}
          </Box>
          <Chip
            icon={<People sx={{ fontSize: '13px !important' }} />}
            label={userCount}
            size="small"
            sx={{
              backgroundColor: `${role.color}14`,
              color: role.color,
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              border: `1px solid ${role.color}28`,
            }}
          />
        </Box>
 
        {/* Info */}
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B193F', mb: 0.5, lineHeight: 1.3 }}>
          {role.label}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 2.5, lineHeight: 1.5, minHeight: 36 }}>
          {role.description}
        </Typography>
 
        {/* Role name badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Chip
            label={role.name}
            size="small"
            sx={{
              backgroundColor: `${role.color}14`,
              color: role.color,
              fontWeight: 700,
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              height: 20,
            }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => { e.stopPropagation(); onManage(); }}
            sx={{
              fontSize: '0.72rem', py: 0.4, px: 1.2,
              borderColor: `${role.color}44`,
              color: role.color,
              '&:hover': { borderColor: role.color, backgroundColor: `${role.color}0A` },
            }}
          >
            Manage
          </Button>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);
 
export default RoleCard;
 