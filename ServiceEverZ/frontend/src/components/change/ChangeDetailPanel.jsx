import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Divider, Button, Stack,
  TextField, CircularProgress, Chip, Accordion,
  AccordionSummary, AccordionDetails, MenuItem, Tooltip,
} from '@mui/material';
import CloseIcon        from '@mui/icons-material/Close';
import ExpandMoreIcon   from '@mui/icons-material/ExpandMore';
import SendIcon         from '@mui/icons-material/Send';
import EditIcon         from '@mui/icons-material/Edit';
import DeleteIcon       from '@mui/icons-material/Delete';
import HistoryIcon      from '@mui/icons-material/History';
import CheckIcon        from '@mui/icons-material/Check';
import ReplayIcon       from '@mui/icons-material/Replay';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { ChangeStatusChip, PriorityChip, ChangeTypeChip } from './ChangeStatusChip';
import {
  submitChangePlan, makeDecision, deleteChangePlan, getAuditLogs,
} from '../../api/changeApi';
import toast from '../../utils/toast';

const Section = ({ title, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" sx={{ fontWeight: 700, color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 0.75 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.4 }}>
    <Typography variant="caption" sx={{ color: '#6B7280', minWidth: 140 }}>{label}</Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1A1A1A', textAlign: 'right', flex: 1 }}>
      {value ?? <span style={{ color: '#9CA3AF' }}>—</span>}
    </Typography>
  </Stack>
);

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : null;

// currentUserId: from AuthContext — 1 = default
export default function ChangeDetailPanel({ change, onClose, onRefresh, onEdit, currentUserId = 1, isManager = true }) {
  const [submitting, setSubmitting] = useState(null);
  const [comment, setComment]       = useState('');
  const [auditLogs, setAuditLogs]   = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (!change) return;
    setAuditLoading(true);
    getAuditLogs(change.id)
      .then((r) => setAuditLogs(r.data?.data ?? []))
      .catch(() => setAuditLogs([]))
      .finally(() => setAuditLoading(false));
  }, [change?.id]);

  if (!change) return null;

  const s = change.status;
  const canSubmit = ['DRAFT', 'REVISION_REQUESTED'].includes(s);
  const canEdit   = ['DRAFT', 'REVISION_REQUESTED'].includes(s);
  const canDelete = s === 'DRAFT';
  const canDecide = isManager && s === 'PENDING_APPROVAL';

  const act = async (key, fn, successMsg) => {
    setSubmitting(key);
    try {
      await fn();
      toast.success(successMsg);
      onRefresh?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting('submit');
    try {
      await submitChangePlan(change.id, currentUserId);
      toast.success('Submitted for approval');
      onRefresh?.();
      onClose?.();          // close panel → list page shows clean
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDecision = (decisionValue) =>
    act('decision', () => makeDecision(change.id, { managerId: currentUserId, decision: decisionValue, comment }), 'Decision recorded');

  const handleDelete = () => {
    if (!window.confirm(`Delete change plan "${change.title}"?`)) return;
    act('delete', () => deleteChangePlan(change.id), 'Deleted successfully');
    onClose();
  };

  return (
    <Box sx={{
      width: 440, flexShrink: 0, borderLeft: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#27235C', fontSize: '0.75rem' }}>
              {change.changeNumber}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mt: 0.25, lineHeight: 1.3 }}>
              {change.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
          <ChangeStatusChip status={s} />
          <PriorityChip priority={change.priority} />
          <ChangeTypeChip changeType={change.changeType} />
        </Stack>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        {/* Summary */}
        <Section title="Summary">
          <InfoRow label="Change Number"   value={change.changeNumber} />
          <InfoRow label="Created By (SP)" value={change.createdBySpName ?? change.createdBySpId ?? '—'} />
          <InfoRow label="Planned Start"   value={fmt(change.plannedStartTime)} />
          <InfoRow label="Planned End"     value={fmt(change.plannedEndTime)} />
          <InfoRow label="Submitted At"    value={fmt(change.submittedAt)} />
          <InfoRow label="Decision At"     value={fmt(change.decisionAt)} />
          <InfoRow label="Revisions"       value={change.revisionCount ?? 0} />
          <InfoRow label="Created At"      value={fmt(change.createdAt)} />
        </Section>

        <Divider sx={{ my: 1.5 }} />

        {/* Details */}
        <Section title="Details">
          {[
            ['Description',       change.description],
          ].map(([label, value]) => (
            <Box key={label} sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7280', display: 'block', mb: 0.25 }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: '#374151', whiteSpace: 'pre-wrap', fontSize: '0.78rem' }}>
                {value || <span style={{ color: '#9CA3AF' }}>—</span>}
              </Typography>
            </Box>
          ))}
        </Section>

        {/* Manager comment */}
        {change.managerComment && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Manager Comment">
              <Box sx={{ backgroundColor: '#FEF3C7', borderRadius: 2, p: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#92400E', fontSize: '0.78rem' }}>
                  {change.managerComment}
                </Typography>
              </Box>
            </Section>
          </>
        )}

        {/* Audit Log */}
        <Divider sx={{ my: 1.5 }} />
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 42 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HistoryIcon sx={{ fontSize: 16, color: '#6B7280' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151' }}>
                Audit Log ({auditLogs.length})
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {auditLoading ? (
              <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={20} /></Box>
            ) : auditLogs.length === 0 ? (
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>No audit entries yet.</Typography>
            ) : (
              auditLogs.map((log) => (
                <Box key={log.id} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#27235C' }}>
                      {log.performedByUserName ?? `User #${log.performedByUserId}`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      {fmt(log.performedAt)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                    <Chip label={log.fromStatus ?? 'NEW'} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>→</Typography>
                    <Chip label={log.toStatus} size="small" sx={{ fontSize: '0.6rem', height: 18, backgroundColor: '#EEF2FF', color: '#3730A3' }} />
                    {log.performedByRole && (
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>({log.performedByRole})</Typography>
                    )}
                  </Stack>
                  {log.comment && (
                    <Typography variant="caption" sx={{ color: '#374151', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                      "{log.comment}"
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Actions footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>

        {/* SP actions */}
        {canSubmit && (
          <Button
            fullWidth variant="contained" startIcon={<SendIcon />}
            disabled={submitting === 'submit'}
            onClick={handleSubmit}
            sx={{ mb: 1, backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
          >
            {submitting === 'submit' ? <CircularProgress size={16} color="inherit" /> : 'Submit for Approval'}
          </Button>
        )}

        <Stack direction="row" spacing={1}>
          {canEdit && (
            <Button
              fullWidth variant="outlined" startIcon={<EditIcon />}
              onClick={() => onEdit?.(change)}
              sx={{ borderColor: '#27235C', color: '#27235C', '&:hover': { backgroundColor: '#EEF2FF' } }}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />}
              disabled={submitting === 'delete'}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Stack>

        {/* Manager decision */}
        {canDecide && (
          <Box sx={{ mt: 1.5 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#27235C', display: 'block', mb: 1 }}>
              Manager Decision
            </Typography>
            <TextField
              fullWidth size="small"
              placeholder="Add comments (required for Reject / Send Back)..."
              multiline rows={2} value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Stack direction="row" spacing={0.75}>
              {/* Approve */}
              <Button
                size="small"
                variant="contained"
                disabled={submitting === 'decision'}
                onClick={() => handleDecision('APPROVED')}
                startIcon={submitting === 'decision' ? null : <CheckIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{
                  flex: 1,
                  backgroundColor: '#16A34A',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.6,
                  px: 1,
                  minWidth: 0,
                  '&:hover': { backgroundColor: '#15803D' },
                  '&:disabled': { backgroundColor: '#BBF7D0', color: '#fff' },
                }}
              >
                {submitting === 'decision' ? <CircularProgress size={13} color="inherit" /> : 'Approve'}
              </Button>

              {/* Send Back */}
              <Button
                size="small"
                variant="contained"
                disabled={submitting === 'decision'}
                onClick={() => handleDecision('REVISION_REQUESTED')}
                startIcon={submitting === 'decision' ? null : <ReplayIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{
                  flex: 1,
                  backgroundColor: '#D97706',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.6,
                  px: 1,
                  minWidth: 0,
                  '&:hover': { backgroundColor: '#B45309' },
                  '&:disabled': { backgroundColor: '#FDE68A', color: '#fff' },
                }}
              >
                {submitting === 'decision' ? <CircularProgress size={13} color="inherit" /> : 'Send Back'}
              </Button>

              {/* Reject */}
              <Button
                size="small"
                variant="contained"
                disabled={submitting === 'decision'}
                onClick={() => handleDecision('REJECTED')}
                startIcon={submitting === 'decision' ? null : <CloseRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{
                  flex: 1,
                  backgroundColor: '#B91C1C',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.6,
                  px: 1,
                  minWidth: 0,
                  '&:hover': { backgroundColor: '#991B1B' },
                  '&:disabled': { backgroundColor: '#FECACA', color: '#fff' },
                }}
              >
                {submitting === 'decision' ? <CircularProgress size={13} color="inherit" /> : 'Reject'}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
