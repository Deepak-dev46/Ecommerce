// src/components/reports/ReportTable.jsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TableSortLabel, TableContainer, TablePagination, Typography,
  LinearProgress, Tooltip, Stack,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon     from '@mui/icons-material/Search';
import EmptyState     from './EmptyState';
import ExportCSV      from './ExportCSV';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  open:           { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  active:         { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  published:      { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  resolved:       { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  closed:         { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  completed:      { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  approved:       { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  compliant:      { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  pending:        { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  in_progress:    { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'in progress':  { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  on_hold:        { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  draft:          { color: '#B45309', bg: '#FFF7ED', border: '#FED7AA' },
  under_review:   { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  'under review': { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  breached:       { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  rejected:       { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  failed:         { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  critical:       { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  cancelled:      { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  inactive:       { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

const StatusBadge = ({ value }) => {
  if (!value) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const key   = String(value).toLowerCase();
  const theme = STATUS_MAP[key] || { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.25, py: 0.3,
        borderRadius: 1.5,
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        bgcolor: theme.bg,
        color: theme.color,
        border: '1px solid',
        borderColor: theme.border,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Box>
  );
};

const STATUS_KEYS = [
  'status', 'slaStatus', 'outcome', 'approvalStatus', 'finalDecision',
  'reviewStatus', 'satisfaction', 'changeType', 'breachType',
  'overallStatus', 'l1Status', 'l2Status', 'resourceOwnerStatus',
];

function safeString(val) {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val) && val.length >= 3 && val.every((v) => typeof v === 'number')) {
    try {
      const [year, month, day, hour = 0, min = 0, sec = 0] = val;
      return new Date(year, month - 1, day, hour, min, sec).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return val.join('-'); }
  }
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

const renderCell = (col, row) => {
  const val = row[col.key];
  if (val === undefined || val === null)
    return <Typography variant="caption" color="text.disabled">—</Typography>;

  if (Array.isArray(val) && val.length >= 3 && val.every((v) => typeof v === 'number'))
    return <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{safeString(val)}</Typography>;

  if (STATUS_KEYS.includes(col.key)) return <StatusBadge value={val} />;

  const keyLc = col.key.toLowerCase();
  if (
    (keyLc.includes('rate') || keyLc.includes('percentage') ||
     col.key === 'utilization' || col.key === 'completionRate') &&
    !isNaN(parseFloat(val))
  ) {
    const pct   = Math.min(100, Math.max(0, parseFloat(val)));
    const color = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error';
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 38, fontSize: '0.82rem' }}>{pct}%</Typography>
        <Box sx={{ flex: 1, minWidth: 60 }}>
          <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 5, borderRadius: 3 }} />
        </Box>
      </Stack>
    );
  }

  if (
    (keyLc.includes('at') || keyLc.includes('date') || keyLc.includes('since')) &&
    typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)
  ) {
    try {
      return (
        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {new Date(val).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
          })}
        </Typography>
      );
    } catch { return <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{val}</Typography>; }
  }

  return <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{safeString(val)}</Typography>;
};

const compare = (a, b, key, dir) => {
  let av = a[key] ?? '', bv = b[key] ?? '';
  if (Array.isArray(av)) av = safeString(av);
  if (Array.isArray(bv)) bv = safeString(bv);
  if (!isNaN(parseFloat(av)) && !isNaN(parseFloat(bv)))
    return dir === 'asc' ? parseFloat(av) - parseFloat(bv) : parseFloat(bv) - parseFloat(av);
  const as = String(av).toLowerCase(), bs = String(bv).toLowerCase();
  if (dir === 'asc') return as < bs ? -1 : as > bs ? 1 : 0;
  return bs < as ? -1 : bs > as ? 1 : 0;
};

const PAGE_SIZES = [10, 25, 50, 100];

const ReportTable = ({ data = [], columns = [], reportLabel = 'Report' }) => {
  const [sortKey,     setSortKey]     = useState(null);
  const [sortDir,     setSortDir]     = useState('asc');
  const [page,        setPage]        = useState(0);
  const [pageSize,    setPageSize]    = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) => Object.values(row).some((v) => safeString(v).toLowerCase().includes(q)));
  }, [data, searchQuery]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir]);

  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const handleSort = useCallback((col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col.key); setSortDir('asc'); }
    setPage(0);
  }, [sortKey]);

  if (!data.length)
    return <EmptyState title="No data returned" subtitle="Run the report or adjust the date range." />;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        width: '100%',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Toolbar: record count left | search + Export CSV right ── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.25}
        sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}
      >
        {/* Left: record count */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterListIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
            Showing{' '}
            <Typography component="span" variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: '0.82rem' }}>
              {sorted.length === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)}
            </Typography>
            {' '}of{' '}
            <Typography component="span" variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: '0.82rem' }}>
              {sorted.length}
            </Typography>
            {sorted.length !== data.length && (
              <Typography component="span" variant="body2" color="text.disabled" sx={{ fontSize: '0.82rem' }}>
                {' '}(filtered from {data.length})
              </Typography>
            )}
          </Typography>
        </Stack>

        {/* Right: search LEFT of Export CSV — joined as one pill group */}
        <Stack direction="row" alignItems="center" spacing={0}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px 0 0 8px',
              bgcolor: '#F8FAFC',
              px: 1,
              height: 34,
              width: 200,
              '&:focus-within': {
                borderColor: 'primary.main',
                bgcolor: '#fff',
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0, mr: 0.75 }} />
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search keyword..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.78rem',
                color: '#374151',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <Box
                component="span"
                onClick={() => { setSearchQuery(''); setPage(0); }}
                sx={{
                  cursor: 'pointer', color: 'text.disabled', fontSize: '0.7rem',
                  lineHeight: 1, flexShrink: 0, ml: 0.5,
                  '&:hover': { color: 'text.primary' },
                }}
              >
                ✕
              </Box>
            )}
          </Box>

          {/* Export CSV — right half, shares border with search */}
          <Box sx={{
            borderTop: '1px solid', borderRight: '1px solid', borderBottom: '1px solid',
            borderColor: 'divider',
            borderRadius: '0 8px 8px 0',
            height: 34,
            display: 'flex', alignItems: 'center',
            borderLeft: 'none',
          }}>
            <ExportCSV data={sorted} columns={columns} reportLabel={reportLabel} />
          </Box>
        </Stack>
      </Stack>

      {/* ── Table ── */}
      <TableContainer sx={{ flex: 1, overflowY: 'auto', maxHeight: 520 }}>
        <Table size="small" stickyHeader aria-label={reportLabel}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sortDirection={sortKey === col.key ? sortDir : false}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortKey === col.key}
                      direction={sortKey === col.key ? sortDir : 'asc'}
                      onClick={() => handleSort(col)}
                      sx={{
                        '&.Mui-active': { color: 'primary.main' },
                        '& .MuiTableSortLabel-icon': { fontSize: 14 },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <EmptyState title="No matching records" subtitle="Try clearing the search filter." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, idx) => (
                <TableRow
                  key={row.id ?? row.ticketId ?? row.userId ?? idx}
                  hover
                  sx={{
                    '&:last-child td': { border: 0 },
                    '&:nth-of-type(even)': { bgcolor: '#FAFAFA' },
                    '&:hover': { bgcolor: '#F0F7FF !important' },
                    transition: 'background 0.1s',
                  }}
                >
                  {columns.map((col) => (
                    <Tooltip key={col.key} title={safeString(row[col.key])} placement="top" arrow enterDelay={600}>
                      <TableCell
                        sx={{
                          py: 1.25,
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          borderColor: 'divider',
                        }}
                      >
                        {renderCell(col, row)}
                      </TableCell>
                    </Tooltip>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ── */}
      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
        rowsPerPageOptions={PAGE_SIZES}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          mt: 'auto',
          '.MuiTablePagination-toolbar': { minHeight: 52 },
          '.MuiTablePagination-select': { fontSize: '0.82rem' },
          '.MuiTablePagination-displayedRows': { fontSize: '0.82rem' },
        }}
      />
    </Paper>
  );
};

export default ReportTable;
