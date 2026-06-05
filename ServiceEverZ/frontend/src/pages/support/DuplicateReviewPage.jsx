// /** 

//  * DuplicateReviewPage.jsx 

//  * 

//  * Feature 1 — Merge Duplicate Tickets 

//  * Route: /itsm/duplicates 

//  * 

//  * Auto-detected duplicate pairs awaiting support-agent review. 

//  * Agents can merge or dismiss each pair. 

//  */ 



// import React, { useEffect, useState, useCallback } from 'react'; 

// import { 

//   Box, Paper, Typography, Stack, Chip, Button, Divider, 

//   CircularProgress, Alert, Dialog, DialogTitle, DialogContent, 

//   DialogActions, Tabs, Tab, Badge, Tooltip, IconButton, 

// } from '@mui/material'; 

// import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

// import RefreshIcon from '@mui/icons-material/Refresh'; 

// import MergeTypeIcon from '@mui/icons-material/MergeType'; 

// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; 

// import { useNavigate } from 'react-router-dom'; 

// import toast from 'react-hot-toast'; 

// import { 

//   getPendingDuplicates, 

//   confirmMerge, 

//   dismissDuplicate, 

// } from '../../api/ticketRelationshipApi'; 



// // FIX: read userId from localStorage — not hardcoded 

// const currentUserId = () => Number(localStorage.getItem('userId') ?? 0); 



// // ── Helpers ──────────────────────────────────────────────────────────────────── 

// const fmtDate = (d) => 

//   d 

//     ? new Date(d).toLocaleString('en-US', { 

//         month: 'short', day: 'numeric', year: 'numeric', 

//         hour: '2-digit', minute: '2-digit', 

//       }) 

//     : '—'; 



// function scoreConfig(score) { 

//   if (score >= 90) return { label: 'HIGH MATCH', color: '#E01950', bg: '#FDEDF2' }; 

//   if (score >= 70) return { label: 'MEDIUM MATCH', color: '#E85D26', bg: '#FEF0EB' }; 

//   return { label: 'LOW MATCH', color: '#E2B93B', bg: '#FDF8EC' }; 

// } 



// // ── Confirm Merge Dialog ─────────────────────────────────────────────────────── 

// function ConfirmMergeDialog({ open, onClose, pair, onConfirm, loading }) { 

//   if (!pair) return null; 

//   const orig = pair.originalTicket; 

//   const dup  = pair.duplicateTicket; 

//   return ( 

//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth> 

//       <DialogTitle sx={{ fontWeight: 700, color: '#97247E' }}>Confirm Merge</DialogTitle> 

//       <DialogContent dividers> 

//         <Typography variant="body2" sx={{ mb: 1 }}> 

//           You are about to merge <strong>{dup?.ticketNumber}</strong> into{' '} 

//           <strong>{orig?.ticketNumber}</strong>. 

//         </Typography> 

//         <Box component="ul" sx={{ pl: 2, mt: 1 }}> 

//           <Typography component="li" variant="body2" sx={{ mb: 0.5 }}> 

//             <strong>{dup?.ticketNumber}</strong> will be closed. 

//           </Typography> 

//           <Typography component="li" variant="body2" sx={{ mb: 0.5 }}> 

//             All comments, attachments, and history from{' '} 

//             <strong>{dup?.ticketNumber}</strong> will be copied to{' '} 

//             <strong>{orig?.ticketNumber}</strong>. 

//           </Typography> 

//           <Typography component="li" variant="body2"> 

//             This action cannot be undone. 

//           </Typography> 

//         </Box> 

//       </DialogContent> 

//       <DialogActions sx={{ p: 2, gap: 1 }}> 

//         <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}> 

//           Cancel 

//         </Button> 

//         <Button 

//           variant="contained" 

//           disabled={loading} 

//           onClick={onConfirm} 

//           startIcon={ 

//             loading ? <CircularProgress size={15} color="inherit" /> : <MergeTypeIcon /> 

//           } 

//           sx={{ 

//             bgcolor: '#97247E', 

//             ':hover': { bgcolor: '#7B1C6A' }, 

//             textTransform: 'none', 

//           }} 

//         > 

//           {loading ? 'Merging…' : 'Confirm Merge →'} 

//         </Button> 

//       </DialogActions> 

//     </Dialog> 

//   ); 

// } 



// // ── Single Duplicate Pair Card ───────────────────────────────────────────────── 

// function DuplicatePairCard({ pair, onMerge, onDismiss, mergeLoadingId, dismissLoadingId }) { 

//   const cfg  = scoreConfig(pair.similarityScore ?? 0); 

//   const orig = pair.originalTicket  ?? {}; 

//   const dup  = pair.duplicateTicket ?? {}; 



//   const signals = pair.matchSignals ?? []; 



//   return ( 

//     <Paper 

//       variant="outlined" 

//       sx={{ borderRadius: '14px', overflow: 'hidden', mb: 2, borderColor: '#E5E7EB' }} 

//     > 

//       {/* Header row */} 

//       <Stack 

//         direction="row" 

//         alignItems="center" 

//         justifyContent="space-between" 

//         sx={{ px: 2.5, py: 1.5, bgcolor: cfg.bg, borderBottom: `1px solid ${cfg.color}30` }} 

//       > 

//         <Stack direction="row" spacing={1.5} alignItems="center"> 

//           <Chip 

//             label={cfg.label} 

//             size="small" 

//             sx={{ 

//               bgcolor: cfg.color, 

//               color: '#fff', 

//               fontWeight: 700, 

//               fontSize: '0.7rem', 

//               height: 22, 

//             }} 

//           /> 

//           <Typography sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.85rem' }}> 

//             Score: {pair.similarityScore ?? 0}% 

//           </Typography> 

//         </Stack> 



//         <Stack direction="row" spacing={1}> 

//           <Button 

//             variant="contained" 

//             size="small" 

//             disabled={!!mergeLoadingId || !!dismissLoadingId} 

//             onClick={() => onMerge(pair)} 

//             startIcon={ 

//               mergeLoadingId === pair.id ? ( 

//                 <CircularProgress size={13} color="inherit" /> 

//               ) : ( 

//                 <MergeTypeIcon /> 

//               ) 

//             } 

//             sx={{ 

//               bgcolor: '#97247E', 

//               ':hover': { bgcolor: '#7B1C6A' }, 

//               textTransform: 'none', 

//               fontSize: '0.78rem', 

//             }} 

//           > 

//             Merge 

//           </Button> 

//           <Button 

//             variant="outlined" 

//             size="small" 

//             disabled={!!mergeLoadingId || !!dismissLoadingId} 

//             onClick={() => onDismiss(pair)} 

//             sx={{ 

//               borderColor: '#9CA3AF', 

//               color: '#6B7280', 

//               textTransform: 'none', 

//               fontSize: '0.78rem', 

//             }} 

//           > 

//             {dismissLoadingId === pair.id ? 'Dismissing…' : 'Dismiss'} 

//           </Button> 

//         </Stack> 

//       </Stack> 



//       {/* Side-by-side ticket comparison */} 

//       <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" flexItem />}> 

//         {[ 

//           { ticket: orig, badge: 'ORIGINAL' }, 

//           { ticket: dup,  badge: 'DUPLICATE' }, 

//         ].map(({ ticket, badge }) => ( 

//           <Box key={badge} sx={{ flex: 1, p: 2 }}> 

//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}> 

//               <Chip 

//                 label={badge} 

//                 size="small" 

//                 sx={{ 

//                   bgcolor: badge === 'ORIGINAL' ? '#E3F2FD' : '#FFEBEE', 

//                   color:   badge === 'ORIGINAL' ? '#1565C0' : '#C62828', 

//                   fontWeight: 700, 

//                   fontSize: '0.65rem', 

//                   height: 20, 

//                 }} 

//               /> 

//               <Typography 

//                 sx={{ 

//                   fontWeight: 700, 

//                   color: '#97247E', 

//                   fontSize: '0.82rem', 

//                   fontFamily: 'monospace', 

//                 }} 

//               > 

//                 {ticket.ticketNumber} 

//               </Typography> 

//             </Stack> 



//             <Typography sx={{ fontWeight: 600, fontSize: '0.87rem', mb: 0.5, color: '#111827' }}> 

//               {ticket.subject} 

//             </Typography> 

//             <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}> 

//               User: {ticket.requesterName ?? '—'} 

//             </Typography> 

//             <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}> 

//               Category: {ticket.category ?? '—'} 

//             </Typography> 

//             {ticket.subCategory && ( 

//               <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}> 

//                 Sub-category: {ticket.subCategory} 

//               </Typography> 

//             )} 

//             <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.5 }}> 

//               Created: {fmtDate(ticket.createdAt)} 

//             </Typography> 

//           </Box> 

//         ))} 

//       </Stack> 



//       {/* Match signals row */} 

//       {signals.length > 0 && ( 

//         <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}> 

//           <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mb: 0.8 }}> 

//             Match signals: 

//           </Typography> 

//           <Stack direction="row" flexWrap="wrap" gap={0.8}> 

//             {signals.map((sig) => ( 

//               <Chip 

//                 key={sig.label} 

//                 label={`${sig.matched ? '✓' : '✗'} ${sig.label}`} 

//                 size="small" 

//                 sx={{ 

//                   bgcolor: sig.matched ? '#EDFAF2' : '#F3F4F6', 

//                   color:   sig.matched ? '#24A148'  : '#9CA3AF', 

//                   fontWeight: 600, 

//                   fontSize: '0.7rem', 

//                   height: 22, 

//                 }} 

//               /> 

//             ))} 

//           </Stack> 

//         </Box> 

//       )} 

//     </Paper> 

//   ); 

// } 



// // ── Empty State ──────────────────────────────────────────────────────────────── 

// function EmptyDuplicates() { 

//   return ( 

//     <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}> 

//       <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} /> 

//       <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}> 

//         No duplicates detected 

//       </Typography> 

//       <Typography sx={{ fontSize: '0.85rem', color: '#9CA3AF', textAlign: 'center', maxWidth: 360 }}> 

//         The system will notify you when new duplicates are flagged. 

//       </Typography> 

//     </Stack> 

//   ); 

// } 



// // ── Main Page ────────────────────────────────────────────────────────────────── 

// export default function DuplicateReviewPage() { 

//   const navigate = useNavigate(); 



//   const [pairs, setPairs]               = useState([]); 

//   const [loading, setLoading]           = useState(true); 

//   const [error, setError]               = useState(''); 

//   const [tabValue, setTabValue]         = useState(0); // 0=All, 1=Pending, 2=Reviewed 

//   const [mergeTarget, setMergeTarget]   = useState(null); 

//   const [mergeLoading, setMergeLoading] = useState(false); 

//   const [mergeLoadingId, setMergeLoadingId]     = useState(null); 

//   const [dismissLoadingId, setDismissLoadingId] = useState(null); 



//   const fetchPairs = useCallback(async () => { 

//     setLoading(true); 

//     setError(''); 

//     try { 

//       const { data } = await getPendingDuplicates(); 

//       setPairs(data?.data ?? []); 

//     } catch { 

//       setError('Failed to load duplicate pairs. Please try again.'); 

//     } finally { 

//       setLoading(false); 

//     } 

//   }, []); 



//   useEffect(() => { fetchPairs(); }, [fetchPairs]); 



//   const pendingPairs  = pairs.filter((p) => !p.reviewed); 

//   const reviewedPairs = pairs.filter((p) =>  p.reviewed); 

//   const displayPairs  = tabValue === 0 ? pairs : tabValue === 1 ? pendingPairs : reviewedPairs; 



//   const handleMergeClick   = (pair) => setMergeTarget(pair); 

//   const handleMergeConfirm = async () => { 

//     if (!mergeTarget) return; 

//     setMergeLoading(true); 

//     setMergeLoadingId(mergeTarget.id); 

//     try { 

//       await confirmMerge({ 

//         originalTicketId:  mergeTarget.originalTicket?.id, 

//         duplicateTicketId: mergeTarget.duplicateTicket?.id, 

//         mergedBy: currentUserId(), // FIX: not hardcoded 

//       }); 

//       toast.success( 

//         `${mergeTarget.duplicateTicket?.ticketNumber} merged into ${mergeTarget.originalTicket?.ticketNumber} and closed.` 

//       ); 

//       setMergeTarget(null); 

//       await fetchPairs(); 

//     } catch (e) { 

//       toast.error(e?.response?.data?.message ?? 'Merge failed. Please try again.'); 

//     } finally { 

//       setMergeLoading(false); 

//       setMergeLoadingId(null); 

//     } 

//   }; 



//   const handleDismiss = async (pair) => { 

//     setDismissLoadingId(pair.id); 

//     try { 

//       await dismissDuplicate(pair.id, currentUserId()); // FIX: not hardcoded 

//       toast.success('Duplicate suggestion dismissed.'); 

//       await fetchPairs(); 

//     } catch (e) { 

//       toast.error(e?.response?.data?.message ?? 'Failed to dismiss suggestion.'); 

//     } finally { 

//       setDismissLoadingId(null); 

//     } 

//   }; 



//   return ( 

//     <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}> 

//       {/* Top Bar */} 

//       <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}> 

//         <Stack direction="row" alignItems="center" spacing={1.5}> 

//           <IconButton 

//             onClick={() => navigate('/support/tickets')} 

//             size="small" 

//             sx={{ 

//               backgroundColor: '#27235C', color: '#fff', 

//               borderRadius: '10px', width: 36, height: 36, 

//               '&:hover': { backgroundColor: '#1B193F' }, 

//             }} 

//           > 

//             <ArrowBackIcon fontSize="small" /> 

//           </IconButton> 

//           <Box> 

//             <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}> 

//               Duplicate Ticket Review 

//             </Typography> 

//             <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}> 

//               Auto-detected duplicates awaiting your decision 

//             </Typography> 

//           </Box> 

//         </Stack> 

//         <Tooltip title="Refresh"> 

//           <IconButton 

//             onClick={fetchPairs} 

//             disabled={loading} 

//             sx={{ border: '1px solid #E5E7EB', borderRadius: '10px' }} 

//           > 

//             {loading ? ( 

//               <CircularProgress size={18} sx={{ color: '#97247E' }} /> 

//             ) : ( 

//               <RefreshIcon fontSize="small" /> 

//             )} 

//           </IconButton> 

//         </Tooltip> 

//       </Stack> 



//       {/* Tabs */} 

//       <Paper 

//         sx={{ 

//           borderRadius: '16px', 

//           overflow: 'hidden', 

//           boxShadow: '0 1px 8px rgba(0,0,0,0.06)', 

//           border: '1px solid #E5E7EB', 

//         }} 

//       > 

//         <Stack 

//           direction="row" 

//           alignItems="center" 

//           justifyContent="space-between" 

//           sx={{ px: 2, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFAFA' }} 

//         > 

//           <Tabs 

//             value={tabValue} 

//             onChange={(_, v) => setTabValue(v)} 

//             sx={{ 

//               minHeight: 46, 

//               '& .MuiTab-root': { 

//                 textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', 

//                 minHeight: 46, py: 0, px: 2, color: '#6B7280', 

//                 '&.Mui-selected': { color: '#97247E' }, 

//               }, 

//               '& .MuiTabs-indicator': { 

//                 backgroundColor: '#97247E', height: 2.5, 

//                 borderRadius: '2px 2px 0 0', 

//               }, 

//             }} 

//           > 

//             <Tab label="All" /> 

//             <Tab 

//               label={ 

//                 <Stack direction="row" spacing={0.8} alignItems="center"> 

//                   <span>Pending</span> 

//                   {pendingPairs.length > 0 && ( 

//                     <Chip 

//                       label={pendingPairs.length} 

//                       size="small" 

//                       sx={{ 

//                         bgcolor: '#FFEBEE', color: '#C62828', 

//                         fontWeight: 700, fontSize: '0.65rem', height: 18, 

//                       }} 

//                     /> 

//                   )} 

//                 </Stack> 

//               } 

//             /> 

//             <Tab label="Reviewed" /> 

//           </Tabs> 

//           {pendingPairs.length > 0 && ( 

//             <Chip 

//               label={`${pendingPairs.length} pending`} 

//               size="small" 

//               sx={{ 

//                 bgcolor: '#FFEBEE', color: '#C62828', 

//                 fontWeight: 700, fontSize: '0.72rem', 

//               }} 

//             /> 

//           )} 

//         </Stack> 



//         <Box sx={{ p: 2.5 }}> 

//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} 



//           {loading ? ( 

//             <Stack alignItems="center" py={6}> 

//               <CircularProgress size={28} sx={{ color: '#97247E' }} /> 

//             </Stack> 

//           ) : displayPairs.length === 0 ? ( 

//             <EmptyDuplicates /> 

//           ) : ( 

//             displayPairs.map((pair) => ( 

//               <DuplicatePairCard 

//                 key={pair.id} 

//                 pair={pair} 

//                 onMerge={handleMergeClick} 

//                 onDismiss={handleDismiss} 

//                 mergeLoadingId={mergeLoadingId} 

//                 dismissLoadingId={dismissLoadingId} 

//               /> 

//             )) 

//           )} 

//         </Box> 

//       </Paper> 



//       {/* Confirm Merge Dialog */} 

//       <ConfirmMergeDialog 

//         open={!!mergeTarget} 

//         onClose={() => !mergeLoading && setMergeTarget(null)} 

//         pair={mergeTarget} 

//         onConfirm={handleMergeConfirm} 

//         loading={mergeLoading} 

//       /> 

//     </Box> 

//   ); 

// }
/** 

 * DuplicateReviewPage.jsx 

 * 

 * Feature 1 — Merge Duplicate Tickets 

 * Route: /itsm/duplicates 

 * 

 * Auto-detected duplicate pairs awaiting support-agent review. 

 * Agents can merge or dismiss each pair. 

 */



import React, { useEffect, useState, useCallback } from 'react';

import {

  Box, Paper, Typography, Stack, Chip, Button, Divider,

  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,

  DialogActions, Tabs, Tab, Badge, Tooltip, IconButton,

} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import RefreshIcon from '@mui/icons-material/Refresh';

import MergeTypeIcon from '@mui/icons-material/MergeType';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

import {

  getPendingDuplicates,

  confirmMerge,

  dismissDuplicate,

} from '../../api/ticketRelationshipApi';



// FIX: read userId from localStorage — not hardcoded 

const currentUserId = () => Number(localStorage.getItem('userId') ?? 0);



// ── Helpers ──────────────────────────────────────────────────────────────────── 

const fmtDate = (d) =>

  d

    ? new Date(d).toLocaleString('en-US', {

      month: 'short', day: 'numeric', year: 'numeric',

      hour: '2-digit', minute: '2-digit',

    })

    : '—';



function scoreConfig(score) {

  if (score >= 90) return { label: 'HIGH MATCH', color: '#E01950', bg: '#FDEDF2' };

  if (score >= 70) return { label: 'MEDIUM MATCH', color: '#E85D26', bg: '#FEF0EB' };

  return { label: 'LOW MATCH', color: '#E2B93B', bg: '#FDF8EC' };

}



// ── Confirm Merge Dialog ─────────────────────────────────────────────────────── 

function ConfirmMergeDialog({ open, onClose, pair, onConfirm, loading }) {

  if (!pair) return null;

  const orig = pair.originalTicket;

  const dup = pair.duplicateTicket;

  return (

    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

      <DialogTitle sx={{ fontWeight: 700, color: '#97247E' }}>Confirm Merge</DialogTitle>

      <DialogContent dividers>

        <Typography variant="body2" sx={{ mb: 1 }}>

          You are about to merge <strong>{dup?.ticketNumber}</strong> into{' '}

          <strong>{orig?.ticketNumber}</strong>.

        </Typography>

        <Box component="ul" sx={{ pl: 2, mt: 1 }}>

          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>

            <strong>{dup?.ticketNumber}</strong> will be closed.

          </Typography>

          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>

            All comments, attachments, and history from{' '}

            <strong>{dup?.ticketNumber}</strong> will be copied to{' '}

            <strong>{orig?.ticketNumber}</strong>.

          </Typography>

          <Typography component="li" variant="body2">

            This action cannot be undone.

          </Typography>

        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>

        <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>

          Cancel

        </Button>

        <Button

          variant="contained"

          disabled={loading}

          onClick={onConfirm}

          startIcon={

            loading ? <CircularProgress size={15} color="inherit" /> : <MergeTypeIcon />

          }

          sx={{

            bgcolor: '#97247E',

            ':hover': { bgcolor: '#7B1C6A' },

            textTransform: 'none',

          }}

        >

          {loading ? 'Merging…' : 'Confirm Merge →'}

        </Button>

      </DialogActions>

    </Dialog>

  );

}



// ── Single Duplicate Pair Card ───────────────────────────────────────────────── 

function DuplicatePairCard({ pair, onMerge, onDismiss, mergeLoadingId, dismissLoadingId }) {

  const cfg = scoreConfig(pair.similarityScore ?? 0);

  const orig = pair.originalTicket ?? {};

  const dup = pair.duplicateTicket ?? {};



  const signals = pair.matchSignals ?? [];



  return (

    <Paper

      variant="outlined"

      sx={{ borderRadius: '14px', overflow: 'hidden', mb: 2, borderColor: '#E5E7EB' }}

    >

      {/* Header row */}

      <Stack

        direction="row"

        alignItems="center"

        justifyContent="space-between"

        sx={{ px: 2.5, py: 1.5, bgcolor: cfg.bg, borderBottom: `1px solid ${cfg.color}30` }}

      >

        <Stack direction="row" spacing={1.5} alignItems="center">

          <Chip

            label={cfg.label}

            size="small"

            sx={{

              bgcolor: cfg.color,

              color: '#fff',

              fontWeight: 700,

              fontSize: '0.7rem',

              height: 22,

            }}

          />

          <Typography sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.85rem' }}>

            Score: {pair.similarityScore ?? 0}%

          </Typography>

        </Stack>



        <Stack direction="row" spacing={1}>

          <Button

            variant="contained"

            size="small"

            disabled={!!mergeLoadingId || !!dismissLoadingId}

            onClick={() => onMerge(pair)}

            startIcon={

              mergeLoadingId === pair.id ? (

                <CircularProgress size={13} color="inherit" />

              ) : (

                <MergeTypeIcon />

              )

            }

            sx={{

              bgcolor: '#97247E',

              ':hover': { bgcolor: '#7B1C6A' },

              textTransform: 'none',

              fontSize: '0.78rem',

            }}

          >

            Merge

          </Button>

          <Button

            variant="outlined"

            size="small"

            disabled={!!mergeLoadingId || !!dismissLoadingId}

            onClick={() => onDismiss(pair)}

            sx={{

              borderColor: '#9CA3AF',

              color: '#6B7280',

              textTransform: 'none',

              fontSize: '0.78rem',

            }}

          >

            {dismissLoadingId === pair.id ? 'Dismissing…' : 'Dismiss'}

          </Button>

        </Stack>

      </Stack>



      {/* Side-by-side ticket comparison */}

      <Stack direction={{ xs: 'column', sm: 'row' }} divider={<Divider orientation="vertical" flexItem />}>

        {[

          { ticket: orig, badge: 'ORIGINAL' },

          { ticket: dup, badge: 'DUPLICATE' },

        ].map(({ ticket, badge }) => (

          <Box key={badge} sx={{ flex: 1, p: 2 }}>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>

              <Chip

                label={badge}

                size="small"

                sx={{

                  bgcolor: badge === 'ORIGINAL' ? '#E3F2FD' : '#FFEBEE',

                  color: badge === 'ORIGINAL' ? '#1565C0' : '#C62828',

                  fontWeight: 700,

                  fontSize: '0.65rem',

                  height: 20,

                }}

              />

              <Typography

                sx={{

                  fontWeight: 700,

                  color: '#97247E',

                  fontSize: '0.82rem',

                  fontFamily: 'monospace',

                }}

              >

                {ticket.ticketNumber}

              </Typography>

            </Stack>



            <Typography sx={{ fontWeight: 600, fontSize: '0.87rem', mb: 0.5, color: '#111827' }}>

              {ticket.subject}

            </Typography>

            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}>

              User: {ticket.requesterName ?? '—'}

            </Typography>

            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}>

              Category: {ticket.category ?? '—'}

            </Typography>

            {ticket.subCategory && (

              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mb: 0.3 }}>

                Sub-category: {ticket.subCategory}

              </Typography>

            )}

            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.5 }}>

              Created: {fmtDate(ticket.createdAt)}

            </Typography>

          </Box>

        ))}

      </Stack>



      {/* Match signals row */}

      {signals.length > 0 && (

        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>

          <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mb: 0.8 }}>

            Match signals:

          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={0.8}>

            {signals.map((sig) => (

              <Chip

                key={sig.label}

                label={`${sig.matched ? '✓' : '✗'} ${sig.label}`}

                size="small"

                sx={{

                  bgcolor: sig.matched ? '#EDFAF2' : '#F3F4F6',

                  color: sig.matched ? '#24A148' : '#9CA3AF',

                  fontWeight: 600,

                  fontSize: '0.7rem',

                  height: 22,

                }}

              />

            ))}

          </Stack>

        </Box>

      )}

    </Paper>

  );

}



// ── Empty State ──────────────────────────────────────────────────────────────── 

function EmptyDuplicates() {

  return (

    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>

      <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />

      <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>

        No duplicates detected

      </Typography>

      <Typography sx={{ fontSize: '0.85rem', color: '#9CA3AF', textAlign: 'center', maxWidth: 360 }}>

        The system will notify you when new duplicates are flagged.

      </Typography>

    </Stack>

  );

}



// ── Main Page ────────────────────────────────────────────────────────────────── 

export default function DuplicateReviewPage() {

  const navigate = useNavigate();



  const [pairs, setPairs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [tabValue, setTabValue] = useState(0); // 0=All, 1=Pending, 2=Reviewed 

  const [mergeTarget, setMergeTarget] = useState(null);

  const [mergeLoading, setMergeLoading] = useState(false);

  const [mergeLoadingId, setMergeLoadingId] = useState(null);

  const [dismissLoadingId, setDismissLoadingId] = useState(null);



  // const fetchPairs = useCallback(async () => { 

  //   setLoading(true); 

  //   setError(''); 

  //   try { 

  //     const { data } = await getPendingDuplicates(); 

  //     setPairs(data?.data ?? []); 

  //   } catch { 

  //     setError('Failed to load duplicate pairs. Please try again.'); 

  //   } finally { 

  //     setLoading(false); 

  //   } 

  // }, []); 


  const removeDuplicatePairs = (pairs) => {
    const seen = new Set();

    return pairs.filter((pair) => {
      const a = pair.originalTicket?.ticketId;
      const b = pair.duplicateTicket?.ticketId;

      const key = [Math.min(a, b), Math.max(a, b)].join("-");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  };

  const fetchPairs = useCallback(async () => {

    setLoading(true);

    setError('');

    try {

      const { data } = await getPendingDuplicates();

      const cleaned = removeDuplicatePairs(
        data?.data ?? []
      );

      setPairs(cleaned);

    } catch {

      setError('Failed to load duplicate pairs. Please try again.');

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => { fetchPairs(); }, [fetchPairs]);



  const pendingPairs = pairs.filter((p) => !p.reviewed);

  const reviewedPairs = pairs.filter((p) => p.reviewed);

  const displayPairs = tabValue === 0 ? pairs : tabValue === 1 ? pendingPairs : reviewedPairs;



  const handleMergeClick = (pair) => setMergeTarget(pair);

  const handleMergeConfirm = async () => {

    if (!mergeTarget) return;

    setMergeLoading(true);

    setMergeLoadingId(mergeTarget.id);

    try {

      await confirmMerge({

        originalTicketId: mergeTarget.originalTicket?.id,

        duplicateTicketId: mergeTarget.duplicateTicket?.id,

        mergedBy: currentUserId(), // FIX: not hardcoded 

      });

      toast.success(

        `${mergeTarget.duplicateTicket?.ticketNumber} merged into ${mergeTarget.originalTicket?.ticketNumber} and closed.`

      );

      setMergeTarget(null);

      await fetchPairs();

    } catch (e) {

      toast.error(e?.response?.data?.message ?? 'Merge failed. Please try again.');

    } finally {

      setMergeLoading(false);

      setMergeLoadingId(null);

    }

  };



  const handleDismiss = async (pair) => {

    setDismissLoadingId(pair.id);

    try {

      await dismissDuplicate(pair.id, currentUserId()); // FIX: not hardcoded 

      toast.success('Duplicate suggestion dismissed.');

      await fetchPairs();

    } catch (e) {

      toast.error(e?.response?.data?.message ?? 'Failed to dismiss suggestion.');

    } finally {

      setDismissLoadingId(null);

    }

  };



  return (

    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

      {/* Top Bar */}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>

        <Stack direction="row" alignItems="center" spacing={1.5}>

          <IconButton

            onClick={() => navigate('/support/tickets')}

            size="small"

            sx={{

              backgroundColor: '#27235C', color: '#fff',

              borderRadius: '10px', width: 36, height: 36,

              '&:hover': { backgroundColor: '#1B193F' },

            }}

          >

            <ArrowBackIcon fontSize="small" />

          </IconButton>

          <Box>

            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>

              Duplicate Ticket Review

            </Typography>

            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>

              Auto-detected duplicates awaiting your decision

            </Typography>

          </Box>

        </Stack>

        <Tooltip title="Refresh">

          <IconButton

            onClick={fetchPairs}

            disabled={loading}

            sx={{ border: '1px solid #E5E7EB', borderRadius: '10px' }}

          >

            {loading ? (

              <CircularProgress size={18} sx={{ color: '#97247E' }} />

            ) : (

              <RefreshIcon fontSize="small" />

            )}

          </IconButton>

        </Tooltip>

      </Stack>



      {/* Tabs */}

      <Paper

        sx={{

          borderRadius: '16px',

          overflow: 'hidden',

          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',

          border: '1px solid #E5E7EB',

        }}

      >

        <Stack

          direction="row"

          alignItems="center"

          justifyContent="space-between"

          sx={{ px: 2, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFAFA' }}

        >

          <Tabs

            value={tabValue}

            onChange={(_, v) => setTabValue(v)}

            sx={{

              minHeight: 46,

              '& .MuiTab-root': {

                textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',

                minHeight: 46, py: 0, px: 2, color: '#6B7280',

                '&.Mui-selected': { color: '#97247E' },

              },

              '& .MuiTabs-indicator': {

                backgroundColor: '#97247E', height: 2.5,

                borderRadius: '2px 2px 0 0',

              },

            }}

          >

            {/* <Tab label="All" />  */}

            <Tab

              label={

                <Stack direction="row" spacing={0.8} alignItems="center">

                  <span>Pending</span>

                  {pendingPairs.length > 0 && (

                    <Chip

                      label={pendingPairs.length}

                      size="small"

                      sx={{

                        bgcolor: '#FFEBEE', color: '#C62828',

                        fontWeight: 700, fontSize: '0.65rem', height: 18,

                      }}

                    />

                  )}

                </Stack>

              }

            />

            {/* <Tab label="Reviewed" />  */}

          </Tabs>

          {pendingPairs.length > 0 && (

            <Chip

              label={`${pendingPairs.length} pending`}

              size="small"

              sx={{

                bgcolor: '#FFEBEE', color: '#C62828',

                fontWeight: 700, fontSize: '0.72rem',

              }}

            />

          )}

        </Stack>



        <Box sx={{ p: 2.5 }}>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}



          {loading ? (

            <Stack alignItems="center" py={6}>

              <CircularProgress size={28} sx={{ color: '#97247E' }} />

            </Stack>

          ) : displayPairs.length === 0 ? (

            <EmptyDuplicates />

          ) : (

            displayPairs.map((pair) => (

              <DuplicatePairCard

                key={pair.id}

                pair={pair}

                onMerge={handleMergeClick}

                onDismiss={handleDismiss}

                mergeLoadingId={mergeLoadingId}

                dismissLoadingId={dismissLoadingId}

              />

            ))

          )}

        </Box>

      </Paper>



      {/* Confirm Merge Dialog */}

      <ConfirmMergeDialog

        open={!!mergeTarget}

        onClose={() => !mergeLoading && setMergeTarget(null)}

        pair={mergeTarget}

        onConfirm={handleMergeConfirm}

        loading={mergeLoading}

      />

    </Box>

  );

}