// src/components/common/ConfirmDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, CircularProgress,
} from '@mui/material';
import { WarningAmberRounded } from '@mui/icons-material';
 
const COLORS = { error: '#E01950', warning: '#E2B93B', info: '#27235C' };
 
const ConfirmDialog = ({
  open, title = 'Confirm', message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel,
  severity = 'warning', loading = false,
}) => {
  const c = COLORS[severity] || COLORS.warning;
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WarningAmberRounded sx={{ color: c, fontSize: 20 }} />
          </Box>
          <Typography fontWeight={700} fontSize="0.95rem">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{ background: c, '&:hover': { background: c, filter: 'brightness(0.88)' } }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default ConfirmDialog;
 