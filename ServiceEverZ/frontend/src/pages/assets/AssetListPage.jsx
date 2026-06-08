import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress,
  Card, Grid, Chip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, TablePagination,
} from '@mui/material';
import SearchIcon          from '@mui/icons-material/Search';
import AddIcon             from '@mui/icons-material/Add';
import EditIcon            from '@mui/icons-material/Edit';
import DeleteIcon          from '@mui/icons-material/Delete';
import VisibilityIcon      from '@mui/icons-material/Visibility';
import UploadFileIcon      from '@mui/icons-material/UploadFile';
import WarningAmberIcon    from '@mui/icons-material/WarningAmber';
import InventoryIcon       from '@mui/icons-material/Inventory';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import BuildIcon           from '@mui/icons-material/Build';
import AssignmentIcon      from '@mui/icons-material/Assignment';
import { useNavigate }     from 'react-router-dom';
import {
  getAllAssets, deleteAsset, getAssetStats,
  searchAssets, getAssetsByStatus, getAssetsByCategory,
} from '../../api/assetApi';
import { AssetStatusChip, OwnershipChip } from '../../components/assets/AssetStatusChip';
import toast from '../../utils/toast';
 
const STATUSES   = ['AVAILABLE','ASSIGNED','UNDER_MAINTENANCE','RETIRED','LOST','RETURNED_TO_VENDOR'];
const CATEGORIES = ['LAPTOP','DESKTOP','MONITOR','PRINTER','PROJECTOR','SERVER','NETWORK_DEVICE','MOBILE','TABLET','PERIPHERAL','OTHER'];
 
function StatCard({ icon, label, value, color, bg }) {
  return (
    <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${color}`, borderRadius: '12px', height: '100%' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{value ?? '—'}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.3, lineHeight: 1.2 }}>{label}</Typography>
      </Box>
    </Card>
  );
}
 
export default function AssetListPage() {
  const navigate = useNavigate();
  const [assets, setAssets]       = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [keyword, setKeyword]     = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
 
  const fetchStats = useCallback(async () => {
    try { const r = await getAssetStats(); setStats(r.data.data); } catch {}
  }, []);
 
  const fetchAssets = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // Always fetch the full dataset first, then apply filters client-side.
      // This ensures category + status can be combined simultaneously.
      let res;
      if (keyword.trim()) res = await searchAssets(keyword.trim());
      else                res = await getAllAssets();
      const all = res.data.data || [];

      // Apply category and status filters together (client-side).
      const filtered = all.filter(a => {
        const matchCategory = !filterCategory || a.category === filterCategory;
        const matchStatus   = !filterStatus   || a.status   === filterStatus;
        return matchCategory && matchStatus;
      });
      setAssets(filtered);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load assets');
    } finally { setLoading(false); }
  }, [keyword, filterStatus, filterCategory]);
 
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchAssets(); setPage(0); }, [fetchAssets]);
 
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAsset(deleteId);
      setDeleteId(null);
      fetchAssets();
      fetchStats();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };
 
  return (
    <Box sx={{ p: 2 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A' }}>Asset Management</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666', mt: 0.3 }}>Manage all company assets — owned and rental</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => navigate('/assets/bulk-import')}
            sx={{ borderColor: '#27235C', color: '#27235C', '&:hover': { borderColor: '#1B193F', backgroundColor: '#F0EFFA' } }}>
            Bulk Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/asset/add')}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}>
            Add Asset
          </Button>
        </Box>
      </Box>
 
      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<InventoryIcon fontSize="small" />}   label="Total"        value={stats.totalAssets}            color="#27235C" bg="#EDEDF7" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<CheckCircleIcon fontSize="small" />} label="Available"    value={stats.availableAssets}        color="#24A148" bg="#E8F5E9" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<AssignmentIcon fontSize="small" />}  label="Assigned"     value={stats.assignedAssets}         color="#97247E" bg="#F9EEF7" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<BuildIcon fontSize="small" />}       label="Maintenance"  value={stats.underMaintenanceAssets} color="#E2B93B" bg="#FFF8E1" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<InventoryIcon fontSize="small" />}   label="Owned"        value={stats.ownedAssets}            color="#27235C" bg="#EDEDF7" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<WarningAmberIcon fontSize="small" />} label="Rental Expiring" value={stats.rentalExpiringSoon} color="#E01950" bg="#FDEEF2" />
          </Grid>
        </Grid>
      )}
 
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search assets…"
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setFilterStatus(''); setFilterCategory(''); }}
          size="small"
          sx={{ minWidth: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#888' }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={filterCategory} label="Category" onChange={e => { setFilterCategory(e.target.value); setKeyword(''); }}>
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => { setFilterStatus(e.target.value); setKeyword(''); }}>
            <MenuItem value="">All Statuses</MenuItem>
            {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        {(keyword || filterStatus || filterCategory) && (
          <Button size="small" onClick={() => { setKeyword(''); setFilterStatus(''); setFilterCategory(''); }}
            sx={{ color: '#E01950' }}>
            Clear
          </Button>
        )}
        <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: '#666' }}>
            {assets.length} asset{assets.length !== 1 ? 's' : ''}
            {(filterCategory || filterStatus) && (
              <span style={{ color: '#97247E', fontWeight: 600 }}> (filtered)</span>
            )}
          </Typography>
      </Paper>
 
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
 
      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Asset Tag','Name','Category','Brand / Model','Location','Status','Ownership','Actions'].map(h => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell></TableRow>
            ) : assets.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#888' }}>No assets found</TableCell></TableRow>
            ) : assets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(a => (
              <TableRow key={a.id} hover>
                <TableCell>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#27235C' }}>{a.assetTag}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{a.name}</Typography>
                  {a.serialNumber && <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>S/N: {a.serialNumber}</Typography>}
                </TableCell>
                <TableCell>
                  <Chip label={a.category?.replace(/_/g,' ')} size="small" sx={{ fontSize: '0.7rem', backgroundColor: '#F4F4F6' }} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#444' }}>
                  {[a.brand, a.model].filter(Boolean).join(' · ') || '—'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#444' }}>{a.location || '—'}</TableCell>
                <TableCell><AssetStatusChip status={a.status} /></TableCell>
                <TableCell><OwnershipChip type={a.ownershipType} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => navigate(`/assets/${a.id}`)} sx={{ color: '#27235C' }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/assets/edit/${a.id}`)} sx={{ color: '#97247E' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleteId(a.id)} sx={{ color: '#E01950' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={assets.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: '1px solid #F0F0F0', '.MuiTablePagination-toolbar': { minHeight: 48 } }}
        />
      </TableContainer>
 
      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#E01950' }}>Delete Asset?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone. The asset record will be permanently removed.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ backgroundColor: '#E01950', '&:hover': { backgroundColor: '#B0102E' } }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
 
 