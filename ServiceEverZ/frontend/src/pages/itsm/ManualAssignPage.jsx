
// // FILE: src/pages/itsm/ManualAssignPage.jsx

// import { useEffect, useState, useCallback } from 'react';
// import {
//   Box, Typography, Paper, Stack, Button, CircularProgress,
//   Alert, Chip, Tabs, Tab, TextField, InputAdornment,
//   TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
//   TablePagination, Avatar, Divider, Tooltip, Dialog,
//   DialogTitle, DialogContent, DialogActions, LinearProgress,
// } from '@mui/material';
// import AssignmentIndIcon   from '@mui/icons-material/AssignmentInd';
// import RefreshIcon         from '@mui/icons-material/Refresh';
// import SearchIcon          from '@mui/icons-material/Search';
// import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
// import WarningAmberIcon    from '@mui/icons-material/WarningAmber';
// import PersonIcon          from '@mui/icons-material/Person';
// import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
// import { tokenUtils } from '../../utils/tokenUtils';

// /* ══════════════════════════════════════════════════════════════════
//    CONSTANTS
// ══════════════════════════════════════════════════════════════════ */
// const GATEWAY      = 'http://localhost:8080';
// const ASSIGN_URL   = 'http://localhost:8084';
// const INCIDENT_URL = 'http://localhost:8088';

// const BRAND   = '#27235C';
// const ACCENT  = '#97247E';
// const BG_PAGE = '#F4F5F9';

// const PRIORITY_META = {
//   CRITICAL: { label: 'Critical', bg: '#FEE2E2', color: '#991B1B' },
//   HIGH:     { label: 'High',     bg: '#FEF0EB', color: '#C2410C' },
//   MEDIUM:   { label: 'Medium',   bg: '#FEF9C3', color: '#854D0E' },
//   LOW:      { label: 'Low',      bg: '#EDFAF2', color: '#166534' },
// };
// const pm = (p) => PRIORITY_META[(p || '').toUpperCase()] || PRIORITY_META.MEDIUM;

// /* ══════════════════════════════════════════════════════════════════
//    HTTP HELPER
// ══════════════════════════════════════════════════════════════════ */
// const authHeaders = () => ({
//   'Content-Type': 'application/json',
//   Authorization: `Bearer ${tokenUtils.getToken() || ''}`,
// });

// const fetchJson = async (url, opts = {}) => {
//   const res  = await fetch(url, { headers: authHeaders(), ...opts });
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   const json = await res.json();
//   return json?.data !== undefined ? json.data : json;
// };

// /* ══════════════════════════════════════════════════════════════════
//    SMALL SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════ */
// function PriorityChip({ priority }) {
//   if (!priority) return null;
//   const { label, bg, color } = pm(priority);
//   return (
//     <Chip
//       label={label}
//       size="small"
//       sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, bgcolor: bg, color, borderRadius: '5px' }}
//     />
//   );
// }

// /** Colour-coded load chip: green ≤3 | yellow 4-6 | red >6 */
// function LoadChip({ count }) {
//   const bg    = count > 6 ? '#FEE2E2' : count > 3 ? '#FEF9C3' : '#EDFAF2';
//   const color = count > 6 ? '#991B1B' : count > 3 ? '#854D0E' : '#166534';
//   return (
//     <Chip
//       label={`${count} assigned`}
//       size="small"
//       sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, bgcolor: bg, color, borderRadius: '5px' }}
//     />
//   );
// }

// /** Thin progress bar showing load ratio */
// function LoadBar({ count, max = 10 }) {
//   const pct   = Math.min((count / max) * 100, 100);
//   const color = pct > 80 ? 'error' : pct > 50 ? 'warning' : 'success';
//   return (
//     <Tooltip title={`${count} / ${max} tickets`}>
//       <Box sx={{ width: 80 }}>
//         <LinearProgress
//           variant="determinate"
//           value={pct}
//           color={color}
//           sx={{ height: 5, borderRadius: 3 }}
//         />
//       </Box>
//     </Tooltip>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════
//    CONFIRM DIALOG
// ══════════════════════════════════════════════════════════════════ */
// function ConfirmDialog({ open, onClose, onConfirm, item, person, isIncident, assigning }) {
//   const accentColor = isIncident ? ACCENT : BRAND;
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
//       <DialogTitle sx={{ fontWeight: 700, color: accentColor }}>
//         Confirm Assignment
//       </DialogTitle>
//       <DialogContent dividers>
//         <Typography sx={{ fontSize: '0.85rem', color: '#374151', mb: 1.5 }}>
//           You are about to assign:
//         </Typography>
//         <Box sx={{ p: 1.5, bgcolor: '#F8F9FF', borderRadius: '8px', borderLeft: `3px solid ${accentColor}`, mb: 1.5 }}>
//           <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}>
//             {isIncident ? 'INCIDENT' : 'TICKET'}
//           </Typography>
//           <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: accentColor }}>
//             {item?.ticketNumber || `#${item?.id || item?.ticketId || item?.incidentId}`}
//           </Typography>
//           {item?.subject && (
//             <Typography sx={{ fontSize: '0.8rem', color: '#374151', mt: 0.3 }}>{item.subject}</Typography>
//           )}
//         </Box>
//         <Stack direction="row" alignItems="center" spacing={1}>
//           <Avatar sx={{ width: 32, height: 32, bgcolor: accentColor, fontSize: '0.75rem', fontWeight: 700 }}>
//             {(person?.supportPersonName || '?')[0]?.toUpperCase()}
//           </Avatar>
//           <Box>
//             <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{person?.supportPersonName}</Typography>
//             <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
//               Currently {person?.assignedTicketCount ?? 0} ticket(s) assigned
//             </Typography>
//           </Box>
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ px: 3, pb: 2 }}>
//         <Button onClick={onClose} variant="outlined"
//           sx={{ borderColor: '#D1D5DB', color: '#6B7280', borderRadius: '8px', fontWeight: 600 }}>
//           Cancel
//         </Button>
//         <Button
//           variant="contained"
//           onClick={onConfirm}
//           disabled={assigning}
//           startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : <AssignmentIndIcon />}
//           sx={{ borderRadius: '8px', bgcolor: accentColor, fontWeight: 700, '&:hover': { bgcolor: isIncident ? '#7A1C65' : '#1B193F' } }}
//         >
//           {assigning ? 'Assigning…' : 'Confirm'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════
//    ASSIGN PANEL  (shared by tickets & incidents)
// ══════════════════════════════════════════════════════════════════ */
// function AssignPanel({ type }) {
//   const isIncident  = type === 'incident';
//   const accentColor = isIncident ? ACCENT : BRAND;

//   /* ── state ── */
//   const [items,      setItems]      = useState([]);
//   const [personnel,  setPersonnel]  = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [assigning,  setAssigning]  = useState(false);
//   const [success,    setSuccess]    = useState('');
//   const [error,      setError]      = useState('');

//   // ticket table
//   const [ticketSearch, setTicketSearch] = useState('');
//   const [ticketPage,   setTicketPage]   = useState(0);
//   const [ticketRPP,    setTicketRPP]    = useState(8);
//   const [selItem,      setSelItem]      = useState(null);

//   // personnel table
//   const [persSearch, setPersSearch] = useState('');
//   const [persPage,   setPersPage]   = useState(0);
//   const [persRPP,    setPersRPP]    = useState(8);
//   const [selPerson,  setSelPerson]  = useState(null);

//   // confirm dialog
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   /* ── filtered lists ── */
//   const filteredItems = items.filter(t => {
//     const q = ticketSearch.toLowerCase();
//     return !q
//       || (t.ticketNumber  || '').toLowerCase().includes(q)
//       || (t.subject       || '').toLowerCase().includes(q)
//       || (t.requesterName || '').toLowerCase().includes(q);
//   });

//   const filteredPersonnel = personnel.filter(p => {
//     const q = persSearch.toLowerCase();
//     return !q || (p.supportPersonName || '').toLowerCase().includes(q);
//   });

//   /* ── paged slices ── */
//   const pagedItems     = filteredItems.slice(ticketPage * ticketRPP, ticketPage * ticketRPP + ticketRPP);
//   const pagedPersonnel = filteredPersonnel.slice(persPage * persRPP, persPage * persRPP + persRPP);

//   /* ── load data ── */
//   const load = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     setSelItem(null);
//     setSelPerson(null);
//     try {
//       // Items
//       if (isIncident) {
//         const raw  = await fetchJson(`${INCIDENT_URL}/api/incidents/all`);
//         const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
//         setItems(list.filter(i => !i.assignedTo && !i.assignedToName));
//       } else {
//         const raw  = await fetchJson(`${GATEWAY}/api/tickets/allTickets`);
//         const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
//         setItems(list.filter(t => t.status === 'OPEN' && !t.assigneeId && !t.assigneeName));
//       }

//       // Personnel — from assignment-service capacity table (NOT user-service)
//       // Fields: supportPersonId, supportPersonName, assignedTicketCount
//       const capRaw  = await fetchJson(`${ASSIGN_URL}/api/assignments/capacity/all`);
//       const capList = Array.isArray(capRaw)
//         ? capRaw
//         : Array.isArray(capRaw?.data) ? capRaw.data : [];

//       // Sort by load ascending (least busy first)
//       capList.sort((a, b) => (a.assignedTicketCount ?? 0) - (b.assignedTicketCount ?? 0));
//       setPersonnel(capList);

//       setTicketPage(0);
//       setPersPage(0);
//     } catch (e) {
//       setError('Failed to load data: ' + e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [isIncident]);

//   useEffect(() => { load(); }, [load]);

//   /* ── assign ── */
//   const doAssign = async () => {
//     if (!selItem || !selPerson) return;
//     setAssigning(true);
//     setConfirmOpen(false);
//     try {
//       const personName = selPerson.supportPersonName || '';
//       const personId   = selPerson.supportPersonId;

//       if (isIncident) {
//         const iid = selItem.incidentId || selItem.id;
//         await fetchJson(`${INCIDENT_URL}/api/incidents/${iid}`, {
//           method: 'PUT',
//           body: JSON.stringify({
//             assignedTo:     Number(personId),
//             assignedToName: personName,
//             status:         'In Progress',
//           }),
//         });
//       } else {
//         const tid = selItem.id || selItem.ticketId;
//         await fetchJson(`${GATEWAY}/api/tickets/${tid}/assign`, {
//           method: 'PUT',
//           body: JSON.stringify({ assigneeId: personId, assigneeName: personName }),
//         });
//       }

//       const num = selItem.ticketNumber || `#${selItem.id || selItem.ticketId || selItem.incidentId}`;
//       setSuccess(`${isIncident ? 'Incident' : 'Ticket'} ${num} assigned to ${personName} successfully.`);

//       // optimistic remove
//       const itemId = selItem.id || selItem.ticketId || selItem.incidentId;
//       setItems(prev => prev.filter(t => (t.id || t.ticketId || t.incidentId) !== itemId));
//       setSelItem(null);
//       setSelPerson(null);
//     } catch (e) {
//       setError('Assignment failed: ' + e.message);
//     } finally {
//       setAssigning(false);
//     }
//   };

//   /* ── when search changes reset to page 0 ── */
//   const handleTicketSearch = (v) => { setTicketSearch(v); setTicketPage(0); };
//   const handlePersSearch   = (v) => { setPersSearch(v);   setPersPage(0);   };

//   /* ── loading state ── */
//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
//         <CircularProgress sx={{ color: accentColor }} />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       {/* Alerts */}
//       {success && (
//         <Alert severity="success" icon={<CheckCircleIcon />} onClose={() => setSuccess('')}
//           sx={{ mb: 2, borderRadius: '10px' }}>
//           {success}
//         </Alert>
//       )}
//       {error && (
//         <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '10px' }}>
//           {error}
//         </Alert>
//       )}

//       {/* Confirm Dialog */}
//       <ConfirmDialog
//         open={confirmOpen}
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={doAssign}
//         item={selItem}
//         person={selPerson}
//         isIncident={isIncident}
//         assigning={assigning}
//       />

//       {/* ── Summary stats ── */}
//       <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
//         {[
//           { label: 'Unassigned', value: items.length,     color: accentColor },
//           { label: 'Support Staff', value: personnel.length, color: '#27235C' },
//           { label: 'Avg Load',
//             value: personnel.length
//               ? (personnel.reduce((s, p) => s + (p.assignedTicketCount ?? 0), 0) / personnel.length).toFixed(1)
//               : '—',
//             color: '#6B7280' },
//         ].map(s => (
//           <Paper key={s.label} elevation={0}
//             sx={{ flex: 1, p: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', textAlign: 'center' }}>
//             <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.2 }}>
//               {s.value}
//             </Typography>
//             <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mt: 0.3, fontWeight: 500 }}>
//               {s.label}
//             </Typography>
//           </Paper>
//         ))}
//       </Stack>

//       {/* ── Two-column grid ── */}
//       <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">

//         {/* ── LEFT: Ticket / Incident table ── */}
//         <Paper elevation={0} sx={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', minWidth: 0 }}>
//           {/* Header */}
//           <Box sx={{ px: 2.5, py: 1.6, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFAFA',
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: accentColor,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <ConfirmationNumberIcon sx={{ fontSize: 13, color: '#fff' }} />
//               </Box>
//               <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151',
//                 textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//                 Step 1 — Select {isIncident ? 'Incident' : 'Ticket'}
//               </Typography>
//               {items.length > 0 && (
//                 <Chip label={items.length} size="small"
//                   sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700,
//                     bgcolor: accentColor, color: '#fff', borderRadius: '5px' }} />
//               )}
//             </Stack>
//             <Button size="small" onClick={load}
//               startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
//               sx={{ fontSize: '0.72rem', fontWeight: 600, color: accentColor,
//                 borderColor: accentColor, borderRadius: '7px', textTransform: 'none' }}
//               variant="outlined">
//               Refresh
//             </Button>
//           </Box>

//           {/* Search */}
//           <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
//             <TextField size="small" fullWidth placeholder={`Search ${isIncident ? 'incidents' : 'tickets'}…`}
//               value={ticketSearch} onChange={e => handleTicketSearch(e.target.value)}
//               InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
//               sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
//             />
//           </Box>

//           {/* Table */}
//           {items.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
//               <ConfirmationNumberIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
//               <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
//                 No unassigned {isIncident ? 'incidents' : 'tickets'} found
//               </Typography>
//             </Box>
//           ) : (
//             <>
//               <TableContainer>
//                 <Table size="small" sx={{ tableLayout: 'fixed' }}>
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: '#F9FAFB' }}>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em', width: 130 }}>
//                         {isIncident ? 'Incident #' : 'Ticket #'}
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//                         Subject
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em', width: 110 }}>
//                         Requester
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em', width: 80, textAlign: 'center' }}>
//                         Priority
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filteredItems.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#9CA3AF', fontSize: '0.82rem' }}>
//                           No results for "{ticketSearch}"
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       pagedItems.map(t => {
//                         const id  = t.id || t.ticketId || t.incidentId;
//                         const sel = selItem && (selItem.id || selItem.ticketId || selItem.incidentId) === id;
//                         return (
//                           <TableRow key={id} onClick={() => setSelItem(t)}
//                             sx={{
//                               cursor: 'pointer',
//                               bgcolor: sel ? (isIncident ? '#FDF0FB' : '#EEF0FB') : 'transparent',
//                               outline: sel ? `1.5px solid ${accentColor}` : 'none',
//                               outlineOffset: '-1.5px',
//                               '&:hover': { bgcolor: sel ? undefined : '#F9FAFB' },
//                             }}>
//                             <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem',
//                               fontWeight: 700, color: accentColor }}>
//                               {t.ticketNumber || `#${id}`}
//                             </TableCell>
//                             <TableCell sx={{ fontSize: '0.8rem', color: '#374151' }}>
//                               <Tooltip title={t.subject || ''}>
//                                 <Typography noWrap sx={{ fontSize: '0.8rem', maxWidth: 200 }}>
//                                   {t.subject}
//                                 </Typography>
//                               </Tooltip>
//                             </TableCell>
//                             <TableCell sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
//                               <Typography noWrap sx={{ fontSize: '0.75rem' }}>
//                                 {t.requesterName || '—'}
//                               </Typography>
//                             </TableCell>
//                             <TableCell sx={{ textAlign: 'center' }}>
//                               <PriorityChip priority={t.priority} />
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <TablePagination
//                 component="div"
//                 count={filteredItems.length}
//                 page={ticketPage}
//                 rowsPerPage={ticketRPP}
//                 rowsPerPageOptions={[5, 8, 10, 15]}
//                 onPageChange={(_, p) => setTicketPage(p)}
//                 onRowsPerPageChange={e => { setTicketRPP(+e.target.value); setTicketPage(0); }}
//                 sx={{ borderTop: '1px solid #F3F4F6', fontSize: '0.75rem',
//                   '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}
//               />
//             </>
//           )}

//           {/* Selected preview */}
//           {selItem && (
//             <Box sx={{ mx: 2, mb: 2, p: 1.5, bgcolor: isIncident ? '#FFF8FF' : '#F8F9FF',
//               borderRadius: '8px', border: `1px solid ${isIncident ? '#F0D0F0' : '#DDE0F7'}` }}>
//               <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: accentColor,
//                 textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.8 }}>
//                 Selected Preview
//               </Typography>
//               <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
//                 {[
//                   [isIncident ? 'Incident #' : 'Ticket #', selItem.ticketNumber],
//                   ['Subject',    selItem.subject],
//                   ['Requester',  selItem.requesterName],
//                   ['Location',   selItem.location || selItem.incidentLocation],
//                   ['Category',   selItem.category || selItem.source],
//                 ].filter(([, v]) => v).map(([l, v]) => (
//                   <Box key={l}>
//                     <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</Typography>
//                     <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#111827',
//                       fontFamily: l.includes('#') ? 'monospace' : 'inherit' }}>{v}</Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </Box>
//           )}
//         </Paper>

//         {/* ── RIGHT: Personnel table ── */}
//         <Paper elevation={0} sx={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', minWidth: 0 }}>
//           {/* Header */}
//           <Box sx={{ px: 2.5, py: 1.6, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFAFA',
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: BRAND,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <PersonIcon sx={{ fontSize: 13, color: '#fff' }} />
//               </Box>
//               <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151',
//                 textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//                 Step 2 — Select Personnel
//               </Typography>
//             </Stack>
//             <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
//               Sorted by load · Least busy first
//             </Typography>
//           </Box>

//           {/* Search */}
//           <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
//             <TextField size="small" fullWidth placeholder="Search personnel…"
//               value={persSearch} onChange={e => handlePersSearch(e.target.value)}
//               InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
//               sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
//             />
//           </Box>

//           {/* Table */}
//           {personnel.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
//               <PersonIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
//               <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>No support personnel found</Typography>
//               <Typography sx={{ fontSize: '0.75rem', mt: 0.5 }}>Ensure users are registered in the capacity table</Typography>
//             </Box>
//           ) : (
//             <>
//               <TableContainer>
//                 <Table size="small" sx={{ tableLayout: 'fixed' }}>
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: '#F9FAFB' }}>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//                         Name
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em', width: 110, textAlign: 'center' }}>
//                         Load
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
//                         textTransform: 'uppercase', letterSpacing: '0.05em', width: 96, textAlign: 'center' }}>
//                         Status
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filteredPersonnel.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: '#9CA3AF', fontSize: '0.82rem' }}>
//                           No results for "{persSearch}"
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       pagedPersonnel.map(p => {
//                         const pid = p.supportPersonId;
//                         const sel = selPerson?.supportPersonId === pid;
//                         const cnt = p.assignedTicketCount ?? 0;
//                         return (
//                           <TableRow key={pid} onClick={() => setSelPerson(p)}
//                             sx={{
//                               cursor: 'pointer',
//                               bgcolor: sel ? '#EEF0FB' : 'transparent',
//                               outline: sel ? `1.5px solid ${BRAND}` : 'none',
//                               outlineOffset: '-1.5px',
//                               '&:hover': { bgcolor: sel ? undefined : '#F9FAFB' },
//                             }}>
//                             <TableCell>
//                               <Stack direction="row" alignItems="center" spacing={1.2}>
//                                 <Avatar sx={{ width: 30, height: 30, bgcolor: BRAND, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
//                                   {(p.supportPersonName || '?')[0]?.toUpperCase()}
//                                 </Avatar>
//                                 <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
//                                   {p.supportPersonName || `User #${pid}`}
//                                 </Typography>
//                               </Stack>
//                             </TableCell>
//                             <TableCell sx={{ textAlign: 'center' }}>
//                               <Stack alignItems="center" spacing={0.5}>
//                                 <LoadChip count={cnt} />
//                                 <LoadBar count={cnt} />
//                               </Stack>
//                             </TableCell>
//                             <TableCell sx={{ textAlign: 'center' }}>
//                               <Chip
//                                 label={cnt > 8 ? 'Busy' : 'Available'}
//                                 size="small"
//                                 sx={{
//                                   height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: '5px',
//                                   bgcolor: cnt > 8 ? '#FEE2E2' : '#EDFAF2',
//                                   color:   cnt > 8 ? '#991B1B' : '#166534',
//                                 }}
//                               />
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <TablePagination
//                 component="div"
//                 count={filteredPersonnel.length}
//                 page={persPage}
//                 rowsPerPage={persRPP}
//                 rowsPerPageOptions={[5, 8, 10]}
//                 onPageChange={(_, p) => setPersPage(p)}
//                 onRowsPerPageChange={e => { setPersRPP(+e.target.value); setPersPage(0); }}
//                 sx={{ borderTop: '1px solid #F3F4F6', fontSize: '0.75rem',
//                   '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}
//               />
//             </>
//           )}
//         </Paper>
//       </Stack>

//       {/* ── Action bar ── */}
//       <Paper elevation={0}
//         sx={{ mt: 2, p: '14px 20px', border: '1px solid #E5E7EB', borderRadius: '12px',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>

//         {/* Summary */}
//         <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
//           {!selItem && !selPerson && (
//             <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
//               Select a {isIncident ? 'incident' : 'ticket'} and a support person to proceed.
//             </Typography>
//           )}
//           {selItem && (
//             <Box sx={{ px: 1.5, py: 0.5, bgcolor: isIncident ? '#FDF0FB' : '#EEF0FB',
//               borderRadius: '7px', border: `1px solid ${isIncident ? '#F0D0F0' : '#C7CBF0'}` }}>
//               <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: accentColor }}>
//                 {selItem.ticketNumber || `#${selItem.id || selItem.ticketId || selItem.incidentId}`}
//               </Typography>
//             </Box>
//           )}
//           {selItem && selPerson && (
//             <>
//               <Typography sx={{ color: '#D1D5DB', fontWeight: 700 }}>→</Typography>
//               <Stack direction="row" alignItems="center" spacing={0.8}>
//                 <Avatar sx={{ width: 22, height: 22, bgcolor: BRAND, fontSize: '0.62rem', fontWeight: 700 }}>
//                   {(selPerson.supportPersonName || '?')[0]?.toUpperCase()}
//                 </Avatar>
//                 <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
//                   {selPerson.supportPersonName}
//                 </Typography>
//               </Stack>
//             </>
//           )}
//         </Stack>

//         {/* Buttons */}
//         <Stack direction="row" spacing={1.5}>
//           {(selItem || selPerson) && (
//             <Button variant="outlined" size="small"
//               onClick={() => { setSelItem(null); setSelPerson(null); }}
//               sx={{ borderRadius: '8px', borderColor: '#D1D5DB', color: '#6B7280',
//                 fontWeight: 600, fontSize: '0.78rem', textTransform: 'none' }}>
//               Clear
//             </Button>
//           )}
//           <Button
//             variant="contained"
//             disabled={!selItem || !selPerson || assigning}
//             onClick={() => setConfirmOpen(true)}
//             startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : <AssignmentIndIcon />}
//             sx={{
//               borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
//               textTransform: 'none', px: 3,
//               bgcolor: selItem && selPerson ? accentColor : '#D1D5DB',
//               '&:hover': { bgcolor: isIncident ? '#7A1C65' : '#1B193F' },
//               '&:disabled': { bgcolor: '#D1D5DB', color: '#fff' },
//             }}>
//             {assigning ? 'Assigning…' : `Assign ${isIncident ? 'Incident' : 'Ticket'}`}
//           </Button>
//         </Stack>
//       </Paper>
//     </Box>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════
//    ROOT PAGE
// ══════════════════════════════════════════════════════════════════ */
// export default function ManualAssignPage({ defaultTab = 'tickets' }) {
//   const [activeTab, setActiveTab] = useState(defaultTab === 'incidents' ? 1 : 0);

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: BG_PAGE, minHeight: '100vh' }}>

//       {/* Page header */}
//       <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
//         <Box sx={{
//           width: 40, height: 40, borderRadius: '10px',
//           background: `linear-gradient(135deg, ${BRAND} 0%, ${ACCENT} 100%)`,
//           display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//         }}>
//           <AssignmentIndIcon sx={{ color: '#fff', fontSize: 20 }} />
//         </Box>
//         <Box>
//           <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.3 }}>
//             Manual Assign
//           </Typography>
//           <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
//             Assign unassigned tickets and incidents to support personnel
//           </Typography>
//         </Box>
//       </Stack>

//       {/* Tabs */}
//       <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', mb: 2.5 }}>
//         <Tabs
//           value={activeTab}
//           onChange={(_, v) => setActiveTab(v)}
//           sx={{
//             borderBottom: '1px solid #E5E7EB',
//             px: 1,
//             bgcolor: '#FAFAFA',
//             '& .MuiTab-root': { fontSize: '0.82rem', fontWeight: 600, minHeight: 44, textTransform: 'none' },
//             '& .Mui-selected': { color: activeTab === 0 ? BRAND : ACCENT },
//             '& .MuiTabs-indicator': { bgcolor: activeTab === 0 ? BRAND : ACCENT },
//           }}>
//           <Tab
//             label="Service Tickets"
//             icon={<ConfirmationNumberIcon sx={{ fontSize: 16 }} />}
//             iconPosition="start"
//           />
//           <Tab
//             label="Incident Tickets"
//             icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
//             iconPosition="start"
//           />
//         </Tabs>
//       </Paper>

//       {/* Panel — re-mounts on tab switch to reset all state */}
//       <Box key={activeTab}>
//         <AssignPanel type={activeTab === 0 ? 'ticket' : 'incident'} />
//       </Box>
//     </Box>
//   );
// }


// FILE: src/pages/itsm/ManualAssignPage.jsx

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Stack, Button, CircularProgress,
  Alert, Chip, Tabs, Tab, TextField, InputAdornment,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  TablePagination, Avatar, Divider, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress,
} from '@mui/material';
import AssignmentIndIcon   from '@mui/icons-material/AssignmentInd';
import RefreshIcon         from '@mui/icons-material/Refresh';
import SearchIcon          from '@mui/icons-material/Search';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import WarningAmberIcon    from '@mui/icons-material/WarningAmber';
import PersonIcon          from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { tokenUtils } from '../../utils/tokenUtils';

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════ */
const GATEWAY      = 'http://localhost:8080';
const ASSIGN_URL   = 'http://localhost:8080';
const INCIDENT_URL = 'http://localhost:8080';

const BRAND   = '#27235C';
const ACCENT  = '#97247E';
const BG_PAGE = '#F4F5F9';

const PRIORITY_META = {
  CRITICAL: { label: 'Critical', bg: '#FEE2E2', color: '#991B1B' },
  HIGH:     { label: 'High',     bg: '#FEF0EB', color: '#C2410C' },
  MEDIUM:   { label: 'Medium',   bg: '#FEF9C3', color: '#854D0E' },
  LOW:      { label: 'Low',      bg: '#EDFAF2', color: '#166534' },
};
const pm = (p) => PRIORITY_META[(p || '').toUpperCase()] || PRIORITY_META.MEDIUM;

/* ══════════════════════════════════════════════════════════════════
   HTTP HELPER
══════════════════════════════════════════════════════════════════ */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${tokenUtils.getToken() || ''}`,
});

const fetchJson = async (url, opts = {}) => {
  const res  = await fetch(url, { headers: authHeaders(), ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
};

/* ══════════════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
══════════════════════════════════════════════════════════════════ */
function PriorityChip({ priority }) {
  if (!priority) return null;
  const { label, bg, color } = pm(priority);
  return (
    <Chip
      label={label}
      size="small"
      sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, bgcolor: bg, color, borderRadius: '5px' }}
    />
  );
}

/** Colour-coded load chip: green ≤3 | yellow 4-6 | red >6 */
function LoadChip({ count }) {
  const bg    = count > 6 ? '#FEE2E2' : count > 3 ? '#FEF9C3' : '#EDFAF2';
  const color = count > 6 ? '#991B1B' : count > 3 ? '#854D0E' : '#166534';
  return (
    <Chip
      label={`${count} assigned`}
      size="small"
      sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, bgcolor: bg, color, borderRadius: '5px' }}
    />
  );
}

/** Thin progress bar showing load ratio */
function LoadBar({ count, max = 10 }) {
  const pct   = Math.min((count / max) * 100, 100);
  const color = pct > 80 ? 'error' : pct > 50 ? 'warning' : 'success';
  return (
    <Tooltip title={`${count} / ${max} tickets`}>
      <Box sx={{ width: 80 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={color}
          sx={{ height: 5, borderRadius: 3 }}
        />
      </Box>
    </Tooltip>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════════════════════════ */
function ConfirmDialog({ open, onClose, onConfirm, item, person, isIncident, assigning }) {
  const accentColor = isIncident ? ACCENT : BRAND;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: accentColor }}>
        Confirm Assignment
      </DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ fontSize: '0.85rem', color: '#374151', mb: 1.5 }}>
          You are about to assign:
        </Typography>
        <Box sx={{ p: 1.5, bgcolor: '#F8F9FF', borderRadius: '8px', borderLeft: `3px solid ${accentColor}`, mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}>
            {isIncident ? 'INCIDENT' : 'TICKET'}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: accentColor }}>
            {item?.ticketNumber || `#${item?.id || item?.ticketId || item?.incidentId}`}
          </Typography>
          {item?.subject && (
            <Typography sx={{ fontSize: '0.8rem', color: '#374151', mt: 0.3 }}>{item.subject}</Typography>
          )}
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: accentColor, fontSize: '0.75rem', fontWeight: 700 }}>
            {(person?.supportPersonName || '?')[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{person?.supportPersonName}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Currently {person?.assignedTicketCount ?? 0} ticket(s) assigned
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: '#D1D5DB', color: '#6B7280', borderRadius: '8px', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={assigning}
          startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : <AssignmentIndIcon />}
          sx={{ borderRadius: '8px', bgcolor: accentColor, fontWeight: 700, '&:hover': { bgcolor: isIncident ? '#7A1C65' : '#1B193F' } }}
        >
          {assigning ? 'Assigning…' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ASSIGN PANEL  (shared by tickets & incidents)
══════════════════════════════════════════════════════════════════ */
function AssignPanel({ type }) {
  const isIncident  = type === 'incident';
  const accentColor = isIncident ? ACCENT : BRAND;

  /* ── state ── */
  const [items,      setItems]      = useState([]);
  const [personnel,  setPersonnel]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [assigning,  setAssigning]  = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  // ticket table
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketPage,   setTicketPage]   = useState(0);
  const [ticketRPP,    setTicketRPP]    = useState(8);
  const [selItem,      setSelItem]      = useState(null);

  // personnel table
  const [persSearch, setPersSearch] = useState('');
  const [persPage,   setPersPage]   = useState(0);
  const [persRPP,    setPersRPP]    = useState(8);
  const [selPerson,  setSelPerson]  = useState(null);

  // confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ── filtered lists ── */
  const filteredItems = items.filter(t => {
    const q = ticketSearch.toLowerCase();
    return !q
      || (t.ticketNumber  || '').toLowerCase().includes(q)
      || (t.subject       || '').toLowerCase().includes(q)
      || (t.requesterName || '').toLowerCase().includes(q);
  });

  const filteredPersonnel = personnel.filter(p => {
    const q = persSearch.toLowerCase();
    return !q || (p.supportPersonName || '').toLowerCase().includes(q);
  });

  /* ── paged slices ── */
  const pagedItems     = filteredItems.slice(ticketPage * ticketRPP, ticketPage * ticketRPP + ticketRPP);
  const pagedPersonnel = filteredPersonnel.slice(persPage * persRPP, persPage * persRPP + persRPP);

  /* ── load data ── */
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelItem(null);
    setSelPerson(null);
    try {
      // Items
      if (isIncident) {
        const raw  = await fetchJson(`${INCIDENT_URL}/api/incidents/all`);
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setItems(list.filter(i => !i.assignedTo && !i.assignedToName));
      } else {
        const raw  = await fetchJson(`${GATEWAY}/api/tickets/allTickets`);
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setItems(list.filter(t => t.status === 'OPEN' && !t.assigneeId && !t.assigneeName));
      }

      // Personnel — from assignment-service capacity table (NOT user-service)
      // Fields: supportPersonId, supportPersonName, assignedTicketCount
      const capRaw  = await fetchJson(`${ASSIGN_URL}/api/assignments/capacity/all`);
      const capList = Array.isArray(capRaw)
        ? capRaw
        : Array.isArray(capRaw?.data) ? capRaw.data : [];

      // Sort by load ascending (least busy first)
      capList.sort((a, b) => (a.assignedTicketCount ?? 0) - (b.assignedTicketCount ?? 0));
      setPersonnel(capList);

      setTicketPage(0);
      setPersPage(0);
    } catch (e) {
      setError('Failed to load data: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [isIncident]);

  useEffect(() => { load(); }, [load]);

  /* ── assign ── */
  const doAssign = async () => {
    if (!selItem || !selPerson) return;
    setAssigning(true);
    setConfirmOpen(false);
    try {
      const personName = selPerson.supportPersonName || '';
      const personId   = selPerson.supportPersonId;

      if (isIncident) {
        const iid = selItem.incidentId || selItem.id;
        await fetchJson(`${INCIDENT_URL}/api/incidents/${iid}`, {
          method: 'PUT',
          body: JSON.stringify({
            assignedTo:     Number(personId),
            assignedToName: personName,
            status:         'In Progress',
          }),
        });
      } else {
        const tid = selItem.id || selItem.ticketId;
        await fetchJson(`${GATEWAY}/api/tickets/${tid}/assign`, {
          method: 'PUT',
          body: JSON.stringify({ assigneeId: personId, assigneeName: personName }),
        });
      }

      const num = selItem.ticketNumber || `#${selItem.id || selItem.ticketId || selItem.incidentId}`;
      setSuccess(`${isIncident ? 'Incident' : 'Ticket'} ${num} assigned to ${personName} successfully.`);

      // optimistic remove
      const itemId = selItem.id || selItem.ticketId || selItem.incidentId;
      setItems(prev => prev.filter(t => (t.id || t.ticketId || t.incidentId) !== itemId));
      setSelItem(null);
      setSelPerson(null);
    } catch (e) {
      setError('Assignment failed: ' + e.message);
    } finally {
      setAssigning(false);
    }
  };

  /* ── when search changes reset to page 0 ── */
  const handleTicketSearch = (v) => { setTicketSearch(v); setTicketPage(0); };
  const handlePersSearch   = (v) => { setPersSearch(v);   setPersPage(0);   };

  /* ── loading state ── */
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Alerts */}
      {success && (
        <Alert severity="success" icon={<CheckCircleIcon />} onClose={() => setSuccess('')}
          sx={{ mb: 2, borderRadius: '10px' }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doAssign}
        item={selItem}
        person={selPerson}
        isIncident={isIncident}
        assigning={assigning}
      />

      {/* ── Summary stats ── */}
      <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: 'Unassigned', value: items.length,     color: accentColor },
          { label: 'Support Staff', value: personnel.length, color: '#27235C' },
          { label: 'Avg Load',
            value: personnel.length
              ? (personnel.reduce((s, p) => s + (p.assignedTicketCount ?? 0), 0) / personnel.length).toFixed(1)
              : '—',
            color: '#6B7280' },
        ].map(s => (
          <Paper key={s.label} elevation={0}
            sx={{ flex: 1, p: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.2 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mt: 0.3, fontWeight: 500 }}>
              {s.label}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* ── Two-column grid ── */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">

        {/* ── LEFT: Ticket / Incident table ── */}
        <Paper elevation={0} sx={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ px: 2.5, py: 1.6, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFAFA',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: accentColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ConfirmationNumberIcon sx={{ fontSize: 13, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151',
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Step 1 — Select {isIncident ? 'Incident' : 'Ticket'}
              </Typography>
              {items.length > 0 && (
                <Chip label={items.length} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700,
                    bgcolor: accentColor, color: '#fff', borderRadius: '5px' }} />
              )}
            </Stack>
            <Button size="small" onClick={load}
              startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.72rem', fontWeight: 600, color: accentColor,
                borderColor: accentColor, borderRadius: '7px', textTransform: 'none' }}
              variant="outlined">
              Refresh
            </Button>
          </Box>

          {/* Search */}
          <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
            <TextField size="small" fullWidth placeholder={`Search ${isIncident ? 'incidents' : 'tickets'}…`}
              value={ticketSearch} onChange={e => handleTicketSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
            />
          </Box>

          {/* Table */}
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
              <ConfirmationNumberIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                No unassigned {isIncident ? 'incidents' : 'tickets'} found
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em', width: 130 }}>
                        {isIncident ? 'Incident #' : 'Ticket #'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Subject
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em', width: 110 }}>
                        Requester
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em', width: 80, textAlign: 'center' }}>
                        Priority
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#9CA3AF', fontSize: '0.82rem' }}>
                          No results for "{ticketSearch}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedItems.map(t => {
                        const id  = t.id || t.ticketId || t.incidentId;
                        const sel = selItem && (selItem.id || selItem.ticketId || selItem.incidentId) === id;
                        return (
                          <TableRow key={id} onClick={() => setSelItem(t)}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: sel ? (isIncident ? '#FDF0FB' : '#EEF0FB') : 'transparent',
                              outline: sel ? `1.5px solid ${accentColor}` : 'none',
                              outlineOffset: '-1.5px',
                              '&:hover': { bgcolor: sel ? undefined : '#F9FAFB' },
                            }}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem',
                              fontWeight: 700, color: accentColor }}>
                              {t.ticketNumber || `#${id}`}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', color: '#374151' }}>
                              <Tooltip title={t.subject || ''}>
                                <Typography noWrap sx={{ fontSize: '0.8rem', maxWidth: 200 }}>
                                  {t.subject}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              <Typography noWrap sx={{ fontSize: '0.75rem' }}>
                                {t.requesterName || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <PriorityChip priority={t.priority} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredItems.length}
                page={ticketPage}
                rowsPerPage={ticketRPP}
                rowsPerPageOptions={[5, 8, 10, 15]}
                onPageChange={(_, p) => setTicketPage(p)}
                onRowsPerPageChange={e => { setTicketRPP(+e.target.value); setTicketPage(0); }}
                sx={{ borderTop: '1px solid #F3F4F6', fontSize: '0.75rem',
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}
              />
            </>
          )}

          {/* Selected preview */}
          {selItem && (
            <Box sx={{ mx: 2, mb: 2, p: 1.5, bgcolor: isIncident ? '#FFF8FF' : '#F8F9FF',
              borderRadius: '8px', border: `1px solid ${isIncident ? '#F0D0F0' : '#DDE0F7'}` }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: accentColor,
                textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.8 }}>
                Selected Preview
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                {[
                  [isIncident ? 'Incident #' : 'Ticket #', selItem.ticketNumber],
                  ['Subject',    selItem.subject],
                  ['Requester',  selItem.requesterName],
                  ['Location',   selItem.location || selItem.incidentLocation],
                  ['Category',   selItem.category || selItem.source],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <Box key={l}>
                    <Typography sx={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</Typography>
                    <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#111827',
                      fontFamily: l.includes('#') ? 'monospace' : 'inherit' }}>{v}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* ── RIGHT: Personnel table ── */}
        <Paper elevation={0} sx={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ px: 2.5, py: 1.6, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFAFA',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: BRAND,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonIcon sx={{ fontSize: 13, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151',
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Step 2 — Select Personnel
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
              Sorted by load · Least busy first
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
            <TextField size="small" fullWidth placeholder="Search personnel…"
              value={persSearch} onChange={e => handlePersSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
            />
          </Box>

          {/* Table */}
          {personnel.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
              <PersonIcon sx={{ fontSize: 36, opacity: 0.3, mb: 1 }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>No support personnel found</Typography>
              <Typography sx={{ fontSize: '0.75rem', mt: 0.5 }}>Ensure users are registered in the capacity table</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em', width: 110, textAlign: 'center' }}>
                        Load
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.05em', width: 96, textAlign: 'center' }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPersonnel.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: '#9CA3AF', fontSize: '0.82rem' }}>
                          No results for "{persSearch}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedPersonnel.map(p => {
                        const pid = p.supportPersonId;
                        const sel = selPerson?.supportPersonId === pid;
                        const cnt = p.assignedTicketCount ?? 0;
                        return (
                          <TableRow key={pid} onClick={() => setSelPerson(p)}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: sel ? '#EEF0FB' : 'transparent',
                              outline: sel ? `1.5px solid ${BRAND}` : 'none',
                              outlineOffset: '-1.5px',
                              '&:hover': { bgcolor: sel ? undefined : '#F9FAFB' },
                            }}>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1.2}>
                                <Avatar sx={{ width: 30, height: 30, bgcolor: BRAND, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                                  {(p.supportPersonName || '?')[0]?.toUpperCase()}
                                </Avatar>
                                <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
                                  {p.supportPersonName || `User #${pid}`}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Stack alignItems="center" spacing={0.5}>
                                <LoadChip count={cnt} />
                                <LoadBar count={cnt} />
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Chip
                                label={cnt > 8 ? 'Busy' : 'Available'}
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: '5px',
                                  bgcolor: cnt > 8 ? '#FEE2E2' : '#EDFAF2',
                                  color:   cnt > 8 ? '#991B1B' : '#166534',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredPersonnel.length}
                page={persPage}
                rowsPerPage={persRPP}
                rowsPerPageOptions={[5, 8, 10]}
                onPageChange={(_, p) => setPersPage(p)}
                onRowsPerPageChange={e => { setPersRPP(+e.target.value); setPersPage(0); }}
                sx={{ borderTop: '1px solid #F3F4F6', fontSize: '0.75rem',
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}
              />
            </>
          )}
        </Paper>
      </Stack>

      {/* ── Action bar — sticky at viewport bottom ── */}
      <Paper elevation={3}
        sx={{
          position: 'sticky', bottom: 0, zIndex: 10,
          mt: 2, p: '12px 20px',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
          backdropFilter: 'blur(6px)',
          bgcolor: 'rgba(255,255,255,0.97)',
        }}>

        {/* Summary */}
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          {!selItem && !selPerson && (
            <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
              Select a {isIncident ? 'incident' : 'ticket'} and a support person to proceed.
            </Typography>
          )}
          {selItem && (
            <Box sx={{ px: 1.5, py: 0.5, bgcolor: isIncident ? '#FDF0FB' : '#EEF0FB',
              borderRadius: '7px', border: `1px solid ${isIncident ? '#F0D0F0' : '#C7CBF0'}` }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: accentColor }}>
                {selItem.ticketNumber || `#${selItem.id || selItem.ticketId || selItem.incidentId}`}
              </Typography>
            </Box>
          )}
          {selItem && selPerson && (
            <>
              <Typography sx={{ color: '#D1D5DB', fontWeight: 700 }}>→</Typography>
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Avatar sx={{ width: 22, height: 22, bgcolor: BRAND, fontSize: '0.62rem', fontWeight: 700 }}>
                  {(selPerson.supportPersonName || '?')[0]?.toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
                  {selPerson.supportPersonName}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>

        {/* Buttons */}
        <Stack direction="row" spacing={1.5}>
          {(selItem || selPerson) && (
            <Button variant="outlined" size="small"
              onClick={() => { setSelItem(null); setSelPerson(null); }}
              sx={{ borderRadius: '8px', borderColor: '#D1D5DB', color: '#6B7280',
                fontWeight: 600, fontSize: '0.78rem', textTransform: 'none' }}>
              Clear
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!selItem || !selPerson || assigning}
            onClick={() => setConfirmOpen(true)}
            startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : <AssignmentIndIcon />}
            sx={{
              borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
              textTransform: 'none', px: 3,
              bgcolor: selItem && selPerson ? accentColor : '#D1D5DB',
              '&:hover': { bgcolor: isIncident ? '#7A1C65' : '#1B193F' },
              '&:disabled': { bgcolor: '#D1D5DB', color: '#fff' },
            }}>
            {assigning ? 'Assigning…' : `Assign ${isIncident ? 'Incident' : 'Ticket'}`}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════════════ */
export default function ManualAssignPage({ defaultTab = 'tickets' }) {
  const [activeTab, setActiveTab] = useState(defaultTab === 'incidents' ? 1 : 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: BG_PAGE, minHeight: '100vh' }}>

      {/* Page header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '10px',
          background: `linear-gradient(135deg, ${BRAND} 0%, ${ACCENT} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <AssignmentIndIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.3 }}>
            Manual Assign
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
            Assign unassigned tickets and incidents to support personnel
          </Typography>
        </Box>
      </Stack>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid #E5E7EB',
            px: 1,
            bgcolor: '#FAFAFA',
            '& .MuiTab-root': { fontSize: '0.82rem', fontWeight: 600, minHeight: 44, textTransform: 'none' },
            '& .Mui-selected': { color: activeTab === 0 ? BRAND : ACCENT },
            '& .MuiTabs-indicator': { bgcolor: activeTab === 0 ? BRAND : ACCENT },
          }}>
          <Tab
            label="Service Tickets"
            icon={<ConfirmationNumberIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
          <Tab
            label="Incident Tickets"
            icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Panel — re-mounts on tab switch to reset all state */}
      <Box key={activeTab}>
        <AssignPanel type={activeTab === 0 ? 'ticket' : 'incident'} />
      </Box>
    </Box>
  );
}
