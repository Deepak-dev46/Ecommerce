import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Divider, Button, Chip,
  TextField, CircularProgress, Accordion, AccordionSummary,
  AccordionDetails, Stack, Tooltip,
} from '@mui/material';
import CloseIcon           from '@mui/icons-material/Close';
import ExpandMoreIcon      from '@mui/icons-material/ExpandMore';
import LinkIcon            from '@mui/icons-material/Link';
import BugReportIcon       from '@mui/icons-material/BugReport';
import BuildIcon           from '@mui/icons-material/Build';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import LockIcon            from '@mui/icons-material/Lock';
import ContentCopyIcon     from '@mui/icons-material/ContentCopy';
import { ProblemStatusChip, PriorityChip, ImpactChip } from './ProblemStatusChip';
import {
  submitRca, provideWorkaround, applyPermanentFix,
  closeProblem, linkIncident,
} from '../../api/problemApi';
import toast from '../../utils/toast';

const Section = ({ title, children, icon }) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
      {icon && <Box sx={{ color: '#27235C', display: 'flex' }}>{icon}</Box>}
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.5 }}>
    <Typography variant="caption" sx={{ color: '#6B7280', minWidth: 130 }}>{label}</Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1A1A1A', textAlign: 'right', flex: 1 }}>
      {value ?? <span style={{ color: '#9CA3AF' }}>—</span>}
    </Typography>
  </Stack>
);

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : null;

export default function ProblemDetailPanel({ problem, onClose, onRefresh, currentSpId = 1 }) {
  const [submitting, setSubmitting] = useState(null); // which action is pending
  const [rca, setRca]               = useState('');
  const [workaround, setWorkaround] = useState('');
  const [permanentFix, setPermanentFix] = useState('');
  const [symptoms, setSymptoms]     = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');

  if (!problem) return null;

  const s = problem.status;
  const canRca          = ['LOGGED', 'UNDER_INVESTIGATION'].includes(s);
  const canWorkaround   = ['RCA_IN_PROGRESS', 'UNDER_INVESTIGATION', 'LOGGED'].includes(s);
  const canPermFix      = !['RESOLVED', 'CLOSED'].includes(s);
  const canClose        = ['RESOLVED', 'KNOWN_ERROR', 'WORKAROUND_PROVIDED', 'PERMANENT_FIX_IN_PROGRESS'].includes(s);
  const canLinkIncident = true; // incidents can be linked at any status, including CLOSED

  const act = async (key, fn) => {
    setSubmitting(key);
    try {
      await fn();
      toast.success('Updated successfully');
      onRefresh?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(null);
    }
  };

  const handleRca          = () => act('rca',  () => submitRca(problem.id, { rootCause: rca }));
  const handleWorkaround   = () => act('wa',   () => provideWorkaround(problem.id, { workaround }));
  const handlePermFix      = () => act('pf',   () => applyPermanentFix(problem.id, { permanentFix, symptoms, spId: currentSpId }));
  const handleClose        = () => act('cl',   () => closeProblem(problem.id, currentSpId));
  const handleLinkIncident = () => act('li',   () => linkIncident(problem.id, { incidentId: Number(incidentId), linkedBySpId: currentSpId, notes: incidentNotes }));

  const Btn = ({ label, icon, loading, disabled, onClick, color = 'primary', variant = 'contained' }) => (
    <Button
      variant={variant}
      color={color}
      size="small"
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : icon}
      disabled={disabled || !!loading}
      onClick={onClick}
      sx={{ mt: 1, mr: 1 }}
    >
      {label}
    </Button>
  );

  return (
    <Box sx={{
      width: 420, height: '100%', display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid #E5E7EB', backgroundColor: '#fff', overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, pr: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#27235C', fontWeight: 700, fontSize: '0.75rem' }}>
              {problem.problemNumber}
            </Typography>
            <Tooltip title="Copy number">
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(problem.problemNumber)}>
                <ContentCopyIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: '0.9rem' }}>
            {problem.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
            <ProblemStatusChip status={problem.status} />
            <PriorityChip priority={problem.priority} />
            <ImpactChip impact={problem.impact} />
          </Stack>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {/* Body — scrollable */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>

        {/* Description */}
        <Section title="Description">
          <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {problem.description}
          </Typography>
        </Section>

        <Divider sx={{ my: 1.5 }} />

        {/* Meta */}
        <Section title="Details">
          <InfoRow label="Category"       value={problem.categoryName} />
          <InfoRow label="Sub-category"   value={problem.subCategoryName} />
          <InfoRow label="CI"             value={problem.ciName} />
          <InfoRow label="Assigned SP"    value={problem.createdBySpName} />
          <InfoRow label="Manager"        value={problem.managerName} />
          <InfoRow label="Created"        value={fmt(problem.createdAt)} />
          {problem.closedAt && <InfoRow label="Closed" value={fmt(problem.closedAt)} />}
          <InfoRow label="KEDB"           value={problem.hasKnownErrorRecord ? '✅ Yes' : '—'} />
        </Section>

        {/* Linked Incidents */}
        {problem.linkedIncidents?.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Linked Incidents" icon={<LinkIcon sx={{ fontSize: 14 }} />}>
              {problem.linkedIncidents.map((li) => (
                <Box key={li.linkId} sx={{ p: 1, mb: 0.75, borderRadius: 1, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>INC-{li.incidentId}</Typography>
                  {li.incidentTitle && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#374151' }}>{li.incidentTitle}</Typography>
                  )}
                  {li.notes && (
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{li.notes}</Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', color: '#9CA3AF' }}>{fmt(li.linkedAt)}</Typography>
                </Box>
              ))}
            </Section>
          </>
        )}

        {/* RCA */}
        {problem.rootCause && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Root Cause Analysis" icon={<BugReportIcon sx={{ fontSize: 14 }} />}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.6 }}>
                {problem.rootCause}
              </Typography>
            </Section>
          </>
        )}

        {/* Workaround */}
        {problem.workaround && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Workaround" icon={<BuildIcon sx={{ fontSize: 14 }} />}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.6 }}>
                {problem.workaround}
              </Typography>
              {problem.workaroundProvidedAt && (
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Provided: {fmt(problem.workaroundProvidedAt)}</Typography>
              )}
            </Section>
          </>
        )}

        {/* Permanent Fix */}
        {problem.permanentFix && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Permanent Fix" icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.6 }}>
                {problem.permanentFix}
              </Typography>
              {problem.permanentFixAppliedAt && (
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Applied: {fmt(problem.permanentFixAppliedAt)}</Typography>
              )}
            </Section>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* ── Action Accordions ── */}

        {/* Link Incident */}
        {canLinkIncident && (
          <Accordion disableGutters elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon sx={{ fontSize: 16, color: '#27235C' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Link Incident</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <TextField fullWidth size="small" label="Incident ID" type="number" value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth size="small" label="Notes (optional)" multiline rows={2} value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)} sx={{ mb: 1 }} />
              <Btn label="Link" icon={<LinkIcon />} loading={submitting === 'li'}
                disabled={!incidentId} onClick={handleLinkIncident} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Submit RCA */}
        {canRca && (
          <Accordion disableGutters elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BugReportIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Submit Root Cause Analysis</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <TextField fullWidth size="small" label="Root Cause" multiline rows={4} value={rca}
                onChange={(e) => setRca(e.target.value)} sx={{ mb: 1 }} />
              <Btn label="Submit RCA" icon={<BugReportIcon />} loading={submitting === 'rca'}
                disabled={!rca.trim()} onClick={handleRca} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Provide Workaround */}
        {canWorkaround && (
          <Accordion disableGutters elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BuildIcon sx={{ fontSize: 16, color: '#0369A1' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Provide Workaround</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <TextField fullWidth size="small" label="Workaround" multiline rows={4} value={workaround}
                onChange={(e) => setWorkaround(e.target.value)} sx={{ mb: 1 }} />
              <Btn label="Save Workaround" icon={<BuildIcon />} loading={submitting === 'wa'}
                disabled={!workaround.trim()} onClick={handleWorkaround} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Permanent Fix */}
        {canPermFix && (
          <Accordion disableGutters elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Apply Permanent Fix</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <TextField fullWidth size="small" label="Permanent Fix Description" multiline rows={4} value={permanentFix}
                onChange={(e) => setPermanentFix(e.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth size="small" label="Symptoms (for KEDB)" multiline rows={2} value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)} sx={{ mb: 1 }} />
              <Btn label="Apply Fix + Update KEDB" icon={<CheckCircleIcon />} loading={submitting === 'pf'}
                disabled={!permanentFix.trim()} onClick={handlePermFix} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Close Problem */}
        {canClose && (
          <Box sx={{ mt: 1, p: 1.5, border: '1px solid #FEE2E2', borderRadius: 2, background: '#FFF5F5' }}>
            <Typography variant="caption" sx={{ display: 'block', color: '#B91C1C', fontWeight: 700, mb: 0.5 }}>
              Close Problem
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
              This will permanently close the problem record.
            </Typography>
            <Btn label="Close Problem" icon={<LockIcon />} loading={submitting === 'cl'}
              onClick={handleClose} color="error" />
          </Box>
        )}
      </Box>
    </Box>
  );
}
