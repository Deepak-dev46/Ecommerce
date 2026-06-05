import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress,
  Card, Grid, Chip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Autocomplete, Divider,
  ListItemText, ListItemIcon,
} from '@mui/material';
import SearchIcon         from '@mui/icons-material/Search';
import AddIcon            from '@mui/icons-material/Add';
import EditIcon           from '@mui/icons-material/Edit';
import DeleteIcon         from '@mui/icons-material/Delete';
import BackupIcon         from '@mui/icons-material/Backup';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import ScheduleIcon       from '@mui/icons-material/Schedule';
import StorageIcon        from '@mui/icons-material/Storage';
import RefreshIcon        from '@mui/icons-material/Refresh';
import DevicesIcon        from '@mui/icons-material/Devices';
import CategoryIcon       from '@mui/icons-material/Category';
import LaptopIcon         from '@mui/icons-material/Laptop';
import RouterIcon         from '@mui/icons-material/Router';
import PrintIcon          from '@mui/icons-material/Print';
import PhoneAndroidIcon   from '@mui/icons-material/PhoneAndroid';
import MemoryIcon         from '@mui/icons-material/Memory';
import ClearIcon          from '@mui/icons-material/Clear';
import {
  getAllBackupSchedules,
  createBackupSchedule,
  updateBackupSchedule,
  deleteBackupSchedule,
} from '../../api/dataManagementApi';
import { getAllAssets } from '../../api/assetApi';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from '../../utils/toast';
import CustomPagination from '../../components/common/CustomPagination';

const BRAND  = '#27235C';
const ACCENT = '#97247E';
const BORDER = '#E8E8F0';

const BACKUP_FREQUENCIES = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'];
const BACKUP_STATUSES    = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'];

// Asset categories — must match backend enum values
const ASSET_CATEGORIES = [
  'LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET', 'SERVER',
  'NETWORK_DEVICE', 'PRINTER', 'MONITOR', 'OTHER',
];

const CATEGORY_ICONS = {
  LAPTOP:         <LaptopIcon sx={{ fontSize: 16 }} />,
  DESKTOP:        <MemoryIcon sx={{ fontSize: 16 }} />,
  MOBILE:         <PhoneAndroidIcon sx={{ fontSize: 16 }} />,
  TABLET:         <PhoneAndroidIcon sx={{ fontSize: 16 }} />,
  SERVER:         <StorageIcon sx={{ fontSize: 16 }} />,
  NETWORK_DEVICE: <RouterIcon sx={{ fontSize: 16 }} />,
  PRINTER:        <PrintIcon sx={{ fontSize: 16 }} />,
  MONITOR:        <DevicesIcon sx={{ fontSize: 16 }} />,
  OTHER:          <DevicesIcon sx={{ fontSize: 16 }} />,
};

const fmtDateShort = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';
const fmtDateTime  = (dt) => dt ? new Date(dt).toLocaleString()     : '—';

const toInputDateTime = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toISOString().slice(0, 16);
};

function FrequencyChip({ frequency }) {
  const map = {
    HOURLY:  { color: '#0369a1', bg: '#e0f2fe' },
    DAILY:   { color: '#065f46', bg: '#d1fae5' },
    WEEKLY:  { color: '#7c3aed', bg: '#ede9fe' },
    MONTHLY: { color: '#92400e', bg: '#fef3c7' },
  };
  const s = map[frequency] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={frequency} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function BackupStatusChip({ status }) {
  const map = {
    SCHEDULED:   { color: '#0369a1', bg: '#e0f2fe' },
    IN_PROGRESS: { color: '#92400e', bg: '#fef3c7' },
    COMPLETED:   { color: '#065f46', bg: '#d1fae5' },
    FAILED:      { color: '#991b1b', bg: '#fee2e2' },
    CANCELLED:   { color: '#374151', bg: '#f3f4f6' },
  };
  const s = map[status] || { color: '#374151', bg: '#f3f4f6' };
  return (
    <Chip label={status?.replace('_', ' ')} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${color}`, borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{value ?? '—'}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.3 }}>{label}</Typography>
      </Box>
    </Card>
  );
}

// ── Asset Search Field Component ──────────────────────────────────────────────
// Mimics the mapping creation form: pick category first, then live-search assets
function AssetSearchField({ form, setForm, formErrors, allAssets, assetsLoading }) {
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Filter assets by selected category, then by search text
  const filteredAssets = React.useMemo(() => {
    if (!selectedCategory) return [];
    return allAssets.filter(a => {
      const matchCat = a.category === selectedCategory;
      if (!matchCat) return false;
      if (!assetSearch.trim()) return true;
      const q = assetSearch.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.assetTag?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q) ||
        a.brand?.toLowerCase().includes(q) ||
        a.model?.toLowerCase().includes(q)
      );
    });
  }, [allAssets, selectedCategory, assetSearch]);

  // Sync back up if editing an existing schedule that has an assetId
  useEffect(() => {
    if (form.assetId && allAssets.length > 0 && !selectedAsset) {
      const found = allAssets.find(a => String(a.id) === String(form.assetId));
      if (found) {
        setSelectedAsset(found);
        setSelectedCategory(found.category || '');
      }
    }
  }, [form.assetId, allAssets]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    // Clear asset selection when category changes
    setSelectedAsset(null);
    setAssetSearch('');
    setForm(f => ({ ...f, assetId: '' }));
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setForm(f => ({ ...f, assetId: asset ? String(asset.id) : '' }));
  };

  const handleClearAsset = () => {
    setSelectedAsset(null);
    setAssetSearch('');
    setSelectedCategory('');
    setForm(f => ({ ...f, assetId: '' }));
  };

  return (
    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: '10px', p: 2, backgroundColor: '#FAFBFF' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CategoryIcon sx={{ fontSize: 14 }} />
        Asset Selection (Optional)
      </Typography>

      <Grid container spacing={2}>
        {/* Step 1: Category */}
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth size="small">
            <InputLabel>Step 1 — Select Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Step 1 — Select Category"
              onChange={e => handleCategoryChange(e.target.value)}
              startAdornment={
                selectedCategory ? (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <Box sx={{ color: BRAND }}>{CATEGORY_ICONS[selectedCategory] || <CategoryIcon sx={{ fontSize: 16 }} />}</Box>
                  </InputAdornment>
                ) : null
              }
            >
              <MenuItem value=""><em>— Choose a category —</em></MenuItem>
              {ASSET_CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat} sx={{ gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: BRAND }}>{CATEGORY_ICONS[cat]}</Box>
                    <span>{cat.replace(/_/g, ' ')}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Step 2: Live asset search — only enabled after category is chosen */}
        <Grid item xs={12} sm={7}>
          <Autocomplete
            disabled={!selectedCategory}
            options={filteredAssets}
            value={selectedAsset}
            loading={assetsLoading}
            inputValue={assetSearch}
            onInputChange={(_, val) => setAssetSearch(val)}
            onChange={(_, asset) => handleAssetSelect(asset)}
            getOptionLabel={opt =>
              opt ? `${opt.name}${opt.assetTag ? ` · ${opt.assetTag}` : ''}` : ''
            }
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            filterOptions={(opts) => opts} // filtering is done via filteredAssets memo
            noOptionsText={
              !selectedCategory
                ? 'Select a category first'
                : assetsLoading
                ? 'Loading assets…'
                : assetSearch.trim()
                ? 'No assets match your search'
                : 'No assets in this category'
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: '10px !important', px: '14px !important' }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#EDEDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0, mt: 0.2 }}>
                  {CATEGORY_ICONS[option.category] || <DevicesIcon sx={{ fontSize: 16 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1A1A1A', lineHeight: 1.3 }}>
                    {option.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, mt: 0.3, flexWrap: 'wrap' }}>
                    {option.assetTag && (
                      <Typography sx={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace', backgroundColor: '#F3F4F6', px: 0.6, borderRadius: '4px' }}>
                        {option.assetTag}
                      </Typography>
                    )}
                    {option.brand && (
                      <Typography sx={{ fontSize: '0.7rem', color: '#666' }}>{option.brand}</Typography>
                    )}
                    {option.model && (
                      <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{option.model}</Typography>
                    )}
                  </Box>
                </Box>
                <Chip
                  label={`#${option.id}`}
                  size="small"
                  sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#EDEDF7', color: BRAND, fontWeight: 700, flexShrink: 0 }}
                />
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={selectedCategory ? `Step 2 — Search in ${selectedCategory.replace(/_/g, ' ')}` : 'Step 2 — Search Asset'}
                placeholder={selectedCategory ? 'Type name, tag, brand…' : 'Select category first'}
                error={!!formErrors.assetId}
                helperText={formErrors.assetId}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: selectedCategory ? '#888' : '#ccc' }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {assetsLoading && <CircularProgress size={14} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Selected Asset Preview */}
      {selectedAsset && (
        <Box sx={{
          mt: 1.5, p: 1.5, borderRadius: '8px',
          background: `linear-gradient(135deg, ${BRAND}08 0%, ${BRAND}04 100%)`,
          border: `1px solid ${BRAND}22`,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: `${BRAND}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, flexShrink: 0 }}>
            {CATEGORY_ICONS[selectedAsset.category] || <DevicesIcon />}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: BRAND, lineHeight: 1.3 }}>
              {selectedAsset.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>
                ID: {selectedAsset.id}
              </Typography>
              {selectedAsset.assetTag && (
                <Typography sx={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
                  Tag: {selectedAsset.assetTag}
                </Typography>
              )}
              {selectedAsset.category && (
                <Chip label={selectedAsset.category.replace(/_/g, ' ')} size="small"
                  sx={{ fontSize: '0.62rem', height: 16, backgroundColor: '#EDEDF7', color: BRAND, fontWeight: 600 }} />
              )}
              {selectedAsset.status && (
                <Chip label={selectedAsset.status} size="small"
                  sx={{ fontSize: '0.62rem', height: 16, backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 600 }} />
              )}
            </Box>
          </Box>
          <Tooltip title="Clear asset selection">
            <IconButton size="small" onClick={handleClearAsset} sx={{ color: '#aaa', '&:hover': { color: '#666' } }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {!selectedAsset && (
        <Typography sx={{ mt: 1, fontSize: '0.72rem', color: '#aaa', fontStyle: 'italic' }}>
          Leave blank to create a generic (non-asset-specific) backup schedule.
        </Typography>
      )}
    </Box>
  );
}

// ── Empty form ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  scheduleName:   '',
  description:    '',
  frequency:      '',
  nextBackupAt:   '',
  backupLocation: '',
  assetId:        '',
  status:         '',
};

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BackupSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules]       = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [freqFilter, setFreqFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab]                   = useState('ALL');
  const [page, setPage]                 = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formErrors, setFormErrors]     = useState({});

  const [deleteId, setDeleteId]         = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // All assets for the search field
  const [allAssets, setAllAssets]       = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getAllBackupSchedules();
      setSchedules(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load backup schedules');
    } finally { setLoading(false); }
  }, []);

  const fetchAllAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const res = await getAllAssets();
      setAllAssets(res.data?.data || res.data || []);
    } catch {
      // non-blocking; search field will show empty list
    } finally { setAssetsLoading(false); }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);
  useEffect(() => { fetchAllAssets(); }, [fetchAllAssets]);

  useEffect(() => {
    let list = [...schedules];
    if (tab === 'GENERIC')        list = list.filter(s => !s.assetId);
    if (tab === 'ASSET_SPECIFIC') list = list.filter(s => !!s.assetId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.scheduleName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.backupLocation?.toLowerCase().includes(q) ||
        s.assetName?.toLowerCase().includes(q)
      );
    }
    if (freqFilter)    list = list.filter(s => s.frequency === freqFilter);
    if (statusFilter)  list = list.filter(s => s.status === statusFilter);
    setFiltered(list);
    setPage(0);
  }, [schedules, search, freqFilter, statusFilter, tab]);

  const stats = {
    total:      schedules.length,
    scheduled:  schedules.filter(s => s.status === 'SCHEDULED').length,
    completed:  schedules.filter(s => s.status === 'COMPLETED').length,
    failed:     schedules.filter(s => s.status === 'FAILED').length,
    assetSpec:  schedules.filter(s => !!s.assetId).length,
  };

  // ── Form helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (schedule) => {
    setEditTarget(schedule);
    setForm({
      scheduleName:   schedule.scheduleName || '',
      description:    schedule.description  || '',
      frequency:      schedule.frequency    || '',
      nextBackupAt:   toInputDateTime(schedule.nextBackupAt),
      backupLocation: schedule.backupLocation || '',
      assetId:        schedule.assetId ? String(schedule.assetId) : '',
      status:         schedule.status || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.scheduleName.trim())   errs.scheduleName   = 'Schedule name is required';
    if (!form.description.trim())    errs.description    = 'Description is required';
    if (!form.frequency)             errs.frequency      = 'Frequency is required';
    if (!form.nextBackupAt)          errs.nextBackupAt   = 'Next backup time is required';
    else {
      const dt = new Date(form.nextBackupAt);
      if (isNaN(dt.getTime()) || (!editTarget && dt <= new Date()))
        errs.nextBackupAt = 'Next backup time must be in the future';
    }
    if (!form.backupLocation.trim()) errs.backupLocation = 'Backup location is required';
    if (form.assetId && isNaN(Number(form.assetId))) errs.assetId = 'Invalid asset selection';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      if (editTarget) {
        const payload = {
          scheduleName:   form.scheduleName.trim(),
          description:    form.description.trim(),
          frequency:      form.frequency,
          nextBackupAt:   form.nextBackupAt,
          backupLocation: form.backupLocation.trim(),
          assetId:        form.assetId ? Number(form.assetId) : null,
          status:         form.status || undefined,
        };
        await updateBackupSchedule(editTarget.id, payload);
        toast.success('Backup schedule updated');
      } else {
        const payload = {
          scheduleName:    form.scheduleName.trim(),
          description:     form.description.trim(),
          frequency:       form.frequency,
          nextBackupAt:    form.nextBackupAt,
          backupLocation:  form.backupLocation.trim(),
          createdBySpId:   user?.id || 1,
          assetId:         form.assetId ? Number(form.assetId) : null,
        };
        await createBackupSchedule(payload);
        toast.success('Backup schedule created');
      }
      setDialogOpen(false);
      fetchSchedules();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBackupSchedule(deleteId);
      setDeleteId(null);
      fetchSchedules();
      toast.success('Backup schedule deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND }}>Backup Schedules</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            Manage scheduled backups for assets and general data
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSchedules} sx={{ border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
            New Schedule
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={2.4}>
          <StatCard icon={<BackupIcon />}        label="Total Schedules" value={stats.total}     color={BRAND}    bg="#eef0fa" />
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <StatCard icon={<ScheduleIcon />}      label="Scheduled"       value={stats.scheduled} color="#0369a1"  bg="#e0f2fe" />
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <StatCard icon={<CheckCircleIcon />}   label="Completed"       value={stats.completed} color="#16a34a"  bg="#d1fae5" />
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <StatCard icon={<StorageIcon />}       label="Failed"          value={stats.failed}    color="#dc2626"  bg="#fee2e2" />
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <StatCard icon={<DevicesIcon />}       label="Asset-Specific"  value={stats.assetSpec} color={ACCENT}   bg="#f8e9f6" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 42, fontSize: '0.85rem' },
               '& .Mui-selected': { fontWeight: 700, color: `${BRAND} !important` },
               '& .MuiTabs-indicator': { backgroundColor: BRAND } }}>
          <Tab value="ALL"            label={`All (${schedules.length})`} />
          <Tab value="GENERIC"        label={`Generic (${schedules.filter(s => !s.assetId).length})`} />
          <Tab value="ASSET_SPECIFIC" label={`Asset-Specific (${schedules.filter(s => !!s.assetId).length})`} />
        </Tabs>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search by name, description, location or asset…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#999' }} /></InputAdornment> }}
            sx={{ minWidth: 320 }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Frequency</InputLabel>
            <Select value={freqFilter} label="Frequency" onChange={e => setFreqFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {BACKUP_FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {BACKUP_STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || freqFilter || statusFilter) && (
            <Button size="small" onClick={() => { setSearch(''); setFreqFilter(''); setStatusFilter(''); }}
              sx={{ color: '#666', textTransform: 'none' }}>
              Clear filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F8FC' }}>
                {['Schedule Name', 'Description', 'Frequency', 'Status', 'Next Backup', 'Last Backup', 'Location', 'Asset', 'SP Name', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: BRAND }} /></TableCell></TableRow>
              ) : paged.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <BackupIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                  <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>No backup schedules found</Typography>
                </TableCell></TableRow>
              ) : paged.map(schedule => (
                <TableRow key={schedule.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, color: BRAND, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{schedule.scheduleName}</TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem', maxWidth: 160 }}>
                    <Tooltip title={schedule.description}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                        {schedule.description}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell><FrequencyChip frequency={schedule.frequency} /></TableCell>
                  <TableCell><BackupStatusChip status={schedule.status} /></TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtDateTime(schedule.nextBackupAt)}</TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtDateTime(schedule.lastBackupAt)}</TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem', maxWidth: 140 }}>
                    <Tooltip title={schedule.backupLocation}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                        {schedule.backupLocation}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem' }}>
                    {schedule.assetName ? (
                      <Box>
                        <Chip label={schedule.assetName} size="small"
                          sx={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                        <Typography sx={{ fontSize: '0.68rem', color: '#aaa', fontFamily: 'monospace', mt: 0.2 }}>
                          ID: {schedule.assetId}
                        </Typography>
                      </Box>
                    ) : schedule.assetId ? (
                      <Chip label={`#${schedule.assetId}`} size="small"
                        sx={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                    ) : <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>Generic</Typography>}
                  </TableCell>
                  <TableCell sx={{ color: '#555', fontSize: '0.8rem' }}>{schedule.createdBySpName || schedule.createdBySpId || '—'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(schedule)}
                          sx={{ color: BRAND, '&:hover': { backgroundColor: '#eef0fa' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(schedule.id)}
                          sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fee2e2' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <CustomPagination
          count={filtered.length}
          page={page}
          onPageChange={p => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={value => { setRowsPerPage(value); setPage(0);}}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* ── Create / Edit Dialog (expanded, not compact) ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        {/* Dialog Header */}
        <Box sx={{
          px: 3, py: 2.5,
          background: `linear-gradient(135deg, ${BRAND} 0%, #3B3680 100%)`,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BackupIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
              {editTarget ? 'Edit Backup Schedule' : 'New Backup Schedule'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
              {editTarget ? `Editing: ${editTarget.scheduleName}` : 'Fill in the details to create a new backup schedule'}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          <Grid container spacing={2.5}>

            {/* ── Section: Basic Info ── */}
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 14 }} />
                Schedule Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Schedule Name *" value={form.scheduleName}
                onChange={e => setForm(f => ({ ...f, scheduleName: e.target.value }))}
                error={!!formErrors.scheduleName} helperText={formErrors.scheduleName}
                placeholder="e.g. Daily Server Backup" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!formErrors.frequency}>
                <InputLabel>Frequency *</InputLabel>
                <Select value={form.frequency} label="Frequency *"
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {BACKUP_FREQUENCIES.map(freq => <MenuItem key={freq} value={freq}>{freq}</MenuItem>)}
                </Select>
                {formErrors.frequency && <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>{formErrors.frequency}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Description *" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                error={!!formErrors.description} helperText={formErrors.description}
                multiline rows={2}
                placeholder="Describe what this backup covers and why it's scheduled" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Next Backup At *" type="datetime-local"
                value={form.nextBackupAt} onChange={e => setForm(f => ({ ...f, nextBackupAt: e.target.value }))}
                error={!!formErrors.nextBackupAt} helperText={formErrors.nextBackupAt}
                InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Backup Location *" value={form.backupLocation}
                onChange={e => setForm(f => ({ ...f, backupLocation: e.target.value }))}
                error={!!formErrors.backupLocation} helperText={formErrors.backupLocation}
                placeholder="/mnt/backups/assets or s3://bucket/path" />
            </Grid>

            {/* Edit-only: Status */}
            {editTarget && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status"
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {BACKUP_STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* ── Divider ── */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: BORDER }} />
            </Grid>

            {/* ── Section: Asset Selection (expanded, category-first live search) ── */}
            <Grid item xs={12}>
              <AssetSearchField
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                allAssets={allAssets}
                assetsLoading={assetsLoading}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}
            sx={{ borderColor: BORDER, color: '#555', textTransform: 'none', borderRadius: '8px' }} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ backgroundColor: BRAND, '&:hover': { backgroundColor: '#1B193F' }, textTransform: 'none', fontWeight: 600, minWidth: 120, borderRadius: '8px' }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editTarget ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Backup Schedule"
        message="Are you sure you want to delete this backup schedule? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
      />
    </Box>
  );
}
