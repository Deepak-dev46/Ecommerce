// FILE: src/pages/support/SupportIncidentListPage.jsx
// CREATE THIS NEW FILE
 
import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, TextField,
  InputAdornment, Stack, Chip, Button,
  Grid, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
 
const INCIDENT_URL = 'http://localhost:8088';
 
function exportToCSV(incidents, filename = 'assigned-incidents.csv') {
  const headers = ['Ticket #', 'Subject', 'Requester', 'Priority', 'Status', 'Source', 'Created At'];
  const rows = incidents.map(i => [
    i.ticketNumber || '',
    `"${(i.subject || '').replace(/"/g, '""')}"`,
    i.requesterName || '',
    i.priority || '',
    i.status || '',
    i.source || '',
    i.createdAt ? new Date(i.createdAt).toLocaleString() : '',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
 
const PRIORITY_COLOR = {
  LOW:      { color: '#24A148', bg: '#EDFAF2' },
  MEDIUM:   { color: '#E2B93B', bg: '#FDF8EC' },
  HIGH:     { color: '#E01950', bg: '#FDEDF2' },
  CRITICAL: { color: '#97247E', bg: '#F8EDFB' },
};
 
const STATUS_COLOR = {
  'New':         { color: '#2563EB', bg: '#EFF6FF' },
  'In Progress': { color: '#E2B93B', bg: '#FDF8EC' },
  'Resolved':    { color: '#24A148', bg: '#EDFAF2' },
  'Closed':      { color: '#6B7280', bg: '#F3F4F6' },
  'Open':        { color: '#524F7D', bg: '#F0EFF8' },
};
 
function IncidentStatusChip({ status }) {
  const cfg = STATUS_COLOR[status] || STATUS_COLOR['Open'];
  return (
    <Chip label={status || '—'} size="small"
      sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22,
        color: cfg.color, backgroundColor: cfg.bg }} />
  );
}
 
export default function SupportIncidentListPage() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();
 
  useEffect(() => {
    if (!user?.userId) return;
    const load = async () => {
      try {
        const res = await fetch(
          `${INCIDENT_URL}/api/incidents?assignedTo=${user.userId}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json) ? json
                   : Array.isArray(json?.data) ? json.data
                   : [];
        setIncidents(list);
      } catch {
        toast.error('Failed to load assigned incidents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);
 
  const filtered = incidents.filter(i =>
    `${i.ticketNumber} ${i.subject} ${i.requesterName} ${i.status}`
      .toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  const statusCards = [
    { label: 'Total',       count: incidents.length,                                             color: '#97247E', bg: '#F8EDFB', border: '#E0BEDC' },
    { label: 'New',         count: incidents.filter(i => i.status === 'New').length,             color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    { label: 'In Progress', count: incidents.filter(i => i.status === 'In Progress').length,     color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
    { label: 'Resolved',    count: incidents.filter(i => i.status === 'Resolved').length,        color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
    { label: 'Closed',      count: incidents.filter(i => i.status === 'Closed').length,          color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  ];
 
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
 
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #97247E 0%, #27235C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WarningAmberIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C', lineHeight: 1.2 }}>
              Assigned Incidents
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.2 }}>
              Manage and resolve incidents assigned to you
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportToCSV(filtered)}
          disabled={filtered.length === 0}
          sx={{ borderColor: '#97247E', color: '#97247E', borderRadius: '9px', fontWeight: 600, fontSize: '0.82rem',
            '&:hover': { backgroundColor: '#F8EDFB', borderColor: '#97247E' } }}
        >
          Export CSV
        </Button>
      </Stack>
 
      {/* Status Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statusCards.map(({ label, count, color, bg, border }) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Paper elevation={0} sx={{
              px: 2.5, py: 2, borderRadius: '14px',
              backgroundColor: bg, border: `1px solid ${border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{count}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color, fontWeight: 600, mt: 0.5, opacity: 0.8 }}>{label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
 
      {/* Search */}
      <TextField
        placeholder="Search by ticket number, subject, requester, status..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0); }}
        fullWidth
        sx={{ mb: 2.5, background: '#fff', borderRadius: '10px' }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
          sx: { borderRadius: '10px' },
        }}
      />
 
      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Incident #', 'Subject', 'Requester', 'Priority', 'Status', 'Source', 'Created'].map(h => (
                  <TableCell key={h} sx={{ backgroundColor: '#F8F8FC', fontWeight: 700, color: '#27235C', fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF' }}>Loading incidents…</TableCell></TableRow>
              ) : paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF' }}>No incidents found</TableCell></TableRow>
              ) : (
                paginated.map(incident => {
                  const pri = PRIORITY_COLOR[incident.priority?.toUpperCase()] ?? PRIORITY_COLOR.MEDIUM;
                  return (
                    <TableRow
                      key={incident.incidentId}
                      hover
                      onClick={() => navigate(`/support/incidents/${incident.incidentId}`)}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F8F8FC' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', px: 1, py: 0.3, borderRadius: '6px', backgroundColor: '#F8EDFB', border: '1px solid #E0BEDC' }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#97247E' }}>
                            {incident.ticketNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1F2937' }}>{incident.subject}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#6B7280' }}>{incident.requesterName ?? '—'}</TableCell>
                      <TableCell>
                        {incident.priority
                          ? <Chip label={incident.priority} size="small" sx={{ backgroundColor: pri.bg, color: pri.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                          : <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>—</Typography>
                        }
                      </TableCell>
                      <TableCell><IncidentStatusChip status={incident.status} /></TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#6B7280' }}>{incident.source ?? '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#6B7280' }}>
                        {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
}
