// src/pages/admin/RoleManagementPage.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  Menu,
  MenuItem,
  Checkbox,
  Tab,
  Tabs,
  LinearProgress,
  Select,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
  PersonAdd as PersonAddIcon,
  PersonRemoveAlt1 as PersonRemoveIcon,
  Group as GroupIcon,
  Shield as ShieldIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { roleApi } from '../../api/roleApi';
import { orgApi } from '../../api/orgApi';
 
const T = {
  primary: '#27235C',
  secondary: '#97247E',
  bg: '#F0F2F8',
  surface: '#FFFFFF',
  border: '#E2E5EF',
  textPri: '#1B193F',
  textSec: '#6B7280',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#D97706',
  grad: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
};
 
const AVATAR_PALETTE = [
  '#27235C',
  '#97247E',
  '#2563EB',
  '#0891B2',
  '#059669',
  '#D97706',
  '#7C3AED',
  '#BE185D',
  '#0D9488',
  '#DC2626',
];
 
const ac = (s = '') => AVATAR_PALETTE[(s.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
const ini = (f = '', l = '') => `${f[0] || ''}${l[0] || ''}`.toUpperCase() || '?';
 
const StatusChip = ({ active }) => (
  <Chip
    size="small"
    label={active ? 'Active' : 'Off'}
    sx={{
      height: 18,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 3,
      bgcolor: active ? '#DCFCE7' : '#FEE2E2',
      color: active ? '#166534' : '#991B1B',
    }}
  />
);
 
const UserStatusChip = ({ status }) => {
  const map = {
    ACTIVE: { bg: '#DCFCE7', color: '#166534' },
    INACTIVE: { bg: '#FEE2E2', color: '#991B1B' },
    PENDINGACTIVATION: { bg: '#FEF3C7', color: '#92400E' },
    DISABLED: { bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[status] || map.ACTIVE;
 
  return (
    <Chip
      size="small"
      label={status || 'ACTIVE'}
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 600,
        borderRadius: 3,
        bgcolor: s.bg,
        color: s.color,
      }}
    />
  );
};
 
function RoleDialog({ open, onClose, onSave, existing }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
 
  useEffect(() => {
    if (open) {
      setName(existing?.name || '');
      setDesc(existing?.description || '');
      setErr('');
    }
  }, [open, existing]);
 
  const save = async () => {
    const n = name.trim().toUpperCase();
 
    if (!n) {
      setErr('Name is required');
      return;
    }
 
    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(n)) {
      setErr('Use UPPER_CASE, digits, underscore e.g. MY_ROLE');
      return;
    }
 
    setBusy(true);
    try {
      await onSave({ name: n, description: desc.trim() });
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };
 
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, color: T.primary, pb: 1 }}>
        {existing ? 'Edit Role' : 'Create New Role'}
      </DialogTitle>
 
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField
          label="Role Name"
          value={name}
          autoFocus
          fullWidth
          onChange={(e) => {
            setName(e.target.value.toUpperCase());
            setErr('');
          }}
          error={!!err}
          helperText={err || 'e.g. FINANCE_MANAGER'}
          inputProps={{ style: { letterSpacing: 1, fontWeight: 600 } }}
        />
 
        <TextField
          label="Description"
          value={desc}
          fullWidth
          multiline
          rows={2}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="What does this role do?"
        />
      </DialogContent>
 
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={busy} sx={{ color: T.textSec }}>
          Cancel
        </Button>
 
        <Button
          variant="contained"
          onClick={save}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ background: T.grad, borderRadius: 2, fontWeight: 700, px: 3 }}
        >
          {existing ? 'Save' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 
function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: T.textSec }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{ background: danger ? T.error : T.grad, borderRadius: 2, fontWeight: 700 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 
function BulkAssignDialog({ open, onClose, selectedUsers, roleName, onConfirm, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, color: T.primary }}>
        Bulk Assign — {roleName}
      </DialogTitle>
 
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Assign <strong>{roleName}</strong> to the following {selectedUsers.length} employee
          {selectedUsers.length !== 1 ? 's' : ''}:
        </Typography>
 
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
          {selectedUsers.map((u) => (
            <Chip
              key={u.id}
              size="small"
              avatar={
                <Avatar sx={{ bgcolor: ac(u.firstName), fontSize: 10 }}>
                  {ini(u.firstName, u.lastName)}
                </Avatar>
              }
              label={`${u.firstName} ${u.lastName}`}
              sx={{ bgcolor: '#F0F2F8', fontWeight: 600 }}
            />
          ))}
        </Box>
 
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2, fontSize: 12 }}>
          The selected employees shown here are frozen at the time you opened this dialog.
        </Alert>
      </DialogContent>
 
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: T.textSec }}>
          Cancel
        </Button>
 
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <GroupIcon fontSize="small" />}
          sx={{ background: T.grad, borderRadius: 2, fontWeight: 700, px: 3 }}
        >
          Assign {selectedUsers.length} Employee{selectedUsers.length !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 
function RoleItem({ role, selected, memberCount, onClick, onEdit, onDelete }) {
  const [anchor, setAnchor] = useState(null);
 
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.2,
        borderRadius: 2,
        cursor: 'pointer',
        border: selected ? `2px solid ${T.primary}` : '2px solid transparent',
        bgcolor: selected ? `${T.primary}0D` : 'transparent',
        '&:hover': { bgcolor: selected ? `${T.primary}15` : '#F5F6FB' },
        transition: 'all .12s',
        position: 'relative',
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: 12,
          fontWeight: 800,
          bgcolor: ac(role.name),
          flexShrink: 0,
        }}
      >
        {role.name.slice(0, 2)}
      </Avatar>
 
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
          sx={{ color: selected ? T.primary : T.textPri, fontSize: 13 }}
        >
          {role.name === 'END_USER' ? 'Application User' : role.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: 11 }}>
          {role.description || 'No description'}
        </Typography>
      </Box>
 
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.3, flexShrink: 0 }}>
        <StatusChip active={role.active} />
        {memberCount > 0 && (
          <Typography variant="caption" sx={{ fontSize: 10, color: T.primary, fontWeight: 700 }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>
 
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        sx={{ ml: 0.5, '&:hover': { bgcolor: `${T.primary}15` } }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
 
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,.12)', minWidth: 140 } }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onEdit(role);
          }}
          sx={{ fontSize: 13, gap: 1 }}
        >
          <EditIcon fontSize="small" sx={{ color: T.textSec }} /> Edit
        </MenuItem>
 
        {role.active && (
          <MenuItem onClick={() => { setAnchor(null); onDelete(role); }}
    sx={{ fontSize: 13, gap: 1, color: T.error }}>
    <DeleteOutlineIcon fontSize="small" /> Delete
</MenuItem>
        )}
      </Menu>
    </Box>
  );
}
 
function UserRow({
  user,
  checked,
  onCheck,
  actionIcon,
  onAction,
  actionDisabled,
  actionTooltip,
  actionColor,
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 130px 130px 200px 110px 48px',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderBottom: `1px solid ${T.border}`,
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { bgcolor: '#F8F9FD' },
        transition: 'background .1s',
      }}
    >
     <Checkbox
        size="small"
        checked={checked}
        onChange={onCheck}
        sx={{ p: 0.5, color: T.border, '&.Mui-checked': { color: T.primary } }}
      />
 
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, bgcolor: ac(user.firstName || '') }}>
          {ini(user.firstName, user.lastName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 13 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
            EMP{String(user.employeeId || user.id || '').padStart(4, '0')}
          </Typography>
        </Box>
      </Box>
 
      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
        {user.departmentName || user.department?.name || '—'}
      </Typography>
 
      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
        {user.designationName || user.designation?.name || '—'}
      </Typography>
 
      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
        {user.email}
      </Typography>
 
      <UserStatusChip status={user.status} />
 
      <Tooltip title={actionTooltip}>
        <span>
          <IconButton
            size="small"
            disabled={actionDisabled}
            onClick={() => onAction(user)}
            sx={{ color: actionColor || T.primary, '&:hover': { bgcolor: `${actionColor || T.primary}15` } }}
          >
            {actionIcon}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
 
 function Pager({ page, totalPages, totalItems, pageSize, onPage, onPageSize }) {
  const start = totalItems === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalItems);
 
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderTop: `1px solid ${T.border}`,
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {totalItems === 0 ? 'No results' : `${start}–${end} of ${totalItems}`}
      </Typography>
 
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Rows:
        </Typography>
 
        <Select
          value={pageSize}
          onChange={(e) => onPageSize(e.target.value)}
          size="small"
          variant="outlined"
          sx={{ fontSize: 12, height: 28, '.MuiOutlinedInput-notchedOutline': { borderColor: T.border } }}
        >
          {[10, 25, 50, 100].map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>
              {n}
            </MenuItem>
          ))}
        </Select>
 
        <IconButton size="small" disabled={page === 0} onClick={() => onPage(page - 1)}>
          <KeyboardArrowLeft />
        </IconButton>
 
        <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'center', fontWeight: 600 }}>
          {totalPages === 0 ? '—' : `${page + 1} / ${totalPages}`}
        </Typography>
 
        <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    </Box>
  );
}
 function EmptyState({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: '#F0F2F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
 
      <Typography variant="body1" fontWeight={700} color={T.textPri}>
        {title}
      </Typography>
 
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={280}>
        {subtitle}
      </Typography>
    </Box>
  );
}
 
function TableHeader({ allChecked, someChecked, onCheckAll, tab }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 130px 130px 200px 110px 48px',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: '#F5F6FB',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <Checkbox
        size="small"
        checked={allChecked}
        indeterminate={someChecked && !allChecked}
        onChange={onCheckAll}
        sx={{
          p: 0.5,
          color: T.border,
          '&.Mui-checked': { color: T.primary },
          '&.MuiCheckbox-indeterminate': { color: T.primary },
        }}
      />
 
 {['Employee', 'Department', 'Designation','Email', 'Status', tab === 'members' ? 'Revoke' : 'Assign'].map((h) => (
        <Typography
          key={h}
          variant="caption"
          fontWeight={800}
          sx={{ color: T.primary, textTransform: 'uppercase', letterSpacing: 0.05, fontSize: 11 }}
        >
          {h}
        </Typography>
      ))}
    </Box>
  );
}
 
export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleSearch, setRoleSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [memberCounts, setMemberCounts] = useState({});
 
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRevokeOpen, setBulkRevokeOpen] = useState(false);
 
  const [tab, setTab] = useState('members');
 
  const [members, setMembers] = useState([]);
  const [available, setAvailable] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departments, setDepartments] = useState([]);
 
  const [designationFilter, setDesignationFilter] = useState('');
const [designations, setDesignations] = useState([]);
 
 
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
 
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [bulkSelection, setBulkSelection] = useState([]);
 
  const [assigning, setAssigning] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
 
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
  const notify = (msg, sev = 'success') => setSnack({ open: true, msg, sev });
 
  const [panelW, setPanelW] = useState(300);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
 
  const onMouseDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = panelW;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
 
  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      const w = Math.max(220, Math.min(480, startW.current + e.clientX - startX.current));
      setPanelW(w);
    };
 
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
 
window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
 
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [panelW]);
 
  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const { data } = await roleApi.getAllRoles();
      setRoles(data);
 
      if (data.length && !selected) {
        setSelected(data[0]);
      }
 
      const counts = {};
      await Promise.all(
        data.map(async (role) => {
          try {
            const { data: ud } = await roleApi.getUsers({
              roleId: role.id,
              page: 0,
              size: 1,
            });
            counts[role.id] = Array.isArray(ud) ? ud.length : (ud.totalElements ?? 0);
          } catch {
            counts[role.id] = 0;
          }
        })
      );
setMemberCounts(counts);
    } catch {
      notify('Failed to load roles', 'error');
    } finally {
      setRolesLoading(false);
    }
  }, [selected]);
 
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);
 
  // useEffect(() => {
  //   import('../../api/axiosInstance').then(({ userAxios }) => {
  //     userAxios
  //       .get('/api/v1/admin/departments')
  //       .then(({ data }) => {
  //         const list = Array.isArray(data) ? data : (data.content || []);
  //         setDepartments(list.map((d) => d.name || d));
  //       })
  //       .catch(() => {});
  //   });
  // }, []);
 
  useEffect(() => {
  orgApi.getAllDepartments()
    .then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.content || []);
      setDepartments(list);
    })
    .catch(() => {});
}, []);
 
useEffect(() => {
  if (deptFilter) {
    orgApi.getDesignationsByDepartment(deptFilter)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.content || []);
        setDesignations(list);
      })
      .catch(() => setDesignations([]));
  } else {
    orgApi.getAllDesignations()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.content || []);
        setDesignations(list);
      })
      .catch(() => setDesignations([]));
  }
}, [deptFilter]);
 
 
  const loadMembers = useCallback(async (role) => {
    if (!role) return;
 
    setUsersLoading(true);
    setCheckedIds(new Set());
 
    try {
      // const { data } = await roleApi.getUsers({
      //   roleId: role.id,
      //   page,
      //   size: pageSize,
      //   search: userSearch || undefined,
      //   department: deptFilter || undefined,
      //   status: statusFilter || undefined,
      // });
//raji
      const { data } = await roleApi.getUsers({
  roleId: role.id,
  page,
  size: pageSize,
  search: userSearch || undefined,
  department: deptFilter || undefined,
  designation: designationFilter || undefined,
  status: statusFilter || undefined,
});
 
 const content = Array.isArray(data) ? data : (data.content || []);
      setMembers(content);
 
      if (!Array.isArray(data)) {
        setTotal(data.totalElements || content.length);
      } else {
        setTotal(content.length);
      }
 
      if (!userSearch && !deptFilter && !statusFilter) {
        setMemberCounts((prev) => ({
          ...prev,
          [role.id]: Array.isArray(data) ? data.length : (data.totalElements || 0),
        }));
      }
    } catch {
      notify('Failed to load members', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [page, pageSize, userSearch, deptFilter, designationFilter,statusFilter]);
 
  const loadAvailable = useCallback(async () => {
    setUsersLoading(true);
    setCheckedIds(new Set());
 
    try {
      // const { data } = await roleApi.getUsers({
      //   hasNoRole: true,
      //   page,
      //   size: pageSize,
      //   search: userSearch || undefined,
      //   department: deptFilter || undefined,
      //   status: statusFilter || undefined,
      // });
//raji
      const { data } = await roleApi.getUsers({
  hasNoRole: true,
  page,
  size: pageSize,
  search: userSearch || undefined,
  department: deptFilter || undefined,
  designation: designationFilter || undefined,
  status: statusFilter || undefined,
});
 
 
      const content = Array.isArray(data) ? data : (data.content || []);
      setAvailable(content);
      setTotal(Array.isArray(data) ? data.length : (data.totalElements || 0));
    } catch {
      notify('Failed to load available users', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [page, pageSize, userSearch, deptFilter, designationFilter,statusFilter]);
 
  useEffect(() => {
    if (!selected) return;
 
    if (tab === 'members') {
      loadMembers(selected);
    } else {
      loadAvailable();
    }
    //rajii
  }, [selected, tab, page, pageSize, userSearch, deptFilter, designationFilter, statusFilter, loadMembers, loadAvailable]);
 
useEffect(() => {
  setPage(0);
  setCheckedIds(new Set());
}, [userSearch, deptFilter, designationFilter, statusFilter, tab, selected?.id]);
 
 
  const displayUsers = tab === 'members' ? members : available;
  const totalPages = Math.ceil(total / pageSize);
 
  const allChecked = displayUsers.length > 0 && displayUsers.every((u) => checkedIds.has(u.id));
  const someChecked = displayUsers.some((u) => checkedIds.has(u.id));
 
  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };
 
  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(displayUsers.map((u) => u.id)));
  };
 
  const selectedUsers = displayUsers.filter((u) => checkedIds.has(u.id));
 
  const handleAssign = async (user) => {
    if (!selected) return;
 
    setAssigning(true);
    try {
      await roleApi.assignRole(user.id, selected.id);
      notify(`"${selected.name}" assigned to ${user.firstName} ${user.lastName}`);
      if (tab === 'members') loadMembers(selected);
      else loadAvailable();
      loadRoles();
    } catch (e) {
      notify(e?.response?.data?.message || 'Failed to assign', 'error');
    } finally {
      setAssigning(false);
    }
  };
 
  const handleRevoke = async (user) => {
    if (!selected) return;
 
    setAssigning(true);
    try {
      await roleApi.revokeRole(user.id, selected.id);
      notify(`Role revoked from ${user.firstName} ${user.lastName}`, 'warning');
      loadMembers(selected);
      loadRoles();
    } catch (e) {
      notify(e?.response?.data?.message || 'Failed to revoke', 'error');
    } finally {
      setAssigning(false);
    }
  };
 
  // const handleBulkAssign = async () => {
  //   if (!selected || bulkSelection.length === 0) return;
 
  //   setBulkBusy(true);
  //   try {
  //     const results = await Promise.allSettled(
  //       bulkSelection.map((u) => roleApi.assignRole(u.id, selected.id))
  //     );
 
  //     const successUsers = [];
  //     const failedUsers = [];
 
  //     results.forEach((result, index) => {
  //       const user = bulkSelection[index];
  //       if (result.status === 'fulfilled') {
  //         successUsers.push(user);
  //       } else {
  //         failedUsers.push({
  //           user,
  //           message:
  //             result.reason?.response?.data?.message ||
  //             result.reason?.message ||
  //             'Assignment failed',
  //         });
  //       }
  //     });
 
  //     if (successUsers.length > 0) {
  //       notify(
  //         `${successUsers.length} employee${successUsers.length > 1 ? 's' : ''} assigned to "${selected.name}"`,
  //         'success'
  //       );
  //     }
 
  //     if (failedUsers.length > 0) {
  //       const firstFew = failedUsers
  //         .slice(0, 3)
  //         .map((f) => `${f.user.firstName} ${f.user.lastName}`)
  //         .join(', ');
 
  //       notify(
  //         `${failedUsers.length} assignment${failedUsers.length > 1 ? 's' : ''} failed${firstFew ? `: ${firstFew}` : ''}`,
  //         'error'
  //       );
  //     }
 
  //     setCheckedIds(new Set());
  //     setBulkSelection([]);
  //     setBulkOpen(false);
 
  //     await Promise.all([loadAvailable(), selected ? loadMembers(selected) : Promise.resolve(), loadRoles()]);
  //   } finally {
  //     setBulkBusy(false);
  //   }
  // };
 
  //rajii
 
 
// const handleBulkAssign = async () => {
//   if (!selected || bulkSelection.length === 0) return;
 
//   setBulkBusy(true);
//   try {
//     const results = await Promise.allSettled(
//       bulkSelection.map((u) => roleApi.assignRole(u.id, selected.id))
//     );
 
//     const successUsers = [];
//     const failedUsers = [];
 
//     results.forEach((result, index) => {
//       const user = bulkSelection[index];
//       if (result.status === 'fulfilled') {
//         successUsers.push(user);
//       } else {
//         failedUsers.push(user);
//       }
//     });
 
//     // ✅ Show success toast
//     if (successUsers.length > 0) {
//       notify(
//         `${successUsers.length} employee${successUsers.length > 1 ? 's' : ''} assigned to "${selected.name}"`,
//         'success'
//       );
//     }
 
//     // ✅ Show failure toast
//     if (failedUsers.length > 0) {
//       const names = failedUsers
//         .slice(0, 3)
//         .map((u) => `${u.firstName} ${u.lastName}`)
//         .join(', ');
//       notify(
//         `${failedUsers.length} assignment${failedUsers.length > 1 ? 's' : ''} failed: ${names}`,
//         'error'
//       );
//     }
 
//     // ✅ If ALL failed
//     if (successUsers.length === 0 && failedUsers.length > 0) {
//       notify('Bulk assign failed. All assignments were unsuccessful.', 'error');
//     }
 
//     setCheckedIds(new Set());
//     setBulkSelection([]);
//     setBulkOpen(false);
//     await Promise.all([loadAvailable(), loadMembers(selected), loadRoles()]);
 
//   } catch (e) {
//     // ✅ This catches unexpected errors (network down, etc.)
//     notify(e?.response?.data?.message || 'Bulk assign failed. Please try again.', 'error');
//   } finally {
//     setBulkBusy(false);
//   }
// };
 const handleBulkAssign = async () => {
  if (!selected || bulkSelection.length === 0) return;
 
  setBulkBusy(true);
  try {
    const userIds = bulkSelection.map((u) => u.id);
    const res = await roleApi.assignRoleBulk(userIds, selected.id);
    const { assigned, failed, errors } = res.data;
 
    if (assigned > 0) {
      notify(`${assigned} employee${assigned > 1 ? 's' : ''} assigned to "${selected.name}"`, 'success');
    }
 
    if (failed > 0) {
      notify(`${failed} assignment${failed > 1 ? 's' : ''} failed`, 'error');
      console.error('Failed assignments:', errors);
    }
 
    setCheckedIds(new Set());
    setBulkSelection([]);
    setBulkOpen(false);
    await Promise.all([loadAvailable(), loadMembers(selected), loadRoles()]);
 
  } catch (e) {
    notify(e?.response?.data?.message || 'Bulk assign failed', 'error');
  } finally {
    setBulkBusy(false);
  }
};
 
 
  const handleBulkRevoke = async () => {
    if (!selected || bulkSelection.length === 0) return;
 
    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(
        bulkSelection.map((u) => roleApi.revokeRole(u.id, selected.id))
      );
 
      const successUsers = [];
      const failedUsers = [];
 
      results.forEach((result, index) => {
        const user = bulkSelection[index];
        if (result.status === 'fulfilled') {
          successUsers.push(user);
        } else {
          failedUsers.push({
            user,
            message:
              result.reason?.response?.data?.message ||
              result.reason?.message ||
              'Revoke failed',
          });
        }
      });
 
      if (successUsers.length > 0) {
        notify(
          `${successUsers.length} employee${successUsers.length > 1 ? 's' : ''} removed from "${selected.name}"`,
          'warning'
        );
      }
 
      if (failedUsers.length > 0) {
        const firstFew = failedUsers
          .slice(0, 3)
          .map((f) => `${f.user.firstName} ${f.user.lastName}`)
          .join(', ');
 
        notify(
          `${failedUsers.length} revoke${failedUsers.length > 1 ? 's' : ''} failed${firstFew ? `: ${firstFew}` : ''}`,
          'error'
        );
      }
 setCheckedIds(new Set());
      setBulkSelection([]);
      setBulkRevokeOpen(false);
 
      await Promise.all([selected ? loadMembers(selected) : Promise.resolve(), loadAvailable(), loadRoles()]);
    } finally {
      setBulkBusy(false);
    }
  };
 
  const handleCreate = async (data) => {
    await roleApi.createRole(data);
    notify(`Role "${data.name}" created`);
    await loadRoles();
  };
 
  const handleEdit = async (data) => {
    await roleApi.updateRole(editTarget.id, data);
    notify(`Role "${data.name}" updated`);
    setEditTarget(null);
    await loadRoles();
  };
 
 
// ✅ Replace with
const handleDelete = async () => {
    try {
        await roleApi.deactivateRole(deleteTarget.id);

        notify(`Role "${deleteTarget.name}" deleted`, 'warning');
        setDeleteTarget(null);
        if (selected?.id === deleteTarget.id) setSelected(null);
        await loadRoles(); // ✅ this must be called
    } catch (e) {
        notify(e?.response?.data?.message || 'Failed to delete role', 'error');
    }
};
 
 
 
const HIDDEN_ROLES = ['APPROVAL_MANAGER_L1', 'APPROVAL_MANAGER_L2', 'RESOURCE_OWNER'];
 
const filteredRoles = useMemo(
  () =>
    roles
      .filter((r) => !HIDDEN_ROLES.includes(r.name.toUpperCase())) // ✅ hide these roles
      .filter(
        (r) =>
          r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
          (r.description || '').toLowerCase().includes(roleSearch.toLowerCase())
      ),
  [roles, roleSearch]
);
 
  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', p: { xs: 1.5, md: 3 }, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={T.primary}>
            Role Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create roles and assign them to employees
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ background: T.grad, borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 'none' }}
        >
          Create Role
        </Button>
      </Box>
 
      <Box sx={{ display: 'flex', flex: 1, gap: 0, alignItems: 'stretch', minHeight: 0 }}>
        <Paper
          elevation={0}
          sx={{
            width: panelW,
            flexShrink: 0,
            border: `1px solid ${T.border}`,
            borderRadius: '12px 0 0 12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: T.surface,
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${T.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={800} color={T.primary}>
                Roles
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, bgcolor: `${T.primary}15`, color: T.primary, fontWeight: 700, borderRadius: 10, px: 1, py: 0.2 }}
                >
                  {filteredRoles.length}
                </Typography>
              </Typography>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadRoles} sx={{ color: T.textSec, '&:hover': { color: T.primary } }}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
 
            <TextField
              size="small"
              fullWidth
              placeholder="Search roles…"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: T.textSec }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: 2 } }}
            />
          </Box>
 <Box sx={{ overflowY: 'auto', flex: 1, p: 1 }}>
            {rolesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, px: 1, py: 1 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="80%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))
            ) : filteredRoles.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {roleSearch ? 'No roles match' : 'No roles yet'}
                </Typography>
              </Box>
            ) : (
              filteredRoles.map((role) => (
                <Box key={role.id}>
                  <RoleItem
                    role={role}
                    selected={selected?.id === role.id}
                    memberCount={memberCounts[role.id] || 0}
                    onClick={() => {
                      setSelected(role);
                      setTab('members');
                    }}
                    onEdit={(r) => setEditTarget(r)}
                    onDelete={(r) => setDeleteTarget(r)}
                  />
                </Box>
              ))
            )}
          </Box>
        </Paper>
 
        <Box
          onMouseDown={onMouseDown}
          sx={{
            width: 6,
            cursor: 'col-resize',
            bgcolor: 'transparent',
            flexShrink: 0,
            '&:hover': { bgcolor: `${T.primary}30` },
            transition: 'background .15s',
            zIndex: 1,
          }}
        />
 
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            border: `1px solid ${T.border}`,
            borderLeft: 'none',
            borderRadius: '0 12px 12px 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: T.surface,
            minWidth: 0,
          }}
        >
          {!selected ? (
            <EmptyState
              icon={<ShieldIcon sx={{ color: T.textSec, fontSize: 24 }} />}
              title="Select a role"
              subtitle="Choose a role from the left panel to view and manage its members"
            />
          ) : (
            <>
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: ac(selected.name),
                        width: 48,
                        height: 48,
                        fontSize: 16,
                        fontWeight: 800,
                        boxShadow: `0 0 0 3px ${T.surface}, 0 0 0 5px ${ac(selected.name)}40`,
                      }}
                    >
                      {selected.name.slice(0, 2)}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight={800} color={T.primary}>
                          {selected.name}
                        </Typography>
                        <StatusChip active={selected.active} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {selected.description || 'No description'}
                      </Typography>
                    </Box>
                  </Box>
 
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', px: 2, py: 1, borderRadius: 2, bgcolor: '#F5F6FB' }}>
                      <Typography variant="h6" fontWeight={800} color={T.primary}>
                        {memberCounts[selected.id] || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Members
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
 
              <Box sx={{ px: 2, borderBottom: `1px solid ${T.border}` }}>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': { minHeight: 40, fontSize: 12, fontWeight: 700, textTransform: 'none', py: 0 },
                    '& .Mui-selected': { color: T.primary },
                    '& .MuiTabs-indicator': { bgcolor: T.primary },
                  }}
                >
                        <Tab
                    value="members"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        Current Members
                        <Chip
                          size="small"
                          label={memberCounts[selected.id] || 0}
                          sx={{ height: 18, fontSize: 10, bgcolor: `${T.primary}15`, color: T.primary, fontWeight: 700 }}
                        />
                      </Box>
                    }
                  />
                  <Tab value="available" label="Available Employees" />
                </Tabs>
              </Box>
 
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  borderBottom: `1px solid ${T.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  bgcolor: '#FAFBFD',
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 15, color: T.textSec }} />
                      </InputAdornment>
                    ),
                    endAdornment: userSearch ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setUserSearch('')} sx={{ p: 0.3 }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{
                    width: 210,
                    '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: 2, height: 34, bgcolor: T.surface },
                  }}
                />
 
                <Select
                  size="small"
                  displayEmpty
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setDesignationFilter(''); }}
                  renderValue={(v) => v ? (departments.find((d) => d.id === v)?.name || v) : <Typography sx={{ fontSize: 12, color: T.textSec }}>Department</Typography>}
                  sx={{
                    fontSize: 12,
                    height: 34,
                    minWidth: 140,
                    borderRadius: 2,
                    bgcolor: T.surface,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: deptFilter ? T.primary : T.border,
                    },
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 12, color: T.textSec }}>
                    All Departments
                  </MenuItem>
                  {/* {(departments.length > 0 ? departments : ['MANAGEMENT', 'IT', 'FINANCE', 'HR', 'OPERATIONS']).map((d) => (
                    <MenuItem key={d} value={d} sx={{ fontSize: 12 }}>
                      {d}
                    </MenuItem> */}
 
                    
                    {departments.map((d) => (
  <MenuItem key={d.id} value={d.id} sx={{ fontSize: 12 }}>
    {d.name}
  </MenuItem>
))}
 
 
            
                </Select>
 
 
                <Select
  size="small"
  displayEmpty
  value={designationFilter}
  onChange={(e) => setDesignationFilter(e.target.value)}
  renderValue={(v) =>
    v ? (designations.find((d) => d.id === v)?.name || v)
      : <Typography sx={{ fontSize: 12, color: T.textSec }}>Designation</Typography>
  }
  sx={{
    fontSize: 12,
    height: 34,
    minWidth: 140,
    borderRadius: 2,
    bgcolor: T.surface,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: designationFilter ? T.primary : T.border,
    },
  }}
>
  <MenuItem value="" sx={{ fontSize: 12, color: T.textSec }}>
    All Designations
  </MenuItem>
  {designations.map((d) => (
    <MenuItem key={d.id} value={d.id} sx={{ fontSize: 12 }}>
      {d.name}
    </MenuItem>
  ))}
</Select>
 
 
 
                <Select
                  size="small"
                  displayEmpty
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  renderValue={(v) => v || <Typography sx={{ fontSize: 12, color: T.textSec }}>Status</Typography>}
                  sx={{
                    fontSize: 12,
                    height: 34,
                    minWidth: 120,
                    borderRadius: 2,
                    bgcolor: T.surface,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: statusFilter ? T.primary : T.border,
                    },
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: 12, color: T.textSec }}>
                    All Status
                  </MenuItem>
                  <MenuItem value="ACTIVE" sx={{ fontSize: 12 }}>
                    ACTIVE
                  </MenuItem>
                  <MenuItem value="INACTIVE" sx={{ fontSize: 12 }}>
                    INACTIVE
                  </MenuItem>
                  <MenuItem value="PENDINGACTIVATION" sx={{ fontSize: 12 }}>
                    PENDINGACTIVATION
                  </MenuItem>
                </Select>
 
                <Box sx={{ width: 1, height: 24, bgcolor: T.border, mx: 0.5 }} />
 
                {(userSearch || deptFilter || designationFilter|| statusFilter) && (
                  <Fade in>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={`${[userSearch, deptFilter, designationFilter, statusFilter].filter(Boolean).length} filter${[userSearch, deptFilter, designationFilter, statusFilter].filter(Boolean).length > 1 ? 's' : ''} active`}
                        sx={{ height: 24, fontSize: 11, fontWeight: 700, bgcolor: `${T.primary}12`, color: T.primary, borderRadius: 2 }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloseIcon sx={{ fontSize: 13 }} />}
                        onClick={() => {
                          setUserSearch('');
                          setDeptFilter('');
                          setDesignationFilter('');
                          setStatusFilter('');
                        }}
                        sx={{
                          height: 28,
                          fontSize: 11,
                          borderRadius: 2,
                          color: T.error,
                          borderColor: `${T.error}50`,
                          px: 1.5,
                          minWidth: 0,
                          '&:hover': { borderColor: T.error, bgcolor: `${T.error}08` },
                        }}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Fade>
                )}
 
                <Box sx={{ flex: 1 }} />
 
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {someChecked && (
                    <Fade in>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={tab === 'members' ? <PersonRemoveIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
                        onClick={() => {
                          const currentSelection = displayUsers.filter((u) => checkedIds.has(u.id));
                          setBulkSelection(currentSelection);
 
                          if (tab === 'members') {
                            setBulkRevokeOpen(true);
                          } else {
                            setBulkOpen(true);
                          }
                        }}
                        sx={{
                          background: tab === 'members' ? T.error : T.grad,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: 12,
                          height: 32,
                          boxShadow: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tab === 'members' ? `Revoke from ${checkedIds.size}` : `Assign ${checkedIds.size}`}
                      </Button>
                    </Fade>
                  )}
                </Box>
              </Box>
 {usersLoading && <LinearProgress sx={{ height: 2 }} />}
 
              <TableHeader allChecked={allChecked} someChecked={someChecked} onCheckAll={toggleAll} tab={tab} />
 
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {usersLoading && displayUsers.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'grid',
                      //  gridTemplateColumns: '40px 1fr 160px 200px 110px 48px',
                      gridTemplateColumns: '40px 1fr 140px 140px 200px 110px 48px',
 
                        gap: 1,
                        px: 2,
                        py: 1.2,
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <Skeleton variant="rectangular" width={20} height={20} />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="circular" width={30} height={30} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="60%" height={14} />
                          <Skeleton width="40%" height={12} />
                        </Box>
                      </Box>
                      <Skeleton width="70%" height={14} />
                        <Skeleton width="60%" height={14} />
                      <Skeleton width="80%" height={14} />
                      <Skeleton width={60} height={18} />
                      <Skeleton variant="circular" width={28} height={28} />
                    </Box>
                  ))
                ) : displayUsers.length === 0 ? (
                  <EmptyState
                    icon={tab === 'members' ? <GroupIcon sx={{ color: T.textSec, fontSize: 24 }} /> : <PersonAddIcon sx={{ color: T.textSec, fontSize: 24 }} />}
                    title={tab === 'members' ? 'No members yet' : 'No available employees'}
                    subtitle={
                      tab === 'members'
                        ? 'Switch to "Available Employees" tab to assign this role'
                        : 'All employees already have a role assigned'
                    }
                  />
                ) : (
                  
             
displayUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      checked={checkedIds.has(user.id)}
                      onCheck={() => toggleCheck(user.id)}
                      actionDisabled={assigning}
                      actionTooltip={tab === 'members' ? 'Revoke role' : 'Assign role'}
                      actionColor={tab === 'members' ? T.error : T.primary}
                      actionIcon={tab === 'members' ? <PersonRemoveIcon sx={{ fontSize: 18 }} /> : <PersonAddIcon sx={{ fontSize: 18 }} />}
                      onAction={tab === 'members' ? handleRevoke : handleAssign}
                    />
                  ))
                )}
              </Box>
 
              <Pager
                page={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={(v) => {
                  setPageSize(v);
                  setPage(0);
                }}
              />
            </>
          )}
        </Paper>
      </Box>
 
      <RoleDialog open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
      <RoleDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} existing={editTarget} />
 
      <ConfirmDialog
    open={!!deleteTarget}
    danger
    title="Delete Role"
    body={`Permanently delete "${deleteTarget?.name}"? This cannot be undone. Members will lose this role assignment.`}
    confirmLabel="Delete"
    onConfirm={handleDelete}
    onClose={() => setDeleteTarget(null)}
/>
 
      <BulkAssignDialog
        open={bulkOpen}
        onClose={() => {
          setBulkOpen(false);
          setBulkSelection([]);
        }}
        selectedUsers={bulkSelection}
        roleName={selected?.name || ''}
        onConfirm={handleBulkAssign}
        loading={bulkBusy}
      />
 
      <ConfirmDialog
        open={bulkRevokeOpen}
        danger
        title={`Revoke "${selected?.name}" from ${bulkSelection.length} employees?`}
        body="This will remove the role from all selected employees. They will have no role until reassigned."
        confirmLabel={`Revoke from ${bulkSelection.length}`}
        onConfirm={handleBulkRevoke}
        onClose={() => {
          setBulkRevokeOpen(false);
          setBulkSelection([]);
        }}
      />
 
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
 
 
 
 