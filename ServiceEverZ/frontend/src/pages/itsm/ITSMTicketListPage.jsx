import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, TextField,
  InputAdornment, Stack, Chip, Tooltip, Button,
  Grid, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TimerIcon from '@mui/icons-material/Timer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllTickets } from '../../api/ticketApi';
import TicketStatusChip from '../../components/common/TicketStatusChip';

/* ─── CSV Export ─────────────────────────────────────────────── */
function exportToCSV(tickets, filename = 'itsm-tickets.csv') {
  const headers = ['Ticket #', 'Subject', 'Requester', 'Category', 'Priority', 'Status', 'SLA Breached', 'Updated At'];
  const rows = tickets.map(t => [
    t.ticketNumber || '',
    `"${(t.subject || '').replace(/"/g, '""')}"`,
    t.requesterName || '',
    t.category || '',
    t.priority || '',
    t.status || '',
    t.slaBreached ? 'Yes' : 'No',
    t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const PRIORITY_COLOR = {
  LOW: { color: '#24A148', bg: '#EDFAF2' },
  MEDIUM: { color: '#E2B93B', bg: '#FDF8EC' },
  HIGH: { color: '#E01950', bg: '#FDEDF2' },
  CRITICAL: { color: '#97247E', bg: '#F8EDFB' },
};

function SlaIndicator({ slaBreached, slaRemainingMinutes }) {
  if (slaBreached) return (
    <Tooltip title="SLA Breached">
      <Stack direction="row" spacing={0.5} alignItems="center">
        <WarningAmberIcon sx={{ fontSize: 15, color: '#E01950' }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#E01950', fontWeight: 700 }}>Breached</Typography>
      </Stack>
    </Tooltip>
  );
  if (slaRemainingMinutes == null) return <Typography sx={{ color: '#ccc', fontSize: '0.8rem' }}>—</Typography>;
  const hrs = Math.floor(slaRemainingMinutes / 60);
  const mins = slaRemainingMinutes % 60;
  const isLow = slaRemainingMinutes < 60;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <TimerIcon sx={{ fontSize: 15, color: isLow ? '#E2B93B' : '#24A148' }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isLow ? '#E2B93B' : '#24A148' }}>
        {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
      </Typography>
    </Stack>
  );
}

export default function ITSMTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAllTickets();
        setTickets(data);
      } catch { toast.error('Failed to load assigned tickets'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = tickets.filter(t =>
    `${t.ticketNumber} ${t.subject} ${t.requesterName} ${t.category}`
      .toLowerCase().includes(search.toLowerCase())
  );
  const paginatedTickets = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const statusCards = [
    { label: 'Total',       count: tickets.length,                                      color: '#27235C', bg: '#EEF0FF', border: '#C7C9E8' },
    { label: 'Open',        count: tickets.filter(t => t.status === 'OPEN').length,     color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
    { label: 'In Progress', count: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
    { label: 'SLA Breach',  count: tickets.filter(t => t.slaBreached).length,           color: '#E01950', bg: '#FEF2F2', border: '#FECACA' },
    { label: 'Closed',      count: tickets.filter(t => t.status === 'CLOSED').length,   color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ManageAccountsIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C', lineHeight: 1.2 }}>
              All Tickets
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.2 }}>
              Manage and resolve all tickets — monitor SLA deadlines
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportToCSV(filtered)}
          disabled={filtered.length === 0}
          sx={{ borderColor: '#27235C', color: '#27235C', borderRadius: '9px', fontWeight: 600, fontSize: '0.82rem', '&:hover': { backgroundColor: '#EEF0FF' } }}
        >
          Export CSV
        </Button>
      </Stack>

      {/* ── Status Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statusCards.map(({ label, count, color, bg, border }) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Paper elevation={0} sx={{ px: 2.5, py: 2, borderRadius: '14px', backgroundColor: bg, border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{count}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color, fontWeight: 600, mt: 0.5, opacity: 0.8 }}>{label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Search ── */}
      <TextField
        placeholder="Search by ticket number, subject, requester, or category..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0); }}
        fullWidth
        sx={{ mb: 2.5, background: '#fff', borderRadius: '10px' }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
          sx: { borderRadius: '10px' },
        }}
      />

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Ticket #', 'Subject', 'Requester', 'Category', 'Priority', 'Status', 'SLA Remaining', 'Updated'].map(h => (
                  <TableCell key={h} sx={{ backgroundColor: '#F8F8FC', fontWeight: 700, color: '#27235C', fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#9CA3AF' }}>Loading...</TableCell></TableRow>
              ) : paginatedTickets.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#9CA3AF' }}>No tickets found</TableCell></TableRow>
              ) : (
                paginatedTickets.map(ticket => {
                  const pri = PRIORITY_COLOR[ticket.priority] ?? PRIORITY_COLOR.LOW;
                  return (
                    <TableRow
                      key={ticket.id} hover
                      onClick={() => navigate(`/itsm/tickets/${ticket.id}`)}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F8F8FC' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', px: 1, py: 0.3, borderRadius: '6px', backgroundColor: '#EEF0FF', border: '1px solid #C7C9E8' }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#27235C' }}>{ticket.ticketNumber}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1F2937' }}>{ticket.subject}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#6B7280' }}>{ticket.requesterName ?? '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#6B7280' }}>{ticket.category ?? '—'}</TableCell>
                      <TableCell>
                        <Chip label={ticket.priority} size="small" sx={{ backgroundColor: pri.bg, color: pri.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                      </TableCell>
                      <TableCell><TicketStatusChip status={ticket.status} /></TableCell>
                      <TableCell>
                        {!['CLOSED', 'RESOLVED'].includes(ticket.status) && (
                          <SlaIndicator slaBreached={ticket.slaBreached} slaRemainingMinutes={ticket.slaRemainingMinutes} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#6B7280' }}>
                        {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—'}
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
