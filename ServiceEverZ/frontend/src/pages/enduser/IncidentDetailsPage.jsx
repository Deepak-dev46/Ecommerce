// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { incidentApi } from '../../api/index';
// import {
//   Box, Typography, Stack, Paper, Chip, CircularProgress,
//   IconButton, Divider, Alert, Skeleton
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import PersonIcon from '@mui/icons-material/Person';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import BusinessIcon from '@mui/icons-material/Business';
// import EmailIcon from '@mui/icons-material/Email';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import SourceIcon from '@mui/icons-material/Source';
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import toast from 'react-hot-toast';

// /* ── Helpers ─────────────────────────────────────────────────── */
// const fmtDate = (d) =>
//   d
//     ? new Date(d).toLocaleString('en-US', {
//         month: 'short', day: 'numeric', year: 'numeric',
//         hour: '2-digit', minute: '2-digit',
//       })
//     : '—';

// /* ── Status colours (incident statuses) ─────────────────────── */
// const STATUS_COLOR = {
//   New:          { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
//   'In Progress':{ color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
//   Resolved:     { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
//   Closed:       { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
//   Open:         { color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
// };

// const PRIORITY_COLOR = {
//   LOW:      { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
//   MEDIUM:   { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
//   HIGH:     { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9' },
//   CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB' },
// };

// function StatusBadge({ status }) {
//   const cfg = STATUS_COLOR[status] || STATUS_COLOR.Open;
//   return (
//     <Chip label={status || '—'} size="small"
//       sx={{ fontWeight: 700, fontSize: '0.78rem', height: 24,
//         color: cfg.color, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
//   );
// }

// function PriorityBadge({ priority }) {
//   if (!priority) return <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>—</Typography>;
//   const cfg = PRIORITY_COLOR[priority?.toUpperCase()] || {};
//   return (
//     <Chip label={priority} size="small"
//       sx={{ fontWeight: 700, fontSize: '0.78rem', height: 24,
//         color: cfg.color, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
//   );
// }

// /* ── A single meta row in the sidebar ───────────────────────── */
// function MetaRow({ icon, label, value }) {
//   if (!value && value !== 0) return null;
//   return (
//     <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1.2,
//       borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
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

// /* ── Details table row ───────────────────────────────────────── */
// function DetailRow({ label, value }) {
//   if (value === null || value === undefined || value === '') return null;
//   return (
//     <Stack direction="row" alignItems="center"
//       sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F3F4F6',
//         '&:last-child': { borderBottom: 'none' }, '&:hover': { backgroundColor: '#FAFAFA' } }}>
//       <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 180, flexShrink: 0 }}>{label}</Typography>
//       {typeof value === 'string' || typeof value === 'number'
//         ? <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{value}</Typography>
//         : value}
//     </Stack>
//   );
// }

// /* ── Loading skeleton ────────────────────────────────────────── */
// function LoadingSkeleton() {
//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       <Skeleton variant="rounded" width={200} height={36} sx={{ mb: 2, borderRadius: '10px' }} />
//       <Paper sx={{ p: 3, borderRadius: '16px', mb: 2 }}>
//         <Skeleton variant="rounded" width="55%" height={28} sx={{ mb: 1.5 }} />
//         <Skeleton variant="rounded" width="30%" height={18} />
//       </Paper>
//       <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
//         <Box sx={{ flex: 1 }}><Skeleton variant="rounded" height={380} sx={{ borderRadius: '16px' }} /></Box>
//         <Box sx={{ width: { lg: 280 }, flexShrink: 0 }}><Skeleton variant="rounded" height={380} sx={{ borderRadius: '16px' }} /></Box>
//       </Stack>
//     </Box>
//   );
// }

// /* ══════════════════════════════════════════════════════════════ */
// export default function IncidentDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [incident, setIncident] = useState(null);
//   const [loading,  setLoading]  = useState(true);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await incidentApi.getById(id);
//       // incidentApi.getById returns json.data (unwrapped by apiFetch)
//       setIncident(data);
//     } catch (err) {
//       toast.error('Failed to load incident');
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => { load(); }, [load]);

//   if (loading) return <LoadingSkeleton />;

//   if (!incident) {
//     return (
//       <Box sx={{ p: 4 }}>
//         <Alert severity="error" sx={{ borderRadius: '12px' }}>
//           Incident not found or access denied.
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

//       {/* ── Top bar ── */}
//       <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
//         <Stack direction="row" alignItems="center" spacing={1.5}>
//           <IconButton onClick={() => navigate('/user/tickets')} size="small"
//             sx={{ backgroundColor: '#27235C', color: '#fff', borderRadius: '10px',
//               width: 36, height: 36, '&:hover': { backgroundColor: '#1B193F' } }}>
//             <ArrowBackIcon fontSize="small" />
//           </IconButton>
//           <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Tickets /</Typography>
//           <Typography sx={{ color: '#27235C', fontSize: '0.85rem', fontWeight: 600 }}>
//             {incident.ticketNumber}
//           </Typography>
//         </Stack>

//         {/* Incident type badge */}
//         <Chip label="Incident" size="small"
//           sx={{ fontWeight: 700, fontSize: '0.75rem', height: 26,
//             color: '#9D174D', backgroundColor: '#FCE7F3', border: '1.5px solid #F9A8D4' }} />
//       </Stack>

//       {/* ── Subject / header card ── */}
//       <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 2.5,
//         border: '1px solid #E5E7EB', background: 'linear-gradient(135deg, #27235C08 0%, #97247E08 100%)' }}>
//         <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>
//           <Box sx={{ flex: 1, minWidth: 0 }}>
//             <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
//               <WarningAmberIcon sx={{ color: '#97247E', fontSize: 20 }} />
//               <Typography sx={{ fontSize: '0.72rem', color: '#97247E', fontWeight: 700,
//                 textTransform: 'uppercase', letterSpacing: '0.08em' }}>
//                 Incident Report
//               </Typography>
//             </Stack>
//             <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B193F', lineHeight: 1.3, mb: 1 }}>
//               {incident.subject || '(No subject)'}
//             </Typography>
//             <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
//               <StatusBadge status={incident.status} />
//               <PriorityBadge priority={incident.priority} />
//               <Chip label={`#${incident.ticketNumber}`} size="small"
//                 sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem', height: 24,
//                   color: '#27235C', backgroundColor: '#EDE9FE', border: 'none' }} />
//             </Stack>
//           </Box>
//           <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
//             <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Reported</Typography>
//             <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>
//               {fmtDate(incident.createdAt)}
//             </Typography>
//           </Box>
//         </Stack>
//       </Paper>

//       {/* ── Main content: details + sidebar ── */}
//       <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start">

//         {/* LEFT: full details table */}
//         <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

//           {/* Section: Incident Details */}
//           <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
//             <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151',
//               textTransform: 'uppercase', letterSpacing: '0.07em' }}>
//               Incident Details
//             </Typography>
//           </Box>

//           <DetailRow label="Ticket Number"    value={incident.ticketNumber} />
//           <DetailRow label="Ticket Type"      value={incident.ticketType} />
//           <DetailRow label="Status"           value={<StatusBadge status={incident.status} />} />
//           <DetailRow label="Priority"         value={<PriorityBadge priority={incident.priority} />} />
//           <DetailRow label="Requester Name"   value={incident.requesterName} />
//           <DetailRow label="Email"            value={incident.email} />
//           <DetailRow label="Category"         value={incident.categoryName || (incident.categoryId ? `Category #${incident.categoryId}` : null)} />
//           <DetailRow label="Sub-Category"     value={incident.subCategoryName || (incident.subCategoryId ? `Sub-Category #${incident.subCategoryId}` : null)} />
//           <DetailRow label="Source"           value={incident.source} />
//           <DetailRow label="Incident Location" value={incident.incidentLocation} />
//           <DetailRow label="Office Location"  value={incident.officeLocation} />
//           <DetailRow label="Occurred At"      value={incident.occurredAt ? fmtDate(incident.occurredAt) : null} />
//           <DetailRow label="Assigned To"      value={incident.assignedToName || incident.assignedTo} />
//           <DetailRow label="Breach By User"   value={incident.breachByUser} />
//           <DetailRow label="Attachment"       value={incident.attachmentPath} />
//           <DetailRow label="Created At"       value={fmtDate(incident.createdAt)} />
//           <DetailRow label="Last Updated"     value={fmtDate(incident.updatedAt)} />

//           {/* Description */}
//           {incident.description && (
//             <>
//               <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
//                 backgroundColor: '#FAFAFA' }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151',
//                   textTransform: 'uppercase', letterSpacing: '0.07em' }}>
//                   Description
//                 </Typography>
//               </Box>
//               <Box sx={{ p: 2.5 }}>
//                 <Box sx={{ p: 2.5, backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
//                   <Typography sx={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
//                     {incident.description}
//                   </Typography>
//                 </Box>
//               </Box>
//             </>
//           )}
//         </Paper>

//         {/* RIGHT: sidebar */}
//         <Paper elevation={0} sx={{ width: { xs: '100%', lg: 280 }, flexShrink: 0,
//           borderRadius: '16px', border: '1px solid #E5E7EB', p: 2.5 }}>

//           <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151',
//             textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
//             Quick Info
//           </Typography>

//           <MetaRow
//             icon={<PersonIcon sx={{ fontSize: 16 }} />}
//             label="Requester"
//             value={incident.requesterName}
//           />
//           <MetaRow
//             icon={<EmailIcon sx={{ fontSize: 16 }} />}
//             label="Email"
//             value={incident.email}
//           />
//           <MetaRow
//             icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
//             label="Incident Location"
//             value={incident.incidentLocation}
//           />
//           <MetaRow
//             icon={<BusinessIcon sx={{ fontSize: 16 }} />}
//             label="Office"
//             value={incident.officeLocation}
//           />
//           <MetaRow
//             icon={<SourceIcon sx={{ fontSize: 16 }} />}
//             label="Source"
//             value={incident.source}
//           />
//           <MetaRow
//             icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
//             label="Assigned To"
//             value={incident.assignedToName || incident.assignedTo || 'Unassigned'}
//           />

//           <Divider sx={{ my: 2 }} />

//           {/* Status + Priority display */}
//           <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700,
//             textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
//             Status
//           </Typography>
//           <StatusBadge status={incident.status} />

//           <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700,
//             textTransform: 'uppercase', letterSpacing: '0.06em', mt: 2, mb: 1 }}>
//             Priority
//           </Typography>
//           <PriorityBadge priority={incident.priority} />

//           <Divider sx={{ my: 2 }} />

//           <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600,
//             textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
//             Created
//           </Typography>
//           <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>
//             {fmtDate(incident.createdAt)}
//           </Typography>

//           {incident.updatedAt && incident.updatedAt !== incident.createdAt && (
//             <>
//               <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600,
//                 textTransform: 'uppercase', letterSpacing: '0.06em', mt: 1.5, mb: 0.5 }}>
//                 Last Updated
//               </Typography>
//               <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>
//                 {fmtDate(incident.updatedAt)}
//               </Typography>
//             </>
//           )}
//         </Paper>

//       </Stack>
//     </Box>
//   );
// }


// FILE: src/pages/enduser/IncidentDetailsPage.jsx
// REPLACE THE ENTIRE FILE
 
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CheckCircleOutlineIcon  from '@mui/icons-material/ThumbUpAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import {
  Alert, Avatar, Badge, Box, Button, Chip,
  CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider,
  IconButton, Paper, Skeleton, Stack,
  Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { incidentApi } from '../../api/index';
 
const INCIDENT_URL = 'http://localhost:8088';
 
/* ─── Constants ───────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  LOW:      { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9', dot: '🟢' },
  MEDIUM:   { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0', dot: '🟡' },
  HIGH:     { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9', dot: '🟠' },
  CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB', dot: '🔴' },
};
 
const STATUS_COLOR = {
  New:          { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'In Progress':{ color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  Resolved:     { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  Closed:       { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  Open:         { color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
};
 
/* ─── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';
 
const fmtShortDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) : '—';
 
/* ─── Sub-components ─────────────────────────────────────────── */
function IncidentStatusChip({ status }) {
  const cfg = STATUS_COLOR[status] || STATUS_COLOR.Open;
  return (
    <Chip label={status || '—'} size="small"
      sx={{ fontWeight: 700, fontSize: '0.75rem', height: 24,
        color: cfg.color, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
  );
}
 
function PriorityBadge({ priority }) {
  const key = priority?.toUpperCase?.() || 'MEDIUM';
  const cfg = PRIORITY_CONFIG[key] || PRIORITY_CONFIG.MEDIUM;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6,
      px: 1.2, py: 0.35, borderRadius: '6px',
      backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cfg.color }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: cfg.color,
        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {priority || 'Medium'}
      </Typography>
    </Box>
  );
}
 
function SidebarMetaRow({ icon, label, value, valueColor }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.8 }}>
      <Box sx={{ color: '#9CA3AF', mt: 0.15, flexShrink: 0, display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600,
          color: valueColor || '#1F2937', wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}
 
function EmptyState({ icon, title, subtitle }) {
  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color: '#D1D5DB', fontSize: 40 }}>{icon}</Box>
      <Typography sx={{ fontWeight: 600, color: '#374151' }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{subtitle}</Typography>}
    </Box>
  );
}
 
function ActionButton({ label, icon, onClick, color = '#27235C', disabled, variant = 'outlined', loading }) {
  return (
    <Button variant={variant} size="small" startIcon={loading ? <CircularProgress size={13} color="inherit" /> : icon}
      disabled={disabled || loading} onClick={onClick}
      sx={{
        borderRadius: '9px', fontWeight: 600, fontSize: '0.8rem', px: 2, py: 0.8,
        ...(variant === 'contained'
          ? { backgroundColor: color, color: '#fff', '&:hover': { backgroundColor: color, filter: 'brightness(0.88)' } }
          : { borderColor: color, color, '&:hover': { backgroundColor: color + '12' } }),
        '&:disabled': variant === 'contained' ? { backgroundColor: '#E5E7EB', color: '#9CA3AF' } : {},
      }}>
      {label}
    </Button>
  );
}
 
/* ── DetailsTab ───────────────────────────────────────────────── */
function DetailsTab({ incident }) {
  const rows = [
    { label: 'Incident Number', value: incident.ticketNumber },
    { label: 'Status',          value: <IncidentStatusChip status={incident.status} /> },
    { label: 'Priority',        value: <PriorityBadge priority={incident.priority} /> },
    { label: 'Source',          value: incident.source },
    { label: 'Category',        value: incident.categoryName || (incident.categoryId ? `Category #${incident.categoryId}` : null) },
    { label: 'Sub-Category',    value: incident.subCategoryName || (incident.subCategoryId ? `Sub-Category #${incident.subCategoryId}` : null) },
    { label: 'Requester',       value: incident.requesterName },
    { label: 'Requester Email', value: incident.email },
    { label: 'Assigned To',     value: incident.assignedToName || 'Unassigned' },
    { label: 'Incident Location', value: incident.incidentLocation },
    { label: 'Office Location',   value: incident.officeLocation },
    { label: 'Breach By',       value: incident.breachByUser },
    { label: 'Occurred At',     value: incident.occurredAt ? fmtDate(incident.occurredAt) : null },
    { label: 'Created At',      value: fmtDate(incident.createdAt) },
    { label: 'Last Updated',    value: fmtDate(incident.updatedAt) },
    { label: 'Resolved At',     value: incident.resolvedAt ? fmtDate(incident.resolvedAt) : null },
    { label: 'Closed At',       value: incident.closedAt ? fmtDate(incident.closedAt) : null },
  ].filter(r => r.value !== null && r.value !== undefined && r.value !== '—' && r.value !== '');
 
  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 2,
        textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Incident Details
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', borderColor: '#E5E7EB' }}>
        {rows.map((row, i) => (
          <Stack key={i} direction="row" alignItems="center"
            sx={{ px: 2.5, py: 1.5,
              borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
              '&:hover': { backgroundColor: '#FAFAFA' },
              transition: 'background-color 0.15s' }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 160, flexShrink: 0 }}>
              {row.label}
            </Typography>
            {typeof row.value === 'string'
              ? <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{row.value}</Typography>
              : row.value}
          </Stack>
        ))}
      </Paper>
 
      {incident.description && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5,
            textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Description
          </Typography>
          <Box sx={{ p: 2.5, backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {incident.description}
            </Typography>
          </Box>
        </Box>
      )}
 
      {incident.resolutionNote && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5,
            textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Resolution Notes
          </Typography>
          <Box sx={{ p: 2.5, backgroundColor: '#EDFAF2', borderRadius: '12px', border: '1px solid #B7EAC9' }}>
            <Typography sx={{ fontSize: '0.87rem', color: '#1A5C34', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {incident.resolutionNote}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
 
/* ── ResolutionTab ────────────────────────────────────────────── */
function ResolutionTab({ incident }) {
  if (!incident.resolutionNote) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState icon={<CheckCircleIcon />}
          title="No resolution recorded"
          subtitle="Resolution notes will appear here when the incident is resolved" />
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ p: 2.5, backgroundColor: '#EDFAF2', borderRadius: '12px', border: '1px solid #B7EAC9' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <CheckCircleIcon sx={{ color: '#24A148', fontSize: 18 }} />
          <Typography sx={{ fontWeight: 700, color: '#1A5C34', fontSize: '0.85rem' }}>Resolution</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.87rem', color: '#1A5C34', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {incident.resolutionNote}
        </Typography>
      </Box>
    </Box>
  );
}
 
/* ── ApprovalsTab — incidents skip approvals ──────────────────── */
function ApprovalsTab() {
  return (
    <Box sx={{ p: 3 }}>
      <EmptyState icon={<ThumbUpAltIcon />}
        title="No approvals required"
        subtitle="Incident tickets are directly assigned and do not go through L1/L2 approval" />
    </Box>
  );
}
 
/* ── WorklogTab ───────────────────────────────────────────────── */
function WorklogTab({ history }) {
  if (!history || history.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState icon={<WorkIcon />}
          title="No activity yet"
          subtitle="Status changes and updates will appear here" />
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      {history.map((entry, i) => (
        <Stack key={i} direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27235C', mt: 0.7, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#1F2937' }}>
              {entry.action || entry.status || 'Updated'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              {fmtDate(entry.changedAt || entry.createdAt)}
            </Typography>
            {entry.note && (
              <Typography sx={{ fontSize: '0.82rem', color: '#4B5563', mt: 0.4 }}>{entry.note}</Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Box>
  );
}
 
/* ── ConversationsTab ─────────────────────────────────────────── */
function ConversationsTab({ comments }) {
  return (
    <Box sx={{ p: 3 }}>
      {(!comments || comments.length === 0) ? (
        <EmptyState icon={<ChatBubbleOutlineIcon />}
          title="No conversations yet"
          subtitle="Support notes will appear here" />
      ) : (
        <Box sx={{ mb: 2.5, maxHeight: 460, overflowY: 'auto', pr: 1 }}>
          {comments.map((c, i) => (
            <Stack key={c.id || i} direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
              <Avatar sx={{ width: 34, height: 34, flexShrink: 0,
                background: 'linear-gradient(135deg, #27235C 0%, #524F7D 100%)',
                fontSize: '0.78rem', fontWeight: 700 }}>
                {c.authorName?.[0]?.toUpperCase() ?? 'S'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1F2937' }}>
                    {c.authorName || 'Support'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', ml: 'auto !important' }}>
                    {fmtDate(c.createdAt)}
                  </Typography>
                </Stack>
                <Box sx={{ p: 1.8, borderRadius: '4px 12px 12px 12px',
                  backgroundColor: '#F8F9FF', border: '1px solid #DDE0F7',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <Typography sx={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#374151' }}>
                    {c.comment || c.note || c.message}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          ))}
        </Box>
      )}
    </Box>
  );
}
 
/* ── Reopen Modal ─────────────────────────────────────────────── */
function ReopenModal({ open, onClose, onConfirm, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Reopen Incident</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.88rem', color: '#4B5563' }}>
          Are you sure you want to reopen this incident? The support team will be notified.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: '9px', color: '#6B7280' }}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <ReplayIcon />}
          sx={{ borderRadius: '9px', backgroundColor: '#97247E', '&:hover': { backgroundColor: '#7A1C65' } }}>
          Reopen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 
/* ── Loading Skeleton ─────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Skeleton variant="rounded" width={200} height={36} sx={{ mb: 2, borderRadius: '10px' }} />
      <Paper sx={{ p: 3, borderRadius: '16px', mb: 2 }}>
        <Skeleton variant="rounded" width="55%" height={28} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" width="30%" height={18} />
      </Paper>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
        <Box sx={{ flex: 1 }}><Skeleton variant="rounded" height={380} sx={{ borderRadius: '16px' }} /></Box>
        <Box sx={{ width: { lg: 300 } }}><Skeleton variant="rounded" height={380} sx={{ borderRadius: '16px' }} /></Box>
      </Stack>
    </Box>
  );
}
 
/* ── Resolution Acknowledgement for Incident ─────────────────── */
function IncidentAckSection({ incidentId, onAcknowledged, resolutionNote }) {
  const [loading,      setLoading]      = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error,        setError]        = useState('');
 
  const handleAcknowledge = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${INCIDENT_URL}/api/incidents/${incidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAcknowledged(true);
      onAcknowledged?.();
    } catch (e) {
      setError(e?.message || 'Failed to acknowledge. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  if (acknowledged) {
    return (
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: '12px', mb: 2 }}>
        You have acknowledged this resolution. The incident is now closed.
      </Alert>
    );
  }
 
  return (
    <Paper elevation={0} sx={{ border: '2px solid #24A148', borderRadius: '14px',
      p: 2.5, mb: 2, backgroundColor: '#F0FDF4' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <CheckCircleIcon sx={{ color: '#24A148', fontSize: 22 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#15803D' }}>
          Your incident has been resolved — please acknowledge
        </Typography>
      </Stack>
 
      {resolutionNote ? (
        <Box sx={{ p: 2, mb: 2, borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #D1FAE5' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280',
            textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
            Resolution Message from Support
          </Typography>
          <Typography sx={{ fontSize: '0.87rem', color: '#111827', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {resolutionNote}
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mb: 2 }}>
          The support team has resolved your incident.
        </Typography>
      )}
 
      <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mb: 1.5, lineHeight: 1.5 }}>
        If your issue is fully resolved, click <strong>Acknowledge</strong>.
        If not, use the <strong>Reopen</strong> button above.
      </Typography>
 
      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px' }}>{error}</Alert>}
 
      <Button variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ThumbUpAltIcon />}
        disabled={loading} onClick={handleAcknowledge}
        sx={{ backgroundColor: '#24A148', borderRadius: '9px', fontWeight: 700, fontSize: '0.85rem', px: 3,
          '&:hover': { backgroundColor: '#1A7A35' } }}>
        {loading ? 'Acknowledging...' : 'Acknowledge Resolution'}
      </Button>
    </Paper>
  );
}
 
/* ══════════════════════════════════════════════════════════════ */
/* ── TABS definition ──────────────────────────────────────────── */
const TABS = [
  { label: 'Details',       icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Conversations', icon: <ChatBubbleOutlineIcon fontSize="small" /> },
  { label: 'Resolution',    icon: <CheckCircleIcon fontSize="small" /> },
  { label: 'Approvals',     icon: <ThumbUpAltIcon fontSize="small" /> },
  { label: 'Worklog',       icon: <WorkIcon fontSize="small" /> },
];
 
/* ══════════════════════════════════════════════════════════════ */
export default function IncidentDetailsPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
 
  const [incident,    setIncident]    = useState(null);
  const [tab,         setTab]         = useState(0);
  const [loading,     setLoading]     = useState(true);

  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledged,  setAcknowledged]  = useState(false);

  const [reopenModal, setReopenModal] = useState(false);
  const [reopenLoading, setReopenLoad] = useState(false);
 
  /* ── Load incident ── */
  const loadAll = useCallback(async () => {
    try {
      const data = await incidentApi.getById(id);
      // incidentApi.getById returns data field directly (see apiFetch wrapper)
      setIncident(data?.data ?? data);
    } catch {
      toast.error('Failed to load incident');
    } finally {
      setLoading(false);
    }
  }, [id]);
 
  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      await incidentApi.userAcknowledge(id, { userId: user?.userId });
      setAcknowledged(true);
      toast.success('Resolution acknowledged! Support has been notified.');
      load();
    } catch (e) {
      toast.error('Failed to acknowledge. Please try again.');
    } finally {
      setAcknowledging(false);
    }
  };
  useEffect(() => { loadAll(); }, [loadAll]);
 
  /* ── Reopen ── */
  const handleReopen = async () => {
    setReopenLoad(true);
    try {
      const res = await fetch(`${INCIDENT_URL}/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('Incident reopened');
      setReopenModal(false);
      await loadAll();
    } catch (e) {
      toast.error(e.message || 'Failed to reopen');
    } finally {
      setReopenLoad(false);
    }
  };
 
  /* ── Loading / Error ── */
  if (loading) return <LoadingSkeleton />;
  if (!incident) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error" sx={{ borderRadius: '12px' }}>Incident not found or access denied.</Alert>
    </Box>
  );
 
  const status   = incident.status || 'New';
  const priority = incident.priority?.toUpperCase?.();
  const isResolved = status === 'Resolved';
  const isClosed   = status === 'Closed';
 
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
 
      {/* ── Top Bar ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={() => navigate('/user/tickets')} size="small"
            sx={{ backgroundColor: '#27235C', color: '#fff', borderRadius: '10px',
              width: 36, height: 36, '&:hover': { backgroundColor: '#1B193F' } }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Tickets /</Typography>
          <Typography sx={{ color: '#27235C', fontSize: '0.85rem', fontWeight: 600 }}>
            {incident.ticketNumber}
          </Typography>
        </Stack>
        <Button variant="outlined" startIcon={<DownloadIcon />}
          onClick={() => {
            const rows = [
              ['Field', 'Value'],
              ['Incident Number', incident.ticketNumber || ''],
              ['Subject',         `"${(incident.subject || '').replace(/"/g, '""')}"`],
              ['Status',          status],
              ['Priority',        incident.priority || ''],
              ['Source',          incident.source || ''],
              ['Assigned To',     incident.assignedToName || 'Unassigned'],
              ['Requester',       incident.requesterName || ''],
              ['Created At',      incident.createdAt ? new Date(incident.createdAt).toLocaleString() : ''],
              ['Updated At',      incident.updatedAt ? new Date(incident.updatedAt).toLocaleString() : ''],
            ];
            const csv = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `incident-${incident.ticketNumber || id}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
          sx={{ borderColor: '#27235C', color: '#27235C', borderRadius: '9px',
            fontWeight: 600, fontSize: '0.82rem', '&:hover': { backgroundColor: '#EEF0FF' } }}>
          Export CSV
        </Button>
      </Stack>
 
      {/* ── Incident Header Card ── */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 2.5,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
          {/* Left: Title & meta */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
              {/* Incident number badge */}
              <Box sx={{ display: 'inline-flex', alignItems: 'center',
                px: 1.2, py: 0.3, borderRadius: '6px',
                backgroundColor: '#F8EDFB', border: '1px solid #E0BEDC' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#97247E', fontFamily: 'monospace' }}>
                  {incident.ticketNumber}
                </Typography>
              </Box>
              <IncidentStatusChip status={status} />
              <PriorityBadge priority={incident.priority} />
              {/* Incident type badge */}
              <Chip label="Incident" size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700,
                  color: '#9D174D', backgroundColor: '#FCE7F3', border: 'none' }} />
            </Stack>
 
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827',
              fontSize: { xs: '1.1rem', md: '1.35rem' }, lineHeight: 1.35, mb: 1 }}>
              {incident.subject}
            </Typography>
 
            <Stack direction="row" spacing={2.5} flexWrap="wrap" sx={{ gap: 1 }}>
              {incident.requesterName && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <PersonIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{incident.requesterName}</Box>
                  </Typography>
                </Stack>
              )}
              {incident.createdAt && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    {fmtDate(incident.createdAt)}
                  </Typography>
                </Stack>
              )}
              {incident.source && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <FlagIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    {incident.source}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
 
          {/* Right: Action buttons */}
          <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: 1, flexShrink: 0 }}>
            {isResolved && (
              <ActionButton label="Reopen" icon={<ReplayIcon />}
                color="#97247E" variant="contained"
                onClick={() => setReopenModal(true)} />
            )}
          </Stack>
        </Stack>
      </Paper>
 
      {/* ── Resolution Acknowledgement Banner ── */}
      {(incident.status === 'Pending_User_Ack' || incident.status === 'PENDING_USER_ACK') && (
        <Paper elevation={0} sx={{
          border: '2px solid #24A148', borderRadius: '14px',
          p: 2.5, mb: 2.5, backgroundColor: '#F0FDF4',
        }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <CheckCircleOutlineIcon sx={{ color: '#24A148', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#15803D' }}>
              Your incident has been resolved — please acknowledge
            </Typography>
          </Stack>
 
          {incident.resolutionNotes && (
            <Box sx={{
              p: 2, mb: 2, borderRadius: '8px',
              backgroundColor: '#fff', border: '1px solid #D1FAE5',
            }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                Resolution Message from Support
              </Typography>
              <Typography sx={{ fontSize: '0.87rem', color: '#111827',
                lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {incident.resolutionNotes}
              </Typography>
            </Box>
          )}
 
          <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mb: 1.5 }}>
            If your issue is fully resolved, click <strong>Acknowledge</strong>.
            If not, contact support to reopen.
          </Typography>
 
          {acknowledged ? (
            <Alert severity="success" sx={{ borderRadius: '8px' }}>
              You have acknowledged this resolution. Support has been notified.
            </Alert>
          ) : (
            <Button
              variant="contained"
              startIcon={acknowledging
                ? <CircularProgress size={16} color="inherit" />
                : <ThumbUpAltIcon />}
              disabled={acknowledging}
              onClick={handleAcknowledge}
              sx={{
                backgroundColor: '#24A148', borderRadius: '9px',
                fontWeight: 700, fontSize: '0.85rem', px: 3,
                '&:hover': { backgroundColor: '#1A7A35' },
              }}>
              {acknowledging ? 'Acknowledging...' : 'Acknowledge Resolution'}
            </Button>
          )}
        </Paper>
      )}
 
      {/* ── Resolution Acknowledgement Banner ── */}
      {isResolved && (
        <IncidentAckSection
          incidentId={id}
          resolutionNote={incident.resolutionNote}
          onAcknowledged={loadAll}
        />
      )}
 
      {/* ── Main Layout ── */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start">
 
        {/* ── Center: Tabs ── */}
        <Paper sx={{ flex: 1, borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', minWidth: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: '1px solid #F3F4F6', backgroundColor: '#FAFAFA', minHeight: 46,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                minHeight: 46, py: 0, px: 2, color: '#6B7280', '&.Mui-selected': { color: '#27235C' } },
              '& .MuiTabs-indicator': { backgroundColor: '#27235C', height: 2.5, borderRadius: '2px 2px 0 0' } }}>
            {TABS.map((t, i) => (
              <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />
            ))}
          </Tabs>
 
          {tab === 0 && <DetailsTab incident={incident} />}
          {tab === 1 && <ConversationsTab comments={[]} />}
          {tab === 2 && <ResolutionTab incident={incident} />}
          {tab === 3 && <ApprovalsTab />}
          {tab === 4 && <WorklogTab history={[]} />}
        </Paper>
 
        {/* ── Right Sidebar ── */}
        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
 
          {/* Incident Info */}
          <Paper sx={{ p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
              Incident Info
            </Typography>
            <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />
 
            <SidebarMetaRow icon={<FlagIcon sx={{ fontSize: 15 }} />} label="Status"
              value={<IncidentStatusChip status={status} />} />
            <SidebarMetaRow icon={<WarningAmberIcon sx={{ fontSize: 15 }} />} label="Priority"
              value={<PriorityBadge priority={incident.priority} />} />
            <SidebarMetaRow icon={<PersonIcon sx={{ fontSize: 15 }} />} label="Assigned To"
              value={incident.assignedToName || 'Unassigned'}
              valueColor={incident.assignedToName ? '#1F2937' : '#9CA3AF'} />
            <SidebarMetaRow icon={<GroupIcon sx={{ fontSize: 15 }} />} label="Source"
              value={incident.source} />
            {incident.incidentLocation && (
              <SidebarMetaRow icon={<LocationOnIcon sx={{ fontSize: 15 }} />}
                label="Incident Location" value={incident.incidentLocation} />
            )}
            {incident.officeLocation && (
              <SidebarMetaRow icon={<BusinessIcon sx={{ fontSize: 15 }} />}
                label="Office Location" value={incident.officeLocation} />
            )}
            {incident.occurredAt && (
              <SidebarMetaRow icon={<AccessTimeIcon sx={{ fontSize: 15 }} />}
                label="Occurred At" value={fmtShortDate(incident.occurredAt)} />
            )}
            {incident.resolvedAt && (
              <SidebarMetaRow icon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                label="Resolved At" value={fmtShortDate(incident.resolvedAt)}
                valueColor="#24A148" />
            )}
            {incident.closedAt && (
              <SidebarMetaRow icon={<TaskAltIcon sx={{ fontSize: 15 }} />}
                label="Closed At" value={fmtShortDate(incident.closedAt)} />
            )}
          </Paper>
 
          {/* Requester Card */}
          <Paper sx={{ p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
              Requester
            </Typography>
            <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 40, height: 40,
                background: 'linear-gradient(135deg, #97247E 0%, #C45AA8 100%)',
                fontSize: '0.9rem', fontWeight: 700,
                boxShadow: '0 2px 8px rgba(151,36,126,0.25)' }}>
                {incident.requesterName?.[0]?.toUpperCase() ?? '?'}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.87rem', color: '#111827' }}>
                  {incident.requesterName}
                </Typography>
                {incident.email && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {incident.email}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
 
        </Stack>
      </Stack>
 
      {/* ── Reopen Modal ── */}
      <ReopenModal
        open={reopenModal}
        onClose={() => setReopenModal(false)}
        onConfirm={handleReopen}
        loading={reopenLoading}
      />
 
    </Box>
  );
}