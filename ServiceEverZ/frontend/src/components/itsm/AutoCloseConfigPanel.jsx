// src/components/itsm/AutoCloseConfigPanel.jsx
// Auto-Close configuration panel for ITSM Manager.
// Shown as a new tab inside SlaManagementPage — does NOT touch any other tab.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, CircularProgress, Divider,
  IconButton, Tooltip, Skeleton, Switch, FormControlLabel,
} from '@mui/material';
import {
  Timer, Add, Edit, Delete, Close, Info, CheckCircle,
  Warning, AccessTime, LockClock, Autorenew,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { autoCloseApi, fmtAutoCloseHours, AUTO_CLOSE_STATUS_META } from '../../api/autoCloseApi';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDT = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
};

const AutoCloseStatusChip = ({ status }) => {
  const m = AUTO_CLOSE_STATUS_META[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <Chip
      label={m.label}
      size="small"
      sx={{
        bgcolor: m.bg, color: m.color, fontWeight: 700,
        fontSize: '0.68rem', height: 22,
        border: `1px solid ${m.color}30`,
      }}
    />
  );
};

// ── Config Form Modal ─────────────────────────────────────────────────────────
const ConfigFormModal = ({ open, config, slaPolicies, onClose, onSaved }) => {
  const [form, setForm] = useState({ slaId: '', autoCloseHours: 72, enabled: true });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  let {user} = useAuth();
  useEffect(() => {
    if (config) {
      setForm({
        slaId:          config.slaId ?? '',
        autoCloseHours: config.autoCloseHours,
        enabled:        config.enabled,
      });
    } else {
      setForm({ slaId: '', autoCloseHours: 72, enabled: true });
    }
    setError('');
    
  }, [config, open]);

  const handleSave = async () => {
    if (!form.autoCloseHours || form.autoCloseHours < 1) {
      setError('Auto-close hours must be at least 1.');
      return;
    }
    setSaving(true); setError('');
    try {
      console.log(form);      
      await autoCloseApi.upsertConfig({
        slaId:          form.slaId === '' ? null : Number(form.slaId),
        autoCloseHours: Number(form.autoCloseHours),
        enabled:        form.enabled,
      },user.userId);
      onSaved(); onClose();
    } catch (err) {
      console.log(err);
      
      setError(err.response?.data?.message || 'Failed to save config.');
    } finally { setSaving(false); }
  };

  const isGlobal = form.slaId === '' || form.slaId == null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg,#27235C,#97247E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LockClock sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography fontWeight={700}>
            {config ? 'Edit Auto-Close Config' : 'New Auto-Close Config'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              select fullWidth label="Applies To"
              value={form.slaId === '' ? '__global__' : String(form.slaId)}
              onChange={(e) => setForm((f) => ({
                ...f,
                slaId: e.target.value === '__global__' ? '' : e.target.value,
              }))}
              disabled={!!config}
              helperText={config ? 'Cannot change scope once created' : ''}
            >
              <MenuItem value="__global__">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#27235C' }} />
                  Global Default (all tickets)
                </Box>
              </MenuItem>
              {(slaPolicies || []).map((p) => (
                <MenuItem key={p.priorityId ?? p.id} value={String(p.priorityId ?? p.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#97247E' }} />
                    SLA: {p.priority} (ID {p.priorityId ?? p.id})
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Auto-Close After (hours since resolved)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <TextField
                type="number" size="small" label="Hours" sx={{ width: 100 }}
                value={form.autoCloseHours}
                onChange={(e) => setForm((f) => ({ ...f, autoCloseHours: Math.max(1, parseInt(e.target.value) || 1) }))}
                inputProps={{ min: 1 }}
              />
              <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
                = {fmtAutoCloseHours(form.autoCloseHours)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.5 }}>
              How long after a ticket is resolved before it auto-closes
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                  size="small"
                  sx={{ '& .MuiSwitch-thumb': { bgcolor: form.enabled ? '#27235C' : '#9CA3AF' } }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: form.enabled ? '#27235C' : '#9CA3AF' }}>
                  {form.enabled ? 'Enabled' : 'Disabled'}
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={18} color="inherit" /> : (config ? 'Save Changes' : 'Create Config')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Auto-Close State Widget (per-ticket) ──────────────────────────────────────
export const TicketAutoCloseState = ({ ticketId }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    autoCloseApi.getTicketState(ticketId)
      .then((r) => setState(r.data?.data || r.data))
      .catch(() => setState(null))
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) return <Skeleton width={160} height={28} />;
  if (!state) return null;

  const isActive = state.status === 'PENDING' && state.scheduledCloseAt;
  const isClosed = state.status === 'CLOSED';
  const diffMs   = isActive ? new Date(state.scheduledCloseAt) - Date.now() : 0;
  const hoursLeft = Math.max(0, Math.round(diffMs / 3600000));

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 1.5, borderRadius: 2,
      border: `1px solid ${isActive ? '#DBEAFE' : isClosed ? '#DCFCE7' : '#F3F4F6'}`,
      bgcolor: isActive ? '#EFF6FF' : isClosed ? '#F0FDF4' : '#F9FAFB',
    }}>
      {isActive ? (
        <AccessTime sx={{ fontSize: 18, color: '#1D4ED8' }} />
      ) : isClosed ? (
        <CheckCircle sx={{ fontSize: 18, color: '#15803D' }} />
      ) : (
        <LockClock sx={{ fontSize: 18, color: '#9CA3AF' }} />
      )}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <AutoCloseStatusChip status={state.status} />
          {state.reopenCount > 0 && (
            <Chip
              label={`Reopened ×${state.reopenCount}`}
              size="small"
              sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#FEF3E2', color: '#F97316', fontWeight: 700 }}
            />
          )}
        </Box>
        {isActive && (
          <Typography sx={{ fontSize: '0.72rem', color: '#1D4ED8' }}>
            Closes: {fmtDT(state.scheduledCloseAt)}
            {hoursLeft > 0 && ` (${hoursLeft}h remaining)`}
          </Typography>
        )}
        {isClosed && (
          <Typography sx={{ fontSize: '0.72rem', color: '#15803D' }}>
            Auto-closed at {fmtDT(state.autoClosedAt)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ── Main Panel ────────────────────────────────────────────────────────────────
const AutoCloseConfigPanel = ({ slaPolicies = [] }) => {
  const [configs, setConfigs]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editConfig, setEditConfig] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await autoCloseApi.getAllConfigs();
      setConfigs(res.data?.data || res.data || []);
    } catch {
      setError('Failed to load auto-close configs.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await autoCloseApi.deleteConfig(deleteTarget.id); await load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to delete config.'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const globalConfig = configs.find((c) => c.slaId == null);
  const slaConfigs   = configs.filter((c) => c.slaId != null);

  return (
    <Box>
      {/* ── Header strip ──────────────────────────────────────────────────── */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0F5' }}>
        <Box>
          <Typography fontWeight={700} fontSize="0.9rem">Auto-Close Configuration</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
            Automatically close resolved tickets after a configurable delay
          </Typography>
        </Box>
        <Button size="small" variant="contained" startIcon={<Add />}
          onClick={() => { setEditConfig(null); setFormOpen(true); }}>
          Add Config
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* ── How it works info box ─────────────────────────────────────────── */}
      <Box sx={{ m: 2.5, p: 2, borderRadius: 2, bgcolor: '#F0F4FF', border: '1px solid #C7D7FD', display: 'flex', gap: 1.5 }}>
        <Info sx={{ fontSize: 18, color: '#27235C', flexShrink: 0, mt: 0.1 }} />
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#27235C', mb: 0.3 }}>
            How Auto-Close Works
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#374151', lineHeight: 1.7 }}>
            When a support agent marks a ticket as <strong>Resolved</strong>, the auto-close
            countdown starts. If the user does not reopen the ticket within the configured
            window, it is automatically <strong>Closed</strong>. Reopening a ticket immediately
            cancels the timer — and restarts it when resolved again. SLA-specific configs
            override the global default.
          </Typography>
        </Box>
      </Box>

      {/* ── Global Config ─────────────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
          Global Default
        </Typography>

        {loading ? (
          <Skeleton height={72} sx={{ borderRadius: 2 }} />
        ) : globalConfig ? (
          <ConfigRow
            config={globalConfig}
            label="All Tickets"
            accent="#27235C"
            onEdit={() => { setEditConfig(globalConfig); setFormOpen(true); }}
            onDelete={() => setDeleteTarget(globalConfig)}
          />
        ) : (
          <Box sx={{ p: 2.5, borderRadius: 2, border: '2px dashed #E5E7EB', textAlign: 'center' }}>
            <Timer sx={{ fontSize: 32, color: '#D1D5DB', mb: 1 }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', mb: 1.5 }}>
              No global config set. All tickets will use backend defaults until configured.
            </Typography>
            <Button size="small" variant="outlined" startIcon={<Add />}
              onClick={() => { setEditConfig(null); setFormOpen(true); }}>
              Set Global Default
            </Button>
          </Box>
        )}
      </Box>

      {/* ── SLA-specific overrides ────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
          SLA-Specific Overrides
          <Typography component="span" sx={{ ml: 1, fontSize: '0.72rem', fontWeight: 400, color: '#9CA3AF', textTransform: 'none' }}>
            (override global for specific SLA policies)
          </Typography>
        </Typography>

        {loading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} height={72} sx={{ borderRadius: 2, mb: 1 }} />)
        ) : slaConfigs.length === 0 ? (
          <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic', py: 1 }}>
            No SLA-specific overrides configured.
          </Typography>
        ) : (
          <AnimatePresence>
            {slaConfigs.map((cfg) => (
              <motion.div key={cfg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ConfigRow
                  config={cfg}
                  label={`SLA Policy ID: ${cfg.slaId}`}
                  accent="#97247E"
                  onEdit={() => { setEditConfig(cfg); setFormOpen(true); }}
                  onDelete={() => setDeleteTarget(cfg)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Box>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <ConfigFormModal
        open={formOpen}
        config={editConfig}
        slaPolicies={slaPolicies}
        onClose={() => { setFormOpen(false); setEditConfig(null); }}
        onSaved={load}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Warning sx={{ fontSize: 18, color: '#E01950' }} />
          </Box>
          Delete Auto-Close Config
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Remove the {deleteTarget?.slaId ? `SLA ${deleteTarget.slaId}` : 'global'} auto-close
            config? Tickets currently counting down will continue until the next scheduler cycle.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Config Row ────────────────────────────────────────────────────────────────
const ConfigRow = ({ config, label, accent, onEdit, onDelete }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 2.5,
    p: 2, mb: 1.5, borderRadius: 2,
    border: '1px solid #E5E7EB',
    bgcolor: '#FAFAFA',
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)', bgcolor: '#fff' },
  }}>
    <Box sx={{ width: 4, height: 44, borderRadius: 2, bgcolor: accent, flexShrink: 0 }} />

    <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, alignItems: 'center' }}>
      {/* Scope */}
      <Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.3 }}>Scope</Typography>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B193F' }}>{label}</Typography>
      </Box>
      {/* Delay */}
      <Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.3 }}>Auto-Close After</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Autorenew sx={{ fontSize: 14, color: accent }} />
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B193F' }}>
            {fmtAutoCloseHours(config.autoCloseHours)}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{config.autoCloseHours}h</Typography>
      </Box>
      {/* Status */}
      <Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.3 }}>Status</Typography>
        <Chip
          label={config.enabled ? 'Enabled' : 'Disabled'}
          size="small"
          sx={{
            height: 20, fontSize: '0.68rem', fontWeight: 700,
            bgcolor: config.enabled ? '#DCFCE7' : '#F3F4F6',
            color: config.enabled ? '#15803D' : '#6B7280',
          }}
        />
      </Box>
      {/* Updated */}
      <Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.3 }}>Updated</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{fmtDT(config.updatedAt)}</Typography>
      </Box>
    </Box>

    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
      <Tooltip title="Edit">
        <IconButton size="small" sx={{ color: '#27235C' }} onClick={onEdit}>
          <Edit sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" sx={{ color: '#E01950' }} onClick={onDelete}>
          <Delete sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

export default AutoCloseConfigPanel;
