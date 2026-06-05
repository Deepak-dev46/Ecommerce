import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Paper, Chip, Grid,
  TextField, InputAdornment, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip
} from '@mui/material';
import SearchIcon      from '@mui/icons-material/Search';
import RefreshIcon     from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HourglassIcon   from '@mui/icons-material/HourglassEmpty';
import AssignmentIcon  from '@mui/icons-material/AssignmentTurnedIn';
import SyncIcon        from '@mui/icons-material/Sync';
import { tokenUtils }  from '../../utils/tokenUtils';
import toast           from 'react-hot-toast';

const APPROVAL_URL = 'http://localhost:8091';
const ASSIGN_URL   = 'http://localhost:8084';

const get = async (url) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenUtils.getToken() || ''}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
};

/* ── Status pill ─────────────────────────────────────────────────────────── */
const STATUS = {
  PENDING:    { bg: '#EFF6FF', color: '#1D4ED8' },
  APPROVED:   { bg: '#DCFCE7', color: '#166534' },
  REJECTED:   { bg: '#FEE2E2', color: '#991B1B' },
  ASSIGNED:   { bg: '#FEF9C3', color: '#854D0E' },
  OPEN:       { bg: '#DCFCE7', color: '#166534' },
  REASSIGNED: { bg: '#FEE2E2', color: '#991B1B' },
  MEDIUM:     { bg: '#FEF9C3', color: '#854D0E' },
  HIGH:       { bg: '#FEE2E2', color: '#991B1B' },
  LOW:        { bg: '#DCFCE7', color: '#166534' },
  CRITICAL:   { bg: '#F3E8FF', color: '#7E22CE' },
};
const Pill = ({ label }) => {
  const s = STATUS[label?.toUpperCase()] || { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <Chip label={label || '—'} size="small"
      sx={{ fontSize: '0.68rem', fontWeight: 700, height: 22,
        backgroundColor: s.bg, color: s.color, borderRadius: '5px' }} />
  );
};

/* ── Clickable stat card ─────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, count, color, active, onClick }) => (
  <Paper onClick={onClick} elevation={0}
    sx={{
      p: '16px 20px', borderRadius: '14px', cursor: 'pointer',
      border: `2px solid ${active ? color : '#E5E7EB'}`,
      backgroundColor: active ? `${color}10` : '#fff',
      transition: 'all 0.18s',
      '&:hover': { border: `2px solid ${color}`, backgroundColor: `${color}08` },
      flex: 1, minWidth: 160,
    }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box sx={{ width: 38, height: 38, borderRadius: '10px',
        backgroundColor: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: 20, color }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1.1, mt: 0.3 }}>
          {count}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

/* ── Ticket table (reusable) ─────────────────────────────────────────────── */
const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN',
  { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function TicketTable({ rows, columns }) {
  return (
    <TableContainer component={Paper} elevation={0}
      sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
            {columns.map(c => (
              <TableCell key={c.key} sx={{ fontSize: '0.7rem', fontWeight: 700,
                color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
                py: 1.2, borderBottom: '1px solid #F3F4F6' }}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center"
                sx={{ py: 4, color: '#9CA3AF', fontSize: 13 }}>
                No records found
              </TableCell>
            </TableRow>
          ) : rows.map((row, i) => (
            <TableRow key={i} hover
              sx={{ '&:last-child td': { borderBottom: 'none' },
                '&:hover': { backgroundColor: '#F9FAFB' } }}>
              {columns.map(c => (
                <TableCell key={c.key}
                  sx={{ fontSize: '0.8rem', py: 1.2, color: '#374151',
                    borderBottom: '1px solid #F9FAFB' }}>
                  {c.render ? c.render(row) : (row[c.key] || '—')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function TicketMonitorPage() {
  const [l1,       setL1]       = useState([]);
  const [l2,       setL2]       = useState([]);
  const [assigned, setAssigned] = useState([]); // not acknowledged
  const [acked,    setAcked]    = useState([]); // acknowledged
  const [loading,  setLoading]  = useState(true);

  // Which card is active — controls which table shows
  // null = show nothing (no card selected), else 'l1'|'l2'|'not_acked'|'acked'|'reassigned'
  const [activeView, setActiveView] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l1d, l2d, allAssign] = await Promise.all([
        get(`${APPROVAL_URL}/api/approvals/monitor/l1-pending`),
        get(`${APPROVAL_URL}/api/approvals/monitor/l2-pending`),
        get(`${ASSIGN_URL}/api/assignments/all`),
      ]);
      setL1(l1d);
      setL2(l2d);
      setAssigned(allAssign.filter(a => a.status === 'ASSIGNED'));
      setAcked(allAssign.filter(a => a.status === 'OPEN'));
    } catch (e) {
      toast.error('Failed to load: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (view) => setActiveView(prev => prev === view ? null : view);

  // Build the rows and columns for the active view
  const { rows, columns, title } = (() => {
    const q = search.toLowerCase();
    const filter = (arr, keys) => arr.filter(r =>
      !q || keys.some(k => String(r[k] || '').toLowerCase().includes(q))
    );

    if (activeView === 'l1') {
      const filtered = filter(l1, ['ticketId', 'ticketSubject', 'requesterName', 'l1ApproverName']);
      return {
        title: 'L1 Pending Approvals',
        rows: filtered,
        columns: [
          { key: 'ticketId',      label: 'Ticket ID',
            render: r => <Typography sx={{ fontFamily: 'monospace', fontWeight: 700,
              fontSize: '0.8rem', color: '#27235C' }}>#{r.ticketId}</Typography> },
          { key: 'ticketSubject', label: 'Subject',
            render: r => <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {r.ticketSubject || `Ticket #${r.ticketId}`}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                {r.requesterName || '—'}
              </Typography>
            </Box> },
          { key: 'l1ApproverName', label: 'L1 Approver',
            render: r => <Typography sx={{ fontSize: '0.8rem' }}>{r.l1ApproverName || '—'}</Typography> },
          { key: 'l1Status', label: 'Status', render: r => <Pill label={r.l1Status} /> },
          { key: 'createdAt', label: 'Submitted', render: r => fmt(r.createdAt) },
        ],
      };
    }

    if (activeView === 'l2') {
      const filtered = filter(l2, ['ticketId', 'ticketSubject', 'requesterName', 'l2ApproverName']);
      return {
        title: 'L2 Pending Approvals',
        rows: filtered,
        columns: [
          { key: 'ticketId', label: 'Ticket ID',
            render: r => <Typography sx={{ fontFamily: 'monospace', fontWeight: 700,
              fontSize: '0.8rem', color: '#27235C' }}>#{r.ticketId}</Typography> },
          { key: 'ticketSubject', label: 'Subject',
            render: r => <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {r.ticketSubject || `Ticket #${r.ticketId}`}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                {r.requesterName || '—'}
              </Typography>
            </Box> },
          { key: 'l1ApproverName', label: 'L1 Approver',
            render: r => <Typography sx={{ fontSize: '0.8rem' }}>{r.l1ApproverName || '—'}</Typography> },
          { key: 'l2ApproverName', label: 'L2 Approver',
            render: r => <Typography sx={{ fontSize: '0.8rem' }}>{r.l2ApproverName || '—'}</Typography> },
          { key: 'l2Status', label: 'Status', render: r => <Pill label={r.l2Status} /> },
          { key: 'createdAt', label: 'Submitted', render: r => fmt(r.createdAt) },
        ],
      };
    }

    if (activeView === 'not_acked') {
      const filtered = filter(assigned, ['ticketId', 'supportPersonName', 'priority']);
      return {
        title: 'Not Acknowledged — Awaiting Support Personnel',
        rows: filtered,
        columns: [
          { key: 'ticketId', label: 'Ticket ID',
            render: r => <Typography sx={{ fontFamily: 'monospace', fontWeight: 700,
              fontSize: '0.8rem', color: '#27235C' }}>#{r.ticketId}</Typography> },
          { key: 'supportPersonName', label: 'Assigned To',
            render: r => <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
              {r.supportPersonName || '—'}</Typography> },
          { key: 'priority', label: 'Priority', render: r => <Pill label={r.priority} /> },
          { key: 'status',   label: 'Status',   render: r => <Pill label="Not Acknowledged" /> },
          { key: 'assignedAt', label: 'Assigned At', render: r => fmt(r.assignedAt) },
        ],
      };
    }

    if (activeView === 'acked') {
      const filtered = filter(acked, ['ticketId', 'supportPersonName', 'priority']);
      return {
        title: 'Acknowledged — In Progress',
        rows: filtered,
        columns: [
          { key: 'ticketId', label: 'Ticket ID',
            render: r => <Typography sx={{ fontFamily: 'monospace', fontWeight: 700,
              fontSize: '0.8rem', color: '#27235C' }}>#{r.ticketId}</Typography> },
          { key: 'supportPersonName', label: 'Assigned To',
            render: r => <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
              {r.supportPersonName || '—'}</Typography> },
          { key: 'priority',      label: 'Priority',        render: r => <Pill label={r.priority} /> },
          { key: 'status',        label: 'Status',          render: () => <Pill label="In Progress" /> },
          { key: 'acknowledgedAt', label: 'Acknowledged At', render: r => fmt(r.acknowledgedAt) },
        ],
      };
    }

    return { title: '', rows: [], columns: [] };
  })();

  const reassigned = [...assigned, ...acked].filter(a => a.reassigned);

  return (
    <Box sx={{ p: '4px 24px 40px', minHeight: '100vh', backgroundColor: '#F4F5F9' }}>

      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#111827' }}>
            Ticket Monitor
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#6B7280', mt: 0.4 }}>
            Live overview — click a card to view the tickets
          </Typography>
        </Box>
        <Box onClick={load}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
            px: 2, py: 1, borderRadius: '9px', background: '#27235C', color: '#fff',
            fontSize: 13, fontWeight: 700, '&:hover': { background: '#1B193F' } }}>
          <RefreshIcon sx={{ fontSize: 17 }} />
          Refresh
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress sx={{ color: '#27235C' }} />
        </Box>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            <StatCard icon={HourglassIcon}   label="L1 Pending"
              count={l1.length}        color="#1D4ED8"
              active={activeView === 'l1'}       onClick={() => toggle('l1')} />
            <StatCard icon={HourglassIcon}   label="L2 Pending"
              count={l2.length}        color="#7C3AED"
              active={activeView === 'l2'}       onClick={() => toggle('l2')} />
            <StatCard icon={WarningAmberIcon} label="Not Acknowledged"
              count={assigned.length}  color="#D97706"
              active={activeView === 'not_acked'} onClick={() => toggle('not_acked')} />
            <StatCard icon={CheckCircleIcon} label="Acknowledged"
              count={acked.length}     color="#059669"
              active={activeView === 'acked'}    onClick={() => toggle('acked')} />
            <StatCard icon={SyncIcon}        label="Reassigned"
              count={reassigned.length} color="#DC2626"
              active={false} onClick={() => {}} />
          </Stack>

          {/* ── Detail panel — only shown when a card is clicked ── */}
          {activeView && (
            <Paper elevation={0}
              sx={{ borderRadius: '16px', border: '1px solid #E5E7EB',
                p: '20px 24px', backgroundColor: '#fff' }}>

              {/* Section title + search */}
              <Stack direction="row" justifyContent="space-between"
                alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                  {title}
                  <Chip label={rows.length} size="small"
                    sx={{ ml: 1.5, fontSize: '0.7rem', fontWeight: 700, height: 22,
                      backgroundColor: '#F3F4F6', color: '#374151' }} />
                </Typography>
                <TextField size="small" placeholder="Search tickets..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment:
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 17, color: '#9CA3AF' }} />
                    </InputAdornment>
                  }}
                  sx={{ width: 240,
                    '& .MuiOutlinedInput-root': { borderRadius: '9px', fontSize: '0.83rem',
                      '& fieldset': { borderColor: '#E5E7EB' },
                      '&:hover fieldset': { borderColor: '#27235C' },
                    }
                  }} />
              </Stack>

              <TicketTable rows={rows} columns={columns} />
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
