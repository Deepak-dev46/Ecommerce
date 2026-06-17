import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Button, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, IconButton, Tooltip, FormControl,
  InputLabel, Select, MenuItem, Drawer, Chip,
} from '@mui/material';
import SearchIcon  from '@mui/icons-material/Search';
import AddIcon     from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AcUnitIcon  from '@mui/icons-material/AcUnit';
import { useNavigate } from 'react-router-dom';
import { getAllChangePlans, getChangePlanById, getAllFreezeWindows } from '../../api/changeApi';
import { ChangeStatusChip, PriorityChip, ChangeTypeChip } from '../../components/change/ChangeStatusChip';
import ChangeDetailPanel from '../../components/change/ChangeDetailPanel';
import { useAuth } from '../../context/AuthContext';
import toast from '../../utils/toast';
import CustomPagination from '../../components/common/CustomPagination';

// ── Constants ──────────────────────────────────────────────────────────────────
const ALL_STATUSES = ['All', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'CANCELLED', 'FREEZE_WINDOW'];
const TAB_LABELS   = {
  All: 'All', DRAFT: 'Draft', PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved', REJECTED: 'Rejected',
  REVISION_REQUESTED: 'Revision', CANCELLED: 'Cancelled',
  FREEZE_WINDOW: 'Freeze Window',
};
const PRIORITIES = ['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TYPES      = ['All', 'STANDARD', 'NORMAL', 'EMERGENCY'];
const fmt      = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';
const fmtFull  = (dt) => dt ? new Date(dt).toLocaleString() : '—';

// ── Freeze Window status chip ──────────────────────────────────────────────────
function FreezeStatusChip({ fw }) {
  const now      = new Date();
  const start    = new Date(fw.freezeStart);
  const end      = new Date(fw.freezeEnd);
  const active   = start <= now && end >= now;
  const upcoming = start > now;
  const label    = active ? 'Active' : upcoming ? 'Upcoming' : 'Expired';
  const bg       = active ? '#DBEAFE' : upcoming ? '#FEF3C7' : '#F3F4F6';
  const color    = active ? '#1E40AF' : upcoming ? '#92400E' : '#6B7280';
  return (
    <Chip
      label={label} size="small"
      sx={{ backgroundColor: bg, color, fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px' }}
    />
  );
}

// ── Freeze Window table (read-only, reuses getAllFreezeWindows) ─────────────────
function FreezeWindowTable() {
  const [windows, setWindows]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllFreezeWindows();
      setWindows(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load freeze windows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = windows.filter((fw) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      fw.reason?.toLowerCase().includes(q) ||
      fw.createdByManagerName?.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Sub-header */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexShrink: 0, flexWrap: 'wrap' }} alignItems="center">
        <TextField
          size="small"
          placeholder="Search by reason or created by…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
          sx={{ flex: '1 1 200px', maxWidth: 340 }}
        />
        <Tooltip title="Refresh">
          <IconButton onClick={load} size="small" sx={{ width: 36, height: 36 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ color: '#9CA3AF', ml: 'auto !important' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AcUnitIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            {search ? 'No freeze windows match your search' : 'No freeze windows defined'}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Reason / Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Notification</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((fw) => (
                  <TableRow key={fw.id} hover sx={{ '&:hover': { backgroundColor: '#F0F4FF' } }}>
                    <TableCell><FreezeStatusChip fw={fw} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {fw.reason ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fmtFull(fw.freezeStart)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fmtFull(fw.freezeEnd)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fw.createdByManagerName ?? `Manager #${fw.createdByManagerId}`}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fw.notificationSent ? 'Sent' : 'Pending'}
                        size="small"
                        sx={{
                          backgroundColor: fw.notificationSent ? '#D1FAE5' : '#FEE2E2',
                          color: fw.notificationSent ? '#065F46' : '#991B1B',
                          fontSize: '0.65rem', fontWeight: 600, borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fmt(fw.createdAt)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={filtered.length}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ChangeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab]               = useState('All');
  const [changes, setChanges]       = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [priority, setPriority]     = useState('All');
  const [typeFilter, setType]       = useState('All');
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const [detail, setDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isFreezeTab = tab === 'FREEZE_WINDOW';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllChangePlans();
      setChanges(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load change plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (isFreezeTab) return;
    let list = changes;
    if (tab !== 'All')        list = list.filter((c) => c.status === tab);
    if (priority !== 'All')   list = list.filter((c) => c.priority === priority);
    if (typeFilter !== 'All') list = list.filter((c) => c.changeType === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.changeNumber?.toLowerCase().includes(q) ||
          c.createdBySpName?.toLowerCase().includes(q),
      );
    }
    setFiltered(list);
    setPage(0);
  }, [changes, tab, search, priority, typeFilter, isFreezeTab]);

  const openDrawer = async (row) => {
    setSelected(row);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await getChangePlanById(row.id);
      setDetail(res.data?.data ?? row);
    } catch {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => { setSelected(null); setDetail(null); }, 300);
  };

  const handleRefresh = () => { load(); if (selected) openDrawer(selected); };

  const handleTabChange = (s) => {
    setTab(s);
    setPage(0);
    if (drawerOpen) closeDrawer();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* Header */}
      <Box sx={{ p: 2, pb: 0, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#27235C' }}>Change Plans</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Create and track change requests through the approval workflow
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small" sx={{ width: 44, height: 44 }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {!isFreezeTab && (
              <Button
                variant="contained" startIcon={<AddIcon />}
                onClick={() => navigate('/support/changeplan/create')}
                sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
              >
                New Change Plan
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Status tabs — including Freeze Window */}
        <Stack direction="row" sx={{ borderBottom: '2px solid #E5E7EB', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          {ALL_STATUSES.map((s) => {
            const isFW   = s === 'FREEZE_WINDOW';
            const count  = isFW ? null : (s === 'All' ? changes.length : changes.filter((c) => c.status === s).length);
            const active = tab === s;
            return (
              <Box key={s} onClick={() => handleTabChange(s)}
                sx={{
                  px: 2, pb: 1, cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: active ? '2px solid #27235C' : '2px solid transparent',
                  mb: '-2px',
                  display: 'flex', alignItems: 'center', gap: 0.5,
                }}
              >
                {isFW && (
                  <AcUnitIcon
                    sx={{ fontSize: '0.8rem', color: active ? '#27235C' : '#6B7280', mb: '1px' }}
                  />
                )}
                <Typography variant="caption" sx={{ fontWeight: active ? 700 : 500, color: active ? '#27235C' : '#6B7280' }}>
                  {TAB_LABELS[s]}
                  {!isFW && count > 0 && (
                    <Box component="span" sx={{ ml: 0.75, px: 0.75, py: 0.1, background: active ? '#27235C' : '#E5E7EB', color: active ? '#fff' : '#374151', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700 }}>
                      {count}
                    </Box>
                  )}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', px: 2, py: 2 }}>

        {/* ── FREEZE WINDOW VIEW ── */}
        {isFreezeTab ? (
          <FreezeWindowTable />
        ) : (
          <>
            {/* Filters */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexShrink: 0, flexWrap: 'wrap' }} alignItems="center">
              <TextField
                size="small"
                placeholder="Search by title, number, SP…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
                sx={{ flex: '1 1 200px', maxWidth: 340 }}
              />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(0); }}>
                  {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p === 'All' ? 'All Priorities' : p.charAt(0) + p.slice(1).toLowerCase()}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={typeFilter} onChange={(e) => { setType(e.target.value); setPage(0); }}>
                  {TYPES.map((t) => <MenuItem key={t} value={t}>{t === 'All' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ color: '#9CA3AF', ml: 'auto !important' }}>
                {filtered.length} plan{filtered.length !== 1 ? 's' : ''}
              </Typography>
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No change plans found</Typography>
              </Box>
            ) : (
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Change #</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Manager</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Planned Start</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => {
                        const isSelected = selected?.id === c.id;
                        return (
                          <TableRow key={c.id} hover selected={isSelected} onClick={() => openDrawer(c)}
                            sx={{ cursor: 'pointer', backgroundColor: isSelected ? '#EEF2FF' : undefined, borderLeft: isSelected ? '3px solid #27235C' : '3px solid transparent', '&:hover': { backgroundColor: '#F5F5FF' } }}
                          >
                            <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#27235C' }}>{c.changeNumber}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</Typography></TableCell>
                            <TableCell><ChangeStatusChip status={c.status} /></TableCell>
                            <TableCell><PriorityChip priority={c.priority} /></TableCell>
                            <TableCell><ChangeTypeChip changeType={c.changeType} /></TableCell>
                            <TableCell><Typography variant="caption">{c.assignedManagerName ?? '—'}</Typography></TableCell>
                            <TableCell><Typography variant="caption">{fmt(c.plannedStartTime)}</Typography></TableCell>
                            <TableCell><Typography variant="caption">{fmt(c.createdAt)}</Typography></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <CustomPagination
                  count={filtered.length}
                  page={page}
                  onPageChange={newPage => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* ── Change Detail Drawer (only for change plan tabs) ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 460 }, backgroundColor: '#F7F8FC', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', top: '64px', height: 'calc(100% - 64px)' } }}
      >
        {detailLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : selected && (
          <ChangeDetailPanel
            change={detail ?? selected}
            onClose={closeDrawer}
            onRefresh={handleRefresh}
            onEdit={(c) => { closeDrawer(); navigate(`/changes/edit/${c.id}`); }}
            currentUserId={user?.id ?? 1}
            isManager={false}
          />
        )}
      </Drawer>
    </Box>
  );
}
