// src/pages/rmo/resources/ResourceAssignmentPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box, Card, Typography, TextField, InputAdornment, MenuItem,
  Grid, Button, Chip, Divider, Alert, IconButton, Tooltip,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Skeleton, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, FormControlLabel, Switch, LinearProgress,
  Collapse,
} from '@mui/material';
import {
  Search, FilterList, People, PersonAdd, PersonRemove,
  Close, ExpandMore, ExpandLess, Refresh, SwapHoriz,
} from '@mui/icons-material';
import { rmoApi } from '../../../api/rmoApi';
import { formatName } from '../../../utils/formatters';
import PageHeader from '../../../components/common/PageHeader';
 
const STATUS_COLORS = {
  ACTIVE:            { bg: '#DCFCE7', color: '#15803D' },
  INACTIVE:          { bg: '#F3F4F6', color: '#6B7280' },
  DISABLED:          { bg: '#FEE2E2', color: '#B91C1C' },
  PENDINGACTIVATION: { bg: '#FEF9C3', color: '#854D0E' },
};
const MEMBERSHIP_COLORS = {
  PRIMARY:   { bg: '#EEF0FF', color: '#27235C' },
  SECONDARY: { bg: '#F3F4F6', color: '#6B7280' },
};
 
const UTIL_COLOR = (count) =>
  count === 0 ? '#24A148' : count === 1 ? '#E2B93B' : '#E01950';
 
const DEPARTMENTS = ['HR','ENGINEERING','FINANCE','OPERATIONS','SUPPORT','MANAGEMENT','SALES','LEGAL'];
 
// ── Bulk Action Bar ───────────────────────────────────────────────────────────
const BulkBar = ({ count, onAssign, onRemove, loading }) => (
  <Box sx={{
    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 1300,
    background: '#1B193F', borderRadius: 3, px: 3, py: 1.5,
    display: 'flex', alignItems: 'center', gap: 2,
    boxShadow: '0 8px 40px rgba(27,25,63,0.35)',
  }}>
    <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
      {count} employee{count > 1 ? 's' : ''} selected
    </Typography>
    <Button size="small" variant="contained" color="secondary" startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
      onClick={onAssign} disabled={loading} sx={{ fontSize: '0.78rem' }}>
      Assign to Project
    </Button>
    <Button size="small" variant="outlined" startIcon={<PersonRemove sx={{ fontSize: 16 }} />}
      onClick={onRemove} disabled={loading}
      sx={{ fontSize: '0.78rem', color: '#FCA5A5', borderColor: '#FCA5A544', '&:hover': { borderColor: '#FCA5A5' } }}>
      Remove Assignment
    </Button>
    <Button size="small" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}
      onClick={() => {}}>Clear</Button>
  </Box>
);
 
// ── Assign Dialog ─────────────────────────────────────────────────────────────
const AssignDialog = ({ open, onClose, onConfirm, projects, loading, selectedCount }) => {
  const [projectId, setProjectId]         = useState('');
  const [membershipType, setMembershipType] = useState('PRIMARY');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography fontWeight={700}>Assign to Project</Typography>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Assigning <strong>{selectedCount} employee(s)</strong> to a project.
        </Typography>
        <TextField select fullWidth label="Select Project" value={projectId}
          onChange={(e) => setProjectId(e.target.value)} sx={{ mb: 2 }}>
          <MenuItem value="">— Choose project —</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.projectName} {p.projectCode ? `(${p.projectCode})` : ''}
            </MenuItem>
          ))}
        </TextField>
        <TextField select fullWidth label="Membership Type" value={membershipType}
          onChange={(e) => setMembershipType(e.target.value)}>
          <MenuItem value="PRIMARY">PRIMARY — Main project</MenuItem>
          <MenuItem value="SECONDARY">SECONDARY — Additional project</MenuItem>
        </TextField>
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2, fontSize: '0.78rem' }}>
          A user can only have one PRIMARY project. Assigning PRIMARY will override the existing one.
        </Alert>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" disabled={!projectId || loading}
          onClick={() => onConfirm(Number(projectId), membershipType)}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ─── Main Page ────────────────────────────────────────────────────────────────
const ResourceAssignmentPage = () => {
  const [users,     setUsers]     = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [userProj,  setUserProj]  = useState({}); // userId → ProjectMemberResponse[]
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [search,    setSearch]    = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept,   setFilterDept]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [onlyBench,    setOnlyBench]    = useState(false);
  const [selected,  setSelected]  = useState([]);
  const [page,      setPage]      = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assignOpen,  setAssignOpen]  = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
 
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
 
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [uRes, pRes] = await Promise.all([rmoApi.getUsers(), rmoApi.getProjects()]);
      const usersData    = uRes.data || [];
      const projectsData = pRes.data || [];
      setUsers(usersData);
      setProjects(projectsData);
 
      // Load project assignments for each user (in parallel, max 20)
      const sample = usersData.slice(0, 40);
      const results = await Promise.allSettled(
        sample.map((u) => rmoApi.getUserProjects(u.id).then((r) => ({ userId: u.id, data: r.data || [] })))
      );
      const map = {};
      results.forEach((r) => { if (r.status === 'fulfilled') map[r.value.userId] = r.value.data; });
      setUserProj(map);
    } catch {
      setError('Failed to load resource data.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return users.filter((u) => {
      const matchQ = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.employeeId}`.toLowerCase().includes(q);
      const matchDept   = !filterDept   || u.department === filterDept;
      const matchStatus = !filterStatus || u.status     === filterStatus;
      const projs = userProj[u.id] || [];
      const hasPrimary = projs.some((p) => p.membershipType === 'PRIMARY' && p.active !== false);
      const matchBench  = !onlyBench || !hasPrimary;
      return matchQ && matchDept && matchStatus && matchBench;
    });
  }, [users, debouncedSearch, filterDept, filterStatus, onlyBench, userProj]);
 
  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );
 
  const isAllSel = paginated.length > 0 && paginated.every((u) => selected.includes(u.id));
  const isIndet  = selected.length > 0 && !isAllSel;
  const toggleAll = (e) => setSelected(e.target.checked ? paginated.map((u) => u.id) : []);
  const toggleOne = (id) => setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
 
  const getProjectName = (pid) => {
    const p = projects.find((p) => p.id === pid);
    return p ? p.projectName : `#${pid}`;
  };
 
  const getPrimaryProject = (userId) => {
    const projs = userProj[userId] || [];
    const primary = projs.find((p) => p.membershipType === 'PRIMARY' && p.active !== false);
    return primary ? getProjectName(primary.projectId) : null;
  };
 
  const getSecondaryCount = (userId) =>
    (userProj[userId] || []).filter((p) => p.membershipType === 'SECONDARY' && p.active !== false).length;
 
  const getTotalCount = (userId) =>
    (userProj[userId] || []).filter((p) => p.active !== false).length;
 
  // ── Bulk assign ────────────────────────────────────────────────────────────
  const handleBulkAssign = async (projectId, membershipType) => {
    setActionLoading(true); setError(''); setSuccess('');
    try {
      await rmoApi.addProjectMembers(projectId, selected.map((userId) => ({ userId, membershipType })));
      setSuccess(`${selected.length} employee(s) assigned successfully.`);
      setSelected([]);
      setAssignOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };
 
  const activeFilters = [filterDept, filterStatus, onlyBench].filter(Boolean).length;
 
  return (
    <Box sx={{ pb: selected.length ? 10 : 0 }}>
      <PageHeader
        title="Resource Assignment"
        subtitle={`${filtered.length} of ${users.length} employees`}
        breadcrumbs={[{ label: 'RMO', path: '/rmo/dashboard' }, { label: 'Resources' }]}
        actions={
          <Button variant="outlined" size="small" startIcon={<Refresh />}
            onClick={load} disabled={loading} sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
            Refresh
          </Button>
        }
      />
 
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
  {/* Search + Filters */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, ID, email…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 17, color: '#9CA3AF' }} /></InputAdornment>,
              endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><Close sx={{ fontSize: 15 }} /></IconButton></InputAdornment> : null,
            }}
          />
          <FormControlLabel
            control={<Switch checked={onlyBench} onChange={(e) => { setOnlyBench(e.target.checked); setPage(0); }} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#97247E' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#97247E' } }} />}
            label={<Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>unAssigned</Typography>}
          />
          <Button
            variant={showFilters || activeFilters > 0 ? 'contained' : 'outlined'} size="small"
            startIcon={<FilterList />}
            endIcon={showFilters ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
            onClick={() => setShowFilters((v) => !v)}>
            Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
          </Button>
          {activeFilters > 0 && (
            <Button size="small" sx={{ color: '#E01950' }}
              onClick={() => { setFilterDept(''); setFilterStatus(''); setOnlyBench(false); }}>
              Clear
            </Button>
          )}
        </Box>
        <Collapse in={showFilters}>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth label="Department" value={filterDept}
                  onChange={(e) => { setFilterDept(e.target.value); setPage(0); }}>
                  <MenuItem value="">All Departments</MenuItem>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth label="Status" value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {['ACTIVE','INACTIVE','DISABLED','PENDINGACTIVATION'].map((s) => (
                    <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Card>
 
      {/* Employee Table */}
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={isIndet} checked={isAllSel} onChange={toggleAll} size="small" />
                </TableCell>
                {['Employee', 'Department', 'Designation', 'Status', 'Primary Project', 'Secondary', 'Load', 'Actions'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(9).fill(0).map((__, j) => (
                        <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : paginated.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                        <Typography variant="body2" color="text.secondary">
                          {debouncedSearch || activeFilters || onlyBench
                            ? 'No employees match your filters.'
                            : 'No employees found.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                : paginated.map((u) => {
                    const primary  = getPrimaryProject(u.id);
                    const secCount = getSecondaryCount(u.id);
                    const total    = getTotalCount(u.id);
                    const utilColor = UTIL_COLOR(total);
                    return (
                      <TableRow key={u.id} hover selected={selected.includes(u.id)}
                        sx={{ '&.Mui-selected': { bgcolor: 'rgba(151,36,126,0.04)' } }}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.72rem', fontWeight: 700,
                              background: 'linear-gradient(135deg,#27235cec,#97247ef9)' }}>
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1B193F' }}>
                                {formatName(u.firstName, u.lastName)}
                              </Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                                #{u.employeeId || u.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: '0.825rem' }}>{u.department || '—'}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: '0.825rem' }}>{u.designation || '—'}</Typography></TableCell>
                        <TableCell>
                          <Chip label={u.status?.replace('_', ' ') || 'ACTIVE'} size="small"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700,
                              bgcolor: STATUS_COLORS[u.status]?.bg || '#F3F4F6',
                              color:   STATUS_COLORS[u.status]?.color || '#6B7280',
                              border: `1px solid ${STATUS_COLORS[u.status]?.color || '#6B7280'}30` }} />
                        </TableCell>
                        <TableCell>
                          {primary
                            ? <Typography sx={{ fontSize: '0.8rem', color: '#1B193F', fontWeight: 500 }}>{primary}</Typography>
                            : <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic' }}>Not assigned</Typography>
                          }
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.825rem', color: secCount > 0 ? '#27235C' : '#9CA3AF' }}>
                            {secCount > 0 ? `${secCount} project${secCount > 1 ? 's' : ''}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(total * 33, 100)}
                              sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#F0F0F5',
                                '& .MuiLinearProgress-bar': { bgcolor: utilColor, borderRadius: 3 } }}
                            />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: utilColor, minWidth: 12 }}>
                              {total}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Assign to project">
                            <IconButton size="small" sx={{ color: '#97247E' }}
                              onClick={() => { setSelected([u.id]); setAssignOpen(true); }}>
                              <PersonAdd sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>
 
      {/* Bulk bar */}
      {selected.length > 0 && (
        <BulkBar
          count={selected.length}
          onAssign={() => setAssignOpen(true)}
          onRemove={() => {/* optional future feature */}}
          loading={actionLoading}
        />
      )}
 
      {/* Assign Dialog */}
      <AssignDialog
        open={assignOpen}
        onClose={() => { setAssignOpen(false); if (selected.length === 1) setSelected([]); }}
        onConfirm={handleBulkAssign}
        projects={projects.filter((p) => p.status === 'ACTIVE')}
        loading={actionLoading}
        selectedCount={selected.length}
      />
    </Box>
  );
};
 
export default ResourceAssignmentPage;
 