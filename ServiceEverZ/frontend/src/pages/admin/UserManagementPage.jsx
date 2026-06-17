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
  Badge, LinearProgress, Paper, Menu, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  Add, CloudUpload, Edit, People, Delete, LocationOn,
  AddLocationAlt, AddBusiness, AddCircleOutline,
  DeleteOutline, Close, Search, SaveOutlined,
  CancelOutlined, CheckCircle, Refresh, PersonAdd,
  Visibility, ManageAccounts, Business, FolderOpen,
  WorkOutline, Layers, GridView, TableRows,
  TipsAndUpdates, Warning, ArrowForward, ChevronRight,
  MoreVert, PersonOff, PersonOutlined, PinDropOutlined,
  LockOpen, Block,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import PageHeader       from '../../components/common/PageHeader';
import StatusChip       from '../../components/common/StatusChip';
import ConfirmDialog    from '../../components/common/ConfirmDialog';
import UserFilters      from '../../components/users/UserFilters';
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
  '#27235C','#97247E','#24A148','#E2B93B','#AC5098','#1976d2','#E01950',
];
const getAvatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
const getInitials    = (u)  =>
  `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase() || '?';

/* ─────────────────────────────────────────────────────────────
   Feature card definitions
───────────────────────────────────────────────────────────── */
const FEATURE_CARDS = [
  {
    key: 'create_user', icon: PersonAdd, label: 'Create User',
    description: 'Add a new employee account with role and department assignment.',
    color: '#27235C', bg: '#EEEDF8', accent: '#4F4BA8',
    gradient: 'linear-gradient(135deg, #27235C 0%, #4F4BA8 100%)',
    flow: [
      'Open this card to launch the Create User form',
      'Fill first name, last name and email address',
      'Select department — designation loads automatically',
      'Optionally pick a location and set status',
      'Submit — a temp password is emailed to the new user',
    ],
  },
  {
    key: 'bulk_upload', icon: CloudUpload, label: 'Bulk Upload',
    description: 'Import multiple users at once via a structured CSV template.',
    color: '#1565C0', bg: '#EDF4FB', accent: '#1976d2',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
    flow: [
      'Click "Bulk upload" to open the importer',
      'Download the CSV template provided in the dialog',
      'Fill in columns: firstName, lastName, email, department, designation',
      'Upload the completed file',
      'Review the error report — valid rows are created automatically',
    ],
  },
  {
    key: 'organisation', icon: Layers, label: 'Organisation',
    description: 'Manage departments and designations across your company.',
    color: '#97247E', bg: '#F9EFF7', accent: '#AC5098',
    gradient: 'linear-gradient(135deg, #97247E 0%, #CE93D8 100%)',
    flow: [
      'Click this card to open the Organisation panel',
      'Left column: create, rename or delete departments',
      'Right column: pick a department then manage its designations',
      'Click ✏ to rename, 🗑 to delete (only if no users attached)',
      'Changes here reflect immediately in the Create/Edit user forms',
    ],
  },
  {
    key: 'location', icon: LocationOn, label: 'Locations',
    description: 'Create office locations and assign them to users.',
    color: '#B45309', bg: '#FBF6E7', accent: '#E2B93B',
    gradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
    flow: [
      'Click this card to open the Location manager',
      'Type a location name (capital first letter) → Create',
      'Click a location card to select it',
      'Click "Map location" to assign it to selected users',
      'Edit or delete locations using the icons on each card',
    ],
  },
  // {
  //   key: 'user_list', icon: FolderOpen, label: 'User Directory',
  //   description: 'Search, filter, and manage all users in the system.',
  //   color: '#166534', bg: '#ECFDF5', accent: '#24A148',
  //   gradient: 'linear-gradient(135deg, #166534 0%, #34D399 100%)',
  //   flow: [
  //     'Use the search bar to find users by name or email',
  //     'Apply filters: status, department, designation, role, location',
  //     'Select users with checkboxes for bulk location mapping',
  //     'Click ⋮ on any row to edit, assign location, toggle status, or delete',
  //     'Use the toggle switch inside the menu to enable/disable instantly',
  //   ],
  // },
];

/* ─────────────────────────────────────────────────────────────
   How-To Modal
───────────────────────────────────────────────────────────── */
const HowToModal = ({ card, open, onClose }) => {
  if (!card) return null;
  const Icon = card.icon;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      // PaperProps={{
      //   sx: {
         
      //     borderRadius: 4,
      //     overflow: 'hidden',
      //     boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
      //   },
      // }}
      TransitionProps={{ timeout: 260 }}
    >
      <Box sx={{
        background: card.gradient,
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <Icon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.2 }}>
              How to use
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
              {card.label}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.8)', mt: -0.5, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' } }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {card.flow.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box sx={{ display: 'flex', gap: 2, mb: i < card.flow.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: card.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 12px ${card.color}40`,
                }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: '#fff' }}>
                    {i + 1}
                  </Typography>
                </Box>
                {i < card.flow.length - 1 && (
                  <Box sx={{ width: 2, flex: 1, bgcolor: `${card.color}20`, mt: 0.5, minHeight: 16 }} />
                )}
              </Box>
              <Box sx={{ pt: 0.4, pb: i < card.flow.length - 1 ? 1.5 : 0 }}>
                <Typography sx={{ fontSize: '0.86rem', color: '#374151', lineHeight: 1.6 }}>
                  {step}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            background: card.gradient,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            py: 1.1,
            boxShadow: `0 8px 20px ${card.color}40`,
            '&:hover': { opacity: 0.92, boxShadow: `0 12px 28px ${card.color}55` },
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────────────────
   Feature Grid Card
───────────────────────────────────────────────────────────── */
const FeatureGridCard = ({ card, onClick, active, delay }) => {
  const [howToOpen, setHowToOpen] = useState(false);
  const Icon = card.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '100%' }}
      >
        <Box
          onClick={onClick}
          sx={{
            position: 'relative',
            height: '100%',
            minHeight: 180,
            bgcolor: active ? 'transparent' : '#fff',
            background: active ? card.gradient : '#fff',
            border: `2px solid ${active ? 'transparent' : card.color + '20'}`,
            borderRadius: 4,
            p: 3,
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.26s cubic-bezier(0.22,1,0.36,1)',
            '&:hover': {
              border: `2px solid ${active ? 'transparent' : card.color + '60'}`,
              boxShadow: active
                ? `0 20px 50px ${card.color}50`
                : `0 12px 36px ${card.color}25`,
              transform: 'translateY(-4px)',
            },
            '&:hover .card-cta': { opacity: 1, transform: 'translateY(0)' },
            '&:hover .card-arrow': { transform: 'translateX(4px)' },
          }}
        >
          {active && (
            <Box sx={{
              position: 'absolute', inset: 0,
              backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
              pointerEvents: 'none',
            }} />
          )}

          {!active && (
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: card.gradient,
              borderRadius: '4px 4px 0 0',
            }} />
          )}

          <Tooltip title="How to use">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setHowToOpen(true); }}
              sx={{
                position: 'absolute', top: 12, right: 12,
                width: 30, height: 30,
                color: active ? 'rgba(255,255,255,0.75)' : card.color + '80',
                bgcolor: active ? 'rgba(255,255,255,0.15)' : card.bg,
                border: `1px solid ${active ? 'rgba(255,255,255,0.25)' : card.color + '25'}`,
                transition: 'all 0.15s',
                '&:hover': {
                  color: active ? '#fff' : card.color,
                  bgcolor: active ? 'rgba(255,255,255,0.25)' : card.bg,
                },
              }}
            >
              <TipsAndUpdates sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          <Box sx={{
            width: 52, height: 52, borderRadius: 3,
            bgcolor: active ? 'rgba(255,255,255,0.2)' : card.bg,
            border: `1.5px solid ${active ? 'rgba(255,255,255,0.3)' : card.color + '28'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 2,
            boxShadow: active ? 'none' : `0 4px 12px ${card.color}20`,
          }}>
            <Icon sx={{ color: active ? '#fff' : card.color, fontSize: 26 }} />
          </Box>

          <Typography sx={{
            fontWeight: 800, fontSize: '1rem',
            color: active ? '#fff' : '#1B193F',
            lineHeight: 1.2, mb: 0.6,
          }}>
            {card.label}
          </Typography>

          <Typography sx={{
            fontSize: '0.78rem',
            color: active ? 'rgba(255,255,255,0.75)' : '#6B7280',
            lineHeight: 1.55,
            pr: 2,
          }}>
            {card.description}
          </Typography>

          <Box className="card-cta" sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            mt: 2.5,
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.2s, transform 0.2s',
          }}>
            <Typography sx={{
              fontSize: '0.72rem', fontWeight: 800,
              color: active ? 'rgba(255,255,255,0.9)' : card.color,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {active ? 'Active' : 'Open'}
            </Typography>
            <ChevronRight className="card-arrow" sx={{
              fontSize: 16,
              color: active ? 'rgba(255,255,255,0.9)' : card.color,
              transition: 'transform 0.18s',
            }} />
          </Box>

          {active && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              style={{ position: 'absolute', bottom: 14, right: 14 }}
            >
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.25)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle sx={{ color: '#fff', fontSize: 16 }} />
              </Box>
            </motion.div>
          )}
        </Box>
      </motion.div>

      <HowToModal card={card} open={howToOpen} onClose={() => setHowToOpen(false)} />
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   Feature Grid
───────────────────────────────────────────────────────────── */
const FeatureGrid = ({ onAction, activeCard }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
        Select a module to get started — tap <TipsAndUpdates sx={{ fontSize: 13, verticalAlign: 'middle', color: '#97247E', mx: 0.25 }} /> on any card for a step-by-step guide
      </Typography>
    </Box>

    <Grid container spacing={2}>
      {FEATURE_CARDS.map((card, i) => (
        <Grid item xs={12} sm={6} md={3} lg={3} key={card.key}>
          <FeatureGridCard
            card={card}
            delay={i * 0.07}
            active={activeCard === card.key}
            onClick={() => onAction(card.key)}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

/* ─────────────────────────────────────────────────────────────
   DepartmentsPanel
───────────────────────────────────────────────────────────── */
const DepartmentsPanel = ({ onDepartmentsChange }) => {
  const [depts, setDepts]           = useState([]);
  const [desigs, setDesigs]         = useState([]);
  const [selDept, setSelDept]       = useState('');
  const [loading, setLoading]       = useState(false);

  const onDepartmentsChangeRef = useRef(onDepartmentsChange);
  useEffect(() => { onDepartmentsChangeRef.current = onDepartmentsChange; }, [onDepartmentsChange]);

  const [newDept, setNewDept]       = useState('');
  const [newDesig, setNewDesig]     = useState('');
  const [saving, setSaving]         = useState(false);

  const [editingDeptId, setEditingDeptId]         = useState(null);
  const [editingDeptName, setEditingDeptName]     = useState('');
  const [editingDesigId, setEditingDesigId]       = useState(null);
  const [editingDesigName, setEditingDesigName]   = useState('');
  const [editSaving, setEditSaving]               = useState(false);

  const [confirmDel, setConfirmDel] = useState({ open: false, type: '', id: null, name: '' });
  const [delSaving, setDelSaving]   = useState(false);

  const loadDepts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await orgApi.getAllDepartments();
      const d = r.data?.content || r.data || [];
      const list = Array.isArray(d) ? d : [];
      setDepts(list);
      if (onDepartmentsChangeRef.current) onDepartmentsChangeRef.current(list);
    } catch { setDepts([]); }
    finally { setLoading(false); }
  }, []);

  const loadDesigs = useCallback(async (deptId) => {
    if (!deptId) { setDesigs([]); return; }
    setLoading(true);
    try {
      const r = await orgApi.getDesignationsByDepartment(deptId);
      const d = r.data?.content || r.data || [];
      setDesigs(Array.isArray(d) ? d : []);
    } catch { setDesigs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDepts(); }, [loadDepts]);

  const handleCreateDept = async () => {
    const name = newDept.trim();
    if (!name) return toast.error('Department name required');
    if (!/^[A-Za-z\s]{2,50}$/.test(name)) return toast.error('Letters only (2–50 chars)');
    setSaving(true);
    try {
      await orgApi.createDepartment({ name });
      setNewDept('');
      await loadDepts();
      toast.success(`Department "${name}" created`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleCreateDesig = async () => {
    if (!selDept) return toast.error('Select a department first');
    const name = newDesig.trim();
    if (!name) return toast.error('Designation name required');
    if (!/^[A-Za-z\s]{2,50}$/.test(name)) return toast.error('Letters only (2–50 chars)');
    setSaving(true);
    try {
      await orgApi.createDesignation({ name, departmentId: Number(selDept) });
      setNewDesig('');
      await loadDesigs(selDept);
      toast.success(`Designation "${name}" created`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleSaveEditDept = async () => {
    const name = editingDeptName.trim();
    if (!name) return toast.error('Name required');
    setEditSaving(true);
    try {
      await orgApi.updateDepartment(editingDeptId, { name });
      setEditingDeptId(null); setEditingDeptName('');
      await loadDepts();
      toast.success('Department updated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setEditSaving(false); }
  };

  const handleSaveEditDesig = async () => {
    const name = editingDesigName.trim();
    if (!name) return toast.error('Name required');
    setEditSaving(true);
    try {
      await orgApi.updateDesignation(editingDesigId, { name, departmentId: Number(selDept) });
      setEditingDesigId(null); setEditingDesigName('');
      await loadDesigs(selDept);
      toast.success('Designation updated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setEditSaving(false); }
  };

  const openConfirmDel = (type, id, name) =>
    setConfirmDel({ open: true, type, id, name });

  const handleDelete = async () => {
    setDelSaving(true);
    try {
      if (confirmDel.type === 'dept') {
        await orgApi.deleteDepartment(confirmDel.id);
        await loadDepts();
        toast.success('Department deleted');
      } else {
        await orgApi.deleteDesignation(confirmDel.id);
        await loadDesigs(selDept);
        toast.success('Designation deleted');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally {
      setDelSaving(false);
      setConfirmDel({ open: false, type: '', id: null, name: '' });
    }
  };

  const rowSx = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 2, py: 1.25,
    borderBottom: '1px solid #F0F0F5',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { bgcolor: '#FAFAFD' },
    transition: 'background 0.12s',
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* LEFT: DEPARTMENTS */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#F9EFF7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Business sx={{ fontSize: 15, color: '#97247E' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1B193F' }}>
              Departments ({depts.length})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
            <TextField
              size="small" label="New department" value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDept()}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" startIcon={<Add />} onClick={handleCreateDept}
              disabled={saving} sx={{ bgcolor: '#97247E', '&:hover': { bgcolor: '#7B1C69' }, whiteSpace: 'nowrap' }}>
              {saving ? '…' : 'Add'}
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={22} sx={{ color: '#97247E' }} /></Box>
            ) : depts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Business sx={{ fontSize: 36, color: '#E5E7EB', mb: 0.75 }} />
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.825rem' }}>No departments yet</Typography>
              </Box>
            ) : depts.map((d) => (
              <Box key={d.id} sx={rowSx}>
                {editingDeptId === d.id ? (
                  <TextField
                    size="small" autoFocus value={editingDeptName}
                    onChange={(e) => setEditingDeptName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEditDept();
                      if (e.key === 'Escape') { setEditingDeptId(null); setEditingDeptName(''); }
                    }}
                    sx={{ flex: 1, mr: 1.5 }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#F9EFF7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Business sx={{ fontSize: 13, color: '#97247E' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.845rem', color: '#1B193F' }}>
                      {d.name}
                    </Typography>
                  </Box>
                )}
                <Stack direction="row" spacing={0.5}>
                  {editingDeptId === d.id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton size="small" onClick={handleSaveEditDept} disabled={editSaving} sx={{ color: '#24A148' }}>
                          {editSaving ? <CircularProgress size={13} /> : <SaveOutlined sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton size="small" sx={{ color: '#6B7280' }}
                          onClick={() => { setEditingDeptId(null); setEditingDeptName(''); }}>
                          <CancelOutlined sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: '#27235C', '&:hover': { bgcolor: '#EEEDF8' } }}
                          onClick={() => { setEditingDeptId(d.id); setEditingDeptName(d.name); }}>
                          <Edit sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: '#E01950', '&:hover': { bgcolor: '#FFF1F3' } }}
                          onClick={() => openConfirmDel('dept', d.id, d.name)}>
                          <DeleteOutline sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* RIGHT: DESIGNATIONS */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#F5EDF3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WorkOutline sx={{ fontSize: 15, color: '#AC5098' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1B193F' }}>
              Designations
            </Typography>
          </Box>

          <FormControl size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select department</InputLabel>
            <Select
              value={selDept}
              label="Select department"
              onChange={(e) => { setSelDept(e.target.value); loadDesigs(e.target.value); }}
            >
              {depts.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>

          {selDept && (
            <>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small" label="New designation" value={newDesig}
                  onChange={(e) => setNewDesig(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDesig()}
                  sx={{ flex: 1 }}
                />
                <Button variant="contained" startIcon={<Add />} onClick={handleCreateDesig}
                  disabled={saving} sx={{ bgcolor: '#AC5098', '&:hover': { bgcolor: '#8A3E7B' }, whiteSpace: 'nowrap' }}>
                  {saving ? '…' : 'Add'}
                </Button>
              </Box>

              <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
                {loading ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={22} sx={{ color: '#AC5098' }} /></Box>
                ) : desigs.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <WorkOutline sx={{ fontSize: 36, color: '#E5E7EB', mb: 0.75 }} />
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.825rem' }}>No designations yet</Typography>
                  </Box>
                ) : desigs.map((d) => (
                  <Box key={d.id} sx={rowSx}>
                    {editingDesigId === d.id ? (
                      <TextField
                        size="small" autoFocus value={editingDesigName}
                        onChange={(e) => setEditingDesigName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditDesig();
                          if (e.key === 'Escape') { setEditingDesigId(null); setEditingDesigName(''); }
                        }}
                        sx={{ flex: 1, mr: 1.5 }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#F5EDF3',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <WorkOutline sx={{ fontSize: 13, color: '#AC5098' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.845rem', color: '#1B193F' }}>
                          {d.name}
                        </Typography>
                      </Box>
                    )}
                    <Stack direction="row" spacing={0.5}>
                      {editingDesigId === d.id ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton size="small" onClick={handleSaveEditDesig} disabled={editSaving} sx={{ color: '#24A148' }}>
                              {editSaving ? <CircularProgress size={13} /> : <SaveOutlined sx={{ fontSize: 15 }} />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton size="small" sx={{ color: '#6B7280' }}
                              onClick={() => { setEditingDesigId(null); setEditingDesigName(''); }}>
                              <CancelOutlined sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" sx={{ color: '#27235C', '&:hover': { bgcolor: '#EEEDF8' } }}
                              onClick={() => { setEditingDesigId(d.id); setEditingDesigName(d.name); }}>
                              <Edit sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" sx={{ color: '#E01950', '&:hover': { bgcolor: '#FFF1F3' } }}
                              onClick={() => openConfirmDel('desig', d.id, d.name)}>
                              <DeleteOutline sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Paper>
            </>
          )}

          {!selDept && (
            <Box sx={{
              border: '2px dashed #E5E7EB', borderRadius: 2.5, p: 4,
              textAlign: 'center', bgcolor: '#FAFAFD',
            }}>
              <WorkOutline sx={{ fontSize: 36, color: '#D1D5DB', mb: 1 }} />
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.825rem' }}>
                Select a department above to manage its designations
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Delete confirm */}
      <Dialog open={confirmDel.open} onClose={() => setConfirmDel({ open: false, type: '', id: null, name: '' })}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Warning sx={{ color: '#E01950' }} />
          Delete {confirmDel.type === 'dept' ? 'Department' : 'Designation'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2 }}>
            This action is permanent and cannot be undone.
          </Alert>
          <Typography fontSize="0.9rem">
            Delete <strong>{confirmDel.name}</strong>?
            {confirmDel.type === 'dept'
              ? ' This will fail if any users or designations are still attached.'
              : ' This will fail if any users are still assigned to this designation.'
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDel({ open: false, type: '', id: null, name: '' })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={delSaving}>
            {delSaving ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ─────────────────────────────────────────────────────────────
   Row Actions Kebab Menu
   Single ⋮ button → dropdown with Edit, Assign Location,
   Enable/Disable, Delete
───────────────────────────────────────────────────────────── */
const RowActionsMenu = ({ user, onEdit, onMapLoc, onToggleStatus, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isDisabled = user.status === 'DISABLED';

  const handleClose = () => setAnchorEl(null);

  const item = (icon, label, onClick, color = '#374151', hoverBg = '#F9F9FD') => ({
    icon, label, onClick, color, hoverBg,
  });

  const menuItems = [
    item(<Edit sx={{ fontSize: 16 }} />, 'Edit user', () => { handleClose(); onEdit(user); }, '#27235C', '#EEEDF8'),
    item(<PinDropOutlined sx={{ fontSize: 16 }} />, 'Assign location', () => { handleClose(); onMapLoc(user); }, '#97247E', '#F9EFF7'),
    'divider',
    item(
      isDisabled
        ? <LockOpen sx={{ fontSize: 16 }} />
        : <Block sx={{ fontSize: 16 }} />,
      isDisabled ? 'Enable user' : 'Disable user',
      () => { handleClose(); onToggleStatus(user); },
      isDisabled ? '#24A148' : '#E2B93B',
      isDisabled ? '#F0FFF4' : '#FFFBEB',
    ),
    'divider',
    item(<Delete sx={{ fontSize: 16 }} />, 'Delete user', () => { handleClose(); onDelete(user); }, '#E01950', '#FFF1F3'),
  ];

  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
          sx={{
            width: 30, height: 30,
            color: '#6B7280',
            border: '1px solid transparent',
            borderRadius: 1.5,
            transition: 'all 0.15s',
            '&:hover': {
              color: '#27235C',
              bgcolor: '#EEEDF8',
              border: '1px solid #27235C20',
            },
            ...(open && {
              color: '#27235C',
              bgcolor: '#EEEDF8',
              border: '1px solid #27235C20',
            }),
          }}
        >
          <MoreVert sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.75,
            minWidth: 190,
            borderRadius: 2.5,
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -5, right: 10,
              width: 10, height: 10,
              bgcolor: '#fff',
              border: '1px solid #E5E7EB',
              borderBottom: 'none',
              borderRight: 'none',
              transform: 'rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        {menuItems.map((item, idx) =>
          item === 'divider' ? (
            <Divider key={idx} sx={{ my: 0.5, borderColor: '#F3F4F6' }} />
          ) : (
            <MenuItem
              key={idx}
              onClick={item.onClick}
              sx={{
                mx: 0.75, my: 0.25,
                borderRadius: 1.5,
                px: 1.5, py: 1,
                gap: 1.25,
                fontSize: '0.845rem',
                fontWeight: 500,
                color: item.color,
                transition: 'all 0.12s',
                '&:hover': {
                  bgcolor: item.hoverBg,
                },
              }}
            >
              <Box sx={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
              {item.label}
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const UserManagementPage = () => {

  const [activeCard, setActiveCard] = useState(null);

  /* Core data */
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [userRolesMap, setRolesMap]     = useState({});
  const [rolesLoading, setRolesLoading] = useState(false);

  /* Filter / pagination */
  const [filters,     setFilters]  = useState(EMPTY_FILTERS);
  const [page,        setPage]     = useState(0);
  const [rowsPerPage, setRpp]      = useState(10);
  const [selected,    setSelected] = useState([]);

  /* Dialogs */
  const [createOpen,    setCreateOpen]    = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError,   setCreateError]   = useState('');
  const [bulkOpen,      setBulkOpen]      = useState(false);
  const [confirm,       setConfirm]       = useState({ open: false, userId: null, action: '' });
  const [actionLoading, setActionLoading] = useState(false);

  /* Edit dialog */
  const [editUser,      setEditUser]      = useState(null);
  const [editErrors,    setEditErrors]    = useState({});
  const [editMasterErr, setEditMasterErr] = useState('');
  const [departments,   setDepartments]   = useState([]);
  const [editDesigs,    setEditDesigs]    = useState([]);
  const [metaLoading,   setMetaLoading]   = useState(false);
  const [desigLoading,  setDesigLoading]  = useState(false);

  const [editDeptMode,     setEditDeptMode]     = useState(false);
  const [editNewDept,      setEditNewDept]      = useState('');
  const [editNewDeptDesig, setEditNewDeptDesig] = useState('');
  const [savingDept,       setSavingDept]       = useState(false);
  const [editDesigMode,    setEditDesigMode]    = useState(false);
  const [editNewDesig,     setEditNewDesig]     = useState('');
  const [savingDesig,      setSavingDesig]      = useState(false);

  /* Location dialog */
  const [locations,         setLocations]        = useState([]);
  const [locLoading,        setLocLoading]        = useState(false);
  const [mapLocOpen,        setMapLocOpen]        = useState(false);
  const [mapTarget,         setMapTarget]         = useState(null);
  const [selectedLocId,     setSelectedLocId]     = useState('');
  const [newLocName,        setNewLocName]        = useState('');
  const [mapLocSaving,      setMapLocSaving]      = useState(false);
  const [createLocSaving,   setCreateLocSaving]   = useState(false);
  const [deleteLocSaving,   setDeleteLocSaving]   = useState(false);
  const [confirmDelLocOpen, setConfirmDelLocOpen] = useState(false);
  const [locToDelete,       setLocToDelete]       = useState(null);
  const [editingLocId,      setEditingLocId]      = useState(null);
  const [editingLocName,    setEditingLocName]    = useState('');
  const [editLocSaving,     setEditLocSaving]     = useState(false);
  const [locDialogPage,     setLocDialogPage]     = useState(0);

  /* Dept/Desig panel */
  const [orgPanelOpen, setOrgPanelOpen] = useState(false);

  const userCountByLoc = useMemo(() => {
    const map = {};
    users.forEach((u) => { if (u.locationId) map[u.locationId] = (map[u.locationId] || 0) + 1; });
    return map;
  }, [users]);

  /* Data loaders */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await userApi.getAllUsers();
      const data = res.data?.content || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, []);

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
      results.forEach((r) => { if (r.status === 'fulfilled') map[r.value.id] = r.value.roles; });
      setRolesMap(map);
    } finally { setRolesLoading(false); }
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

  useEffect(() => { fetchUsers(); loadDepartments(); loadLocations(); }, [fetchUsers, loadDepartments, loadLocations]);
  useEffect(() => { fetchRoles(users); }, [users, fetchRoles]);
  useEffect(() => {
    const t = setInterval(() => fetchUsers(), 60000);
    return () => clearInterval(t);
  }, [fetchUsers]);

  /* Filter + sort */
  const filtered = useMemo(() => {
    const q = (filters.search || '').toLowerCase();
    const list = users.filter((u) => {
      const roles = userRolesMap[u.id] || [];
      const dept  = u.departmentName  || u.department  || '';
      const desig = u.designationName || u.designation || '';
      const loc   = u.locationName    || '';
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

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const stats = useMemo(() => ({
    total:     users.length,
    active:    users.filter((u) => u.status === 'ACTIVE').length,
    pending:   users.filter((u) => u.status === 'PENDINGACTIVATION').length,
    disabled:  users.filter((u) => u.status === 'DISABLED').length,
    locations: locations.length,
    depts:     departments.length,
  }), [users, locations, departments]);

  /* Selection */
  const allPageSel  = paginated.length > 0 && paginated.every((u) => selected.includes(u.id));
  const somePageSel = paginated.some((u) => selected.includes(u.id)) && !allPageSel;
  const togglePageSelect = (checked) => {
    const ids = paginated.map((u) => u.id);
    setSelected((p) => checked ? [...new Set([...p, ...ids])] : p.filter((id) => !ids.includes(id)));
  };
  const toggleOne = (id) =>
    setSelected((p) => p.includes(id) ? p.filter((v) => v !== id) : [...p, id]);

  /* Location handlers */
  const openMapLoc = useCallback((user = null) => {
    setMapTarget(user);
    setSelectedLocId(user?.locationId || '');
    setNewLocName('');
    setEditingLocId(null); setEditingLocName('');
    setLocDialogPage(0);
    setMapLocOpen(true);
  }, []);

  /* Hub action handler */
  const handleHubAction = useCallback((key) => {
    setActiveCard(key);
    switch (key) {
      case 'create_user':
        setCreateError(''); setCreateOpen(true);
        break;
      case 'bulk_upload':
        setBulkOpen(true);
        break;
      case 'organisation':
        setOrgPanelOpen(true);
        break;
      case 'location':
        openMapLoc(null);
        break;
      case 'user_list':
        document.getElementById('user-table-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      default: break;
    }
  }, [openMapLoc]);

  /* Create user */
  const handleCreateUser = async (data) => {
    setCreateLoading(true); setCreateError('');
    try {
      await userApi.createUser(data);
      await fetchUsers();
      toast.success('User created successfully');
      setCreateOpen(false);
      setActiveCard(null);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    } finally { setCreateLoading(false); }
  };

  /* Edit user */
  const resetEditState = () => {
    setEditDeptMode(false); setEditNewDept(''); setEditNewDeptDesig('');
    setEditDesigMode(false); setEditNewDesig('');
    setEditErrors({}); setEditMasterErr('');
  };

  const openEdit = async (user) => {
    resetEditState();
    setEditUser({ ...user });
    setMetaLoading(true);
    try {
      await loadDepartments();
      if (user.departmentId) await loadDesigs(user.departmentId);
    } finally { setMetaLoading(false); }
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
      const dRes    = await orgApi.createDepartment({ name: dept });
      const created = dRes.data;
      const dsgRes  = await orgApi.createDesignation({ name: desig, departmentId: created.id });
      await loadDepartments();
      await loadDesigs(created.id);
      setEditUser((p) => ({ ...p, departmentId: created.id, designationId: dsgRes.data.id }));
      setEditNewDept(''); setEditNewDeptDesig('');
      toast.success('Department and designation created');
    } catch (err) {
      setEditMasterErr(err.response?.data?.message || 'Failed');
    } finally { setSavingDept(false); }
  };

  const handleCreateDesig = async () => {
    const desig = editNewDesig.trim();
    if (!desig) return setEditMasterErr('Designation name required');
    if (!/^[A-Za-z\s]{2,50}$/.test(desig)) return setEditMasterErr('Letters only (2–50 chars)');
    if (editDesigs.some((d) => d.name.toLowerCase() === desig.toLowerCase()))
      return setEditMasterErr('Already exists');
    setSavingDesig(true); setEditMasterErr('');
    try {
      const res = await orgApi.createDesignation({ name: desig, departmentId: Number(editUser.departmentId) });
      await loadDesigs(editUser.departmentId);
      setEditUser((p) => ({ ...p, designationId: res.data.id }));
      setEditNewDesig('');
      toast.success('Designation created');
    } catch (err) {
      setEditMasterErr(err.response?.data?.message || 'Failed');
    } finally { setSavingDesig(false); }
  };

  const handleEditField = (field, value) => {
    setEditUser((p) => ({ ...p, [field]: value }));
    setEditErrors((p) => ({ ...p, [field]: '' }));
    setEditMasterErr('');
    if (field === 'departmentId') {
      setEditUser((p) => ({ ...p, designationId: '' }));
      loadDesigs(value);
    }
  };

  const validateEdit = () => {
    const e = {};
    const u = editUser;
    if (!u.firstName?.trim() || u.firstName.trim().length < 2) e.firstName = 'Min 2 characters';
    if (!/^[A-Za-z\s]+$/.test(u.firstName || ''))              e.firstName = 'Letters only';
    if (!u.lastName?.trim()  || u.lastName.trim().length < 2)  e.lastName  = 'Min 2 characters';
    if (!/^[A-Za-z\s]+$/.test(u.lastName || ''))               e.lastName  = 'Letters only';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(u.email || '')) e.email = 'Invalid email';
    if (!u.departmentId  || u.departmentId  === OTHER_DEPARTMENT)  e.departmentId  = 'Required';
    if (!u.designationId || u.designationId === OTHER_DESIGNATION) e.designationId = 'Required';
    if (!u.status) e.status = 'Required';
    setEditErrors(e);
    return !Object.keys(e).length;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit()) return;
    setMetaLoading(true);
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
      toast.success(`Updated ${res.data?.firstName || ''} ${res.data?.lastName || ''}`.trim() || 'User updated');
      setEditUser(null);
      resetEditState();
      await fetchUsers();
    } catch (err) {
      setEditMasterErr(err.response?.data?.message || 'Failed to save');
    } finally { setMetaLoading(false); }
  };

  /* Status / delete actions */
  const handleToggleStatus = (user) => {
    setConfirm({
      open: true,
      userId: user.id,
      action: user.status === 'DISABLED' ? 'enable' : 'disable',
    });
  };

  const handleDeleteUser = (user) => {
    setConfirm({ open: true, userId: user.id, action: 'delete' });
  };

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

  /* Location actions */
  const handleCreateLoc = async () => {
    const name = newLocName.trim();
    if (!name) return toast.error('Location name required');
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) return toast.error('Must start with capital, letters only');
    setCreateLocSaving(true);
    try {
      await userApi.createLocation({ name });
      setNewLocName('');
      await loadLocations();
      toast.success(`Location "${name}" created`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreateLocSaving(false); }
  };

  const handleMapLoc = async () => {
    if (!selectedLocId) return toast.error('Select a location');
    setMapLocSaving(true);
    try {
      if (mapTarget?.id) {
        await userApi.mapLocation(mapTarget.id, { locationId: Number(selectedLocId) });
        toast.success('Location mapped');
      } else if (selected.length > 0) {
        await Promise.all(selected.map((uid) => userApi.mapLocation(uid, { locationId: Number(selectedLocId) })));
        toast.success(`Mapped for ${selected.length} users`);
        setSelected([]);
      }
      setMapLocOpen(false); setMapTarget(null); setSelectedLocId('');
      setActiveCard(null);
      await fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setMapLocSaving(false); }
  };

  const handleSaveEditLoc = async () => {
    const name = editingLocName.trim();
    if (!name) return toast.error('Name required');
    if (!/^[A-Z][a-zA-Z\s]*$/.test(name)) return toast.error('Must start with capital, letters only');
    setEditLocSaving(true);
    try {
      await userApi.updateLocation(editingLocId, { name });
      toast.success('Location updated');
      setEditingLocId(null); setEditingLocName('');
      await loadLocations();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setEditLocSaving(false); }
  };

  const handleDeleteLoc = async () => {
    setDeleteLocSaving(true);
    try {
      await userApi.deleteLocation(locToDelete.id);
      toast.success('Location deleted');
      if (Number(selectedLocId) === Number(locToDelete.id)) setSelectedLocId('');
      await loadLocations();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally {
      setDeleteLocSaving(false);
      setConfirmDelLocOpen(false); setLocToDelete(null);
    }
  };

  const locTotalPages = Math.max(1, Math.ceil(locations.length / LOCATION_PER_PAGE));
  const paginatedLocs = locations.slice(locDialogPage * LOCATION_PER_PAGE, (locDialogPage + 1) * LOCATION_PER_PAGE);

  /* ── Render ── */
  return (
    <Box sx={{ bgcolor: '#F0F2F8', minHeight: '100vh', p: { xs: 2, md: 3 } }}>

      {/* Page header */}
      <PageHeader
        title="User management"
        subtitle={`Managing ${users.length} users across the organisation`}
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Users' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => fetchUsers()} disabled={loading}
                sx={{ border: '1px solid #E5E7EB', borderRadius: 2, color: '#27235C' }}>
                {loading ? <CircularProgress size={16} /> : <Refresh fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      {/* FEATURE GRID */}
      <FeatureGrid onAction={handleHubAction} activeCard={activeCard} />

      {/* ORGANISATION MODAL */}
      <Dialog
        open={orgPanelOpen}
        onClose={() => { setOrgPanelOpen(false); setActiveCard(null); }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(151,36,126,0.22)',
          },
          component: motion.div,
          initial: { opacity: 0, scale: 0.96, y: 16 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <Box sx={{
          px: 3, py: 2.5,
          background: 'linear-gradient(135deg,#97247E,#AC5098)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Admin
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', lineHeight: 1.2 }}>
                Organisation structure
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => { setOrgPanelOpen(false); setActiveCard(null); }}
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <DepartmentsPanel
            onDepartmentsChange={(d) => setDepartments(Array.isArray(d) ? d : [])}
          />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={() => { setOrgPanelOpen(false); setActiveCard(null); }}
            sx={{
              background: 'linear-gradient(135deg,#97247E,#AC5098)',
              borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3,
              boxShadow: '0 4px 14px rgba(151,36,126,0.35)',
              '&:hover': { opacity: 0.92 },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════
          USER DIRECTORY — redesigned section
      ══════════════════════════════════════ */}
      <div id="user-table-section">
        <Card
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #E8E8F0',
            boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
          }}
        >

          {/* ── Directory header bar ── */}
          <Box sx={{
            px: 3, py: 2,
            bgcolor: '#fff',
            borderBottom: '1px solid #F0F0F5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 1.5,
          }}>
            {/* Left: title + quick stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: 2,
                  background: 'linear-gradient(135deg, #166534 0%, #34D399 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <People sx={{ color: '#fff', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1B193F', lineHeight: 1 }}>
                    User Directory
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>
                    {users.length} total members
                  </Typography>
                </Box>
              </Box>

              {/* Inline stat pills */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {[
                  { label: 'Active',   value: stats.active,   color: '#166534', bg: '#ECFDF5' },
                  { label: 'Pending',  value: stats.pending,  color: '#92400E', bg: '#FFFBEB' },
                  { label: 'Disabled', value: stats.disabled, color: '#991B1B', bg: '#FEF2F2' },
                ].map(({ label, value, color, bg }) => (
                  <Box key={label} sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1.25, py: 0.4,
                    bgcolor: bg,
                    borderRadius: 10,
                    border: `1px solid ${color}20`,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color }}>
                      {value} {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ px: 2.5, py: 2, bgcolor: '#FAFAFC', borderBottom: '1px solid #F0F0F5' }}>
            <UserFilters
              filters={filters}
              onChange={(f) => { setFilters((p) => ({ ...p, ...f })); setPage(0); }}
              onReset={() => { setFilters(EMPTY_FILTERS); setPage(0); }}
              resultCount={filtered.length}
              totalCount={users.length}
              locations={locations}
            />
          </Box>

          {rolesLoading && (
            <Box sx={{ px: 2.5, pt: 0.5 }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mb: 0.25 }}>Loading role data…</Typography>
              <LinearProgress sx={{ height: 2, borderRadius: 1 }} />
            </Box>
          )}

          {/* Selection bar */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
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
                      Assign location
                    </Button>
                    <Button size="small" variant="text" onClick={() => setSelected([])}
                      sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                      Clear
                    </Button>
                  </Stack>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: '#F8F8FC', borderBottom: '2px solid #EBEBF5' }}>
                    <Checkbox size="small" checked={allPageSel} indeterminate={somePageSel}
                      onChange={(e) => togglePageSelect(e.target.checked)}
                      sx={{ '&.Mui-checked': { color: '#27235C' }, '&.MuiCheckbox-indeterminate': { color: '#27235C' } }} />
                  </TableCell>
                  {['User', 'Email', 'Department', 'Designation', 'Location', 'Status', 'Roles', 'Created', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{
                      bgcolor: '#F8F8FC',
                      borderBottom: '2px solid #EBEBF5',
                      fontWeight: 800, fontSize: '0.68rem',
                      color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em',
                      whiteSpace: 'nowrap',
                      ...(h === 'Actions' && { textAlign: 'center' }),
                    }}>{h}</TableCell>
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
                            width: j === 0 ? 20 : j === 1 ? 140 : 100,
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
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
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
                    <TableRow
                      key={user.id}
                      component={motion.tr}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      hover
                      selected={selected.includes(user.id)}
                      sx={{
                        '&.Mui-selected': { bgcolor: '#F5F4FF !important' },
                        '&.Mui-selected:hover': { bgcolor: '#EDECFC !important' },
                        '&:hover': { bgcolor: '#F9F9FD' },
                        transition: 'background 0.12s',
                        ...(user.status === 'DISABLED' && { opacity: 0.6 }),
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={selected.includes(user.id)}
                          onChange={() => toggleOne(user.id)}
                          sx={{ '&.Mui-checked': { color: '#27235C' } }} />
                      </TableCell>

                      {/* User */}
                      <TableCell sx={{ minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{
                            width: 34, height: 34, fontSize: '0.72rem', fontWeight: 800,
                            bgcolor: getAvatarColor(user.id), flexShrink: 0,
                          }}>{getInitials(user)}</Avatar>
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
                        <Typography sx={{ fontSize: '0.82rem' }}>{user.departmentName || user.department || '—'}</Typography>
                      </TableCell>

                      {/* Designation */}
                      <TableCell>
                        <Typography sx={{ fontSize: '0.82rem' }}>{user.designationName || user.designation || '—'}</Typography>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        {user.locationName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 13, color: '#97247E' }} />
                            <Typography sx={{ fontSize: '0.82rem', color: '#374151' }}>{user.locationName}</Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.78rem', color: '#D1D5DB', fontStyle: 'italic' }}>Unset</Typography>
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
                            : <Typography sx={{ fontSize: '0.72rem', color: '#D1D5DB', fontStyle: 'italic' }}>No role</Typography>
                          }
                        </Box>
                      </TableCell>

                      {/* Created */}
                      <TableCell sx={{ minWidth: 130 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                          {formatDateTime(user.createdAt) || '—'}
                        </Typography>
                      </TableCell>

                      {/* ── Actions: Edit, Enable/Disable toggle, Delete ── */}
                      <TableCell align="center" sx={{ width: 120, pr: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', alignItems: 'center' }}>
                          <Tooltip title="Edit user">
                            <IconButton size="small" onClick={() => openEdit(user)}
                              sx={{ color: '#27235C', '&:hover': { bgcolor: '#EEEDF8' } }}>
                              <Edit sx={{ fontSize: 16 }} />
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Pagination ── */}
          <Box sx={{
            px: 2.5, py: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 1,
            borderTop: '1px solid #F0F0F5', bgcolor: '#FAFAFC',
          }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
              Showing{' '}
              <strong>{filtered.length === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)}</strong>
              {' '}of{' '}
              <strong>{filtered.length}</strong> users
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
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.78rem' },
              }}
            />
          </Box>
        </Card>
      </div>

      {/* ══ EDIT USER MODAL ══ */}
      <Dialog
        open={Boolean(editUser)}
        onClose={() => { setEditUser(null); setActiveCard(null); resetEditState(); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
          },
          component: motion.div,
          initial: { opacity: 0, scale: 0.96, y: 16 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* Modal header */}
        <Box sx={{
          px: 3, py: 2.5,
          background: 'linear-gradient(135deg,#27235C,#4F4BA8)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {editUser && (
                <Avatar sx={{
                  width: 28, height: 28, fontSize: '0.62rem', fontWeight: 800,
                  bgcolor: getAvatarColor(editUser.id),
                }}>
                  {getInitials(editUser)}
                </Avatar>
              )}
            </Box>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Edit user
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', lineHeight: 1.2 }}>
                {editUser ? formatName(editUser.firstName, editUser.lastName) : ''}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small"
            onClick={() => { setEditUser(null); setActiveCard(null); resetEditState(); }}
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {editUser && (
          <DialogContent sx={{ p: 3 }}>
            {editMasterErr && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{editMasterErr}</Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth size="small" label="First name"
                  value={editUser.firstName || ''}
                  onChange={(e) => handleEditField('firstName', e.target.value)}
                  error={Boolean(editErrors.firstName)}
                  helperText={editErrors.firstName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth size="small" label="Last name"
                  value={editUser.lastName || ''}
                  onChange={(e) => handleEditField('lastName', e.target.value)}
                  error={Boolean(editErrors.lastName)}
                  helperText={editErrors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth size="small" label="Email"
                  value={editUser.email || ''}
                  onChange={(e) => handleEditField('email', e.target.value)}
                  error={Boolean(editErrors.email)}
                  helperText={editErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={editUser.departmentId || ''}
                    label="Department"
                    onChange={(e) => handleEditField('departmentId', e.target.value)}
                  >
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                    ))}
                    <MenuItem value={OTHER_DEPARTMENT}>+ Other / new dept</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {editUser.departmentId === OTHER_DEPARTMENT && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="New department name"
                      value={editNewDept}
                      onChange={(e) => setEditNewDept(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="First designation for this dept"
                      value={editNewDeptDesig}
                      onChange={(e) => setEditNewDeptDesig(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5}>
                      <Button variant="contained" size="small" onClick={handleCreateDept} disabled={savingDept}
                        sx={{ minWidth: 90, bgcolor: '#27235C', '&:hover': { bgcolor: '#1B193F' } }}>
                        {savingDept ? <CircularProgress size={14} color="inherit" /> : 'Create dept'}
                      </Button>
                      <Button variant="outlined" size="small"
                        onClick={() => { setEditUser((p) => ({ ...p, departmentId: '' })); setEditNewDept(''); setEditNewDeptDesig(''); }}
                        sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </>
              )}

              {editUser.departmentId && editUser.departmentId !== OTHER_DEPARTMENT && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" disabled={desigLoading}>
                    <InputLabel>Designation</InputLabel>
                    <Select
                      value={editUser.designationId || ''}
                      label="Designation"
                      onChange={(e) => handleEditField('designationId', e.target.value)}
                    >
                      {editDesigs.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                      ))}
                      <MenuItem value={OTHER_DESIGNATION}>+ Other / new designation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {editUser.designationId === OTHER_DESIGNATION && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="New designation name"
                      value={editNewDesig}
                      onChange={(e) => setEditNewDesig(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5}>
                      <Button variant="contained" size="small" onClick={handleCreateDesig} disabled={savingDesig}
                        sx={{ minWidth: 90, bgcolor: '#97247E', '&:hover': { bgcolor: '#7B1C69' } }}>
                        {savingDesig ? <CircularProgress size={14} color="inherit" /> : 'Create desig'}
                      </Button>
                      <Button variant="outlined" size="small"
                        onClick={() => { setEditUser((p) => ({ ...p, designationId: '' })); setEditNewDesig(''); }}
                        sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </>
              )}

              {/* Location field inside edit modal */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={editUser.locationId || ''}
                    label="Location"
                    onChange={(e) => handleEditField('locationId', e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOn sx={{ fontSize: 16, color: '#97247E', ml: 0.5 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value=""><em>No location</em></MenuItem>
                    {locations.map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editUser.status || 'ACTIVE'}
                    label="Status"
                    onChange={(e) => handleEditField('status', e.target.value)}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="DISABLED">Disabled</MenuItem>
                    <MenuItem value="PENDINGACTIVATION">Pending activation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
        )}

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => { setEditUser(null); setActiveCard(null); resetEditState(); }}
            sx={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: 2.5, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={metaLoading}
            sx={{
              background: 'linear-gradient(135deg,#27235C,#4F4BA8)',
              borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(39,35,92,0.35)',
              '&:hover': { opacity: 0.92 },
            }}
          >
            {metaLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ LOCATION MAP DIALOG ══ */}
      <Dialog
        open={mapLocOpen}
        onClose={() => { setMapLocOpen(false); setActiveCard(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(180,83,9,0.22)',
          },
          component: motion.div,
          initial: { opacity: 0, scale: 0.96, y: 16 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, py: 2.5,
          background: 'linear-gradient(135deg, #B45309, #F59E0B)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocationOn sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {mapTarget ? `Assigning to ${formatName(mapTarget.firstName, mapTarget.lastName)}` : `${selected.length} user${selected.length !== 1 ? 's' : ''} selected`}
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', lineHeight: 1.2 }}>
                Manage Locations
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => { setMapLocOpen(false); setActiveCard(null); }}
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Create new location */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              size="small"
              fullWidth
              label="New location name"
              placeholder="e.g. Mumbai Office"
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLoc()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ fontSize: 16, color: '#B45309' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreateLoc}
              disabled={createLocSaving || !newLocName.trim()}
              startIcon={createLocSaving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <Add />}
              sx={{
                background: 'linear-gradient(135deg, #B45309, #F59E0B)',
                whiteSpace: 'nowrap', borderRadius: 2, textTransform: 'none', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(180,83,9,0.3)',
                '&:hover': { opacity: 0.92 },
              }}
            >
              Create
            </Button>
          </Box>

          {/* Select a location header */}
          {(mapTarget || selected.length > 0) && (
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              Select a location to assign
            </Typography>
          )}

          {/* Locations grid */}
          {locLoading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={24} sx={{ color: '#B45309' }} /></Box>
          ) : locations.length === 0 ? (
            <Box sx={{ border: '2px dashed #FDE68A', borderRadius: 2.5, p: 4, textAlign: 'center', bgcolor: '#FFFBEB' }}>
              <LocationOn sx={{ fontSize: 36, color: '#FCD34D', mb: 0.75 }} />
              <Typography sx={{ color: '#92400E', fontSize: '0.825rem', fontWeight: 500 }}>
                No locations yet — create one above
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1.5}>
              {paginatedLocs.map((loc) => {
                const isSel   = Number(selectedLocId) === Number(loc.id);
                const isEditing = editingLocId === loc.id;
                const count   = userCountByLoc[loc.id] || 0;
                return (
                  <Grid item xs={12} sm={6} key={loc.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Box
                        onClick={() => !isEditing && setSelectedLocId(loc.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          border: `2px solid ${isSel ? '#F59E0B' : '#E5E7EB'}`,
                          bgcolor: isSel ? '#FFFBEB' : '#fff',
                          cursor: isEditing ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                          '&:hover': !isEditing ? {
                            border: `2px solid ${isSel ? '#F59E0B' : '#FCD34D'}`,
                            bgcolor: '#FFFBEB',
                          } : {},
                        }}
                      >
                        {isEditing ? (
                          <TextField
                            size="small" autoFocus fullWidth value={editingLocName}
                            onChange={(e) => setEditingLocName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditLoc();
                              if (e.key === 'Escape') { setEditingLocId(null); setEditingLocName(''); }
                            }}
                            onClick={(e) => e.stopPropagation()} sx={{ mb: 1 }} />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: isSel ? '#B45309' : '#9CA3AF', flexShrink: 0 }} />
                            <Typography sx={{
                              fontSize: '0.875rem', fontWeight: isSel ? 700 : 500,
                              color: isSel ? '#92400E' : '#374151', wordBreak: 'break-word', flex: 1,
                            }}>{loc.name}</Typography>
                            {count > 0 && (
                              <Chip label={count} size="small" sx={{
                                height: 18, fontSize: '0.6rem', fontWeight: 700,
                                bgcolor: '#F3F4F6', color: '#6B7280',
                                '& .MuiChip-label': { px: 0.75 },
                              }} />
                            )}
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
                          onClick={(e) => e.stopPropagation()}>
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
                                <IconButton size="small" sx={{ color: '#B45309', '&:hover': { bgcolor: '#FBF6E7' } }}
                                  onClick={() => { setEditingLocId(loc.id); setEditingLocName(loc.name); }}>
                                  <Edit sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={count > 0 ? 'Users assigned — cannot delete' : 'Delete'}>
                                <span>
                                  <IconButton size="small"
                                    sx={{ color: '#E01950', '&:hover': { bgcolor: '#FFF1F3' } }}
                                    disabled={(count || 0) > 0 || deleteLocSaving}
                                    onClick={() => { setLocToDelete(loc); setConfirmDelLocOpen(true); }}>
                                    <DeleteOutline sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Location pagination */}
          {locations.length > LOCATION_PER_PAGE && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                {locDialogPage * LOCATION_PER_PAGE + 1}–{Math.min((locDialogPage + 1) * LOCATION_PER_PAGE, locations.length)} of {locations.length}
              </Typography>
              <Stack direction="row" spacing={0.5}>
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
                      borderColor: locDialogPage === pg ? '#B45309' : '#E5E7EB',
                      bgcolor: locDialogPage === pg ? '#B45309' : 'transparent',
                      color: locDialogPage === pg ? '#fff' : '#374151',
                    }}>{pg + 1}
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

        {/* Delete location sub-dialog */}
        <Dialog open={confirmDelLocOpen} onClose={() => setConfirmDelLocOpen(false)} maxWidth="xs" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
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
          <Button variant="outlined" onClick={() => { setMapLocOpen(false); setActiveCard(null); }}
            sx={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: 2.5, textTransform: 'none' }}>
            Cancel
          </Button>
          {(mapTarget || selected.length > 0) && (
            <Button
              variant="contained"
              onClick={handleMapLoc}
              disabled={mapLocSaving || !selectedLocId}
              sx={{
                background: 'linear-gradient(135deg, #B45309, #F59E0B)',
                borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
                boxShadow: '0 4px 14px rgba(180,83,9,0.35)',
                '&:hover': { opacity: 0.92 },
                '&.Mui-disabled': { bgcolor: '#FDE68A', color: '#fff' },
              }}
            >
              {mapLocSaving ? 'Saving…' : 'Assign location'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* External dialogs */}
      <CreateUserDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setActiveCard(null); }}
        onSubmit={handleCreateUser}
        loading={createLoading}
        error={createError}
      />
      <BulkUploadDialog
        open={bulkOpen}
        onClose={() => { setBulkOpen(false); setActiveCard(null); }}
        onSuccess={fetchUsers}
      />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.action === 'delete' ? 'Delete user' : confirm.action === 'enable' ? 'Enable user' : 'Disable user'}
        message={
          confirm.action === 'delete'  ? 'This is permanent. The user will be removed.' :
          confirm.action === 'enable'  ? 'This user will be able to sign in again.' :
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
