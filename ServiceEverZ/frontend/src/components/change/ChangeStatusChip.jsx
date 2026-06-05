import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import CancelIcon         from '@mui/icons-material/Cancel';
import EditNoteIcon       from '@mui/icons-material/EditNote';
import HourglassTopIcon   from '@mui/icons-material/HourglassTop';
import LoopIcon           from '@mui/icons-material/Loop';
import DoDisturbIcon      from '@mui/icons-material/DoDisturb';

// ── Status Chip ────────────────────────────────────────────────────────────────
const STATUS_META = {
  DRAFT:               { label: 'Draft',              bg: '#F3F4F6', color: '#374151', icon: <EditNoteIcon sx={{ fontSize: '0.85rem !important' }} /> },
  PENDING_APPROVAL:    { label: 'Pending Approval',   bg: '#FEF3C7', color: '#92400E', icon: <HourglassTopIcon sx={{ fontSize: '0.85rem !important' }} /> },
  APPROVED:            { label: 'Approved',            bg: '#D1FAE5', color: '#065F46', icon: <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} /> },
  REJECTED:            { label: 'Rejected',            bg: '#FEE2E2', color: '#991B1B', icon: <CancelIcon sx={{ fontSize: '0.85rem !important' }} /> },
  REVISION_REQUESTED:  { label: 'Revision Requested', bg: '#EDE9FE', color: '#5B21B6', icon: <LoopIcon sx={{ fontSize: '0.85rem !important' }} /> },
  CANCELLED:           { label: 'Cancelled',           bg: '#F3F4F6', color: '#6B7280', icon: <DoDisturbIcon sx={{ fontSize: '0.85rem !important' }} /> },
};

export function ChangeStatusChip({ status }) {
  const meta = STATUS_META[status] ?? { label: status, bg: '#F3F4F6', color: '#374151', icon: null };
  return (
    <Chip
      icon={meta.icon}
      label={meta.label}
      size="small"
      sx={{
        backgroundColor: meta.bg,
        color: meta.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        '& .MuiChip-icon': { color: meta.color },
      }}
    />
  );
}

// ── Priority Chip ──────────────────────────────────────────────────────────────
const PRIORITY_META = {
  LOW:      { bg: '#D1FAE5', color: '#065F46' },
  MEDIUM:   { bg: '#FEF3C7', color: '#92400E' },
  HIGH:     { bg: '#FEE2E2', color: '#991B1B' },
  CRITICAL: { bg: '#7C3AED', color: '#fff'    },
};

export function PriorityChip({ priority }) {
  const meta = PRIORITY_META[priority] ?? { bg: '#F3F4F6', color: '#374151' };
  return (
    <Chip
      label={priority ? priority.charAt(0) + priority.slice(1).toLowerCase() : '—'}
      size="small"
      sx={{ backgroundColor: meta.bg, color: meta.color, fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px' }}
    />
  );
}

// ── Change Type Chip ───────────────────────────────────────────────────────────
const TYPE_META = {
  STANDARD:  { bg: '#DBEAFE', color: '#1E40AF' },
  NORMAL:    { bg: '#E0E7FF', color: '#3730A3' },
  EMERGENCY: { bg: '#FEE2E2', color: '#991B1B' },
};

export function ChangeTypeChip({ changeType }) {
  const meta = TYPE_META[changeType] ?? { bg: '#F3F4F6', color: '#374151' };
  return (
    <Chip
      label={changeType ? changeType.charAt(0) + changeType.slice(1).toLowerCase() : '—'}
      size="small"
      sx={{ backgroundColor: meta.bg, color: meta.color, fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px' }}
    />
  );
}

export const STATUS_COLORS = STATUS_META;
export const PRIORITY_COLORS = PRIORITY_META;
export const TYPE_COLORS = TYPE_META;
