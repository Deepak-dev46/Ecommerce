// src/pages/itsm/CsatDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, Button, Rating, Tooltip, IconButton,
  Avatar, TablePagination, InputAdornment, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { getCsatDashboard } from '../../api/csatApi';
 
// ── Design Tokens ──────────────────────────────────────────────────────────────
const LIGHT_BG = '#F8FAFC'; 
const CARD_BG = '#FFFFFF';
const CARD_BG_HOVER = '#F1F5F9'; 
const BORDER = '#E2E8F0'; 
const ACCENT = '#6366F1'; 
const ACCENT_LIGHT = '#EEF2FF'; 
const CYAN = '#0EA5E9'; 
const SUCCESS = '#10B981'; 
const WARNING = '#F59E0B'; 
const DANGER = '#EF4444'; 
const TEXT_PRIMARY = '#0F172A'; 
const TEXT_SECONDARY = '#64748B'; 
 
// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (dt) =>
  dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
 
const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
 
const ratingColor = (r) => {
  if (!r) return TEXT_SECONDARY;
  if (r >= 4) return SUCCESS;
  if (r >= 3) return WARNING;
  return DANGER;
};
 
const RATING_LABELS = {
  1: 'Very Dissatisfied', 2: 'Dissatisfied',
  3: 'Neutral', 4: 'Satisfied', 5: 'Very Satisfied',
};
 
export default function CsatDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  // Operational State Filters
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
 
  // Tight Pagination Defaults to save height
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
 
  // Modal Dialog Configuration
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRecord, setModalRecord] = useState(null);
 
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate) params.to = new Date(toDate + 'T23:59:59').toISOString();
      
      const res = await getCsatDashboard(params);
      setData(res.data);
    } catch {
      setError('Failed to load user feedback data records.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);
 
  useEffect(() => { 
    fetchData(); 
  }, []);
 
  const handleClear = () => {
    setSelectedAgent('ALL'); setSelectedCategory('ALL');
    setFromDate(''); setToDate(''); setGlobalSearch('');
    setPage(0);
  };
 
  const handleOpenModal = (record) => {
    setModalRecord(record);
    setModalOpen(true);
  };
 
  const handleCloseModal = () => {
    setModalOpen(false); setModalRecord(null);
  };
 
  // ── Dynamic Unique Options Extractor ─────────────────────────────────────────
  const rawRecords = data?.records || [];
  
  const uniqueAgents = Array.from(new Set(rawRecords.map(r => r.resolvedByName).filter(Boolean))).sort();
  const uniqueCategories = Array.from(new Set(rawRecords.map(r => r.categoryName).filter(Boolean))).sort();
 
  // ── Data Filter Matrix Processing ────────────────────────────────────────────
  const filteredRecords = rawRecords.filter(r => {
    if (selectedAgent !== 'ALL' && r.resolvedByName !== selectedAgent) return false;
    if (selectedCategory !== 'ALL' && r.categoryName !== selectedCategory) return false;
 
    if (!globalSearch) return true;
    const term = globalSearch.toLowerCase();
    return (
      (r.requesterName && r.requesterName.toLowerCase().includes(term)) ||
      (r.ticketNumber && r.ticketNumber.toLowerCase().includes(term)) ||
      (r.resolvedByName && r.resolvedByName.toLowerCase().includes(term)) ||
      (r.comments && r.comments.toLowerCase().includes(term))
    );
  });
 
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  // Compressed Row Input Styles
  const compactInputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#FFFFFF',
      borderRadius: '6px',
      fontSize: '0.8rem',
      height: '32px', // Ultra narrow height execution
      '& fieldset': { borderColor: BORDER },
      '&:hover fieldset': { borderColor: ACCENT },
      '&.Mui-focused fieldset': { borderColor: ACCENT },
    },
    '& .MuiInputLabel-root': { 
      color: TEXT_SECONDARY, 
      fontSize: '0.8rem',
      transform: 'translate(14px, 6px) scale(1)' // Centers label inside shortened frame
    },
    '& .MuiInputLabel-root.Mui-hovered': { color: ACCENT },
    '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink': { 
      transform: 'translate(14px, -7px) scale(0.75)',
      color: ACCENT 
    },
  };
 
  return (
    <Box sx={{ 
      p: 2, 
      background: LIGHT_BG, 
      height: '90vh', 
      // border:'1px solid red',
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', // Strictly forces everything to fit on one screen
      color: TEXT_PRIMARY 
    }}>
      
      {/* ── Slim Header Line ──────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, tracking: '-0.02em' }}>
            Feedback Explorer
          </Typography>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem' }}>
            ITSM Live User Performance Metrics Ledger
          </Typography>
        </Box>
        <IconButton 
          size="small" onClick={fetchData} disabled={loading}
          sx={{ border: `1px solid ${BORDER}`, borderRadius: '6px', backgroundColor: CARD_BG }}
        >
          <RefreshIcon fontSize="inherit" sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
 
      {/* ── Ultra-Thin Horizontal Filter Bar ────────────────────────────── */}
      <Paper elevation={0} sx={{ 
        p: 1, 
        border: `1px solid ${BORDER}`, 
        borderRadius: '8px', 
        mb: 1.5, 
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'nowrap'
      }}>
        <TextField
          placeholder="Quick search..." size="small" value={globalSearch} 
          onChange={e => { setGlobalSearch(e.target.value); setPage(0); }}
          sx={{ ...compactInputSx, flexGrow: 2, minWidth: 160 }}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: TEXT_SECONDARY, fontSize: 16 }} /></InputAdornment>)
          }}
        />
        
        <TextField
          select label="Agent" size="small" value={selectedAgent} 
          onChange={e => { setSelectedAgent(e.target.value); setPage(0); }}
          sx={{ ...compactInputSx, width: 150 }}
        >
          <MenuItem value="ALL">All Staff</MenuItem>
          {uniqueAgents.map(agent => <MenuItem key={agent} value={agent}>{agent}</MenuItem>)}
        </TextField>
 
        <TextField
          select label="Category" size="small" value={selectedCategory} 
          onChange={e => { setSelectedCategory(e.target.value); setPage(0); }}
          sx={{ ...compactInputSx, width: 140 }}
        >
          <MenuItem value="ALL">All Categories</MenuItem>
          {uniqueCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
        </TextField>
 
        <TextField 
          label="From" size="small" type="date" value={fromDate} 
          onChange={e => setFromDate(e.target.value)} 
          InputLabelProps={{ shrink: true }} sx={{ ...compactInputSx, width: 125 }} 
        />
        
        <TextField 
          label="To" size="small" type="date" value={toDate} 
          onChange={e => setToDate(e.target.value)} 
          InputLabelProps={{ shrink: true }} sx={{ ...compactInputSx, width: 125 }} 
        />
 
        <Button 
          size="small" onClick={handleClear} 
          sx={{ textTransform: 'none', color: TEXT_SECONDARY, fontSize: '0.75rem', minWidth: '60px', fontWeight: 600 }}
        >
          Reset
        </Button>
        
        <Button 
          variant="contained" size="small" onClick={fetchData} 
          sx={{ 
            backgroundColor: ACCENT, textTransform: 'none', fontSize: '0.75rem', fontWeight: 600,
            height: '32px', borderRadius: '6px', px: 2, boxShadow: 'none',
            '&:hover': { backgroundColor: '#4F46E5', boxShadow: 'none' } 
          }}
        >
          Search
        </Button>
      </Paper>
 
      {error && <Alert severity="error" sx={{ mb: 1, py: 0, px: 1.5, borderRadius: '6px', '& .MuiAlert-icon': { fontSize: 16 } }}>{error}</Alert>}
 
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress size={30} thickness={4} sx={{ color: ACCENT }} />
        </Box>
      ) : (
        /* ── Screen-Fitted Data Table Ledger ────────────────────────────── */
        <Paper sx={{ 
          border: `1px solid  ${BORDER}`, 
          borderRadius: '10px', 
          overflow: 'hidden', 
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1, // dynamically fills remaining vertical viewport realestate
          minHeight: 0 // ensures container shrinks correctly without pushing out window layout
        }}>
          <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {['Date', 'Ticket', 'Requester', 'Support Staff', 'Category', 'CSAT', 'Comments', 'Inspect'].map((head, i) => (
                    <TableCell 
                      key={i} 
                      sx={{ 
                        color: TEXT_SECONDARY, fontSize: '0.7rem', fontWeight: 700, 
                        textTransform: 'uppercase', borderBottom: `1px solid ${BORDER}`,
                        backgroundColor: '#F8FAFC', py: 1
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
                      No live feedback records matched selections.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record, idx) => (
                    <TableRow key={record.surveyId || idx} hover sx={{ '&:hover': { backgroundColor: CARD_BG_HOVER } }}>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, fontSize: '0.78rem', py: 0.75, color: TEXT_SECONDARY, whiteSpace: 'nowrap' }}>
                        {fmtDate(record.submittedAt)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75 }}>
                        {record.ticketNumber ? (
                          <Chip label={record.ticketNumber} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, borderRadius: '4px', backgroundColor: `${CYAN}12`, color: CYAN }} />
                        ) : (
                          <Typography sx={{ fontSize: '0.72rem', color: TEXT_SECONDARY, fontStyle: 'italic' }}>None</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75, fontWeight: 600, fontSize: '0.8rem' }}>
                        {record.requesterName || (record.anonymous ? 'Anonymous' : 'Unknown')}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75, fontSize: '0.8rem' }}>
                        {record.resolvedByName || '—'}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75 }}>
                        <Chip label={record.categoryName || 'General'} size="small" sx={{ height: 18, fontSize: '0.7rem', backgroundColor: '#F1F5F9', color: TEXT_SECONDARY }} />
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 13, color: ratingColor(record.rating) }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: ratingColor(record.rating) }}>
                            {record.rating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75, maxWidth: 260 }}>
                        <Typography noWrap sx={{ fontSize: '0.78rem', color: record.comments ? TEXT_PRIMARY : TEXT_SECONDARY, fontStyle: record.comments ? 'normal' : 'italic' }}>
                          {record.comments || 'No comment text provided.'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${BORDER}`, py: 0.75 }} align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenModal(record)}
                          sx={{ p: 0.25, color: ACCENT, backgroundColor: `${ACCENT}08`, '&:hover': { backgroundColor: `${ACCENT}15` } }}
                        >
                          <VisibilityIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
 
          <TablePagination
            component="div" count={filteredRecords.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            size="small"
            sx={{ borderTop: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF', '& .MuiTablePagination-toolbar': { minHeight: '36px', height: '36px' } }}
          />
        </Paper>
      )}
 
      {/* ── Compact Descriptive Comment Modal ──────────────────────────── */}
      <Dialog 
        open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '12px', p: 0.5 } }}
      >
        {modalRecord && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ background: `linear-gradient(135deg, ${ACCENT}, #4F46E5)`, width: 36, height: 36, fontSize: '0.9rem' }}>
                  {(modalRecord.requesterName || 'A').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                    {modalRecord.requesterName || (modalRecord.anonymous ? 'Anonymous User' : 'System Record')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: TEXT_SECONDARY }}>
                    Logged: {fmt(modalRecord.submittedAt)}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseModal} size="small" sx={{ color: TEXT_SECONDARY }}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ borderColor: BORDER, p: 2.5 }}>
              <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: '8px', mb: 2, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: TEXT_SECONDARY, textTransform: 'uppercase', mb: 0.5 }}>User Metrics Index</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={modalRecord.rating || 0} readOnly precision={0.5} size="small" />
                    <Typography sx={{ fontWeight: 800, color: ratingColor(modalRecord.rating), fontSize: '0.9rem', ml: 0.5 }}>{modalRecord.rating}/5</Typography>
                  </Box>
                </Box>
                <Chip label={RATING_LABELS[modalRecord.rating] || 'Evaluation'} size="small" sx={{ height: 20, fontSize: '0.7rem', backgroundColor: `${ratingColor(modalRecord.rating)}12`, color: ratingColor(modalRecord.rating), fontWeight: 700 }} />
              </Box>
 
              <Box sx={{ display: 'flex', gap: 4, mb: 2.5, px: 0.5 }}>
                <div>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: TEXT_SECONDARY, textTransform: 'uppercase' }}>Ticket</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 0.25 }}>{modalRecord.ticketNumber || '—'}</Typography>
                </div>
                <div>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: TEXT_SECONDARY, textTransform: 'uppercase' }}>Support Staff</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 0.25 }}>{modalRecord.resolvedByName || '—'}</Typography>
                </div>
                <div>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: TEXT_SECONDARY, textTransform: 'uppercase' }}>Category</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 0.25 }}>{modalRecord.categoryName || '—'}</Typography>
                </div>
              </Box>
 
              <Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: TEXT_SECONDARY, textTransform: 'uppercase', mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}><ChatBubbleOutlineIcon sx={{ fontSize: 12 }} /> Full Customer Verbatim Comment</Typography>
                <Box sx={{ p: 2, borderRadius: '8px', borderLeft: `3px solid ${ratingColor(modalRecord.rating)}`, backgroundColor: '#F8FAFC', maxHeight: '180px', overflowY: 'auto' }}>
                  <Typography sx={{ fontSize: '0.825rem', lineHeight: 1.5, color: TEXT_PRIMARY, whiteSpace: 'pre-wrap' }}>
                    {modalRecord.comments ? `"${modalRecord.comments}"` : 'The customer completed this survey rating submission without leaving an explicit textual description statement background.'}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
 
            <DialogActions sx={{ p: 1.5 }}>
              <Button onClick={handleCloseModal} size="small" sx={{ textTransform: 'none', color: TEXT_SECONDARY, fontWeight: 600, fontSize: '0.8rem' }}>Dismiss View</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
 