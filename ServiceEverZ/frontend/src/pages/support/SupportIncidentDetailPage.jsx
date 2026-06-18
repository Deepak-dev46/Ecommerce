// // FILE: src/pages/support/SupportIncidentDetailPage.jsx
// // CREATE THIS NEW FILE

// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import {
//   Box, Typography, Stack, Paper, Chip, CircularProgress,
//   IconButton, Divider, Button, Dialog, DialogTitle,
//   DialogContent, DialogActions, TextField, Alert
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import PersonIcon from '@mui/icons-material/Person';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import BusinessIcon from '@mui/icons-material/Business';
// import EmailIcon from '@mui/icons-material/Email';
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import LockIcon from '@mui/icons-material/Lock';
// import toast from 'react-hot-toast';

// const INCIDENT_URL = 'http://localhost:8080';

// const fmtDate = (d) =>
//   d ? new Date(d).toLocaleString('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric',
//     hour: '2-digit', minute: '2-digit',
//   }) : '—';

// const STATUS_COLOR = {
//   'New': { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
//   'In Progress': { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
//   'Resolved': { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
//   'Closed': { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
//   'Open': { color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
// };

// const PRIORITY_COLOR = {
//   LOW: { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
//   MEDIUM: { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
//   HIGH: { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9' },
//   CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB' },
// };

// function StatusBadge({ status }) {
//   const cfg = STATUS_COLOR[status] || STATUS_COLOR['Open'];
//   return (
//     <Chip label={status || '—'} size="small"
//       sx={{
//         fontWeight: 700, fontSize: '0.78rem', height: 24,
//         color: cfg.color, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}`
//       }} />
//   );
// }

// function MetaRow({ icon, label, value }) {
//   if (!value && value !== 0) return null;
//   return (
//     <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{
//       py: 1.2,
//       borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' }
//     }}>
//       <Box sx={{ color: '#9CA3AF', mt: 0.2, flexShrink: 0, fontSize: 16 }}>{icon}</Box>
//       <Box sx={{ minWidth: 0 }}>
//         <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
//           {label}
//         </Typography>
//         {typeof value === 'string' || typeof value === 'number'
//           ? <Typography sx={{ fontSize: '0.85rem', color: '#1F2937', fontWeight: 500, wordBreak: 'break-word' }}>{value}</Typography>
//           : value}
//       </Box>
//     </Stack>
//   );
// }

// function DetailRow({ label, value }) {
//   if (value === null || value === undefined || value === '') return null;
//   return (
//     <Stack direction="row" alignItems="center"
//       sx={{
//         px: 2.5, py: 1.5, borderBottom: '1px solid #F3F4F6',
//         '&:last-child': { borderBottom: 'none' }, '&:hover': { backgroundColor: '#FAFAFA' }
//       }}>
//       <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 180, flexShrink: 0 }}>{label}</Typography>
//       {typeof value === 'string' || typeof value === 'number'
//         ? <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{value}</Typography>
//         : value}
//     </Stack>
//   );
// }

// export default function SupportIncidentDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [incident, setIncident] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoad] = useState('');
//   const [resolveOpen, setResolveOpen] = useState(false);
//   const [closeOpen, setCloseOpen] = useState(false);
//   const [resolution, setResolution] = useState('');

//   const load = useCallback(async () => {
//     try {
//       const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}`, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       setIncident(json?.data ?? json);
//     } catch {
//       toast.error('Failed to load incident');
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => { load(); }, [load]);

//   const updateStatus = async (newStatus, extraFields = {}) => {
//     setActionLoad(newStatus);
//     try {
//       const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus, ...extraFields }),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       toast.success(`Incident marked as ${newStatus}`);
//       await load();
//     } catch (e) {
//       toast.error(e.message || `Failed to update status`);
//     } finally {
//       setActionLoad('');
//     }
//   };

//   const handleResolve = async () => {
//     if (!resolution.trim()) { toast.error('Please enter a resolution note'); return; }
//     await updateStatus('Resolved', { resolutionNote: resolution });
//     let data = { resolutionNotes: resolution };
//     const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}/resolve`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });
//     console.log(res);
//     setResolveOpen(false);
//     setResolution('');
//   };

//   const handleClose = async () => {
//     await updateStatus('Closed');
//     setCloseOpen(false);
//   };

//   if (loading) return (
//     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
//       <CircularProgress sx={{ color: '#97247E' }} />
//     </Box>
//   );

//   if (!incident) return (
//     <Box sx={{ p: 3 }}>
//       <Alert severity="error">Incident not found.</Alert>
//     </Box>
//   );

//   const status = incident.status || 'New';
//   const priority = incident.priority?.toUpperCase();
//   const priCfg = PRIORITY_COLOR[priority] || PRIORITY_COLOR.MEDIUM;
//   const canResolve = !['Resolved', 'Closed'].includes(status);
//   const canClose = !['Closed'].includes(status);

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

//       {/* Back button */}
//       <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
//         <IconButton onClick={() => navigate('/support/incidents')}
//           sx={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', width: 36, height: 36 }}>
//           <ArrowBackIcon sx={{ fontSize: 18 }} />
//         </IconButton>
//         <Typography sx={{ fontSize: '0.85rem', color: '#6B7280' }}>Back to Incidents</Typography>
//       </Stack>

//       {/* Header card */}
//       <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E5E7EB', mb: 2.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
//         <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
//           <Box>
//             <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
//               <Box sx={{ px: 1.2, py: 0.4, borderRadius: '7px', backgroundColor: '#F8EDFB', border: '1px solid #E0BEDC' }}>
//                 <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: '#97247E' }}>
//                   {incident.ticketNumber}
//                 </Typography>
//               </Box>
//               <StatusBadge status={status} />
//               {priority && (
//                 <Chip label={priority} size="small"
//                   sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700, backgroundColor: priCfg.bg, color: priCfg.color, border: `1px solid ${priCfg.border}` }} />
//               )}
//             </Stack>
//             <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '1.05rem' }}>
//               {incident.subject}
//             </Typography>
//             {incident.description && (
//               <Typography sx={{ fontSize: '0.88rem', color: '#4B5563', mt: 1, lineHeight: 1.6 }}>
//                 {incident.description}
//               </Typography>
//             )}
//           </Box>

//           {/* Action buttons */}
//           <Stack direction="row" spacing={1} flexWrap="wrap">
//             {canResolve && (
//               <Button
//                 variant="contained"
//                 startIcon={actionLoading === 'Resolved' ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
//                 disabled={!!actionLoading}
//                 onClick={() => setResolveOpen(true)}
//                 sx={{
//                   borderRadius: '10px', backgroundColor: '#24A148', fontWeight: 600, fontSize: '0.82rem',
//                   '&:hover': { backgroundColor: '#1A7A37' }
//                 }}
//               >
//                 Resolve
//               </Button>
//             )}
//             {canClose && (
//               <Button
//                 variant="outlined"
//                 startIcon={actionLoading === 'Closed' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
//                 disabled={!!actionLoading}
//                 onClick={() => setCloseOpen(true)}
//                 sx={{
//                   borderRadius: '10px', borderColor: '#6B7280', color: '#6B7280', fontWeight: 600, fontSize: '0.82rem',
//                   '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#6B7280' }
//                 }}
//               >
//                 Close
//               </Button>
//             )}
//           </Stack>
//         </Stack>
//       </Paper>

//       {/* Main content */}
//       <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>

//         {/* Details */}
//         <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
//           <Box sx={{ px: 2.5, py: 1.8, backgroundColor: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
//             <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//               Incident Details
//             </Typography>
//           </Box>
//           <DetailRow label="Ticket Number" value={incident.ticketNumber} />
//           <DetailRow label="Subject" value={incident.subject} />
//           <DetailRow label="Status" value={<StatusBadge status={status} />} />
//           <DetailRow label="Priority" value={
//             priority ? <Chip label={priority} size="small"
//               sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700, backgroundColor: priCfg.bg, color: priCfg.color }} />
//               : '—'
//           } />
//           <DetailRow label="Source" value={incident.source} />
//           <DetailRow label="Breach By" value={incident.breachByUser} />
//           <DetailRow label="Occurred At" value={fmtDate(incident.occurredAt)} />
//           <DetailRow label="Created At" value={fmtDate(incident.createdAt)} />
//           <DetailRow label="Updated At" value={fmtDate(incident.updatedAt)} />
//           <DetailRow label="Incident Location" value={incident.incidentLocation} />
//           <DetailRow label="Office Location" value={incident.officeLocation} />
//           {incident.description && (
//             <Box sx={{ px: 2.5, py: 2 }}>
//               <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mb: 0.5 }}>Description</Typography>
//               <Typography sx={{ fontSize: '0.88rem', color: '#1F2937', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
//                 {incident.description}
//               </Typography>
//             </Box>
//           )}
//         </Paper>

//         {/* Sidebar */}
//         <Box sx={{ width: { lg: 280 }, flexShrink: 0 }}>
//           <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
//             <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
//               People
//             </Typography>
//             <MetaRow icon={<PersonIcon fontSize="inherit" />} label="Requester" value={incident.requesterName} />
//             <MetaRow icon={<EmailIcon fontSize="inherit" />} label="Email" value={incident.email} />
//             <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Assigned To" value={incident.assignedToName} />

//             {(incident.incidentLocation || incident.officeLocation) && (
//               <>
//                 <Divider sx={{ my: 1.5 }} />
//                 <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
//                   Location
//                 </Typography>
//                 <MetaRow icon={<LocationOnIcon fontSize="inherit" />} label="Incident Location" value={incident.incidentLocation} />
//                 <MetaRow icon={<BusinessIcon fontSize="inherit" />} label="Office Location" value={incident.officeLocation} />
//               </>
//             )}

//             <Divider sx={{ my: 1.5 }} />
//             <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
//               Classification
//             </Typography>
//             <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Category ID" value={incident.categoryId ? String(incident.categoryId) : null} />
//             <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Sub-Category ID" value={incident.subCategoryId ? String(incident.subCategoryId) : null} />
//           </Paper>
//         </Box>
//       </Stack>

//       {/* Resolve Dialog */}
//       <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
//         <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Resolve Incident</DialogTitle>
//         <DialogContent>
//           <Typography sx={{ fontSize: '0.88rem', color: '#4B5563', mb: 2 }}>
//             Please provide a resolution note before closing this incident.
//           </Typography>
//           <TextField
//             label="Resolution Note"
//             multiline
//             rows={4}
//             fullWidth
//             value={resolution}
//             onChange={e => setResolution(e.target.value)}
//             placeholder="Describe how the incident was resolved..."
//             sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
//           />
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//           <Button onClick={() => setResolveOpen(false)} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleResolve}
//             disabled={!!actionLoading}
//             startIcon={actionLoading === 'Resolved' ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
//             sx={{ borderRadius: '9px', backgroundColor: '#24A148', '&:hover': { backgroundColor: '#1A7A37' } }}
//           >
//             Confirm Resolve
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Close Dialog */}
//       <Dialog open={closeOpen} onClose={() => setCloseOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
//         <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Close Incident</DialogTitle>
//         <DialogContent>
//           <Typography sx={{ fontSize: '0.88rem', color: '#4B5563' }}>
//             Are you sure you want to close incident <strong>{incident.ticketNumber}</strong>? This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//           <Button onClick={() => setCloseOpen(false)} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleClose}
//             disabled={!!actionLoading}
//             startIcon={actionLoading === 'Closed' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
//             sx={{ borderRadius: '9px', backgroundColor: '#6B7280', '&:hover': { backgroundColor: '#4B5563' } }}
//           >
//             Close Incident
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }


import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Alert, Badge, Box, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import toast from 'react-hot-toast';
 
const INCIDENT_URL = 'http://localhost:8080';
 
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';
 
const STATUS_COLOR = {
  'New':         { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'In Progress': { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  'Resolved':    { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  'Closed':      { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  'Open':        { color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
};
 
const PRIORITY_COLOR = {
  LOW:      { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  MEDIUM:   { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  HIGH:     { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9' },
  CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB' },
};
 
/* ── Status chip ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_COLOR[status] || STATUS_COLOR['Open'];
  return (
    <Chip label={status || '—'} size="small"
      sx={{ fontWeight: 700, fontSize: '0.78rem', height: 24,
        color: cfg.color, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
  );
}
 
/* ── Sidebar meta row ────────────────────────────────────────── */
function MetaRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start"
      sx={{ py: 1.2, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
      <Box sx={{ color: '#9CA3AF', mt: 0.2, flexShrink: 0, fontSize: 16 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase',
          letterSpacing: '0.06em', fontWeight: 600 }}>
          {label}
        </Typography>
        {typeof value === 'string' || typeof value === 'number'
          ? <Typography sx={{ fontSize: '0.85rem', color: '#1F2937', fontWeight: 500, wordBreak: 'break-word' }}>{value}</Typography>
          : value}
      </Box>
    </Stack>
  );
}
 
/* ── Detail table row ────────────────────────────────────────── */
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Stack direction="row" alignItems="center"
      sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F3F4F6',
        '&:last-child': { borderBottom: 'none' }, '&:hover': { backgroundColor: '#FAFAFA' } }}>
      <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 180, flexShrink: 0 }}>{label}</Typography>
      {typeof value === 'string' || typeof value === 'number'
        ? <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{value}</Typography>
        : value}
    </Stack>
  );
}
 
/* ── Attachment preview modal ────────────────────────────────── */
function AttachmentPreviewModal({ open, onClose, attachment }) {
  const [objectUrl, setObjectUrl] = useState(null);
 
  useEffect(() => {
    if (!attachment?.file) { setObjectUrl(null); return; }
    const byteChars = atob(attachment.file);
    const byteArray = new Uint8Array(byteChars.length);
    for (let j = 0; j < byteChars.length; j++) byteArray[j] = byteChars.charCodeAt(j);
    const blob = new Blob([byteArray], { type: attachment.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);
 
  const handleDownload = () => {
    if (!objectUrl || !attachment) return;
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = attachment.filename || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const isImage = attachment?.mimeType?.startsWith('image/');
  const isPdf   = attachment?.mimeType === 'application/pdf';
 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)', border: '1px solid #E5E7EB',
        height: '90vh', display: 'flex', flexDirection: 'column' } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between"
          sx={{ px: 3, py: 2, borderBottom: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AttachFileIcon sx={{ fontSize: 18, color: '#4F46E5' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827',
                maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attachment?.filename || 'Attachment'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>
                {attachment?.mimeType || 'Unknown type'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderRadius: '8px', borderColor: '#E5E7EB', color: '#374151', fontSize: '0.78rem',
                '&:hover': { borderColor: '#27235C', color: '#27235C', backgroundColor: '#F5F5FF' } }}>
              Download
            </Button>
            <IconButton onClick={onClose} size="small"
              sx={{ color: '#9CA3AF', '&:hover': { backgroundColor: '#F3F4F6' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
 
      <DialogContent sx={{ flex: 1, p: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
        {!objectUrl ? (
          <CircularProgress size={36} sx={{ color: '#27235C' }} />
        ) : isImage ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', p: 3, overflow: 'auto' }}>
            <img src={objectUrl} alt={attachment?.filename}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />
          </Box>
        ) : isPdf ? (
          <iframe src={objectUrl} title={attachment?.filename}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
        ) : (
          <Stack alignItems="center" spacing={2.5}>
            <Box sx={{ width: 72, height: 72, borderRadius: '20px', backgroundColor: '#E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AttachFileIcon sx={{ fontSize: 34, color: '#9CA3AF' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>Preview not available</Typography>
              <Typography sx={{ fontSize: '0.83rem', color: '#9CA3AF' }}>
                This file type cannot be previewed. Download it to view.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}
              sx={{ backgroundColor: '#27235C', borderRadius: '10px', '&:hover': { backgroundColor: '#1B193F' } }}>
              Download File
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
 
/* ══════════════════════════════════════════════════════════════ */
export default function SupportIncidentDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [incident,      setIncident]    = useState(null);
  const [loading,       setLoading]     = useState(true);
  const [actionLoading, setActionLoad]  = useState('');
  const [resolveOpen,   setResolveOpen] = useState(false);
  const [closeOpen,     setCloseOpen]   = useState(false);
  const [resolution,    setResolution]  = useState('');
  const [previewAttachment, setPreviewAttachment] = useState(null);
 
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
      toast.error(e.message || 'Failed to update status');
    } finally {
      setActionLoad('');
    }
  };
 
  const handleResolve = async () => {
    if (!resolution.trim()) { toast.error('Please enter a resolution note'); return; }
    await updateStatus('Resolved', { resolutionNote: resolution });
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
 
  const status    = incident.status || 'New';
  const priority  = incident.priority?.toUpperCase();
  const priCfg    = PRIORITY_COLOR[priority] || PRIORITY_COLOR.MEDIUM;
  const canResolve = !['Resolved', 'Closed'].includes(status);
  const canClose   = !['Closed'].includes(status);
 
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
                  sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700,
                    backgroundColor: priCfg.bg, color: priCfg.color, border: `1px solid ${priCfg.border}` }} />
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
              <Button variant="contained"
                startIcon={actionLoading === 'Resolved' ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                disabled={!!actionLoading}
                onClick={() => setResolveOpen(true)}
                sx={{ borderRadius: '10px', backgroundColor: '#24A148', fontWeight: 600, fontSize: '0.82rem',
                  '&:hover': { backgroundColor: '#1A7A37' } }}>
                Resolve
              </Button>
            )}
            {canClose && (
              <Button variant="outlined"
                startIcon={actionLoading === 'Closed' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
                disabled={!!actionLoading}
                onClick={() => setCloseOpen(true)}
                sx={{ borderRadius: '10px', borderColor: '#6B7280', color: '#6B7280', fontWeight: 600, fontSize: '0.82rem',
                  '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#6B7280' } }}>
                Close
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
 
      {/* Main content */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
 
        {/* Details panel */}
        <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', border: '1px solid #E5E7EB',
          overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Box sx={{ px: 2.5, py: 1.8, backgroundColor: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C',
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Incident Details
            </Typography>
          </Box>
          <DetailRow label="Ticket Number"     value={incident.ticketNumber} />
          <DetailRow label="Subject"            value={incident.subject} />
          <DetailRow label="Status"             value={<StatusBadge status={status} />} />
          <DetailRow label="Priority"           value={
            priority
              ? <Chip label={priority} size="small"
                  sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700,
                    backgroundColor: priCfg.bg, color: priCfg.color }} />
              : '—'
          } />
          <DetailRow label="Source"             value={incident.source} />
          <DetailRow label="Breach By"          value={incident.breachByUser} />
          <DetailRow label="Occurred At"        value={fmtDate(incident.occurredAt)} />
          <DetailRow label="Created At"         value={fmtDate(incident.createdAt)} />
          <DetailRow label="Updated At"         value={fmtDate(incident.updatedAt)} />
          <DetailRow label="Incident Location"  value={incident.incidentLocation} />
          <DetailRow label="Office Location"    value={incident.officeLocation} />
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
        <Stack spacing={2} sx={{ width: { lg: 280 }, flexShrink: 0 }}>
 
          {/* People card */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C',
              textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              People
            </Typography>
            <MetaRow icon={<PersonIcon fontSize="inherit" />}      label="Requester"   value={incident.requesterName} />
            <MetaRow icon={<EmailIcon fontSize="inherit" />}       label="Email"        value={incident.email} />
            <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Assigned To" value={incident.assignedToName} />
 
            {(incident.incidentLocation || incident.officeLocation) && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C',
                  textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                  Location
                </Typography>
                <MetaRow icon={<LocationOnIcon fontSize="inherit" />} label="Incident Location" value={incident.incidentLocation} />
                <MetaRow icon={<BusinessIcon fontSize="inherit" />}   label="Office Location"   value={incident.officeLocation} />
              </>
            )}
 
            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C',
              textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              Classification
            </Typography>
            <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Category ID"
              value={incident.categoryId ? String(incident.categoryId) : null} />
            <MetaRow icon={<WarningAmberIcon fontSize="inherit" />} label="Sub-Category ID"
              value={incident.subCategoryId ? String(incident.subCategoryId) : null} />
          </Paper>
 
          {/* Attachments card */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#27235C',
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Attachments
              </Typography>
              <Badge badgeContent={incident.attachments?.length || 0} color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                <AttachFileIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
              </Badge>
            </Stack>
            <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />
            {incident.attachments?.length > 0 ? (
              incident.attachments.map((a, i) => (
                <Stack key={a.attachmentID || i} direction="row" spacing={1} alignItems="center"
                  justifyContent="space-between"
                  sx={{ py: 0.9, px: 1, borderRadius: '8px',
                    '&:hover': { backgroundColor: '#F5F5FF' }, transition: 'background-color 0.15s' }}>
                  <Stack direction="row" spacing={1} alignItems="center"
                    sx={{ overflow: 'hidden', flex: 1, cursor: 'pointer' }}
                    onClick={() => setPreviewAttachment(a)}>
                    <AttachFileIcon sx={{ fontSize: 14, color: '#9CA3AF', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.78rem', color: '#3B82F6',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      '&:hover': { textDecoration: 'underline' } }}>
                      {a.filename || `Attachment ${i + 1}`}
                    </Typography>
                  </Stack>
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => {
                      const byteChars = atob(a.file);
                      const byteArray = new Uint8Array(byteChars.length);
                      for (let j = 0; j < byteChars.length; j++) byteArray[j] = byteChars.charCodeAt(j);
                      const blob = new Blob([byteArray], { type: a.mimeType || 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url; link.download = a.filename || `attachment-${i + 1}`;
                      document.body.appendChild(link); link.click(); document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}>
                      <DownloadIcon sx={{ fontSize: 15, color: '#6B7280' }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))
            ) : (
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', py: 1 }}>
                No attachments
              </Typography>
            )}
          </Paper>
 
        </Stack>
      </Stack>
 
      {/* Resolve Dialog */}
      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Resolve Incident</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#4B5563', mb: 2 }}>
            Please provide a resolution note before closing this incident.
          </Typography>
          <TextField label="Resolution Note" multiline rows={4} fullWidth
            value={resolution} onChange={e => setResolution(e.target.value)}
            placeholder="Describe how the incident was resolved..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setResolveOpen(false)} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
          <Button variant="contained" onClick={handleResolve} disabled={!!actionLoading}
            startIcon={actionLoading === 'Resolved' ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
            sx={{ borderRadius: '9px', backgroundColor: '#24A148', '&:hover': { backgroundColor: '#1A7A37' } }}>
            Confirm Resolve
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Close Dialog */}
      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Close Incident</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#4B5563' }}>
            Are you sure you want to close incident <strong>{incident.ticketNumber}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCloseOpen(false)} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
          <Button variant="contained" onClick={handleClose} disabled={!!actionLoading}
            startIcon={actionLoading === 'Closed' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
            sx={{ borderRadius: '9px', backgroundColor: '#6B7280', '&:hover': { backgroundColor: '#4B5563' } }}>
            Close Incident
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        open={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
 
    </Box>
  );
}