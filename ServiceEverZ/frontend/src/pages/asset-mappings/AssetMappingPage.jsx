import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Tooltip, IconButton, TablePagination,
  InputAdornment, MenuItem, Select, FormControl, InputLabel, Chip,
} from '@mui/material';
import CheckIcon         from '@mui/icons-material/Check';
import CloseIcon         from '@mui/icons-material/Close';
import AddIcon           from '@mui/icons-material/Add';
import SearchIcon        from '@mui/icons-material/Search';
import FilterListIcon    from '@mui/icons-material/FilterList';
import ClearIcon         from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAllMappings, getPendingSpApprovals, getPendingManagerApprovals,
  spDecision, managerDecision, releaseAsset,
} from '../../api/assetApi';
import { MappingStatusChip } from '../../components/assets/AssetStatusChip';
import toast from '../../utils/toast';

const TABS = ['All Mappings', 'Pending SP', 'Pending Manager'];

const ALL_CATEGORIES = [
  'LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'PROJECTOR',
  'SERVER', 'NETWORK_DEVICE', 'MOBILE', 'TABLET', 'PERIPHERAL', 'OTHER',
];

const ALL_STATUSES = [
  { value: 'PENDING_SP_APPROVAL',                     label: 'Pending SP',            color: '#E2B93B', bg: '#FFF8E1' },
  { value: 'PENDING_MANAGER_APPROVAL',                label: 'Pending Manager',        color: '#E2B93B', bg: '#FFF8E1' },
  { value: 'ADDITIONAL_DETAILS_REQUESTED_BY_SP',      label: 'Info Needed (SP)',       color: '#97247E', bg: '#F9EEF7' },
  { value: 'ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER', label: 'Info Needed (Mgr)',      color: '#97247E', bg: '#F9EEF7' },
  { value: 'SP_APPROVED',                             label: 'SP Approved',            color: '#24A148', bg: '#E8F5E9' },
  { value: 'MANAGER_APPROVED',                        label: 'Manager Approved',       color: '#24A148', bg: '#E8F5E9' },
  { value: 'REJECTED_BY_SP',                          label: 'Rejected by SP',         color: '#E01950', bg: '#FDEEF2' },
  { value: 'REJECTED_BY_MANAGER',                     label: 'Rejected by Manager',    color: '#E01950', bg: '#FDEEF2' },
  { value: 'ACTIVE',                                  label: 'Active',                 color: '#27235C', bg: '#EDEDF7' },
  { value: 'RELEASED',                                label: 'Released',               color: '#666',    bg: '#F5F5F5' },
];

const BRAND   = '#27235C';
const ACCENT  = '#97247E';
const FONT    = "'Inter', 'Segoe UI', sans-serif";

/* ── Category chip colour map ─────────────────────────────────────────── */
const CAT_COLORS = {
  LAPTOP:         { bg: '#EEF2FF', text: '#4338CA' },
  DESKTOP:        { bg: '#F0FDF4', text: '#166534' },
  MONITOR:        { bg: '#FFF7ED', text: '#C2410C' },
  PRINTER:        { bg: '#FDF4FF', text: '#86198F' },
  PROJECTOR:      { bg: '#ECFDF5', text: '#065F46' },
  SERVER:         { bg: '#FEF2F2', text: '#991B1B' },
  NETWORK_DEVICE: { bg: '#EFF6FF', text: '#1D4ED8' },
  MOBILE:         { bg: '#F0FDF4', text: '#15803D' },
  TABLET:         { bg: '#FFFBEB', text: '#92400E' },
  PERIPHERAL:     { bg: '#F5F3FF', text: '#5B21B6' },
  OTHER:          { bg: '#F9FAFB', text: '#374151' },
};

function CategoryChip({ category }) {
  if (!category) return <Typography sx={{ fontSize: '0.78rem', color: '#AAA' }}>—</Typography>;
  const c = CAT_COLORS[category] || { bg: '#F9FAFB', text: '#374151' };
  const label = category.replace('_', ' ');
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.03em',
        backgroundColor: c.bg, color: c.text, border: `1px solid ${c.text}28`,
        fontFamily: FONT,
      }}
    />
  );
}

function DecisionDialog({ open, onClose, onSubmit, title, color, loading, showAdditional }) {
  const [remarks, setRemarks] = useState('');
  const [request, setRequest] = useState('');
  const [mode, setMode]       = useState('decide');

  const reset = () => { setRemarks(''); setRequest(''); setMode('decide'); };
  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {showAdditional && mode === 'decide' && (
          <Button size="small" onClick={() => setMode('additional')} sx={{ mb: 2, color: ACCENT }}>
            Request Additional Details Instead
          </Button>
        )}
        {mode === 'additional' ? (
          <TextField fullWidth multiline rows={3}
            label="Specify what additional information you need"
            value={request} onChange={e => setRequest(e.target.value)}
            placeholder="Describe the missing details you require…" />
        ) : (
          <TextField fullWidth multiline rows={3}
            label="Remarks (optional)"
            value={remarks} onChange={e => setRemarks(e.target.value)} />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#666' }}>Cancel</Button>
        {mode === 'additional' ? (
          <Button variant="contained"
            onClick={() => { onSubmit('additional', request); reset(); }}
            disabled={!request.trim() || loading}
            sx={{ backgroundColor: ACCENT, '&:hover': { backgroundColor: '#7A1B66' } }}>
            Send Request
          </Button>
        ) : (
          <>
            <Button variant="outlined"
              onClick={() => { onSubmit('reject', remarks); reset(); }}
              disabled={loading}
              sx={{ borderColor: '#E01950', color: '#E01950', '&:hover': { backgroundColor: '#FDEEF2' } }}>
              Reject
            </Button>
            <Button variant="contained"
              onClick={() => { onSubmit('approve', remarks); reset(); }}
              disabled={loading}
              sx={{ backgroundColor: color, '&:hover': { filter: 'brightness(0.9)' } }}>
              {loading ? 'Processing…' : 'Approve'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function AssetMappingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId   = user.userId;

  const [tab, setTab]                     = useState(0);
  const [rows, setRows]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [decision, setDecision]           = useState(null);
  const [acting, setActing]               = useState(false);
  const [releaseId, setReleaseId]         = useState(null);
  const [releaseReason, setReleaseReason] = useState('');
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(10);

  /* ── Search & filter state ─────────────────────────────────────────── */
  const [search, setSearch]                 = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter]     = useState('ALL');

  const fetchRows = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let res;
      if (tab === 1)      res = await getPendingSpApprovals();
      else if (tab === 2) res = await getPendingManagerApprovals();
      else                res = await getAllMappings();
      setRows(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load mappings');
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  /* Reset page & filters when tab changes */
  const handleTabChange = (_, v) => {
    setTab(v);
    setPage(0);
    setSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
  };

  /* ── Derived: categories present in current data ──────────────────── */
  const availableCategories = useMemo(() => {
    const cats = new Set(rows.map(r => r.assetCategory).filter(Boolean));
    return ALL_CATEGORIES.filter(c => cats.has(c));
  }, [rows]);

  /* ── Derived: statuses present in current data ─────────────────────── */
  const availableStatuses = useMemo(() => {
    const statuses = new Set(rows.map(r => r.status).filter(Boolean));
    return ALL_STATUSES.filter(s => statuses.has(s.value));
  }, [rows]);

  /* ── Filtered rows ────────────────────────────────────────────────── */
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(m => {
      const matchCategory = categoryFilter === 'ALL' || m.assetCategory === categoryFilter;
      const matchStatus   = statusFilter   === 'ALL' || m.status        === statusFilter;
      if (!matchCategory || !matchStatus) return false;
      if (!q) return true;
      return (
        (m.mappingNumber   || '').toLowerCase().includes(q) ||
        (m.assetName       || '').toLowerCase().includes(q) ||
        (m.assetTag        || '').toLowerCase().includes(q) ||
        (m.assetCategory   || '').toLowerCase().includes(q) ||
        String(m.ticketId  || '').toLowerCase().includes(q) ||
        (m.requestedByUserName || '').toLowerCase().includes(q) ||
        (m.assignedBySpName    || '').toLowerCase().includes(q)
      );
    });
  }, [rows, search, categoryFilter, statusFilter]);

  const activeFilterCount = (search.trim() ? 1 : 0) + (categoryFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0);

  const clearFilters = () => { setSearch(''); setCategoryFilter('ALL'); setStatusFilter('ALL'); setPage(0); };

  /* ── Decision handler ─────────────────────────────────────────────── */
  const handleDecision = async (action, value) => {
    if (!decision) return;
    setActing(true);
    try {
      if (decision.type === 'sp') {
        await spDecision(decision.id, action === 'additional'
          ? { spId: userId, decision: 'REQUEST_ADDITIONAL_DETAILS', additionalDetailsRequest: value }
          : { spId: userId, decision: action === 'approve' ? 'APPROVE' : 'REJECT', remarks: value || undefined });
      } else {
        await managerDecision(decision.id, action === 'additional'
          ? { managerId: userId, decision: 'REQUEST_ADDITIONAL_DETAILS', additionalDetailsRequest: value }
          : { managerId: userId, decision: action === 'approve' ? 'APPROVE' : 'REJECT', remarks: value || undefined });
      }
      setDecision(null);
      if (action === 'approve')     toast.success('✅ Asset mapping approved successfully!');
      else if (action === 'reject') toast.error('❌ Asset mapping rejected.');
      else if (action === 'additional') toast.info('ℹ️ Additional details requested from user.');
      fetchRows();
    } catch (e) {
      const msg = e.response?.data?.message || 'Action failed';
      setError(msg); toast.error(msg);
    } finally { setActing(false); }
  };

  const handleRelease = async () => {
    setActing(true);
    try {
      await releaseAsset(releaseId, { releasedBySpId: userId, remarks: releaseReason || undefined });
      toast.success('✅ Asset released successfully!');
      setReleaseId(null); setReleaseReason(''); fetchRows();
    } catch (e) {
      const msg = e.response?.data?.message || 'Release failed';
      setError(msg); toast.error(msg);
    } finally { setActing(false); }
  };

  const displayedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: FONT }}>Asset Mappings</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666', mt: 0.3, fontFamily: FONT }}>
            Manage asset assignment requests and approvals
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/support/asset-mappings/create')}
          sx={{ backgroundColor: BRAND, fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                borderRadius: '10px', '&:hover': { backgroundColor: '#1B193F' } }}>
          New Mapping
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 16px #0000000D' }}>
        {/* Tabs */}
        <Tabs value={tab} onChange={handleTabChange}
          sx={{ borderBottom: '1px solid #EFEFEF', px: 2,
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontFamily: FONT },
                '& .Mui-selected': { color: BRAND },
                '& .MuiTabs-indicator': { backgroundColor: BRAND } }}>
          {TABS.map((t, i) => <Tab key={i} label={t} />)}
        </Tabs>

        {/* ── Search & Filter bar ──────────────────────────────────── */}
        <Box sx={{
          px: 2.5, py: 1.8,
          display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
          borderBottom: '1px solid #F5F5F5',
          background: 'linear-gradient(135deg, #FAFAFA 0%, #F7F5FF 100%)',
        }}>
          {/* Search input */}
          <TextField
            size="small"
            placeholder="Search by asset, mapping #, ticket, requester…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#999' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearch(''); setPage(0); }}>
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              flex: '1 1 260px', maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', fontFamily: FONT, fontSize: '0.84rem',
                backgroundColor: '#fff',
                '&.Mui-focused fieldset': { borderColor: BRAND },
              },
            }}
          />

          {/* Category filter */}
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel sx={{ fontFamily: FONT, fontSize: '0.84rem', color: '#666',
                              '&.Mui-focused': { color: BRAND } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FilterListIcon sx={{ fontSize: 15 }} /> Category
              </Box>
            </InputLabel>
            <Select
              value={categoryFilter}
              label="⠀Category"
              onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
              sx={{
                borderRadius: '10px', fontFamily: FONT, fontSize: '0.84rem',
                backgroundColor: '#fff',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND },
              }}
            >
              <MenuItem value="ALL" sx={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 600 }}>
                All Categories
              </MenuItem>
              <Box sx={{ height: '1px', backgroundColor: '#F0F0F0', mx: 1, my: 0.5 }} />
              {(availableCategories.length > 0 ? availableCategories : ALL_CATEGORIES).map(cat => {
                const c = CAT_COLORS[cat] || { bg: '#F9FAFB', text: '#374151' };
                return (
                  <MenuItem key={cat} value={cat} sx={{ fontFamily: FONT, fontSize: '0.84rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: c.text, flexShrink: 0,
                      }} />
                      {cat.replace('_', ' ')}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Status filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ fontFamily: FONT, fontSize: '0.84rem', color: '#666',
                              '&.Mui-focused': { color: ACCENT } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FilterListIcon sx={{ fontSize: 15 }} /> Status
              </Box>
            </InputLabel>
            <Select
              value={statusFilter}
              label="⠀Status"
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              renderValue={(val) => {
                if (val === 'ALL') return <Typography sx={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 600 }}>All Statuses</Typography>;
                const s = ALL_STATUSES.find(x => x.value === val);
                return s ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.84rem' }}>{s.label}</Typography>
                  </Box>
                ) : val;
              }}
              sx={{
                borderRadius: '10px', fontFamily: FONT, fontSize: '0.84rem',
                backgroundColor: statusFilter !== 'ALL' ? `${ALL_STATUSES.find(x => x.value === statusFilter)?.bg || '#fff'}` : '#fff',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                ...(statusFilter !== 'ALL' && {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${ALL_STATUSES.find(x => x.value === statusFilter)?.color || ACCENT}66`,
                  },
                }),
              }}
            >
              <MenuItem value="ALL" sx={{ fontFamily: FONT, fontSize: '0.84rem', fontWeight: 600 }}>
                All Statuses
              </MenuItem>
              <Box sx={{ height: '1px', backgroundColor: '#F0F0F0', mx: 1, my: 0.5 }} />
              {(availableStatuses.length > 0 ? availableStatuses : ALL_STATUSES).map(s => (
                <MenuItem key={s.value} value={s.value} sx={{ fontFamily: FONT, fontSize: '0.84rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{
                      width: 9, height: 9, borderRadius: '50%',
                      backgroundColor: s.color, flexShrink: 0,
                    }} />
                    <Box sx={{
                      px: 1, py: 0.15, borderRadius: '6px',
                      backgroundColor: s.bg, border: `1px solid ${s.color}30`,
                    }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600, color: s.color }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Active filter summary + clear */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            {activeFilterCount > 0 && (
              <>
                <Typography sx={{ fontSize: '0.78rem', color: '#888', fontFamily: FONT }}>
                  {filteredRows.length} of {rows.length} shown
                </Typography>
                <Button
                  size="small"
                  startIcon={<ClearIcon sx={{ fontSize: 13 }} />}
                  onClick={clearFilters}
                  sx={{
                    fontFamily: FONT, fontSize: '0.75rem', textTransform: 'none',
                    color: ACCENT, fontWeight: 600,
                    '&:hover': { backgroundColor: `${ACCENT}10` },
                  }}
                >
                  Clear filters
                </Button>
              </>
            )}
            {activeFilterCount === 0 && (
              <Typography sx={{ fontSize: '0.78rem', color: '#AAA', fontFamily: FONT }}>
                {rows.length} total record{rows.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Table ───────────────────────────────────────────────── */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                {['Mapping #', 'Asset', 'Category', 'Ticket', 'Requested By', 'SP', 'Manager', 'Status', 'Created', 'Actions'].map(h => (
                  <TableCell key={h} sx={{
                    fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem',
                    color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderBottom: '2px solid #F0F0F0', py: 1.2,
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: BRAND }} />
                  </TableCell>
                </TableRow>
              ) : displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <SearchIcon sx={{ fontSize: 36, color: '#DDD' }} />
                      <Typography sx={{ color: '#888', fontFamily: FONT, fontSize: '0.875rem' }}>
                        {rows.length === 0 ? 'No mappings found' : 'No results match your search / filter'}
                      </Typography>
                      {activeFilterCount > 0 && (
                        <Button size="small" onClick={clearFilters}
                          sx={{ color: ACCENT, fontFamily: FONT, textTransform: 'none', fontSize: '0.78rem' }}>
                          Clear filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : displayedRows.map(m => (
                <TableRow key={m.id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFF' } }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: BRAND }}>
                    {m.mappingNumber}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, fontFamily: FONT }}>{m.assetName || m.assetId}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>{m.assetTag}</Typography>
                  </TableCell>
                  <TableCell><CategoryChip category={m.assetCategory} /></TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontFamily: FONT }}>{m.ticketId}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontFamily: FONT }}>{m.requestedByUserName || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontFamily: FONT }}>{m.assignedBySpName || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontFamily: FONT }}>{m.approvedByManagerName || '—'}</TableCell>
                  <TableCell><MappingStatusChip status={m.status} /></TableCell>
                  <TableCell sx={{ fontSize: '0.78rem', color: '#666', fontFamily: FONT }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {(m.status === 'PENDING_SP_APPROVAL' || m.status === 'ADDITIONAL_DETAILS_REQUESTED_BY_SP') && (
                        <Tooltip title="SP Decision">
                          <IconButton size="small" onClick={() => setDecision({ id: m.id, type: 'sp' })} sx={{ color: '#24A148' }}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {m.status === 'ACTIVE' && (
                        <Tooltip title="Release Asset">
                          <IconButton size="small" onClick={() => setReleaseId(m.id)} sx={{ color: '#E01950' }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: '1px solid #F0F0F0', fontFamily: FONT }}
        />
      </Paper>

      {/* ── Decision dialog ──────────────────────────────────────────── */}
      <DecisionDialog
        open={!!decision}
        onClose={() => setDecision(null)}
        onSubmit={handleDecision}
        title={decision?.type === 'sp' ? 'Support Personnel Decision' : 'Manager Decision'}
        color={decision?.type === 'sp' ? '#24A148' : ACCENT}
        loading={acting}
        showAdditional
      />

      {/* ── Release dialog ───────────────────────────────────────────── */}
      <Dialog open={!!releaseId} onClose={() => setReleaseId(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#E01950', fontFamily: FONT }}>Release Asset</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth multiline rows={3} label="Release Remarks"
            value={releaseReason} onChange={e => setReleaseReason(e.target.value)}
            placeholder="Describe why the asset is being released…" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReleaseId(null)} sx={{ color: '#666', fontFamily: FONT }}>Cancel</Button>
          <Button variant="contained" onClick={handleRelease} disabled={acting}
            sx={{ backgroundColor: '#E01950', fontFamily: FONT, textTransform: 'none',
                  '&:hover': { backgroundColor: '#B0102E' } }}>
            {acting ? 'Processing…' : 'Release'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
