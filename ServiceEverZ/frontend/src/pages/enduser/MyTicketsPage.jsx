import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketApi, approvalApi } from '../../api/ourApi';
import { incidentApi } from '../../api/index';           // ← incident API
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  Box, Typography, Stack, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Button, Paper, Chip as MuiChip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DownloadIcon from '@mui/icons-material/Download';

/* ── Status chip colours ─────────────────────────────────────── */
const STATUS_COLOR = {
  DRAFT: { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  SUBMITTED: { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  OPEN: { color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
  IN_PROGRESS: { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  RESOLVED: { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  CLOSED: { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  CANCELLED: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  // incident statuses
  New: { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'In Progress': { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  Resolved: { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  Closed: { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
};

const PRIORITY_COLOR = {
  LOW: { color: '#24A148', bg: '#EDFAF2' },
  MEDIUM: { color: '#E2B93B', bg: '#FDF8EC' },
  HIGH: { color: '#E85D26', bg: '#FEF0EB' },
  CRITICAL: { color: '#E01950', bg: '#FDEDF2' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_COLOR[status] || STATUS_COLOR.OPEN;
  return (
    <MuiChip label={status || '—'} size="small"
      sx={{
        fontWeight: 600, fontSize: '0.72rem', height: 22,
        color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`
      }} />
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return <span style={{ color: '#9CA3AF' }}>—</span>;
  // priority can be a plain string ("High") or an object with .name
  const label = typeof priority === 'string' ? priority : (priority?.name ?? String(priority));
  const cfg = PRIORITY_COLOR[label?.toUpperCase()] || {};
  return (
    <MuiChip label={label} size="small"
      sx={{
        fontWeight: 600, fontSize: '0.72rem', height: 22,
        color: cfg.color, backgroundColor: cfg.bg, border: 'none'
      }} />
  );
}

function TypeBadge({ type }) {
  const isIncident = type === 'Incident';
  return (
    <MuiChip label={isIncident ? 'Incident' : 'Ticket'} size="small"
      sx={{
        fontWeight: 600, fontSize: '0.68rem', height: 20,
        color: isIncident ? '#9D174D' : '#27235C',
        backgroundColor: isIncident ? '#FCE7F3' : '#EDE9FE',
        border: 'none',
      }} />
  );
}

function exportToCSV(tickets, filename = 'my-tickets.csv') {
  const headers = ['Ticket #', 'Type', 'Subject', 'Category', 'Sub-Category', 'Item', 'Status', 'Priority', 'Created At'];
  const rows = tickets.map(t => {
    const priority = typeof t.priority === 'string' ? t.priority : (t.priority?.name ?? '');
    return [
      t.ticketNumber || '',
      t._type || 'Ticket',
      `"${(t.subject || '').replace(/"/g, '""')}"`,
      t.category || t.categoryName || '',
      t.subCategory || t.subCategoryName || '',
      t.item || '',
      t.status || '',
      priority,
      t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
    ];
  });
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// All possible status tabs — empty ones are hidden automatically
const STATUS_TABS = ['ALL', 'DRAFT', 'SUBMITTED', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'New', 'In Progress', 'Resolved', 'Closed'];

export default function MyTicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      // ── 1. Fetch regular service-request tickets ──────────────────────
      const ticketArr = await ticketApi.getByUser(user.userId).catch(() => []);
      const normalised = (Array.isArray(ticketArr) ? ticketArr : []).map(t => ({
        ...t,
        _id: t.id,
        _type: t.ticketType || 'Ticket',
      }));

      // ── 2. Fetch incident tickets ─────────────────────────────────────
      const incidentData = await incidentApi.getByUser(user.userId).catch(() => []);
      const incidents = (Array.isArray(incidentData) ? incidentData : []).map(inc => ({
        ...inc,
        id: inc.incidentId,          // align to the field everything else uses
        _id: inc.incidentId,
        _type: 'Incident',
        // map to common display field names
        category: inc.categoryName || null,
        subCategory: inc.subCategoryName || null,
        item: null,
      }));

      const all = [...normalised, ...incidents]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTickets(all);

      // ── 3. Approval info (only for non-draft service tickets) ─────────
      const approvalMap = {};
      await Promise.allSettled(
        normalised.filter(t => t.status !== 'DRAFT').map(async t => {
          const ap = await approvalApi.getByTicket(t._id);
          if (ap?.data) approvalMap[t._id] = ap.data;
          else if (ap) approvalMap[t._id] = ap;
        })
      );

      setApprovals(approvalMap);
    } catch (e) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);



  const submitDraft = async (e, id) => {
    e.stopPropagation();
    setSubmitting(id);
    try {
      await ticketApi.submitDraft({ id });
      toast.success('Draft submitted for approval');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(null);
    }
  };

  const editDraft = (ticket) => {
    navigate('/user/service-catalog', { state: { draftTicket: ticket } });
  };

  const viewTicket = (t) => {
    if (t._type === 'Incident') {
      navigate(`/user/incidents/${t._id}`);
    } else {
      navigate(`/user/tickets/${t._id}`);
    }
  };

  const filtered = tickets
    .filter(t => statusTab === 'ALL' || t.status === statusTab)
    .filter(t => {
      const q = search.toLowerCase();
      return !q
        || (t.ticketNumber || '').toLowerCase().includes(q)
        || (t.subject || '').toLowerCase().includes(q)
        || (t.category || '').toLowerCase().includes(q);
    });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ConfirmationNumberIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C', lineHeight: 1.2 }}>My Tickets</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.2 }}>
              {tickets.length} total · {filtered.length} shown
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<DownloadIcon />}
          onClick={() => exportToCSV(filtered)} disabled={filtered.length === 0}
          sx={{ borderColor: '#27235C', color: '#27235C', borderRadius: '9px', fontWeight: 600, fontSize: '0.82rem' }}>
          Export CSV
        </Button>
      </Stack>

      {/* Search */}
      <TextField fullWidth size="small" placeholder="Search by ticket number, subject, category..."
        value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
        sx={{ mb: 2, maxWidth: 460, backgroundColor: '#fff', borderRadius: 1 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#6b6b8a' }} /></InputAdornment> }} />

      {/* Status tabs — only show tabs that have at least one ticket */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => {
          const count = tab === 'ALL' ? tickets.length : tickets.filter(t => t.status === tab).length;
          if (tab !== 'ALL' && count === 0) return null;
          return (
            <Button key={tab} size="small" onClick={() => { setStatusTab(tab); setPage(0); }}
              variant={statusTab === tab ? 'contained' : 'outlined'}
              sx={{
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, px: 1.5, py: 0.5,
                ...(statusTab === tab
                  ? { backgroundColor: '#97247E', '&:hover': { backgroundColor: '#7a1c65' } }
                  : { borderColor: '#D1D5DB', color: '#6B7280', '&:hover': { backgroundColor: '#F9FAFB' } })
              }}>
              {tab} {count > 0 ? `(${count})` : ''}
            </Button>
          );
        })}
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#97247E' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <Typography sx={{ color: '#6B7280', fontWeight: 500 }}>No tickets found</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
            Try clearing your search or browse the Service Catalog to create a ticket
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                  {['Ticket No.', 'Type', 'Subject', 'Category', 'L1 Approver', 'L2 Approver', 'Status', 'Priority', 'Created'].map(h => (
                    <TableCell key={h} sx={{
                      fontWeight: 700, fontSize: '0.75rem', color: '#6B7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5
                    }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map(t => {
                  const ap = approvals[t._id];
                  const isDraft = t.status === 'DRAFT';
                  const isIncident = t._type === 'Incident';

                  return (
                    <TableRow key={`${t._type}-${t._id}`}
                      onClick={() => !isDraft && viewTicket(t)}
                      sx={{
                        cursor: isDraft ? 'default' : 'pointer',
                        '&:hover': { backgroundColor: isDraft ? 'inherit' : '#F9FAFB' },
                        '&:last-child td': { border: 0 }
                      }}>

                      {/* Ticket Number + date + draft actions */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#27235C' }}>
                          {t.ticketNumber || `#${t._id}`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          {formatDate(t.createdAt)}
                        </Typography>
                        {isDraft && (
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            <Button size="small" variant="outlined"
                              onClick={e => { e.stopPropagation(); editDraft(t); }}
                              sx={{
                                fontSize: '0.68rem', py: 0.25, px: 1, minWidth: 0,
                                borderColor: '#9CA3AF', color: '#6B7280'
                              }}>
                              Edit
                            </Button>
                            <Button size="small" variant="contained"
                              disabled={submitting === t._id}
                              onClick={e => submitDraft(e, t._id)}
                              sx={{
                                fontSize: '0.68rem', py: 0.25, px: 1, minWidth: 0,
                                backgroundColor: '#97247E', '&:hover': { backgroundColor: '#7a1c65' }
                              }}>
                              {submitting === t._id ? '...' : 'Submit'}
                            </Button>
                          </Stack>
                        )}
                      </TableCell>

                      {/* Type */}
                      <TableCell sx={{ py: 1.5 }}>
                        <TypeBadge type={t._type} />
                      </TableCell>

                      {/* Subject + sub-category */}
                      <TableCell sx={{ py: 1.5, maxWidth: 220 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.83rem', color: '#111827' }} noWrap>
                          {t.subject || '—'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }} noWrap>
                          {t.subCategory || t.subCategoryName || ''}
                          {t.item ? ` · ${t.item}` : ''}
                          {isIncident && t.incidentLocation ? ` · ${t.incidentLocation}` : ''}
                        </Typography>
                      </TableCell>

                      {/* Category */}
                      <TableCell sx={{ fontSize: '0.8rem', color: '#374151', py: 1.5 }}>
                        {t.category || t.categoryName || 'Network'}
                      </TableCell>

                      {/* L1 Approver */}
                      <TableCell sx={{ fontSize: '0.8rem', color: '#374151', py: 1.5 }}>
                        {isIncident
                          ? <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>N/A</span>
                          : (ap?.l1ApproverName || '—')}
                      </TableCell>

                      {/* L2 Approver */}
                      <TableCell sx={{ fontSize: '0.8rem', color: '#374151', py: 1.5 }}>
                        {isIncident
                          ? <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>N/A</span>
                          : (ap?.l2ApproverName || '—')}
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 1.5 }}>
                        <StatusBadge status={t.status} />
                      </TableCell>

                      {/* Priority */}
                      <TableCell sx={{ py: 1.5 }}>
                        <PriorityBadge priority={t.priority} />
                      </TableCell>

                      {/* Created */}
                      <TableCell sx={{ fontSize: '0.78rem', color: '#6B7280', py: 1.5 }}>
                        {formatDate(t.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #E5E7EB', '& .MuiTablePagination-toolbar': { fontSize: '0.8rem' } }} />
        </Paper>
      )}
    </Box>
  );
}
