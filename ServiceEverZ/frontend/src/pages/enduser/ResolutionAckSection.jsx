import React, { useState } from 'react';
import {
  Box, Button, Typography, CircularProgress, Alert, Paper, Stack,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import axios from 'axios';
import { tokenUtils } from '../../utils/tokenUtils';
 
const ticketClient = axios.create({ baseURL: 'http://localhost:8080', timeout: 15000 });
ticketClient.interceptors.request.use(cfg => {
  const t = tokenUtils.getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
 
export default function ResolutionAckSection({
  ticketId, userId, resolutionNotes, onAcknowledged
}) {
  const [loading,      setLoading]      = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error,        setError]        = useState('');
 
  const handleAcknowledge = async () => {
    setLoading(true); setError('');
    try {
      await ticketClient.post(`/api/tickets/${ticketId}/user-acknowledge`, {
        userId: userId || null,
      });
      setAcknowledged(true);
      onAcknowledged?.();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to acknowledge. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  if (acknowledged) {
    return (
      <Alert severity="success" icon={<CheckCircleOutlineIcon />}
        sx={{ borderRadius: '12px', mb: 2 }}>
        You have acknowledged this resolution. The support team has been notified
        and will close the ticket shortly.
      </Alert>
    );
  }
 
  return (
    <Paper elevation={0} sx={{
      border: '2px solid #24A148', borderRadius: '14px',
      p: 2.5, mb: 2, backgroundColor: '#F0FDF4',
    }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <CheckCircleOutlineIcon sx={{ color: '#24A148', fontSize: 22 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#15803D' }}>
          Your ticket has been resolved — please acknowledge
        </Typography>
      </Stack>
 
      {resolutionNotes ? (
        <Box sx={{
          p: 2, mb: 2, borderRadius: '8px',
          backgroundColor: '#fff', border: '1px solid #D1FAE5',
        }}>
          <Typography sx={{
            fontSize: '0.75rem', fontWeight: 700, color: '#6B7280',
            textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5,
          }}>
            Resolution Message from Support
          </Typography>
          <Typography sx={{
            fontSize: '0.87rem', color: '#111827',
            lineHeight: 1.7, whiteSpace: 'pre-wrap',
          }}>
            {resolutionNotes}
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mb: 2 }}>
          The support team has resolved your ticket.
        </Typography>
      )}
 
      <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mb: 1.5, lineHeight: 1.5 }}>
        If your issue is fully resolved, click <strong>Acknowledge</strong>.
        If not, use the <strong>Reopen</strong> button below.
      </Typography>
 
      {error && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px' }}>{error}</Alert>
      )}
 
      <Button
        variant="contained"
        startIcon={loading
          ? <CircularProgress size={16} color="inherit" />
          : <ThumbUpAltIcon />}
        disabled={loading}
        onClick={handleAcknowledge}
        sx={{
          backgroundColor: '#24A148', borderRadius: '9px',
          fontWeight: 700, fontSize: '0.85rem', px: 3,
          '&:hover': { backgroundColor: '#1A7A35' },
        }}>
        {loading ? 'Acknowledging...' : 'Acknowledge Resolution'}
      </Button>
    </Paper>
  );
}
 
 