/**
 * DuplicateFlagsPage.jsx
 *
 * Feature 1 — Merge Duplicate Tickets
 *
 * A dedicated page (or embeddable panel) for support personnel to review
 * auto-flagged duplicate ticket pairs and confirm or dismiss each one.
 *
 * Route suggestion (add to AppRoutes.jsx under ITSMLayout or SupportLayout):
 *   <Route path="tickets/duplicates" element={<DuplicateFlagsPage />} />
 *
 * Sidebar link suggestion:
 *   Label: "Duplicate Tickets"
 *   Icon:  ContentCopyIcon or MergeTypeIcon
 *   Path:  /itsm/tickets/duplicates  (or /support/tickets/duplicates)
 */

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Chip,
  Button, Divider, Paper, Stack, Tooltip,
} from '@mui/material';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useNavigate } from 'react-router-dom';
import { getPendingDuplicates, confirmMerge, dismissDuplicate } from '../../api/ticketRelationshipApi';

// Score badge colour
const scoreColor = (score) => {
  if (score >= 85) return { bg: '#FFEBEE', color: '#C62828' };
  if (score >= 70) return { bg: '#FFF3E0', color: '#E65100' };
  return { bg: '#F1F8E9', color: '#33691E' };
};

export default function DuplicateFlagsPage() {
  const [flags, setFlags]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  // Assuming userId comes from auth context / localStorage — adjust to match your auth pattern
  const currentUserId = Number(localStorage.getItem('userId') ?? 0);

  const fetchFlags = () => {
    setLoading(true);
    setError('');
    getPendingDuplicates()
      .then((res) => setFlags(res.data?.data ?? []))
      .catch(() => setError('Could not load duplicate flags.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleMerge = async (flag) => {
    try {
      await confirmMerge({
        originalTicketId: flag.originalTicketId,
        duplicateTicketId: flag.duplicateTicketId,
        mergedBy: currentUserId,
      });
      setFeedback(`✅ ${flag.duplicateTicketNumber} merged into ${flag.originalTicketNumber}.`);
      fetchFlags();
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Merge failed.');
    }
  };

  const handleDismiss = async (flag) => {
    try {
      await dismissDuplicate(flag.id, currentUserId);
      setFeedback(`Suggestion dismissed for ${flag.duplicateTicketNumber}.`);
      fetchFlags();
    } catch {
      setError('Dismiss failed.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <MergeTypeIcon sx={{ color: '#97247E', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="#97247E">
            Potential Duplicate Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review auto-flagged pairs and confirm or dismiss the merge.
          </Typography>
        </Box>
      </Box>

      {feedback && (
        <Alert severity="success" onClose={() => setFeedback('')} sx={{ mb: 2 }}>
          {feedback}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#97247E' }} />
        </Box>
      ) : flags.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0E0E0' }}>
          <Typography variant="body1" color="text.secondary">
            🎉 No pending duplicate flags. You're all caught up!
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {flags.map((flag) => {
            const sc = scoreColor(flag.score);
            return (
              <Paper
                key={flag.id}
                elevation={0}
                sx={{ border: '1px solid #E0E0E0', borderRadius: 2, p: 2 }}
              >
                {/* Score + ticket numbers */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Similarity: ${flag.score}%`}
                    size="small"
                    sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: 12 }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {flag.originalTicketNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">←→</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {flag.duplicateTicketNumber}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Flagged on {new Date(flag.createdAt).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title={`View ${flag.originalTicketNumber}`}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'none', borderColor: '#9E9E9E', color: '#555' }}
                      onClick={() => navigate(`/support/tickets/${flag.originalTicketId}`)}
                    >
                      Open Original
                    </Button>
                  </Tooltip>
                  <Tooltip title={`View ${flag.duplicateTicketNumber}`}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'none', borderColor: '#9E9E9E', color: '#555' }}
                      onClick={() => navigate(`/support/tickets/${flag.duplicateTicketId}`)}
                    >
                      Open Duplicate
                    </Button>
                  </Tooltip>

                  <Box sx={{ flex: 1 }} />

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => handleDismiss(flag)}
                    sx={{
                      textTransform: 'none',
                      color: '#757575', borderColor: '#BDBDBD',
                    }}
                  >
                    Not a Duplicate
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => handleMerge(flag)}
                    sx={{
                      textTransform: 'none',
                      bgcolor: '#97247E', ':hover': { bgcolor: '#7B1C6A' },
                    }}
                  >
                    Confirm Merge
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
