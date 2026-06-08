import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, Paper, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Collapse, Chip, Tooltip,
} from '@mui/material';
import AddIcon        from '@mui/icons-material/Add';
import EditIcon       from '@mui/icons-material/Edit';
import DeleteIcon     from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  getAllCategories, createCategory, updateCategory, deactivateCategory,
  createSubCategory, updateSubCategory, deactivateSubCategory,
} from '../../api/problemApi';
import toast from '../../utils/toast';

function CategoryRow({ cat, onEdit, onDelete, onAddSub, onEditSub, onDeleteSub }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.name}</Typography></TableCell>
        <TableCell><Typography variant="body2" sx={{ color: '#6B7280' }}>{cat.description}</Typography></TableCell>
        <TableCell>
          <Chip label={cat.active !== false ? 'Active' : 'Inactive'} size="small"
            sx={{ backgroundColor: cat.active !== false ? '#D1FAE5' : '#E5E7EB', color: cat.active !== false ? '#065F46' : '#374151', fontWeight: 700, fontSize: '0.65rem' }} />
        </TableCell>
        <TableCell align="right">
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={() => onAddSub(cat)}
            sx={{
              borderColor: '#27235C', color: '#27235C', mr: 0.5,
              fontSize: '0.7rem', py: 0.3, px: 1, minWidth: 0,
              '&:hover': { backgroundColor: '#F5F3FF', borderColor: '#27235C' },
            }}
          >
            Add Sub Category
          </Button>
          <IconButton size="small" onClick={() => onEdit(cat)} sx={{ color: '#D97706' }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => onDelete(cat.id)} sx={{ color: '#DC2626' }}><DeleteIcon fontSize="small" /></IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ pl: 6, pr: 2, pb: 1, background: '#F9FAFB' }}>
              {cat.subCategories?.length === 0 && (
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>No sub-categories</Typography>
              )}
              {cat.subCategories?.map((sub) => (
                <Stack key={sub.id} direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ py: 0.5, borderBottom: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{sub.name}</Typography>
                  <Stack direction="row">
                    <IconButton size="small" onClick={() => onEditSub(sub, cat.id)} sx={{ color: '#D97706' }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                    <IconButton size="small" onClick={() => onDeleteSub(sub.id)} sx={{ color: '#DC2626' }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Stack>
                </Stack>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ProblemCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [dialog, setDialog]         = useState(null); // { mode: 'cat'|'subcat', data?, parentCatId? }
  const [form, setForm]             = useState({ name: '', description: '' });
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories(false);
      setCategories(res.data?.data ?? []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCatDialog   = (cat = null) => { setForm({ name: cat?.name ?? '', description: cat?.description ?? '' }); setDialog({ mode: 'cat', data: cat }); };
  const openSubDialog   = (sub = null, parentCatId) => { setForm({ name: sub?.name ?? '', description: sub?.description ?? '' }); setDialog({ mode: 'subcat', data: sub, parentCatId }); };
  const closeDialog     = () => { setDialog(null); setForm({ name: '', description: '' }); };

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

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C' }}>Problem Categories</Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>Manage problem categories and sub-categories</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCatDialog()}
          sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}>
          New Category
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40} />
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#9CA3AF' }}>No categories yet</TableCell></TableRow>
              ) : categories.map((cat) => (
                <CategoryRow key={cat.id} cat={cat}
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

      {/* Add/Edit Dialog */}
      <Dialog open={!!dialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog?.data
            ? `Edit ${dialog?.mode === 'cat' ? 'Category' : 'Sub-category'}`
            : `New ${dialog?.mode === 'cat' ? 'Category' : 'Sub-category'}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name *" size="small" fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label="Description" size="small" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
