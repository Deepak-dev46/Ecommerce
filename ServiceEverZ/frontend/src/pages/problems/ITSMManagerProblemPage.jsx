import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Button, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Tooltip, IconButton, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Collapse,
} from '@mui/material';
import SearchIcon      from '@mui/icons-material/Search';
import RefreshIcon     from '@mui/icons-material/Refresh';
import CategoryIcon    from '@mui/icons-material/Category';
import AddIcon         from '@mui/icons-material/Add';
import EditIcon        from '@mui/icons-material/Edit';
import ExpandMoreIcon  from '@mui/icons-material/ExpandMore';
import ExpandLessIcon  from '@mui/icons-material/ExpandLess';
import CloseIcon       from '@mui/icons-material/Close';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import {
  getAllProblems, getProblemById, searchProblems,
  getAllCategories, createCategory, updateCategory, deactivateCategory,
  createSubCategory, updateSubCategory, deactivateSubCategory,
} from '../../api/problemApi';
import { ProblemStatusChip, PriorityChip, ImpactChip } from '../../components/problem/ProblemStatusChip';
import ProblemDetailPanel from '../../components/problem/ProblemDetailPanel';
import toast from '../../utils/toast';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ALL_STATUSES = [
  'All', 'LOGGED', 'UNDER_INVESTIGATION', 'RCA_IN_PROGRESS',
  'WORKAROUND_PROVIDED', 'KNOWN_ERROR', 'CLOSED',
];

const TAB_LABELS = {
  All:                  'All',
  LOGGED:               'Logged',
  UNDER_INVESTIGATION:  'Investigating',
  RCA_IN_PROGRESS:      'RCA',
  WORKAROUND_PROVIDED:  'Workaround',
  KNOWN_ERROR:          'Known Error',
  CLOSED:               'Closed',
};

const PRIORITIES = ['All', 'LOW', 'MEDIUM', 'HIGH'];
const IMPACTS    = ['All', 'LOW', 'MEDIUM', 'HIGH'];
const fmt = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

// ─── Category Row ──────────────────────────────────────────────────────────────
function CategoryRow({ cat, onEdit, onAddSub, onEditSub }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ pl: 1, pr: 0, width: 36 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.name}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>{cat.description || '—'}</Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={cat.active !== false ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              backgroundColor: cat.active !== false ? '#D1FAE5' : '#E5E7EB',
              color: cat.active !== false ? '#065F46' : '#374151',
              fontWeight: 700, fontSize: '0.65rem',
            }}
          />
        </TableCell>
        <TableCell align="right" sx={{ pr: 1 }}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
              onClick={() => onAddSub(cat)}
              sx={{
                borderColor: '#27235C', color: '#27235C',
                fontSize: '0.7rem', py: 0.3, px: 1, minWidth: 0,
                borderRadius: '6px',
                '&:hover': { backgroundColor: '#F5F3FF', borderColor: '#27235C' },
              }}
            >
              Add Sub
            </Button>
            <IconButton size="small" onClick={() => onEdit(cat)} sx={{ color: '#D97706' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ pl: 7, pr: 2, pb: 1, background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {(!cat.subCategories || cat.subCategories.length === 0) ? (
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>No sub-categories</Typography>
              ) : cat.subCategories.map((sub) => (
                <Stack key={sub.id} direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ py: 0.5, borderBottom: '1px solid #E5E7EB', '&:last-child': { borderBottom: 0 } }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{sub.name}</Typography>
                  <IconButton size="small" onClick={() => onEditSub(sub, cat.id)} sx={{ color: '#D97706' }}>
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ─── Category Dialog ────────────────────────────────────────────────────────────
function CategoryDialog({ open, dialog, form, setForm, onClose, onSave, saving }) {
  if (!open) return null;
  const isEdit = !!dialog?.data;
  const isSub  = dialog?.mode === 'subcat';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? `Edit ${isSub ? 'Sub-category' : 'Category'}` : `New ${isSub ? 'Sub-category' : 'Category'}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Name *" size="small" fullWidth
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Description" size="small" fullWidth multiline rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          onClick={onSave} variant="contained" disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Category Slide-in Panel ────────────────────────────────────────────────────
function CategoryPanel({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [dialog, setDialog]         = useState(null);
  const [form, setForm]             = useState({ name: '', description: '' });
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await getAllCategories(false);
      setCategories(res.data?.data ?? []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, [open]);

  useEffect(() => { load(); }, [load]);

  const openCatDialog  = (cat = null)             => { setForm({ name: cat?.name ?? '', description: cat?.description ?? '' }); setDialog({ mode: 'cat',    data: cat }); };
  const openSubDialog  = (sub = null, parentCatId) => { setForm({ name: sub?.name ?? '', description: sub?.description ?? '' }); setDialog({ mode: 'subcat', data: sub, parentCatId }); };
  const closeDialog    = ()                        => { setDialog(null); setForm({ name: '', description: '' }); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (dialog.mode === 'cat') {
        if (dialog.data) await updateCategory(dialog.data.id, form);
        else             await createCategory(form);
      } else {
        const payload = { ...form, categoryId: dialog.parentCatId };
        if (dialog.data) await updateSubCategory(dialog.data.id, payload);
        else             await createSubCategory(payload);
      }
      toast.success('Saved successfully');
      closeDialog();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try { await deactivateCategory(id); toast.success('Deactivated'); load(); }
    catch { toast.error('Failed to deactivate'); }
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Deactivate this sub-category?')) return;
    try { await deactivateSubCategory(id); toast.success('Deactivated'); load(); }
    catch { toast.error('Failed to deactivate'); }
  };

  if (!open) return null;

  return (
    <>
      <Box
        onClick={onClose}
        sx={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.35)' }}
      />
      <Box
        sx={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: { xs: '100%', sm: 580 },
          zIndex: 1300,
          backgroundColor: '#fff',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Panel Header */}
        <Box
          sx={{
            px: 3, py: 2.5,
            background: 'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
              Problem Categories
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
              Manage categories and sub-categories
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained" size="small" startIcon={<AddIcon />}
              onClick={() => openCatDialog()}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
              }}
            >
              New Category
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.75)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Panel Body */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                    <TableCell width={36} sx={{ pl: 1 }} />
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', pr: 1 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#9CA3AF' }}>
                        No categories yet. Click "New Category" to get started.
                      </TableCell>
                    </TableRow>
                  ) : categories.map((cat) => (
                    <CategoryRow
                      key={cat.id} cat={cat}
                      onEdit={openCatDialog}
                      onDelete={handleDeleteCat}
                      onAddSub={(c) => openSubDialog(null, c.id)}
                      onEditSub={(sub, catId) => openSubDialog(sub, catId)}
                      onDeleteSub={handleDeleteSub}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      <CategoryDialog
        open={!!dialog} dialog={dialog}
        form={form} setForm={setForm}
        onClose={closeDialog} onSave={handleSave} saving={saving}
      />
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function ITSMManagerProblemPage() {
  const [tab, setTab]                 = useState('All');
  const [problems, setProblems]       = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState('');
  const [priorityFilter, setPriority] = useState('All');
  const [impactFilter, setImpact]     = useState('All');
  const [loading, setLoading]         = useState(false);
  const [selected, setSelected]       = useState(null);
  const [detail, setDetail]           = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [catPanelOpen, setCatPanelOpen]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllProblems();
      setProblems(res.data?.data ?? []);
    } catch {
      setProblems([]);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = problems;
    if (tab !== 'All')            list = list.filter((p) => p.status === tab);
    if (priorityFilter !== 'All') list = list.filter((p) => p.priority === priorityFilter);
    if (impactFilter !== 'All')   list = list.filter((p) => p.impact === impactFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.problemNumber?.toLowerCase().includes(q) ||
          p.createdBySpName?.toLowerCase().includes(q),
      );
    }
    setFiltered(list);
  }, [problems, tab, search, priorityFilter, impactFilter]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length >= 3) {
      try {
        const res = await searchProblems(val.trim());
        const list = res.data?.data ?? [];
        setFiltered(tab === 'All' ? list : list.filter((p) => p.status === tab));
      } catch { /* fall back to client filter */ }
    }
  };

  const selectRow = async (row) => {
    setSelected(row);
    setDetailLoading(true);
    try {
      const res = await getProblemById(row.id);
      setDetail(res.data?.data ?? row);
    } catch {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefresh = () => { load(); if (selected) selectRow(selected); };
  const countFor = (s) => s === 'All' ? problems.length : problems.filter((p) => p.status === s).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: '#F4F4F6' }}>

      {/* ── Page Header ── */}
      <Box
        sx={{
          px: 3, pt: 2.5, pb: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        {/* Title row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          {/* Left: icon + text */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
           
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#27235C', lineHeight: 1.2 }}>
                Problem Management
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                Monitor all problems across every lifecycle stage
              </Typography>
            </Box>
          </Stack>

          {/* Right: action buttons — proper flexbox, no absolute positioning */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Manage Categories">
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => setCatPanelOpen(true)}
                sx={{
                  borderColor: '#27235C', color: '#27235C',
                  borderRadius: '8px', fontWeight: 600,
                  '&:hover': { backgroundColor: '#F5F3FF', borderColor: '#27235C' },
                }}
              >
                Manage Categories
              </Button>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                size="small"
                sx={{ width: 36, height: 36, border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#fff' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* ── Status Tabs ── */}
        <Stack
          direction="row"
          sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            gap: 0.5,
            pb: 0,
          }}
        >
          {ALL_STATUSES.map((s) => {
            const count  = countFor(s);
            const active = tab === s;
            return (
              <Box
                key={s}
                onClick={() => setTab(s)}
                sx={{
                  px: 1.75, pb: 1.25, pt: 0.25,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderBottom: active ? '2px solid #27235C' : '2px solid transparent',
                  mb: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  transition: 'border-color 0.15s',
                  '&:hover': {
                    borderBottomColor: active ? '#27235C' : '#A5B4FC',
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: active ? 700 : 500, color: active ? '#27235C' : '#6B7280', fontSize: '0.78rem' }}
                >
                  {TAB_LABELS[s]}
                </Typography>
                {count > 0 && (
                  <Box
                    component="span"
                    sx={{
                      px: 0.8, py: 0.1, minWidth: 18, textAlign: 'center',
                      background: active ? '#27235C' : '#E5E7EB',
                      color:      active ? '#fff'    : '#374151',
                      borderRadius: 10,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      lineHeight: '16px',
                      display: 'inline-block',
                    }}
                  >
                    {count}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Table Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>

          {/* Search + Filters row */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: 2, flexShrink: 0,
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              px: 1.5, py: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by title, number, SP…"
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: '1 1 200px', maxWidth: 340,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />

            <Box sx={{ width: 0, height: 24, backgroundColor: '#E5E7EB', flexShrink: 0 }} />

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={priorityFilter}
                onChange={(e) => setPriority(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p === 'All' ? 'All Priorities' : p.charAt(0) + p.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Impact</InputLabel>
              <Select
                label="Impact"
                value={impactFilter}
                onChange={(e) => setImpact(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                {IMPACTS.map((i) => (
                  <MenuItem key={i} value={i}>
                    {i === 'All' ? 'All Impacts' : i.charAt(0) + i.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" sx={{ color: '#6B7280', ml: 'auto !important', whiteSpace: 'nowrap' }}>
              {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No problems found</Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', flex: 1, overflow: 'auto' }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {['Number', 'Title', 'Status', 'Priority', 'Impact', 'Assigned SP', 'Created'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          backgroundColor: '#27235C',
                          color: '#fff',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((p) => {
                    const isSelected = selected?.id === p.id;
                    return (
                      <TableRow
                        key={p.id}
                        hover
                        selected={isSelected}
                        onClick={() => selectRow(p)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#EEF2FF' : undefined,
                          borderLeft: isSelected ? '3px solid #27235C' : '3px solid transparent',
                          '&:hover': { backgroundColor: '#F5F5FF' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#27235C' }}>
                            {p.problemNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {p.title}
                          </Typography>
                        </TableCell>
                        <TableCell><ProblemStatusChip status={p.status} /></TableCell>
                        <TableCell><PriorityChip priority={p.priority} /></TableCell>
                        <TableCell><ImpactChip impact={p.impact} /></TableCell>
                        <TableCell>
                          <Typography variant="caption">{p.createdBySpName ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{fmt(p.createdAt)}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Detail Panel */}
        {selected && (
          detailLoading ? (
            <Box
              sx={{
                width: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderLeft: '1px solid #E5E7EB', flexShrink: 0, backgroundColor: '#fff',
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : (
            <ProblemDetailPanel
              problem={detail ?? selected}
              onClose={() => { setSelected(null); setDetail(null); }}
              onRefresh={handleRefresh}
            />
          )
        )}
      </Box>

      {/* Category Panel */}
      <CategoryPanel open={catPanelOpen} onClose={() => setCatPanelOpen(false)} />
    </Box>
  );
}
