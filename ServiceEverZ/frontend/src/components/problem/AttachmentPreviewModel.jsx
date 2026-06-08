// FILE: src/components/problem/AttachmentPreviewModal.jsx
// Reusable file preview modal — supports images, PDFs, and generic download fallback.

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, Stack, CircularProgress,
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import DownloadIcon       from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon          from '@mui/icons-material/Image';
import PictureAsPdfIcon   from '@mui/icons-material/PictureAsPdf';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns 'image' | 'pdf' | 'other' based on MIME type. */
function fileCategory(contentType = '') {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  return 'other';
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File Icon ────────────────────────────────────────────────────────────────
function FileTypeIcon({ contentType, size = 24 }) {
  const cat = fileCategory(contentType);
  const sx  = { fontSize: size };
  if (cat === 'image') return <ImageIcon sx={{ ...sx, color: '#2563EB' }} />;
  if (cat === 'pdf')   return <PictureAsPdfIcon sx={{ ...sx, color: '#E01950' }} />;
  return <InsertDriveFileIcon sx={{ ...sx, color: '#6B7280' }} />;
}

// ─── Preview Body ─────────────────────────────────────────────────────────────
/**
 * previewUrl  — blob:// URL (no Content-Disposition header) used for rendering
 * downloadUrl — original backend URL used only for the download button
 */
function PreviewBody({ attachment, previewUrl, downloadUrl, previewLoading }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const cat = fileCategory(attachment?.contentType);

  // Show a spinner while the blob URL is being fetched from the backend
  if (previewLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={32} sx={{ color: '#27235C' }} />
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Loading preview…</Typography>
        </Stack>
      </Box>
    );
  }

  if (cat === 'image') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          backgroundColor: '#F9FAFB',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {!imgLoaded && (
          <CircularProgress size={28} sx={{ position: 'absolute', color: '#27235C' }} />
        )}
        <Box
          component="img"
          // Use blob URL (previewUrl) so it renders inline; fall back to downloadUrl
          src={previewUrl || downloadUrl}
          alt={attachment.originalFileName}
          onLoad={() => setImgLoaded(true)}
          sx={{
            maxWidth: '100%',
            maxHeight: 520,
            objectFit: 'contain',
            borderRadius: '8px',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        />
      </Box>
    );
  }

  if (cat === 'pdf') {
    // Use the blob URL — it has no Content-Disposition: attachment header,
    // so the browser renders the PDF inline instead of triggering a download.
    const iframeSrc = previewUrl || downloadUrl;
    return (
      <Box
        sx={{
          height: 560,
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
        }}
      >
        {iframeSrc ? (
          <iframe
            src={`${iframeSrc}#toolbar=1&navpanes=1`}
            title={attachment.originalFileName}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
          />
        ) : (
          // Fallback: blob fetch failed — show a download prompt instead
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <PictureAsPdfIcon sx={{ fontSize: 52, color: '#E01950' }} />
            <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600 }}>
              {attachment.originalFileName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Unable to load preview inline. Please use Download.
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Generic — show metadata and download prompt
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        gap: 2,
        backgroundColor: '#F9FAFB',
        borderRadius: '10px',
        border: '2px dashed #E5E7EB',
        p: 4,
      }}
    >
      <FileTypeIcon contentType={attachment?.contentType} size={52} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>
        {attachment?.originalFileName}
      </Typography>
      <Typography variant="caption" sx={{ color: '#6B7280' }}>
        {attachment?.contentType} · {formatBytes(attachment?.fileSize)}
      </Typography>
      <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 1 }}>
        Preview not available for this file type. Click Download to open.
      </Typography>
    </Box>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
/**
 * Props:
 *   open          {boolean}
 *   onClose       {() => void}
 *   attachment    {ProblemAttachmentResponse}  — metadata from the backend
 *   downloadUrl   {string}                     — backend URL (may have Content-Disposition: attachment)
 *   previewUrl    {string | null}              — blob:// URL for inline rendering (images + PDFs)
 *   previewLoading {boolean}                   — true while the blob is being fetched
 */
export default function AttachmentPreviewModal({
  open,
  onClose,
  attachment,
  downloadUrl,
  previewUrl,
  previewLoading = false,
}) {
  if (!attachment) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href     = downloadUrl;
    a.download = attachment.originalFileName;
    a.target   = '_blank';
    a.rel      = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
          color: '#fff',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FileTypeIcon contentType={attachment.contentType} size={22} />
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: '#fff',
                maxWidth: 480,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {attachment.originalFileName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
              {attachment.section?.replace(/_/g, ' ')} · {formatBytes(attachment.fileSize)}
              {attachment.uploadedBySpName ? ` · ${attachment.uploadedBySpName}` : ''}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.75)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ p: 3, backgroundColor: '#fff' }}>
        <PreviewBody
          attachment={attachment}
          previewUrl={previewUrl}
          downloadUrl={downloadUrl}
          previewLoading={previewLoading}
        />
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: '1px solid #E5E7EB' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: '8px', borderColor: '#D1D5DB', color: '#374151' }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #1B193F 0%, #3A3478 100%)' },
          }}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
