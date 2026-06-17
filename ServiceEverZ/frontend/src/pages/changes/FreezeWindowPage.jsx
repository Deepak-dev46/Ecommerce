import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Tooltip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Divider,
} from '@mui/material';
import AddIcon     from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon  from '@mui/icons-material/Delete';
import AcUnitIcon  from '@mui/icons-material/AcUnit';
import { getAllFreezeWindows, createFreezeWindow, deleteFreezeWindow, getActiveFreezeWindows } from '../../api/changeApi';
import { useAuth } from '../../context/AuthContext';
import toast from '../../utils/toast';

const fmt    = (dt) => dt ? new Date(dt).toLocaleString() : '—';
const fmtShort = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

const isActive = (fw) => {
  const now = new Date();
  return new Date(fw.freezeStart) <= now && new Date(fw.freezeEnd) >= now;
};

const EMPTY_FORM = { reason: '', freezeStart: '', freezeEnd: '' };

export default function FreezeWindowPage() {
  const { user }       = useAuth();
  const [windows, setWindows]   = useState([]);
  const [active, setActive]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, activeRes] = await Promise.all([
        getAllFreezeWindows(),
        getActiveFreezeWindows(),
      ]);
      setWindows(allRes.data?.data ?? []);
      setActive(activeRes.data?.data ?? []);
    } catch {
      toast.error('Failed to load freeze windows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const validate = () => {
    const e = {};
    if (!form.reason.trim())    e.reason      = 'Reason is required';
    if (!form.freezeStart)      e.freezeStart = 'Freeze start is required';
    if (!form.freezeEnd)        e.freezeEnd   = 'Freeze end is required';
    if (form.freezeStart && form.freezeEnd && form.freezeEnd <= form.freezeStart)
      e.freezeEnd = 'End must be after start';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await createFreezeWindow({
        reason:             form.reason,
        freezeStart:        form.freezeStart + ':00',
        freezeEnd:          form.freezeEnd   + ':00',
        createdByManagerId: user?.id ?? 1,
      });
      toast.success('Freeze window created and all users notified');
      setOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create freeze window');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this freeze window?')) return;
    setDeleting(id);
    try {
      await deleteFreezeWindow(id);
      toast.success('Freeze window deleted');
      load();
    } catch {
      toast.error('Failed to delete freeze window');
    } finally {
      setDeleting(null);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px', backgroundColor: '#FAFAFA',
      '&:hover fieldset': { borderColor: '#27235C' },
      '&.Mui-focused fieldset': { borderColor: '#27235C', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#27235C' },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C' }}>
            Freeze Windows
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Define periods during which no change deployments are permitted
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small" sx={{ width: 44, height: 44 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
          >
            New Freeze Window
          </Button>
        </Stack>
      </Stack>

      {/* Active banner */}
      {active.length > 0 && (
        <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#DBEAFE', border: '1px solid #93C5FD' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AcUnitIcon sx={{ color: '#1E40AF' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E40AF' }}>
              {active.length} Active Freeze Window{active.length > 1 ? 's' : ''} — Change deployments are currently blocked
            </Typography>
          </Stack>
          {active.map((fw) => (
            <Typography key={fw.id} variant="caption" sx={{ display: 'block', color: '#1D4ED8', mt: 0.5, ml: 3.5 }}>
              • {fw.reason} ({fmt(fw.freezeStart)} → {fmt(fw.freezeEnd)})
            </Typography>
          ))}
        </Paper>
      )}

      Summary cards
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Windows', count: windows.length, color: '#EEF2FF', text: '#3730A3' },
          { label: 'Active Now',    count: active.length,  color: '#DBEAFE', text: '#1E40AF' },
          { label: 'Upcoming',      count: windows.filter(w => new Date(w.freezeStart) > new Date()).length, color: '#FEF3C7', text: '#92400E' },
        ].map(({ label, count, color, text }) => (
          <Paper key={label} elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 2, backgroundColor: color }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: text }}>{count}</Typography>
            <Typography variant="caption" sx={{ color: text, fontWeight: 600 }}>{label}</Typography>
          </Paper>
        ))}
      </Stack>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
      ) : windows.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AcUnitIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No freeze windows defined</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Freeze Start</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Freeze End</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Notified</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {windows.map((fw) => {
                const active_ = isActive(fw);
                const upcoming = new Date(fw.freezeStart) > new Date();
                return (
                  <TableRow key={fw.id} hover>
                    <TableCell>
                      <Chip
                        label={active_ ? 'Active' : upcoming ? 'Upcoming' : 'Expired'}
                        size="small"
                        sx={{
                          backgroundColor: active_ ? '#DBEAFE' : upcoming ? '#FEF3C7' : '#F3F4F6',
                          color: active_ ? '#1E40AF' : upcoming ? '#92400E' : '#6B7280',
                          fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fw.reason}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption">{fmt(fw.freezeStart)}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{fmt(fw.freezeEnd)}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{fw.createdByManagerName ?? `#${fw.createdByManagerId}`}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={fw.notificationSent ? 'Sent' : 'Pending'}
                        size="small"
                        sx={{ backgroundColor: fw.notificationSent ? '#D1FAE5' : '#FEE2E2', color: fw.notificationSent ? '#065F46' : '#991B1B', fontSize: '0.65rem', fontWeight: 600, borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell><Typography variant="caption">{fmtShort(fw.createdAt)}</Typography></TableCell>
                    <TableCell>
                      <Tooltip title="Delete freeze window">
                        <IconButton
                          size="small" color="error"
                          disabled={deleting === fw.id}
                          onClick={() => handleDelete(fw.id)}
                        >
                          {deleting === fw.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setForm(EMPTY_FORM); setErrors({}); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#27235C' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AcUnitIcon sx={{ color: '#27235C' }} />
            <span>New Freeze Window</span>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth size="small" label="Reason" required multiline rows={3}
              value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
              error={!!errors.reason} helperText={errors.reason}
              sx={fieldSx}
            />
            <TextField
              fullWidth size="small" label="Freeze Start" required type="datetime-local"
              value={form.freezeStart} onChange={(e) => setForm(f => ({ ...f, freezeStart: e.target.value }))}
              error={!!errors.freezeStart} helperText={errors.freezeStart}
              InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
            <TextField
              fullWidth size="small" label="Freeze End" required type="datetime-local"
              value={form.freezeEnd} onChange={(e) => setForm(f => ({ ...f, freezeEnd: e.target.value }))}
              error={!!errors.freezeEnd} helperText={errors.freezeEnd}
              InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
            <Paper elevation={0} sx={{ p: 1.5, backgroundColor: '#FEF3C7', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#92400E' }}>
                ⚠ Creating a freeze window will automatically notify all users via email.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpen(false); setForm(EMPTY_FORM); setErrors({}); }} sx={{ color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            variant="contained" onClick={handleCreate} disabled={saving}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Create Freeze Window'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
