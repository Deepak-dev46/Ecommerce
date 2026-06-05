import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Button, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText,
  IconButton, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AssetStatusChip } from '../../components/common/AssetStatusChip';
import AssetForm from '../../components/asset/AssetForm';
import AssetDetailPanel from '../../components/asset/AssetDetailPanel';
import { getAllAssets, deleteAsset } from '../../api/assetApi';
import toast from '../../utils/toast';
 
const STATUS_FILTER_OPTIONS = ['ALL', 'AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'RETIRED', 'LOST', 'RETURNED_TO_VENDOR'];
const CATEGORY_OPTIONS = ['ALL', 'LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'PROJECTOR', 'SERVER', 'NETWORK_DEVICE', 'MOBILE', 'TABLET', 'PERIPHERAL', 'OTHER'];
 
const TABLE_HEAD_SX = {
  backgroundColor: '#1B1F5E',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.72rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderBottom: 'none',
  whiteSpace: 'nowrap',
};
 
export default function AssetManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
 
  // ✅ Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
 
  useEffect(() => { loadAssets(); }, []);
 
  const loadAssets = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getAllAssets();
      setAssets(res.data?.data || res.data || []);
    } catch {
      setAssets([]);
      setErrorMsg('Failed to load assets');
    }
    setLoading(false);
  };
 
  // ✅ Step 1: Open confirmation dialog
  const handleDeleteRequest = (asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };
 
  // ✅ Step 2: Cancel — close dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };
 
  // ✅ Step 3: Confirm — execute delete
  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    setDeleteDialogOpen(false);
    try {
      await deleteAsset(assetToDelete.id);
      toast.success(`Asset "${assetToDelete.name}" deleted successfully.`);
      setSelected(null);
      setDetailOpen(false);
      loadAssets();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed.');
    } finally {
      setAssetToDelete(null);
    }
  };
 
  const filtered = assets.filter(a => {
    const matchSearch =
      !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag?.toLowerCase().includes(search.toLowerCase()) ||
      a.brand?.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });
 
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#F4F4F8',
      }}
    >
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1B1F5E', lineHeight: 1.2 }}>
            Asset Management
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#6b6b8a', mt: 0.3 }}>
            Manage all company assets — owned and rental
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/support/asset-service/bulk-import')}
            sx={{
              borderColor: '#1B1F5E', color: '#1B1F5E', fontWeight: 600, borderRadius: 2,
              '&:hover': { borderColor: '#97247E', color: '#97247E', backgroundColor: '#fdf4fc' },
            }}
          >
            Bulk Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/support/asset')}
            sx={{
              backgroundColor: '#1B1F5E', borderRadius: 2, fontWeight: 700,
              '&:hover': { backgroundColor: '#13174a' },
            }}
          >
            Add Asset
          </Button>
        </Box>
      </Box>
 
      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0dff0', borderRadius: 2, px: 2.5, py: 1.8, mb: 1.5,
          display: 'flex', alignItems: 'center', gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search assets..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 260, backgroundColor: '#fafafa', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#aaa' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter} label="Category"
            onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
            sx={{ backgroundColor: '#fafafa' }}
          >
            {CATEGORY_OPTIONS.map(c => (
              <MenuItem key={c} value={c}>{c === 'ALL' ? 'All Categories' : c.replace(/_/g, ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter} label="Status"
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            sx={{ backgroundColor: '#fafafa' }}
          >
            {STATUS_FILTER_OPTIONS.map(s => (
              <MenuItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ ml: 'auto' }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#888', fontWeight: 500 }}>
            {filtered.length} asset{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>
 
      {/* Error Alert */}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 1.5, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}
 
      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e0dff0', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['Asset Tag', 'Name', 'Category', 'Brand / Model', 'Location', 'Status', 'Ownership', 'Actions'].map(col => (
                  <TableCell key={col} sx={TABLE_HEAD_SX}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: '#aaa' }}>Loading…</TableCell>
                </TableRow>
              )}
              {!loading && paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: '#aaa' }}>No assets found</TableCell>
                </TableRow>
              )}
              {!loading && paginated.map(a => (
                <TableRow
                  key={a.id}
                  hover
                  onClick={() => { setSelected(a); setDetailOpen(true); }}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f4fb' } }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#97247E', fontSize: '0.75rem' }}>{a.assetTag}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{a.name}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{a.category?.replace(/_/g, ' ')}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem', color: '#555' }}>
                    {[a.brand, a.model].filter(Boolean).join(' / ') || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.78rem', color: '#555' }}>{a.location || '—'}</TableCell>
                  <TableCell><AssetStatusChip status={a.status} /></TableCell>
                  <TableCell>
                    <Box component="span" sx={{
                      px: 1.2, py: 0.3, borderRadius: 1, fontSize: '0.68rem', fontWeight: 700,
                      backgroundColor: a.ownershipType === 'RENTAL' ? '#F9EEFA' : '#EEEDF8',
                      color: a.ownershipType === 'RENTAL' ? '#97247E' : '#27235C',
                    }}>
                      {a.ownershipType}
                    </Box>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate('/support/asset')}
                        sx={{
                          fontSize: '0.68rem', px: 1.2, py: 0.3, minWidth: 0,
                          borderColor: '#1B1F5E', color: '#1B1F5E',
                          '&:hover': { borderColor: '#97247E', color: '#97247E' },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDeleteRequest(a)}
                        sx={{
                          fontSize: '0.68rem', px: 1.2, py: 0.3, minWidth: 0,
                          borderColor: '#E01950', color: '#E01950',
                          '&:hover': { backgroundColor: '#fff0f3' },
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
 
        {/* Pagination */}
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          sx={{
            borderTop: '1px solid #e0dff0',
            '.MuiTablePagination-toolbar': { minHeight: 48 },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
          }}
        />
      </Paper>
 
      {/* ✅ Delete Confirmation Dialog — matches sample image */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 0.5 }}>
          <WarningAmberIcon sx={{ color: '#E6A817', fontSize: '1.8rem' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B1F5E' }}>
            Delete Asset
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1, pt: 1 }}>
          <DialogContentText sx={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#1B1F5E' }}>
              "{assetToDelete?.name}"
            </Box>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleDeleteCancel}
            sx={{
              borderRadius: 2,
              borderColor: '#ccc',
              color: '#555',
              fontWeight: 600,
              px: 3,
              '&:hover': { borderColor: '#aaa', backgroundColor: '#f9f9f9' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            sx={{
              borderRadius: 2,
              backgroundColor: '#E01950',
              fontWeight: 700,
              px: 3,
              '&:hover': { backgroundColor: '#b5133e' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* Asset Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <span>Asset Details</span>
          <IconButton onClick={() => setDetailOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selected && (
            <AssetDetailPanel
              asset={selected}
              onEdit={() => { setDetailOpen(false); setEditAsset(selected); setFormOpen(true); }}
              onDelete={() => { setDetailOpen(false); handleDeleteRequest(selected); }}
            />
          )}
        </DialogContent>
      </Dialog>
 
      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <span>{editAsset ? 'Edit Asset' : 'Add New Asset'}</span>
          <IconButton onClick={() => setFormOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <AssetForm
            setOpen={formOpen}
            prefill={editAsset}
            assetId={editAsset?.id}
            onSuccess={() => { setFormOpen(false); loadAssets(); setSelected(null); }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
 