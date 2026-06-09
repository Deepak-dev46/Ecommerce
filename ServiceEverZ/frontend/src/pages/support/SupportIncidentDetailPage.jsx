// FILE: src/pages/support/SupportIncidentDetailPage.jsx
// CREATE THIS NEW FILE

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Typography, Stack, Paper, Chip, CircularProgress,
  IconButton, Divider, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import toast from 'react-hot-toast';

const INCIDENT_URL = 'http://localhost:8080';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

const STATUS_COLOR = {
  'New': { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'In Progress': { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  'Resolved': { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  'Closed': { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  'Open': { color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
};

const PRIORITY_COLOR = {
  LOW: { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  MEDIUM: { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  HIGH: { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9' },
  CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_COLOR[status] || STATUS_COLOR['Open'];
  return (
    <Chip label={status || '—'} size="small"
      sx={{
        fontWeight: 700, fontSize: '0.78rem', height: 24,
        color: cfg.color, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}`
      }} />
  );
}

function MetaRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{
      py: 1.2,
      borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' }
    }}>
      <Box sx={{ color: '#9CA3AF', mt: 0.2, flexShrink: 0, fontSize: 16 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {label}
        </Typography>
        {typeof value === 'string' || typeof value === 'number'
          ? <Typography sx={{ fontSize: '0.85rem', color: '#1F2937', fontWeight: 500, wordBreak: 'break-word' }}>{value}</Typography>
          : value}
      </Box>
    </Stack>
  );
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Stack direction="row" alignItems="center"
      sx={{
        px: 2.5, py: 1.5, borderBottom: '1px solid #F3F4F6',
        '&:last-child': { borderBottom: 'none' }, '&:hover': { backgroundColor: '#FAFAFA' }
      }}>
      <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 180, flexShrink: 0 }}>{label}</Typography>
      {typeof value === 'string' || typeof value === 'number'
        ? <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{value}</Typography>
        : value}
    </Stack>
  );
}

export default function SupportIncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoad] = useState('');
  const [resolveOpen, setResolveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [resolution, setResolution] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setIncident(json?.data ?? json);
    } catch {
      toast.error('Failed to load incident');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (newStatus, extraFields = {}) => {
    setActionLoad(newStatus);
    try {
      const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extraFields }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`Incident marked as ${newStatus}`);
      await load();
    } catch (e) {
      toast.error(e.message || `Failed to update status`);
    } finally {
      setActionLoad('');
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) { toast.error('Please enter a resolution note'); return; }
    await updateStatus('Resolved', { resolutionNote: resolution });
    let data = { resolutionNotes: resolution };
    const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log(res);
    setResolveOpen(false);
    setResolution('');
  };

  const handleClose = async () => {
    await updateStatus('Closed');
    setCloseOpen(false);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#97247E' }} />
    </Box>
  );

  if (!incident) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">Incident not found.</Alert>
    </Box>
  );

  const status = incident.status || 'New';
  const priority = incident.priority?.toUpperCase();
  const priCfg = PRIORITY_COLOR[priority] || PRIORITY_COLOR.MEDIUM;
  const canResolve = !['Resolved', 'Closed'].includes(status);
  const canClose = !['Closed'].includes(status);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

      {/* Back button */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
        <IconButton onClick={() => navigate('/support/incidents')}
          sx={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', width: 36, height: 36 }}>
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography sx={{ fontSize: '0.85rem', color: '#6B7280' }}>Back to Incidents</Typography>
      </Stack>

      {/* Header card */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E5E7EB', mb: 2.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box sx={{ px: 1.2, py: 0.4, borderRadius: '7px', backgroundColor: '#F8EDFB', border: '1px solid #E0BEDC' }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: '#97247E' }}>
                  {incident.ticketNumber}
                </Typography>
              </Box>
              <StatusBadge status={status} />
              {priority && (
                <Chip label={priority} size="small"
                  sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700, backgroundColor: priCfg.bg, color: priCfg.color, border: `1px solid ${priCfg.border}` }} />
              )}
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '1.05rem' }}>
              {incident.subject}
            </Typography>
            {incident.description && (
              <Typography sx={{ fontSize: '0.88rem', color: '#4B5563', mt: 1, lineHeight: 1.6 }}>
                {incident.description}
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {canResolve && (
              <Button
                variant="contained"
                startIcon={actionLoading === 'Resolved' ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                disabled={!!actionLoading}
                onClick={() => setResolveOpen(true)}
                sx={{
                  borderRadius: '10px', backgroundColor: '#24A148', fontWeight: 600, fontSize: '0.82rem',
                  '&:hover': { backgroundColor: '#1A7A37' }
                }}
              >
                Resolve
              </Button>
            )}
            {canClose && (
              <Button
                variant="outlined"
                startIcon={actionLoading === 'Closed' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
                disabled={!!actionLoading}
                onClick={() => setCloseOpen(true)}
                sx={{
                  borderRadius: '10px', borderColor: '#6B7280', color: '#6B7280', fontWeight: 600, fontSize: '0.82rem',
                  '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#6B7280' }
                }}
              >
                Close
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Main content */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>

        {/* Details */}
        <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Box sx={{ px: 2.5, py: 1.8, backgroundColor: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Incident Details
            </Typography>
          </Box>
          <DetailRow label="Ticket Number" value={incident.ticketNumber} />
          <DetailRow label="Subject" value={incident.subject} />
          <DetailRow label="Status" value={<StatusBadge status={status} />} />
          <DetailRow label="Priority" value={
            priority ? <Chip label={priority} size="small"
              sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700, backgroundColor: priCfg.bg, color: priCfg.color }} />
              : '—'
          } />
          <DetailRow label="Source" value={incident.source} />
          <DetailRow label="Breach By" value={incident.breachByUser} />
          <DetailRow label="Occurred At" value={fmtDate(incident.occurredAt)} />
          <DetailRow label="Created At" value={fmtDate(incident.createdAt)} />
          <DetailRow label="Updated At" value={fmtDate(incident.updatedAt)} />
          <DetailRow label="Incident Location" value={incident.incidentLocation} />
          <DetailRow label="Office Location" value={incident.officeLocation} />
          {incident.description && (
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mb: 0.5 }}>Description</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#1F2937', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {incident.description}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Sidebar */}
        <Box sx={{ width: { lg: 280 }, flexShrink: 0 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              People
            </Typography>
            <MetaRow icon={<PersonIcon fontSize="inherit" />} label="Requester" value={incident.requesterName} />
            <MetaRow icon={<EmailIcon fontSize="inherit" />} label="Email" value={incident.email} />
            <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Assigned To" value={incident.assignedToName} />

            {(incident.incidentLocation || incident.officeLocation) && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                  Location
                </Typography>
                <MetaRow icon={<LocationOnIcon fontSize="inherit" />} label="Incident Location" value={incident.incidentLocation} />
                <MetaRow icon={<BusinessIcon fontSize="inherit" />} label="Office Location" value={incident.officeLocation} />
              </>
            )}

            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              Classification
            </Typography>
            <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Category ID" value={incident.categoryId ? String(incident.categoryId) : null} />
            <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Sub-Category ID" value={incident.subCategoryId ? String(incident.subCategoryId) : null} />
          </Paper>
        </Box>
      </Stack>

      {/* Resolve Dialog */}
      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Resolve Incident</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#4B5563', mb: 2 }}>
            Please provide a resolution note before closing this incident.
          </Typography>
          <TextField
            label="Resolution Note"
            multiline
            rows={4}
            fullWidth
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            placeholder="Describe how the incident was resolved..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setResolveOpen(false)} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleResolve}
            disabled={!!actionLoading}
            startIcon={actionLoading === 'Resolved' ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
            sx={{ borderRadius: '9px', backgroundColor: '#24A148', '&:hover': { backgroundColor: '#1A7A37' } }}
          >
            Confirm Resolve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Close Incident</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#4B5563' }}>
            Are you sure you want to close incident <strong>{incident.ticketNumber}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCloseOpen(false)} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={!!actionLoading}
            startIcon={actionLoading === 'Closed' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
            sx={{ borderRadius: '9px', backgroundColor: '#6B7280', '&:hover': { backgroundColor: '#4B5563' } }}
          >
            Close Incident
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}