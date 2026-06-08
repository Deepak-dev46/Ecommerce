// src/components/reports/SummaryCards.jsx
import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';
import StorageIcon                from '@mui/icons-material/Storage';
import CheckCircleIcon            from '@mui/icons-material/CheckCircle';
import PauseCircleIcon            from '@mui/icons-material/PauseCircle';
import ErrorIcon                  from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon   from '@mui/icons-material/RadioButtonUnchecked';

const STATUS_CONFIG = {
  OPEN:        { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: RadioButtonUncheckedIcon },
  CLOSED:      { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', icon: CheckCircleIcon },
  IN_PROGRESS: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: PauseCircleIcon },
  RESOLVED:    { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', icon: CheckCircleIcon },
  ON_HOLD:     { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: PauseCircleIcon },
  REOPENED:    { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', icon: ErrorIcon },
  CANCELLED:   { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: RadioButtonUncheckedIcon },
};

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const EXCLUDED = new Set(['POSITIVE', 'NEUTRAL', 'NEGATIVE']);
  const entries  = Object.entries(summary.statusBreakdown || {})
    .filter(([k]) => !EXCLUDED.has(k.toUpperCase()))
    .slice(0, 5);

  return (
    <Stack direction="row" spacing={1} sx={{ width: '100%', flexWrap: 'wrap' }} useFlexGap>

      {/* Total Records */}
      <Paper
        elevation={0}
        sx={{
          px: 1.75, py: 1.25,
          borderRadius: 2,
          display: 'flex', alignItems: 'center', gap: 1.25,
          border: '1px solid', borderColor: '#BFDBFE', bgcolor: '#EFF6FF',
          minWidth: 150, flex: '0 0 auto',
        }}
      >
        <Box sx={{
          width: 28, height: 28, borderRadius: 1.5,
          bgcolor: 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <StorageIcon sx={{ fontSize: 15, color: '#1E40AF' }} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" lineHeight={1.2} sx={{ fontSize: '0.68rem' }}>
            Total Records
          </Typography>
          <Typography fontWeight={800} sx={{ color: '#1E40AF', lineHeight: 1.2, fontSize: '1.05rem' }}>
            {Number(summary.total ?? 0).toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* Status breakdown */}
      {entries.map(([k, v]) => {
        const cfg  = STATUS_CONFIG[k.toUpperCase()] || STATUS_CONFIG.ON_HOLD;
        const Icon = cfg.icon;
        return (
          <Paper
            key={k}
            elevation={0}
            sx={{
              px: 1.75, py: 1.25,
              borderRadius: 2,
              display: 'flex', alignItems: 'center', gap: 1.25,
              border: '1px solid', borderColor: cfg.border, bgcolor: cfg.bg,
              minWidth: 130, flex: '1 1 0',
            }}
          >
            <Box sx={{
              width: 28, height: 28, borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon sx={{ fontSize: 15, color: cfg.color }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" lineHeight={1.2} sx={{ fontSize: '0.68rem' }}>
                {k.replace(/_/g, ' ')}
              </Typography>
              <Typography fontWeight={800} sx={{ color: cfg.color, lineHeight: 1.2, fontSize: '1.05rem' }}>
                {Number(v).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default SummaryCards;
