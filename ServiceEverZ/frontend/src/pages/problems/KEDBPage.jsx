import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, IconButton, Divider, Tooltip,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import SearchIcon        from '@mui/icons-material/Search';
import CloseIcon         from '@mui/icons-material/Close';
import RefreshIcon       from '@mui/icons-material/Refresh';
import BugReportIcon     from '@mui/icons-material/BugReport';
import BuildIcon         from '@mui/icons-material/Build';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import ContentCopyIcon   from '@mui/icons-material/ContentCopy';
import FilterListIcon    from '@mui/icons-material/FilterList';
import { getAllKerRecords, searchKedb, getAllCategories } from '../../api/problemApi';
import toast from '../../utils/toast';

const fmt = (dt) => (dt ? new Date(dt).toLocaleDateString() : '—');
const fmtLong = (dt) => (dt ? new Date(dt).toLocaleString() : null);

// ── Status Chip ────────────────────────────────────────────────────────────────
function StatusChip({ isActive }) {
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        backgroundColor: isActive ? '#D1FAE5' : '#E5E7EB',
        color: isActive ? '#065F46' : '#374151',
        fontWeight: 700,
        fontSize: '0.65rem',
      }}
    />
  );
}

// ── Detail Panel (right drawer) ────────────────────────────────────────────────
const Section = ({ title, icon, children }) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
      {icon && <Box sx={{ color: '#27235C', display: 'flex' }}>{icon}</Box>}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        {title}
      </Typography>
    </Stack>
    {children}
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.5 }}>
    <Typography variant="caption" sx={{ color: '#6B7280', minWidth: 130 }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1A1A1A', textAlign: 'right', flex: 1 }}>
      {value ?? <span style={{ color: '#9CA3AF' }}>—</span>}
    </Typography>
  </Stack>
);

function KerDetailPanel({ ker, onClose }) {
  if (!ker) return null;

  return (
    <Box
      sx={{
        width: 420,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #E5E7EB',
        backgroundColor: '#fff',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1, pr: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'monospace', color: '#27235C', fontWeight: 700, fontSize: '0.75rem' }}
            >
              {ker.kerNumber}
            </Typography>
            <Tooltip title="Copy KER number">
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(ker.kerNumber)}>
                <ContentCopyIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: '0.9rem' }}>
            {ker.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }}>
            <StatusChip isActive={ker.isActive} />
          </Stack>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body — scrollable */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>

        {/* Details */}
        <Section title="Details">
          <InfoRow label="KER Number"    value={ker.kerNumber} />
          <InfoRow label="Problem"       value={ker.problemNumber} />
          <InfoRow label="Affected CI"   value={ker.affectedCi} />
          <InfoRow label="Created By"    value={ker.createdBySpName} />
          <InfoRow label="Created"       value={fmtLong(ker.createdAt)} />
          {ker.resolvedAt && <InfoRow label="Resolved" value={fmtLong(ker.resolvedAt)} />}
        </Section>

        {/* Symptoms */}
        {ker.symptoms && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Symptoms" icon={<BugReportIcon sx={{ fontSize: 14 }} />}>
              <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {ker.symptoms}
              </Typography>
            </Section>
          </>
        )}

        {/* Root Cause */}
        {ker.rootCause && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Root Cause" icon={<BugReportIcon sx={{ fontSize: 14 }} />}>
              <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {ker.rootCause}
              </Typography>
            </Section>
          </>
        )}

        {/* Workaround */}
        {ker.workaround && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Workaround" icon={<BuildIcon sx={{ fontSize: 14 }} />}>
              <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {ker.workaround}
              </Typography>
            </Section>
          </>
        )}

        {/* Permanent Fix */}
        {ker.permanentFix && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Section title="Permanent Fix" icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#059669' }} />}>
              <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {ker.permanentFix}
              </Typography>
            </Section>
          </>
        )}
      </Box>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function KEDBPage() {
  const [records, setRecords]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected]   = useState(null);

  // ── Loaders ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [kerRes, catRes] = await Promise.all([
        getAllKerRecords(),
        getAllCategories(false),
      ]);
      setRecords(kerRes.data?.data ?? []);
      setCategories(catRes.data?.data ?? []);
    } catch {
      toast.error('Failed to load KEDB records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length >= 3) {
      try {
        const res = await searchKedb(val.trim());
        setRecords(res.data?.data ?? []);
      } catch {}
    } else if (!val.trim()) {
      load();
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const displayed = records.filter((r) => {
    // Client-side search (< 3 chars)
    if (search.trim() && search.trim().length < 3) {
      const q = search.toLowerCase();
      const matchesSearch =
        r.title?.toLowerCase().includes(q) ||
        r.kerNumber?.toLowerCase().includes(q) ||
        r.problemNumber?.toLowerCase().includes(q) ||
        r.affectedCi?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter === 'active' && !r.isActive) return false;
    if (statusFilter === 'inactive' && r.isActive) return false;

    // Category filter — KER records carry categoryName via the linked problem
    if (categoryFilter !== 'all' && r.categoryName !== categoryFilter) return false;

    return true;
  });

  // Unique category names from loaded records
  const categoryOptions = [...new Set(records.map((r) => r.categoryName).filter(Boolean))].sort();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, pt: 3, pb: 2, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C' }}>
              Known Error Database (KEDB)
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Catalogue of known errors with documented workarounds and permanent fixes
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small" sx={{ border: '1px solid #E5E7EB' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* ── Toolbar: search + filters ──────────────────────────────────── */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ rowGap: 1 }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search by title, KER number, CI…"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 340 }}
          />

          {/* Status filter */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <FilterListIcon sx={{ fontSize: 16, color: '#6B7280' }} />
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(_, v) => v && setStatusFilter(v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5, py: 0.4, fontSize: '0.72rem', textTransform: 'none', border: '1px solid #E5E7EB',
                  '&.Mui-selected': { backgroundColor: '#27235C', color: '#fff', borderColor: '#27235C' },
                  '&.Mui-selected:hover': { backgroundColor: '#1B193F' },
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="inactive">Inactive</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Category filter — only shown when categories exist in the data */}
          {categoryOptions.length > 0 && (
            <ToggleButtonGroup
              value={categoryFilter}
              exclusive
              onChange={(_, v) => v && setCategoryFilter(v)}
              size="small"
              sx={{
                flexWrap: 'wrap',
                gap: 0.5,
                '& .MuiToggleButtonGroup-grouped': { borderRadius: '4px !important', border: '1px solid #E5E7EB !important' },
                '& .MuiToggleButton-root': {
                  px: 1.5, py: 0.4, fontSize: '0.72rem', textTransform: 'none',
                  '&.Mui-selected': { backgroundColor: '#EEF2FF', color: '#27235C', borderColor: '#27235C !important', fontWeight: 700 },
                },
              }}
            >
              <ToggleButton value="all">All Categories</ToggleButton>
              {categoryOptions.map((c) => (
                <ToggleButton key={c} value={c}>{c}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          <Typography variant="caption" sx={{ color: '#9CA3AF', ml: 'auto !important' }}>
            {displayed.length} record{displayed.length !== 1 ? 's' : ''}
          </Typography>
        </Stack>
      </Box>

      {/* ── Body: table + optional detail panel ───────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Table area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', px: 3, pb: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : displayed.length === 0 ? (
            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 6, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No KEDB records found</Typography>
            </Paper>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid #E5E7EB', borderRadius: 2, flex: 1, overflow: 'auto' }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>KER Number</TableCell>
                    <TableCell>Problem</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Affected CI</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayed.map((ker) => {
                    const isSelected = selected?.id === ker.id;
                    return (
                      <TableRow
                        key={ker.id}
                        hover
                        selected={isSelected}
                        onClick={() => setSelected(isSelected ? null : ker)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#EEF2FF' : undefined,
                          borderLeft: isSelected ? '3px solid #27235C' : '3px solid transparent',
                          '&:hover': { backgroundColor: '#F5F5FF' },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#27235C' }}
                          >
                            {ker.kerNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#6B7280' }}>
                            {ker.problemNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              maxWidth: selected ? 160 : 280,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ker.title}
                          </Typography>
                        </TableCell>
                        {/* <TableCell>
                          <Typography variant="caption">{ker.categoryName ?? '—'}</Typography>
                        </TableCell> */}
                        <TableCell>
                          <Typography variant="caption">{ker.affectedCi || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{ker.createdBySpName || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip isActive={ker.isActive} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{fmt(ker.createdAt)}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Right detail panel */}
        {selected && (
          <KerDetailPanel
            ker={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Box>
    </Box>
  );
}
