import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableHead,
  TableRow, TablePagination, Skeleton, InputAdornment, Stack,
  Switch, FormControlLabel,
} from '@mui/material';

import AddIcon        from '@mui/icons-material/Add';
import EditIcon       from '@mui/icons-material/Edit';
import DeleteIcon     from '@mui/icons-material/Delete';
import SearchIcon     from '@mui/icons-material/Search';
import CloseIcon      from '@mui/icons-material/Close';
import RefreshIcon    from '@mui/icons-material/Refresh';
import LayersIcon     from '@mui/icons-material/Layers';
import CategoryIcon   from '@mui/icons-material/Category';
import InventoryIcon  from '@mui/icons-material/Inventory';
import BuildIcon      from '@mui/icons-material/Build';
import FilterListIcon from '@mui/icons-material/FilterList';

import toast from '../../../utils/toast';

import {
  getServiceTypes,    createServiceType,    updateServiceType,    deleteServiceType,
  getServiceCategories, createCategory,     updateCategory,       deleteCategory,
  getSubcategoriesByCategory, createSubcategory, updateSubcategory, deleteSubcategory,
  getAllServices,      createService,        updateService,        deleteService,
} from '../../../api/serviceCatalogApi';

import PageHeader from '../../../components/common/PageHeader';

/* ══════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════ */
const NAVY        = '#27235C';
const ACCENT      = '#97247E';
const BORDER      = '#EBEBF5';
const TEXT_MUTED  = '#9CA3AF';
const ACTIVE_BG   = '#EEF2FF';
const SURFACE     = '#F7F6FC';

const NAV_ITEMS = [
  { key: 'type',        label: 'Service Types',  Icon: LayersIcon,    color: { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' } },
  { key: 'category',    label: 'Categories',     Icon: CategoryIcon,  color: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' } },
  { key: 'subcategory', label: 'Subcategories',  Icon: InventoryIcon, color: { bg: '#CCFBF1', text: '#0F766E', border: '#99F6E4' } },
  { key: 'item',        label: 'Items',          Icon: BuildIcon,     color: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' } },
];

/* ══════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
══════════════════════════════════════════ */
function StatusChip({ active = true }) {
  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        height: 20, fontSize: '0.65rem', fontWeight: 700,
        bgcolor: active ? '#EDFAF2' : '#F9FAFB',
        color:   active ? '#24A148' : TEXT_MUTED,
        border:  `1px solid ${active ? '#A7F3D0' : BORDER}`,
      }}
    />
  );
}

function TypeBadge({ kind }) {
  const item = NAV_ITEMS.find(n => n.key === kind);
  if (!item) return null;
  return (
    <Chip
      label={item.label.replace(/s$/, '')}
      size="small"
      sx={{
        height: 18, fontSize: '0.6rem', fontWeight: 700,
        bgcolor: item.color.bg, color: item.color.text,
        border: `1px solid ${item.color.border}`,
      }}
    />
  );
}

function ConfirmDeleteDialog({ open, name, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus
      disableRestoreFocus
      keepMounted={false}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography fontSize="0.875rem">
          Are you sure you want to delete <b>{name}</b>? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}
          sx={{ textTransform: 'none', borderRadius: '8px' }}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ══════════════════════════════════════════
   LEFT NAV PANEL
══════════════════════════════════════════ */
function LeftNav({ activeKey, onSelect, counts }) {
  return (
    <Box sx={{
      width: 240, flexShrink: 0,
      borderRight: `1px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column',
      bgcolor: SURFACE,
    }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2.2, borderBottom: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', letterSpacing: 0.1 }}>
          Catalog
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED, mt: 0.2 }}>
          Manage all catalog entities
        </Typography>
      </Box>

      {/* Nav items */}
      <Box sx={{ py: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = activeKey === item.key;
          const { Icon, color } = item;
          return (
            <Box
              key={item.key}
              onClick={() => onSelect(item.key)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                mx: 1.5, mb: 0.5, px: 1.5, py: 1.2,
                borderRadius: '9px', cursor: 'pointer',
                bgcolor: active ? '#fff' : 'transparent',
                border: active ? `1.5px solid ${BORDER}` : '1.5px solid transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.12s',
                '&:hover': { bgcolor: active ? '#fff' : 'rgba(0,0,0,0.03)' },
              }}
            >
              {/* Icon box */}
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                bgcolor: active ? color.bg : '#EBEBF5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.12s',
              }}>
                <Icon sx={{ fontSize: 16, color: active ? color.text : TEXT_MUTED }} />
              </Box>

              {/* Label + count */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.825rem', fontWeight: active ? 700 : 500,
                  color: active ? NAVY : '#374151',
                  lineHeight: 1.2,
                }}>
                  {item.label}
                </Typography>
              </Box>

              {/* Count badge */}
              <Chip
                label={counts[item.key] ?? 0}
                size="small"
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                  bgcolor: active ? color.bg : '#EBEBF5',
                  color:   active ? color.text : TEXT_MUTED,
                  border: `1px solid ${active ? color.border : BORDER}`,
                  minWidth: 28,
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Footer hint */}
      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontSize: '0.68rem', color: TEXT_MUTED }}>
          Click a section to view &amp; manage its data
        </Typography>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════
   TABLE COLUMNS CONFIG PER KIND
══════════════════════════════════════════ */
function getColumns(kind, typeMap, catMap, subMap, categories) {
  if (kind === 'type') {
    return [
      { id: 'id',     label: 'ID',     render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',   label: 'Name',   render: r => r.name },
      { id: 'status', label: 'Status', render: () => <StatusChip /> },
    ];
  }
  if (kind === 'category') {
    return [
      { id: 'id',          label: 'ID',           render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',        label: 'Name',         render: r => r.name },
      { id: 'serviceType', label: 'Service Type', render: r => typeMap[r.serviceTypeId] ?? '—' },
      { id: 'status',      label: 'Status',       render: () => <StatusChip /> },
    ];
  }
  if (kind === 'subcategory') {
    return [
      { id: 'id',          label: 'ID',           render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',        label: 'Name',         render: r => r.name },
      { id: 'serviceType', label: 'Service Type', render: r => { const cat = (categories || []).find(c => c.id === r.categoryId); return typeMap[cat?.serviceTypeId] ?? '—'; } },
      { id: 'category',    label: 'Category',     render: r => catMap[r.categoryId] ?? '—' },
      { id: 'status',      label: 'Status',       render: () => <StatusChip /> },
    ];
  }
  if (kind === 'item') {
    return [
      { id: 'id',          label: 'ID',           render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',        label: 'Name',         render: r => r.name },
      { id: 'serviceType', label: 'Service Type', render: r => { const cat = (categories || []).find(c => c.id === r.categoryId); return typeMap[cat?.serviceTypeId] ?? '—'; } },
      { id: 'category',    label: 'Category',     render: r => catMap[r.categoryId] ?? '—' },
      { id: 'subcategory', label: 'Subcategory',  render: r => subMap[r.subcategoryId] ?? '—' },
      { id: 'slaHours',          label: 'SLA (hrs)',       render: r => r.slaHours ?? '—' },
      { id: 'accessDateRequired', label: 'Access Date Req.', render: r => (
        <Chip
          label={r.accessDateRequired ? 'Yes' : 'No'}
          size="small"
          sx={{
            height: 20, fontSize: '0.65rem', fontWeight: 700,
            bgcolor: r.accessDateRequired ? '#EDE9FE' : '#F3F4F6',
            color:   r.accessDateRequired ? '#6D28D9' : '#6B7280',
            border: `1px solid ${r.accessDateRequired ? '#C4B5FD' : '#E5E7EB'}`,
          }}
        />
      ) },
      { id: 'status',             label: 'Status',          render: () => <StatusChip /> },
    ];
  }
  return [];
}

/* ══════════════════════════════════════════
   RIGHT PANEL — HEADER + FILTERS + TABLE
══════════════════════════════════════════ */
function RightPanel({
  activeKey, data, loading,
  serviceTypes, categories, subcategories,
  typeMap, catMap, subMap,
  onAdd, onEdit, onDelete,
}) {
  const nav = NAV_ITEMS.find(n => n.key === activeKey);

  /* ── filter state ── */
  const [search,       setSearch]       = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [filterCatId,  setFilterCatId]  = useState('');
  const [filterSubId,  setFilterSubId]  = useState('');

  /* ── pagination state ── */
  const [page,        setPage]        = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* reset filters + page when tab changes */
  useEffect(() => {
    setSearch(''); setFilterTypeId(''); setFilterCatId(''); setFilterSubId('');
    setPage(0);
  }, [activeKey]);

  /* ── derived: category list filtered by service type ── */
  const filteredCats = useMemo(() => {
    if (!filterTypeId) return categories;
    return categories.filter(c => c.serviceTypeId === filterTypeId);
  }, [categories, filterTypeId]);

  /* ── derived: subcategory list filtered by category ── */
  const filteredSubs = useMemo(() => {
    if (!filterCatId) return subcategories;
    return subcategories.filter(s => s.categoryId === filterCatId);
  }, [subcategories, filterCatId]);

  /* ── filtered rows ── */
  const rows = useMemo(() => {
    return data.filter(row => {
      const matchSearch = !search || row.name?.toLowerCase().includes(search.toLowerCase());

      if (activeKey === 'category') {
        return matchSearch && (!filterTypeId || row.serviceTypeId === filterTypeId);
      }
      if (activeKey === 'subcategory') {
        const cat = categories.find(c => c.id === row.categoryId);
        const matchType = !filterTypeId || cat?.serviceTypeId === filterTypeId;
        const matchCat  = !filterCatId  || row.categoryId === filterCatId;
        return matchSearch && matchType && matchCat;
      }
      if (activeKey === 'item') {
        const cat = categories.find(c => c.id === row.categoryId);
        const matchType = !filterTypeId || cat?.serviceTypeId === filterTypeId;
        const matchCat  = !filterCatId  || row.categoryId === filterCatId;
        const matchSub  = !filterSubId  || row.subcategoryId === filterSubId;
        return matchSearch && matchType && matchCat && matchSub;
      }
      return matchSearch;
    });
  }, [data, search, filterTypeId, filterCatId, filterSubId, activeKey, categories]);

  /* sort by id ascending */
  const sortedRows = useMemo(() => [...rows].sort((a, b) => (a.id ?? '').toString().localeCompare((b.id ?? '').toString(), undefined, { numeric: true })), [rows]);

  const columns = getColumns(activeKey, typeMap, catMap, subMap, categories);
  const hasFilters = activeKey !== 'type';
  const activeFiltersCount = [filterTypeId, filterCatId, filterSubId].filter(Boolean).length;

  /* reset to page 0 when filters/search change */
  useEffect(() => { setPage(0); }, [search, filterTypeId, filterCatId, filterSubId]);

  /* paginated slice */
  const pagedRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const selectSx = {
    borderRadius: '8px', fontSize: '0.78rem',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7D2FE' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: NAVY },
    bgcolor: '#fff',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Panel header ── */}
      <Box sx={{
        px: 3, py: 2.2,
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        bgcolor: '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {nav && (
            <Box sx={{
              width: 36, height: 36, borderRadius: '9px',
              bgcolor: SURFACE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <nav.Icon sx={{ fontSize: 18, color: nav.color.text }} />
            </Box>
          )}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>
              {nav?.label ?? '—'}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED }}>
              {sortedRows.length} {sortedRows.length === 1 ? 'record' : 'records'} {activeFiltersCount > 0 ? `(filtered)` : ''}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
          onClick={onAdd}
          sx={{
            bgcolor: NAVY, '&:hover': { bgcolor: ACCENT },
            borderRadius: '9px', textTransform: 'none',
            fontSize: '0.8rem', fontWeight: 700,
            px: 2, py: 0.85, boxShadow: 'none',
          }}
        >
          Add {nav?.label?.replace(/s$/, '')}
        </Button>
      </Box>

      {/* ── Filter bar ── */}
      {hasFilters && (
        <Box sx={{
          px: 3, py: 1.5,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
          display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FilterListIcon sx={{ fontSize: 15, color: TEXT_MUTED }} />
            <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, fontWeight: 600 }}>
              FILTER
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            placeholder="Search name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', fontSize: '0.78rem', bgcolor: '#fff',
                '& fieldset': { borderColor: BORDER },
                '&:hover fieldset': { borderColor: '#C7D2FE' },
                '&.Mui-focused fieldset': { borderColor: NAVY },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 15, color: TEXT_MUTED }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <CloseIcon sx={{ fontSize: 12, color: TEXT_MUTED }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Service Type filter (categories, subcategories, items) */}
          {(activeKey === 'category' || activeKey === 'subcategory' || activeKey === 'item') && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: '0.78rem' }}>Service Type</InputLabel>
              <Select
                value={filterTypeId}
                label="Service Type"
                onChange={e => { setFilterTypeId(e.target.value); setFilterCatId(''); setFilterSubId(''); }}
                sx={selectSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.78rem' }}><em>All types</em></MenuItem>
                {serviceTypes.map(t => (
                  <MenuItem key={t.id} value={t.id} sx={{ fontSize: '0.78rem' }}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Category filter (subcategories, items) */}
          {(activeKey === 'subcategory' || activeKey === 'item') && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: '0.78rem' }}>Category</InputLabel>
              <Select
                value={filterCatId}
                label="Category"
                onChange={e => { setFilterCatId(e.target.value); setFilterSubId(''); }}
                sx={selectSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.78rem' }}><em>All categories</em></MenuItem>
                {filteredCats.map(c => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.78rem' }}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Subcategory filter (items only) */}
          {activeKey === 'item' && (
            <FormControl size="small" sx={{ minWidth: 160 }} disabled={!filterCatId}>
              <InputLabel sx={{ fontSize: '0.78rem' }}>Subcategory</InputLabel>
              <Select
                value={filterSubId}
                label="Subcategory"
                onChange={e => setFilterSubId(e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.78rem' }}><em>All subcategories</em></MenuItem>
                {filteredSubs.map(s => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.78rem' }}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <Button
              size="small"
              onClick={() => { setFilterTypeId(''); setFilterCatId(''); setFilterSubId(''); }}
              sx={{
                textTransform: 'none', fontSize: '0.72rem', color: ACCENT,
                '&:hover': { bgcolor: '#FDF2FA' },
              }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      )}

      {/* Search-only bar for Service Types */}
      {!hasFilters && (
        <Box sx={{
          px: 3, py: 1.5,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <TextField
            placeholder="Search name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', fontSize: '0.78rem', bgcolor: '#fff',
                '& fieldset': { borderColor: BORDER },
                '&:hover fieldset': { borderColor: '#C7D2FE' },
                '&.Mui-focused fieldset': { borderColor: NAVY },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 15, color: TEXT_MUTED }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {/* ── Table ── */}
      <Box sx={{
        flexGrow: 1, overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: BORDER, borderRadius: 2 },
      }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id} sx={{
                  fontWeight: 700, fontSize: '0.7rem', color: '#6B7280',
                  textTransform: 'uppercase', letterSpacing: 0.7,
                  py: 1.4, bgcolor: SURFACE,
                  borderBottom: `2px solid ${BORDER}`,
                }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={{
                fontWeight: 700, fontSize: '0.7rem', color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: 0.7,
                py: 1.4, bgcolor: SURFACE,
                borderBottom: `2px solid ${BORDER}`,
                width: 90,
              }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell key={col.id} sx={{ py: 1.2 }}>
                      <Skeleton height={16} width={col.id === 'id' ? '60%' : '80%'} />
                    </TableCell>
                  ))}
                  <TableCell sx={{ py: 1.2 }}><Skeleton height={16} width={60} /></TableCell>
                </TableRow>
              ))
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} sx={{ textAlign: 'center', py: 6, color: TEXT_MUTED, border: 'none' }}>
                  <SearchIcon sx={{ fontSize: 28, mb: 1, display: 'block', mx: 'auto', opacity: 0.4 }} />
                  <Typography fontSize="0.82rem">No records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, i) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': { bgcolor: ACTIVE_BG },
                    '&:last-child td': { borderBottom: 'none' },
                    bgcolor: i % 2 === 0 ? '#fff' : '#FAFAFA',
                  }}
                >
                  {columns.map(col => (
                    <TableCell key={col.id} sx={{
                      fontSize: '0.82rem', py: 1.3, color: '#1F2937',
                      fontWeight: col.id === 'name' ? 600 : 400,
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                  <TableCell sx={{ py: 1.3, borderBottom: `1px solid ${BORDER}` }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(row)} sx={{
                          p: 0.6, borderRadius: '6px',
                          '&:hover': { bgcolor: ACTIVE_BG, color: NAVY },
                        }}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => onDelete(row)} sx={{
                          p: 0.6, borderRadius: '6px',
                          '&:hover': { bgcolor: '#FFF1F2', color: '#E01950' },
                        }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* ── Pagination footer ── */}
      <Box sx={{
        borderTop: `1px solid ${BORDER}`,
        bgcolor: SURFACE,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 0.5, flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>
          {rows.length === 0
            ? 'No records'
            : `Showing ${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, rows.length)} of ${rows.length}`}
        </Typography>
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows:"
          sx={{
            border: 'none',
            '& .MuiTablePagination-toolbar': { minHeight: 40, px: 0 },
            '& .MuiTablePagination-selectLabel': { fontSize: '0.72rem', color: TEXT_MUTED, mb: 0 },
            '& .MuiTablePagination-select': { fontSize: '0.72rem' },
            '& .MuiIconButton-root': { p: 0.6 },
            '& .MuiTablePagination-displayedRows': { display: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ServiceCatalogManagePage() {
  /* ── raw data ── */
  const [serviceTypes,  setServiceTypes]  = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);

  /* ── UI state ── */
  const [activeKey, setActiveKey] = useState('type');

  /* ── dialog / delete ── */
  const [dialog,       setDialog]       = useState(null); // { mode, kind, row? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dialogSubs,   setDialogSubs]   = useState([]);

  /* form fields */
  const [fName,   setFName]   = useState('');
  const [fDesc,   setFDesc]   = useState('');
  const [fTypeId, setFTypeId] = useState('');
  const [fCatId,  setFCatId]  = useState('');
  const [fSubId,  setFSubId]  = useState('');
  const [fSla,    setFSla]    = useState('');
  const [fAccessDateRequired, setFAccessDateRequired] = useState(false);

  /* ── load all data ── */
  const loadAll = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes] = await Promise.all([
        getServiceTypes(),
        getServiceCategories(),
        getAllServices(),
      ]);
      const types = Array.isArray(tRes.data) ? tRes.data : [];
      const cats  = Array.isArray(cRes.data) ? cRes.data : [];
      const svcs  = Array.isArray(sRes.data) ? sRes.data : [];
      setServiceTypes(types);
      setCategories(cats);
      setItems(svcs);

      const allSubs = [];
      await Promise.all(
        cats.map(c =>
          getSubcategoriesByCategory(c.id)
            .then(r => { if (Array.isArray(r.data)) allSubs.push(...r.data); })
            .catch(() => {})
        )
      );
      setSubcategories(allSubs);
    } catch {
      toast.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  /* load subs when category changes in dialog */
  useEffect(() => {
    if (!fCatId) { setDialogSubs([]); return; }
    getSubcategoriesByCategory(fCatId).then(r => setDialogSubs(r.data)).catch(() => setDialogSubs([]));
  }, [fCatId]);

  /* ── maps ── */
  const typeMap = useMemo(() => Object.fromEntries((Array.isArray(serviceTypes) ? serviceTypes : []).map(t => [t.id, t.name])), [serviceTypes]);
  const catMap  = useMemo(() => Object.fromEntries((Array.isArray(categories)    ? categories    : []).map(c => [c.id, c.name])),  [categories]);
  const subMap  = useMemo(() => Object.fromEntries((Array.isArray(subcategories) ? subcategories : []).map(s => [s.id, s.name])), [subcategories]);

  const counts = useMemo(() => ({
    type: Array.isArray(serviceTypes) ? serviceTypes.length : 0,
    category: Array.isArray(categories) ? categories.length : 0,
    subcategory: Array.isArray(subcategories) ? subcategories.length : 0,
    item: Array.isArray(items) ? items.length : 0,
  }), [serviceTypes, categories, subcategories, items]);

  /* active data for current tab */
  const activeData = useMemo(() => {
    if (activeKey === 'type')        return Array.isArray(serviceTypes)  ? serviceTypes  : [];
    if (activeKey === 'category')    return Array.isArray(categories)    ? categories    : [];
    if (activeKey === 'subcategory') return Array.isArray(subcategories) ? subcategories : [];
    if (activeKey === 'item')        return Array.isArray(items)         ? items         : [];
    return [];
  }, [activeKey, serviceTypes, categories, subcategories, items]);

  /* ── open add ── */
  const openAdd = () => {
    setFName(''); setFDesc(''); setFTypeId(''); setFCatId(''); setFSubId(''); setFSla(''); setFAccessDateRequired(false);
    setDialog({ mode: 'add', kind: activeKey });
  };

  /* ── open edit ── */
  const openEdit = (row) => {
    setFName(row.name ?? '');
    setFDesc(row.description ?? '');
    setFTypeId(row.serviceTypeId ?? '');
    setFCatId(row.categoryId ?? '');
    setFSubId(row.subcategoryId ?? '');
    setFSla(row.slaHours ?? '');
    setFAccessDateRequired(row.accessDateRequired ?? false);
    setDialog({ mode: 'edit', kind: activeKey, row });
  };

  /* ── save ── */
  const handleSave = async () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const { kind, mode, row } = dialog;
    try {
      if (kind === 'type') {
        const body = { name: fName.trim() };
        mode === 'edit' ? await updateServiceType(row.id, body) : await createServiceType(body);
      } else if (kind === 'category') {
        if (!fTypeId) { toast.error('Select a service type'); return; }
        const body = { name: fName.trim(), serviceTypeId: fTypeId };
        mode === 'edit' ? await updateCategory(row.id, body) : await createCategory(body);
      } else if (kind === 'subcategory') {
        if (!fCatId) { toast.error('Select a category'); return; }
        const body = { name: fName.trim(), categoryId: fCatId };
        mode === 'edit' ? await updateSubcategory(row.id, body) : await createSubcategory(body);
      } else if (kind === 'item') {
        const body = {
          name: fName.trim(), description: fDesc.trim(),
          categoryId: fCatId || null, subcategoryId: fSubId || null,
          slaHours: fSla ? Number(fSla) : null,
          accessDateRequired: fAccessDateRequired,
        };
        mode === 'edit' ? await updateService(row.id, body) : await createService(body);
      }
      setDialog(null);
      setTimeout(() => toast.success(mode === 'edit' ? 'Updated successfully' : 'Created successfully'), 150);
      loadAll();
    } catch { setTimeout(() => toast.error('Save failed'), 150); }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { kind, id, name } = deleteTarget;

    /* ── Pre-flight checks: block if children exist ── */
    if (kind === 'type') {
      const childCatIds = categories.filter(c => c.serviceTypeId === id).map(c => c.id);
      const childCats   = childCatIds.length;
      const childSubs   = subcategories.filter(s => childCatIds.includes(s.categoryId)).length;
      const childItems  = items.filter(i => childCatIds.includes(i.categoryId)).length;

      if (childCats > 0 || childSubs > 0 || childItems > 0) {
        const parts = [];
        if (childCats)  parts.push(`${childCats} categor${childCats === 1 ? 'y' : 'ies'}`);
        if (childSubs)  parts.push(`${childSubs} subcategor${childSubs === 1 ? 'y' : 'ies'}`);
        if (childItems) parts.push(`${childItems} item${childItems === 1 ? '' : 's'}`);
        setDeleteTarget(null);
        toast.error(`Cannot delete "${name}". It still contains ${parts.join(', ')}. Please remove them first.`);
        return;
      }
    }

    if (kind === 'category') {
      const childSubs  = subcategories.filter(s => s.categoryId === id);
      const childItems = items.filter(i => i.categoryId === id);
      if (childSubs.length > 0 || childItems.length > 0) {
        const parts = [];
        if (childSubs.length)  parts.push(`${childSubs.length} subcategor${childSubs.length === 1 ? 'y' : 'ies'}`);
        if (childItems.length) parts.push(`${childItems.length} item${childItems.length === 1 ? '' : 's'}`);
        setDeleteTarget(null);
        toast.error(`Cannot delete "${name}". It still contains ${parts.join(' and ')}. Please remove them first.`);
        return;
      }
    }

    if (kind === 'subcategory') {
      const childItems = items.filter(i => i.subcategoryId === id);
      if (childItems.length > 0) {
        setDeleteTarget(null);
        toast.error(`Cannot delete "${name}". It still contains ${childItems.length} item${childItems.length === 1 ? '' : 's'}. Please remove them first.`);
        return;
      }
    }

    /* ── Proceed with delete ── */
    setDeleteTarget(null);
    try {
      if      (kind === 'type')        await deleteServiceType(id);
      else if (kind === 'category')    await deleteCategory(id);
      else if (kind === 'subcategory') await deleteSubcategory(id);
      else if (kind === 'item')        await deleteService(id);

      setTimeout(() => toast.success(`"${name}" deleted successfully.`), 150);
      loadAll();
    } catch {
      setTimeout(() => toast.error('Delete failed. Please try again.'), 150);
    }
  };

  const nav = NAV_ITEMS.find(n => n.key === activeKey);
  const dialogTitle = dialog
    ? `${dialog.mode === 'edit' ? 'Edit' : 'Add'} ${NAV_ITEMS.find(n => n.key === dialog?.kind)?.label?.replace(/s$/, '') ?? ''}`
    : '';

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <PageHeader
          title="Manage Service Catalog"
          subtitle="Create and manage service types, categories, subcategories, and items"
        />
        <Tooltip title="Refresh data">
          <IconButton onClick={loadAll} size="small" sx={{ color: TEXT_MUTED, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 0.8 }}>
            <RefreshIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Main two-column layout ── */}
      <Box sx={{
        display: 'flex', gap: 0,
        border: `1px solid ${BORDER}`,
        borderRadius: '14px',
        overflow: 'hidden',
        minHeight: 600,
        bgcolor: '#fff',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      }}>

        {/* LEFT NAV */}
        <LeftNav activeKey={activeKey} onSelect={setActiveKey} counts={counts} />

        {/* RIGHT PANEL */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <RightPanel
            activeKey={activeKey}
            data={activeData}
            loading={loading}
            serviceTypes={serviceTypes}
            categories={categories}
            subcategories={subcategories}
            typeMap={typeMap}
            catMap={catMap}
            subMap={subMap}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={row => setDeleteTarget({ ...row, kind: activeKey })}
          />
        </Box>
      </Box>

      {/* ══════════ ADD / EDIT DIALOG ══════════ */}
      <Dialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableRestoreFocus
        keepMounted={false}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pr: 6 }}>
          {dialogTitle}
          <IconButton onClick={() => setDialog(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {dialog && (
            <Stack spacing={2} mt={1}>
              {/* Name (all kinds) */}
              <TextField
                label="Name" fullWidth size="small"
                value={fName} onChange={e => setFName(e.target.value)}
              />

              {/* Service Type selector (category) */}
              {dialog.kind === 'category' && (
                <FormControl fullWidth size="small">
                  <InputLabel>Service Type</InputLabel>
                  <Select value={fTypeId} label="Service Type" onChange={e => setFTypeId(e.target.value)}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {serviceTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Category selector (subcategory + item) */}
              {(dialog.kind === 'subcategory' || dialog.kind === 'item') && (
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={fCatId} label="Category"
                    onChange={e => { setFCatId(e.target.value); setFSubId(''); }}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Subcategory selector (item) */}
              {dialog.kind === 'item' && (
                <FormControl fullWidth size="small" disabled={!fCatId}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select value={fSubId} label="Subcategory" onChange={e => setFSubId(e.target.value)}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {dialogSubs.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Description + SLA (item) */}
              {dialog.kind === 'item' && (
                <>
                  <TextField
                    label="Description" fullWidth size="small" multiline rows={2}
                    value={fDesc} onChange={e => setFDesc(e.target.value)}
                  />
                  <TextField
                    label="SLA (hours)" fullWidth size="small" type="number"
                    value={fSla} onChange={e => setFSla(e.target.value)}
                  />
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 1.5, py: 1, border: '1px solid #EBEBF5', borderRadius: '8px',
                    bgcolor: fAccessDateRequired ? '#F5F3FF' : '#FAFAFA',
                  }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1F2937' }}>
                        Access Date Required
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                        User must provide an access start date when requesting this item
                      </Typography>
                    </Box>
                    <Switch
                      checked={fAccessDateRequired}
                      onChange={e => setFAccessDateRequired(e.target.checked)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D28D9' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6D28D9' },
                      }}
                    />
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{
              bgcolor: NAVY, '&:hover': { bgcolor: ACCENT },
              textTransform: 'none', borderRadius: '8px',
            }}>
            {dialog?.mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════ DELETE CONFIRM ══════════ */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
