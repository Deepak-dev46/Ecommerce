import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Switch,
  CircularProgress,
  Stack,
  Checkbox,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  CloudUpload,
  Edit,
  People,
  Delete,
  LocationOn,
  AddLocationAlt,
  AddBusiness,
  AddCircleOutline,
  DeleteOutline,
  Close,
  Search,
  SaveOutlined,
  CancelOutlined,
  CheckCircle,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserFilters from '../../components/users/UserFilters';
import CreateUserDialog from '../../components/users/CreateUserDialog';
import BulkUploadDialog from '../../components/users/BulkUploadDialog';
import { userApi } from '../../api/userApi';
import { orgApi } from '../../api/orgApi';
import { formatName, formatDateTime } from '../../utils/formatters';
import { roleApi } from '../../api/roleApi';
import { toast } from 'react-toastify';
 
// Sentinel values for "Create New" options in dropdowns
const OTHER_DEPARTMENT = '__OTHER_DEPARTMENT__';
const OTHER_DESIGNATION = '__OTHER_DESIGNATION__';
 
const EMPTY_FILTERS = {
  search: '',
  status: '',
  department: '',
  designation: '',
  role: '',
  location: '',
  sortBy: '',
};
 
// ── Cart grid constants ───────────────────────────────────────────────────────
const LOCATION_CARDS_PER_PAGE = 6; // 2 rows × 3 cards
 
const UserManagementPage = () => {
  const [editUser, setEditUser] = useState(null);
  const [userRolesMap, setUserRolesMap] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRows] = useState(10);
  const [selected, setSelected] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [confirm, setConfirm] = useState({ open: false, userId: null, action: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
 
  // ── Master data for the edit dialog ──────────────────────────────────────
  const [departments, setDepartments] = useState([]);
  const [editDesignations, setEditDesignations] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [editDesignationLoading, setEditDesignationLoading] = useState(false);
 
  // ── Create-department inline state (edit dialog) ──────────────────────────
  const [editCreateDepartmentMode, setEditCreateDepartmentMode] = useState(false);
  const [editNewDepartmentName, setEditNewDepartmentName] = useState('');
  const [editNewDeptDesignationName, setEditNewDeptDesignationName] = useState('');
  const [editSavingDepartment, setEditSavingDepartment] = useState(false);
  // ── Create-designation inline state (edit dialog) ─────────────────────────
  const [editCreateDesignationMode, setEditCreateDesignationMode] = useState(false);
  const [editNewDesignationName, setEditNewDesignationName] = useState('');
  const [editSavingDesignation, setEditSavingDesignation] = useState(false);
 
  // ── Shared error banner inside edit dialog ────────────────────────────────
  const [editMasterError, setEditMasterError] = useState('');
 
  // ── Location state ────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapLocationOpen, setMapLocationOpen] = useState(false);
  const [mapTargetUser, setMapTargetUser] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [mapLocationSaving, setMapLocationSaving] = useState(false);
  const [createLocationSaving, setCreateLocationSaving] = useState(false);
  const [deleteLocationSaving, setDeleteLocationSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
 
  // ── Location dialog — new state for search, bulk-check, edit inline ───────
  // const [locationSearch, setLocationSearch] = useState('');
  // const [checkedLocationIds, setCheckedLocationIds] = useState(new Set());
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [editingLocationName, setEditingLocationName] = useState('');
  const [editLocationSaving, setEditLocationSaving] = useState(false);
  const [locationDialogPage, setLocationDialogPage] = useState(0);
 
  // ── Computed: user count per location ─────────────────────────────────────
  const userCountByLocation = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (u.locationId) {
        map[u.locationId] = (map[u.locationId] || 0) + 1;
      }
    });
    return map;
  }, [users]);
 
  // ── Filtered locations in dialog ──────────────────────────────────────────
  // const filteredLocations = useMemo(() => {
  //   const q = locationSearch.trim().toLowerCase();
  //   if (!q) return locations;
  //   return locations.filter((loc) => loc.name.toLowerCase().includes(q));
  // }, [locations, locationSearch]);

  const filteredLocations = locations;
 
  // ── Cart pagination ───────────────────────────────────────────────────────
  const locationTotalPages = Math.max(1, Math.ceil(filteredLocations.length / LOCATION_CARDS_PER_PAGE));
  const paginatedLocations = filteredLocations.slice(
    locationDialogPage * LOCATION_CARDS_PER_PAGE,
    locationDialogPage * LOCATION_CARDS_PER_PAGE + LOCATION_CARDS_PER_PAGE
  );
 
  // const allPageLocationsChecked =
  //   paginatedLocations.length > 0 &&
  //   paginatedLocations.every((loc) => checkedLocationIds.has(loc.id));
 
  // ── Confirm single delete ─────────────────────────────────────────────────
  const confirmDeleteLocation = () => {
    if (locationToDelete) {
      handleDeleteLocation(locationToDelete.id, locationToDelete.name);
    }
    setConfirmDeleteOpen(false);
    setLocationToDelete(null);
  };
 
  const handleDeleteLocation = async (locationId, locationName) => {
    setDeleteLocationSaving(true);
    try {
      await userApi.deleteLocation(locationId);
      toast.success('Location deleted successfully');
 
      if (Number(selectedLocationId) === Number(locationId)) {
        setSelectedLocationId('');
      }
      // setCheckedLocationIds((prev) => {
      //   const next = new Set(prev);
      //   next.delete(locationId);
      //   return next;
      // });
 
      await loadLocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete location');
    } finally {
      setDeleteLocationSaving(false);
    }
  };
 
  // ── Bulk delete checked locations ─────────────────────────────────────────
  // const handleBulkDeleteLocations = async () => {
  //   if (!checkedLocationIds.size) return;
  //   setDeleteLocationSaving(true);
  //   try {
  //     await Promise.all(
  //       [...checkedLocationIds].map((id) => userApi.deleteLocation(id))
  //     );
  //     toast.success(`${checkedLocationIds.size} location(s) deleted`);
  //     if (checkedLocationIds.has(Number(selectedLocationId))) {
  //       setSelectedLocationId('');
  //     }
  //     setCheckedLocationIds(new Set());
  //     setConfirmDeleteOpen(false);
  //     setLocationToDelete(null);
  //     await loadLocations();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Failed to delete locations');
  //   } finally {
  //     setDeleteLocationSaving(false);
  //   }
  // };
 
  // ── Inline edit location name ─────────────────────────────────────────────
  const handleSaveEditLocation = async () => {
    const name = editingLocationName.trim();
 
    if (!name) {
      toast.error('Location name is required');
      return;
    }
 
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) {
      toast.error('First letter must be capital, only alphabets allowed (no numbers or special characters)');
      return;
    }
 
    setEditLocationSaving(true);
    try {
      if (!editingLocationName.trim()) {
        toast.error('Location name is required');
        return;
      }
 
      await userApi.updateLocation(editingLocationId, {
        name: editingLocationName.trim(),
      });
      toast.success('Location updated successfully');
      setEditingLocationId(null);
      setEditingLocationName('');
      await loadLocations();
    } catch (err) {
      console.error('UPDATE ERROR:', err.response || err);
      toast.error(err.response?.data?.message || 'Failed to update location');
    } finally {
      setEditLocationSaving(false);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Validation helpers
  // ─────────────────────────────────────────────────────────────────────────
  const deleteUser = (id) => {
    setConfirm({
      open: true,
      userId: id,
      action: 'delete',
    });
  };
 
  const isEmpty = (val) => !val || !String(val).trim();
  const isValidName = (val) => /^[A-Za-z\s]+$/.test(val);
  const isValidEmail = (val) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val);
 
  const validateEditUser = () => {
    const errors = {};
 
    if (!editUser) return false;
 
    if (isEmpty(editUser.firstName)) {
      errors.firstName = 'First name is required';
    } else if (!isValidName(editUser.firstName)) {
      errors.firstName = 'Only letters are allowed';
    } else if (editUser.firstName.trim().length < 2) {
      errors.firstName = 'Must be at least 2 characters';
    }
 
    if (isEmpty(editUser.lastName)) {
      errors.lastName = 'Last name is required';
    } else if (!isValidName(editUser.lastName)) {
      errors.lastName = 'Only letters are allowed';
    } else if (editUser.lastName.trim().length < 2) {
      errors.lastName = 'Must be at least 2 characters';
    }
 
    if (isEmpty(editUser.email)) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(editUser.email)) {
      errors.email = 'Invalid email format';
    }
 
    if (!editUser.departmentId || editUser.departmentId === OTHER_DEPARTMENT) {
      errors.departmentId = 'Department is required';
    }
 
    if (!editUser.designationId || editUser.designationId === OTHER_DESIGNATION) {
      errors.designationId = 'Designation is required';
    }
 
    if (!editUser.status) {
      errors.status = 'Status is required';
    }
 
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };
 
 // ─────────────────────────────────────────────────────────────────────────
  // Data loaders
  // ─────────────────────────────────────────────────────────────────────────
  const loadDepartments = useCallback(async () => {
    const res = await orgApi.getAllDepartments();
    const data = res.data?.content || res.data || [];
    setDepartments(Array.isArray(data) ? data : []);
  }, []);
 
  const loadMasters = useCallback(async () => {
    setMetaLoading(true);
    try {
      await loadDepartments();
    } catch {
      setDepartments([]);
    } finally {
      setMetaLoading(false);
    }
  }, [loadDepartments]);
 
  const loadLocations = useCallback(async () => {
    setLocationLoading(true);
    try {
      const res = await userApi.getAllLocations();
      const data = res.data?.content || res.data || [];
      setLocations(Array.isArray(data) ? data : []);
    } catch {
      setLocations([]);
    } finally {
      setLocationLoading(false);
    }
  }, []);
 
  const loadEditDesignations = useCallback(async (departmentId) => {
    if (!departmentId || departmentId === OTHER_DEPARTMENT) {
      setEditDesignations([]);
      return;
    }
 
    setEditDesignationLoading(true);
    try {
      const res = await orgApi.getDesignationsByDepartment(departmentId);
      const data = res.data?.content || res.data || [];
      setEditDesignations(Array.isArray(data) ? data : []);
    } catch {
      setEditDesignations([]);
    } finally {
      setEditDesignationLoading(false);
    }
  }, []);
 
  // ─────────────────────────────────────────────────────────────────────────
  // Reset all inline-create state when the edit dialog closes
  // ─────────────────────────────────────────────────────────────────────────
  const resetEditCreateState = () => {
    setEditCreateDepartmentMode(false);
    setEditNewDepartmentName('');
    setEditNewDeptDesignationName('');
    setEditSavingDepartment(false);
 
    setEditCreateDesignationMode(false);
    setEditNewDesignationName('');
    setEditSavingDesignation(false);
 
    setEditMasterError('');
    setEditErrors({});
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Fetch users + roles
  // ─────────────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      const data = res.data?.content || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchUsers();
    loadMasters();
    loadLocations();
  }, [fetchUsers, loadMasters, loadLocations]);
 
  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     const map = {};
 
  //     for (const user of users) {
  //       try {
  //         const res = await roleApi.getRolesForUser(user.id);
  //         // map[user.id] = res.data || [];
  //         map[user.id]=res.data?.content || res.data?.roles || res.data || [];
  //       } catch {
  //         map[user.id] = [];
  //       }
  //     }
 
  //     setUserRolesMap(map);
  //   };
 
  //   if (users.length) fetchRoles();
  //   else setUserRolesMap({});
  // }, [users]);

  //raji 

  useEffect(() => {
  const fetchRoles = async () => {
    const map = {};
 
    for (const user of users) {
      try {
        const res = await roleApi.getRolesForUser(user.id);  // ✅ correct name
        const raw = res.data?.content || res.data?.roles || res.data || [];
        map[user.id] = Array.isArray(raw) ? raw : [];        // ✅ always array
      } catch {
        map[user.id] = [];
      }
    }
 
    setUserRolesMap(map);
  };
 
  if (users.length) fetchRoles();
  else setUserRolesMap({});
}, [users]);
 
 
  // ─────────────────────────────────────────────────────────────────────────
  // Filter + sort
  // ─────────────────────────────────────────────────────────────────────────
// In UserManagementPage.jsx
// Find this block (around line where "Filter sort" comment is):
// const filtered = useMemo(() => { ... }, [...]);
// Replace it entirely with this:
 
const filtered = useMemo(() => {
  const q = filters.search?.toLowerCase() ?? '';
 
  const filteredUsers = users.filter((u) => {
    const roles = userRolesMap[u.id] ?? [];
    const departmentName = u.departmentName ?? u.department ?? '';
    const designationName = u.designationName ?? u.designation ?? '';
    const locationName = u.locationName ?? '';
 
    return (
      (!q ||
        `${u.firstName} ${u.lastName} ${u.email} ${locationName}`
          .toLowerCase()
          .includes(q)) &&
      (!filters.status     || u.status === filters.status) &&
      (!filters.department || departmentName === filters.department) &&
      (!filters.designation|| designationName === filters.designation) &&
      (!filters.location   || locationName === filters.location) &&
      (!filters.role       ||
        roles.some((r) => {
          const roleName = typeof r === 'string' ? r : r.name;
          return roleName === filters.role;
        }))
    );
  });
 
  // ✅ Sort — matches the sortBy values from UserFilters ('name_asc', 'name_desc', etc.)
  return [...filteredUsers].sort((a, b) => {
    const nameA = formatName(a.firstName, a.lastName).toLowerCase();
    const nameB = formatName(b.firstName, b.lastName).toLowerCase();
    const emailA = (a.email ?? '').toLowerCase();
    const emailB = (b.email ?? '').toLowerCase();
    const dateA  = new Date(a.createdAt ?? 0).getTime();
    const dateB  = new Date(b.createdAt ?? 0).getTime();
 
    switch (filters.sortBy) {
      case 'name_asc':       return nameA.localeCompare(nameB);
      case 'name_desc':      return nameB.localeCompare(nameA);
      case 'email_asc':      return emailA.localeCompare(emailB);
      case 'createdAt_desc': return dateB - dateA;
      case 'createdAt_asc':  return dateA - dateB;
      default:               return 0;
    }
  });
}, [users, userRolesMap, filters]);
 
 
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  const selectedUsers = users.filter((u) => selected.includes(u.id));
  const allPageSelected =
    paginated.length > 0 && paginated.every((u) => selected.includes(u.id));
 
  const handleSelectAllPage = (checked) => {
    if (checked) {
      const idsToAdd = paginated.map((u) => u.id);
      setSelected((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    } else {
      const pageIds = paginated.map((u) => u.id);
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };
 
  const handleToggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Create user
  // ─────────────────────────────────────────────────────────────────────────
  const handleCreateUser = async (data) => {
    setCreateLoading(true);
    setCreateError('');
    try {
      await userApi.createUser(data);
      await fetchUsers();
      toast.success('User Created Successfully!');
      setCreateOpen(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };
 
 // ─────────────────────────────────────────────────────────────────────────
  // Open edit dialog
  // ─────────────────────────────────────────────────────────────────────────
  const handleOpenEdit = async (user) => {
    resetEditCreateState();
 
    const normalized = {
      ...user,
      departmentId:
        user.departmentId ||
        departments.find((d) => d.name === user.departmentName)?.id ||
        '',
      designationId: user.designationId || '',
      locationId: user.locationId || '',
    };
 
    setEditUser(normalized);
 
    if (normalized.departmentId) {
      await loadEditDesignations(normalized.departmentId);
    } else {
      setEditDesignations([]);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Edit dialog — department change
  // ─────────────────────────────────────────────────────────────────────────
  const handleEditDepartmentChange = async (value) => {
    setEditMasterError('');
    setEditErrors((prev) => ({ ...prev, departmentId: '', designationId: '' }));
 
    if (value === OTHER_DEPARTMENT) {
      setEditUser((prev) => ({ ...prev, departmentId: value, designationId: '' }));
      setEditCreateDepartmentMode(true);
      setEditCreateDesignationMode(false);
      setEditNewDesignationName('');
      setEditDesignations([]);
      return;
    }
 
    setEditCreateDepartmentMode(false);
    setEditUser((prev) => ({ ...prev, departmentId: value, designationId: '' }));
    await loadEditDesignations(value);
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Edit dialog — designation change
  // ─────────────────────────────────────────────────────────────────────────
  const handleEditDesignationChange = (value) => {
    setEditMasterError('');
    setEditErrors((prev) => ({ ...prev, designationId: '' }));
 
    if (value === OTHER_DESIGNATION) {
      setEditUser((prev) => ({ ...prev, designationId: value }));
      setEditCreateDesignationMode(true);
      return;
    }
 
    setEditCreateDesignationMode(false);
    setEditUser((prev) => ({ ...prev, designationId: value }));
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Edit dialog — create new department + first designation
  // ─────────────────────────────────────────────────────────────────────────
  const handleEditCreateDepartment = async () => {
    const dept = editNewDepartmentName.trim();
    const desig = editNewDeptDesignationName.trim();
 
    if (!dept) { setEditMasterError('Department name is required'); return; }
    if (!desig) { setEditMasterError('First designation name is required'); return; }
    if (!/^[A-Za-z\s]{2,50}$/.test(dept)) { setEditMasterError('Department must contain only alphabets (min 2 characters)'); return; }
    if (!/^[A-Za-z\s]{2,50}$/.test(desig)) { setEditMasterError('Designation must contain only alphabets (min 2 characters)'); return; }
    if (departments.some((d) => d.name.toLowerCase() === dept.toLowerCase())) { setEditMasterError('Department already exists'); return; }
 
    setEditSavingDepartment(true);
    setEditMasterError('');
 
    try {
      const deptRes = await orgApi.createDepartment({ name: dept });
      const createdDept = deptRes.data;
 
      const desigRes = await orgApi.createDesignation({
        name: desig,
        departmentId: createdDept.id,
      });
      const createdDesig = desigRes.data;
 
      await loadDepartments();
      await loadEditDesignations(createdDept.id);
 
      setEditUser((prev) => ({
        ...prev,
        departmentId: createdDept.id,
        designationId: createdDesig.id,
      }));
 
      setEditCreateDepartmentMode(false);
      setEditNewDepartmentName('');
      setEditNewDeptDesignationName('');
 
      toast.success('Department and designation created');
    } catch (err) {
      setEditMasterError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setEditSavingDepartment(false);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Edit dialog — create new designation for selected department
  // ─────────────────────────────────────────────────────────────────────────
  const handleEditCreateDesignation = async () => {
    const desig = editNewDesignationName.trim();
 
    if (!editUser?.departmentId || editUser.departmentId === OTHER_DEPARTMENT) { setEditMasterError('Select a valid department first'); return; }
    if (!desig) { setEditMasterError('Designation name is required'); return; }
    if (!/^[A-Za-z\s]{2,50}$/.test(desig)) { setEditMasterError('Designation must contain only alphabets (min 2 characters)'); return; }
    if (editDesignations.some((d) => d.name.toLowerCase() === desig.toLowerCase())) { setEditMasterError('Designation already exists'); return; }
 
    setEditSavingDesignation(true);
    setEditMasterError('');
 
    try {
      const res = await orgApi.createDesignation({
        name: desig,
        departmentId: Number(editUser.departmentId),
      });
      const createdDesig = res.data;
 
      await loadEditDesignations(editUser.departmentId);
 
      setEditUser((prev) => ({ ...prev, designationId: createdDesig.id }));
      setEditCreateDesignationMode(false);
      setEditNewDesignationName('');
 
      toast.success('Designation created');
    } catch (err) {
      setEditMasterError(err.response?.data?.message || 'Failed to create designation');
    } finally {
      setEditSavingDesignation(false);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Save edit
  // ─────────────────────────────────────────────────────────────────────────
  const handleUpdateUser = async () => {
    if (!validateEditUser()) return;
 
    try {
      const payload = {
        firstName: editUser.firstName.trim(),
        lastName: editUser.lastName.trim(),
        email: editUser.email.trim(),
        departmentId: Number(editUser.departmentId),
        designationId: Number(editUser.designationId),
        status: editUser.status,
        locationId: editUser.locationId ? Number(editUser.locationId) : null,
      };
 
      const res = await userApi.updateUser(editUser.id, payload);
      toast.success(`Updated data for ${res.data.firstName} ${res.data.lastName}`);
      setEditUser(null);
      resetEditCreateState();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to Edit User.');
    }
  };
 
  const handleCloseEdit = () => {
    setEditUser(null);
    resetEditCreateState();
  };
 // ─────────────────────────────────────────────────────────────────────────
  // Confirm actions (disable / enable / delete)
  // ─────────────────────────────────────────────────────────────────────────
  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.action === 'disable') {
        await userApi.disableUser(confirm.userId);
        toast.success('User Disabled for User ID: ' + confirm.userId);
      }
 
      if (confirm.action === 'enable') {
        await userApi.updateUser(confirm.userId, { status: 'PENDINGACTIVATION' });
        toast.success('User enabled for User ID: ' + confirm.userId);
      }
 
      if (confirm.action === 'delete') {
        try {
          const res = await userApi.deleteUserById(confirm.userId);
 
          if (res.data !== 'No User Found') {
            toast.success('User deleted successfully');
          } else {
            toast.error('No user found');
          }
 
          await fetchUsers();
        } catch {
          toast.error('Failed to delete user');
        }
      }
 
      await fetchUsers();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
      setConfirm({ open: false, userId: null, action: '' });
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Location dialog handlers
  // ─────────────────────────────────────────────────────────────────────────
  const openMapLocationDialog = (user = null) => {
    setMapTargetUser(user);
    setSelectedLocationId(user?.locationId || '');
    setNewLocationName('');
    
    // setCheckedLocationIds(new Set());
    setEditingLocationId(null);
    setEditingLocationName('');
    setLocationDialogPage(0);
    setMapLocationOpen(true);
  };
 
  const handleCreateLocation = async () => {
    const name = newLocationName.trim();
 
    if (!name) {
      toast.error('Location name is required');
      return;
    }
 
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) {
      toast.error('First letter must be capital, only alphabets allowed (no numbers or special characters)');
      return;
    }
 
    setCreateLocationSaving(true);
    try {
      const res = await userApi.createLocation({ name: newLocationName.trim() });
      const created = res.data;
      toast.success('Location created successfully');
      setNewLocationName('');
      await loadLocations();
      if (created?.id) {
        setSelectedLocationId(created.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create location');
    } finally {
      setCreateLocationSaving(false);
    }
  };
 
  const handleMapLocation = async () => {
    if (!selectedLocationId) {
      toast.error('Please select a location');
      return;
    }
 
    setMapLocationSaving(true);
    try {
      if (mapTargetUser?.id) {
        await userApi.mapLocation(mapTargetUser.id, { locationId: Number(selectedLocationId) });
        toast.success('Location mapped successfully');
      } else if (selected.length > 0) {
        await Promise.all(
          selected.map((userId) =>
            userApi.mapLocation(userId, { locationId: Number(selectedLocationId) })
          )
        );
        toast.success(`Location mapped for ${selected.length} selected users`);
        setSelected([]);
      } else {
        toast.error('No user selected');
        setMapLocationSaving(false);
        return;
      }
 
      setMapLocationOpen(false);
      setMapTargetUser(null);
      setSelectedLocationId('');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to map location');
    } finally {
      setMapLocationSaving(false);
    }
  };
 
  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────
  const getInitials = (u) =>
    `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
 
  const AVATAR_COLORS = ['#27235C', '#97247E', '#24A148', '#E2B93B', '#AC5098', '#E01950'];
  const getAvatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
 
  const editSelectedDeptName = useMemo(() => {
    const found = departments.find((d) => String(d.id) === String(editUser?.departmentId));
    return found?.name || '';
  }, [departments, editUser?.departmentId]);
 
  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box>
      <PageHeader
        title="User management"
        subtitle={`${users.length} users · ${users.filter((u) => u.status === 'ACTIVE').length} active`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'User management' },
        ]}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => setBulkOpen(true)}
              sx={{ borderColor: '#E5E7EB', color: '#374151' }}
            >
              Bulk upload
            </Button>
 
            <Button
              variant="outlined"
              startIcon={<LocationOn />}
              onClick={() => openMapLocationDialog(null)}
              sx={{ borderColor: '#97247E', color: '#97247E' }}
            >
              Map User location {selected.length > 0 ? `(${selected.length})` : ''}
            </Button>
 
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setCreateError('');
                setCreateOpen(true);
              }}
            >
              Create user
            </Button>
          </>
        }
      />
 
      <Card>
        <Box sx={{ p: 2.5 }}>
          <UserFilters
            filters={filters}
            onChange={(f) => {
              setFilters((prev) => ({ ...prev, ...f }));
              setPage(0);
            }}
            onReset={() => {
              setFilters(EMPTY_FILTERS);
              setPage(0);
            }}
            resultCount={filtered.length}
            totalCount={users.length}
            locations={locations}
          />
        </Box>
 
        <Divider />
 
        {selected.length > 0 && (
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF5FF',
              borderBottom: '1px solid #E9D5FF',
            }}
          >
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#6B21A8' }}>
              {selected.length} user(s) selected
            </Typography>
 
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="text"
                onClick={() => setSelected([])}
                sx={{ color: '#6B7280' }}
              >
                Clear selection
              </Button>
            </Stack>
          </Box>
        )}
 
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={selected.some((id) => paginated.some((u) => u.id === id)) && !allPageSelected}
                    onChange={(e) => handleSelectAllPage(e.target.checked)}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
 <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(10).fill(0).map((__, j) => (
                      <TableCell key={j}>
                        <Box
                          sx={{
                            height: 16,
                            backgroundColor: '#F0F0F5',
                            borderRadius: 1,
                            width: j === 2 ? 160 : j === 9 ? 80 : 100,
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <People sx={{ fontSize: 40, color: '#E5E7EB', mb: 1 }} />
                    <Typography color="text.secondary" fontSize="0.875rem">
                      {Object.values(filters).some(Boolean)
                        ? 'No users match your filters'
                        : 'No users found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    selected={selected.includes(user.id)}
                    sx={{
                      '&.Mui-selected': { backgroundColor: '#F5F4FF' },
                      transition: 'background 0.12s',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                      />
                    </TableCell>
 
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: getAvatarColor(user.id),
                          }}
                        >
                          {getInitials(user)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1B193F' }}>
                            {formatName(user.firstName, user.lastName)}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.7rem',
                              color: '#9CA3AF',
                              fontFamily: 'monospace',
                            }}
                          >
                            #{String(user.id).padStart(4, '0')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
 
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem', color: '#6B7280' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
 
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem' }}>
                        {user.departmentName || user.department || '—'}
                      </Typography>
                    </TableCell>
 
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem' }}>
                        {user.designationName || user.designation || '—'}
                      </Typography>
                    </TableCell>
 
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem' }}>
                        {user.locationName || '—'}
                      </Typography>
                    </TableCell>
 
                    <TableCell>
                      <StatusChip status={user.status || 'ACTIVE'} />
                    </TableCell>
 
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(userRolesMap[user.id] || []).slice(0, 2).map((r) => {
                          const roleName = typeof r === 'string' ? r : r.name;
                          return (
                            <Chip
                              key={roleName}
                              label={roleName}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                backgroundColor: '#F0F0FA',
                                color: '#27235C',
                                fontWeight: 600,
                              }}
                            />
                          );
                        })}
 
                        {!(userRolesMap[user.id] || []).length && (
                          <Typography sx={{ fontSize: '0.75rem', color: '#D1D5DB' }}>
                            No role
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
 
                    <TableCell>
                      <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                        {formatDateTime(user.createdAt) || '—'}
                      </Typography>
                    </TableCell>
 
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                        <Tooltip title="Edit user">
                          <IconButton size="small" sx={{ color: '#27235C' }} onClick={() => handleOpenEdit(user)}>
                            <Edit sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
 
                        <Tooltip title={user.status === 'DISABLED' ? 'Enable user' : 'Disable user'}>
                          <Switch
                            size="small"
                            checked={user.status !== 'DISABLED'}
                            onChange={() =>
                              setConfirm({
                                open: true,
                                userId: user.id,
                                action: user.status === 'DISABLED' ? 'enable' : 'disable',
                              })
                            }
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#24A148' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#24A148' },
                              '& .MuiSwitch-switchBase': { color: '#E01950' },
                              '& .MuiSwitch-track': { backgroundColor: '#E01950' },
                            }}
                          />
                        </Tooltip>
 
                        <Tooltip title="Delete user">
                          <IconButton size="small" sx={{ color: 'red' }} onClick={() => deleteUser(user.id)}>
                            <Delete sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
 
        {/* ══════════════════════════════════════════════════════════════════
            EDIT USER DIALOG
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog open={!!editUser} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Edit User</Typography>
              <IconButton size="small" onClick={handleCloseEdit} sx={{ color: '#6B7280' }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
 
          <Divider />
 
          <DialogContent>
            {editMasterError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {editMasterError}
              </Alert>
            )}
 
            <TextField
              fullWidth
              margin="dense"
              label="First Name"
              value={editUser?.firstName || ''}
              onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
              error={!!editErrors.firstName}
              helperText={editErrors.firstName}
            />
 
            <TextField
              fullWidth
              margin="dense"
              label="Last Name"
              value={editUser?.lastName || ''}
              onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
              error={!!editErrors.lastName}
              helperText={editErrors.lastName}
            />
 
            <TextField
              fullWidth
              margin="dense"
              label="Email"
              value={editUser?.email || ''}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              error={!!editErrors.email}
              helperText={editErrors.email}
            />
 
            <FormControl fullWidth margin="dense" error={!!editErrors.departmentId}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={editUser?.departmentId || ''}
                onChange={(e) => handleEditDepartmentChange(e.target.value)}
                disabled={metaLoading}
              >
                <MenuItem value="">
                  <em>{metaLoading ? 'Loading departments...' : 'Select Department'}</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
                <MenuItem value={OTHER_DEPARTMENT}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#27235C' }}>
                    <AddBusiness fontSize="small" />
                    + Add New Department
                  </Box>
                </MenuItem>
              </Select>
              {editErrors.departmentId && (
                <Typography color="error" fontSize="0.75rem" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editErrors.departmentId}
                </Typography>
              )}
            </FormControl>
 
            {editCreateDepartmentMode && (
  <Box sx={{ mt: 1.5, p: 2, border: '1px dashed #D1D5DB', borderRadius: 2, backgroundColor: '#FAFAFD' }}>

    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <AddBusiness sx={{ color: '#27235C', fontSize: 18 }} />
      <Typography fontWeight={700} fontSize="0.9rem">
        Create New Department & Designation
      </Typography>
    </Stack>

    <TextField
      label="Department Name"
      fullWidth
      size="small"
      value={editNewDepartmentName}
      onChange={(e) => setEditNewDepartmentName(e.target.value)}
      sx={{ mb: 1 }}
    />

    <TextField
      label="First Designation"
      fullWidth
      size="small"
      value={editNewDeptDesignationName}
      onChange={(e) => setEditNewDeptDesignationName(e.target.value)}
    />

    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
      <Button
        variant="contained"
        size="small"
        onClick={handleEditCreateDepartment}
        disabled={editSavingDepartment}
      >
        {editSavingDepartment
          ? <CircularProgress size={14} color="inherit" />
          : 'Create'}
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setEditCreateDepartmentMode(false);
          setEditNewDepartmentName('');
          setEditNewDeptDesignationName('');
          setEditMasterError('');
          setEditUser(prev => ({ ...prev, departmentId: '' }));
        }}
      >
        Cancel
      </Button>
    </Stack>
  </Box>
)}

{editCreateDesignationMode && (
  <Box
    sx={{
      mt: 1.5,
      p: 2,
      border: '1px dashed #D1D5DB',
      borderRadius: 2,
      backgroundColor: '#FAFAFD',
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <AddCircleOutline sx={{ fontSize: 18, color: '#27235C' }} />
      <Typography fontWeight={700} fontSize="0.9rem">
        Create new designation for {editSelectedDeptName || ''}
      </Typography>
    </Stack>

    <TextField
      fullWidth
      size="small"
      placeholder="New designation name"
      value={editNewDesignationName}
      onChange={(e) => setEditNewDesignationName(e.target.value)}
    />

    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
      <Button
        variant="contained"
        size="small"
        onClick={handleEditCreateDesignation}
        disabled={editSavingDesignation}
      >
        {editSavingDesignation ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          'Create'
        )}
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setEditCreateDesignationMode(false);
          setEditNewDesignationName('');
        }}
      >
        Cancel
      </Button>
    </Stack>
  </Box>
)}


<FormControl
  fullWidth
  margin="dense"
  error={!!editErrors.designationId}
  disabled={
    !editUser?.departmentId ||
    editUser?.departmentId === OTHER_DEPARTMENT ||
    editDesignationLoading ||
    editCreateDepartmentMode
  }
>
  <InputLabel>Designation</InputLabel>
  <Select
    label="Designation"
    value={editUser?.designationId || ''}
    onChange={(e) => handleEditDesignationChange(e.target.value)}
  >
    <MenuItem value="">
      <em>
        {editDesignationLoading
          ? 'Loading designations...'
          : !editUser?.departmentId
          ? 'Select Department First'
          : 'Select Designation'}
      </em>
    </MenuItem>

    {editDesignations.map((desig) => (
      <MenuItem key={desig.id} value={desig.id}>
        {desig.name}
      </MenuItem>
    ))}

    <MenuItem value={OTHER_DESIGNATION}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AddCircleOutline fontSize="small" />
        + Add New Designation
      </Box>
    </MenuItem>
  </Select>
</FormControl>
 
            <FormControl fullWidth margin="dense">
              <InputLabel>Location</InputLabel>
              <Select
                label="Location"
                value={editUser?.locationId || ''}
                onChange={(e) => setEditUser({ ...editUser, locationId: e.target.value })}
              >
                <MenuItem value=""><em>Select Location</em></MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
 
            <TextField
              fullWidth
              margin="dense"
              label="Employee ID"
              value={editUser?.employeeId || ''}
              disabled
              InputProps={{ style: { color: 'green' } }}
              InputLabelProps={{ style: { color: 'green' } }}
            />
 
            <FormControl fullWidth margin="dense" error={!!editErrors.status}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editUser?.status || ''}
                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
              >
                <MenuItem value="" disabled>Select Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="PENDINGACTIVATION">Pending Activation</MenuItem>
                <MenuItem value="DISABLED">Disabled</MenuItem>
              </Select>
              {editErrors.status && (
                <Typography color="error" fontSize="0.75rem" sx={{ mt: 0.5, ml: 1.5 }}>
                  {editErrors.status}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
 
          <Divider />
 
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button variant="outlined" onClick={handleCloseEdit}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdateUser}
              disabled={editCreateDepartmentMode || editCreateDesignationMode}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
 
        {/* ══════════════════════════════════════════════════════════════════
            SET LOCATION DIALOG — Cart UI (replaces paginated table)
        ══════════════════════════════════════════════════════════════════ */}
        <Dialog
          open={mapLocationOpen}
          onClose={() => setMapLocationOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
        >
          {/* Dialog Header */}
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography fontWeight={700} fontSize="1.1rem">
                    {mapTargetUser
                      ? `Set Location — ${formatName(mapTargetUser.firstName, mapTargetUser.lastName)}`
                      : 'Set Location'}
                  </Typography>
                  {(selected.length > 0 || mapTargetUser) && (
                    <Chip
                      label={mapTargetUser ? '1 user' : `${selected.length} selected`}
                      size="small"
                      sx={{ backgroundColor: '#F3F4F6', color: '#374151', fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  )}
                </Box>
                <Typography fontSize="0.82rem" color="text.secondary" sx={{ mt: 0.4 }}>
                     create, edit or delete locations. Select one to map it to user(s).
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setMapLocationOpen(false)} sx={{ color: '#9CA3AF', mt: -0.5 }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
 
          <Divider />
 
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
 {/* ── Toolbar: Search + Create ── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.75,
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              {/* <TextField
                size="small"
                placeholder="Search locations…"
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setLocationDialogPage(0);
                }}
                sx={{ flex: '0 0 260px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: '#9CA3AF' }} />
                    </InputAdornment>
                  ),
                }}
              /> */}
 
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="New location name"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateLocation()}
                  placeholder="e.g. Bangalore"
                  sx={{ minWidth: 190 }}
                />
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddLocationAlt />}
                  onClick={handleCreateLocation}
                  disabled={createLocationSaving}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {createLocationSaving ? 'Creating…' : 'Create'}
                </Button>
              </Stack>
            </Box>
 
            <Divider />
 
            {/* ── Selected-users summary strip ── */}
            {!mapTargetUser && selected.length > 0 && (
              <Box sx={{ px: 2.5, py: 1.25, backgroundColor: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 0.5, color: '#6B21A8' }}>
                  Mapping location for:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {selectedUsers.slice(0, 8).map((u) => (
                    <Chip key={u.id} size="small" label={formatName(u.firstName, u.lastName)}
                      sx={{ fontSize: '0.72rem', backgroundColor: '#EDE9FE', color: '#5B21B6' }} />
                  ))}
                  {selectedUsers.length > 8 && (
                    <Chip size="small" label={`+${selectedUsers.length - 8} more`}
                      sx={{ fontSize: '0.72rem', backgroundColor: '#EDE9FE', color: '#5B21B6' }} />
                  )}
                </Box>
              </Box>
            )}
 
            {/* ══════════════════════════════════════════════════════════════
                CART GRID — replaces the old paginated table
            ══════════════════════════════════════════════════════════════ */}
            <Box sx={{ flex: 1, px: 2.5, py: 2, overflowY: 'auto' }}>
              {locationLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                  <CircularProgress size={28} sx={{ color: '#97247E' }} />
                </Box>
              ) : filteredLocations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <LocationOn sx={{ fontSize: 40, color: '#E5E7EB', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography color="text.secondary" fontSize="0.85rem">
                    {'No locations found'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {paginatedLocations.map((loc) => {
                    const isSelected = String(selectedLocationId) === String(loc.id);
                    const isEditing = editingLocationId === loc.id;
                    const userCount = userCountByLocation[loc.id] || 0;
                    // const isChecked = checkedLocationIds.has(loc.id);
 
                    return (
                      <Grid item xs={12} sm={6} md={4} key={loc.id}>
                        <Box
                          onClick={() => !isEditing && setSelectedLocationId(loc.id)}
                          sx={{
                            position: 'relative',
                            border: isSelected
                              ? '2px solid #97247E'
                              : '1.5px solid #E5E7EB',
                            borderRadius: 2.5,
                            p: 2,
                            cursor: isEditing ? 'default' : 'pointer',
                            backgroundColor: isSelected ? '#FDF4FB' : '#FFFFFF',
                            boxShadow: isSelected
                              ? '0 0 0 3px rgba(151,36,126,0.10)'
                              : '0 1px 4px rgba(0,0,0,0.06)',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              borderColor: isSelected ? '#97247E' : '#C4B5D4',
                              boxShadow: isSelected
                                ? '0 0 0 3px rgba(151,36,126,0.12)'
                                : '0 2px 8px rgba(0,0,0,0.10)',
                            },
                            minHeight: 110,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          {/* Top row: checkbox + selected badge */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                            {/* <Checkbox
                              size="small"
                              checked={isChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => {
                                const next = new Set(checkedLocationIds);
                                next.has(loc.id) ? next.delete(loc.id) : next.add(loc.id);
                                setCheckedLocationIds(next);
                              }}
                              sx={{ p: 0, mr: 0.5, color: '#9CA3AF', '&.Mui-checked': { color: '#97247E' } }}
                            /> */}
 
                            {isSelected && (
                              <Chip
                                label="Selected"
                                size="small"
                                icon={<CheckCircle sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
                                sx={{
                                  height: 20,
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  backgroundColor: '#97247E',
                                  color: '#fff',
                                  '& .MuiChip-icon': { ml: '4px' },
                                }}
                              />
                            )}
                          </Box>
 
                          {/* Location name / inline edit */}
                          {isEditing ? (
                            <TextField
                              size="small"
                              value={editingLocationName}
                              onChange={(e) => setEditingLocationName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditLocation();
                                if (e.key === 'Escape') {
                                  setEditingLocationId(null);
                                  setEditingLocationName('');
                                }
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              fullWidth
                              sx={{ mb: 1 }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOn
                                sx={{
                                  fontSize: 18,
                                  color: isSelected ? '#97247E' : '#9CA3AF',
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: '0.92rem',
                                  fontWeight: isSelected ? 700 : 500,
                                  color: isSelected ? '#97247E' : '#374151',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {loc.name}
                              </Typography>
                            </Box>
                          )}
 
                          {/* Bottom row: user count + action buttons */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mt: 'auto',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <People sx={{ fontSize: 14, color: '#9CA3AF' }} />
                              <Typography fontSize="0.75rem" color="text.secondary">
                                {userCount} {userCount === 1 ? 'user' : 'users'}
                              </Typography>
                            </Box>
 
                            {/* Actions */}
                            {isEditing ? (
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Save">
                                  <IconButton
                                    size="small"
                                    onClick={handleSaveEditLocation}
                                    disabled={editLocationSaving}
                                    sx={{ color: '#24A148' }}
                                  >
                                    {editLocationSaving
                                      ? <CircularProgress size={14} />
                                      : <SaveOutlined sx={{ fontSize: 16 }} />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton
                                    size="small"
                                    onClick={() => { setEditingLocationId(null); setEditingLocationName(''); }}
                                    sx={{ color: '#6B7280' }}
                                  >
                                    <CancelOutlined sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            ) : (
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Edit location">
                                  <IconButton
                                    size="small"
                                    sx={{ color: '#27235C' }}
                                    onClick={() => {
                                      setEditingLocationId(loc.id);
                                      setEditingLocationName(loc.name);
                                    }}
                                  >
                                    <Edit sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete location">
                                  <IconButton
                                    size="small"
                                    sx={{ color: '#E01950' }}
                                   
onClick={() => {
  const count = userCountByLocation[loc.id] || 0;
  if (count > 0) {
    toast.error('Cannot delete: Users are assigned to this location');
    return;
  }
  setLocationToDelete(loc);
  setConfirmDeleteOpen(true);
}}

                                    disabled={deleteLocationSaving}
                                  >
                                    <DeleteOutline sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
 
            {/* ── Cart Pagination — prev / page numbers / next ── */}
            {filteredLocations.length > LOCATION_CARDS_PER_PAGE && (
              <Box
                sx={{
                  borderTop: '1px solid #F3F4F6',
                  px: 2.5,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography fontSize="0.78rem" color="text.secondary">
                  {locationDialogPage * LOCATION_CARDS_PER_PAGE + 1}–
                  {Math.min((locationDialogPage + 1) * LOCATION_CARDS_PER_PAGE, filteredLocations.length)}{' '}
                  of {filteredLocations.length} locations
                </Typography>
 
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton
                    size="small"
                    disabled={locationDialogPage === 0}
                    onClick={() => setLocationDialogPage((p) => p - 1)}
                    sx={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 1.5,
                      width: 30,
                      height: 30,
                      '&:disabled': { opacity: 0.35 },
                    }}
                  >
                    <Typography fontSize="0.9rem" lineHeight={1}>‹</Typography>
                  </IconButton>
 
                  {Array.from({ length: locationTotalPages }, (_, i) => i).map((pg) => (
                    <Button
                      key={pg}
                      size="small"
                      variant={locationDialogPage === pg ? 'contained' : 'outlined'}
                      onClick={() => setLocationDialogPage(pg)}
                      sx={{
                        minWidth: 30,
                        height: 30,
                        px: 0,
                        fontSize: '0.78rem',
                        fontWeight: locationDialogPage === pg ? 700 : 400,
                        borderColor: locationDialogPage === pg ? '#97247E' : '#E5E7EB',
                        backgroundColor: locationDialogPage === pg ? '#97247E' : 'transparent',
                        color: locationDialogPage === pg ? '#fff' : '#374151',
                        '&:hover': {
                          backgroundColor: locationDialogPage === pg ? '#7B1C69' : '#F3F4F6',
                          borderColor: locationDialogPage === pg ? '#7B1C69' : '#C4B5D4',
                        },
                      }}
                    >
                      {pg + 1}
                    </Button>
                  ))}
 
                  <IconButton
                    size="small"
                    disabled={locationDialogPage >= locationTotalPages - 1}
                    onClick={() => setLocationDialogPage((p) => p + 1)}
                    sx={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 1.5,
                      width: 30,
                      height: 30,
                      '&:disabled': { opacity: 0.35 },
                    }}
                  >
                    <Typography fontSize="0.9rem" lineHeight={1}>›</Typography>
                  </IconButton>
                </Stack>
              </Box>
            )}
 
        
          </DialogContent>
 
          {/* ── Confirm delete sub-dialog ── */}
          <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs">
            <DialogTitle>Delete Location</DialogTitle>
            <DialogContent>
             
<Typography fontSize="0.9rem">
  Are you sure you want to delete <strong>{locationToDelete?.name}</strong>?
</Typography>

            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setConfirmDeleteOpen(false); setLocationToDelete(null); }}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                // ={locationToDelete && checkedLocationIds.size === 1 ? confirmDeleteLocationClickon : handleBulkDeleteLocations}
                onClick={confirmDeleteLocation}
                disabled={deleteLocationSaving}
              >
                {deleteLocationSaving ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
 
          <Divider />
 
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button variant="outlined" onClick={() => setMapLocationOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleMapLocation}
              disabled={mapLocationSaving || !selectedLocationId}
             
sx={{
  backgroundColor: '#97247E',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#7B1C69',
  },
  '&.Mui-disabled': {
    color: '#fff',
    backgroundColor: '#c084bc',
  }
}}

            >
              {mapLocationSaving ? 'Saving…' : 'Map Location'}
            </Button>
          </DialogActions>
        </Dialog>
 
        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <Typography sx={{ fontSize: '0.82rem', color: '#6B7280' }}>
            {selected.length > 0 ? `${selected.length} selected` : 'No users selected'}
          </Typography>
 
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRows(+e.target.value);
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </Card>
 
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
        title={
          confirm.action === 'delete'
            ? 'Delete user'
            : confirm.action === 'enable'
              ? 'Enable user'
              : 'Disable user'
        }
        message={
          confirm.action === 'delete'
            ? 'This action is permanent. The user will be deleted.'
            : confirm.action === 'enable'
              ? 'This user will be allowed to sign in again.'
              : 'This user will no longer be able to sign in.'
        }
        confirmLabel={
          confirm.action === 'delete'
            ? 'Delete'
            : confirm.action === 'enable'
              ? 'Enable'
              : 'Disable'
        }
        severity={confirm.action === 'delete' ? 'error' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm({ open: false, userId: null, action: '' })}
        loading={actionLoading}
      />
    </Box>
  );
};
 
export default UserManagementPage;


