import React from 'react';
import { Box, Typography, Select, MenuItem, IconButton } from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * CustomPagination — matches the design in the sample image:
 *   Rows per page: [10 ▾]   1–10 of 42   ‹   ›
 */
export default function CustomPagination({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange, rowsPerPageOptions = [5, 10, 25, 50] }) {
  const from  = count === 0 ? 0 : page * rowsPerPage + 1;
  const to    = Math.min(count, page * rowsPerPage + rowsPerPage);
  const hasPrev = page > 0;
  const hasNext = to < count;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      gap: 1.5, px: 2, py: 1.2,
      borderTop: '1px solid #F0F0F0',
    }}>
      {/* Rows per page */}
      <Typography sx={{ fontSize: '0.82rem', color: '#555', whiteSpace: 'nowrap' }}>
        Rows per page:
      </Typography>
      <Select
        value={rowsPerPage}
        onChange={e => { onRowsPerPageChange(Number(e.target.value)); }}
        size="small"
        variant="outlined"
        sx={{
          fontSize: '0.82rem',
          height: 32,
          '.MuiSelect-select': { py: '4px', pr: '28px !important', pl: '10px' },
          '.MuiOutlinedInput-notchedOutline': { borderColor: '#D0D0D0' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#27235C' },
          minWidth: 64,
        }}
      >
        {rowsPerPageOptions.map(opt => (
          <MenuItem key={opt} value={opt} sx={{ fontSize: '0.82rem' }}>{opt}</MenuItem>
        ))}
      </Select>

      {/* Range text */}
      <Typography sx={{ fontSize: '0.82rem', color: '#555', whiteSpace: 'nowrap', minWidth: 70, textAlign: 'right' }}>
        {count === 0 ? '0–0 of 0' : `${from}–${to} of ${count}`}
      </Typography>

      {/* Prev */}
      <IconButton
        size="small"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        sx={{ color: hasPrev ? '#27235C' : '#C0C0C0', p: 0.4 }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      {/* Next */}
      <IconButton
        size="small"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        sx={{ color: hasNext ? '#27235C' : '#C0C0C0', p: 0.4 }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
