// src/pages/support/BackupSchedulePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress,
  Card, Grid, Chip, Alert, Dialog, DialogContent,
  DialogActions, Tabs, Tab, Autocomplete, Divider, Drawer, Stack,
} from '@mui/material';
import SearchIcon         from '@mui/icons-material/Search';
import AddIcon            from '@mui/icons-material/Add';
import EditIcon           from '@mui/icons-material/Edit';
import DeleteIcon         from '@mui/icons-material/Delete';
import BackupIcon         from '@mui/icons-material/Backup';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import ScheduleIcon       from '@mui/icons-material/Schedule';
import StorageIcon        from '@mui/icons-material/Storage';
import RefreshIcon        from '@mui/icons-material/Refresh';
import DevicesIcon        from '@mui/icons-material/Devices';
import CategoryIcon       from '@mui/icons-material/Category';
import LaptopIcon         from '@mui/icons-material/Laptop';
import RouterIcon         from '@mui/icons-material/Router';
import PrintIcon          from '@mui/icons-material/Print';
import PhoneAndroidIcon   from '@mui/icons-material/PhoneAndroid';
import MemoryIcon         from '@mui/icons-material/Memory';
import ClearIcon          from '@mui/icons-material/Clear';
import PolicyIcon         from '@mui/icons-material/Policy';
import InfoOutlinedIcon   from '@mui/icons-material/InfoOutlined';
import CloseIcon          from '@mui/icons-material/Close';
import CalendarTodayIcon  from '@mui/icons-material/CalendarToday';
import EventIcon          from '@mui/icons-material/Event';
import UpcomingIcon       from '@mui/icons-material/Upcoming';
import {
  getAllBackupSchedules,
  createBackupSchedule,
  updateBackupSchedule,
  deleteBackupSchedule,
} from '../../api/backupScheduleApi';
import { getAllRetentionPolicies } from '../../api/retentionPolicyApi';
import { getAllAssets } from '../../api/assetApi';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from '../../utils/toast';
import CustomPagination from '../../components/common/CustomPagination';

const BRAND  = '#27235C';
const ACCENT = '#97247E';
const BORDER = '#E8E8F0';

// Matches BackupStatus enum: SCHEDULED, BACKUP_INITIATED, BACKUP_COMPLETED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
const BACKUP_STATUSES  = ['SCHEDULED', 'BACKUP_INITIATED', 'IN_PROGRESS', 'BACKUP_COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED'];
const RETENTION_TYPES  = ['BACKUP', 'ARCHIVAL', 'COMPLIANCE', 'AUDIT', 'DISASTER_RECOVERY', 'OTHER'];
const ASSET_CATEGORIES = [
  'LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET', 'SERVER',
  'NETWORK_DEVICE', 'PRINTER', 'MONITOR', 'OTHER',
];

const CATEGORY_ICONS = {
  LAPTOP:         <LaptopIcon sx={{ fontSize: 16 }} />,
  DESKTOP:        <MemoryIcon sx={{ fontSize: 16 }} />,
  MOBILE:         <PhoneAndroidIcon sx={{ fontSize: 16 }} />,
  TABLET:         <PhoneAndroidIcon sx={{ fontSize: 16 }} />,
  SERVER:         <StorageIcon sx={{ fontSize: 16 }} />,
  NETWORK_DEVICE: <RouterIcon sx={{ fontSize: 16 }} />,
  PRINTER:        <PrintIcon sx={{ fontSize: 16 }} />,
  MONITOR:        <DevicesIcon sx={{ fontSize: 16 }} />,
  OTHER:          <DevicesIcon sx={{ fontSize: 16 }} />,
};

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const fmtDate      = (dt) => dt ? new Date(dt).toLocaleString() : '—';
const fmtDateShort = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

const fmtScheduledDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// ── Chips ─────────────────────────────────────────────────────────────────────

function BackupStatusChip({ status }) {
  const map = {
    SCHEDULED:        { color: '#0369a1', bg: '#e0f2fe' },
    BACKUP_INITIATED: { color: '#92400e', bg: '#fef3c7' },
    IN_PROGRESS:      { color: '#92400e', bg: '#fef3c7' },
    BACKUP_COMPLETED: { color: '#065f46', bg: '#d1fae5' },
    COMPLETED:        { color: '#065f46', bg: '#d1fae5' },
    FAILED:           { color: '#991b1b', bg: '#fee2e2' },
    CANCELLED:        { color: '#374151', bg: '#f3f4f6' },
  };
  const s = map[status] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={status?.replace(/_/g, ' ')} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function RetentionTypeChip({ type }) {
  const map = {
    BACKUP:            { color: '#0369a1', bg: '#e0f2fe' },
    ARCHIVAL:          { color: '#065f46', bg: '#d1fae5' },
    COMPLIANCE:        { color: '#7c3aed', bg: '#ede9fe' },
    AUDIT:             { color: '#92400e', bg: '#fef3c7' },
    DISASTER_RECOVERY: { color: '#9f1239', bg: '#ffe4e6' },
    OTHER:             { color: '#374151', bg: '#f3f4f6' },
  };
  const s = map[type] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={type?.replace(/_/g, ' ')} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
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

const TH = ({ children }) => (
  <TableCell sx={{
    fontWeight: 700, fontSize: '0.72rem', color: '#444',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap',
    backgroundColor: '#F8F8FC', py: 1.5,
  }}>
    {children}
  </TableCell>
);

// ── Detail Drawer helpers ─────────────────────────────────────────────────────

const Section = ({ title, icon, children }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
      {icon && React.cloneElement(icon, { sx: { fontSize: 14, color: BRAND } })}
      <Typography sx={{
        fontWeight: 700, color: BRAND, textTransform: 'uppercase',
        letterSpacing: '0.08em', fontSize: '0.7rem',
      }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 2, py: 1 }}>
    <Typography variant="caption" sx={{ color: '#6B7280', minWidth: 120, flexShrink: 0, fontWeight: 500 }}>{label}</Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1A1A1A', textAlign: 'right', flex: 1 }}>
      {value ?? <span style={{ color: '#9CA3AF' }}>—</span>}
    </Typography>
  </Box>
);

// ── Backup Detail Drawer ──────────────────────────────────────────────────────

function BackupDetailDrawer({ schedule, linkedPolicy, onClose, onEdit, onDelete }) {
  if (!schedule) return null;
  return (
    <Drawer
      anchor="right"
      open={!!schedule}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', boxShadow: '-4px 0 24px rgba(39,35,92,0.10)' } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        background: `linear-gradient(135deg, ${BRAND} 0%, #3D3890 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BackupIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>{schedule.scheduleName}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.2 }}>Schedule #{schedule.id}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>

        <Section title="Schedule Details" icon={<ScheduleIcon />}>
          <Box sx={{ backgroundColor: '#F8F9FF', borderRadius: '10px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <InfoRow label="Status" value={<BackupStatusChip status={schedule.status} />} />
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Scheduled Date" value={
                schedule.scheduledDate ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    <EventIcon sx={{ fontSize: 13, color: BRAND }} />
                    <span>{fmtScheduledDate(schedule.scheduledDate)}</span>
                  </Box>
                ) : '—'
              } />
            </Box>
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Next Backup" value={fmtScheduledDate(schedule.nextBackupDate)} />
            </Box>
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Frequency" value={schedule.frequency || '—'} />
            </Box>
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Asset" value={
                schedule.assetName
                  ? `${schedule.assetName}${schedule.assetTag ? ` (${schedule.assetTag})` : ''}`
                  : schedule.assetId ? `#${schedule.assetId}` : 'Generic (no asset)'
              } />
            </Box>
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Created By" value={schedule.createdBySpName || (schedule.createdBySpId ? `SP #${schedule.createdBySpId}` : '—')} />
            </Box>
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Created At" value={fmtDate(schedule.createdAt)} />
            </Box>
            <Box sx={{ borderTop: `1px solid ${BORDER}` }}>
              <InfoRow label="Updated At" value={fmtDate(schedule.updatedAt)} />
            </Box>
          </Box>
        </Section>

        {schedule.description && (
          <>
            <Divider sx={{ my: 2, borderColor: BORDER }} />
            <Section title="Description" icon={<InfoOutlinedIcon />}>
              <Box sx={{ backgroundColor: '#F8F9FF', borderRadius: '10px', p: 2, border: `1px solid ${BORDER}` }}>
                <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {schedule.description}
                </Typography>
              </Box>
            </Section>
          </>
        )}

        <Divider sx={{ my: 2, borderColor: BORDER }} />

        <Section title="Retention Policy" icon={<PolicyIcon />}>
          {(schedule.retentionPolicyName || linkedPolicy) ? (() => {
            const pName   = schedule.retentionPolicyName || linkedPolicy?.policyName;
            const pType   = schedule.retentionPolicyType || linkedPolicy?.type;
            const pFreq   = schedule.retentionPolicyFrequency || linkedPolicy?.frequency;
            const pDays   = schedule.retentionPolicyDays    != null ? schedule.retentionPolicyDays    : linkedPolicy?.retentionDays;
            const pActive = schedule.retentionPolicyActive  != null ? schedule.retentionPolicyActive  : linkedPolicy?.isActive;
            const pId     = schedule.retentionPolicyId;
            return (
              <Box sx={{
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${BRAND}08 0%, ${BRAND}04 100%)`,
                border: `1px solid ${BRAND}22`,
                overflow: 'hidden',
              }}>
                <Box sx={{
                  px: 2.5, py: 1.5,
                  background: `linear-gradient(135deg, ${BRAND}18 0%, ${BRAND}0A 100%)`,
                  borderBottom: `1px solid ${BRAND}18`,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: `${BRAND}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PolicyIcon sx={{ fontSize: 16, color: BRAND }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: BRAND, lineHeight: 1.2 }}>{pName}</Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: `${BRAND}99`, mt: 0.2 }}>Policy #{pId}</Typography>
                  </Box>
                  <RetentionTypeChip type={pType} />
                </Box>
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>Frequency</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A1A1A' }}>{pFreq || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>Retention Days</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A1A1A' }}>{pDays != null ? `${pDays} days` : '—'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>Status</Typography>
                      <Chip
                        label={pActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{ backgroundColor: pActive ? '#d1fae5' : '#fee2e2', color: pActive ? '#065f46' : '#991b1b', fontWeight: 600, fontSize: '0.68rem', height: 20 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            );
          })() : schedule.retentionPolicyId ? (
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PolicyIcon sx={{ fontSize: 18, color: '#92400E', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.82rem', color: '#92400E' }}>
                Policy ID #{schedule.retentionPolicyId} — details not available
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#F9FAFB', border: `1px dashed ${BORDER}`, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PolicyIcon sx={{ fontSize: 18, color: '#D1D5DB', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                No retention policy linked to this schedule.
              </Typography>
            </Box>
          )}
        </Section>
      </Box>

      {/* Footer actions */}
      <Box sx={{ px: 3, py: 2.5, borderTop: `1px solid ${BORDER}`, flexShrink: 0, backgroundColor: '#FAFBFF' }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth variant="outlined" startIcon={<EditIcon />}
            onClick={() => { onClose(); onEdit(schedule); }}
            sx={{ borderColor: BRAND, color: BRAND, textTransform: 'none', borderRadius: '8px', fontWeight: 600, '&:hover': { backgroundColor: '#eef0fa', borderColor: BRAND } }}
          >
            Edit
          </Button>
          <Button
            fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />}
            onClick={() => { onClose(); onDelete(schedule.id); }}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

// ── Retention Policy Selector ─────────────────────────────────────────────────

function RetentionPolicySelector({ form, setForm, formErrors, allPolicies, policiesLoading }) {
  const [selectedType, setSelectedType]     = useState(form.retentionPolicyType || '');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const filteredPolicies = React.useMemo(() => {
    if (!selectedType) return [];
    return allPolicies.filter(p => p.type === selectedType && p.isActive !== false);
  }, [allPolicies, selectedType]);

  useEffect(() => {
    if (form.retentionPolicyId && allPolicies.length > 0 && !selectedPolicy) {
      const found = allPolicies.find(p => String(p.id) === String(form.retentionPolicyId));
      if (found) {
        setSelectedPolicy(found);
        setSelectedType(found.type || '');
      }
    }
  }, [form.retentionPolicyId, allPolicies]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedPolicy(null);
    setForm(f => ({
      ...f,
      retentionPolicyType:        type,
      retentionPolicyId:          '',
      retentionPolicyName:        '',
      retentionPolicyDescription: '',
      retentionPolicyFrequency:   '',
      retentionPolicyDays:        '',
    }));
  };

  const handlePolicyChange = (policy) => {
    setSelectedPolicy(policy);
    if (policy) {
      setForm(f => ({
        ...f,
        retentionPolicyId:          String(policy.id),
        retentionPolicyName:        policy.policyName        || '',
        retentionPolicyDescription: policy.description       || '',
        retentionPolicyFrequency:   policy.frequency         || '',
        retentionPolicyDays:        policy.retentionDays != null ? String(policy.retentionDays) : '',
      }));
    } else {
      setForm(f => ({
        ...f,
        retentionPolicyId:          '',
        retentionPolicyName:        '',
        retentionPolicyDescription: '',
        retentionPolicyFrequency:   '',
        retentionPolicyDays:        '',
      }));
    }
  };

  const handleClear = () => {
    setSelectedType('');
    setSelectedPolicy(null);
    setForm(f => ({
      ...f,
      retentionPolicyType:        '',
      retentionPolicyId:          '',
      retentionPolicyName:        '',
      retentionPolicyDescription: '',
      retentionPolicyFrequency:   '',
      retentionPolicyDays:        '',
    }));
  };

  const hasPolicy = !!selectedPolicy;

  return (
    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: '10px', p: 2, backgroundColor: '#FAFBFF' }}>
      <Typography sx={{
        fontSize: '0.72rem', fontWeight: 700, color: BRAND,
        textTransform: 'uppercase', letterSpacing: '0.07em',
        mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5,
      }}>
        <PolicyIcon sx={{ fontSize: 14 }} />
        Retention Policy *
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth size="small">
            <InputLabel>Step 1 — Select Type</InputLabel>
            <Select
              value={selectedType}
              label="Step 1 — Select Type"
              onChange={e => handleTypeChange(e.target.value)}
            >
              <MenuItem value=""><em>— Choose a type —</em></MenuItem>
              {RETENTION_TYPES.map(t => (
                <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={7}>
          <FormControl fullWidth size="small" disabled={!selectedType || policiesLoading}>
            <InputLabel>
              {policiesLoading
                ? 'Loading policies…'
                : selectedType
                  ? `Step 2 — Select Policy (${filteredPolicies.length} found)`
                  : 'Step 2 — Select Policy'}
            </InputLabel>
            <Select
              value={form.retentionPolicyId || ''}
              label={policiesLoading ? 'Loading policies…' : selectedType ? `Step 2 — Select Policy (${filteredPolicies.length} found)` : 'Step 2 — Select Policy'}
              onChange={e => {
                const policy = filteredPolicies.find(p => String(p.id) === String(e.target.value));
                handlePolicyChange(policy || null);
              }}
              startAdornment={
                policiesLoading
                  ? <InputAdornment position="start"><CircularProgress size={14} /></InputAdornment>
                  : null
              }
            >
              <MenuItem value=""><em>— Choose a policy —</em></MenuItem>
              {filteredPolicies.map(p => (
                <MenuItem key={p.id} value={String(p.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3 }}>
                        {p.policyName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                        {p.frequency} · {p.retentionDays} days
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {formErrors.retentionPolicyId && (
              <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>
                {formErrors.retentionPolicyId}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {hasPolicy && (
        <Box sx={{
          mt: 2, borderRadius: '10px',
          background: `linear-gradient(135deg, ${BRAND}08 0%, ${BRAND}04 100%)`,
          border: `1px solid ${BRAND}22`,
          overflow: 'hidden',
        }}>
          <Box sx={{
            px: 2, py: 1.2,
            background: `linear-gradient(135deg, ${BRAND}18 0%, ${BRAND}0A 100%)`,
            borderBottom: `1px solid ${BRAND}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PolicyIcon sx={{ fontSize: 16, color: BRAND }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: BRAND }}>
                Selected Retention Policy — Read Only
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label="Auto-filled"
                size="small"
                icon={<InfoOutlinedIcon sx={{ fontSize: '0.75rem !important' }} />}
                sx={{ fontSize: '0.65rem', height: 20, backgroundColor: `${BRAND}18`, color: BRAND, fontWeight: 600 }}
              />
              <Tooltip title="Clear policy selection">
                <IconButton size="small" onClick={handleClear} sx={{ color: '#aaa', '&:hover': { color: '#666' }, p: 0.3 }}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Policy Name"
                  value={form.retentionPolicyName || ''} InputProps={{ readOnly: true }} sx={readOnlyStyle} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Frequency"
                  value={form.retentionPolicyFrequency || ''} InputProps={{ readOnly: true }} sx={readOnlyStyle} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Retention Days"
                  value={form.retentionPolicyDays ? `${form.retentionPolicyDays} days` : '—'} InputProps={{ readOnly: true }} sx={readOnlyStyle} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Policy Type"
                  value={form.retentionPolicyType?.replace(/_/g, ' ') || ''} InputProps={{ readOnly: true }} sx={readOnlyStyle} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Description"
                  value={form.retentionPolicyDescription || ''} InputProps={{ readOnly: true }}
                  multiline rows={2} sx={readOnlyStyle} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {!hasPolicy && (
        <Typography sx={{ mt: 1, fontSize: '0.72rem', color: '#aaa', fontStyle: 'italic' }}>
          Select a type then a policy. All policy fields are filled automatically and cannot be edited.
        </Typography>
      )}
    </Box>
  );
}

const readOnlyStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F3F4F8',
    '& fieldset': { borderColor: `${BORDER}` },
    '&:hover fieldset': { borderColor: `${BORDER}` },
    '&.Mui-focused fieldset': { borderColor: `${BORDER}` },
  },
  '& .MuiInputBase-input': { color: '#444', WebkitTextFillColor: '#444' },
  '& .MuiInputLabel-root': { color: '#888' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#888' },
};

// ── Asset Search Field ────────────────────────────────────────────────────────

function AssetSearchField({ form, setForm, formErrors, allAssets, assetsLoading }) {
  const [assetSearch, setAssetSearch]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAsset, setSelectedAsset]       = useState(null);

  const filteredAssets = React.useMemo(() => {
    if (!selectedCategory) return [];
    return allAssets.filter(a => {
      if (a.category !== selectedCategory) return false;
      if (!assetSearch.trim()) return true;
      const q = assetSearch.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.assetTag?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q) ||
        a.brand?.toLowerCase().includes(q) ||
        a.model?.toLowerCase().includes(q)
      );
    });
  }, [allAssets, selectedCategory, assetSearch]);

  useEffect(() => {
    if (form.assetId && allAssets.length > 0 && !selectedAsset) {
      const found = allAssets.find(a => String(a.id) === String(form.assetId));
      if (found) {
        setSelectedAsset(found);
        setSelectedCategory(found.category || '');
      }
    }
  }, [form.assetId, allAssets]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedAsset(null);
    setAssetSearch('');
    setForm(f => ({ ...f, assetId: '' }));
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setForm(f => ({ ...f, assetId: asset ? String(asset.id) : '' }));
  };

  const handleClearAsset = () => {
    setSelectedAsset(null);
    setAssetSearch('');
    setSelectedCategory('');
    setForm(f => ({ ...f, assetId: '' }));
  };

  return (
    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: '10px', p: 2, backgroundColor: '#FAFBFF' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CategoryIcon sx={{ fontSize: 14 }} />
        Asset Selection (Optional)
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth size="small">
            <InputLabel>Step 1 — Select Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Step 1 — Select Category"
              onChange={e => handleCategoryChange(e.target.value)}
              startAdornment={
                selectedCategory ? (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <Box sx={{ color: BRAND }}>{CATEGORY_ICONS[selectedCategory] || <CategoryIcon sx={{ fontSize: 16 }} />}</Box>
                  </InputAdornment>
                ) : null
              }
            >
              <MenuItem value=""><em>— Choose a category —</em></MenuItem>
              {ASSET_CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: BRAND }}>{CATEGORY_ICONS[cat]}</Box>
                    <span>{cat.replace(/_/g, ' ')}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={7}>
          <Autocomplete
            disabled={!selectedCategory}
            options={filteredAssets}
            value={selectedAsset}
            loading={assetsLoading}
            inputValue={assetSearch}
            onInputChange={(_, val) => setAssetSearch(val)}
            onChange={(_, asset) => handleAssetSelect(asset)}
            getOptionLabel={opt => opt ? `${opt.name}${opt.assetTag ? ` · ${opt.assetTag}` : ''}` : ''}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            filterOptions={(opts) => opts}
            noOptionsText={
              !selectedCategory ? 'Select a category first'
                : assetsLoading ? 'Loading assets…'
                : assetSearch.trim() ? 'No assets match your search'
                : 'No assets in this category'
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: '10px !important', px: '14px !important' }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#EDEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0, mt: 0.2 }}>
                  {CATEGORY_ICONS[option.category] || <DevicesIcon sx={{ fontSize: 16 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1A1A1A', lineHeight: 1.3 }}>{option.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, mt: 0.3, flexWrap: 'wrap' }}>
                    {option.assetTag && <Typography sx={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace', backgroundColor: '#F3F4F6', px: 0.6, borderRadius: '4px' }}>{option.assetTag}</Typography>}
                    {option.brand && <Typography sx={{ fontSize: '0.7rem', color: '#666' }}>{option.brand}</Typography>}
                    {option.model && <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{option.model}</Typography>}
                  </Box>
                </Box>
                <Chip label={`#${option.id}`} size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#EDEDF7', color: BRAND, fontWeight: 700, flexShrink: 0 }} />
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={selectedCategory ? `Step 2 — Search in ${selectedCategory.replace(/_/g, ' ')}` : 'Step 2 — Search Asset'}
                placeholder={selectedCategory ? 'Type name, tag, brand…' : 'Select category first'}
                error={!!formErrors.assetId}
                helperText={formErrors.assetId}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: selectedCategory ? '#888' : '#ccc' }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {assetsLoading && <CircularProgress size={14} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {selectedAsset && (
        <Box sx={{
          mt: 1.5, p: 1.5, borderRadius: '8px',
          background: `linear-gradient(135deg, ${BRAND}08 0%, ${BRAND}04 100%)`,
          border: `1px solid ${BRAND}22`,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: `${BRAND}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0 }}>
            {CATEGORY_ICONS[selectedAsset.category] || <DevicesIcon />}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: BRAND }}>{selectedAsset.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>ID: {selectedAsset.id}</Typography>
              {selectedAsset.assetTag && <Typography sx={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>Tag: {selectedAsset.assetTag}</Typography>}
              {selectedAsset.category && <Chip label={selectedAsset.category.replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.62rem', height: 16, backgroundColor: '#EDEDF7', color: BRAND, fontWeight: 600 }} />}
            </Box>
          </Box>
          <Tooltip title="Clear asset selection">
            <IconButton size="small" onClick={handleClearAsset} sx={{ color: '#aaa', '&:hover': { color: '#666' } }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {!selectedAsset && (
        <Typography sx={{ mt: 1, fontSize: '0.72rem', color: '#aaa', fontStyle: 'italic' }}>
          Leave blank to create a generic (non-asset-specific) backup schedule.
        </Typography>
      )}
    </Box>
  );
}

// ── Empty form ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  scheduleName:               '',
  description:                '',
  assetId:                    '',
  status:                     '',
  frequency:                  'DAILY',
  scheduledDate:              '',
  retentionPolicyType:        '',
  retentionPolicyId:          '',
  retentionPolicyName:        '',
  retentionPolicyDescription: '',
  retentionPolicyFrequency:   '',
  retentionPolicyDays:        '',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BackupSchedulePage() {
  const { user } = useAuth();

  const [schedules, setSchedules]       = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab]                   = useState('ALL');
  const [page, setPage]                 = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [allAssets, setAllAssets]             = useState([]);
  const [assetsLoading, setAssetsLoading]     = useState(false);
  const [allPolicies, setAllPolicies]         = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  const [drawerSchedule, setDrawerSchedule] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // Backend returns List<BackupScheduleResponse> directly — no ApiResponse wrapper
  const fetchSchedules = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getAllBackupSchedules();
      setSchedules(Array.isArray(res) ? res : (res.data || []));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load backup schedules');
    } finally { setLoading(false); }
  }, []);

  const fetchAllAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const res = await getAllAssets();
      setAllAssets(res.data?.data || res.data || (Array.isArray(res) ? res : []));
    } catch { /* non-blocking */ }
    finally { setAssetsLoading(false); }
  }, []);

  // Backend returns List<RetentionPolicyResponse> directly — no ApiResponse wrapper
  const fetchAllPolicies = useCallback(async () => {
    setPoliciesLoading(true);
    try {
      const res = await getAllRetentionPolicies();
      setAllPolicies(Array.isArray(res) ? res : (res.data || []));
    } catch { /* non-blocking */ }
    finally { setPoliciesLoading(false); }
  }, []);

  useEffect(() => { fetchSchedules();   }, [fetchSchedules]);
  useEffect(() => { fetchAllAssets();   }, [fetchAllAssets]);
  useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

  // ── Filter ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let list = [...schedules];
    if (tab === 'GENERIC')        list = list.filter(s => !s.assetId);
    if (tab === 'ASSET_SPECIFIC') list = list.filter(s => !!s.assetId);
    if (tab === 'UPCOMING') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      list = list.filter(s => {
        if (s.status !== 'SCHEDULED' || !s.scheduledDate) return false;
        const scheduledDate = new Date(s.scheduledDate + 'T00:00:00');
        return scheduledDate > today;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.scheduleName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.assetName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(s => s.status === statusFilter);
    setFiltered(list);
    setPage(0);
  }, [schedules, search, statusFilter, tab]);

  const stats = {
    total:     schedules.length,
    scheduled: schedules.filter(s => s.status === 'SCHEDULED').length,
    completed: schedules.filter(s => s.status === 'BACKUP_COMPLETED' || s.status === 'COMPLETED').length,
    failed:    schedules.filter(s => s.status === 'FAILED').length,
    assetSpec: schedules.filter(s => !!s.assetId).length,
    upcoming:  schedules.filter(s => {
      if (s.status !== 'SCHEDULED' || !s.scheduledDate) return false;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return new Date(s.scheduledDate + 'T00:00:00') > today;
    }).length,
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (schedule) => {
    setEditTarget(schedule);

    let retentionPolicyType        = '';
    let retentionPolicyName        = '';
    let retentionPolicyDescription = '';
    let retentionPolicyFrequency   = '';
    let retentionPolicyDays        = '';

    if (schedule.retentionPolicyId) {
      // Prefer inline hydrated fields from response, fall back to policy list lookup
      if (schedule.retentionPolicyName) {
        retentionPolicyType      = schedule.retentionPolicyType      || '';
        retentionPolicyName      = schedule.retentionPolicyName      || '';
        retentionPolicyFrequency = schedule.retentionPolicyFrequency || '';
        retentionPolicyDays      = schedule.retentionPolicyDays != null ? String(schedule.retentionPolicyDays) : '';
      } else if (allPolicies.length > 0) {
        const found = allPolicies.find(p => String(p.id) === String(schedule.retentionPolicyId));
        if (found) {
          retentionPolicyType        = found.type           || '';
          retentionPolicyName        = found.policyName     || '';
          retentionPolicyDescription = found.description    || '';
          retentionPolicyFrequency   = found.frequency      || '';
          retentionPolicyDays        = found.retentionDays != null ? String(found.retentionDays) : '';
        }
      }
    }

    const scheduledDate = schedule.scheduledDate
      ? (typeof schedule.scheduledDate === 'string'
          ? schedule.scheduledDate.split('T')[0]
          : schedule.scheduledDate)
      : '';

    setForm({
      scheduleName:               schedule.scheduleName   || '',
      description:                schedule.description    || '',
      assetId:                    schedule.assetId ? String(schedule.assetId) : '',
      status:                     schedule.status         || '',
      frequency:                  schedule.frequency      || 'DAILY',
      scheduledDate,
      retentionPolicyId:          schedule.retentionPolicyId ? String(schedule.retentionPolicyId) : '',
      retentionPolicyType,
      retentionPolicyName,
      retentionPolicyDescription,
      retentionPolicyFrequency,
      retentionPolicyDays,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.scheduleName.trim())  errs.scheduleName      = 'Schedule name is required';
    if (!form.description.trim())   errs.description       = 'Description is required';
    if (!form.scheduledDate)        errs.scheduledDate     = 'Scheduled date is required';
    else {
      const today  = new Date(); today.setHours(0, 0, 0, 0);
      const chosen = new Date(form.scheduledDate + 'T00:00:00');
      if (chosen <= today) errs.scheduledDate = 'Scheduled date must be a future date';
    }
    if (!form.retentionPolicyId)    errs.retentionPolicyId = 'Retention policy is required';
    if (form.assetId && isNaN(Number(form.assetId))) errs.assetId = 'Invalid asset selection';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const payload = {
          scheduleName:      form.scheduleName.trim(),
          description:       form.description.trim(),
          assetId:           form.assetId ? Number(form.assetId) : null,
          frequency:         form.frequency || 'DAILY',
          status:            form.status || undefined,
          scheduledDate:     form.scheduledDate || null,
          retentionPolicyId: form.retentionPolicyId ? Number(form.retentionPolicyId) : null,
        };
        await updateBackupSchedule(editTarget.id, payload);
        toast.success('Backup schedule updated');
      } else {
        const payload = {
          scheduleName:      form.scheduleName.trim(),
          description:       form.description.trim(),
          assetId:           form.assetId ? Number(form.assetId) : null,
          frequency:         form.frequency || 'DAILY',
          scheduledDate:     form.scheduledDate || null,
          retentionPolicyId: form.retentionPolicyId ? Number(form.retentionPolicyId) : null,
          createdBySpId:     user?.userId,  // required by backend @NotNull
        };
        await createBackupSchedule(payload);
        toast.success('Backup schedule created');
      }
      setDialogOpen(false);
      fetchSchedules();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBackupSchedule(deleteId);
      setDeleteId(null);
      if (drawerSchedule?.id === deleteId) setDrawerSchedule(null);
      fetchSchedules();
      toast.success('Backup schedule deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getLinkedPolicy = (schedule) =>
    schedule.retentionPolicyId
      ? allPolicies.find(p => String(p.id) === String(schedule.retentionPolicyId)) || null
      : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND }}>Backup Schedules</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            Manage scheduled backups for assets and general data
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSchedules} sx={{ border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
            New Schedule
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<BackupIcon />}      label="Total"         value={stats.total}     color={BRAND}   bg="#eef0fa" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<ScheduleIcon />}    label="Scheduled"     value={stats.scheduled} color="#0369a1" bg="#e0f2fe" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<CheckCircleIcon />} label="Completed"     value={stats.completed} color="#16a34a" bg="#d1fae5" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<StorageIcon />}     label="Failed"        value={stats.failed}    color="#dc2626" bg="#fee2e2" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<DevicesIcon />}     label="Asset-Specific" value={stats.assetSpec} color={ACCENT}  bg="#f8e9f6" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<UpcomingIcon />}    label="Upcoming"      value={stats.upcoming}  color="#065f46" bg="#d1fae5" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 42, fontSize: '0.85rem' },
            '& .Mui-selected': { fontWeight: 700, color: `${BRAND} !important` },
            '& .MuiTabs-indicator': { backgroundColor: BRAND },
          }}>
          <Tab value="ALL"            label={`All (${schedules.length})`} />
          <Tab value="UPCOMING"       label={`Upcoming (${stats.upcoming})`} icon={<UpcomingIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab value="ASSET_SPECIFIC" label="Asset-Specific" icon={<DevicesIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab value="GENERIC"        label="Generic" />
        </Tabs>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search by name, description or asset…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#999' }} /></InputAdornment> }}
            sx={{ minWidth: 300 }} />
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {BACKUP_STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || statusFilter) && (
            <Button size="small" onClick={() => { setSearch(''); setStatusFilter(''); }}
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
              <TableRow>
                <TH>#</TH>
                <TH>Schedule Name</TH>
                <TH>Status</TH>
                <TH>Scheduled Date</TH>
                <TH>Next Backup</TH>
                <TH>Asset</TH>
                <TH>Retention Policy</TH>
                <TH>Created By</TH>
                <TH>Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: BRAND }} /></TableCell></TableRow>
              ) : paged.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <BackupIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                  <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>No backup schedules found</Typography>
                </TableCell></TableRow>
              ) : paged.map((schedule, idx) => {
                const linkedPolicy = getLinkedPolicy(schedule);
                return (
                  <TableRow
                    key={schedule.id}
                    hover
                    onClick={() => setDrawerSchedule(schedule)}
                    sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer' }}
                  >
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: BRAND, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {schedule.scheduleName}
                    </TableCell>
                    <TableCell><BackupStatusChip status={schedule.status} /></TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {schedule.scheduledDate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <EventIcon sx={{ fontSize: 14, color: BRAND, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A' }}>
                            {fmtScheduledDate(schedule.scheduledDate)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {schedule.nextBackupDate ? (
                        <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>
                          {fmtScheduledDate(schedule.nextBackupDate)}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.8rem', color: '#555' }}>
                      {schedule.assetName ? (
                        <Box>
                          <Chip label={schedule.assetName} size="small" sx={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                          {schedule.assetTag && <Typography sx={{ fontSize: '0.68rem', color: '#888', fontFamily: 'monospace', mt: 0.2 }}>Tag: {schedule.assetTag}</Typography>}
                        </Box>
                      ) : schedule.assetId ? (
                        <Chip label={`#${schedule.assetId}`} size="small" sx={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                      ) : <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>Generic</Typography>}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.8rem', color: '#555' }}>
                      {schedule.retentionPolicyName ? (
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: BRAND, lineHeight: 1.3 }}>
                            {schedule.retentionPolicyName}
                          </Typography>
                          <RetentionTypeChip type={schedule.retentionPolicyType} />
                        </Box>
                      ) : linkedPolicy ? (
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: BRAND, lineHeight: 1.3 }}>
                            {linkedPolicy.policyName}
                          </Typography>
                          <RetentionTypeChip type={linkedPolicy.type} />
                        </Box>
                      ) : schedule.retentionPolicyId ? (
                        <Typography sx={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>ID #{schedule.retentionPolicyId}</Typography>
                      ) : (
                        <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.8rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      {schedule.createdBySpName || (schedule.createdBySpId ? `SP #${schedule.createdBySpId}` : '—')}
                    </TableCell>

                    <TableCell onClick={e => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(schedule)}
                            sx={{ color: BRAND, '&:hover': { backgroundColor: '#eef0fa' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(schedule.id)}
                            sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fee2e2' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* ── Backup Detail Drawer ── */}
      <BackupDetailDrawer
        schedule={drawerSchedule}
        linkedPolicy={drawerSchedule ? getLinkedPolicy(drawerSchedule) : null}
        onClose={() => setDrawerSchedule(null)}
        onEdit={(s) => openEdit(s)}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* ── Create / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        <Box sx={{
          px: 3, py: 2.5,
          background: `linear-gradient(135deg, ${BRAND} 0%, #3B3680 100%)`,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BackupIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
              {editTarget ? 'Edit Backup Schedule' : 'New Backup Schedule'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
              {editTarget ? `Editing: ${editTarget.scheduleName}` : 'Fill in the details to create a new backup schedule'}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <Grid container spacing={2.5}>

            <Grid item xs={12}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 14 }} />
                Schedule Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Schedule Name *" value={form.scheduleName}
                onChange={e => setForm(f => ({ ...f, scheduleName: e.target.value }))}
                error={!!formErrors.scheduleName} helperText={formErrors.scheduleName}
                placeholder="e.g. Daily Server Backup" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Scheduled Date *" type="date"
                value={form.scheduledDate}
                onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                error={!!formErrors.scheduledDate}
                helperText={formErrors.scheduledDate || 'Only future dates are allowed'}
                inputProps={{ min: getTomorrowStr() }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ fontSize: 16, color: form.scheduledDate ? BRAND : '#bbb' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={editTarget ? 6 : 12}>
              <TextField fullWidth size="small" label="Description *" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                error={!!formErrors.description} helperText={formErrors.description}
                multiline rows={2}
                placeholder="Describe what this backup covers and why it's scheduled" />
            </Grid>

            {editTarget && (
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={form.status} label="Status"
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {BACKUP_STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}><Divider sx={{ borderColor: BORDER }} /></Grid>

            <Grid item xs={12}>
              <RetentionPolicySelector
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                allPolicies={allPolicies}
                policiesLoading={policiesLoading}
              />
            </Grid>

            <Grid item xs={12}><Divider sx={{ borderColor: BORDER }} /></Grid>

            <Grid item xs={12}>
              <AssetSearchField
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                allAssets={allAssets}
                assetsLoading={assetsLoading}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}
            sx={{ borderColor: BORDER, color: '#555', textTransform: 'none', borderRadius: '8px' }} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, textTransform: 'none', fontWeight: 600, minWidth: 120, borderRadius: '8px' }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editTarget ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Backup Schedule"
        message="Are you sure you want to delete this backup schedule? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
      />
    </Box>
  );
}
