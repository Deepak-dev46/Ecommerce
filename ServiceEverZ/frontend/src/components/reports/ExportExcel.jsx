// src/components/reports/ExportExcel.jsx
// US-97: Export reports to Excel (.xlsx) so offline analysis is possible.
//
// Positive:
//   1. .xlsx file downloads with all report data.
//   2. Column headers match report fields.
//   3. Data matches system report view.
//   4. File opens without errors in Excel.
//
// Negative:
//   1. No data → button shown but triggers server export with headers only.
//   2. Export fails → 'Export failed, please try again' snackbar.
//   3. Non-Admin → button hidden (visibility controlled by isAdmin prop).

import React, { useState, useCallback } from 'react';
import { Button, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { exportReportAsExcel } from '../../services/reportService';

/**
 * @param {string}  reportType  - slug used in the API path e.g. "ticket-volume"
 * @param {string}  reportLabel - human-readable label for the filename
 * @param {object}  filterParams - current filter state to pass to the API
 * @param {boolean} isAdmin     - US-97 negative #3: hides button for non-Admin
 * @param {boolean} disabled    - additional disabled signal
 */
const ExportExcel = ({ reportType, reportLabel = 'report', filterParams = {}, isAdmin = true, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleExport = useCallback(async () => {
    if (!reportType) return;
    setLoading(true);
    setError(null);
    try {
      await exportReportAsExcel(reportType, filterParams);
    } catch (err) {
      // US-97 negative #2: export failure message
      const status = err?.response?.status;
      if (status === 403) {
        setError('Access Denied: export requires Admin or ITSM Manager role');
      } else {
        setError('Export failed, please try again');
      }
    } finally {
      setLoading(false);
    }
  }, [reportType, filterParams]);

  // US-97 negative #3: hide for non-Admin users
  if (!isAdmin) return null;

  return (
    <>
      <Tooltip
        title={!reportType ? 'No report selected' : 'Download report as Excel (.xlsx)'}
        arrow
      >
        <span>
          <Button
            size="small"
            variant="outlined"
            onClick={handleExport}
            disabled={disabled || loading || !reportType}
            startIcon={loading ? <CircularProgress size={13} color="inherit" /> : <DownloadIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 0.65,
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#CBD5E1',
              color: '#134e4a',
              bgcolor: '#f0fdf4',
              '&:hover': {
                bgcolor: '#dcfce7',
                borderColor: '#4ade80',
              },
              '&:disabled': {
                borderColor: 'divider',
                color: 'text.disabled',
                bgcolor: 'transparent',
              },
            }}
          >
            {loading ? 'Exporting…' : 'Export Excel'}
          </Button>
        </span>
      </Tooltip>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportExcel;
