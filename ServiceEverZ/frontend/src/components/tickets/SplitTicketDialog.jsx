/**
 * SplitTicketDialog.jsx  — Sprint 5 Feature 2 (v3 UPDATE)
 *
 * Changes in this version:
 *  - AI Suggestion mode REMOVED entirely
 *  - "Assigned Team" field REMOVED — support person only splits, ITSM assigns
 *  - Mandatory top-of-screen popup notifications via react-hot-toast with
 *    custom rich banners (not just text toasts)
 *  - API body updated: children now only carry { subject, description }
 *  - Inline error shown as a top alert banner inside the dialog
 *  - onSplitSuccess now receives the full children array for parent to notify
 *
 * Usage:
 *   <SplitTicketDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     parentTicket={ticket}
 *     currentUserId={userId}
 *     onSplitSuccess={(children) => { ... }}
 *   />
 */

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, IconButton,
  Alert, CircularProgress, Chip, Paper, Stack,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import { splitTicket } from '../../api/ticketRelationshipApi';

// Only subject + description — team assignment is ITSM's responsibility
const EMPTY_CHILD = () => ({ subject: '', description: '' });

// ── Priority colours ───────────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  HIGH:     '#E85D26',
  CRITICAL: '#E01950',
  MEDIUM:   '#E2B93B',
  LOW:      '#24A148',
};

// ── Rich success toast rendered at the top of the screen ──────────────────────
function showSplitSuccessToast(parentTicket, createdChildren) {
  toast.custom(
    (t) => (
      <Box
        sx={{
          minWidth: 360,
          maxWidth: 480,
          bgcolor: '#fff',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid #B7EAC9',
          overflow: 'hidden',
          opacity: t.visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Green top bar */}
        <Box sx={{ height: 4, bgcolor: '#24A148' }} />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <CheckCircleIcon sx={{ color: '#24A148', fontSize: 22, mt: 0.2, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', mb: 0.3 }}>
                Ticket Split Successfully
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mb: 1 }}>
                <strong>{parentTicket?.ticketNumber}</strong> has been split into{' '}
                <strong>{createdChildren.length}</strong> child ticket
                {createdChildren.length !== 1 ? 's' : ''}.
              </Typography>

              {/* Child ticket list */}
              <Stack spacing={0.5}>
                {createdChildren.map((child, i) => (
                  <Stack
                    key={child.id ?? i}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      px: 1.2, py: 0.6,
                      bgcolor: '#F9FAFB',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <Chip
                      label={child.ticketNumber ?? `Child ${i + 1}`}
                      size="small"
                      sx={{
                        bgcolor: '#EDE7F6', color: '#4527A0',
                        fontWeight: 700, fontSize: '0.65rem', height: 18,
                        fontFamily: 'monospace',
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: '#374151', flex: 1 }} noWrap>
                      {child.subject}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 1 }}>
                ITSM team has been notified and will assign support personnel.
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => toast.dismiss(t.id)}
              sx={{ color: '#9CA3AF', p: 0.3 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    ),
    {
      duration: 8000,
      position: 'top-center',
    }
  );
}

// ── Error toast ────────────────────────────────────────────────────────────────
function showSplitErrorToast(message) {
  toast.custom(
    (t) => (
      <Box
        sx={{
          minWidth: 340,
          maxWidth: 440,
          bgcolor: '#fff',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid #FECACA',
          overflow: 'hidden',
          opacity: t.visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Box sx={{ height: 4, bgcolor: '#E01950' }} />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 22, height: 22, borderRadius: '50%',
                bgcolor: '#FEF2F2', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Typography sx={{ color: '#E01950', fontWeight: 700, fontSize: '0.75rem' }}>!</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', mb: 0.2 }}>
                Split Failed
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                {message}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => toast.dismiss(t.id)}
              sx={{ color: '#9CA3AF', p: 0.3 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    ),
    { duration: 6000, position: 'top-center' }
  );
}

// ── Main Dialog ────────────────────────────────────────────────────────────────
export default function SplitTicketDialog({
  open, onClose, parentTicket, currentUserId, onSplitSuccess,
}) {
  const [children, setChildren] = useState([EMPTY_CHILD(), EMPTY_CHILD()]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const updateChild = (idx, field, value) =>
    setChildren((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  const addChild = () => setChildren((prev) => [...prev, EMPTY_CHILD()]);

  const removeChild = (idx) => {
    if (children.length <= 2) return;
    setChildren((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSplit = async () => {
    // Validate: every child must have a subject
    const emptyIdx = children.findIndex((c) => !c.subject.trim());
    if (emptyIdx !== -1) {
      setError(`Child ${emptyIdx + 1} must have a subject.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await splitTicket(parentTicket.id, {
        // No assignedTeam — ITSM assigns after receiving notification
        children: children.map(({ subject, description }) => ({ subject, description })),
        splitBy: currentUserId,
      });
      const createdChildren = res.data?.data ?? [];

      // 1. Rich popup notification at top of screen
      // showSplitSuccessToast(parentTicket, createdChildren);

      // // 2. Propagate to parent page (e.g. to refresh hierarchy / show inline banner)
      // onSplitSuccess?.(createdChildren);

      handleClose();
      toast.success('Split Ticket Done.')
    } catch (e) {
      console.log(e);
      
      const msg = e?.response?.data?.message ?? 'Failed to split ticket. Please try again.';
      setError(msg);
      showSplitErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setChildren([EMPTY_CHILD(), EMPTY_CHILD()]);
      setError('');
      onClose();
    }
  };

  const priorityColor = PRIORITY_COLOR[parentTicket?.priority] ?? '#9CA3AF';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      {/* ── Title ── */}
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #F3F4F6', pb: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: '#F8EDFB', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CallSplitIcon sx={{ color: '#97247E', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#97247E', lineHeight: 1.2 }}>
              Split Ticket — {parentTicket?.ticketNumber}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
              Split this ticket into multiple child tickets
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#9CA3AF' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>

        {/* ── Inline top error banner ── */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ mb: 2, borderRadius: '10px' }}
          >
            {error}
          </Alert>
        )}

        {/* ── Parent info box ── */}
        <Box
          sx={{
            p: 2, mb: 2.5, borderRadius: '10px',
            border: '1px solid #CE93D8', bgcolor: '#FCF0FA',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.68rem', fontWeight: 700, color: '#97247E',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5,
            }}
          >
            Parent Ticket
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography
              sx={{ fontWeight: 700, color: '#97247E', fontSize: '0.82rem', fontFamily: 'monospace' }}
            >
              {parentTicket?.ticketNumber}
            </Typography>
            <Typography
              sx={{ fontWeight: 600, color: '#111827', fontSize: '0.87rem', flex: 1 }}
            >
              {parentTicket?.subject}
            </Typography>
            {parentTicket?.priority && (
              <Chip
                label={parentTicket.priority}
                size="small"
                sx={{
                  bgcolor: `${priorityColor}18`,
                  color: priorityColor,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            )}
            {parentTicket?.status && (
              <Chip
                label={parentTicket.status.replace(/_/g, ' ')}
                size="small"
                sx={{ bgcolor: '#EEF0FB', color: '#27235C', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
              />
            )}
          </Stack>
        </Box>

        {/* ── Child ticket cards ── */}
        {children.map((child, idx) => (
          <Paper
            key={idx}
            variant="outlined"
            sx={{
              p: 2, mb: 2, borderRadius: '10px',
              border: '1px solid #E0E0E0', bgcolor: '#FAFAFA',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Chip
                label={`Child ${idx + 1}`}
                size="small"
                sx={{
                  bgcolor: '#EDE7F6', color: '#4527A0',
                  fontWeight: 700, fontSize: '0.72rem',
                }}
              />
              {children.length > 2 && (
                <Button
                  size="small"
                  onClick={() => removeChild(idx)}
                  startIcon={<RemoveCircleOutlineIcon />}
                  sx={{ color: '#E01950', textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Remove
                </Button>
              )}
            </Stack>

            <Stack spacing={1.5}>
              <TextField
                label="Subject *"
                size="small"
                value={child.subject}
                onChange={(e) => updateChild(idx, 'subject', e.target.value)}
                fullWidth
                placeholder="e.g. VPN Configuration"
                error={error && !child.subject.trim()}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
              <TextField
                label="Description"
                size="small"
                multiline
                rows={2}
                value={child.description}
                onChange={(e) => updateChild(idx, 'description', e.target.value)}
                fullWidth
                placeholder="Describe the scope of this child ticket…"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
              {/* NOTE: Assigned Team removed — assignment is ITSM's responsibility */}
            </Stack>
          </Paper>
        ))}

        {/* ── Add another task ── */}
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={addChild}
          size="small"
          sx={{ color: '#97247E', textTransform: 'none', mb: 2 }}
        >
          + Add Another Task
        </Button>

        {/* ── Inherited fields info banner ── */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          sx={{
            p: 1.5, borderRadius: '8px',
            bgcolor: '#EDE7F6', border: '1px solid #CE93D8',
            mb: 1,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: '#4527A0', mt: 0.2, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#4527A0' }}>
              Each child ticket inherits:{' '}
              <strong>Category · Priority · Requester</strong>
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#6A1B9A', mt: 0.3 }}>
              Team assignment will be handled by the ITSM team after split.
            </Typography>
          </Box>
        </Stack>

      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F3F4F6', gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none', color: '#6B7280' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSplit}
          disabled={loading}
          startIcon={
            loading
              ? <CircularProgress size={16} color="inherit" />
              : <CallSplitIcon />
          }
          sx={{
            bgcolor: '#97247E',
            ':hover': { bgcolor: '#7B1C6A' },
            textTransform: 'none',
            borderRadius: '9px',
            fontWeight: 600,
          }}
        >
          {loading
            ? 'Splitting…'
            : `✂ Split into ${children.length} Ticket${children.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
