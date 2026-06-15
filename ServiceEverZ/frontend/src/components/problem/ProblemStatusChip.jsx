import React from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const STATUS_META = {
  LOGGED:                    { label: 'Logged',                color: '#6B7280', bg: '#F3F4F6' },
  UNDER_INVESTIGATION:       { label: 'Under Investigation',   color: '#D97706', bg: '#FEF3C7' },
  RCA_IN_PROGRESS:           { label: 'RCA In Progress',       color: '#7C3AED', bg: '#EDE9FE' },
  WORKAROUND_PROVIDED:       { label: 'Workaround Provided',   color: '#0369A1', bg: '#E0F2FE' },
  PERMANENT_FIX_IN_PROGRESS: { label: 'Fix In Progress',       color: '#D97706', bg: '#FFF7ED' },
  KNOWN_ERROR:               { label: 'Known Error',           color: '#B45309', bg: '#FEF3C7' },
  RESOLVED:                  { label: 'Resolved',              color: '#059669', bg: '#D1FAE5' },
  CLOSED:                    { label: 'Closed',                color: '#374151', bg: '#E5E7EB' },
};

// Low = green, Medium = yellow/amber, High = red, Critical = dark red
const PRIORITY_META = {
  LOW:      { label: 'Low',      color: '#16A34A', bg: '#DCFCE7', dot: '#16A34A' },
  MEDIUM:   { label: 'Medium',   color: '#D97706', bg: '#FEF9C3', dot: '#D97706' },
  HIGH:     { label: 'High',     color: '#DC2626', bg: '#FEE2E2', dot: '#DC2626' },
  CRITICAL: { label: 'Critical', color: '#7F1D1D', bg: '#FECACA', dot: '#7F1D1D' },
};

// Low = green, Medium = yellow/amber, High = red
const IMPACT_META = {
  LOW:    { label: 'Low',    color: '#16A34A', bg: '#DCFCE7', dot: '#16A34A' },
  MEDIUM: { label: 'Medium', color: '#D97706', bg: '#FEF9C3', dot: '#D97706' },
  HIGH:   { label: 'High',   color: '#DC2626', bg: '#FEE2E2', dot: '#DC2626' },
};

export function ProblemStatusChip({ status, size = 'small' }) {
  const meta = STATUS_META[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <Chip
      label={meta.label}
      size={size}
      sx={{
        backgroundColor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: '0.68rem',
        border: `1px solid ${meta.color}33`,
      }}
    />
  );
}

export function PriorityChip({ priority, size = 'small' }) {
  const meta = PRIORITY_META[priority] || { label: priority, color: '#6B7280', bg: '#F3F4F6', dot: '#6B7280' };
  return (
    <Chip
      size={size}
      label={
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box
            component="span"
            sx={{
              width: 7, height: 7, borderRadius: '50%',
              backgroundColor: meta.dot, flexShrink: 0, display: 'inline-block',
            }}
          />
          {meta.label}
        </Box>
      }
      sx={{
        backgroundColor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: '0.68rem',
        border: `1px solid ${meta.color}44`,
        '& .MuiChip-label': { display: 'flex', alignItems: 'center' },
      }}
    />
  );
}

export function ImpactChip({ impact, size = 'small' }) {
  const meta = IMPACT_META[impact] || { label: impact, color: '#6B7280', bg: '#F3F4F6', dot: '#6B7280' };
  return (
    <Chip
      size={size}
      label={
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box
            component="span"
            sx={{
              width: 7, height: 7, borderRadius: '50%',
              backgroundColor: meta.dot, flexShrink: 0, display: 'inline-block',
            }}
          />
          {meta.label}
        </Box>
      }
      sx={{
        backgroundColor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: '0.68rem',
        border: `1px solid ${meta.color}44`,
        '& .MuiChip-label': { display: 'flex', alignItems: 'center' },
      }}
    />
  );
}

// Color map for use in filter dropdowns / form selects
export const PRIORITY_COLORS = {
  LOW:      { color: '#16A34A', bg: '#DCFCE7' },
  MEDIUM:   { color: '#D97706', bg: '#FEF9C3' },
  HIGH:     { color: '#DC2626', bg: '#FEE2E2' },
  CRITICAL: { color: '#7F1D1D', bg: '#FECACA' },
};

export const IMPACT_COLORS = {
  LOW:    { color: '#16A34A', bg: '#DCFCE7' },
  MEDIUM: { color: '#D97706', bg: '#FEF9C3' },
  HIGH:   { color: '#DC2626', bg: '#FEE2E2' },
};
