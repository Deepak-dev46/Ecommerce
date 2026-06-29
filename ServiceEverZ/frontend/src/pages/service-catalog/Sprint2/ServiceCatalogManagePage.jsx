import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableHead,
  TableRow, TablePagination, Skeleton, InputAdornment, Stack,
  Switch,
} from '@mui/material';

import AddIcon        from '@mui/icons-material/Add';
import EditIcon       from '@mui/icons-material/Edit';
import DeleteIcon     from '@mui/icons-material/Delete';
import ToggleOnIcon   from '@mui/icons-material/ToggleOn';
import ToggleOffIcon  from '@mui/icons-material/ToggleOff';
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

// FIX: toggleServiceActive moved to managerCatalogApi so authAxios sends
// JWT + X-User-Role header automatically (required by the backend controller).
import { toggleServiceActive } from '../../../api/managerCatalogApi';

import PageHeader from '../../../components/common/PageHeader';

/* ══════════════════════════════════════════
   DESIGN TOKENS  — NAVY is the single core color
══════════════════════════════════════════ */
const NAVY        = '#27235C';   // primary action color everywhere
const NAVY_DARK   = '#1D1A47';   // hover for primary buttons
const NAVY_LIGHT  = '#EEF0FB';   // tinted bg for active nav / table hover
const NAVY_MID    = '#3D38A0';   // focus rings / active indicators
const BORDER      = '#E4E4EF';
const TEXT_MUTED  = '#9CA3AF';
const SURFACE     = '#F8F8FC';   // very slight navy-tint on backgrounds
const TEXT_MAIN   = '#1F1B4B';   // dark navy for important text

/* Per-section accent palette — kept but icons/chips only, never buttons */
const NAV_ITEMS = [
  { key: 'type',        label: 'Service Types',  Icon: LayersIcon,    color: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' } },
  { key: 'category',    label: 'Categories',     Icon: CategoryIcon,  color: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' } },
  { key: 'subcategory', label: 'Subcategories',  Icon: InventoryIcon, color: { bg: '#CCFBF1', text: '#0F766E', border: '#99F6E4' } },
  { key: 'item',        label: 'Items',          Icon: BuildIcon,     color: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' } },
];

/* ══════════════════════════════════════════
   SHARED BUTTON STYLE — one place to update
══════════════════════════════════════════ */
const primaryBtnSx = {
  bgcolor: NAVY,
  color: '#fff',
  '&:hover': { bgcolor: NAVY_DARK },
  textTransform: 'none',
  borderRadius: '8px',
  boxShadow: 'none',
  '&:active': { boxShadow: 'none' },
};

const ghostBtnSx = {
  color: NAVY,
  borderColor: BORDER,
  textTransform: 'none',
  borderRadius: '8px',
  '&:hover': { bgcolor: NAVY_LIGHT, borderColor: NAVY },
};

/* ══════════════════════════════════════════
   SHARED INPUT FOCUS STYLE
══════════════════════════════════════════ */
const inputFocusSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.82rem',
    bgcolor: '#fff',
    '& fieldset': { borderColor: BORDER },
    '&:hover fieldset': { borderColor: NAVY_MID },
    '&.Mui-focused fieldset': { borderColor: NAVY, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: NAVY },
};

const selectFocusSx = {
  borderRadius: '8px',
  fontSize: '0.78rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: NAVY_MID },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: NAVY, borderWidth: '2px' },
  bgcolor: '#fff',
};

/* ══════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
══════════════════════════════════════════ */
function StatusChip({ active }) {
  const isActive = active !== false; // default true if undefined
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.68rem',
        fontWeight: 700,
        borderRadius: '6px',
        bgcolor: isActive ? '#EDFAF2' : '#F3F4F6',
        color:   isActive ? '#16A34A' : TEXT_MUTED,
        border:  `1px solid ${isActive ? '#BBF7D0' : BORDER}`,
        letterSpacing: 0.2,
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
        height: 20, fontSize: '0.62rem', fontWeight: 700, borderRadius: '5px',
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
      PaperProps={{
        sx: { borderRadius: '14px', boxShadow: '0 8px 32px rgba(39,35,92,0.14)' },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: TEXT_MAIN, pb: 1 }}>
        Confirm Delete
      </DialogTitle>
      <DialogContent>
        <Typography fontSize="0.875rem" color="#374151">
          Are you sure you want to delete <b style={{ color: TEXT_MAIN }}>{name}</b>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={ghostBtnSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{ ...primaryBtnSx, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
        >
          Delete
        </Button>
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
      width: 232,
      flexShrink: 0,
      borderRight: `1px solid ${BORDER}`,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: SURFACE,
    }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2.2, borderBottom: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: TEXT_MAIN, letterSpacing: 0.2 }}>
          Catalog
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED, mt: 0.3 }}>
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
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mx: 1.5,
                mb: 0.4,
                px: 1.5,
                py: 1.1,
                borderRadius: '10px',
                cursor: 'pointer',
                bgcolor: active ? '#fff' : 'transparent',
                border: active ? `1.5px solid ${BORDER}` : '1.5px solid transparent',
                boxShadow: active ? '0 1px 4px rgba(39,35,92,0.08)' : 'none',
                transition: 'all 0.13s ease',
                '&:hover': { bgcolor: active ? '#fff' : NAVY_LIGHT },
              }}
            >
              {/* Icon box */}
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                flexShrink: 0,
                bgcolor: active ? NAVY : '#EBEBF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.13s ease',
              }}>
                <Icon sx={{ fontSize: 15, color: active ? '#fff' : TEXT_MUTED }} />
              </Box>

              {/* Label */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? NAVY : '#374151',
                  lineHeight: 1.2,
                  letterSpacing: active ? 0.1 : 0,
                }}>
                  {item.label}
                </Typography>
              </Box>

              {/* Count badge */}
              <Chip
                label={counts[item.key] ?? 0}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.63rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  bgcolor: active ? NAVY_LIGHT : '#EBEBF5',
                  color:   active ? NAVY : TEXT_MUTED,
                  border:  `1px solid ${active ? '#C5C2E8' : BORDER}`,
                  minWidth: 28,
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Footer hint */}
      <Box sx={{ px: 2.5, py: 1.8, borderTop: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontSize: '0.67rem', color: TEXT_MUTED, lineHeight: 1.5 }}>
          Select a section to view and manage its records
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
      { id: 'id',     label: 'ID',     render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',   label: 'Name',   render: r => r.name },
      { id: 'status', label: 'Status', render: () => <StatusChip /> },
    ];
  }
  if (kind === 'category') {
    return [
      { id: 'id',          label: 'ID',           render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',        label: 'Name',         render: r => r.name },
      { id: 'serviceType', label: 'Service Type', render: r => typeMap[r.serviceTypeId] ?? '—' },
      { id: 'status',      label: 'Status',       render: () => <StatusChip /> },
    ];
  }
  if (kind === 'subcategory') {
    return [
      { id: 'id',          label: 'ID',           render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',        label: 'Name',         render: r => r.name },
      { id: 'serviceType', label: 'Service Type', render: r => { const cat = (categories || []).find(c => c.id === r.categoryId); return typeMap[cat?.serviceTypeId] ?? '—'; } },
      { id: 'category',    label: 'Category',     render: r => catMap[r.categoryId] ?? '—' },
      { id: 'status',      label: 'Status',       render: () => <StatusChip /> },
    ];
  }
  if (kind === 'item') {
    return [
      { id: 'id',               label: 'ID',               render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: TEXT_MUTED }}>{r.id}</Typography> },
      { id: 'name',             label: 'Name',             render: r => r.name },
      { id: 'serviceType',      label: 'Service Type',     render: r => { const cat = (categories || []).find(c => c.id === r.categoryId); return typeMap[cat?.serviceTypeId] ?? '—'; } },
      { id: 'category',         label: 'Category',         render: r => catMap[r.categoryId] ?? '—' },
      { id: 'subcategory',      label: 'Subcategory',      render: r => subMap[r.subcategoryId] ?? '—' },
      { id: 'slaHours',         label: 'SLA (hrs)',        render: r => r.slaHours ?? '—' },
      { id: 'accessDateRequired', label: 'Access Date',   render: r => (
        <Chip
          label={r.accessDateRequired ? 'Required' : 'Optional'}
          size="small"
          sx={{
            height: 20, fontSize: '0.63rem', fontWeight: 700, borderRadius: '5px',
            bgcolor: r.accessDateRequired ? NAVY_LIGHT : '#F3F4F6',
            color:   r.accessDateRequired ? NAVY : '#6B7280',
            border:  `1px solid ${r.accessDateRequired ? '#C5C2E8' : '#E5E7EB'}`,
          }}
        />
      ) },
      { id: 'status', label: 'Status', render: r => <StatusChip active={r.active} /> },
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
  onAdd, onEdit, onDelete, onToggleActive,
}) {
  

  const nav = NAV_ITEMS.find(n => n.key === activeKey);

  /* filter state */
  const [search,       setSearch]       = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [filterCatId,  setFilterCatId]  = useState('');
  const [filterSubId,  setFilterSubId]  = useState('');

  /* pagination */
  const [page,        setPage]        = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* reset on tab change */
  useEffect(() => {
    setSearch(''); setFilterTypeId(''); setFilterCatId(''); setFilterSubId('');
    setPage(0);
  }, [activeKey]);

  const filteredCats = useMemo(() => {
    if (!filterTypeId) return categories;
    return categories.filter(c => c.serviceTypeId === filterTypeId);
  }, [categories, filterTypeId]);

  const filteredSubs = useMemo(() => {
    if (!filterCatId) return subcategories;
    return subcategories.filter(s => s.categoryId === filterCatId);
  }, [subcategories, filterCatId]);

  const rows = useMemo(() => {
    return data.filter(row => {
      const matchSearch = !search || row.name?.toLowerCase().includes(search.toLowerCase());
      if (activeKey === 'category') {
        return matchSearch && (!filterTypeId || row.serviceTypeId === filterTypeId);
      }
      if (activeKey === 'subcategory') {
        const cat = categories.find(c => c.id === row.categoryId);
        return matchSearch && (!filterTypeId || cat?.serviceTypeId === filterTypeId) && (!filterCatId || row.categoryId === filterCatId);
      }
      if (activeKey === 'item') {
        const cat = categories.find(c => c.id === row.categoryId);
        return matchSearch
          && (!filterTypeId || cat?.serviceTypeId === filterTypeId)
          && (!filterCatId  || row.categoryId === filterCatId)
          && (!filterSubId  || row.subcategoryId === filterSubId);
      }
      return matchSearch;
    });
  }, [data, search, filterTypeId, filterCatId, filterSubId, activeKey, categories]);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.id ?? '').toString().localeCompare((b.id ?? '').toString(), undefined, { numeric: true })),
    [rows]
  );

  const columns = getColumns(activeKey, typeMap, catMap, subMap, categories);
  const hasFilters = activeKey !== 'type';
  const activeFiltersCount = [filterTypeId, filterCatId, filterSubId].filter(Boolean).length;

  useEffect(() => { setPage(0); }, [search, filterTypeId, filterCatId, filterSubId]);

  const pagedRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Panel header ── */}
      <Box sx={{
        px: 3,
        py: 2,
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#fff',
        minHeight: 64,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {nav && (
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: NAVY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <nav.Icon sx={{ fontSize: 17, color: '#fff' }} />
            </Box>
          )}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.97rem', color: TEXT_MAIN, lineHeight: 1.3 }}>
              {nav?.label ?? '—'}
            </Typography>
            <Typography sx={{ fontSize: '0.69rem', color: TEXT_MUTED }}>
              {sortedRows.length} {sortedRows.length === 1 ? 'record' : 'records'}
              {activeFiltersCount > 0 && (
                <Box component="span" sx={{
                  ml: 0.8,
                  px: 0.8,
                  py: 0.1,
                  bgcolor: NAVY_LIGHT,
                  color: NAVY,
                  borderRadius: '4px',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: 0.2,
                }}>
                  FILTERED
                </Box>
              )}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
          onClick={onAdd}
          sx={{ ...primaryBtnSx, fontSize: '0.8rem', fontWeight: 600, px: 2, py: 0.85 }}
        >
          Add {nav?.label?.replace(/s$/, 's')}
        </Button>
      </Box>

      {/* ── Filter bar ── */}
      {hasFilters && (
        <Box sx={{
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <FilterListIcon sx={{ fontSize: 14, color: NAVY }} />
            <Typography sx={{ fontSize: '0.7rem', color: NAVY, fontWeight: 700, letterSpacing: 0.6 }}>
              FILTER
            </Typography>
          </Box>

          <TextField
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 190, ...inputFocusSx }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 15, color: TEXT_MUTED }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.3 }}>
                    <CloseIcon sx={{ fontSize: 12, color: TEXT_MUTED }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {(activeKey === 'category' || activeKey === 'subcategory' || activeKey === 'item') && (
            <FormControl size="small" sx={{ minWidth: 155 }}>
              <InputLabel sx={{ fontSize: '0.78rem', '&.Mui-focused': { color: NAVY } }}>Service Type</InputLabel>
              <Select
                value={filterTypeId}
                label="Service Type"
                onChange={e => { setFilterTypeId(e.target.value); setFilterCatId(''); setFilterSubId(''); }}
                sx={selectFocusSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.78rem' }}><em>All types</em></MenuItem>
                {serviceTypes.map(t => (
                  <MenuItem key={t.id} value={t.id} sx={{ fontSize: '0.78rem' }}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(activeKey === 'subcategory' || activeKey === 'item') && (
            <FormControl size="small" sx={{ minWidth: 155 }}>
              <InputLabel sx={{ fontSize: '0.78rem', '&.Mui-focused': { color: NAVY } }}>Category</InputLabel>
              <Select
                value={filterCatId}
                label="Category"
                onChange={e => { setFilterCatId(e.target.value); setFilterSubId(''); }}
                sx={selectFocusSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.78rem' }}><em>All categories</em></MenuItem>
                {filteredCats.map(c => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.78rem' }}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {activeKey === 'item' && (
            <FormControl size="small" sx={{ minWidth: 155 }} disabled={!filterCatId}>
              <InputLabel sx={{ fontSize: '0.78rem', '&.Mui-focused': { color: NAVY } }}>Subcategory</InputLabel>
              <Select
                value={filterSubId}
                label="Subcategory"
                onChange={e => setFilterSubId(e.target.value)}
                sx={selectFocusSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.78rem' }}><em>All subcategories</em></MenuItem>
                {filteredSubs.map(s => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.78rem' }}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {activeFiltersCount > 0 && (
            <Button
              size="small"
              onClick={() => { setFilterTypeId(''); setFilterCatId(''); setFilterSubId(''); }}
              sx={{ textTransform: 'none', fontSize: '0.72rem', color: NAVY, '&:hover': { bgcolor: NAVY_LIGHT } }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      )}

      {/* Search-only bar for Service Types */}
      {!hasFilters && (
        <Box sx={{
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <TextField
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 210, ...inputFocusSx }}
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
        flexGrow: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#D0D0E0', borderRadius: 2 },
      }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id} sx={{
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  color: NAVY,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  py: 1.4,
                  bgcolor: SURFACE,
                  borderBottom: `2px solid ${BORDER}`,
                  whiteSpace: 'nowrap',
                }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={{
                fontWeight: 700,
                fontSize: '0.68rem',
                color: NAVY,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                py: 1.4,
                bgcolor: SURFACE,
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
                    <TableCell key={col.id} sx={{ py: 1.3 }}>
                      <Skeleton height={16} width={col.id === 'id' ? '55%' : '75%'} sx={{ borderRadius: '4px' }} />
                    </TableCell>
                  ))}
                  <TableCell sx={{ py: 1.3 }}><Skeleton height={16} width={60} sx={{ borderRadius: '4px' }} /></TableCell>
                </TableRow>
              ))
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} sx={{ textAlign: 'center', py: 7, border: 'none' }}>
                  <Box sx={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Box sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: NAVY_LIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <SearchIcon sx={{ fontSize: 22, color: NAVY, opacity: 0.5 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, fontWeight: 500 }}>
                      No records found
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>
                      Try adjusting your search or filters
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, i) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': { bgcolor: NAVY_LIGHT },
                    '&:last-child td': { borderBottom: 'none' },
                    bgcolor: i % 2 === 0 ? '#fff' : '#FAFAFA',
                    transition: 'background-color 0.1s',
                  }}
                >
                  {columns.map(col => (
                    <TableCell key={col.id} sx={{
                      fontSize: '0.82rem',
                      py: 1.3,
                      color: '#1F2937',
                      fontWeight: col.id === 'name' ? 600 : 400,
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                  <TableCell sx={{ py: 1.3, borderBottom: `1px solid ${BORDER}` }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(row)}
                          sx={{
                            p: 0.7,
                            borderRadius: '7px',
                            color: TEXT_MUTED,
                            '&:hover': { bgcolor: NAVY_LIGHT, color: NAVY },
                            transition: 'all 0.12s',
                          }}
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      {activeKey === 'item' && (
                        <Tooltip title={row.active !== false ? 'Deactivate (hide from end users)' : 'Activate (show to end users)'} arrow>
                          <IconButton
                            size="small"
                            onClick={() => onToggleActive(row)}
                            sx={{
                              p: 0.7,
                              borderRadius: '7px',
                              color: row.active !== false ? '#16A34A' : TEXT_MUTED,
                              '&:hover': {
                                bgcolor: row.active !== false ? '#DCFCE7' : NAVY_LIGHT,
                                color:   row.active !== false ? '#15803D' : NAVY,
                              },
                              transition: 'all 0.12s',
                            }}
                          >
                            {row.active !== false
                              ? <ToggleOnIcon  sx={{ fontSize: 18 }} />
                              : <ToggleOffIcon sx={{ fontSize: 18 }} />
                            }
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(row)}
                          sx={{
                            p: 0.7,
                            borderRadius: '7px',
                            color: TEXT_MUTED,
                            '&:hover': { bgcolor: '#FFF1F2', color: '#DC2626' },
                            transition: 'all 0.12s',
                          }}
                        >
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        py: 0.5,
        flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: '0.71rem', color: TEXT_MUTED }}>
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
            '& .MuiTablePagination-selectLabel': { fontSize: '0.71rem', color: TEXT_MUTED, mb: 0 },
            '& .MuiTablePagination-select': { fontSize: '0.71rem' },
            '& .MuiIconButton-root': {
              p: 0.6,
              color: TEXT_MUTED,
              '&:hover': { color: NAVY, bgcolor: NAVY_LIGHT },
              '&:not(:disabled)': { color: NAVY },
            },
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
  const [serviceTypes,  setServiceTypes]  = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);

  const [activeKey, setActiveKey] = useState('type');

  const [dialog,       setDialog]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dialogSubs,   setDialogSubs]   = useState([]);

  /* form fields */
  const [fName,               setFName]               = useState('');
  const [fDesc,               setFDesc]               = useState('');
  const [fTypeId,             setFTypeId]             = useState('');
  const [fCatId,              setFCatId]              = useState('');
  const [fSubId,              setFSubId]              = useState('');
  const [fSla,                setFSla]                = useState('');
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

  useEffect(() => {
    if (!fCatId) { setDialogSubs([]); return; }
    getSubcategoriesByCategory(fCatId).then(r => setDialogSubs(r.data)).catch(() => setDialogSubs([]));
  }, [fCatId]);

  const typeMap = useMemo(() => Object.fromEntries((Array.isArray(serviceTypes) ? serviceTypes : []).map(t => [t.id, t.name])), [serviceTypes]);
  const catMap  = useMemo(() => Object.fromEntries((Array.isArray(categories)    ? categories    : []).map(c => [c.id, c.name])),  [categories]);
  const subMap  = useMemo(() => Object.fromEntries((Array.isArray(subcategories) ? subcategories : []).map(s => [s.id, s.name])), [subcategories]);

  const counts = useMemo(() => ({
    type: Array.isArray(serviceTypes) ? serviceTypes.length : 0,
    category: Array.isArray(categories) ? categories.length : 0,
    subcategory: Array.isArray(subcategories) ? subcategories.length : 0,
    item: Array.isArray(items) ? items.length : 0,
  }), [serviceTypes, categories, subcategories, items]);

  const activeData = useMemo(() => {
    if (activeKey === 'type')        return Array.isArray(serviceTypes)  ? serviceTypes  : [];
    if (activeKey === 'category')    return Array.isArray(categories)    ? categories    : [];
    if (activeKey === 'subcategory') return Array.isArray(subcategories) ? subcategories : [];
    if (activeKey === 'item')        return Array.isArray(items)         ? items         : [];
    return [];
  }, [activeKey, serviceTypes, categories, subcategories, items]);

  const openAdd = () => {
    setFName(''); setFDesc(''); setFTypeId(''); setFCatId(''); setFSubId(''); setFSla(''); setFAccessDateRequired(false);
    setDialog({ mode: 'add', kind: activeKey });
  };

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

  const isDuplicate = (kind, name, excludeId = null) => {
    const n = name.trim().toLowerCase();
    if (kind === 'type')        return serviceTypes.some(t => t.name.toLowerCase() === n && t.id !== excludeId);
    if (kind === 'category')    return categories.some(c => c.name.toLowerCase() === n && c.serviceTypeId === fTypeId && c.id !== excludeId);
    if (kind === 'subcategory') return subcategories.some(s => s.name.toLowerCase() === n && s.categoryId === fCatId && s.id !== excludeId);
    if (kind === 'item') {
      return items.some(i => {
        if (i.id === excludeId) return false;
        if (i.name.toLowerCase() !== n) return false;
        if (fSubId) return i.subcategoryId === fSubId;
        return i.categoryId === fCatId;
      });
    }
    return false;
  };

  const handleSave = async () => {
    if (!fName.trim()) { toast.error('Name is required'); return; }
    const { kind, mode, row } = dialog;
    const excludeId = mode === 'edit' ? row.id : null;

    if (isDuplicate(kind, fName, excludeId)) {
      const scopeMsg = {
        type:        'A service type with this name already exists.',
        category:    'A category with this name already exists under the selected service type.',
        subcategory: 'A subcategory with this name already exists under the selected category.',
        item:        'An item with this name already exists under the selected subcategory/category.',
      };
      toast.error(scopeMsg[kind] ?? 'A record with this name already exists.');
      return;
    }

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
    } catch { setTimeout(() => toast.error('Save failed. Please try again.'), 150); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { kind, id, name } = deleteTarget;

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

  const handleToggleActive = async (row) => {
    try {
      await toggleServiceActive(row.id);
      const action = row.active !== false ? 'deactivated' : 'activated';
      setTimeout(() => toast.success(`"${row.name}" ${action} successfully.`), 150);
      loadAll();
    } catch {
      setTimeout(() => toast.error('Failed to update status. Please try again.'), 150);
    }
  };

  const nav = NAV_ITEMS.find(n => n.key === activeKey);
  const dialogTitle = dialog
    ? `${dialog.mode === 'edit' ? 'Edit' : 'Add'} ${NAV_ITEMS.find(n => n.key === dialog?.kind)?.label?.replace(/s$/, 's') ?? ''}`
    : '';

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <Box p={3}>
      {/* Page header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <PageHeader
          title="Manage Service Catalog"
          subtitle="Create and manage service types, categories, subcategories, and items"
        />
        <Tooltip title="Refresh data" arrow>
          <IconButton
            onClick={loadAll}
            size="small"
            sx={{
              color: NAVY,
              border: `1.5px solid ${BORDER}`,
              borderRadius: '9px',
              p: 0.8,
              bgcolor: '#fff',
              '&:hover': { bgcolor: NAVY_LIGHT, borderColor: NAVY },
              transition: 'all 0.12s',
            }}
          >
            <RefreshIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Main two-column layout ── */}
      <Box sx={{
        display: 'flex',
        border: `1px solid ${BORDER}`,
        borderRadius: '14px',
        overflow: 'hidden',
        minHeight: 600,
        bgcolor: '#fff',
        boxShadow: '0 2px 12px rgba(39,35,92,0.07)',
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
            onToggleActive={handleToggleActive}
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
        PaperProps={{
          sx: { borderRadius: '14px', boxShadow: '0 8px 40px rgba(39,35,92,0.16)' },
        }}
      >
        {/* Dialog title bar with navy left accent stripe */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          {dialog && (
            <Box sx={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              bgcolor: NAVY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {(() => {
                const navItem = NAV_ITEMS.find(n => n.key === dialog?.kind);
                return navItem ? <navItem.Icon sx={{ fontSize: 16, color: '#fff' }} /> : null;
              })()}
            </Box>
          )}
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: TEXT_MAIN, flexGrow: 1 }}>
            {dialogTitle}
          </Typography>
          <IconButton
            onClick={() => setDialog(null)}
            size="small"
            sx={{ color: TEXT_MUTED, '&:hover': { color: NAVY, bgcolor: NAVY_LIGHT }, borderRadius: '8px' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          {dialog && (
            <Stack spacing={2.5} mt={0.5}>
              {/* Name — all kinds */}
              {(() => {
                const excludeId = dialog.mode === 'edit' ? dialog.row.id : null;
                const dupError = fName.trim() && isDuplicate(dialog.kind, fName, excludeId);
                return (
                  <TextField
                    label="Name"
                    fullWidth
                    size="small"
                    value={fName}
                    onChange={e => setFName(e.target.value)}
                    error={!!dupError}
                    helperText={dupError ? 'This name already exists. Please choose a different name.' : ''}
                    sx={inputFocusSx}
                  />
                );
              })()}

              {/* Service Type selector (category) */}
              {dialog.kind === 'category' && (
                <FormControl fullWidth size="small" sx={inputFocusSx}>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={fTypeId}
                    label="Service Type"
                    onChange={e => setFTypeId(e.target.value)}
                    sx={selectFocusSx}
                  >
                    <MenuItem value=""><em>Select a type</em></MenuItem>
                    {serviceTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Category selector (subcategory + item) */}
              {(dialog.kind === 'subcategory' || dialog.kind === 'item') && (
                <FormControl fullWidth size="small" sx={inputFocusSx}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={fCatId}
                    label="Category"
                    onChange={e => { setFCatId(e.target.value); setFSubId(''); }}
                    sx={selectFocusSx}
                  >
                    <MenuItem value=""><em>Select a category</em></MenuItem>
                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Subcategory selector (item) */}
              {dialog.kind === 'item' && (
                <FormControl fullWidth size="small" disabled={!fCatId} sx={inputFocusSx}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={fSubId}
                    label="Subcategory"
                    onChange={e => setFSubId(e.target.value)}
                    sx={selectFocusSx}
                  >
                    <MenuItem value=""><em>Select a subcategory</em></MenuItem>
                    {dialogSubs.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Description + SLA + Access Date (item) */}
              {dialog.kind === 'item' && (
                <>
                  <TextField
                    label="Description"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={fDesc}
                    onChange={e => setFDesc(e.target.value)}
                    sx={inputFocusSx}
                  />
                  <TextField
                    label="SLA (hours)"
                    fullWidth
                    size="small"
                    type="number"
                    value={fSla}
                    onChange={e => setFSla(e.target.value)}
                    sx={inputFocusSx}
                  />

                  {/* Access Date Required toggle */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    border: `1.5px solid ${fAccessDateRequired ? NAVY : BORDER}`,
                    borderRadius: '10px',
                    bgcolor: fAccessDateRequired ? NAVY_LIGHT : '#FAFAFA',
                    transition: 'all 0.15s',
                  }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: TEXT_MAIN }}>
                        Access Date Required
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, mt: 0.2 }}>
                        User must provide a start date when requesting this item
                      </Typography>
                    </Box>
                    <Switch
                      checked={fAccessDateRequired}
                      onChange={e => setFAccessDateRequired(e.target.checked)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: NAVY },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: NAVY },
                      }}
                    />
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialog(null)} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ ...primaryBtnSx, px: 2.5 }}>
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
