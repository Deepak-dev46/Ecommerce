// FILE: src/pages/itsm/ITSMManagerDashboardPage.jsx
// ITSM Manager — comprehensive dynamic dashboard
// Data sources:
//   fetchDashboard()         → reportService  (ticket pipeline + SLA + support perf + recent tickets)
//   getCsatDashboard({})     → csatApi        (CSAT score, records)
//   getAllChangePlans()       → changeApi      (change plans — pending count)
//   getActiveFreezeWindows() → changeApi      (active freeze windows)
//   GET /api/approvals/monitor/l1-pending  (l1 count)
//   GET /api/approvals/monitor/l2-pending  (l2 count)
//   GET /api/assignments/all               (assignment states)

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, Stack, Avatar, Chip,
  CircularProgress, IconButton, Tooltip, LinearProgress,
  Divider, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Button,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import RefreshIcon              from '@mui/icons-material/Refresh';
import ConfirmationNumberIcon   from '@mui/icons-material/ConfirmationNumber';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon       from '@mui/icons-material/HourglassEmpty';
import BlockIcon                from '@mui/icons-material/Block';
import SpeedIcon                from '@mui/icons-material/Speed';
import WarningAmberIcon         from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon         from '@mui/icons-material/ErrorOutline';
import StarIcon                 from '@mui/icons-material/Star';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';
import AcUnitIcon               from '@mui/icons-material/AcUnit';
import AssignmentTurnedInIcon   from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon       from '@mui/icons-material/PendingActions';
import GroupIcon                from '@mui/icons-material/Group';
import FactCheckIcon            from '@mui/icons-material/FactCheck';
import NotificationsActiveIcon  from '@mui/icons-material/NotificationsActive';
import PlayArrowIcon            from '@mui/icons-material/PlayArrow';
import PauseIcon                from '@mui/icons-material/Pause';
import OpenInNewIcon            from '@mui/icons-material/OpenInNew';
import { fetchDashboard }       from '../../services/reportService';
import { getCsatDashboard }     from '../../api/csatApi';
import { getAllChangePlans, getActiveFreezeWindows } from '../../api/changeApi';
import { tokenUtils }           from '../../utils/tokenUtils';
import { useNavigate }          from 'react-router-dom';

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND   = '#27235C';
const ACCENT  = '#97247E';
const BG      = '#F4F5F9';
const CARD    = '#FFFFFF';
const BORDER  = '#E8E8F0';
const T1      = '#111827';
const T2      = '#6B7280';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const DANGER  = '#DC2626';
const INFO    = '#1D4ED8';
const CYAN    = '#0EA5E9';

// ─── Service URLs ──────────────────────────────────────────────────────────────
const APPROVAL_URL = 'http://localhost:8091';
const ASSIGN_URL   = 'http://localhost:8084';

const authFetch = async (url) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenUtils.getToken() || ''}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const ratingColor = (r) => {
  if (!r) return T2;
  if (r >= 4) return SUCCESS;
  if (r >= 3) return WARNING;
  return DANGER;
};

// ─── Custom recharts tooltip ──────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 2, px: 2, py: 1.5,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    }}>
      <Typography sx={{ color: T2, fontSize: '0.72rem', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} sx={{ color: p.color || BRAND, fontSize: '0.82rem', fontWeight: 700 }}>
          {p.name}: {p.value}
        </Typography>
      ))}
    </Box>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <Typography sx={{
    fontSize: '0.68rem', fontWeight: 800, color: T2,
    textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5,
  }}>
    {children}
  </Typography>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, color, sub, onClick, badge }) => (
  <Paper elevation={0} onClick={onClick} sx={{
    background: CARD, border: `1px solid ${BORDER}`,
    borderRadius: 3, p: 2.5, height: '100%',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.18s, box-shadow 0.18s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    position: 'relative', overflow: 'hidden',
    '&:hover': onClick ? {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px ${color}22`,
      borderColor: color,
    } : {},
  }}>
    {/* Glow blob */}
    <Box sx={{
      position: 'absolute', top: -24, right: -24,
      width: 80, height: 80, borderRadius: '50%',
      background: color, opacity: 0.07, filter: 'blur(20px)',
    }} />
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
      <Box sx={{
        width: 38, height: 38, borderRadius: 2,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ color, fontSize: 19 }} />
      </Box>
      {badge !== undefined && (
        <Chip label={badge} size="small" sx={{
          height: 20, fontSize: '0.66rem', fontWeight: 700,
          background: `${DANGER}14`, color: DANGER,
        }} />
      )}
    </Stack>
    <Typography sx={{
      fontSize: '2.2rem', fontWeight: 800,
      color: T1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
    }}>
      {value ?? '—'}
    </Typography>
    <Typography sx={{ color: T2, fontSize: '0.8rem', mt: 0.5, fontWeight: 500 }}>
      {label}
    </Typography>
    {sub && (
      <Typography sx={{ color, fontSize: '0.71rem', mt: 0.5, fontWeight: 600 }}>
        {sub}
      </Typography>
    )}
  </Paper>
);

// ─── SLA gauge strip ──────────────────────────────────────────────────────────
const SlaGauge = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: T1 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color }}>{value}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} sx={{
        height: 7, borderRadius: 4,
        bgcolor: `${color}18`,
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
      }} />
      <Typography sx={{ fontSize: '0.68rem', color: T2, mt: 0.4 }}>{pct}% of active</Typography>
    </Box>
  );
};

// ─── Ticket row ───────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  OPEN: INFO, IN_PROGRESS: WARNING, RESOLVED: SUCCESS,
  CLOSED: SUCCESS, ON_HOLD: '#6B7280', CANCELLED: DANGER, REOPENED: DANGER,
};

function getSlaLabel(t) {
  if (t.slaBreached) return 'Breached';
  if (t.slaDeadline) {
    const diff = (new Date(t.slaDeadline) - Date.now()) / 60000;
    if (diff < 0)   return 'Breached';
    if (diff < 120) return 'Approaching';
  }
  return 'On Track';
}

const SLA_BADGE = {
  'On Track':    { bg: '#F0FDF4', color: SUCCESS,  border: '#BBF7D0' },
  'Approaching': { bg: '#FFFBEB', color: WARNING,  border: '#FDE68A' },
  'Breached':    { bg: '#FEF2F2', color: DANGER,   border: '#FECACA' },
};

// ─── Live ticker for auto-refresh ─────────────────────────────────────────────
function useLiveTicker(onTick, interval = 60000) {
  const [live, setLive] = useState(false);
  const timer = useRef(null);
  const start = () => { setLive(true); timer.current = setInterval(onTick, interval); };
  const stop  = () => { setLive(false); clearInterval(timer.current); };
  useEffect(() => () => clearInterval(timer.current), []);
  return { live, start, stop };
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ITSMManagerDashboardPage() {
  const navigate = useNavigate();

  // ── raw states ──────────────────────────────────────────────────────────────
  const [ticketData,    setTicketData]    = useState(null);
  const [csatData,      setCsatData]      = useState(null);
  const [changePlans,   setChangePlans]   = useState([]);
  const [freezeWindows, setFreezeWindows] = useState([]);
  const [l1Pending,     setL1Pending]     = useState([]);
  const [l2Pending,     setL2Pending]     = useState([]);
  const [assignments,   setAssignments]   = useState([]);

  const [loading,   setLoading]   = useState(true);
  const [lastAt,    setLastAt]    = useState(null);
  const [error,     setError]     = useState('');

  // ── fetch all ───────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [td, cd, cpRes, fwRes, l1, l2, asgn] = await Promise.allSettled([
        fetchDashboard(),
        getCsatDashboard({}),
        getAllChangePlans(),
        getActiveFreezeWindows(),
        authFetch(`${APPROVAL_URL}/api/approvals/monitor/l1-pending`),
        authFetch(`${APPROVAL_URL}/api/approvals/monitor/l2-pending`),
        authFetch(`${ASSIGN_URL}/api/assignments/all`),
      ]);

      if (td.status === 'fulfilled')  setTicketData(td.value);
      if (cd.status === 'fulfilled')  setCsatData(cd.value?.data ?? cd.value);
      if (cpRes.status === 'fulfilled') setChangePlans(cpRes.value?.data?.data ?? []);
      if (fwRes.status === 'fulfilled') setFreezeWindows(fwRes.value?.data?.data ?? []);
      if (l1.status === 'fulfilled')  setL1Pending(l1.value);
      if (l2.status === 'fulfilled')  setL2Pending(l2.value);
      if (asgn.status === 'fulfilled') setAssignments(asgn.value);

      setLastAt(new Date());
    } catch (e) {
      setError('Some data failed to load. Showing available metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const { live, start, stop } = useLiveTicker(loadAll, 60000);

  // ── derived ─────────────────────────────────────────────────────────────────
  const d = ticketData || {};
  const activeTotal = (d.openTickets || 0) + (d.inProgressTickets || 0) +
                      (d.onHoldTickets || 0) + (d.reopenedTickets || 0);

  const csatRecords    = csatData?.records || [];
  const csatScore      = csatData?.overallScore ? parseFloat(csatData.overallScore.toFixed(1)) : null;
  const csatTotal      = csatData?.totalResponses || csatRecords.length;
  const csatLow        = csatRecords.filter(r => r.rating <= 2).length;

  const pendingChange  = changePlans.filter(c => c.status === 'PENDING_APPROVAL').length;
  const activeFreezes  = freezeWindows.length;

  const notAcked       = assignments.filter(a => a.status === 'ASSIGNED').length;
  const acked          = assignments.filter(a => a.status === 'OPEN').length;
  const reassigned     = assignments.filter(a => a.reassigned).length;

  // Ticket status breakdown for pie
  const ticketPie = [
    { name: 'Open',        value: d.openTickets       || 0, color: INFO },
    { name: 'In Progress', value: d.inProgressTickets || 0, color: WARNING },
    { name: 'On Hold',     value: d.onHoldTickets     || 0, color: '#6B7280' },
    { name: 'Resolved',    value: d.resolvedTickets   || 0, color: SUCCESS },
    { name: 'Closed',      value: d.closedTickets     || 0, color: '#10B981' },
    { name: 'Cancelled',   value: d.rejectedTickets   || 0, color: DANGER },
  ].filter(s => s.value > 0);

  // CSAT trend (last 10 days)
  const csatTrend = (() => {
    const map = {};
    csatRecords.forEach(r => {
      if (!r.submittedAt || !r.rating) return;
      const d = fmtDate(r.submittedAt);
      if (!map[d]) map[d] = { date: d, count: 0, sum: 0 };
      map[d].count++;
      map[d].sum += r.rating;
    });
    return Object.values(map)
      .map(x => ({ date: x.date, avg: parseFloat((x.sum / x.count).toFixed(2)), count: x.count }))
      .slice(-10);
  })();

  // Support performance bar data
  const supportPerf = (d.supportPerformance || [])
    .map(r => ({ name: (r.supportPerson || '').split(' ')[0], tickets: Number(r.totalAssigned || 0) }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 8);

  // Recent tickets
  const recentTickets = (d.recentTickets || []).slice(0, 8);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: BG, minHeight: '100vh' }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: T1, lineHeight: 1.2 }}>
            ITSM Manager Dashboard
          </Typography>
          <Typography sx={{ color: T2, fontSize: '0.8rem', mt: 0.3 }}>
            {lastAt
              ? `Last updated ${lastAt.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`
              : 'Loading metrics…'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Active freeze badge */}
          {activeFreezes > 0 && (
            <Chip
              icon={<AcUnitIcon sx={{ fontSize: '14px !important' }} />}
              label={`${activeFreezes} Active Freeze${activeFreezes > 1 ? 's' : ''}`}
              size="small"
              sx={{
                background: '#DBEAFE', color: '#1E40AF',
                fontWeight: 700, fontSize: '0.72rem',
                border: '1px solid #93C5FD',
                '& .MuiChip-icon': { color: '#1E40AF' },
              }}
            />
          )}

          {/* Live toggle */}
          <Tooltip title={live ? 'Pause auto-refresh (1 min)' : 'Start auto-refresh (1 min)'}>
            <IconButton
              onClick={live ? stop : start}
              size="small"
              sx={{
                background: live ? `${SUCCESS}14` : CARD,
                border: `1px solid ${live ? SUCCESS : BORDER}`,
                borderRadius: 2, color: live ? SUCCESS : T2,
                '&:hover': { background: `${SUCCESS}18` },
              }}
            >
              {live ? <PauseIcon sx={{ fontSize: 17 }} /> : <PlayArrowIcon sx={{ fontSize: 17 }} />}
            </IconButton>
          </Tooltip>

          {/* Manual refresh */}
          <Tooltip title="Refresh all">
            <IconButton
              onClick={loadAll} disabled={loading}
              sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                color: T2, borderRadius: 2,
                '&:hover': { background: '#F3F4F6', color: BRAND },
              }}
            >
              <RefreshIcon fontSize="small" sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {error && (
        <Box sx={{
          mb: 2, px: 2, py: 1, background: '#FFFBEB',
          border: '1px solid #FDE68A', borderRadius: 2,
        }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#92400E' }}>⚠ {error}</Typography>
        </Box>
      )}

      {loading && !ticketData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 2 }}>
          <CircularProgress sx={{ color: BRAND }} />
          <Typography sx={{ color: T2, fontSize: '0.85rem' }}>Loading dashboard…</Typography>
        </Box>
      ) : (
        <>

          {/* ══ ROW 1 — Ticket KPIs ════════════════════════════════════════ */}
          <SectionLabel>Ticket Pipeline</SectionLabel>
          <Grid container spacing={2} mb={3}>
            {[
              { label: 'Total Tickets',   value: d.totalTickets,      icon: ConfirmationNumberIcon, color: BRAND },
              { label: 'Open',            value: d.openTickets,       icon: ConfirmationNumberIcon, color: INFO },
              { label: 'In Progress',     value: d.inProgressTickets, icon: HourglassEmptyIcon,     color: WARNING },
              { label: 'On Hold',         value: d.onHoldTickets,     icon: SpeedIcon,              color: '#6B7280' },
              { label: 'Resolved/Closed', value: (d.resolvedTickets || 0) + (d.closedTickets || 0), icon: CheckCircleOutlineIcon, color: SUCCESS },
              { label: 'Cancelled',       value: d.rejectedTickets,   icon: BlockIcon,              color: DANGER },
            ].map(c => (
              <Grid item xs={6} sm={4} md={2} key={c.label}>
                <KpiCard
                  label={c.label} value={c.value ?? 0}
                  icon={c.icon} color={c.color}
                />
              </Grid>
            ))}
          </Grid>

          {/* ══ ROW 2 — SLA + Approvals/Assignments quick stats ════════════ */}
          <Grid container spacing={2} mb={3}>

            {/* SLA Compliance card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, p: 2.5, height: '100%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <SectionLabel>SLA Health</SectionLabel>

                {/* Compliance banner */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2,
                    background: `${INFO}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SpeedIcon sx={{ color: INFO, fontSize: 22 }} />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: T2, fontWeight: 500 }}>Compliance</Typography>
                    <Typography sx={{
                      fontSize: '2.2rem', fontWeight: 800, lineHeight: 1,
                      color: (d.slaCompliancePercentage ?? 100) >= 80 ? SUCCESS
                           : (d.slaCompliancePercentage ?? 100) >= 60 ? WARNING : DANGER,
                    }}>
                      {(d.slaCompliancePercentage ?? 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Stack>

                <LinearProgress variant="determinate"
                  value={d.slaCompliancePercentage ?? 100}
                  sx={{
                    height: 8, borderRadius: 4, mb: 2.5,
                    bgcolor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: (d.slaCompliancePercentage ?? 100) >= 80 ? SUCCESS
                             : (d.slaCompliancePercentage ?? 100) >= 60 ? WARNING : DANGER,
                    },
                  }}
                />

                <Stack spacing={2}>
                  <SlaGauge label="On Track"            value={d.slaOnTrackCount ?? 0}          total={activeTotal} color={SUCCESS} />
                  <SlaGauge label="Approaching Breach"  value={d.slaApproachingBreachCount ?? 0} total={activeTotal} color={WARNING} />
                  <SlaGauge label="Breached"            value={d.slaBreachedCount ?? 0}          total={activeTotal} color={DANGER} />
                </Stack>
              </Paper>
            </Grid>

            {/* Workflow Status */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, p: 2.5, height: '100%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <SectionLabel>Workflow Status</SectionLabel>
                <Stack spacing={1.5}>
                  {[
                    {
                      label: 'L1 Pending Approvals', value: l1Pending.length,
                      icon: PendingActionsIcon, color: '#7C3AED',
                      onClick: () => navigate('/itsm/monitor'),
                    },
                    {
                      label: 'L2 Pending Approvals', value: l2Pending.length,
                      icon: PendingActionsIcon, color: ACCENT,
                      onClick: () => navigate('/itsm/monitor'),
                    },
                    {
                      label: 'Not Acknowledged',     value: notAcked,
                      icon: NotificationsActiveIcon,  color: WARNING,
                      onClick: () => navigate('/itsm/monitor'),
                    },
                    {
                      label: 'Acknowledged (Active)',value: acked,
                      icon: AssignmentTurnedInIcon,  color: SUCCESS,
                    },
                    {
                      label: 'Reassigned Tickets',  value: reassigned,
                      icon: GroupIcon,              color: DANGER,
                    },
                    {
                      label: 'Change Plans Pending', value: pendingChange,
                      icon: FactCheckIcon,          color: INFO,
                      onClick: () => navigate('/itsm/changemanagement'),
                    },
                  ].map(item => (
                    <Stack key={item.label} direction="row" alignItems="center"
                      justifyContent="space-between"
                      onClick={item.onClick}
                      sx={{
                        p: '10px 12px', borderRadius: 2,
                        border: `1px solid ${BORDER}`,
                        cursor: item.onClick ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                        '&:hover': item.onClick ? {
                          borderColor: item.color,
                          background: `${item.color}08`,
                        } : {},
                      }}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{
                          width: 30, height: 30, borderRadius: 1.5,
                          background: `${item.color}14`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <item.icon sx={{ color: item.color, fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.8rem', color: T1, fontWeight: 500 }}>
                          {item.label}
                        </Typography>
                      </Stack>
                      <Typography sx={{
                        fontSize: '1.1rem', fontWeight: 800,
                        color: item.value > 0 ? item.color : T2,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {item.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* CSAT Snapshot */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, p: 2.5, height: '100%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <SectionLabel>CSAT Snapshot</SectionLabel>
                  <Tooltip title="Go to full CSAT dashboard">
                    <IconButton size="small" onClick={() => navigate('/itsm/dashboard')}
                      sx={{ color: T2, mt: -0.5 }}>
                      <OpenInNewIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Score */}
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: `conic-gradient(${csatScore ? ratingColor(csatScore) : T2} ${csatScore ? (csatScore / 5) * 360 : 0}deg, #E5E7EB 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <Box sx={{
                      width: 50, height: 50, borderRadius: '50%',
                      background: CARD,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: csatScore ? ratingColor(csatScore) : T2 }}>
                        {csatScore ? csatScore.toFixed(1) : '—'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.72rem', color: T2 }}>Overall CSAT Score</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <StarIcon key={s} sx={{
                          fontSize: 14,
                          color: csatScore && s <= Math.round(csatScore) ? '#F59E0B' : '#E5E7EB',
                        }} />
                      ))}
                    </Stack>
                    <Typography sx={{ fontSize: '0.68rem', color: T2, mt: 0.3 }}>
                      {csatScore >= 4 ? '🟢 Excellent' : csatScore >= 3 ? '🟡 Average' : csatScore > 0 ? '🔴 Poor' : '—'}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={1} mb={2}>
                  {[
                    { label: 'Total Responses', value: csatTotal, color: CYAN },
                    { label: 'Low Ratings ≤2',  value: csatLow,   color: DANGER,
                      highlight: csatLow > 0 },
                  ].map(s => (
                    <Grid item xs={6} key={s.label}>
                      <Box sx={{
                        p: 1.5, borderRadius: 2,
                        background: s.highlight ? '#FEF2F2' : '#F9FAFB',
                        border: `1px solid ${s.highlight ? '#FECACA' : BORDER}`,
                        textAlign: 'center',
                      }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                          {s.value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: T2, mt: 0.3 }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* CSAT micro trend */}
                {csatTrend.length > 1 && (
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', color: T2, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Rating Trend (last {csatTrend.length} days)
                    </Typography>
                    <ResponsiveContainer width="100%" height={70}>
                      <AreaChart data={csatTrend} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                        <defs>
                          <linearGradient id="csatGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: T2 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} hide />
                        <ReTooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="avg" name="Avg Rating"
                          stroke="#F59E0B" strokeWidth={2}
                          fill="url(#csatGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ══ ROW 3 — Charts Row ════════════════════════════════════════════ */}
          <Grid container spacing={2} mb={3}>

            {/* Ticket Status Pie */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, p: 2.5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <SectionLabel>Ticket Status Breakdown</SectionLabel>
                {ticketPie.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography sx={{ color: T2, fontSize: '0.82rem' }}>No data</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={ticketPie}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {ticketPie.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip content={<ChartTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <Typography component="span" sx={{ fontSize: '0.72rem', color: T1 }}>{value}</Typography>
                        )}
                        iconSize={10}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            {/* Support Performance Bar */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, p: 2.5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <SectionLabel>Support Person Workload</SectionLabel>
                {supportPerf.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography sx={{ color: T2, fontSize: '0.82rem' }}>No agent data</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={supportPerf} layout="vertical"
                      margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: T2 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: T1 }} axisLine={false} tickLine={false} width={60} />
                      <ReTooltip content={<ChartTooltip />} cursor={{ fill: `${BRAND}08` }} />
                      <Bar dataKey="tickets" name="Tickets" radius={[0, 4, 4, 0]}>
                        {supportPerf.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? BRAND : ACCENT} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            {/* CSAT Responses Bar */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, p: 2.5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0}>
                  <SectionLabel>CSAT Daily Responses</SectionLabel>
                </Stack>
                {csatTrend.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography sx={{ color: T2, fontSize: '0.82rem' }}>No feedback data yet</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={csatTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="csatBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A855F7" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.5} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: T2, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: T2, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <ReTooltip content={<ChartTooltip />} cursor={{ fill: `${ACCENT}08` }} />
                      <Bar dataKey="count" name="Responses" radius={[5, 5, 0, 0]} fill="url(#csatBar)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ══ ROW 4 — Support Performance Table + Recent Tickets ═══════════ */}
          <Grid container spacing={2} mb={3}>

            {/* Support Performance Detail */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <Box sx={{
                  px: 2.5, py: 2,
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: T1 }}>
                    Support Performance
                  </Typography>
                  <Chip label={`${(d.supportPerformance || []).length} agents`} size="small"
                    sx={{ fontSize: '0.68rem', fontWeight: 600, background: `${BRAND}10`, color: BRAND }} />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Agent', 'Assigned', 'Workload'].map(h => (
                          <TableCell key={h} sx={{
                            fontSize: '0.68rem', fontWeight: 700, color: T2,
                            textTransform: 'uppercase', letterSpacing: '0.07em',
                            background: '#F9FAFB', py: 1.2,
                          }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(d.supportPerformance || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 5, color: T2, fontSize: '0.82rem' }}>
                            No agents assigned yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        (d.supportPerformance || []).map((row, i) => {
                          const assigned  = Number(row.totalAssigned || 0);
                          const maxVal    = Math.max(...(d.supportPerformance || []).map(r => Number(r.totalAssigned || 0)), 1);
                          const pct       = Math.round((assigned / maxVal) * 100);
                          const name      = row.supportPerson || '—';
                          return (
                            <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderBottom: `1px solid ${BORDER}` } }}>
                              <TableCell>
                                <Stack direction="row" spacing={1.2} alignItems="center">
                                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.72rem', bgcolor: `${BRAND}18`, color: BRAND, fontWeight: 700 }}>
                                    {name[0]?.toUpperCase() || '?'}
                                  </Avatar>
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: T1 }}>
                                    {name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: BRAND, fontVariantNumeric: 'tabular-nums' }}>
                                  {assigned}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 120 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <LinearProgress variant="determinate" value={pct}
                                    sx={{
                                      flex: 1, height: 6, borderRadius: 3,
                                      bgcolor: '#EDE9FE',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: pct > 80 ? DANGER : pct > 50 ? WARNING : SUCCESS,
                                        borderRadius: 3,
                                      },
                                    }}
                                  />
                                  <Typography sx={{ fontSize: '0.68rem', color: T2, minWidth: 28 }}>{pct}%</Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Recent Tickets */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 3, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <Box sx={{
                  px: 2.5, py: 2,
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: T1 }}>
                    Recent Tickets
                  </Typography>
                  <Button size="small" onClick={() => navigate('/itsm/tickets')}
                    endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                    sx={{ fontSize: '0.72rem', color: BRAND, fontWeight: 600, textTransform: 'none' }}>
                    View all
                  </Button>
                </Box>
                <TableContainer sx={{ maxHeight: 340 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Ticket', 'Subject', 'Status', 'Priority', 'SLA'].map(h => (
                          <TableCell key={h} sx={{
                            fontSize: '0.68rem', fontWeight: 700, color: T2,
                            textTransform: 'uppercase', letterSpacing: '0.07em',
                            background: '#F9FAFB', py: 1.2,
                          }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6, color: T2, fontSize: '0.82rem' }}>
                            No tickets in the system yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentTickets.map((t, i) => {
                          const sla    = getSlaLabel(t);
                          const slaCfg = SLA_BADGE[sla] || SLA_BADGE['On Track'];
                          const stColor = STATUS_COLOR[t.status] || T2;
                          return (
                            <TableRow key={t.ticketId || i} hover
                              onClick={() => navigate(`/itsm/tickets/${t.ticketId}`)}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { background: '#F9FAFB' },
                                '& td': { borderBottom: `1px solid ${BORDER}` },
                                '&:last-child td': { border: 0 },
                              }}>
                              <TableCell>
                                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: BRAND }}>
                                  {t.ticketNumber || `#${t.ticketId}`}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 180 }}>
                                <Typography noWrap sx={{ fontSize: '0.78rem', color: T1 }}>{t.subject}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={t.status?.replace('_', ' ')} size="small" sx={{
                                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                                  background: `${stColor}14`, color: stColor, border: 'none',
                                }} />
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: '0.75rem', color: T2 }}>{t.priority || '—'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box component="span" sx={{
                                  display: 'inline-block', px: 1, py: 0.3,
                                  borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 700,
                                  background: slaCfg.bg, color: slaCfg.color,
                                  border: `1px solid ${slaCfg.border}`,
                                  textTransform: 'uppercase',
                                }}>
                                  {sla}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* ══ ROW 5 — Active Freeze Windows (if any) ════════════════════════ */}
          {freezeWindows.length > 0 && (
            <>
              <SectionLabel>Active Freeze Windows</SectionLabel>
              <Grid container spacing={2} mb={3}>
                {freezeWindows.map((fw) => (
                  <Grid item xs={12} sm={6} md={4} key={fw.id}>
                    <Paper elevation={0} sx={{
                      background: '#EFF6FF',
                      border: '1px solid #93C5FD',
                      borderRadius: 3, p: 2,
                      boxShadow: '0 1px 4px rgba(29,78,216,0.08)',
                    }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <AcUnitIcon sx={{ color: '#1E40AF', mt: 0.3, fontSize: 20, flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E40AF', mb: 0.3 }}>
                            Freeze Active
                          </Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#1E3A8A' }}>
                            {fw.reason}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#3B82F6', mt: 0.5 }}>
                            {fmtTime(fw.freezeStart)} → {fmtTime(fw.freezeEnd)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

        </>
      )}

      {/* spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

    </Box>
  );
}
