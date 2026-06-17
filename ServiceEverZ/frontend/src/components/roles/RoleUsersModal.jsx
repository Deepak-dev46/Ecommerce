// src/components/roles/RoleUsersModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Chip,
  TextField, InputAdornment, Divider, IconButton,
  CircularProgress, Alert, Tabs, Tab, Tooltip,
  TablePagination,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon, Close, PersonAdd, PersonRemove,
  SwapHoriz, People,
} from '@mui/icons-material';
import StatusChip from '../common/StatusChip';
import { userApi } from '../../api/userApi';
import { roleApi } from '../../api/roleApi';
import { formatName } from '../../utils/formatters';
import { DEPARTMENTS } from '../../constants/departments';
import { SYSTEM_ROLES, ADMIN_ASSIGNABLE_ROLES } from '../../constants/roles';

const RoleUsersModal = ({ open, role, onClose, allUsers, onRefresh, userRolesMap }) => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [changeRoleTarget, setChangeRoleTarget] = useState('');

  // Users currently in this role vs not
  const hasRole = (user, roleName) => {
    const roles = userRolesMap?.[user.id] || [];

    return roles.some((r) => {
      const roleNameValue = typeof r === "string" ? r : r.name;
      return roleNameValue === roleName;
    });
  };
  const usersInRole = allUsers.filter((u) =>
    hasRole(u, role?.name)
  );

  const hasAnyRole = (user) => {
    const roles = userRolesMap?.[user.id] || [];
    return roles.length > 0;
  };

  const usersNotInRole = allUsers.filter((u) =>
    !hasAnyRole(u)
  );


  const currentList = tab === 0 ? usersInRole : usersNotInRole;







  const filtered = currentList.filter((u) => {
    const q = search.toLowerCase();
    const matchesQ = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
    const matchesDept = !deptFilter || u.department === deptFilter;
    return matchesQ && matchesDept;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isAllSel = paginated.length > 0 && paginated.every((u) => selected.includes(u.id));
  const isIndet = selected.length > 0 && !isAllSel;


  const handleSelectAll = (e) => setSelected(e.target.checked ? paginated.map((u) => u.id) : []);
  const handleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);

  useEffect(() => {
    if (!open) { setSearch(''); setDeptFilter(''); setSelected([]); setTab(0); setError(''); setSuccess(''); setPage(0); }
  }, [open]);

  useEffect(() => { setSelected([]); setPage(0); }, [tab, search, deptFilter]);

const handleAssign = async () => {
  // ✅ validate
  if (!selected.length || !role || actionLoading) return;

  setActionLoading(true);
  setError('');
  setSuccess('');

  try {
    const roleId = role.id || role.name;

    let successCount = 0;
    let failedCount = 0;

    for (const userId of selected) {
      try {
        await roleApi.assignRole({ userId, roleId });
        successCount++;
      } catch (err) {
        console.log(err);
        
        console.log(`Failed for user ${userId}`, err.response?.data);
        failedCount++;
      }
    }

    setSuccess(
      `${successCount} user(s) assigned` +
      (failedCount ? `, ${failedCount} failed` : '')
    );

    setSelected([]);
    onRefresh?.();

  } catch (err) {    
    setError(err.response?.data?.message || 'Assignment failed.');
  } finally {
    setActionLoading(false);
  }
};

  const handleRevoke = async () => {
    if (!selected.length || !role) return;
    setActionLoading(true); setError(''); setSuccess('');
    try {
      let res = await Promise.all(selected.map((userId) => roleApi.revokeRole(userId, role.id || role.name)));
      console.log(res);

      setSuccess(`Role removed from ${selected.length} user(s).`);
      setSelected([]);
      onRefresh?.();
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || 'Revoke failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={() => !actionLoading && onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: role.gradient, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <People sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={700} fontSize="0.95rem">{role.label}</Typography>
                <Chip label={`${usersInRole.length} users`} size="small" sx={{ height: 20, fontSize: '0.68rem', backgroundColor: `${role.color}14`, color: role.color, fontWeight: 700 }} />
              </Box>
              <Typography fontSize="0.73rem" color="text.secondary">{role.description}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={actionLoading}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />

      <Box sx={{ px: 3, pt: 1.5 }}>
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { fontSize: '0.8rem', fontWeight: 600, minHeight: 40, textTransform: 'none' }, '& .MuiTabs-indicator': { backgroundColor: role.color } }}
        >
          <Tab label={`Members (${usersInRole.length})`} />
          <Tab label={`Assign users (${usersNotInRole.length} available)`} />
        </Tabs>
      </Box>
      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* Alerts */}
        {(error || success) && (
          <Box sx={{ px: 3, pt: 2 }}>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>{success}</Alert>}
          </Box>
        )}

        {/* Filters */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
            borderBottom: "1px solid #F0F0F5",
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "20px", // ✅ proper way
              },
            }}
          />

          {/* Department Select */}
          <FormControl size="small" sx={{ width: 180 }}>
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <MenuItem value="">All departments</MenuItem>
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Actions */}
          {selected.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: "auto",
              }}
            >
              <Chip
                label={`${selected.length} selected`}
                size="small"
                sx={{
                  backgroundColor: `${role.color}14`,
                  color: role.color,
                  fontWeight: 700,
                }}
              />

              {tab === 0 ? (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={
                    actionLoading ? <CircularProgress size={14} /> : <PersonRemove fontSize="small" />
                  }
                  onClick={handleRevoke}
                  disabled={actionLoading}
                >
                  Remove role
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <PersonAdd fontSize="small" />
                    )
                  }
                  onClick={handleAssign}
                  disabled={actionLoading}
                >
                  Assign {role.label}
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 380 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={isIndet} checked={isAllSel} onChange={handleSelectAll} size="small" />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                {tab === 0 && <TableCell>Other roles</TableCell>}
                {tab === 1 && <TableCell>Current roles</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#9CA3AF' }}>
                    {tab === 0 ? 'No members in this role yet' : 'No users available to assign'}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    selected={selected.includes(user.id)}
                    sx={{ '&.Mui-selected': { backgroundColor: `${role.color}08` } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(user.id)}
                        onChange={() => handleSelect(user.id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem', fontWeight: 500 }}>
                        {formatName(user.firstName, user.lastName)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8rem' }}>{user.department || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={user.status || 'ACTIVE'} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(user.roles || [])
                          .filter((r) => {
                            const roleName = typeof r === "string" ? r : r.name;
                            return roleName !== role.name;
                          })
                          .slice(0, 2)
                          .map((r) => {
                            const roleName = typeof r === "string" ? r : r.name;

                            return (
                              <Chip
                                key={roleName}
                                label={roleName}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.62rem',
                                  backgroundColor: '#F0F0FA',
                                  color: '#27235C'
                                }}
                              />
                            );
                          })}

                        {!(user.roles || []).filter((r) => {
                          const roleName = typeof r === "string" ? r : r.name;
                          return roleName !== role.name;
                        }).length && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                              None
                            </Typography>
                          )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[8, 16, 32]}
        />
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleUsersModal;
