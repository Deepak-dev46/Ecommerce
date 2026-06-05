// FILE: src/components/problem/ProblemDetailPanel.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Stack, Chip, IconButton, Button, Divider,
  CircularProgress, Tooltip, Tab, Tabs, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, MenuItem, Select, FormControl, InputLabel,
  TextField, Accordion, AccordionSummary, AccordionDetails,
  Drawer, Autocomplete,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import RefreshIcon          from '@mui/icons-material/Refresh';
import AttachFileIcon       from '@mui/icons-material/AttachFile';
import UploadFileIcon       from '@mui/icons-material/UploadFile';
import DownloadIcon         from '@mui/icons-material/Download';
import DeleteOutlineIcon    from '@mui/icons-material/DeleteOutline';
import VisibilityIcon       from '@mui/icons-material/Visibility';
import InsertDriveFileIcon  from '@mui/icons-material/InsertDriveFile';
import ImageIcon            from '@mui/icons-material/Image';
import PictureAsPdfIcon     from '@mui/icons-material/PictureAsPdf';
import FolderZipIcon        from '@mui/icons-material/FolderZip';
import ExpandMoreIcon       from '@mui/icons-material/ExpandMore';
import LinkIcon             from '@mui/icons-material/Link';
import BugReportIcon        from '@mui/icons-material/BugReport';
import BuildIcon            from '@mui/icons-material/Build';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import LockIcon             from '@mui/icons-material/Lock';
import ContentCopyIcon      from '@mui/icons-material/ContentCopy';

import {
  submitRca, provideWorkaround, applyPermanentFix, closeProblem, linkIncident,
  uploadProblemAttachment, getProblemAttachments, deleteProblemAttachment,
  getProblemAttachmentDownloadUrl,
} from '../../api/problemApi';
import { getAllIncidents } from '../../api/incidentApi';
import { ProblemStatusChip, PriorityChip, ImpactChip } from './ProblemStatusChip';
import AttachmentPreviewModal from './AttachmentPreviewModel';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const ATTACHMENT_SECTIONS = [
  { value: 'ROOT_CAUSE',    label: 'Root Cause' },
  { value: 'WORKAROUND',    label: 'Workaround' },
  { value: 'PERMANENT_FIX', label: 'Permanent Fix' },
];

const SECTION_COLORS = {
  ROOT_CAUSE:    { color: '#97247E', bg: '#F8EDFB' },
  WORKAROUND:    { color: '#D97706', bg: '#FEF3C7' },
  PERMANENT_FIX: { color: '#065F46', bg: '#D1FAE5' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (dt) => (dt ? new Date(dt).toLocaleString() : null);
const fmtDate = (dt) => (dt ? new Date(dt).toLocaleDateString() : '—');

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileCategory(contentType = '') {
  if (contentType.startsWith('image/'))  return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType.includes('zip') || contentType.includes('compressed')) return 'archive';
  return 'other';
}

// Only image/* and application/pdf can render inline in the browser.
function isPreviewable(contentType = '') {
  return contentType.startsWith('image/') || contentType === 'application/pdf';
}

function FileTypeIcon({ contentType, size = 18 }) {
  const cat = fileCategory(contentType);
  const sx  = { fontSize: size };
  if (cat === 'image')   return <ImageIcon         sx={{ ...sx, color: '#2563EB' }} />;
  if (cat === 'pdf')     return <PictureAsPdfIcon  sx={{ ...sx, color: '#E01950' }} />;
  if (cat === 'archive') return <FolderZipIcon     sx={{ ...sx, color: '#D97706' }} />;
  return <InsertDriveFileIcon sx={{ ...sx, color: '#6B7280' }} />;
}

// ─── Shared layout helpers ────────────────────────────────────────────────────
const Section = ({ title, icon, children }) => (
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

// ─── Attachments Tab ──────────────────────────────────────────────────────────
function AttachmentsTab({ problem, currentSpId, canUpload }) {
  const [attachments, setAttachments]           = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [uploading, setUploading]               = useState(false);
  const [uploadProgress, setUploadProgress]     = useState(0);
  const [selectedSection, setSelectedSection]   = useState('ROOT_CAUSE');
  const [sectionFilter, setSectionFilter]       = useState('ALL');
  const [previewOpen, setPreviewOpen]               = useState(false);
  const [previewAttachment, setPreviewAttachment]   = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl]         = useState(null);
  const [previewBlobLoading, setPreviewBlobLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState(null);
  const fileInputRef = useRef(null);

  const loadAttachments = useCallback(async () => {
    if (!problem?.id) return;
    setLoading(true);
    try {
      const section  = sectionFilter === 'ALL' ? null : sectionFilter;
      const res      = await getProblemAttachments(problem.id, section);
      const list     = res.data?.data ?? [];
      const withUrls = list.map((a) => ({
        ...a,
        downloadUrl: getProblemAttachmentDownloadUrl(problem.id, a.id),
      }));
      setAttachments(withUrls);
    } catch {
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  }, [problem?.id, sectionFilter]);

  useEffect(() => { loadAttachments(); }, [loadAttachments]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    setUploadProgress(0);
    const fakeInterval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 10 : p));
    }, 150);

    try {
      await uploadProblemAttachment(problem.id, file, selectedSection, currentSpId);
      clearInterval(fakeInterval);
      setUploadProgress(100);
      toast.success(`"${file.name}" uploaded`);
      await loadAttachments();
    } catch (err) {
      clearInterval(fakeInterval);
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProblemAttachment(problem.id, deleteConfirm.id);
      toast.success('Attachment deleted');
      setDeleteConfirm(null);
      loadAttachments();
    } catch {
      toast.error('Failed to delete attachment');
    }
  };

  // Fetch the file as a Blob so the preview modal gets an object URL that has
  // no Content-Disposition: attachment header — otherwise PDFs auto-download
  // instead of rendering inline inside the iframe.
  const openPreview = async (att) => {
    if (!isPreviewable(att.contentType)) {
      // For non-previewable files, trigger download directly
      const a = document.createElement('a');
      a.href = att.downloadUrl;
      a.download = att.originalFileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.info(`"${att.originalFileName}" is downloading.`);
      return;
    }
    setPreviewAttachment(att);
    setPreviewOpen(true);
    setPreviewBlobLoading(true);
    setPreviewBlobUrl(null);
    try {
      const res  = await fetch(att.downloadUrl, { credentials: 'include' });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch {
      // Fallback: pass null; the modal will show a friendly error for PDFs
      setPreviewBlobUrl(null);
    } finally {
      setPreviewBlobLoading(false);
    }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(null);
    setPreviewOpen(false);
    setPreviewAttachment(null);
    setPreviewBlobLoading(false);
  };

  const sectionChip = (section) => {
    const cfg = SECTION_COLORS[section] || { color: '#6B7280', bg: '#F3F4F6' };
    return (
      <Chip
        label={section?.replace(/_/g, ' ')}
        size="small"
        sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.65rem', height: 20 }}
      />
    );
  };

  return (
    <Box sx={{ p: 2 }}>

      {/* ── Upload box — Support Personnel only ── */}
      {canUpload && (
        <Paper
          elevation={0}
          sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', p: 2, mb: 2, backgroundColor: '#FAFAFA' }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#27235C', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Upload Attachment
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Section</InputLabel>
              <Select
                label="Section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                sx={{ borderRadius: '8px' }}
                disabled={uploading}
              >
                {ATTACHMENT_SECTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="*/*"
            />
            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadFileIcon />}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #1B193F 0%, #3A3478 100%)' },
                fontSize: '0.8rem',
              }}
            >
              {uploading ? 'Uploading…' : 'Choose File'}
            </Button>

            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Any file type
            </Typography>
          </Stack>

          {uploading && (
            <Box sx={{ mt: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  borderRadius: 4, height: 5,
                  backgroundColor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #27235C, #97247E)' },
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* ── Section Filter chips ── */}
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: '#6B7280', mr: 0.5 }}>Filter:</Typography>
        {[{ value: 'ALL', label: 'All' }, ...ATTACHMENT_SECTIONS].map((s) => (
          <Chip
            key={s.value}
            label={s.label}
            size="small"
            clickable
            onClick={() => setSectionFilter(s.value)}
            sx={{
              height: 22, fontSize: '0.68rem',
              fontWeight: sectionFilter === s.value ? 700 : 500,
              backgroundColor: sectionFilter === s.value ? '#27235C' : '#F3F4F6',
              color: sectionFilter === s.value ? '#fff' : '#374151',
              '&:hover': { backgroundColor: sectionFilter === s.value ? '#27235C' : '#E5E7EB' },
            }}
          />
        ))}
        <IconButton size="small" onClick={loadAttachments} sx={{ ml: 'auto' }}>
          <RefreshIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {/* ── Attachment list ── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={26} />
        </Box>
      ) : attachments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5, border: '2px dashed #E5E7EB', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
          <AttachFileIcon sx={{ fontSize: 36, color: '#D1D5DB', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No attachments yet</Typography>
          {canUpload && (
            <Typography variant="caption" sx={{ color: '#C4C4C4' }}>
              Upload files using the section picker above
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'auto' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                <TableCell sx={{ width: 32, fontWeight: 700, fontSize: '0.7rem', color: '#374151' }} />
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#374151' }}>File Name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#374151' }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#374151' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#374151' }}>Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#374151' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attachments.map((att) => (
                <TableRow key={att.id} hover sx={{ '&:hover': { backgroundColor: '#F8F8FE' } }}>
                  <TableCell sx={{ pl: 1.5 }}>
                    <FileTypeIcon contentType={att.contentType} size={18} />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: '#1F2937', display: 'block', wordBreak: 'break-word' }}
                    >
                      {att.originalFileName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.63rem' }}>
                      {att.contentType}
                    </Typography>
                  </TableCell>
                  <TableCell>{sectionChip(att.section)}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{formatBytes(att.fileSize)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString() : '—'}
                    </Typography>
                    {att.uploadedBySpName && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#9CA3AF', fontSize: '0.63rem' }}>
                        {att.uploadedBySpName}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 1 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      {/* Preview — both roles; blob-fetched so PDF renders inline */}
                      <Tooltip title={isPreviewable(att.contentType) ? 'Preview' : 'Download file'}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={previewBlobLoading && previewAttachment?.id === att.id}
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); openPreview(att); }}
                            sx={{ color: isPreviewable(att.contentType) ? '#2563EB' : '#9CA3AF' }}
                          >
                            {previewBlobLoading && previewAttachment?.id === att.id
                              ? <CircularProgress size={14} />
                              : <VisibilityIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      {/* Download — both roles */}
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const a = document.createElement('a');
                            a.href = att.downloadUrl;
                            a.download = att.originalFileName;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          sx={{ color: '#27235C' }}
                        >
                          <DownloadIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {/* Delete — Support Personnel only */}
                      {canUpload && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(att); }}
                            sx={{ color: '#E01950' }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Preview Modal — receives blob URL so PDF renders inline, not downloaded */}
      <AttachmentPreviewModal
        open={previewOpen}
        onClose={closePreview}
        attachment={previewAttachment}
        downloadUrl={previewAttachment?.downloadUrl}
        previewUrl={previewBlobUrl}
        previewLoading={previewBlobLoading}
      />

      {/* Delete Confirm — Support Personnel only */}
      {canUpload && (
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Delete Attachment?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Permanently delete <strong>{deleteConfirm?.originalFileName}</strong>? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteConfirm(null)} variant="outlined">Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{ backgroundColor: '#E01950', '&:hover': { backgroundColor: '#b8143e' } }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

// ─── Actions Tab — Support Personnel only ─────────────────────────────────────
function ActionsTab({ problem, currentSpId, onRefresh }) {
  const [submitting, setSubmitting]   = useState(null);
  const [rca, setRca]                 = useState('');
  const [workaround, setWorkaround]   = useState('');
  const [permanentFix, setPermanentFix] = useState('');
  const [symptoms, setSymptoms]       = useState('');
  // Link Incident — smart dropdown
  const [incidentId, setIncidentId]         = useState('');
  const [incidentNotes, setIncidentNotes]   = useState('');
  const [inProgressTickets, setInProgressTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading]       = useState(false);
  const [ticketsFetched, setTicketsFetched]       = useState(false);
  const [selectedTicket, setSelectedTicket]       = useState(null);

  const loadInProgressTickets = useCallback(async () => {
    if (ticketsFetched) return;          // fetch once per panel open
    setTicketsLoading(true);
    try {
      const res  = await getAllIncidents();
      const all  = res.data?.data ?? [];
      const open = all.filter((t) => t.status === 'In Progress');
      setInProgressTickets(open);
      setTicketsFetched(true);
    } catch {
      toast.error('Failed to load in-progress incidents');
    } finally {
      setTicketsLoading(false);
    }
  }, [ticketsFetched]);

  const s = problem.status;
  const canRca          = ['LOGGED', 'UNDER_INVESTIGATION'].includes(s);
  const canWorkaround   = ['RCA_IN_PROGRESS', 'UNDER_INVESTIGATION', 'LOGGED'].includes(s);
  const canPermFix      = !['RESOLVED', 'CLOSED'].includes(s);
  const canClose        = ['RESOLVED', 'KNOWN_ERROR', 'WORKAROUND_PROVIDED', 'PERMANENT_FIX_IN_PROGRESS'].includes(s);

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

  const handleRca        = () => act('rca', () => submitRca(problem.id, { rootCause: rca }));
  const handleWorkaround = () => act('wa',  () => provideWorkaround(problem.id, { workaround }));
  const handlePermFix    = () => act('pf',  () => applyPermanentFix(problem.id, { permanentFix, symptoms, spId: currentSpId }));
  const handleClose      = () => act('cl',  () => closeProblem(problem.id, currentSpId));
  const handleLink = () => {
    const id = selectedTicket?.incidentId ?? Number(incidentId);
    act('li', () => linkIncident(problem.id, { incidentId: id, linkedBySpId: currentSpId, notes: incidentNotes }));
  };

  const AccBtn = ({ label, icon, loading, disabled, onClick }) => (
    <Button
      variant="contained"
      size="small"
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : icon}
      disabled={disabled || !!loading}
      onClick={onClick}
      sx={{ mt: 1, borderRadius: '8px', textTransform: 'none', background: 'linear-gradient(135deg, #27235C 0%, #4A4490 100%)', '&:hover': { background: 'linear-gradient(135deg, #1B193F 0%, #3A3478 100%)' } }}
    >
      {label}
    </Button>
  );

  const accordionSx = {
    border: '1px solid #E5E7EB',
    borderRadius: '8px !important',
    mb: 1,
    '&:before': { display: 'none' },
    boxShadow: 'none',
  };

  return (
    <Box sx={{ px: 2.5, py: 2 }}>
      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2 }}>
        Current status: <strong style={{ color: '#27235C' }}>{s}</strong>
      </Typography>

      {/* Link Incident */}
      <Accordion
        disableGutters elevation={0} sx={accordionSx}
        onChange={(_, expanded) => { if (expanded) loadInProgressTickets(); }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LinkIcon sx={{ fontSize: 16, color: '#27235C' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Link Incident</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>

          {/* Smart dropdown — shows In Progress tickets */}
          <Autocomplete
            size="small"
            options={inProgressTickets}
            loading={ticketsLoading}
            value={selectedTicket}
            onChange={(_, val) => {
              setSelectedTicket(val);
              setIncidentId(val ? String(val.incidentId) : '');
            }}
            getOptionLabel={(opt) =>
              `${opt.ticketNumber ?? `INC-${opt.incidentId}`} — ${opt.subject ?? ''}`
            }
            isOptionEqualToValue={(opt, val) => opt.incidentId === val?.incidentId}
            noOptionsText={ticketsLoading ? 'Loading…' : 'No in-progress incidents found'}
            renderOption={(props, opt) => (
              <Box component="li" {...props} key={opt.incidentId} sx={{ py: 0.75 }}>
                <Stack>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#27235C' }}>
                    {opt.ticketNumber ?? `INC-${opt.incidentId}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#374151', lineHeight: 1.3 }}>
                    {opt.subject}
                  </Typography>
                  {opt.requesterName && (
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.62rem' }}>
                      Raised by: {opt.requesterName}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select In-Progress Incident"
                sx={{ mb: 1 }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {ticketsLoading ? <CircularProgress size={14} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            fullWidth size="small" label="Notes (optional)"
            multiline rows={2} value={incidentNotes}
            onChange={(e) => setIncidentNotes(e.target.value)}
            sx={{ mb: 1 }}
          />
          <AccBtn
            label="Link"
            icon={<LinkIcon />}
            loading={submitting === 'li'}
            disabled={!selectedTicket && !incidentId}
            onClick={handleLink}
          />
        </AccordionDetails>
      </Accordion>

      {/* Submit RCA */}
      {canRca && (
        <Accordion disableGutters elevation={0} sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BugReportIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Submit Root Cause Analysis</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <TextField fullWidth size="small" label="Root Cause" multiline rows={4} value={rca}
              onChange={(e) => setRca(e.target.value)} sx={{ mb: 1 }} />
            <AccBtn label="Submit RCA" icon={<BugReportIcon />} loading={submitting === 'rca'} disabled={!rca.trim()} onClick={handleRca} />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Provide Workaround */}
      {canWorkaround && (
        <Accordion disableGutters elevation={0} sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BuildIcon sx={{ fontSize: 16, color: '#0369A1' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Provide Workaround</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <TextField fullWidth size="small" label="Workaround" multiline rows={4} value={workaround}
              onChange={(e) => setWorkaround(e.target.value)} sx={{ mb: 1 }} />
            <AccBtn label="Save Workaround" icon={<BuildIcon />} loading={submitting === 'wa'} disabled={!workaround.trim()} onClick={handleWorkaround} />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Permanent Fix */}
      {canPermFix && (
        <Accordion disableGutters elevation={0} sx={accordionSx}>
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
            <AccBtn label="Apply Fix + Update KEDB" icon={<CheckCircleIcon />} loading={submitting === 'pf'} disabled={!permanentFix.trim()} onClick={handlePermFix} />
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
          <Button
            variant="contained" color="error" size="small"
            startIcon={submitting === 'cl' ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
            disabled={submitting === 'cl'}
            onClick={handleClose}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Close Problem
          </Button>
        </Box>
      )}

      {s === 'CLOSED' && (
        <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 3 }}>
          This problem is closed. No further actions available.
        </Typography>
      )}
    </Box>
  );
}

// ─── Main Panel — rendered as a right-side Drawer ─────────────────────────────
/**
 * Props:
 *   problem    {ProblemResponse | null}  — null → drawer is closed
 *   onClose    {() => void}
 *   onRefresh  {() => void}
 */
export default function ProblemDetailPanel({ problem, onClose, onRefresh }) {
  const [tab, setTab] = useState(0);
  const { user, isSupportPersonnel, isITSMManager } = useAuth();

  // Reset to Details tab whenever a different problem is selected
  useEffect(() => { setTab(0); }, [problem?.id]);

  const currentSpId   = user?.userId ?? null;
  const isSpRole      = isSupportPersonnel();
  const isManagerRole = isITSMManager();

  const tabs = isSpRole
    ? ['Details', 'Attachments', 'Actions']
    : ['Details', 'Attachments'];

  const attachmentCount = problem?.attachments?.length ?? 0;

  // APP_BAR_HEIGHT must match the MUI AppBar height used in this app's layout.
  // The default MUI AppBar is 64 px on desktop and 56 px on mobile (xs).
  const APP_BAR_HEIGHT = { xs: 56, sm: 64 };

  return (
    <Drawer
      anchor="right"
      open={!!problem}
      onClose={onClose}
      // "temporary" variant overlays the page — table never shrinks
      variant="temporary"
      ModalProps={{
        keepMounted: true,
        // Offset the backdrop so it only covers the content area, not the navbar
        sx: {
          top: APP_BAR_HEIGHT,
          zIndex: (theme) => theme.zIndex.drawer,
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 540, md: 580 },
          // Push the drawer paper down below the top navbar
          top: APP_BAR_HEIGHT,
          height: { xs: `calc(100% - 56px)`, sm: `calc(100% - 64px)` },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Guard: render nothing inside until a problem is selected */}
      {problem && (
        <>
          {/* ── Header ── */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexShrink: 0,
              // Subtle gradient accent at top to signal it's an overlay panel
              backgroundImage: 'linear-gradient(180deg, #F8F7FF 0%, #fff 100%)',
            }}
          >
            <Box sx={{ flex: 1, pr: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'monospace', color: '#27235C', fontWeight: 700, fontSize: '0.75rem' }}
                >
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
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" sx={{ color: '#6B7280' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close panel">
                <IconButton onClick={onClose} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* ── Tabs ── */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid #E5E7EB',
              flexShrink: 0,
              '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 600, textTransform: 'none', minHeight: 40 },
              '& .Mui-selected': { color: '#27235C' },
              '& .MuiTabs-indicator': { backgroundColor: '#27235C' },
            }}
          >
            {tabs.map((label) => (
              <Tab
                key={label}
                label={
                  label === 'Attachments' && attachmentCount > 0 ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <span>Attachments</span>
                      <Box
                        component="span"
                        sx={{
                          px: 0.8, minWidth: 18, textAlign: 'center',
                          background: '#27235C', color: '#fff',
                          borderRadius: 10, fontSize: '0.6rem', fontWeight: 700,
                          lineHeight: '16px', display: 'inline-block',
                        }}
                      >
                        {attachmentCount}
                      </Box>
                    </Stack>
                  ) : label
                }
              />
            ))}
          </Tabs>

          {/* ── Tab Body — scrollable ── */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>

            {/* Details — both roles */}
            {tab === 0 && (
              <Box sx={{ px: 2.5, py: 2 }}>

                <Section title="Description">
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {problem.description}
                  </Typography>
                </Section>

                <Divider sx={{ my: 1.5 }} />

                <Section title="Details">
                  <InfoRow label="Category"     value={problem.categoryName} />
                  <InfoRow label="Sub-category" value={problem.subCategoryName} />
                  <InfoRow label="CI"           value={problem.ciName} />
                  <InfoRow label="Assigned SP"  value={problem.createdBySpName} />
                  <InfoRow label="Manager"      value={problem.managerName} />
                  <InfoRow label="Created"      value={fmt(problem.createdAt)} />
                  {problem.closedAt && <InfoRow label="Closed" value={fmt(problem.closedAt)} />}
                  <InfoRow label="KEDB"         value={problem.hasKnownErrorRecord ? '✅ Yes' : '—'} />
                </Section>

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
              </Box>
            )}

            {/* Attachments — both roles, canUpload controlled by role */}
            {tab === 1 && (
              <AttachmentsTab
                problem={problem}
                currentSpId={currentSpId}
                canUpload={isSpRole}
              />
            )}

            {/* Actions — Support Personnel only (tab index 2) */}
            {tab === 2 && isSpRole && (
              <ActionsTab
                problem={problem}
                currentSpId={currentSpId}
                onRefresh={onRefresh}
              />
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}
