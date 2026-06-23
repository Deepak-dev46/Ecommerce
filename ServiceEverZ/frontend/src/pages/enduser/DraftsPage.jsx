import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, CircularProgress,
  TextField, Chip, Alert, InputAdornment, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../context/AuthContext';
import CreateTicketWrapper from './CreateTicketWrapper';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteDraft } from '../../api/ticketApi';


const GATEWAY = 'http://localhost:8080';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('sez_token') || ''}` });

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const postJson = async (url, body = {}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  : '—';

const PRIORITY_COLOR = {
  HIGH: { bg: '#FEF0EB', color: '#C2410C' },
  MEDIUM: { bg: '#FEF9C3', color: '#854D0E' },
  LOW: { bg: '#EDFAF2', color: '#166534' },
  CRITICAL: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function DraftsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // const load = useCallback(async () => {
  //   if (!user?.userId) return;
  //   setLoading(true);
  //   setError('');
  //   try {
  //     // const data = await fetchJson(`${GATEWAY}/api/tickets/drafts?userId=${user.userId}`);
  //     // const list = Array.isArray(data) ? data : (data?.data ?? []);
  //     const data = await fetchJson(`${GATEWAY}/api/tickets/my-drafts?userId=${user.userId}`);
  //     // const rawList = Array.isArray(data) ? data : (data?.data ?? []);
  //     const rawList = Array.isArray(data) ? data : (data?.data ?? []);
  //     // Backend already filters draft=true — no extra filter needed
  //     setDrafts(rawList);
  //     const list = rawList.filter(t => t.status === 'DRAFT' || t.status === 'draft');
  //     setDrafts(list);

  //   } catch (e) {
  //     setError('Failed to load drafts: ' + e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [user?.userId]);
  const load = useCallback(async () => {

    if (!user?.userId) return;

    setLoading(true);

    setError('');

    try {

      const data = await fetchJson(

        `${GATEWAY}/api/tickets/my-drafts?userId=${user.userId}`

      );

      // Backend returns List<Ticket> directly — no wrapper

      const list = Array.isArray(data) ? data

        : Array.isArray(data?.data) ? data.data

          : [];

      setDrafts(list);

    } catch (e) {

      setError('Failed to load drafts: ' + e.message);

    } finally {

      setLoading(false);

    }

  }, [user?.userId]);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (ticketId) => {
    setSubmitting(ticketId);
    setError(''); setSuccess('');
    try {
      await postJson(`${GATEWAY}/api/tickets/submit`, { ticketId });
      setSuccess('Draft submitted successfully — pending L1 approval');
      setDrafts(prev => prev.filter(d => (d.id || d.ticketId) !== ticketId));
    } catch (e) {
      setError('Submit failed: ' + e.message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteConfirm = async () => {
    const ticketId = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeleting(ticketId);
    try {
      await deleteDraft(ticketId);
      setDrafts(prev => prev.filter(d => d.ticketId !== ticketId));
      setSuccess('Draft deleted successfully');
    } catch (e) {
      setError('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };


  const filtered = drafts.filter(d =>
    `${d.ticketNumber ?? ''} ${d.subject ?? ''} ${d.category ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#27235C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DraftsIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827' }}>My Drafts</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
            {drafts.length} saved draft{drafts.length !== 1 ? 's' : ''} — submit when ready
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto !important' }}>
          <Button size="small" variant="outlined" onClick={() => navigate('/user/service-catalog')}
            sx={{ borderRadius: '8px', borderColor: '#27235C', color: '#27235C', fontSize: '0.78rem', fontWeight: 600 }}>
            + New Ticket
          </Button>
        </Box>
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}

      <TextField size="small" placeholder="Search drafts by ticket #, subject, category..."
        value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} /></InputAdornment> }}
        sx={{ mb: 2.5, width: { xs: '100%', sm: 340 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#27235C' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 5, borderRadius: '14px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <DraftsIcon sx={{ fontSize: 44, color: '#D1D5DB', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>No drafts saved</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', mb: 2 }}>
            Start a ticket and save it as a draft to resume later
          </Typography>
          <Button variant="contained" size="small" onClick={() => navigate('/user/service-catalog')}
            sx={{ borderRadius: '8px', backgroundColor: '#27235C', fontWeight: 600 }}>
            Create Ticket
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filtered.map(d => {
            // const tid = d.id || d.ticketId;
            const tid = d.ticketId || d.id;
            // const pc  = PRIORITY_COLOR[d.priority] || PRIORITY_COLOR.MEDIUM;
            const priorityStr = typeof d.priority === 'object' ? d.priority?.name?.() : d.priority;
            const pc = PRIORITY_COLOR[priorityStr] || PRIORITY_COLOR.MEDIUM
            return (
              <Paper key={tid} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E5E7EB', borderLeft: '4px solid #27235C', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" sx={{ mb: 0.7 }}>
                      <Chip label={d.ticketNumber || 'DRAFT'} size="small"
                        sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem', backgroundColor: '#EEF0FB', color: '#27235C', height: 22 }} />
                      <Chip label="DRAFT" size="small"
                        sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, backgroundColor: '#F3F4F6', color: '#6B7280' }} />
                      {priorityStr && <Chip label={priorityStr} size="small"
                        sx={{ fontSize: '0.68rem', fontWeight: 600, height: 20, backgroundColor: pc.bg, color: pc.color }} />}
                    </Stack>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', mb: 0.3 }}>
                      {d.subject || '(No subject)'}
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                      {/* {d.category    && <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{d.category}</Typography>}
                      {d.subCategory && <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>· {d.subCategory}</Typography>} */}
                      {(d.category || d.categoryName) && <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{d.category || d.categoryName}</Typography>}
                      {(d.subCategory || d.subCategoryName) && <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>· {d.subCategory || d.subCategoryName}</Typography>}

                      <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        Saved {fmtDate(d.updatedAt || d.createdAt)}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                    <Tooltip title="Edit draft">
                      <IconButton size="small"
                        // onClick={() => navigate(`/user/service-catalog?draftId=${tid}`)}
                        // onClick={() => navigate('/user/service-catalog', {
                        //   state: {
                        //     draftTicket: d,
                        //     category: { id: d.categoryId, name: d.category },
                        //     subcategory: { id: d.subCategoryId, name: d.subCategory },
                        //   }
                        // })}
                        onClick={() => navigate('/user/edit-draft', {
                          state: {
                            draftTicket: d,
                            category: {
                              id: d.categoryId,
                              name: d.categoryName || d.category || '',
                            },
                            subcategory: {
                              id: d.subCategoryId,
                              name: d.subCategoryName || d.subCategory || '',
                            },
                          }
                        })}

                        onClick={() => navigate('/user/edit-draft', {
                          state: {
                            draftTicket: d,
                            // Raw Ticket entity uses categoryId + categoryName
                            category: {
                              id: d.categoryId,
                              name: d.categoryName || d.category || '',
                            },
                            subcategory: {
                              id: d.subCategoryId,
                              name: d.subCategoryName || d.subCategory || '',
                            },
                          }
                        })}
                        sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', '&:hover': { backgroundColor: '#F9FAFB' } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete draft">
                      <IconButton size="small"
                        disabled={deleting === tid}
                        onClick={() => setConfirmDeleteId(tid)}
                        sx={{ border: '1px solid #FEE2E2', borderRadius: '8px', color: '#DC2626', '&:hover': { backgroundColor: '#FEF2F2' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>

                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete Draft</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this draft? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} variant="outlined" sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained"
            sx={{ borderRadius: '8px', backgroundColor: '#DC2626', '&:hover': { backgroundColor: '#B91C1C' } }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
