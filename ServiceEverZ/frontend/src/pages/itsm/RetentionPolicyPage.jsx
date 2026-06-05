import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Paper, IconButton, Tooltip, CircularProgress,
  Card, Grid, Chip, Alert, Dialog, DialogContent,
  DialogActions, Switch, FormControlLabel, Stack, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Drawer,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PolicyIcon from '@mui/icons-material/Policy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import BackupIcon from '@mui/icons-material/Backup';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import {
  getAllRetentionPolicies,
  createRetentionPolicy,
  updateRetentionPolicy,
  deleteRetentionPolicy,
} from '../../api/retentionPolicyApi';
import { assetApi } from '../../api/assetApi';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from '../../utils/toast';
import CustomPagination from '../../components/common/CustomPagination';

const BRAND = '#27235C';
const ACCENT = '#97247E';
const BORDER = '#E8E8F0';

const RETENTION_TYPES = ['BACKUP', 'ARCHIVAL', 'COMPLIANCE', 'AUDIT', 'DISASTER_RECOVERY', 'OTHER'];
const RETENTION_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'OTHER'];

const fmtDateShort = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';
const fmtDateLong = (dt) => dt ? new Date(dt).toLocaleString() : '—';

// ── Chips ─────────────────────────────────────────────────────────────────────

function FrequencyChip({ frequency, customFrequency }) {
  const label = frequency === 'OTHER' && customFrequency ? customFrequency : frequency;
  const map = {
    DAILY: { color: '#0369a1', bg: '#e0f2fe' },
    WEEKLY: { color: '#065f46', bg: '#d1fae5' },
    MONTHLY: { color: '#7c3aed', bg: '#ede9fe' },
    QUARTERLY: { color: '#92400e', bg: '#fef3c7' },
    YEARLY: { color: '#9f1239', bg: '#ffe4e6' },
  };
  const s = map[frequency] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={label} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function TypeChip({ type, customType }) {
  const label = type === 'OTHER' && customType ? customType : (type?.replace(/_/g, ' ') || '—');
  const map = {
    BACKUP: { color: '#0369a1', bg: '#e0f2fe' },
    ARCHIVAL: { color: '#065f46', bg: '#d1fae5' },
    COMPLIANCE: { color: '#7c3aed', bg: '#ede9fe' },
    AUDIT: { color: '#92400e', bg: '#fef3c7' },
    DISASTER_RECOVERY: { color: '#9f1239', bg: '#ffe4e6' },
  };
  const s = map[type] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={label} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function StatusChip({ isActive }) {
  return (
    <Chip
      icon={isActive
        ? <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />
        : <CancelIcon sx={{ fontSize: '0.85rem !important' }} />}
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        backgroundColor: isActive ? '#d1fae5' : '#fee2e2',
        color: isActive ? '#065f46' : '#991b1b',
        fontWeight: 600, fontSize: '0.7rem', height: 22,
      }}
    />
  );
}

function BackupStatusChip({ status }) {
  const map = {
    SCHEDULED: { color: '#0369a1', bg: '#e0f2fe' },
    IN_PROGRESS: { color: '#92400e', bg: '#fef3c7' },
    COMPLETED: { color: '#065f46', bg: '#d1fae5' },
    FAILED: { color: '#991b1b', bg: '#fee2e2' },
    CANCELLED: { color: '#374151', bg: '#f3f4f6' },
  };
  const s = map[status] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={status?.replace(/_/g, ' ')} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <Card sx={{
      p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
      borderLeft: `4px solid ${color}`, borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%',
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: '10px', backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{value ?? '—'}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.3 }}>{label}</Typography>
      </Box>
    </Card>
  );
}

const TH = ({ children, width }) => (
  <TableCell sx={{
    fontWeight: 700, fontSize: '0.72rem', color: '#444',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap',
    backgroundColor: '#F8F8FC', py: 1.5,
    ...(width ? { width } : {}),
  }}>
    {children}
  </TableCell>
);

function DetailRow({ label, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Box sx={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{children}</Box>
    </Box>
  );
}

// ── Section Label inside Dialog ───────────────────────────────────────────────
function SectionLabel({ children, color = BRAND }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Box sx={{ width: 3, height: 15, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
      <Typography sx={{
        fontSize: '0.68rem', fontWeight: 700, color: '#888',
        textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>
        {children}
      </Typography>
    </Box>
  );
}

const EMPTY_FORM = {
  policyName: '', description: '', type: '', customType: '',
  frequency: '', customFrequency: '', retentionDays: '', isActive: true,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RetentionPolicyPage() {
  const { user } = useAuth();

  const [policies, setPolicies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [freqFilter, setFreqFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [drawerPolicy, setDrawerPolicy] = useState(null);

  const [completedSchedules, setCompletedSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState('');
  const [schedPage, setSchedPage] = useState(0);
  const [schedRowsPerPage, setSchedRowsPerPage] = useState(10);
  const [showReport, setShowReport] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchPolicies = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getAllRetentionPolicies();
      setPolicies(Array.isArray(res) ? res : (res.data || []));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load retention policies');
    } finally { setLoading(false); }
  }, []);

  const fetchCompletedSchedules = useCallback(async () => {
    setSchedulesLoading(true); setSchedulesError('');
    try {
      const res = await assetApi
        .get('/api/assets/data-management/backup-schedules/status/COMPLETED')
        .then(r => r.data);
      setCompletedSchedules(Array.isArray(res) ? res : (res.data || []));
    } catch (e) {
      setSchedulesError(e.response?.data?.message || 'Failed to load completed backup schedules');
    } finally { setSchedulesLoading(false); }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);
  useEffect(() => { fetchCompletedSchedules(); }, [fetchCompletedSchedules]);

  // ── Filter ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let list = [...policies];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.policyName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
      );
    }
    if (freqFilter) list = list.filter(p => p.frequency === freqFilter);
    if (statusFilter !== '') list = list.filter(p => String(p.isActive) === statusFilter);
    setFiltered(list);
    setPage(0);
  }, [policies, search, freqFilter, statusFilter]);

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.isActive).length,
    inactive: policies.filter(p => !p.isActive).length,
    daily: policies.filter(p => p.frequency === 'DAILY').length,
  };

  // ── Dialog helpers ───────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setDialogOpen(true);
  };

  const openEdit = (policy, e) => {
    e?.stopPropagation();
    setEditTarget(policy);
    setForm({
      policyName: policy.policyName || '',
      description: policy.description || '',
      type: policy.type || '',
      customType: policy.type === 'OTHER' ? (policy.customType || '') : '',
      frequency: policy.frequency || '',
      customFrequency: policy.frequency === 'OTHER' ? (policy.customFrequency || '') : '',
      retentionDays: String(policy.retentionDays || ''),
      isActive: policy.isActive ?? true,
    });
    setFormErrors({}); setDialogOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.policyName.trim()) errs.policyName = 'Policy name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.type) errs.type = 'Type is required';
    if (form.type === 'OTHER' && !form.customType.trim())
      errs.customType = 'Please specify the type';
    if (!form.frequency) errs.frequency = 'Frequency is required';
    if (form.frequency === 'OTHER') {
      if (!form.customFrequency.trim())
        errs.customFrequency = 'Please specify the frequency';
      if (!form.retentionDays || isNaN(form.retentionDays) || Number(form.retentionDays) < 1)
        errs.retentionDays = 'Retention days must be at least 1';
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        policyName: form.policyName.trim(),
        description: form.description.trim(),
        type: form.type,
        ...(form.type === 'OTHER' && { customType: form.customType.trim() }),
        frequency: form.frequency,
        ...(form.frequency === 'OTHER' && { customFrequency: form.customFrequency.trim() }),
        ...(form.retentionDays && Number(form.retentionDays) >= 1 && {
          retentionDays: Number(form.retentionDays),
        }),
      };

      if (editTarget) {
        await updateRetentionPolicy(editTarget.id, { ...payload, isActive: form.isActive });
        toast.success('Retention policy updated');
      } else {
        await createRetentionPolicy({ ...payload, createdByManagerId: user?.userId });
        toast.success('Retention policy created');
      }
      setDialogOpen(false);
      fetchPolicies();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRetentionPolicy(deleteId);
      setDeleteId(null);
      if (drawerPolicy?.id === deleteId) setDrawerPolicy(null);
      fetchPolicies();
      toast.success('Retention policy deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const pagedPolicies = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pagedSchedules = completedSchedules.slice(
    schedPage * schedRowsPerPage,
    schedPage * schedRowsPerPage + schedRowsPerPage,
  );

  const getLinkedPolicy = (schedule) =>
    schedule.retentionPolicyId
      ? policies.find(p => String(p.id) === String(schedule.retentionPolicyId)) || null
      : null;

  // ── Shared TextField sx ──────────────────────────────────────────────────
  const fieldSx = (accentColor = BRAND) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '&:hover fieldset': { borderColor: accentColor },
      '&.Mui-focused fieldset': { borderColor: accentColor, borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
    '& .MuiInputLabel-root': { backgroundColor: '#fff', px: 0.5 },
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND }}>Retention Policies</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            Manage data retention policies for asset lifecycle management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchPolicies} sx={{ border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            New Policy
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PolicyIcon />} label="Total Policies" value={stats.total} color={BRAND} bg="#eef0fa" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon />} label="Active" value={stats.active} color="#16a34a" bg="#d1fae5" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CancelIcon />} label="Inactive" value={stats.inactive} color="#dc2626" bg="#fee2e2" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PolicyIcon />} label="Daily Policies" value={stats.daily} color={ACCENT} bg="#f8e9f6" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2.5, borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search by name or description…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#999' }} /></InputAdornment> }}
            sx={{ minWidth: 280 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Frequency</InputLabel>
            <Select value={freqFilter} label="Frequency" onChange={e => setFreqFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {RETENTION_FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant={showReport ? 'contained' : 'outlined'}
            startIcon={<AssessmentIcon />}
            onClick={() => setShowReport(v => !v)}
            sx={{
              borderColor: showReport ? 'transparent' : '#065f46',
              color: showReport ? '#fff' : '#065f46',
              backgroundColor: showReport ? '#16a34a' : 'transparent',
              '&:hover': { backgroundColor: showReport ? '#15803d' : '#d1fae5', borderColor: '#065f46' },
              textTransform: 'none', fontWeight: 600, borderRadius: '8px',
              px: 2, height: 40, whiteSpace: 'nowrap',
            }}
          >
            {showReport ? 'Hide Report' : 'Generate Report'}
          </Button>
          {(search || freqFilter || statusFilter) && (
            <Button size="small" onClick={() => { setSearch(''); setFreqFilter(''); setStatusFilter(''); }}
              sx={{ color: '#666', textTransform: 'none' }}>
              Clear filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── Main content ── */}
      {!showReport ? (

        /* ── Retention Policies Table ── */
        <Paper sx={{ borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TH width={40}>#</TH>
                  <TH>Policy Name</TH>
                  <TH>Type</TH>
                  <TH>Frequency</TH>
                  <TH>Retention Days</TH>
                  <TH>Status</TH>
                  <TH>Created By</TH>
                  <TH>Created At</TH>
                  <TH width={90}>Actions</TH>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: BRAND }} />
                    </TableCell>
                  </TableRow>
                ) : pagedPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <PolicyIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                      <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>No retention policies found</Typography>
                    </TableCell>
                  </TableRow>
                ) : pagedPolicies.map((policy, idx) => (
                  <TableRow
                    key={policy.id} hover
                    onClick={() => setDrawerPolicy(policy)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {policy.policyName}
                    </TableCell>
                    <TableCell>
                      <TypeChip type={policy.type} customType={policy.customType} />
                    </TableCell>
                    <TableCell>
                      <FrequencyChip frequency={policy.frequency} customFrequency={policy.customFrequency} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                      {policy.retentionDays != null ? `${policy.retentionDays} days` : '—'}
                    </TableCell>
                    <TableCell><StatusChip isActive={policy.isActive} /></TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      {policy.createdByManagerName || (policy.createdByManagerId ? `Manager #${policy.createdByManagerId}` : '—')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      {fmtDateShort(policy.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={e => e.stopPropagation()}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={e => openEdit(policy, e)}
                            sx={{ color: BRAND, '&:hover': { backgroundColor: '#eef0fa' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteId(policy.id); }}
                            sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fee2e2' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={filtered.length}
            page={page}
            onPageChange={p => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={value => { setRowsPerPage(value); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

      ) : (

        /* ── Completed Backup Schedules Report ── */
        <>
          <Box sx={{
            mb: 2.5, p: 2, borderRadius: '12px',
            background: 'linear-gradient(135deg, #d1fae510 0%, #d1fae508 100%)',
            border: '1px solid #D1FAE5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '9px', backgroundColor: '#d1fae5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46', flexShrink: 0,
              }}>
                <BackupIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: BRAND, lineHeight: 1.2 }}>
                  Completed Backup Schedules
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#888', mt: 0.2 }}>
                  {completedSchedules.length} completed schedule{completedSchedules.length !== 1 ? 's' : ''} — linked to retention policies
                </Typography>
              </Box>
              {completedSchedules.length > 0 && (
                <Chip label={completedSchedules.length} size="small"
                  sx={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.72rem', height: 22 }} />
              )}
            </Box>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchCompletedSchedules}
                sx={{ border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {schedulesError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSchedulesError('')}>{schedulesError}</Alert>
          )}

          <Paper sx={{ borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TH width={40}>#</TH>
                    <TH>Schedule Name</TH>
                    <TH>Description</TH>
                    <TH>Status</TH>
                    <TH>Asset</TH>
                    <TH>Linked Policy</TH>
                    <TH>Policy Type</TH>
                    <TH>Frequency</TH>
                    <TH>Retention Days</TH>
                    <TH>Created At</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedulesLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} sx={{ color: BRAND }} />
                      </TableCell>
                    </TableRow>
                  ) : pagedSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                        <BackupIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                        <Typography sx={{ color: '#aaa', fontSize: '0.875rem' }}>No completed backup schedules found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : pagedSchedules.map((schedule, idx) => {
                    const linkedPolicy = getLinkedPolicy(schedule);
                    return (
                      <TableRow key={schedule.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {schedPage * schedRowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: BRAND, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {schedule.scheduleName}
                        </TableCell>
                        <TableCell sx={{ color: '#555', fontSize: '0.8rem', maxWidth: 180 }}>
                          <Tooltip title={schedule.description || ''}>
                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                              {schedule.description || '—'}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell><BackupStatusChip status={schedule.status} /></TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#374151' }}>
                          {schedule.assetId ? (
                            <Chip label={`#${schedule.assetId}`} size="small"
                              sx={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                          ) : (
                            <Typography sx={{ color: '#aaa', fontSize: '0.78rem', fontStyle: 'italic' }}>Generic</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: BRAND, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {linkedPolicy
                            ? linkedPolicy.policyName
                            : schedule.retentionPolicyId
                              ? <Typography sx={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>ID #{schedule.retentionPolicyId}</Typography>
                              : <Typography sx={{ color: '#aaa', fontSize: '0.78rem' }}>—</Typography>}
                        </TableCell>
                        <TableCell>
                          {linkedPolicy
                            ? <TypeChip type={linkedPolicy.type} customType={linkedPolicy.customType} />
                            : <Typography sx={{ color: '#aaa', fontSize: '0.78rem' }}>—</Typography>}
                        </TableCell>
                        <TableCell>
                          {linkedPolicy
                            ? <FrequencyChip frequency={linkedPolicy.frequency} customFrequency={linkedPolicy.customFrequency} />
                            : <Typography sx={{ color: '#aaa', fontSize: '0.78rem' }}>—</Typography>}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                          {linkedPolicy?.retentionDays != null ? `${linkedPolicy.retentionDays} days` : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#374151', whiteSpace: 'nowrap' }}>
                          {fmtDateShort(schedule.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <CustomPagination
              count={completedSchedules.length}
              page={schedPage}
              onPageChange={p => setSchedPage(p)}
              rowsPerPage={schedRowsPerPage}
              onRowsPerPageChange={value => { setSchedRowsPerPage(value); setSchedPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          Policy Detail Drawer
      ══════════════════════════════════════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={!!drawerPolicy}
        onClose={() => setDrawerPolicy(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.10)' } }}
      >
        {drawerPolicy && (
          <>
            <Box sx={{
              px: 3, py: 2.5,
              background: `linear-gradient(135deg, ${BRAND} 0%, #3D3890 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PolicyIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>Policy Details</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.2 }}>ID #{drawerPolicy.id}</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDrawerPolicy(null)} size="small"
                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: BRAND, lineHeight: 1.3 }}>
                  {drawerPolicy.policyName}
                </Typography>
                <Box sx={{ mt: 1 }}><StatusChip isActive={drawerPolicy.isActive} /></Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <DetailRow label="Description">
                <Typography sx={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
                  {drawerPolicy.description || '—'}
                </Typography>
              </DetailRow>
              <DetailRow label="Type">
                <TypeChip type={drawerPolicy.type} customType={drawerPolicy.customType} />
                {drawerPolicy.type === 'OTHER' && drawerPolicy.customType && (
                  <Typography sx={{ fontSize: '0.8rem', color: '#555', mt: 0.5 }}>
                    Custom: {drawerPolicy.customType}
                  </Typography>
                )}
              </DetailRow>
              <DetailRow label="Frequency">
                <FrequencyChip frequency={drawerPolicy.frequency} customFrequency={drawerPolicy.customFrequency} />
                {drawerPolicy.frequency === 'OTHER' && drawerPolicy.customFrequency && (
                  <Typography sx={{ fontSize: '0.8rem', color: '#555', mt: 0.5 }}>
                    Custom: {drawerPolicy.customFrequency}
                  </Typography>
                )}
              </DetailRow>
              <DetailRow label="Retention Days">
                {drawerPolicy.retentionDays != null ? (
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>
                    {drawerPolicy.retentionDays} days
                  </Typography>
                ) : (
                  <Typography sx={{ color: '#aaa', fontSize: '0.875rem' }}>—</Typography>
                )}
              </DetailRow>
              <DetailRow label="Created By">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <PersonIcon sx={{ fontSize: 16, color: '#888' }} />
                  <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>
                    {drawerPolicy.createdByManagerName ||
                      (drawerPolicy.createdByManagerId ? `Manager #${drawerPolicy.createdByManagerId}` : '—')}
                  </Typography>
                </Box>
              </DetailRow>
              <DetailRow label="Created At">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CalendarTodayIcon sx={{ fontSize: 15, color: '#888' }} />
                  <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>{fmtDateLong(drawerPolicy.createdAt)}</Typography>
                </Box>
              </DetailRow>
              <DetailRow label="Last Updated">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <UpdateIcon sx={{ fontSize: 15, color: '#888' }} />
                  <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>{fmtDateLong(drawerPolicy.updatedAt)}</Typography>
                </Box>
              </DetailRow>
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', gap: 1.5, backgroundColor: '#FAFAFA' }}>
              <Button
                variant="contained" startIcon={<EditIcon />}
                onClick={e => { setDrawerPolicy(null); openEdit(drawerPolicy, e); }}
                sx={{ flex: 1, backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Edit Policy
              </Button>
              <Button
                variant="outlined" startIcon={<DeleteIcon />}
                onClick={() => { setDrawerPolicy(null); setDeleteId(drawerPolicy.id); }}
                sx={{ borderColor: '#dc2626', color: '#dc2626', '&:hover': { backgroundColor: '#fee2e2', borderColor: '#dc2626' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Delete
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* ══════════════════════════════════════════════════════════════════
          Create / Edit Dialog  — FIXED
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'visible',  // allow label float above border without clipping
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* ── Gradient Header (replaces DialogTitle) ── */}
        <Box sx={{
          px: 3, py: 2.5,
          background: `linear-gradient(135deg, ${BRAND} 0%, #3D3890 100%)`,
          borderRadius: '16px 16px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/*  */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>
                {editTarget ? 'Edit Retention Policy' : 'New Retention Policy'}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', mt: 0.2 }}>
                {editTarget ? `Editing: ${editTarget.policyName}` : 'Fill in the details to create a new policy'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => !saving && setDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Body ── */}
        <DialogContent
          sx={{
            pt: 3,
            pb: 1,
            px: 3,
            // ensure labels are never clipped at top
            overflow: 'visible',
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        >
          <Grid container spacing={2.5}>

            {/* ─────────────────────────────────────────
                SECTION 1 — Basic Information
            ───────────────────────────────────────── */}
           

            {/* Policy Name — full width, label always visible */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Policy Name"
                required
                value={form.policyName}
                onChange={e => setForm(f => ({ ...f, policyName: e.target.value }))}
                error={!!formErrors.policyName}
                helperText={formErrors.policyName}
                placeholder="e.g. Monthly Asset Backup Policy"
                InputLabelProps={{ shrink: true }}   // ← keeps label above the field always
                sx={fieldSx(BRAND)}
              />
            </Grid>

            {/* Description — full width */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="Briefly describe the purpose of this policy…"
                multiline
                rows={3}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx(BRAND)}
              />
            </Grid>

            {/* ─────────────────────────────────────────
                SECTION 2 — Policy Configuration
            ───────────────────────────────────────── */}
           

            {/* Type select */}
            <Grid item xs={12} sm={form.type === 'OTHER' ? 6 : 12}>
              <FormControl fullWidth error={!!formErrors.type} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel shrink required>Type</InputLabel>
                <Select
                  value={form.type}
                  label="Type"
                  notched
                  displayEmpty
                  onChange={e => setForm(f => ({ ...f, type: e.target.value, customType: '' }))}
                  renderValue={val =>
                    val
                      ? <TypeChip type={val} customType={form.customType} />
                      : <Typography sx={{ color: '#aaa', fontSize: '0.875rem' }}>Select a type…</Typography>
                  }
                >
                  {RETENTION_TYPES.map(t => (
                    <MenuItem key={t} value={t} sx={t === 'OTHER' ? { color: ACCENT, fontStyle: 'italic' } : {}}>
                      {t === 'OTHER' ? 'Other (specify below)' : t.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type && (
                  <Typography sx={{ color: '#d32f2f', fontSize: '0.72rem', mt: 0.5, ml: 1.5 }}>{formErrors.type}</Typography>
                )}
              </FormControl>
            </Grid>

            {/* Custom Type — only shown when OTHER */}
            {form.type === 'OTHER' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specify Type"
                  required
                  placeholder="e.g. Cold Storage"
                  value={form.customType}
                  onChange={e => setForm(f => ({ ...f, customType: e.target.value }))}
                  error={!!formErrors.customType}
                  helperText={formErrors.customType}
                  InputLabelProps={{ shrink: true }}
                  autoFocus
                  sx={fieldSx(ACCENT)}
                />
              </Grid>
            )}

            {/* Frequency select */}
            <Grid item xs={12} sm={form.frequency === 'OTHER' ? 6 : 12}>
              <FormControl fullWidth error={!!formErrors.frequency} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel shrink required>Frequency</InputLabel>
                <Select
                  value={form.frequency}
                  label="Frequency"
                  notched
                  displayEmpty
                  onChange={e => setForm(f => ({
                    ...f,
                    frequency: e.target.value,
                    customFrequency: '',
                    retentionDays: e.target.value !== 'OTHER' ? '' : f.retentionDays,
                  }))}
                  renderValue={val =>
                    val
                      ? <FrequencyChip frequency={val} customFrequency={form.customFrequency} />
                      : <Typography sx={{ color: '#aaa', fontSize: '0.875rem' }}>Select a frequency…</Typography>
                  }
                >
                  {RETENTION_FREQUENCIES.map(freq => (
                    <MenuItem key={freq} value={freq} sx={freq === 'OTHER' ? { color: ACCENT, fontStyle: 'italic' } : {}}>
                      {freq === 'OTHER' ? 'Other (specify below)' : freq}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.frequency && (
                  <Typography sx={{ color: '#d32f2f', fontSize: '0.72rem', mt: 0.5, ml: 1.5 }}>{formErrors.frequency}</Typography>
                )}
              </FormControl>
            </Grid>

            {/* Custom Frequency + Retention Days — only shown when OTHER */}
            {form.frequency === 'OTHER' && (
              <>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Retention Days"
                    required
                    type="number"
                    placeholder="e.g. 90"
                    value={form.retentionDays}
                    onChange={e => setForm(f => ({ ...f, retentionDays: e.target.value }))}
                    error={!!formErrors.retentionDays}
                    helperText={formErrors.retentionDays || 'Minimum 1 day'}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 1 }}
                    sx={fieldSx(BRAND)}
                  />
                </Grid>
              </>
            )}

            {/* ─────────────────────────────────────────
                SECTION 3 — Status (edit only)
            ───────────────────────────────────────── */}
            {editTarget && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ mb: 1 }} />
                  <SectionLabel color="#16a34a">Status</SectionLabel>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.5,
                    border: `1px solid ${form.isActive ? '#86efac' : '#fca5a5'}`,
                    borderRadius: '8px',
                    backgroundColor: form.isActive ? '#f0fdf4' : '#fff5f5',
                    transition: 'all 0.2s',
                  }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: form.isActive ? '#166534' : '#991b1b' }}>
                        {form.isActive ? 'Policy is Active' : 'Policy is Inactive'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.2 }}>
                        {form.isActive
                          ? 'This policy is currently enforced across linked assets'
                          : 'This policy will not be applied until re-activated'}
                      </Typography>
                    </Box>
                    <Switch
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#16a34a' },
                      }}
                    />
                  </Box>
                </Grid>
              </>
            )}

          </Grid>
        </DialogContent>

        {/* ── Footer Actions ── */}
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5, borderTop: `1px solid ${BORDER}`, backgroundColor: '#FAFAFA', borderRadius: '0 0 16px 16px' }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={saving}
            variant="outlined"
            sx={{
              borderColor: BORDER, color: '#555', textTransform: 'none',
              borderRadius: '8px', fontWeight: 500, px: 3,
              '&:hover': { borderColor: '#bbb', backgroundColor: '#f5f5f5' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            sx={{
              backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' },
              textTransform: 'none', fontWeight: 600,
              borderRadius: '8px', minWidth: 120, px: 3,
            }}
          >
            {saving
              ? <CircularProgress size={18} sx={{ color: '#fff' }} />
              : editTarget ? 'Update Policy' : 'Create Policy'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Retention Policy"
        message="Are you sure you want to delete this retention policy? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
      />
    </Box>
  );
}
