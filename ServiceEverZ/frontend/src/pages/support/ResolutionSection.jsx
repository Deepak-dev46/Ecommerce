import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { tokenUtils } from '../../utils/tokenUtils';
import { useAuth } from '../../context/AuthContext';
 
const ticketClient = axios.create({ baseURL: 'http://localhost:8080', timeout: 15000 });
ticketClient.interceptors.request.use(cfg => {
  const t = tokenUtils.getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
 
export default function ResolveSection({ ticketId, supportPersonId, supportPersonName, onResolved }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { user } = useAuth();
 
  const handleResolve = async () => {
    if (!comment.trim()) { setError('Resolution message is required.'); return; }
    setLoading(true); setError('');
    try {
      await ticketClient.post(`/api/tickets/${ticketId}/resolve`, {
        resolutionMessage: comment.trim(),
        supportPersonId: supportPersonId || null,
        // ✅ FIX: Pass agent name so backend writes real name to ticket_history
        supportPersonName: supportPersonName || null,
      });
      setDone(true);
      setOpen(false);
      onResolved?.();
    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.message || 'Failed to send resolution. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setComment('');
    setError('');
  };
 
  if (done) {
    return (
      <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}
        sx={{ borderRadius: '10px' }}>
        Resolution sent to the user. Awaiting their acknowledgement before you can close the ticket.
      </Alert>
    );
  }
 
  return (
    <>
      <Button
        variant="contained"
        startIcon={<CheckCircleIcon />}
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: '#24A148', borderRadius: '9px', fontWeight: 600,
          '&:hover': { backgroundColor: '#1A7A35' },
        }}
      >
        Resolve Ticket
      </Button>
 
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>
          Resolve Service Ticket
        </DialogTitle>
 
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#4B5563', mb: 2 }}>
            Please provide a resolution note. This message is saved in the ticket
            and emailed to the user. They must acknowledge before you can close.
          </Typography>
          <TextField
            label="Resolution Note"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={e => { setComment(e.target.value); setError(''); }}
            placeholder="Describe what was done to resolve the issue..."
            error={!!error}
            helperText={error}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
 
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ borderRadius: '9px', color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResolve}
            disabled={loading || !comment.trim()}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
            sx={{
              borderRadius: '9px', backgroundColor: '#24A148', fontWeight: 600,
              '&:hover': { backgroundColor: '#1A7A37' },
            }}
          >
            {loading ? 'Sending...' : 'Send Resolution & Notify User'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
  