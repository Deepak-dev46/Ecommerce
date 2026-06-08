import React, { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, Button, Chip, Collapse,
  Typography, Grid, InputAdornment, IconButton, Tooltip, CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon, Close as CloseIcon,
  Refresh as RefreshIcon, AdminPanelSettings as RoleIcon,
  Sort as SortIcon, LocationOn as LocationIcon,
} from '@mui/icons-material';
import { orgApi }  from '../../api/orgApi';
import { userApi } from '../../api/userApi'; // ✅ added
 
const STATUSES = [
  { value: '',                  label: 'All statuses' },
  { value: 'ACTIVE',            label: 'Active' },
  { value: 'INACTIVE',          label: 'Inactive' },
  { value: 'DISABLED',          label: 'Disabled' },
  { value: 'PENDINGACTIVATION', label: 'Pending activation' },
];
 
const ROLES = [
  { value: '',                  label: 'All roles' },
  { value: 'ADMIN',             label: 'Admin' },
  { value: 'RMO',               label: 'RMO' },
  { value: 'ITSM_MANAGER',      label: 'ITSM Manager' },
  { value: 'END_USER',          label: 'End User' },
  { value: 'SUPPORT_PERSONNEL', label: 'Support Personnel' },
];
 
const SORT_OPTIONS = [
  { value: '',               label: 'Default' },
  { value: 'name_asc',       label: 'Name A → Z' },
  { value: 'name_desc',      label: 'Name Z → A' },
  { value: 'email_asc',      label: 'Email A → Z' },
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc',  label: 'Oldest first' },
];
 
const UserFilters = ({ filters, onChange, onReset, resultCount, totalCount }) => {
  const [expanded,     setExpanded]     = useState(false);
  const [departments,  setDepartments]  = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations,    setLocations]    = useState([]); // ✅ added
  const [loadingMeta,  setLoadingMeta]  = useState(false);
 
  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        const [deptRes, desigRes, locRes] = await Promise.all([
          orgApi.getAllDepartments(),
          orgApi.getAllDesignations(),
          userApi.getAllLocations(), // ✅ added
        ]);
 
        const normOrg = (d) => ({ value: d.name ?? d, label: d.name ?? d });
        setDepartments((deptRes.data  || []).map(normOrg));
        setDesignations((desigRes.data || []).map(normOrg));
 
        // ✅ handle both array and paginated {content:[]} responses
        const locRaw = locRes.data?.content ?? locRes.data ?? [];
        setLocations(locRaw.map((l) => ({ value: String(l.id), label: l.name })));
      } catch {
        setDepartments([]);
        setDesignations([]);
        setLocations([]);
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMeta();
  }, []);
 
  const activeFilterCount = [
    filters.department,
    filters.designation,
    filters.status,
    filters.role,
    filters.location, // ✅ added
  ].filter(Boolean).length;
 
  const handleChange = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const clearFilter  = (key) => ()  => onChange({ ...filters, [key]: '' });
 
  const loadingAdornment = loadingMeta
    ? { endAdornment: <InputAdornment position="end" sx={{ mr: 2 }}><CircularProgress size={14} /></InputAdornment> }
    : undefined;
 
  return (
    <Box sx={{ mb: 2 }}>
 
      {/* ── Top bar ──────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
 
        <TextField
          placeholder="Search by name or email..."
          value={filters.search || ''}
          onChange={handleChange('search')}
          sx={{ width: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: '#9CA3AF' }} />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearFilter('search')}>
                  <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
 
        <TextField
          select size="small" label="Sort by"
          value={filters.sortBy || ''}
          onChange={handleChange('sortBy')}
          sx={{ width: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SortIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
              </InputAdornment>
            ),
          }}
        >
          {SORT_OPTIONS.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </TextField>
 
        <Button
          variant="outlined" size="small" startIcon={<FilterIcon />}
          onClick={() => setExpanded((p) => !p)}
          sx={{
            borderColor: activeFilterCount ? '#97247E' : '#E5E7EB',
            color:       activeFilterCount ? '#97247E' : '#6B7280',
            borderRadius: 2, px: 1.5,
          }}
        >
          Filters
          {activeFilterCount > 0 && (
            <Box component="span" sx={{
              ml: 0.75, backgroundColor: '#97247E', color: '#fff',
              borderRadius: '50%', width: 16, height: 16,
              fontSize: '0.6rem', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>
              {activeFilterCount}
            </Box>
          )}
        </Button>
 
        {(activeFilterCount > 0 || filters.search || filters.sortBy) && (
          <Tooltip title="Clear all filters">
            <IconButton size="small" onClick={onReset} sx={{ color: '#E01950' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
 
        <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', ml: 'auto' }}>
          {resultCount} of {totalCount} users
        </Typography>
      </Box>
 
      {/* ── Active chips ─────────────────────────────────── */}
      {(activeFilterCount > 0 || filters.search || filters.sortBy) && (
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
 
          {filters.search && (
            <Chip label={`Search: ${filters.search}`} size="small"
              onDelete={clearFilter('search')}
              sx={{ backgroundColor: '#EEF2FF', color: '#27235C', '& .MuiChip-deleteIcon': { fontSize: 14 } }} />
          )}
          {filters.sortBy && (
            <Chip
              icon={<SortIcon sx={{ fontSize: '15px !important' }} />}
              label={`Sort: ${SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label}`}
              size="small" onDelete={clearFilter('sortBy')}
              sx={{
                backgroundColor: '#F0F7FF', color: '#1D4ED8',
                '& .MuiChip-deleteIcon': { fontSize: 14, color: '#1D4ED8' },
                '& .MuiChip-icon': { color: '#1D4ED8' },
              }} />
          )}
          {filters.status && (
            <Chip
              label={`Status: ${STATUSES.find((s) => s.value === filters.status)?.label}`}
              size="small" onDelete={clearFilter('status')}
              sx={{ backgroundColor: '#F0F0FA', color: '#27235C', '& .MuiChip-deleteIcon': { fontSize: 14 } }} />
          )}
          {filters.department && (
            <Chip label={`Dept: ${filters.department}`} size="small"
              onDelete={clearFilter('department')}
              sx={{ backgroundColor: '#F0F0FA', color: '#27235C', '& .MuiChip-deleteIcon': { fontSize: 14 } }} />
          )}
          {filters.designation && (
            <Chip label={`Designation: ${filters.designation}`} size="small"
              onDelete={clearFilter('designation')}
              sx={{ backgroundColor: '#F0F0FA', color: '#27235C', '& .MuiChip-deleteIcon': { fontSize: 14 } }} />
          )}
 
          {/* ✅ Location chip */}
          {filters.location && (
            <Chip
              icon={<LocationIcon sx={{ fontSize: '15px !important' }} />}
              label={`Location: ${locations.find((l) => l.value === filters.location)?.label || filters.location}`}
              size="small" onDelete={clearFilter('location')}
              sx={{
                backgroundColor: '#F0FDF4', color: '#166534',
                '& .MuiChip-deleteIcon': { fontSize: 14, color: '#166534' },
                '& .MuiChip-icon': { color: '#166534' },
              }} />
          )}
 
          {filters.role && (
            <Chip
              icon={<RoleIcon sx={{ fontSize: '16px !important' }} />}
              label={`Role: ${ROLES.find((r) => r.value === filters.role)?.label || filters.role}`}
              size="small" onDelete={clearFilter('role')}
              sx={{
                backgroundColor: '#FDF4FB', color: '#97247E',
                '& .MuiChip-deleteIcon': { fontSize: 14, color: '#97247E' },
                '& .MuiChip-icon': { color: '#97247E' },
              }} />
          )}
        </Box>
      )}
 
      {/* ── Expanded filter panel ────────────────────────── */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 1.5, p: 2, backgroundColor: '#F8F8FC', borderRadius: 2, border: '1px solid #E5E7EB' }}>
 
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{
              fontSize: '0.75rem', fontWeight: 700, color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              Filter by category
            </Typography>
            {loadingMeta && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CircularProgress size={12} sx={{ color: '#97247E' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Loading options…</Typography>
              </Box>
            )}
          </Box>
 
          <Grid container spacing={2}>
 
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField select fullWidth label="Status"
                value={filters.status || ''} onChange={handleChange('status')}>
                {STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
 
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField select fullWidth label="Department"
                value={filters.department || ''} onChange={handleChange('department')}
                disabled={loadingMeta} InputProps={loadingAdornment}>
                <MenuItem value="">All departments</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
 
           <Grid item xs={12} sm={6} md={2.4}>
              <TextField select fullWidth label="Designation"
                value={filters.designation || ''} onChange={handleChange('designation')}
                disabled={loadingMeta} InputProps={loadingAdornment}>
                <MenuItem value="">All designations</MenuItem>
                {designations.map((d) => (
                  <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
 
            {/* ✅ Location dropdown — fetched from backend */}
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField select fullWidth label="Location"
                value={filters.location || ''} onChange={handleChange('location')}
                disabled={loadingMeta} InputProps={loadingAdornment}>
                <MenuItem value="">All locations</MenuItem>
                {locations.map((l) => (
                  <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
 
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField select fullWidth label="Role"
                value={filters.role || ''} onChange={handleChange('role')}>
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
 
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};
 
export default UserFilters;
 