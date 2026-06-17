// src/components/reports/ScheduleReportDialog.jsx
// US-96: Schedule a report to be emailed on a recurring basis.
//
// Positive:
//   1. Schedule saved and listed under active schedules.
//   2. ITSM Manager receives confirmation.
//
// Negative:
//   1. No recipients entered → 'At least one recipient is required' shown.
//   2. Invalid email → validation error before saving.
//   3. Email service unavailable → schedule saved, delivery failure flagged.

import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Chip, Stack, Alert, CircularProgress,
  IconButton, Tooltip,
} from '@mui/material';
import CloseIcon         from '@mui/icons-material/Close';
import AddCircleIcon     from '@mui/icons-material/AddCircle';
import ScheduleSendIcon  from '@mui/icons-material/ScheduleSend';
import { createReportSchedule } from '../../services/reportService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];

const ScheduleReportDialog = ({ open, onClose, reportLabel = '', reportType = '', filterParams = {} }) => {
  const [frequency,    setFrequency]    = useState('WEEKLY');
  const [emailInput,   setEmailInput]   = useState('');
  const [recipients,   setRecipients]   = useState([]);
  const [emailError,   setEmailError]   = useState('');
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [apiError,     setApiError]     = useState(null);

  const reset = useCallback(() => {
    setFrequency('WEEKLY');
    setEmailInput('');
    setRecipients([]);
    setEmailError('');
    setSuccess(null);
    setApiError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Add an email chip
  const addEmail = useCallback(() => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Invalid email format');
      return;
    }
    if (recipients.includes(trimmed)) {
      setEmailError('Email already added');
      return;
    }
    setRecipients(prev => [...prev, trimmed]);
    setEmailInput('');
    setEmailError('');
  }, [emailInput, recipients]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  }, [addEmail]);

  const removeEmail = useCallback((email) => {
    setRecipients(prev => prev.filter(r => r !== email));
  }, []);

  const handleSave = useCallback(async () => {
    // US-96 negative #1: no recipients
    if (recipients.length === 0) {
      setApiError('At least one recipient is required');
      return;
    }

    setSaving(true);
    setApiError(null);
    setSuccess(null);

    try {
      const result = await createReportSchedule({
        reportType,
        frequency,
        recipients,
        filter: filterParams,
      });
      setSuccess(`Schedule saved successfully. Next run: ${
        result.nextRunAt ? new Date(result.nextRunAt).toLocaleString() : 'scheduled'
      }`);
    } catch (err) {
      // US-96 negative #3: email service issues are logged server-side;
      // if the save itself fails, show a user-facing error.
      const msg = err?.response?.data?.message || err?.message || 'Failed to save schedule';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  }, [recipients, reportType, frequency, filterParams]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ScheduleSendIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Schedule Report</Typography>
            {reportLabel && (
              <Typography variant="caption" color="text.secondary">{reportLabel}</Typography>
            )}
          </Box>
        </Stack>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        {success ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>
        ) : (
          <Stack spacing={2.5}>
            {apiError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>
            )}

            {/* Frequency */}
            <FormControl fullWidth size="small">
              <InputLabel>Frequency</InputLabel>
              <Select
                value={frequency}
                label="Frequency"
                onChange={(e) => setFrequency(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {FREQUENCIES.map(f => (
                  <MenuItem key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Recipient emails */}
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                Recipients *
              </Typography>

              {/* Chips for added emails */}
              {recipients.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.75} mb={1.5}>
                  {recipients.map(email => (
                    <Chip
                      key={email}
                      label={email}
                      size="small"
                      onDelete={() => removeEmail(email)}
                      sx={{ fontSize: '0.78rem', bgcolor: 'primary.50', color: 'primary.main', border: '1px solid', borderColor: 'primary.200' }}
                    />
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter email and press Enter"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                  onKeyDown={handleKeyDown}
                  error={!!emailError}
                  helperText={emailError || 'Press Enter or , to add multiple recipients'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Tooltip title="Add email">
                  <IconButton onClick={addEmail} color="primary" sx={{ flexShrink: 0 }}>
                    <AddCircleIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
              The report will be automatically emailed to all recipients at the scheduled time.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, textTransform: 'none' }}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <ScheduleSendIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            {saving ? 'Saving…' : 'Save Schedule'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleReportDialog;
