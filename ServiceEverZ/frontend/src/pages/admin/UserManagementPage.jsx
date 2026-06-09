// FILE: src/pages/admin/UserManagementPage.jsx
import React, {
  useEffect, useState, useCallback, useMemo, useRef,
} from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Button,
  Typography, Tooltip, Avatar, Chip, Divider, Dialog,
  DialogTitle, DialogContent, TextField, DialogActions,
  Select, FormControl, InputLabel, MenuItem, Grid, Switch,
  CircularProgress, Stack, Checkbox, Alert, InputAdornment,
  Badge, LinearProgress, Paper,
} from '@mui/material';
import {
  Add, CloudUpload, Edit, People, Delete, LocationOn,
  AddLocationAlt, AddBusiness, AddCircleOutline,
  DeleteOutline, Close, Search, SaveOutlined,
  CancelOutlined, CheckCircle, Refresh, FilterList,
  ExpandMore, ExpandLess, PersonAdd, Block,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
 
import PageHeader      from '../../components/common/PageHeader';
import StatusChip      from '../../components/common/StatusChip';
import ConfirmDialog   from '../../components/common/ConfirmDialog';
import UserFilters     from '../../components/users/UserFilters';
import CreateUserDialog from '../../components/users/CreateUserDialog';
import BulkUploadDialog from '../../components/users/BulkUploadDialog';
 
import { userApi } from '../../api/userApi';
import { orgApi }  from '../../api/orgApi';
import { roleApi } from '../../api/roleApi';
import { formatName, formatDateTime } from '../../utils/formatters';
 
/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const OTHER_DEPARTMENT  = '__OTHER_DEPARTMENT__';
const OTHER_DESIGNATION = '__OTHER_DESIGNATION__';
const LOCATION_PER_PAGE = 6;
 
const EMPTY_FILTERS = {
  search: '', status: '', department: '',
  designation: '', role: '', location: '', sortBy: '',
};
 
const AVATAR_COLORS = [
  '#27235C', '#97247E', '#24A148',
  '#E2B93B', '#AC5098', '#1976d2', '#E01950',
];
const getAvatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
const getInitials    = (u)  =>
  `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || '?';
 
/* ─────────────────────────────────────────────────────────────
   Stat strip at top of table
───────────────────────────────────────────────────────────── */
const StatBadge = ({ label, value, color, bg }) => (
  <Box sx={{ textAlign: 'center', px: 2, py: 1.25, borderRadius: 2, bgcolor: bg, minWidth: 80 }}>
    <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: '0.68rem', color, fontWeight: 600, mt: 0.2, opacity: 0.8 }}>{label}</Typography>
  </Box>
);
 
/* ─────────────────────────────────────────────────────────────
   Inline-create box (dept / desig)
───────────────────────────────────────────────────────────── */
const InlineCreate = ({ icon: Icon, title, fields, onSave, onCancel, saving }) => (
  <Box sx={{
    mt: 1.5, p: 2,
    border: '1.5px dashed #D1D5DB', borderRadius: 2,
    bgcolor: '#FAFAFD',
  }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <Icon sx={{ color: '#27235C', fontSize: 18 }} />
      <Typography fontWeight={700} fontSize="0.88rem">{title}</Typography>
    </Stack>
    {fields}
    <Stack direction="row" spacing={1.5} sx={{ mt: 1.75 }}>
      <Button variant="contained" size="small" onClick={onSave} disabled={saving}
        sx={{ minWidth: 80 }}>
        {saving ? <CircularProgress size={14} color="inherit" /> : 'Create'}
      </Button>
      <Button variant="outlined" size="small" onClick={onCancel}
        sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
        Cancel
      </Button>
    </Stack>
  </Box>
);
 
/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const UserManagementPage = () => {
 
  /* ── Core data ── */
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [userRolesMap, setRolesMap]     = useState({}); // userId → string[]
  const [rolesLoading, setRolesLoading] = useState(false);
 
  /* ── Filter / pagination ── */
  const [filters,     setFilters]  = useState(EMPTY_FILTERS);
  const [page,        setPage]     = useState(0);
  const [rowsPerPage, setRpp]      = useState(10);
  const [selected,    setSelected] = useState([]);
 
  /* ── Dialogs ── */
  const [createOpen,   setCreateOpen]   = useState(false);
  const [createLoading,setCreateLoading]= useState(false);
  const [createError,  setCreateError]  = useState('');
  const [bulkOpen,     setBulkOpen]     = useState(false);
  const [confirm,      setConfirm]      = useState({ open: false, userId: null, action: '' });
  const [actionLoading,setActionLoading]= useState(false);
 
  /* ── Edit dialog ── */
  const [editUser,     setEditUser]    = useState(null);
  const [editErrors,   setEditErrors]  = useState({});
  const [editMasterErr,setEditMasterErr]= useState('');
  const [departments,  setDepartments] = useState([]);
  const [editDesigs,   setEditDesigs]  = useState([]);
  const [metaLoading,  setMetaLoading] = useState(false);
  const [desigLoading, setDesigLoading]= useState(false);
 
  // Inline create — edit dialog
  const [editDeptMode,    setEditDeptMode]    = useState(false);
  const [editNewDept,     setEditNewDept]     = useState('');
  const [editNewDeptDesig,setEditNewDeptDesig]= useState('');
  const [savingDept,      setSavingDept]      = useState(false);
  const [editDesigMode,   setEditDesigMode]   = useState(false);
  const [editNewDesig,    setEditNewDesig]    = useState('');
  const [savingDesig,     setSavingDesig]     = useState(false);
 
  /* ── Location dialog ── */
  const [locations,        setLocations]        = useState([]);
  const [locLoading,       setLocLoading]       = useState(false);
  const [mapLocOpen,       setMapLocOpen]       = useState(false);
  const [mapTarget,        setMapTarget]        = useState(null);
  const [selectedLocId,    setSelectedLocId]    = useState('');
  const [newLocName,       setNewLocName]       = useState('');
  const [mapLocSaving,     setMapLocSaving]     = useState(false);
  const [createLocSaving,  setCreateLocSaving]  = useState(false);
  const [deleteLocSaving,  setDeleteLocSaving]  = useState(false);
  const [confirmDelLocOpen,setConfirmDelLocOpen]= useState(false);
  const [locToDelete,      setLocToDelete]      = useState(null);
  const [editingLocId,     setEditingLocId]     = useState(null);
  const [editingLocName,   setEditingLocName]   = useState('');
  const [editLocSaving,    setEditLocSaving]    = useState(false);
  const [locDialogPage,    setLocDialogPage]    = useState(0);
 
  /* ─── user count per location ─────────────────────────────────── */
  const userCountByLoc = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (u.locationId) map[u.locationId] = (map[u.locationId] || 0) + 1;
    });
    return map;
  }, [users]);
 
  /* ─────────────────────────────────────────────────────────────
     DATA LOADERS
  ───────────────────────────────────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await userApi.getAllUsers();
      const data = res.data?.content || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  // ── KEY FIX: fetch ALL roles in one batch (Promise.allSettled)
  // so we never block the render loop and never reset page mid-load
  const fetchRoles = useCallback(async (userList) => {
    if (!userList.length) { setRolesMap({}); return; }
    setRolesLoading(true);
    try {
      const results = await Promise.allSettled(
        userList.map((u) =>
          roleApi.getRolesForUser(u.id)
            .then((r) => {
              const raw = r.data?.content || r.data?.roles || r.data || [];
              return { id: u.id, roles: Array.isArray(raw) ? raw : [] };
            })
            .catch(() => ({ id: u.id, roles: [] }))
        )
      );
      const map = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') map[r.value.id] = r.value.roles;
      });
      // Single state update — no re-render cascade
      setRolesMap(map);
    } finally {
      setRolesLoading(false);
    }
  }, []);
 
  const loadDepartments = useCallback(async () => {
    try {
      const res  = await orgApi.getAllDepartments();
      const data = res.data?.content || res.data || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch { setDepartments([]); }
  }, []);
 
  const loadDesigs = useCallback(async (deptId) => {
    if (!deptId || deptId === OTHER_DEPARTMENT) { setEditDesigs([]); return; }
    setDesigLoading(true);
    try {
      const res  = await orgApi.getDesignationsByDepartment(deptId);
      const data = res.data?.content || res.data || [];
      setEditDesigs(Array.isArray(data) ? data : []);
    } catch { setEditDesigs([]); }
    finally { setDesigLoading(false); }
  }, []);
 
  const loadLocations = useCallback(async () => {
    setLocLoading(true);
    try {
      const res  = await userApi.getAllLocations();
      const data = res.data?.content || res.data || [];
      setLocations(Array.isArray(data) ? data : []);
    } catch { setLocations([]); }
    finally { setLocLoading(false); }
  }, []);
 
  // Initial load
  useEffect(() => {
    fetchUsers();
    loadDepartments();
    loadLocations();
  }, [fetchUsers, loadDepartments, loadLocations]);
 
  // Fetch roles once users are loaded — batch, single update
  useEffect(() => { fetchRoles(users); }, [users, fetchRoles]);
 
  // Auto-refresh every 60 seconds
  useEffect(() => {
    const t = setInterval(() => { fetchUsers(); }, 60000);
    return () => clearInterval(t);
  }, [fetchUsers]);
 
  /* ─────────────────────────────────────────────────────────────
     FILTER + SORT  — pure derivation, never mutates page
  ───────────────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = (filters.search || '').toLowerCase();
    const list = users.filter((u) => {
      const roles   = userRolesMap[u.id] || [];
      const dept    = u.departmentName  || u.department  || '';
      const desig   = u.designationName || u.designation || '';
      const loc     = u.locationName    || '';
      return (
        (!q || `${u.firstName} ${u.lastName} ${u.email} ${loc}`.toLowerCase().includes(q)) &&
        (!filters.status      || u.status === filters.status) &&
        (!filters.department  || dept   === filters.department) &&
        (!filters.designation || desig  === filters.designation) &&
        (!filters.location    || loc    === filters.location) &&
        (!filters.role        || roles.some((r) => (typeof r === 'string' ? r : r.name) === filters.role))
      );
    });
    return [...list].sort((a, b) => {
      const na = formatName(a.firstName, a.lastName).toLowerCase();
      const nb = formatName(b.firstName, b.lastName).toLowerCase();
      switch (filters.sortBy) {
        case 'name_asc':       return na.localeCompare(nb);
        case 'name_desc':      return nb.localeCompare(na);
        case 'email_asc':      return (a.email || '').localeCompare(b.email || '');
        case 'createdAt_desc': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'createdAt_asc':  return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:               return 0;
      }
    });
  }, [users, userRolesMap, filters]);
 
  // ── Page slice — always recalculated from `filtered` ──────────────────
  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );
 
  // ── Summary stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   users.length,
    active:  users.filter((u) => u.status === 'ACTIVE').length,
    pending: users.filter((u) => u.status === 'PENDINGACTIVATION').length,
    disabled:users.filter((u) => u.status === 'DISABLED').length,
  }), [users]);
 
  /* ─────────────────────────────────────────────────────────────
     SELECTION
  ───────────────────────────────────────────────────────────── */
  const allPageSel = paginated.length > 0 && paginated.every((u) => selected.includes(u.id));
  const somePageSel = paginated.some((u) => selected.includes(u.id)) && !allPageSel;
 
  const togglePageSelect = (checked) => {
    const ids = paginated.map((u) => u.id);
    setSelected((p) => checked
      ? [...new Set([...p, ...ids])]
      : p.filter((id) => !ids.includes(id))
    );
  };
  const toggleOne = (id) =>
    setSelected((p) => p.includes(id) ? p.filter((v) => v !== id) : [...p, id]);
 
  const selectedUsers = useMemo(
    () => users.filter((u) => selected.includes(u.id)),
    [users, selected]
  );
 
  /* ─────────────────────────────────────────────────────────────
     CREATE USER
  ───────────────────────────────────────────────────────────── */
  const handleCreateUser = async (data) => {
    setCreateLoading(true); setCreateError('');
    try {
      await userApi.createUser(data);
      await fetchUsers();
      toast.success('User created successfully');
      setCreateOpen(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };
 
  /* ─────────────────────────────────────────────────────────────
     EDIT USER
  ───────────────────────────────────────────────────────────── */
  const resetEditState = () => {
    setEditDeptMode(false); setEditNewDept(''); setEditNewDeptDesig('');
    setEditDesigMode(false); setEditNewDesig('');
    setEditMasterErr(''); setEditErrors({});
  };
 
  const openEdit = async (user) => {
    resetEditState();
    const norm = {
      ...user,
      departmentId:  user.departmentId  || departments.find((d) => d.name === user.departmentName)?.id || '',
      designationId: user.designationId || '',
      locationId:    user.locationId    || '',
    };
    setEditUser(norm);
    if (norm.departmentId) await loadDesigs(norm.departmentId);
    else setEditDesigs([]);
  };
 
  const closeEdit = () => { setEditUser(null); resetEditState(); };
 
  // Validation
  const validate = () => {
    const e = {};
    const u = editUser;
    if (!u.firstName?.trim()  || u.firstName.trim().length < 2)  e.firstName  = 'Min 2 characters';
    if (!/^[A-Za-z\s]+$/.test(u.firstName || ''))                e.firstName  = 'Letters only';
    if (!u.lastName?.trim()   || u.lastName.trim().length < 2)   e.lastName   = 'Min 2 characters';
    if (!/^[A-Za-z\s]+$/.test(u.lastName || ''))                 e.lastName   = 'Letters only';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(u.email || '')) e.email = 'Invalid email';
    if (!u.departmentId  || u.departmentId  === OTHER_DEPARTMENT)  e.departmentId  = 'Required';
    if (!u.designationId || u.designationId === OTHER_DESIGNATION) e.designationId = 'Required';
    if (!u.status) e.status = 'Required';
    setEditErrors(e);
    return !Object.keys(e).length;
  };
 
  const handleDeptChange = async (val) => {
    setEditMasterErr('');
    setEditErrors((p) => ({ ...p, departmentId: '', designationId: '' }));
    if (val === OTHER_DEPARTMENT) {
      setEditUser((p) => ({ ...p, departmentId: val, designationId: '' }));
      setEditDeptMode(true); setEditDesigMode(false); setEditDesigs([]);
      return;
    }
    setEditDeptMode(false);
    setEditUser((p) => ({ ...p, departmentId: val, designationId: '' }));
    await loadDesigs(val);
  };
 
  const handleDesigChange = (val) => {
    setEditMasterErr('');
    setEditErrors((p) => ({ ...p, designationId: '' }));
    if (val === OTHER_DESIGNATION) {
      setEditUser((p) => ({ ...p, designationId: val }));
      setEditDesigMode(true);
      return;
    }
    setEditDesigMode(false);
    setEditUser((p) => ({ ...p, designationId: val }));
  };
 
  const handleCreateDept = async () => {
    const dept  = editNewDept.trim();
    const desig = editNewDeptDesig.trim();
    if (!dept)  return setEditMasterErr('Department name required');
    if (!desig) return setEditMasterErr('First designation required');
    if (!/^[A-Za-z\s]{2,50}$/.test(dept))  return setEditMasterErr('Letters only (2–50 chars)');
    if (!/^[A-Za-z\s]{2,50}$/.test(desig)) return setEditMasterErr('Letters only (2–50 chars)');
    if (departments.some((d) => d.name.toLowerCase() === dept.toLowerCase()))
      return setEditMasterErr('Department already exists');
    setSavingDept(true); setEditMasterErr('');
    try {
      const dRes   = await orgApi.createDepartment({ name: dept });
      const created = dRes.data;
      const dsgRes = await orgApi.createDesignation({ name: desig, departmentId: created.id });
      await loadDepartments();
      await loadDesigs(created.id);
      setEditUser((p) => ({ ...p, departmentId: created.id, designationId: dsgRes.data.id }));
      setEditDeptMode(false); setEditNewDept(''); setEditNewDeptDesig('');
      toast.success('Department and designation created');
    } catch (err) {
      setEditMasterErr(err.response?.data?.message || 'Failed');
    } finally { setSavingDept(false); }
  };
 
  const handleCreateDesig = async () => {
    const desig = editNewDesig.trim();
    if (!desig) return setEditMasterErr('Designation name required');
    if (!/^[A-Za-z\s]{2,50}$/.test(desig)) return setEditMasterErr('Letters only');
    if (editDesigs.some((d) => d.name.toLowerCase() === desig.toLowerCase()))
      return setEditMasterErr('Already exists');
    setSavingDesig(true); setEditMasterErr('');
    try {
      const res = await orgApi.createDesignation({ name: desig, departmentId: Number(editUser.departmentId) });
      await loadDesigs(editUser.departmentId);
      setEditUser((p) => ({ ...p, designationId: res.data.id }));
      setEditDesigMode(false); setEditNewDesig('');
      toast.success('Designation created');
    } catch (err) {
      setEditMasterErr(err.response?.data?.message || 'Failed');
    } finally { setSavingDesig(false); }
  };
 
  const handleUpdateUser = async () => {
    if (!validate()) return;
    try {
      const res = await userApi.updateUser(editUser.id, {
        firstName:     editUser.firstName.trim(),
        lastName:      editUser.lastName.trim(),
        email:         editUser.email.trim(),
        departmentId:  Number(editUser.departmentId),
        designationId: Number(editUser.designationId),
        status:        editUser.status,
        locationId:    editUser.locationId ? Number(editUser.locationId) : null,
      });
      toast.success(`Updated ${res.data.firstName} ${res.data.lastName}`);
      closeEdit();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };
 
  /* ─────────────────────────────────────────────────────────────
     CONFIRM ACTIONS
  ───────────────────────────────────────────────────────────── */
  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.action === 'disable') {
        await userApi.disableUser(confirm.userId);
        toast.success('User disabled');
      } else if (confirm.action === 'enable') {
        await userApi.updateUser(confirm.userId, { status: 'PENDINGACTIVATION' });
        toast.success('User enabled');
      } else if (confirm.action === 'delete') {
        await userApi.deleteUserById(confirm.userId);
        toast.success('User deleted');
      }
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setConfirm({ open: false, userId: null, action: '' });
    }
  };
 
  /* ─────────────────────────────────────────────────────────────
     LOCATION HANDLERS
  ───────────────────────────────────────────────────────────── */
  const openMapLoc = (user = null) => {
    setMapTarget(user);
    setSelectedLocId(user?.locationId || '');
    setNewLocName('');
    setEditingLocId(null); setEditingLocName('');
    setLocDialogPage(0);
    setMapLocOpen(true);
  };
 
  const handleCreateLoc = async () => {
    const name = newLocName.trim();
    if (!name) return toast.error('Location name required');
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) return toast.error('Must start with capital letter, letters only');
    setCreateLocSaving(true);
    try {
      const res = await userApi.createLocation({ name });
      toast.success('Location created');
      setNewLocName('');
      await loadLocations();
      if (res.data?.id) setSelectedLocId(res.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setCreateLocSaving(false); }
  };
 
  const handleMapLoc = async () => {
    if (!selectedLocId) return toast.error('Select a location');
    setMapLocSaving(true);
    try {
      if (mapTarget?.id) {
        await userApi.mapLocation(mapTarget.id, { locationId: Number(selectedLocId) });
        toast.success('Location mapped');
      } else if (selected.length > 0) {
        await Promise.all(
          selected.map((uid) => userApi.mapLocation(uid, { locationId: Number(selectedLocId) }))
        );
        toast.success(`Mapped for ${selected.length} users`);
        setSelected([]);
      }
      setMapLocOpen(false); setMapTarget(null); setSelectedLocId('');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setMapLocSaving(false); }
  };
 
  const handleSaveEditLoc = async () => {
    const name = editingLocName.trim();
    if (!name) return toast.error('Name required');
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) return toast.error('Must start with capital letter, letters only');
    setEditLocSaving(true);
    try {
      await userApi.updateLocation(editingLocId, { name });
      toast.success('Location updated');
      setEditingLocId(null); setEditingLocName('');
      await loadLocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setEditLocSaving(false); }
  };
 
  const handleDeleteLoc = async () => {
    setDeleteLocSaving(true);
    try {
      await userApi.deleteLocation(locToDelete.id);
      toast.success('Location deleted');
      if (Number(selectedLocId) === Number(locToDelete.id)) setSelectedLocId('');
      await loadLocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleteLocSaving(false);
      setConfirmDelLocOpen(false); setLocToDelete(null);
    }
  };
 
  const locTotalPages    = Math.max(1, Math.ceil(locations.length / LOCATION_PER_PAGE));
  const paginatedLocs    = locations.slice(locDialogPage * LOCATION_PER_PAGE, (locDialogPage + 1) * LOCATION_PER_PAGE);
  const editDeptName     = departments.find((d) => String(d.id) === String(editUser?.departmentId))?.name || '';
 
  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ bgcolor: '#F0F2F8', minHeight: '100vh', width:'80vw ' , height:'100%'}}>
 
      {/* ── Page header ────────────────────────────────────────────────── */}
      <PageHeader
        title="User management"
        subtitle={`Managing ${users.length} users across the organisation`}
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Users' }]}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="Refresh users">
              <IconButton
                size="small"
                onClick={() => fetchUsers()}
                disabled={loading}
                sx={{ border: '1px solid #E5E7EB', borderRadius: 2, color: '#27235C' }}
              >
                {loading ? <CircularProgress size={16} /> : <Refresh fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" startIcon={<CloudUpload />}
              onClick={() => setBulkOpen(true)}
              sx={{ borderColor: '#E5E7EB', color: '#374151', fontSize: '0.8rem' }}>
              Bulk upload
            </Button>
    
            <Button variant="contained" size="small" startIcon={<Add />}
              onClick={() => { setCreateError(''); setCreateOpen(true); }}
              sx={{ fontSize: '0.8rem' }}>
              Create user
            </Button>
          </Stack>
        }
      />
 
 
      {/* ── Main card ──────────────────────────────────────────────────── */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
 
        {/* Filters */}
        <Box sx={{ p: 2.5, bgcolor: '#FAFAFC', borderBottom: '1px solid #F0F0F5' }}>
          <UserFilters
            filters={filters}
            onChange={(f) => { setFilters((p) => ({ ...p, ...f })); setPage(0); }}
            onReset={() => { setFilters(EMPTY_FILTERS); setPage(0); }}
            resultCount={filtered.length}
            totalCount={users.length}
            locations={locations}
          />
        </Box>
 
        {/* Role loading indicator */}
        {rolesLoading && (
          <Box sx={{ px: 2.5, pt: 0.5 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mb: 0.25 }}>
              Loading role data…
            </Typography>
            <LinearProgress sx={{ height: 2, borderRadius: 1 }} />
          </Box>
        )}
 
        {/* Selection bar */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Box sx={{
                px: 2.5, py: 1.25,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: '#F5F4FF', borderBottom: '1px solid #E9D5FF',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Badge badgeContent={selected.length} color="primary"
                    sx={{ '& .MuiBadge-badge': { bgcolor: '#27235C' } }}>
                    <People sx={{ color: '#27235C', fontSize: 20 }} />
                  </Badge>
                  <Typography sx={{ fontSize: '0.845rem', fontWeight: 700, color: '#27235C' }}>
                    {selected.length} user{selected.length > 1 ? 's' : ''} selected
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined"
                    startIcon={<LocationOn sx={{ fontSize: 15 }} />}
                    onClick={() => openMapLoc(null)}
                    sx={{ borderColor: '#97247E', color: '#97247E', fontSize: '0.75rem' }}>
                    Map location
                  </Button>
                  <Button size="small" variant="text"
                    onClick={() => setSelected([])}
                    sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                    Clear
                  </Button>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* ── Table ────────────────────────────────────────────────────── */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: '#F8F8FC' }}>
                  <Checkbox
                    size="small"
                    checked={allPageSel}
                    indeterminate={somePageSel}
                    onChange={(e) => togglePageSelect(e.target.checked)}
                    sx={{ '&.Mui-checked': { color: '#27235C' }, '&.MuiCheckbox-indeterminate': { color: '#27235C' } }}
                  />
                </TableCell>
                {['User', 'Email', 'Department', 'Designation', 'Location', 'Status', 'Roles', 'Created', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{
                    bgcolor: '#F8F8FC', fontWeight: 800, fontSize: '0.72rem',
                    color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
 
            <TableBody>
              {loading ? (
                Array(rowsPerPage).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(10).fill(0).map((__, j) => (
                      <TableCell key={j}>
                        <Box sx={{
                          height: 14, bgcolor: '#F0F0F5', borderRadius: 1,
                          width: j === 0 ? 20 : j === 1 ? 140 : j === 2 ? 160 : j === 8 ? 80 : 100,
                          animation: 'pulse 1.5s infinite',
                          '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
                        }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <People sx={{ fontSize: 48, color: '#E5E7EB', mb: 1 }} />
                      <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 500 }}>
                        {Object.values(filters).some(Boolean) ? 'No users match your filters' : 'No users yet'}
                      </Typography>
                      {Object.values(filters).some(Boolean) && (
                        <Button size="small" onClick={() => setFilters(EMPTY_FILTERS)}
                          sx={{ mt: 1, color: '#97247E', fontSize: '0.78rem' }}>
                          Clear filters
                        </Button>
                      )}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    component={TableRow}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    hover
                    selected={selected.includes(user.id)}
                    sx={{
                      cursor: 'default',
                      '&.Mui-selected': { bgcolor: '#F5F4FF !important' },
                      '&:hover': { bgcolor: '#F9F9FD' },
                      transition: 'background 0.12s',
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleOne(user.id)}
                        sx={{ '&.Mui-checked': { color: '#27235C' } }}
                      />
                    </TableCell>
 
                    {/* User */}
                    <TableCell sx={{ minWidth: 170 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                          width: 34, height: 34, fontSize: '0.72rem', fontWeight: 800,
                          bgcolor: getAvatarColor(user.id), flexShrink: 0,
                        }}>
                          {getInitials(user)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.845rem', fontWeight: 700, color: '#1B193F', lineHeight: 1.2 }}>
                            {formatName(user.firstName, user.lastName)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                            #{String(user.id).padStart(4, '0')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
 
                    {/* Email */}
                    <TableCell sx={{ minWidth: 180 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#6B7280' }}>{user.email}</Typography>
                    </TableCell>
 
                    {/* Department */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.82rem' }}>
                        {user.departmentName || user.department || '—'}
                      </Typography>
                    </TableCell>
 
                    {/* Designation */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.82rem' }}>
                        {user.designationName || user.designation || '—'}
                      </Typography>
                    </TableCell>
 
                    {/* Location */}
                    <TableCell>
                      {user.locationName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 13, color: '#97247E' }} />
                          <Typography sx={{ fontSize: '0.82rem', color: '#374151' }}>{user.locationName}</Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '0.78rem', color: '#D1D5DB', fontStyle: 'italic' }}>
                          Unset
                        </Typography>
                      )}
                    </TableCell>
 
                    {/* Status */}
                    <TableCell><StatusChip status={user.status || 'ACTIVE'} /></TableCell>
 
                    {/* Roles */}
                    <TableCell sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(userRolesMap[user.id] || []).length > 0
                          ? (userRolesMap[user.id] || []).slice(0, 2).map((r) => {
                              const name = typeof r === 'string' ? r : r.name;
                              return (
                                <Chip key={name} label={name} size="small" sx={{
                                  height: 18, fontSize: '0.6rem', fontWeight: 700,
                                  bgcolor: '#EEEDF8', color: '#27235C',
                                  '& .MuiChip-label': { px: 0.75 },
                                }} />
                              );
                            })
                          : (
                            <Typography sx={{ fontSize: '0.72rem', color: '#D1D5DB', fontStyle: 'italic' }}>
                              No role
                            </Typography>
                          )
                        }
                      </Box>
                    </TableCell>
 
                    {/* Created */}
                    <TableCell sx={{ minWidth: 130 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {formatDateTime(user.createdAt) || '—'}
                      </Typography>
                    </TableCell>
 
                    {/* Actions */}
                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', alignItems: 'center' }}>
                        <Tooltip title="Edit user">
                          <IconButton size="small" onClick={() => openEdit(user)}
                            sx={{ color: '#27235C', '&:hover': { bgcolor: '#EEEDF8' } }}>
                            <Edit sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
 
                        <Tooltip title="Map location">
                          <IconButton size="small" onClick={() => openMapLoc(user)}
                            sx={{ color: '#97247E', '&:hover': { bgcolor: '#F9EFF7' } }}>
                            <LocationOn sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
 
                        <Tooltip title={user.status === 'DISABLED' ? 'Enable user' : 'Disable user'}>
                          <Switch
                            size="small"
                            checked={user.status !== 'DISABLED'}
                            onChange={() => setConfirm({
                              open: true, userId: user.id,
                              action: user.status === 'DISABLED' ? 'enable' : 'disable',
                            })}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#24A148' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#24A148' },
                              '& .MuiSwitch-switchBase': { color: '#E01950' },
                              '& .MuiSwitch-track': { bgcolor: '#E01950' },
                            }}
                          />
                        </Tooltip>
 
                        <Tooltip title="Delete user">
                          <IconButton size="small"
                            onClick={() => setConfirm({ open: true, userId: user.id, action: 'delete' })}
                            sx={{ color: '#E01950', '&:hover': { bgcolor: '#FFF1F3' } }}>
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
 
        {/* ── Pagination bar ────────────────────────────────────────────── */}
        <Box sx={{
          px: 2.5, py: 1,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 1,
          borderTop: '1px solid #F0F0F5',
          bgcolor: '#FAFAFC',
        }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
            Showing <strong>{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)}</strong>
            {' '}of <strong>{filtered.length}</strong> users
            {filtered.length !== users.length && (
              <span style={{ color: '#9CA3AF' }}> (filtered from {users.length})</span>
            )}
          </Typography>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRpp(+e.target.value); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            sx={{
              '& .MuiTablePagination-toolbar': { minHeight: 44 },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.78rem',
              },
            }}
          />
        </Box>
      </Card>
 
      {/* ══════════════════════════════════════════════════════════════════
          EDIT USER DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!editUser} onClose={closeEdit} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{p:'0'}}>
          <Box sx={{
            background: 'linear-gradient(135deg,#1B193F,#27235C)',
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5}}>
              <Avatar sx={{
                width: 36, height: 36, fontSize: '0.78rem', fontWeight: 800,
                bgcolor: getAvatarColor(editUser?.id),
              }}>
                {editUser ? getInitials(editUser) : '?'}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                  Edit user
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>
                  #{String(editUser?.id || 0).padStart(4, '0')}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={closeEdit}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
 
        <DialogContent sx={{ px: 3, pb: 1}}>
          {editMasterErr && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setEditMasterErr('')}>
              {editMasterErr}
            </Alert>
          )}
 
          <Grid container spacing={2}>
            <Grid  sx={{pt:2}} item xs={6}>
              <TextField sx={{mt:3}} fullWidth size="small" label="First name"
                value={editUser?.firstName || ''}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                error={!!editErrors.firstName} helperText={editErrors.firstName} />
            </Grid>
            <Grid item xs={6}>
              <TextField sx={{mt:3}} fullWidth size="small" label="Last name"
                value={editUser?.lastName || ''}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                error={!!editErrors.lastName} helperText={editErrors.lastName} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Email"
                value={editUser?.email || ''}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                error={!!editErrors.email} helperText={editErrors.email} />
            </Grid>
 
            {/* Department */}
            <Grid item xs={12}>
              <FormControl fullWidth size="small" error={!!editErrors.departmentId}>
                <InputLabel>Department</InputLabel>
                <Select label="Department" value={editUser?.departmentId || ''}
                  onChange={(e) => handleDeptChange(e.target.value)} disabled={metaLoading}>
                  <MenuItem value=""><em>Select department</em></MenuItem>
                  {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                  <MenuItem value={OTHER_DEPARTMENT}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#27235C' }}>
                      <AddBusiness fontSize="small" />
                      <Typography sx={{ fontSize: '0.845rem', fontWeight: 600 }}>+ Add new department</Typography>
                    </Box>
                  </MenuItem>
                </Select>
                {editErrors.departmentId && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#E01950', mt: 0.5, ml: 1.5 }}>
                    {editErrors.departmentId}
                  </Typography>
                )}
              </FormControl>
 
              {editDeptMode && (
                <InlineCreate
                  icon={AddBusiness} title="Create department & first designation"
                  fields={
                    <Stack spacing={1}>
                      <TextField size="small" fullWidth label="Department name"
                        value={editNewDept} onChange={(e) => setEditNewDept(e.target.value)} />
                      <TextField size="small" fullWidth label="First designation"
                        value={editNewDeptDesig} onChange={(e) => setEditNewDeptDesig(e.target.value)} />
                    </Stack>
                  }
                  onSave={handleCreateDept} saving={savingDept}
                  onCancel={() => {
                    setEditDeptMode(false); setEditNewDept(''); setEditNewDeptDesig('');
                    setEditUser((p) => ({ ...p, departmentId: '' }));
                  }}
                />
              )}
            </Grid>
 
            {/* Designation */}
            <Grid item xs={12}>
              <FormControl fullWidth size="small" error={!!editErrors.designationId}
                disabled={!editUser?.departmentId || editUser?.departmentId === OTHER_DEPARTMENT || desigLoading || editDeptMode}>
                <InputLabel>Designation</InputLabel>
                <Select label="Designation" value={editUser?.designationId || ''}
                  onChange={(e) => handleDesigChange(e.target.value)}>
                  <MenuItem value=""><em>
                    {desigLoading ? 'Loading…' : !editUser?.departmentId ? 'Select department first' : 'Select designation'}
                  </em></MenuItem>
                  {editDesigs.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                  <MenuItem value={OTHER_DESIGNATION}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#27235C' }}>
                      <AddCircleOutline fontSize="small" />
                      <Typography sx={{ fontSize: '0.845rem', fontWeight: 600 }}>+ Add new designation</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
 
              {editDesigMode && (
                <InlineCreate
                  icon={AddCircleOutline}
                  title={`New designation for ${editDeptName}`}
                  fields={
                    <TextField size="small" fullWidth placeholder="Designation name"
                      value={editNewDesig} onChange={(e) => setEditNewDesig(e.target.value)} />
                  }
                  onSave={handleCreateDesig} saving={savingDesig}
                  onCancel={() => { setEditDesigMode(false); setEditNewDesig(''); }}
                />
              )}
            </Grid>
 
            {/* Location */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select label="Location" value={editUser?.locationId || ''}
                  onChange={(e) => setEditUser({ ...editUser, locationId: e.target.value })}>
                  <MenuItem value=""><em>Not set</em></MenuItem>
                  {locations.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
 
            {/* Status */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small" error={!!editErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={editUser?.status || ''}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="PENDINGACTIVATION">Pending activation</MenuItem>
                  <MenuItem value="DISABLED">Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
 
            {/* Employee ID (readonly) */}
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Employee ID"
                value={editUser?.employeeId || ''}
                disabled
                InputProps={{ sx: { color: '#24A148', fontFamily: 'monospace' } }}
                InputLabelProps={{ sx: { color: '#24A148' } }}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#24A14840' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
 
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={closeEdit}
            sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateUser}
            disabled={editDeptMode || editDesigMode}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* ══════════════════════════════════════════════════════════════════
          LOCATION DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={mapLocOpen} onClose={() => setMapLocOpen(false)}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
 
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{
            background: 'linear-gradient(135deg,#97247E,#AC5098)',
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                {mapTarget
                  ? `Set location — ${formatName(mapTarget.firstName, mapTarget.lastName)}`
                  : 'Manage & map locations'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', mt: 0.2 }}>
                Create, edit or delete locations. Select one to assign.
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setMapLocOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
 
          {/* Create bar */}
          <Box sx={{ px: 3, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderBottom: '1px solid #F0F0F5', bgcolor: '#FAFAFC' }}>
            <TextField size="small" label="New location name"
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLoc()}
              placeholder="e.g. Bangalore"
              sx={{ minWidth: 200 }} />
            <Button size="small" variant="contained" startIcon={<AddLocationAlt />}
              onClick={handleCreateLoc} disabled={createLocSaving}
              sx={{ bgcolor: '#97247E', '&:hover': { bgcolor: '#7B1C69' }, whiteSpace: 'nowrap' }}>
              {createLocSaving ? 'Creating…' : 'Create'}
            </Button>
          </Box>
        </DialogTitle>
 
        <DialogContent sx={{ p: 0 }}>
 
          {/* Selected users strip */}
          {!mapTarget && selected.length > 0 && (
            <Box sx={{ px: 3, py: 1.25, bgcolor: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#6B21A8', mb: 0.5 }}>
                Mapping for:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {selectedUsers.slice(0, 8).map((u) => (
                  <Chip key={u.id} size="small" label={formatName(u.firstName, u.lastName)}
                    sx={{ fontSize: '0.68rem', bgcolor: '#EDE9FE', color: '#5B21B6' }} />
                ))}
                {selectedUsers.length > 8 && (
                  <Chip size="small" label={`+${selectedUsers.length - 8} more`}
                    sx={{ fontSize: '0.68rem', bgcolor: '#EDE9FE', color: '#5B21B6' }} />
                )}
              </Box>
            </Box>
          )}
 
          {/* Location cards grid */}
          <Box sx={{ p: 2.5, minHeight: 200 }}>
            {locLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} sx={{ color: '#97247E' }} />
              </Box>
            ) : locations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <LocationOn sx={{ fontSize: 44, color: '#E5E7EB', mb: 1 }} />
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                  No locations yet — create your first above
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {paginatedLocs.map((loc) => {
                  const isSel     = String(selectedLocId) === String(loc.id);
                  const isEditing = editingLocId === loc.id;
                  const count     = userCountByLoc[loc.id] || 0;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={loc.id}>
                      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
                        <Box
                          onClick={() => !isEditing && setSelectedLocId(loc.id)}
                          sx={{
                            position: 'relative',
                            border: `${isSel ? '2px' : '1.5px'} solid ${isSel ? '#97247E' : '#E5E7EB'}`,
                            borderRadius: 2.5, p: 2,
                            cursor: isEditing ? 'default' : 'pointer',
                            bgcolor: isSel ? '#FDF4FB' : '#fff',
                            boxShadow: isSel ? '0 0 0 3px rgba(151,36,126,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.15s',
                            minHeight: 110,
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                          }}
                        >
                          {/* Selected badge */}
                          {isSel && (
                            <Box sx={{ position: 'absolute', top: -9, right: 10 }}>
                              <Chip label="Selected" size="small"
                                icon={<CheckCircle sx={{ fontSize: '12px !important', color: '#fff !important' }} />}
                                sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700,
                                      bgcolor: '#97247E', color: '#fff',
                                      '& .MuiChip-icon': { ml: '4px' } }} />
                            </Box>
                          )}
 
                          {/* Name / inline edit */}
                          {isEditing ? (
                            <TextField
                              size="small" autoFocus fullWidth
                              value={editingLocName}
                              onChange={(e) => setEditingLocName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditLoc();
                                if (e.key === 'Escape') { setEditingLocId(null); setEditingLocName(''); }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ mb: 1 }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOn sx={{ fontSize: 18, color: isSel ? '#97247E' : '#9CA3AF', flexShrink: 0 }} />
                              <Typography sx={{
                                fontSize: '0.92rem', fontWeight: isSel ? 700 : 500,
                                color: isSel ? '#97247E' : '#374151', wordBreak: 'break-word',
                              }}>
                                {loc.name}
                              </Typography>
                            </Box>
                          )}
 
                          {/* Footer */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}
                            onClick={(e) => e.stopPropagation()}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <People sx={{ fontSize: 13, color: '#9CA3AF' }} />
                              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                                {count} {count === 1 ? 'user' : 'users'}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.25}>
                              {isEditing ? (
                                <>
                                  <Tooltip title="Save">
                                    <IconButton size="small" onClick={handleSaveEditLoc}
                                      disabled={editLocSaving} sx={{ color: '#24A148' }}>
                                      {editLocSaving ? <CircularProgress size={13} /> : <SaveOutlined sx={{ fontSize: 15 }} />}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <IconButton size="small" sx={{ color: '#6B7280' }}
                                      onClick={() => { setEditingLocId(null); setEditingLocName(''); }}>
                                      <CancelOutlined sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" sx={{ color: '#27235C', '&:hover': { bgcolor: '#EEEDF8' } }}
                                      onClick={() => { setEditingLocId(loc.id); setEditingLocName(loc.name); }}>
                                      <Edit sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={count > 0 ? 'Users assigned — cannot delete' : 'Delete'}>
                                    <span>
                                      <IconButton size="small"
                                        sx={{ color: '#E01950', '&:hover': { bgcolor: '#FFF1F3' } }}
                                        disabled={count > 0 || deleteLocSaving}
                                        onClick={() => { setLocToDelete(loc); setConfirmDelLocOpen(true); }}>
                                        <DeleteOutline sx={{ fontSize: 15 }} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
 
          {/* Pagination */}
          {locations.length > LOCATION_PER_PAGE && (
            <Box sx={{ px: 2.5, py: 1.25, borderTop: '1px solid #F0F0F5',
                       display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                {locDialogPage * LOCATION_PER_PAGE + 1}–{Math.min((locDialogPage + 1) * LOCATION_PER_PAGE, locations.length)} of {locations.length}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton size="small" disabled={locDialogPage === 0}
                  onClick={() => setLocDialogPage((p) => p - 1)}
                  sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, width: 30, height: 30 }}>
                  <Typography fontSize="0.9rem">‹</Typography>
                </IconButton>
                {Array.from({ length: locTotalPages }, (_, i) => i).map((pg) => (
                  <Button key={pg} size="small"
                    variant={locDialogPage === pg ? 'contained' : 'outlined'}
                    onClick={() => setLocDialogPage(pg)}
                    sx={{
                      minWidth: 30, height: 30, px: 0, fontSize: '0.78rem',
                      borderColor: locDialogPage === pg ? '#97247E' : '#E5E7EB',
                      bgcolor: locDialogPage === pg ? '#97247E' : 'transparent',
                      color:   locDialogPage === pg ? '#fff' : '#374151',
                      '&:hover': { bgcolor: locDialogPage === pg ? '#7B1C69' : '#F3F4F6' },
                    }}>
                    {pg + 1}
                  </Button>
                ))}
                <IconButton size="small" disabled={locDialogPage >= locTotalPages - 1}
                  onClick={() => setLocDialogPage((p) => p + 1)}
                  sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, width: 30, height: 30 }}>
                  <Typography fontSize="0.9rem">›</Typography>
                </IconButton>
              </Stack>
            </Box>
          )}
        </DialogContent>
 
        {/* Confirm delete location sub-dialog */}
        <Dialog open={confirmDelLocOpen} onClose={() => setConfirmDelLocOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete location</DialogTitle>
          <DialogContent>
            <Typography fontSize="0.9rem">
              Delete <strong>{locToDelete?.name}</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setConfirmDelLocOpen(false); setLocToDelete(null); }}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteLoc} disabled={deleteLocSaving}>
              {deleteLocSaving ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
 
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setMapLocOpen(false)}
            sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleMapLoc}
            disabled={mapLocSaving || !selectedLocId}
            sx={{ bgcolor: '#97247E', '&:hover': { bgcolor: '#7B1C69' },
                  '&.Mui-disabled': { bgcolor: '#c084bc', color: '#fff' } }}>
            {mapLocSaving ? 'Saving…' : 'Map location'}
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* ── External dialogs ────────────────────────────────────────────── */}
      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateUser}
        loading={createLoading}
        error={createError}
      />
      <BulkUploadDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={fetchUsers}
      />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.action === 'delete' ? 'Delete user' : confirm.action === 'enable' ? 'Enable user' : 'Disable user'}
        message={
          confirm.action === 'delete'   ? 'This is permanent. The user will be removed.' :
          confirm.action === 'enable'   ? 'This user will be able to sign in again.' :
                                          'This user will no longer be able to sign in.'
        }
        confirmLabel={confirm.action === 'delete' ? 'Delete' : confirm.action === 'enable' ? 'Enable' : 'Disable'}
        severity={confirm.action === 'delete' ? 'error' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm({ open: false, userId: null, action: '' })}
        loading={actionLoading}
      />
    </Box>
  );
};
 
export default UserManagementPage;