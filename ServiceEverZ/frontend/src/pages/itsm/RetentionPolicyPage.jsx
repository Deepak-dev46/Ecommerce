import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress,
  Card, Grid, Chip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Switch, FormControlLabel,
} from '@mui/material';
import SearchIcon         from '@mui/icons-material/Search';
import AddIcon            from '@mui/icons-material/Add';
import EditIcon           from '@mui/icons-material/Edit';
import DeleteIcon         from '@mui/icons-material/Delete';
import PolicyIcon         from '@mui/icons-material/Policy';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import CancelIcon         from '@mui/icons-material/Cancel';
import RefreshIcon        from '@mui/icons-material/Refresh';
import {
  getAllRetentionPolicies,
  createRetentionPolicy,
  updateRetentionPolicy,
  deleteRetentionPolicy,
} from '../../api/dataManagementApi';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from '../../utils/toast';
import CustomPagination from '../../components/common/CustomPagination';

const BRAND  = '#27235C';
const ACCENT = '#97247E';
const BORDER = '#E8E8F0';

const RETENTION_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

const fmtDate = (dt) => dt ? new Date(dt).toLocaleString() : '—';
const fmtDateShort = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

function FrequencyChip({ frequency }) {
  const map = {
    DAILY:     { color: '#0369a1', bg: '#e0f2fe' },
    WEEKLY:    { color: '#065f46', bg: '#d1fae5' },
    MONTHLY:   { color: '#7c3aed', bg: '#ede9fe' },
    QUARTERLY: { color: '#92400e', bg: '#fef3c7' },
    YEARLY:    { color: '#9f1239', bg: '#ffe4e6' },
  };
  const s = map[frequency] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={frequency} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function StatusChip({ isActive }) {
  return (
    <Chip
      icon={isActive ? <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} /> : <CancelIcon sx={{ fontSize: '0.85rem !important' }} />}
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

function StatCard({ icon, label, value, color, bg }) {
  return (
    <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${color}`, borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{value ?? '—'}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.3 }}>{label}</Typography>
      </Box>
    </Card>
  );
}

const EMPTY_FORM = { policyName: '', description: '', frequency: '', retentionDays: '', isActive: true };

export default function RetentionPolicyPage() {
  const { user } = useAuth();
  const [policies, setPolicies]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [freqFilter, setFreqFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);

  // Dialog state
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null); // null = create
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formErrors, setFormErrors]     = useState({});

  // Delete confirm
  const [deleteId, setDeleteId]         = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchPolicies = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getAllRetentionPolicies();
      setPolicies(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load retention policies');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  useEffect(() => {
    let list = [...policies];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.policyName?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (freqFilter) list = list.filter(p => p.frequency === freqFilter);
    if (statusFilter !== '') list = list.filter(p => String(p.isActive) === statusFilter);
    setFiltered(list);
    setPage(0);
  }, [policies, search, freqFilter, statusFilter]);

  const stats = {
    total:    policies.length,
    active:   policies.filter(p => p.isActive).length,
    inactive: policies.filter(p => !p.isActive).length,
    daily:    policies.filter(p => p.frequency === 'DAILY').length,
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (policy) => {
    setEditTarget(policy);
    setForm({
      policyName:   policy.policyName || '',
      description:  policy.description || '',
      frequency:    policy.frequency || '',
      retentionDays: String(policy.retentionDays || ''),
      isActive:     policy.isActive ?? true,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.policyName.trim()) errs.policyName = 'Policy name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.frequency) errs.frequency = 'Frequency is required';
    if (!form.retentionDays || isNaN(form.retentionDays) || Number(form.retentionDays) < 1)
      errs.retentionDays = 'Retention days must be at least 1';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const payload = {
          policyName:    form.policyName.trim(),
          description:   form.description.trim(),
          frequency:     form.frequency,
          retentionDays: Number(form.retentionDays),
          isActive:      form.isActive,
        };
        await updateRetentionPolicy(editTarget.id, payload);
        toast.success('Retention policy updated');
      } else {
        const payload = {
          policyName:          form.policyName.trim(),
          description:         form.description.trim(),
          frequency:           form.frequency,
          retentionDays:       Number(form.retentionDays),
          createdByManagerId:  user?.id || 1,
        };
        await createRetentionPolicy(payload);
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
      fetchPolicies();
      toast.success('Retention policy deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
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
      <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search by name or description…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#999' }} /></InputAdornment> }}
            sx={{ minWidth: 280 }} />
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
          {(search || freqFilter || statusFilter) && (
            <Button size="small" onClick={() => { setSearch(''); setFreqFilter(''); setStatusFilter(''); }}
              sx={{ color: '#666', textTransform: 'none' }}>
              Clear filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F8FC' }}>
                {['Policy Name', 'Description', 'Frequency', 'Retention Days', 'Status', 'Created By (Manager)', 'Created At', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: BRAND }} /></TableCell></TableRow>
              ) : paged.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <PolicyIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                  <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>No retention policies found</Typography>
                </TableCell></TableRow>
              ) : paged.map(policy => (
                <TableRow key={policy.id} hover sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 600, color: BRAND, fontSize: '0.875rem' }}>{policy.policyName}</TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem', maxWidth: 200 }}>
                    <Tooltip title={policy.description}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {policy.description}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell><FrequencyChip frequency={policy.frequency} /></TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>{policy.retentionDays} days</TableCell>
                  <TableCell><StatusChip isActive={policy.isActive} /></TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem' }}>{policy.createdByManagerName || policy.createdByManagerId || '—'}</TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtDateShort(policy.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(policy)}
                          sx={{ color: BRAND, '&:hover': { backgroundColor: '#eef0fa' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(policy.id)}
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
          onRowsPerPageChange={value => { setRowsPerPage(value); setPage(0);}}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '14px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: BRAND, borderBottom: `1px solid ${BORDER}`, pb: 2 }}>
          {editTarget ? 'Edit Retention Policy' : 'New Retention Policy'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Policy Name *" value={form.policyName}
                onChange={e => setForm(f => ({ ...f, policyName: e.target.value }))}
                error={!!formErrors.policyName} helperText={formErrors.policyName} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Description *" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                error={!!formErrors.description} helperText={formErrors.description}
                multiline rows={3} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" error={!!formErrors.frequency}>
                <InputLabel>Frequency *</InputLabel>
                <Select value={form.frequency} label="Frequency *"
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {RETENTION_FREQUENCIES.map(freq => <MenuItem key={freq} value={freq}>{freq}</MenuItem>)}
                </Select>
                {formErrors.frequency && <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>{formErrors.frequency}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Retention Days *" type="number"
                value={form.retentionDays}
                onChange={e => setForm(f => ({ ...f, retentionDays: e.target.value }))}
                error={!!formErrors.retentionDays} helperText={formErrors.retentionDays}
                inputProps={{ min: 1 }} />
            </Grid>
            {editTarget && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#16a34a' } }} />}
                  label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Active Policy</Typography>}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}
            sx={{ borderColor: BORDER, color: '#555', textTransform: 'none' }} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, textTransform: 'none', fontWeight: 600, minWidth: 100 }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editTarget ? 'Update' : 'Create'}
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
