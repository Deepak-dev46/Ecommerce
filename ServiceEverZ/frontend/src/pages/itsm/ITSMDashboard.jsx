// src/pages/itsm/ITSMDashboard.jsx
// US-94: ITSM Manager prebuilt dashboard with ticket pipeline, SLA monitoring,
//         and support-person performance widgets.
//
// Positive:
//   1. Loads automatically: tickets in progress, completed, rejected.
//   2. SLA status per ticket — On Track / Approaching Breach / Breached.
//   3. Support Person performance metrics visible.
//   4. All data reflects real-time ticket state.
//
// Negative:
//   1. No tickets → shows zero values with empty-state message.
//   2. Insufficient role → 'Access Denied' message shown.
//   3. Data service unavailable → error message displayed, dashboard does not crash.

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Stack, Avatar, Chip, CircularProgress,
  Alert, IconButton, Tooltip, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, LinearProgress, Divider,
} from '@mui/material';
import RefreshIcon          from '@mui/icons-material/Refresh';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon   from '@mui/icons-material/HourglassEmpty';
import BlockIcon            from '@mui/icons-material/Block';
import SpeedIcon            from '@mui/icons-material/Speed';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon     from '@mui/icons-material/ErrorOutline';
import PersonIcon           from '@mui/icons-material/Person';
import { fetchDashboard }   from '../../services/reportService';

// ── SLA status badge ──────────────────────────────────────────────────────────
const SLA_CONFIG = {
  'On Track':          { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  'Approaching Breach':{ color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'Breached':          { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

const SlaBadge = ({ label }) => {
  const cfg = SLA_CONFIG[label] || SLA_CONFIG['On Track'];
  return (
    <Box component="span" sx={{
      display: 'inline-block', px: 1.25, py: 0.3, borderRadius: 1.5,
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.3px',
      textTransform: 'uppercase', bgcolor: cfg.bg, color: cfg.color,
      border: '1px solid', borderColor: cfg.border, lineHeight: 1.6,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </Box>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg, subtitle }) => (
  <Paper elevation={0} sx={{
    p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider',
    bgcolor: bg || '#fff', display: 'flex', alignItems: 'center', gap: 2,
    transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  }}>
    <Avatar sx={{ width: 44, height: 44, bgcolor: color + '20', borderRadius: 2 }}>
      <Icon sx={{ color, fontSize: 22 }} />
    </Avatar>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" lineHeight={1.2}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ color, lineHeight: 1.2 }}>
        {Number(value ?? 0).toLocaleString()}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Paper>
);

// ── SLA gauge card ────────────────────────────────────────────────────────────
const SlaGaugeCard = ({ label, value, total, color, icon: Icon }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: 1,
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: color + '20', borderRadius: 1.5 }}>
          <Icon sx={{ color, fontSize: 18 }} />
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color, lineHeight: 1.2 }}>
            {Number(value ?? 0).toLocaleString()}
          </Typography>
        </Box>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6, borderRadius: 3,
          bgcolor: color + '20',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {pct}% of active tickets
      </Typography>
    </Paper>
  );
};

// ── getSlaLabel: derive SLA label for a recent ticket row ─────────────────────
function getSlaLabel(ticket) {
  if (ticket.slaBreached) return 'Breached';
  if (ticket.slaDeadline) {
    const deadline = new Date(ticket.slaDeadline);
    const diff = (deadline - Date.now()) / 60000; // minutes
    if (diff < 0)   return 'Breached';
    if (diff < 120) return 'Approaching Breach';
  }
  return 'On Track';
}

// ── Status chip ───────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  OPEN: '#1D4ED8', IN_PROGRESS: '#B45309', RESOLVED: '#15803D',
  CLOSED: '#15803D', ON_HOLD: '#6B7280', CANCELLED: '#B91C1C',
  REOPENED: '#B91C1C',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ITSMDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchDashboard()
      .then(setData)
      .catch(err => {
        const msg = err?.response?.data?.message || err?.message || 'Data service unavailable';
        // US-94 negative #2: role error
        if (err?.response?.status === 403) {
          setError('Access Denied: you do not have permission to view this dashboard.');
        } else {
          // US-94 negative #3: service unavailable
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">Loading dashboard…</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4 }}>
      <Alert severity={error.startsWith('Access') ? 'warning' : 'error'} sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    </Box>
  );

  const d = data || {};
  const activeTotal = (d.openTickets || 0) + (d.inProgressTickets || 0) + (d.onHoldTickets || 0) + (d.reopenedTickets || 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F8FAFC', minHeight: '100%' }}>

      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">ITSM Dashboard</Typography>
          <Typography variant="caption" color="text.secondary">
            Real-time · Last updated {new Date(d.generatedAt || Date.now()).toLocaleTimeString()}
          </Typography>
        </Box>
        <Tooltip title="Refresh dashboard">
          <IconButton onClick={load} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* ── US-94 positive #1: Ticket Pipeline Stats ── */}
      <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.7rem', letterSpacing: 1 }}>
        Ticket Pipeline
      </Typography>
      <Grid container spacing={2} mt={0.5} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total Tickets"   value={d.totalTickets}      icon={ConfirmationNumberIcon} color="#7C3AED" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="In Progress"     value={d.inProgressTickets} icon={HourglassEmptyIcon}     color="#B45309" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Completed"       value={(d.resolvedTickets || 0) + (d.closedTickets || 0)} icon={CheckCircleOutlineIcon} color="#15803D" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Rejected"        value={d.rejectedTickets}   icon={BlockIcon}              color="#B91C1C" subtitle="Cancelled" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Open"            value={d.openTickets}       icon={ConfirmationNumberIcon} color="#1D4ED8" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="On Hold"         value={d.onHoldTickets}     icon={SpeedIcon}              color="#6B7280" />
        </Grid>
      </Grid>

      {/* ── US-94 positive #2: SLA Monitoring ── */}
      <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.7rem', letterSpacing: 1 }}>
        SLA Monitoring
      </Typography>

      {/* SLA Compliance banner */}
      <Paper elevation={0} sx={{
        mt: 1, mb: 2, p: 2.5, borderRadius: 3, border: '1px solid',
        borderColor: '#BFDBFE', bgcolor: '#EFF6FF',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: '#1D4ED820', borderRadius: 2 }}>
            <SpeedIcon sx={{ color: '#1D4ED8' }} />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>SLA Compliance</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#1D4ED8' }}>
              {(d.slaCompliancePercentage ?? 100).toFixed(1)}%
            </Typography>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={d.slaCompliancePercentage ?? 100}
          sx={{
            width: '55%', height: 10, borderRadius: 5,
            bgcolor: '#BFDBFE',
            '& .MuiLinearProgress-bar': {
              bgcolor: (d.slaCompliancePercentage ?? 100) >= 80 ? '#15803D' : (d.slaCompliancePercentage ?? 100) >= 60 ? '#B45309' : '#B91C1C',
              borderRadius: 5,
            },
          }}
        />
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <SlaGaugeCard label="On Track"           value={d.slaOnTrackCount}          total={activeTotal} color="#15803D" icon={CheckCircleOutlineIcon} />
        <SlaGaugeCard label="Approaching Breach" value={d.slaApproachingBreachCount} total={activeTotal} color="#B45309" icon={WarningAmberIcon} />
        <SlaGaugeCard label="Breached"           value={d.slaBreachedCount}          total={activeTotal} color="#B91C1C" icon={ErrorOutlineIcon} />
      </Stack>

      {/* ── US-94 positive #3: Support Person Performance ── */}
      <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.7rem', letterSpacing: 1 }}>
        Support Person Performance
      </Typography>
      <Paper elevation={0} sx={{ mt: 1, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {(!d.supportPerformance || d.supportPerformance.length === 0) ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.disabled" variant="body2">No support persons assigned yet</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Support Person</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Assigned Tickets</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px', minWidth: 180 }}>Workload</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {d.supportPerformance.map((row, i) => {
                  const assigned = Number(row.totalAssigned || 0);
                  const maxAssigned = Math.max(...d.supportPerformance.map(r => Number(r.totalAssigned || 0)), 1);
                  const pct = Math.round((assigned / maxAssigned) * 100);
                  return (
                    <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#7C3AED20', color: '#7C3AED' }}>
                            {String(row.supportPerson || '?')[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.82rem' }}>
                            {row.supportPerson || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: '0.82rem' }}>
                          {assigned}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#EDE9FE', '& .MuiLinearProgress-bar': { bgcolor: '#7C3AED' } }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, fontSize: '0.72rem' }}>
                            {pct}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Recent Tickets ── */}
      <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.7rem', letterSpacing: 1 }}>
        Recent Tickets
      </Typography>
      <Paper elevation={0} sx={{ mt: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {(!d.recentTickets || d.recentTickets.length === 0) ? (
          // US-94 negative #1: no tickets → zero values / empty state
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ConfirmationNumberIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.disabled" variant="body2">No tickets in the system</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 340 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {['Ticket No.', 'Subject', 'Status', 'Priority', 'Assignee', 'SLA Status'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px', bgcolor: '#F8FAFC' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {d.recentTickets.map((t, i) => (
                  <TableRow key={t.ticketId || i} hover sx={{ '&:last-child td': { border: 0 }, '&:nth-of-type(even)': { bgcolor: '#FAFAFA' } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#7C3AED', fontSize: '0.8rem' }}>
                        {t.ticketNumber || `#${t.ticketId}`}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{t.subject}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.68rem', fontWeight: 700,
                          bgcolor: (STATUS_COLOR[t.status] || '#6B7280') + '20',
                          color: STATUS_COLOR[t.status] || '#6B7280',
                          border: 'none',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{t.priority || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{t.assigneeName || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <SlaBadge label={getSlaLabel(t)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
