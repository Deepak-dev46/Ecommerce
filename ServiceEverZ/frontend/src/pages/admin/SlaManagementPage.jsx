// src/pages/admin/SlaManagementPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Divider, Alert, CircularProgress, LinearProgress, Skeleton, Tooltip,
  IconButton, TextField, MenuItem, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Speed, Warning, CheckCircle, Edit, Delete, Add, Refresh,
  Close, Timer, AccessTime, TrendingDown, HourglassEmpty,
  DoneAll, PeopleAlt, EscalatorWarning, Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  slaApi, PRIORITY_META, SLA_STATUS_META,
  ESCALATION_LEVEL_META, DEFAULT_SLA,
  fmtHours, fmtMins, fmtDT,
} from '../../api/slaApi';
import PageHeader from '../../components/common/PageHeader';
import AutoCloseConfigPanel from '../../components/itsm/AutoCloseConfigPanel';
 
// ── Chips ─────────────────────────────────────────────────────────────────────
const PriorityChip = ({ priority }) => {
  const m = PRIORITY_META[priority] || { label: priority, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <Chip label={m.label} size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: '0.68rem', height: 22, border: `1px solid ${m.color}30` }} />
  );
};
 
const SlaStatusChip = ({ status }) => {
  const m = SLA_STATUS_META[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <Chip label={m.label} size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: '0.68rem', height: 22, border: `1px solid ${m.color}30` }} />
  );
};
 
const EscalationChip = ({ level }) => {
  if (!level || level === 0) return null;
  const m = ESCALATION_LEVEL_META[level] || { label: `L${level}`, color: '#E01950', bg: '#FEE2E2' };
  return (
    <Chip label={m.label} size="small"
      icon={<EscalatorWarning sx={{ fontSize: '14px !important', color: `${m.color} !important` }} />}
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: '0.65rem', height: 22, border: `1px solid ${m.color}30` }} />
  );
};
 
// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, icon: Icon, color, bg, loading }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', transition: 'transform 0.18s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color }} />
      <CardContent sx={{ p: 2.5, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
              {title}
            </Typography>
            {loading
              ? <Skeleton width={60} height={40} />
              : <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: '#1B193F', lineHeight: 1 }}>{value}</Typography>}
            {subtitle && !loading && (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.5 }}>{subtitle}</Typography>
            )}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);
 
// ── Policy Form Modal ─────────────────────────────────────────────────────────
// CHANGE: CRITICAL removed from priority dropdown
const PolicyFormModal = ({ open, policy, onClose, onSaved }) => {
  const [form, setForm]     = useState({ priority: 'HIGH', responseTimeHours: 2, resolutionTimeHours: 8, breachTimeHours: 4, active: true, description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
 
  useEffect(() => {
    if (policy) {
      setForm({
        priority:            policy.priority,
        responseTimeHours:   policy.responseTimeHours,
        resolutionTimeHours: policy.resolutionTimeHours,
        breachTimeHours:     policy.breachTimeHours,
        active:              policy.active,
        description:         policy.description || '',
      });
    } else {
      setForm({ priority: 'HIGH', ...DEFAULT_SLA.HIGH, active: true, description: '' });
    }
    setError('');
  }, [policy, open]);
 
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const numField = (k, v) => setField(k, Math.max(0, parseFloat(v) || 0));
 
  const handleSave = async () => {
    if (form.responseTimeHours <= 0)                         { setError('Response time must be > 0.'); return; }
    if (form.resolutionTimeHours <= form.responseTimeHours)  { setError('Resolution time must be greater than response time.'); return; }
    if (form.breachTimeHours < 0)                            { setError('Breach time cannot be negative.'); return; }
    setSaving(true); setError('');
    try {
      await slaApi.savePolicy({ ...form });
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save policy.');
    } finally { setSaving(false); }
  };
 
  const TimeInput = ({ label, fieldKey, hint }) => (
    <Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField type="number" size="small" label="Hours" sx={{ width: 100 }}
          value={Math.floor(form[fieldKey])}
          onChange={(e) => { const h = Math.max(0, parseInt(e.target.value) || 0); numField(fieldKey, h + (form[fieldKey] % 1)); }}
          inputProps={{ min: 0 }} />
        <TextField type="number" size="small" label="Mins" sx={{ width: 80 }}
          value={Math.round((form[fieldKey] % 1) * 60)}
          onChange={(e) => { const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0)); numField(fieldKey, Math.floor(form[fieldKey]) + m / 60); }}
          inputProps={{ min: 0, max: 59 }} />
        <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', minWidth: 50 }}>= {fmtHours(form[fieldKey])}</Typography>
      </Box>
      {hint && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.5 }}>{hint}</Typography>}
    </Box>
  );
 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#27235C,#97247E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Speed sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography fontWeight={700}>{policy ? 'Edit SLA Policy' : 'New SLA Policy'}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Grid container spacing={2.5}>
          <Grid item xs={6}>
            {/* CHANGE: only HIGH / MEDIUM / LOW — no CRITICAL */}
            <TextField select fullWidth label="Priority" value={form.priority}
              onChange={(e) => {
                const def = DEFAULT_SLA[e.target.value] || {};
                setForm((f) => ({ ...f, priority: e.target.value, ...(!policy ? def : {}) }));
              }}
              disabled={!!policy}
              helperText={policy ? 'Cannot change priority' : 'One policy per priority'}>
              {['HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <MenuItem key={p} value={p}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PRIORITY_META[p]?.color }} />
                    {PRIORITY_META[p]?.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField select fullWidth label="Status" value={String(form.active)}
              onChange={(e) => setField('active', e.target.value === 'true')}>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Grid>
 
          <Grid item xs={12}>
            <Divider>
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Time Windows
              </Typography>
            </Divider>
          </Grid>
 
          <Grid item xs={12}><TimeInput label="Response Time (First Reply SLA)" fieldKey="responseTimeHours" hint="How long until an agent must first respond" /></Grid>
          <Grid item xs={12}><TimeInput label="Resolution Time (Full Fix SLA)" fieldKey="resolutionTimeHours" hint="How long until the ticket must be fully resolved" /></Grid>
          <Grid item xs={12}><TimeInput label="Breach Grace Time" fieldKey="breachTimeHours" hint="Extra time after resolution deadline before escalation email is triggered" /></Grid>
 
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Description (optional)" value={form.description}
              onChange={(e) => setField('description', e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={18} color="inherit" /> : (policy ? 'Save Changes' : 'Create Policy')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ── Escalation Config Modal ───────────────────────────────────────────────────
// CHANGE: CRITICAL removed from priority dropdown
const EscalationModal = ({ open, escalation, onClose, onSaved }) => {
  const [form, setForm]     = useState({ priority: 'HIGH', escalationLevel: 1, userId: '', userName: '', userEmail: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
 
  useEffect(() => {
    if (escalation) {
      setForm({
        priority:       escalation.priority,
        escalationLevel:escalation.escalationLevel,
        userId:         escalation.userId,
        userName:       escalation.userName,
        userEmail:      escalation.userEmail || '',
        role:           escalation.role || '',
      });
    } else {
      setForm({ priority: 'HIGH', escalationLevel: 1, userId: '', userName: '', userEmail: '', role: '' });
    }
    setError('');
  }, [escalation, open]);
 
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
 
  const handleSave = async () => {
    if (!form.userId || !form.userName) { setError('User ID and name are required.'); return; }
    if (!form.userEmail)                { setError('Email is required — it is used to send breach notifications.'); return; }
    setSaving(true); setError('');
    try {
      await slaApi.saveEscalation({ ...form, userId: Number(form.userId) });
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save escalation.');
    } finally { setSaving(false); }
  };
 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#E2B93B,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EscalatorWarning sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography fontWeight={700}>{escalation ? 'Edit Escalation' : 'Add Escalation Level'}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
 
        {/* Email required notice */}
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.78rem' }}>
          When a ticket breaches SLA, a notification email is automatically sent to the contact's email address.
        </Alert>
 
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {/* CHANGE: only HIGH / MEDIUM / LOW */}
            <TextField select fullWidth label="Priority" value={form.priority}
              onChange={(e) => setField('priority', e.target.value)} disabled={!!escalation}>
              {['HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <MenuItem key={p} value={p}>{PRIORITY_META[p]?.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField select fullWidth label="Level" value={form.escalationLevel}
              onChange={(e) => setField('escalationLevel', Number(e.target.value))} disabled={!!escalation}>
              <MenuItem value={1}>L1 — First Escalation</MenuItem>
              <MenuItem value={2}>L2 — Second Escalation</MenuItem>
              <MenuItem value={3}>L3 — Executive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="User ID *" type="number" value={form.userId}
              onChange={(e) => setField('userId', e.target.value)} size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Name *" value={form.userName}
              onChange={(e) => setField('userName', e.target.value)} size="small" />
          </Grid>
          <Grid item xs={12}>
            {/* Email now required — marked with * */}
            <TextField fullWidth label="Email * (required for breach notification)" value={form.userEmail}
              onChange={(e) => setField('userEmail', e.target.value)} size="small"
              helperText="SLA breach emails will be sent to this address" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Role / Title" value={form.role}
              onChange={(e) => setField('role', e.target.value)} size="small"
              placeholder="e.g. IT Manager, CTO" />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 // ─── Main Page ─────────────────────────────────────────────────────────────────
const SlaManagementPage = () => {
  // CHANGE: tab 0=Policies, 1=Breach Analysis, 2=Escalations, 3=Auto-Close
  // "Tickets" tab removed entirely
  const [tab, setTab]               = useState(0);
  const [policies, setPolicies]     = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [dashboard, setDash]        = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [policyModal, setPolicyModal]       = useState(false);
  const [editPolicy, setEditPolicy]         = useState(null);
  const [escalationModal, setEscalationModal] = useState(false);
  const [editEscalation, setEditEscalation] = useState(null);
  const [refreshing, setRefreshing]         = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleteEscTarget, setDeleteEscTarget] = useState(null);
 
  // CHANGE: removed getAllEvaluations() from load — no ticket tracking tab
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pRes, dRes, escRes] = await Promise.all([
        slaApi.getAllPolicies(),
        slaApi.getDashboard(),
        slaApi.getAllEscalations(),
      ]);
      setPolicies(pRes.data || []);
      setDash(dRes.data || null);
      setEscalations(escRes.data || []);
    } catch {
      setError('Failed to load SLA data.');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { load(); }, []);
 
  const handleForceRefresh = async () => {
    setRefreshing(true);
    try { await slaApi.forceRefresh(); await load(); } catch {}
    setRefreshing(false);
  };
 
  // Missing priorities check — only HIGH/MEDIUM/LOW
  const configuredPriorities = new Set(policies.map((p) => p.priority));
  const missingPriorities    = ['HIGH', 'MEDIUM', 'LOW'].filter((p) => !configuredPriorities.has(p));
 
  return (
    <Box py={3} px={3}>
      <PageHeader
        title="SLA Management"
        subtitle="Configure SLA policies, breach escalations, and auto-close rules"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'SLA Management' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small"
              startIcon={refreshing ? <CircularProgress size={13} /> : <Refresh />}
              onClick={handleForceRefresh} disabled={refreshing}
              sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
              Refresh
            </Button>
            {/* CHANGE: "Register Ticket" button removed */}
            <Button variant="outlined" size="small" startIcon={<EscalatorWarning />}
              onClick={() => { setEditEscalation(null); setEscalationModal(true); }}>
              Add Escalation
            </Button>
            <Button variant="outlined" size="small" startIcon={<Add />}
              onClick={() => { setEditPolicy(null); setPolicyModal(true); }}>
              Add Policy
            </Button>
          </Box>
        }
      />
 
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
 
      {/* Missing policy warning — only 3 priorities now */}
      {!loading && missingPriorities.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            No SLA policy for: {missingPriorities.join(', ')}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem' }}>
            Tickets with these priorities won't be tracked until policies are created.
          </Typography>
        </Alert>
      )}
 
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Total Tracked',   value: dashboard?.totalEvaluations ?? '—', icon: HourglassEmpty, color: '#27235C', bg: '#EEF0FF', subtitle: 'Tickets under SLA' },
          { title: 'On Track',        value: dashboard?.onTrackCount     ?? '—', icon: CheckCircle,    color: '#24A148', bg: '#DCFCE7', subtitle: 'Within all deadlines' },
          { title: 'At Risk',         value: dashboard?.atRiskCount      ?? '—', icon: Warning,        color: '#E2B93B', bg: '#FEF9C3', subtitle: '>80% time consumed' },
          { title: 'Breached',        value: dashboard?.breachedCount    ?? '—', icon: TrendingDown,   color: '#E01950', bg: '#FEE2E2', subtitle: 'Deadline exceeded' },
          { title: 'Compliance',      value: dashboard ? `${dashboard.complianceRate}%` : '—', icon: DoneAll, color: '#97247E', bg: '#FDF4FB', subtitle: 'Resolved on time' },
        ].map((card) => (
          <Grid item xs={12} sm={6} lg key={card.title}>
            <KpiCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>
 
      {/* ── Tabs — 4 tabs only: Policies · Breach Analysis · Escalations · Auto-Close */}
      <Card>
        <Box sx={{ borderBottom: '1px solid #E5E7EB' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{
              px: 2,
              '& .MuiTab-root': { fontSize: '0.82rem', fontWeight: 600, textTransform: 'none', minHeight: 50 },
              '& .MuiTabs-indicator': { bgcolor: '#97247E' },
              '& .Mui-selected': { color: '#27235C !important' },
            }}>
            <Tab label={`Policies (${policies.length})`} />
            <Tab label="Breach Analysis" />
            <Tab label={`Escalations (${escalations.length})`} />
            <Tab label="Auto-Close" />
          </Tabs>
        </Box>
 
        {/* ── Tab 0: Policies ──────────────────────────────────────────────── */}
        {tab === 0 && (
          <Box>
            {loading ? (
              <Box sx={{ p: 3 }}>
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} height={80} sx={{ mb: 1.5 }} />)}
              </Box>
            ) : policies.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Speed sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600} mb={1}>
                  No SLA Policies Configured
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Create policies for HIGH, MEDIUM, and LOW ticket priorities.
                </Typography>
                <Button variant="contained" startIcon={<Add />}
                  onClick={() => { setEditPolicy(null); setPolicyModal(true); }}>
                  Create First Policy
                </Button>
              </Box>
            ) : (
              policies.map((policy) => {
                const pm = PRIORITY_META[policy.priority] || {};
                return (
                  <Box key={policy.id} sx={{
                    p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5,
                    borderBottom: '1px solid #F0F0F5',
                    '&:hover': { bgcolor: '#FAFAFA' },
                    transition: 'background 0.12s',
                  }}>
                    <Box sx={{ width: 4, height: 52, borderRadius: 2, bgcolor: pm.color, flexShrink: 0 }} />
                    <Box sx={{ width: 85, flexShrink: 0 }}>
                      <PriorityChip priority={policy.priority} />
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#9CA3AF', mt: 0.4 }}>
                        ID: {policy.priorityId}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                      {[
                        { label: 'Response',     value: policy.responseTimeLabel,    hours: policy.responseTimeHours,    icon: <AccessTime sx={{ fontSize: 13, color: pm.color }} /> },
                        { label: 'Resolution',   value: policy.resolutionTimeLabel,  hours: policy.resolutionTimeHours,  icon: <Timer sx={{ fontSize: 13, color: pm.color }} /> },
                        { label: 'Breach Grace', value: policy.breachTimeLabel,      hours: policy.breachTimeHours,      icon: <Warning sx={{ fontSize: 13, color: '#E2B93B' }} /> },
                        { label: 'Status',       value: null, chip: true },
                      ].map(({ label, value, hours, icon, chip }) => (
                        <Box key={label}>
                          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.3 }}>
                            {label}
                          </Typography>
                          {chip ? (
                            <Chip label={policy.active ? 'Active' : 'Inactive'} size="small"
                              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700,
                                bgcolor: policy.active ? '#DCFCE7' : '#F3F4F6',
                                color:   policy.active ? '#15803D' : '#6B7280' }} />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {icon}
                              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B193F' }}>{value}</Typography>
                            </Box>
                          )}
                          {hours != null && !chip && (
                            <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF' }}>{hours}h</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                    {policy.description && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', maxWidth: 200, display: { xs: 'none', xl: 'block' } }} noWrap>
                        {policy.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: '#27235C' }}
                          onClick={() => { setEditPolicy(policy); setPolicyModal(true); }}>
                          <Edit sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: '#E01950' }}
                          onClick={() => setDeleteTarget(policy)}>
                          <Delete sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        )}
  {/* ── Tab 1: Breach Analysis (was Tab 2) ───────────────────────────── */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Breach by priority — only 3 priorities */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 2 }}>Breaches by Priority</Typography>
                {loading
                  ? Array(3).fill(0).map((_, i) => <Skeleton key={i} height={36} sx={{ mb: 1 }} />)
                  : ['HIGH', 'MEDIUM', 'LOW'].map((p) => {
                      const count = dashboard?.breachByPriority?.[p] || 0;
                      const pm    = PRIORITY_META[p];
                      const max   = Math.max(1, ...Object.values(dashboard?.breachByPriority || {}));
                      return (
                        <Box key={p} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: pm?.color }} />
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>{pm?.label}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: count > 0 ? '#E01950' : '#24A148' }}>
                              {count} breach{count !== 1 ? 'es' : ''}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={count === 0 ? 0 : (count / max) * 100}
                            sx={{ height: 8, borderRadius: 4, bgcolor: '#F0F0F5',
                              '& .MuiLinearProgress-bar': { bgcolor: count > 0 ? pm?.color : '#24A148', borderRadius: 4 } }}
                          />
                        </Box>
                      );
                    })
                }
              </Grid>
 
              {/* Recent breaches */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 2 }}>Recent Breaches</Typography>
                {loading
                  ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height={56} sx={{ mb: 1 }} />)
                  : !dashboard?.recentBreaches?.length
                  ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircle sx={{ fontSize: 36, color: '#24A148', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">No breaches — excellent compliance!</Typography>
                      </Box>
                    )
                  : dashboard.recentBreaches.map((b) => (
                      <Box key={b.id} sx={{ p: 1.5, mb: 1, borderRadius: 2, border: '1px solid #FEE2E2', bgcolor: '#FFF5F7', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Warning sx={{ color: '#E01950', fontSize: 18, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#E01950' }}>
                              {b.ticketNumber}
                            </Typography>
                            <PriorityChip priority={b.priority} />
                            {b.escalationLevel > 0 && <EscalationChip level={b.escalationLevel} />}
                          </Box>
                          <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }} noWrap>
                            {b.subject || 'No subject'} · {b.raisedByName || '—'}
                          </Typography>
                          {b.escalatedToName && (
                            <Typography sx={{ fontSize: '0.68rem', color: '#E01950' }}>
                              Escalated → {b.escalatedToName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))
                }
              </Grid>
 
              {/* At-risk tickets */}
              <Grid item xs={12}>
                <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 2 }}>
                  At-Risk Tickets
                  {(dashboard?.atRiskCount || 0) > 0 && (
                    <Chip label={`${dashboard.atRiskCount} need attention`} size="small"
                      sx={{ ml: 1.5, bgcolor: '#FEF9C3', color: '#854D0E', fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                  )}
                </Typography>
                {loading
                  ? <Skeleton height={80} />
                  : !dashboard?.atRiskTickets?.length
                  ? <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>No at-risk tickets.</Typography>
                  : dashboard.atRiskTickets.map((t) => (
                      <Box key={t.id} sx={{ p: 1.5, mb: 1, borderRadius: 2, border: '1px solid #FEF9C3', bgcolor: '#FFFBEB', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HourglassEmpty sx={{ color: '#E2B93B', fontSize: 18, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#27235C' }}>
                              {t.ticketNumber}
                            </Typography>
                            <PriorityChip priority={t.priority} />
                          </Box>
                          <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }} noWrap>
                            {t.subject || '—'} · Resolution by {fmtDT(t.resolutionDeadline)}
                            {t.totalPausedMinutes > 0 && ` · Paused ${fmtMins(t.totalPausedMinutes)}`}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#E2B93B', fontWeight: 700, flexShrink: 0 }}>
                          {t.resolutionMinutesRemaining > 0 ? `${fmtMins(t.resolutionMinutesRemaining)} left` : 'Overdue'}
                        </Typography>
                      </Box>
                    ))
                }
              </Grid>
            </Grid>
          </Box>
        )}
    {/* ── Tab 2: Escalations (was Tab 3) ──────────────────────────────── */}
        {tab === 2 && (
          <Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0F5' }}>
              <Box>
                <Typography fontWeight={700} fontSize="0.9rem">Escalation Contacts</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  When SLA is breached, a notification email is sent to the configured contact
                </Typography>
              </Box>
              <Button size="small" variant="contained" startIcon={<Add />}
                onClick={() => { setEditEscalation(null); setEscalationModal(true); }}>
                Add Level
              </Button>
            </Box>
 
            {loading ? (
              <Box sx={{ p: 3 }}>{Array(6).fill(0).map((_, i) => <Skeleton key={i} height={64} sx={{ mb: 1 }} />)}</Box>
            ) : escalations.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <PeopleAlt sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600} mb={0.5}>No Escalation Contacts</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Add contacts for each priority level. They'll receive an email when a ticket breaches SLA.
                </Typography>
                <Button variant="contained" startIcon={<Add />}
                  onClick={() => { setEditEscalation(null); setEscalationModal(true); }}>
                  Add First Escalation Level
                </Button>
              </Box>
            ) : (
              // Group by priority — only 3 priorities
              ['HIGH', 'MEDIUM', 'LOW'].map((priority) => {
                const group = escalations.filter((e) => e.priority === priority);
                if (group.length === 0) return null;
                const pm = PRIORITY_META[priority];
                return (
                  <Box key={priority}>
                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#F8F8FC', borderBottom: '1px solid #F0F0F5', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 4, height: 20, borderRadius: 1, bgcolor: pm?.color }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#27235C' }}>{pm?.label} Priority</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                        — {group.length} escalation level{group.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    {group.sort((a, b) => a.escalationLevel - b.escalationLevel).map((esc) => (
                      <Box key={esc.id} sx={{
                        px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 2.5,
                        borderBottom: '1px solid #F9F9FC',
                        '&:hover': { bgcolor: '#FAFAFA' },
                      }}>
                        <Box sx={{ width: 80, flexShrink: 0 }}>
                          <Chip
                            label={esc.escalationLevelLabel.split('—')[0].trim()}
                            size="small"
                            sx={{
                              bgcolor: ESCALATION_LEVEL_META[esc.escalationLevel]?.bg,
                              color:   ESCALATION_LEVEL_META[esc.escalationLevel]?.color,
                              fontWeight: 700, fontSize: '0.68rem', height: 22,
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#1B193F' }}>
                            {esc.userName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25, flexWrap: 'wrap' }}>
                            {esc.role && <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>{esc.role}</Typography>}
                            {esc.userEmail && (
                              <Typography sx={{ fontSize: '0.72rem', color: '#27235C', fontWeight: 500 }}>
                                📧 {esc.userEmail}
                              </Typography>
                            )}
                            <Typography sx={{ fontSize: '0.68rem', color: '#D1D5DB', fontFamily: 'monospace' }}>
                              ID: {esc.userId}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" sx={{ color: '#27235C' }}
                              onClick={() => { setEditEscalation(esc); setEscalationModal(true); }}>
                              <Edit sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" sx={{ color: '#E01950' }}
                              onClick={() => setDeleteEscTarget(esc)}>
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })
            )}
 
            {/* How it works info box */}
            <Box sx={{ m: 2.5, p: 2, borderRadius: 2, bgcolor: '#F8F8FC', border: '1px solid #E5E7EB', display: 'flex', gap: 1.5 }}>
              <Info sx={{ fontSize: 18, color: '#27235C', flexShrink: 0, mt: 0.1 }} />
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#27235C', mb: 0.3 }}>
                  How Breach Email Notifications Work
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.6 }}>
                  When a ticket's resolution deadline is exceeded, the SLA system automatically detects the breach
                  (every 5 minutes via scheduled job) and sends a plain-text email notification to the L1 escalation
                  contact configured for that ticket's priority. If the breach is not resolved and another breach cycle
                  passes, it escalates to L2, then L3. Configure an email address for each contact above.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
 
        {/* ── Tab 3: Auto-Close (was Tab 4) ─────────────────────────────────── */}
        {tab === 3 && (
          <AutoCloseConfigPanel slaPolicies={policies} />
        )}
      </Card>
     {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <PolicyFormModal
        open={policyModal} policy={editPolicy}
        onClose={() => { setPolicyModal(false); setEditPolicy(null); }}
        onSaved={load}
      />
 
      <EscalationModal
        open={escalationModal} escalation={editEscalation}
        onClose={() => { setEscalationModal(false); setEditEscalation(null); }}
        onSaved={load}
      />
 
      {/* Delete policy confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Warning sx={{ fontSize: 18, color: '#E01950' }} />
          </Box>
          Delete SLA Policy
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Delete the <strong>{deleteTarget?.priority}</strong> SLA policy? Existing ticket evaluations won't be deleted
            but new tickets with this priority won't be tracked.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error"
            onClick={async () => {
              try {
                await slaApi.deletePolicy(deleteTarget.priorityId);
                await load();
              } catch (err) {
                alert(err.response?.data?.message || 'Cannot delete this policy.');
              }
              setDeleteTarget(null);
            }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Delete escalation confirm */}
      <Dialog open={!!deleteEscTarget} onClose={() => setDeleteEscTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Escalation Contact?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Remove <strong>{deleteEscTarget?.userName}</strong> from{' '}
            {deleteEscTarget?.priority} L{deleteEscTarget?.escalationLevel} escalation?
            They will no longer receive breach emails for this priority.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteEscTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error"
            onClick={async () => {
              try { await slaApi.deleteEscalation(deleteEscTarget.id); await load(); } catch {}
              setDeleteEscTarget(null);
            }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
 
export default SlaManagementPage;
 
 