// src/components/reports/ExportCSV.jsx
import React, { useCallback } from 'react';
import { Button, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const toCSV = (data, columns) => {
  if (!data?.length) return '';
  const headers = columns.map((c) => `"${c.label}"`).join(',');
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\r\n');
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ExportCSV = ({ data = [], columns = [], reportLabel = 'report', disabled = false }) => {
  const handleExport = useCallback(() => {
    if (!data.length) return;
    const csv       = toCSV(data, columns);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename  = `${reportLabel.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
    downloadCSV(csv, filename);
  }, [data, columns, reportLabel]);

  return (
    <Tooltip title={!data.length ? 'No data to export' : `Export ${data.length} rows as CSV`} arrow>
      <span>
        <Button
          size="small"
          variant="outlined"
          onClick={handleExport}
          disabled={disabled || !data.length}
          startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 0.65,
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: '#CBD5E1',
            color: '#334155',
            bgcolor: '#fff',
            '&:hover': {
              bgcolor: '#F1F5F9',
              borderColor: '#94A3B8',
            },
            '&:disabled': {
              borderColor: 'divider',
              color: 'text.disabled',
            },
          }}
        >
          Export CSV
        </Button>
      </span>
    </Tooltip>
  );
};

export default ExportCSV;
