// src/pages/rmo/projects/AssignMembersModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, TextField, InputAdornment, MenuItem, Button,
  Chip, Divider, Alert, CircularProgress, IconButton, Tabs, Tab,
  TablePagination,
} from '@mui/material';
import { Search, Close, PersonAdd, PersonRemove } from '@mui/icons-material';
import { rmoApi } from '../../../api/rmoApi';
import { formatName } from '../../../utils/formatters';
 
const MEMBERSHIP_COLORS = {
  PRIMARY:   { bg: '#EEF0FF', color: '#27235C' },
  SECONDARY: { bg: '#F3F4F6', color: '#6B7280' },
};
 
const AssignMembersModal = ({ open, project, allUsers = [], onClose, onSuccess }) => {
  const [tab,       setTab]       = useState(0); // 0=members, 1=assign
  const [members,   setMembers]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [membershipType, setMembershipType] = useState('PRIMARY');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [page,      setPage]      = useState(0);
 
  useEffect(() => {
    if (open && project) {
      setLoading(true);
      rmoApi.getProjectMembers(project.id)
        .then((r) => setMembers(r.data || []))
        .catch(() => setMembers([]))
        .finally(() => setLoading(false));
      setTab(0); setSelected([]); setSearch(''); setError(''); setSuccess('');
    }
  }, [open, project]);
 
  const memberIds = new Set(members.map((m) => m.userId));
 
  const available = allUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchQ = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
    const notMember = !memberIds.has(u.id);
    return matchQ && (tab === 0 ? true : notMember);
  });
 
  const currentList = tab === 0
    ? members.map((m) => ({ ...m, ...allUsers.find((u) => u.id === m.userId), isMember: true }))
    : available;
 
  const paginated = currentList.slice(page * 8, page * 8 + 8);
  const isAllSel  = paginated.length > 0 && paginated.every((u) => selected.includes(u.id || u.userId));
 
  const toggleAll  = (e) => setSelected(e.target.checked ? paginated.map((u) => u.id || u.userId) : []);
  const toggleOne  = (id) => setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
 
  const handleAssign = async () => {
    if (!selected.length) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await rmoApi.addProjectMembers(project.id, selected.map((userId) => ({ userId, membershipType })));
      setSuccess(`${selected.length} employee(s) assigned as ${membershipType}.`);
      setSelected([]);
      const r = await rmoApi.getProjectMembers(project.id);
      setMembers(r.data || []);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };
 
  const handleRemove = async () => {
    if (!selected.length) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await Promise.all(selected.map((userId) => rmoApi.removeProjectMember(project.id, userId)));
      setSuccess(`${selected.length} employee(s) removed.`);
      setSelected([]);
      const r = await rmoApi.getProjectMembers(project.id);
      setMembers(r.data || []);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Removal failed.');
    } finally {
      setSaving(false);
    }
  };
 
  if (!project) return null;
 
  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2, background: 'linear-gradient(135deg,#97247E,#AC5098)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonAdd sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="0.95rem">Employee Assignment</Typography>
              <Typography fontSize="0.73rem" color="text.secondary">{project.projectName} · {members.length} members</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={saving}><Close fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>
 
      <Box sx={{ px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSelected([]); setPage(0); }}
          sx={{ '& .MuiTab-root': { fontSize: '0.8rem', fontWeight: 600, textTransform: 'none', minHeight: 40 }, '& .MuiTabs-indicator': { bgcolor: '#97247E' } }}>
          <Tab label={`Current Members (${members.length})`} />
          <Tab label={`Assign Employees (${available.length} available)`} />
        </Tabs>
      </Box>
      <Divider />
 
      <DialogContent sx={{ p: 0 }}>
        {(error || success) && (
          <Box sx={{ px: 3, pt: 2 }}>
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ borderRadius: 2, mb: 1 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2, mb: 1 }}>{success}</Alert>}
          </Box>
        )}
 
        {/* Toolbar */}
        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #F0F0F5' }}>
          <TextField
            size="small" placeholder="Search employees…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ width: 240 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
          />
 
          {tab === 1 && (
            <TextField select size="small" label="Type" value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)} sx={{ width: 140 }}>
              <MenuItem value="PRIMARY">PRIMARY</MenuItem>
              <MenuItem value="SECONDARY">SECONDARY</MenuItem>
            </TextField>
          )}
 
          {selected.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <Chip label={`${selected.length} selected`} size="small" sx={{ bgcolor: '#F0F0FA', color: '#27235C', fontWeight: 700 }} />
              {tab === 0 ? (
                <Button size="small" variant="outlined" color="error" startIcon={saving ? <CircularProgress size={14} /> : <PersonRemove fontSize="small" />}
                  onClick={handleRemove} disabled={saving}>Remove</Button>
              ) : (
                <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <PersonAdd fontSize="small" />}
                  onClick={handleAssign} disabled={saving}>Assign as {membershipType}</Button>
              )}
            </Box>
          )}
        </Box>
 
        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={selected.length > 0 && !isAllSel} checked={isAllSel} onChange={toggleAll} size="small" />
                </TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                {tab === 0 && <TableCell>Membership</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(tab === 0 ? 6 : 5).fill(0).map((__, j) => (
                      <TableCell key={j}><Box sx={{ height: 14, bgcolor: '#F0F0F5', borderRadius: 2, width: '80%' }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tab === 0 ? 6 : 5} align="center" sx={{ py: 4, color: '#9CA3AF', fontSize: '0.875rem' }}>
                    {tab === 0 ? 'No members assigned yet.' : 'No available employees found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((u) => {
                  const uid = u.id || u.userId;
                  return (
                    <TableRow key={uid} hover selected={selected.includes(uid)}
                      sx={{ '&.Mui-selected': { bgcolor: 'rgba(151,36,126,0.05)' } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(uid)} onChange={() => toggleOne(uid)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.825rem', fontWeight: 500 }}>
                          {formatName(u.firstName, u.lastName)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                          #{u.employeeId || uid}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>{u.email || '—'}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.8rem' }}>{u.department || '—'}</Typography></TableCell>
                      <TableCell>
                        <Chip label={u.status || 'ACTIVE'} size="small"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600,
                            bgcolor: u.status === 'ACTIVE' ? '#DCFCE7' : '#F3F4F6',
                            color:   u.status === 'ACTIVE' ? '#15803D' : '#6B7280' }} />
                      </TableCell>
                      {tab === 0 && (
                        <TableCell>
                          <Chip label={u.membershipType || '—'} size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700,
                              bgcolor: MEMBERSHIP_COLORS[u.membershipType]?.bg || '#F3F4F6',
                              color:   MEMBERSHIP_COLORS[u.membershipType]?.color || '#6B7280' }} />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div" count={currentList.length} page={page} rowsPerPage={8}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[8]}
        />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
 
export default AssignMembersModal;
 