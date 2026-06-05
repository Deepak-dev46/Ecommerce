// src/pages/feedback/FeedbackFormPage.jsx
// Sub-module 02 — Feedback Form
// Public page — accessed via email link with a ?token= parameter.
// No authentication required.

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Rating, FormControlLabel, Checkbox, CircularProgress,
  Alert, Divider, Chip, Stack
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getSurveyForm, submitFeedback } from '../../api/csatApi';
import toast from 'react-hot-toast';

const RATING_LABELS = {
  1: 'Very Dissatisfied',
  2: 'Dissatisfied',
  3: 'Neutral',
  4: 'Satisfied',
  5: 'Very Satisfied',
};

export default function FeedbackFormPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Pre-filled ticket data (from token)
  const [ticketData, setTicketData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState('');

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(-1);
  const [comments, setComments] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Load token data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenError('Invalid feedback link. Please use the link from your email.');
      setTokenLoading(false);
      return;
    }
    getSurveyForm(token)
      .then(res => { setTicketData(res.data); console.log(token) })
      .catch(() => setTokenError('This feedback link is invalid or has expired.'))
      .finally(() => setTokenLoading(false));
  }, [token]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const body = {
        resolvedById: ticketData?.assigneeId,
        resolvedByName: ticketData?.assigneeName,
        categoryName: ticketData?.categoryName,
        rating,
        comments: comments.trim() || null,
        anonymous,
        // Included only if NOT anonymous
        ...(anonymous ? {
          ticketId: ticketData?.ticketId,
          ticketNumber: ticketData?.ticketNumber,
          requesterName: ticketData?.requesterName,
          requesterUserId: ticketData?.requesterUserId,
        } : {
          ticketId: ticketData?.ticketId,
          ticketNumber: ticketData?.ticketNumber,
          requesterName: ticketData?.requesterName,
          requesterUserId: ticketData?.requesterUserId,
        }),
      };
      await submitFeedback(body);
      setSubmitted(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Your Feedback already Registered!!.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (tokenLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (tokenError) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{tokenError}</Alert>
      </Container>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Thank You for Your Feedback!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your response has been recorded. We appreciate your input and will
            use it to improve our service.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Service Desk Feedback
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Help us improve by rating your recent support experience.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Ticket Info (auto-mapped) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Ticket Details
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`Ticket: ${ticketData?.ticketNumber || 'N/A'}`}
                size="small" variant="outlined" />
              <Chip label={`Category: ${ticketData?.categoryName || 'N/A'}`}
                size="small" variant="outlined" />
            </Box>
            <Typography variant="body2">
              <b>Resolved by:</b> {ticketData?.resolvedByName || 'Support Team'}
            </Typography>
            {!anonymous && (
              <Typography variant="body2">
                <b>Requester:</b> {ticketData?.requesterName || 'N/A'}
              </Typography>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            How would you rate your experience? <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={rating}
              onChange={(_, v) => setRating(v)}
              onChangeActive={(_, v) => setHoverRating(v)}
              size="large"
              emptyIcon={<StarIcon style={{ opacity: 0.4 }} fontSize="inherit" />}
            />
            {(hoverRating !== -1 || rating !== 0) && (
              <Typography variant="body2" color="primary" fontWeight={600}>
                {RATING_LABELS[hoverRating !== -1 ? hoverRating : rating]}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Comments */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Comments (optional)</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Share additional details about your experience..."
            value={comments}
            onChange={e => setComments(e.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
          <Typography variant="caption" color="text.secondary">
            {comments.length}/1000
          </Typography>
        </Box>

        {/* Anonymous toggle */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Submit Anonymously
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  If checked, your name and ticket ID will not be stored with this response.
                </Typography>
              </Box>
            }
          />
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
        )}

        {/* Submit */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!rating || submitting}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Submit Feedback'}
        </Button>

        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Thank you, Service Desk Team
        </Typography>
      </Paper>
    </Container>
  );
}
