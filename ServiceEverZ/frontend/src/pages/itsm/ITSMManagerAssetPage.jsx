import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Divider, Grid, IconButton, Tooltip, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Card, TablePagination,
  Drawer,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DevicesIcon from '@mui/icons-material/Devices';
import { useAuth } from '../../context/AuthContext';
import {
  getPendingManagerApprovals, getAllMappings,
  managerDecision, getAssetById, getMappingsByAsset,
} from '../../api/assetApi';
import { MappingStatusChip, AssetStatusChip, OwnershipChip } from '../../components/assets/AssetStatusChip';
import toast from '../../utils/toast';
 
const STATUSES = ['PENDING_MANAGER_APPROVAL', 'MANAGER_APPROVED', 'ACTIVE', 'REJECTED_BY_MANAGER', 'REJECTED_BY_SP', 'SP_APPROVED'];
 
const BRAND  = '#27235C';
const ACCENT = '#97247E';
const BORDER = '#E8E8F0';
 
/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color, bg }) {
  return (
    <Card sx={{
      p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
      borderLeft: `4px solid ${color}`, borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: '10px',
        backgroundColor: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>
          {value ?? '—'}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.3 }}>{label}</Typography>
      </Box>
    </Card>
  );
}
 
/* ─── Asset Detail Drawer Content ───────────────────────────────────────── */
function AssetDetailDrawerContent({ assetId, mapping, onClose, onApprove, onReject }) {
  const [asset,    setAsset]   = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');
 
  useEffect(() => {
    if (!assetId) return;
    setLoading(true); setError(''); setAsset(null); setMappings([]);
    Promise.all([getAssetById(assetId), getMappingsByAsset(assetId)])
      .then(([a, m]) => {
        setAsset(a.data.data);
        setMappings(m.data.data || []);
      })
      .catch(() => setError('Failed to load asset details'))
      .finally(() => setLoading(false));
  }, [assetId]);
 
  /* ── shared sub-components ── */
  const InfoRow = ({ label, value }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 0.8, borderBottom: `1px solid ${BORDER}` }}>
        <Typography sx={{
          fontSize: '0.73rem', color: '#888', fontWeight: 600,
          minWidth: 140, maxWidth: 140, flexShrink: 0, pr: 1,
          lineHeight: 1.5, letterSpacing: '0.01em', textTransform: 'uppercase',
        }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.83rem', color: '#1A1A1A', fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>
          {String(value)}
        </Typography>
      </Box>
    );
  };
 
  const SectionTitle = ({ children, color = BRAND }) => (
    <Typography sx={{
      fontSize: '0.68rem', fontWeight: 800, color,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      mb: 1, pb: 0.5, borderBottom: `2px solid ${color}28`,
    }}>
      {children}
    </Typography>
  );
 
  /* ── Loading / Error states ── */
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
      <CircularProgress size={36} sx={{ color: ACCENT }} />
    </Box>
  );
  if (error || !asset) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error || 'Asset not found'}</Alert>
    </Box>
  );
 
  const isRental = asset.ownershipType === 'RENTAL';
 
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
 
      {/* ── Drawer Header ── */}
      <Box sx={{
        px: 3, py: 2,
        borderBottom: `1px solid ${BORDER}`,
        background: `linear-gradient(135deg, ${BRAND}08 0%, ${BRAND}03 100%)`,
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Mapping context */}
            {mapping && (
              <Typography sx={{ fontSize: '0.7rem', color: ACCENT, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5 }}>
                Mapping: <span style={{ fontFamily: 'monospace', color: BRAND }}>{mapping.mappingNumber}</span>
                {mapping.ticketId && <span style={{ color: '#888', fontWeight: 500 }}> · Ticket #{mapping.ticketId}</span>}
              </Typography>
            )}
            {/* Asset name + chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                background: `linear-gradient(135deg, ${BRAND}20, ${BRAND}10)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <DevicesIcon sx={{ color: BRAND, fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A1A2E', letterSpacing: '-0.01em' }}>
                {asset.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 0.5 }}>
              <AssetStatusChip status={asset.status} />
              <OwnershipChip type={asset.ownershipType} />
              {asset.assetTag && (
                <Chip
                  label={asset.assetTag}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#555', border: `1px solid ${BORDER}` }}
                />
              )}
              {asset.serialNumber && (
                <Chip
                  label={`S/N: ${asset.serialNumber}`}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontSize: '0.68rem', backgroundColor: '#F3F4F6', color: '#777', border: `1px solid ${BORDER}` }}
                />
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#888', flexShrink: 0, mt: 0.3 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
 
        {/* Approve / Reject actions — only shown when pending */}
        {mapping?.status === 'PENDING_MANAGER_APPROVAL' && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
              onClick={onReject}
              sx={{
                fontSize: '0.78rem', textTransform: 'none', fontWeight: 600,
                borderColor: '#E01950', color: '#E01950', borderRadius: '8px',
                '&:hover': { backgroundColor: '#FDEEF2' },
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
              onClick={onApprove}
              sx={{
                fontSize: '0.78rem', textTransform: 'none', fontWeight: 600,
                backgroundColor: '#24A148', borderRadius: '8px',
                '&:hover': { backgroundColor: '#1A7A38' },
              }}
            >
              Approve
            </Button>
          </Box>
        )}
      </Box>
 
      {/* ── Scrollable body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
 
        {/* Asset Info */}
        <Box sx={{ mb: 3 }}>
          <SectionTitle>Asset Info</SectionTitle>
          <InfoRow label="Category"    value={asset.category?.replace(/_/g, ' ')} />
          <InfoRow label="Brand"       value={asset.brand} />
          <InfoRow label="Model"       value={asset.model} />
          <InfoRow label="Location"    value={asset.location} />
          <InfoRow label="Added by SP" value={asset.addedBySpName || (asset.addedBySpId ? `SP #${asset.addedBySpId}` : null)} />
          <InfoRow label="Assigned To" value={asset.assignedToUserName || (asset.assignedToUserId ? `User #${asset.assignedToUserId}` : null)} />
          {asset.notes && (
            <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#FAFBFF', borderRadius: '8px', border: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.4 }}>
                Notes
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#444', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {asset.notes}
              </Typography>
            </Box>
          )}
        </Box>
 
        <Divider sx={{ borderColor: BORDER, mb: 3 }} />
 
        
  
        {/* Ownership / Rental Info */}
        <Box sx={{ mb: 3 }}>
          <SectionTitle color={isRental ? ACCENT : BRAND}>
            {isRental ? 'Rental Details' : 'Ownership Details'}
          </SectionTitle>
          {!isRental ? (
            <>
              <InfoRow label="Purchase Date"   value={asset.purchaseDate} />
              <InfoRow label="Purchase Cost"   value={asset.purchaseCost ? `₹${Number(asset.purchaseCost).toLocaleString()}` : null} />
              <InfoRow label="Warranty Expiry" value={asset.warrantyExpiryDate} />
              <InfoRow label="Depreciation"    value={asset.depreciationRatePercent ? `${asset.depreciationRatePercent}%` : null} />
            </>
          ) : (
            <>
              <InfoRow label="Vendor"       value={asset.rentalVendorName} />
              <InfoRow label="Contact"      value={asset.rentalVendorContact} />
              <InfoRow label="Contract No." value={asset.rentalContractNumber} />
              <InfoRow label="Start Date"   value={asset.rentalStartDate} />
              <InfoRow label="End Date"     value={asset.rentalEndDate} />
              <InfoRow label="Monthly Cost" value={asset.rentalCostPerMonth ? `₹${Number(asset.rentalCostPerMonth).toLocaleString()}` : null} />
              <InfoRow label="Renewal"      value={asset.rentalRenewalOption != null ? (asset.rentalRenewalOption ? 'Yes' : 'No') : null} />
              {asset.rentalExpiringSoon && (
                <Box sx={{ mt: 1.5, px: 1.5, py: 1, backgroundColor: '#FDEEF2', borderRadius: '8px', border: '1px solid #E0195022' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#E01950', fontWeight: 700 }}>
                    ⚠ Rental expiring within 30 days
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
 
        {/* Mapping History */}
        {mappings.length > 0 && (
          <>
            <Divider sx={{ borderColor: BORDER, mb: 3 }} />
            <Box sx={{ mb: 1 }}>
              <SectionTitle>Mapping History ({mappings.length})</SectionTitle>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#FAFAFC' }}>
                      {['Mapping #', 'Requested By', 'SP', 'Status', 'Created'].map(h => (
                        <TableCell key={h} sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#555', py: 1, letterSpacing: '0.03em' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappings.map(m => (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600, color: BRAND }}>
                          {m.mappingNumber}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }}>{m.requestedByUserId}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }}>{m.assignedBySpId || '—'}</TableCell>
                        <TableCell><MappingStatusChip status={m.status} /></TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
 
/* ─── Approve Confirmation Dialog ───────────────────────────────────────── */
function ApproveConfirmDialog({ open, mapping, onClose, onConfirm, loading }) {
  if (!mapping) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#24A148', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon /> Confirm Approval
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#F0FFF4', borderRadius: '8px', border: '1px solid #b7ebc8' }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#27235C' }}>
            Asset: {mapping.assetName || mapping.assetId}
            {mapping.assetTag && (
              <span style={{ color: '#888', fontFamily: 'monospace', marginLeft: 8 }}>{mapping.assetTag}</span>
            )}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#666', mt: 0.3 }}>
            Mapping: {mapping.mappingNumber} · Ticket #{mapping.ticketId} · Requested by User #{mapping.requestedByUserId}
          </Typography>
        </Box>
        <Alert severity="success" sx={{ fontSize: '0.82rem' }}>
          Are you sure you want to <strong>approve</strong> this asset assignment? This will set the asset status to <strong>ACTIVE</strong>.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => { onConfirm('approve', ''); onClose(); }}
          disabled={loading}
          startIcon={<CheckCircleIcon />}
          sx={{ backgroundColor: '#24A148', '&:hover': { backgroundColor: '#1a7a36' } }}
        >
          {loading ? 'Processing…' : 'Confirm Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 /* ─── Reject Reason Dialog ───────────────────────────────────────────────── */
function RejectReasonDialog({ open, mapping, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const [error,  setError]  = useState('');
  const handleClose  = () => { setReason(''); setError(''); onClose(); };
  const handleSubmit = () => {
    if (!reason.trim()) { setError('Rejection reason is required'); return; }
    onConfirm('reject', reason);
    handleClose();
  };
  if (!mapping) return null;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#E01950', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CancelIcon /> Reject Request
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#FFF5F7', borderRadius: '8px', border: '1px solid #fcc2cc' }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#27235C' }}>
            Asset: {mapping.assetName || mapping.assetId}
            {mapping.assetTag && (
              <span style={{ color: '#888', fontFamily: 'monospace', marginLeft: 8 }}>{mapping.assetTag}</span>
            )}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#666', mt: 0.3 }}>
            Mapping: {mapping.mappingNumber} · Ticket #{mapping.ticketId}
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.82rem' }}>{error}</Alert>}
        <TextField
          fullWidth multiline rows={3}
          label="Reason for Rejection *"
          value={reason}
          onChange={e => { setReason(e.target.value); if (error) setError(''); }}
          placeholder="Please provide a clear reason for rejecting this request..."
          size="small"
          error={!!error}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#666' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<CancelIcon />}
          sx={{ backgroundColor: '#E01950', '&:hover': { backgroundColor: '#b5143e' } }}
        >
          {loading ? 'Processing…' : 'Confirm Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 
/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function ITSMManagerAssetPage() {
  const { user } = useAuth();
  const managerId = user?.id != null ? Number(user.id) : 2;
 
  const [tab, setTab]               = useState(0);
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [counts, setCounts]         = useState({ pending: 0, total: 0, approved: 0, rejected: 0 });
 
  const [selected, setSelected]     = useState(null);   // selected mapping row
  const [drawerOpen, setDrawerOpen] = useState(false);  // drawer visibility
  const [acting, setActing]         = useState(false);
 
  // Search / filter
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
 
  // Pagination
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
 
  // Decision dialogs
  const [approveRow, setApproveRow] = useState(null);
  const [rejectRow,  setRejectRow]  = useState(null);
 
  const fetchRows = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = tab === 0 ? await getPendingManagerApprovals() : await getAllMappings();
      setRows(res.data.data || []);
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to load mappings';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }, [tab]);
 
  const loadCounts = useCallback(async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        getPendingManagerApprovals(),
        getAllMappings(),
      ]);
      const all = allRes.data.data || [];
      setCounts({
        pending:  (pendingRes.data.data || []).length,
        total:    all.length,
        approved: all.filter(m => ['APPROVED', 'MANAGER_APPROVED', 'ACTIVE'].includes(m.status)).length,
        rejected: all.filter(m => ['REJECTED_BY_MANAGER', 'REJECTED_BY_SP'].includes(m.status)).length,
      });
      setPendingCount((pendingRes.data.data || []).length);
    } catch { }
  }, []);
 
  useEffect(() => { fetchRows(); }, [fetchRows]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
 
  const openDrawer = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };
 
  const closeDrawer = () => {
    setDrawerOpen(false);
    // keep `selected` so the row stays highlighted until drawer fully closes
    setTimeout(() => setSelected(null), 300);
  };
 
  const handleDecision = async (action, value) => {
    const row = action === 'approve' ? approveRow : rejectRow;
    if (!row) return;
    setActing(true);
    try {
      await managerDecision(row.id,
        action === 'approve'
          ? { managerId, decision: 'APPROVE',  remarks: value || undefined }
          : { managerId, decision: 'REJECT',   remarks: value }
      );
      if (action === 'approve') {
        setApproveRow(null);
        toast.success('✅ Asset assignment approved successfully!');
      } else {
        setRejectRow(null);
        toast.success('Asset assignment rejected.');
      }
      closeDrawer();
      fetchRows();
      loadCounts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Decision failed. Please try again.');
    } finally { setActing(false); }
  };
 
  const filteredRows = rows.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.mappingNumber?.toLowerCase().includes(q) ||
      m.assetName?.toLowerCase().includes(q) ||
      m.assetTag?.toLowerCase().includes(q) ||
      String(m.ticketId || '').includes(q) ||
      String(m.requestedByUserId || '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || m.status === filterStatus;
    return matchSearch && matchStatus;
  });
 
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
 {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <AssignmentIcon sx={{ color: ACCENT, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1c1a3a' }}>Asset Approval Queue</Typography>
          <Typography sx={{ fontSize: '0.83rem', color: '#6b6b8a' }}>Review and approve asset assignment requests</Typography>
        </Box>
        {pendingCount > 0 && (
          <Chip
            label={`${pendingCount} pending`}
            size="small"
            sx={{ backgroundColor: '#FFF8E1', color: '#C9A32E', fontWeight: 700, border: '1px solid #E2B93B66' }}
          />
        )}
      </Box>
 
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
 
      {/* ── Stats Cards ── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<AssignmentIcon fontSize="small" />} label="Pending Approval" value={counts.pending}  color="#E01950" bg="#FDEEF2" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<InventoryIcon fontSize="small" />}  label="Total Mappings"  value={counts.total}    color={BRAND}   bg="#EDEDF7" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon fontSize="small" />} label="Approved"        value={counts.approved} color="#24A148" bg="#E8F5E9" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CancelIcon fontSize="small" />}     label="Rejected"         value={counts.rejected} color="#E2B93B" bg="#FFF8E1" />
        </Grid>
      </Grid>
 
      {/* ── Mapping Table (full width always) ── */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSelected(null); setDrawerOpen(false); setSearch(''); setFilterStatus(''); setPage(0); }}
          sx={{
            borderBottom: '1px solid #EFEFEF', px: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: ACCENT },
            '& .MuiTabs-indicator': { backgroundColor: ACCENT },
          }}
        >
          <Tab label={`Pending Approval${pendingCount > 0 ? ` (${pendingCount})` : ''}`} />
          <Tab label="All Mappings" />
        </Tabs>
 
        {/* Search & Filter Bar */}
        <Box sx={{
          px: 2, py: 1.5, borderBottom: '1px solid #F0F0F0',
          display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <TextField
            size="small"
            placeholder="Search mapping, asset, ticket, user…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#888' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={e => { setFilterStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || filterStatus) && (
            <Button size="small" onClick={() => { setSearch(''); setFilterStatus(''); setPage(0); }}
              sx={{ color: '#E01950', fontSize: '0.78rem' }}>
              Clear
            </Button>
          )}
          <Typography sx={{ ml: 'auto', fontSize: '0.78rem', color: '#666' }}>
            {filteredRows.length} result{filteredRows.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
 
        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['Mapping #', 'Asset', 'Ticket', 'Requested By', 'SP', 'Status', 'Created', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 600, backgroundColor: '#FAFAFC' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <InventoryIcon sx={{ fontSize: 40, color: '#DDD', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
                      {tab === 0 ? 'No pending approvals 🎉' : 'No mappings found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#888', fontSize: '0.9rem' }}>
                    No results match your search or filter.
                  </TableCell>
                </TableRow>
              ) : filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(m => (
                <TableRow
                  key={m.id}
                  hover
                  selected={selected?.id === m.id}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: selected?.id === m.id ? '#F9EEF7' : undefined,
                    '&:hover': { backgroundColor: selected?.id === m.id ? '#F9EEF7' : '#FAFAFC' },
                  }}
                  onClick={() => openDrawer(m)}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: BRAND }}>
                    {m.mappingNumber}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>{m.assetName || m.assetId}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>{m.assetTag}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{m.ticketId}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{m.requestedByUserId}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{m.assignedBySpId || '—'}</TableCell>
                  <TableCell><MappingStatusChip status={m.status} /></TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    {m.status === 'PENDING_MANAGER_APPROVAL' && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Approve">
                          <IconButton size="small" sx={{ color: '#24A148' }} onClick={() => setApproveRow(m)}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" sx={{ color: '#E01950' }} onClick={() => setRejectRow(m)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
 
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: '1px solid #F0F0F0', flexShrink: 0 }}
        />
      </Paper>
 
      {/* ── Asset Detail Drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 520 },
            backgroundColor: '#F7F8FC',
            boxShadow: '-4px 0 32px rgba(255, 255, 255, 0.14)',
            border: 'none',
          },
        }}
      >
        {selected && (
          <AssetDetailDrawerContent
            assetId={selected.assetId}
            mapping={selected}
            onClose={closeDrawer}
            onApprove={() => setApproveRow(selected)}
            onReject={() => setRejectRow(selected)}
          />
        )}
      </Drawer>
 
      {/* ── Approve Confirmation Dialog ── */}
      <ApproveConfirmDialog
        open={!!approveRow}
        mapping={approveRow}
        onClose={() => setApproveRow(null)}
        onConfirm={handleDecision}
        loading={acting}
      />
 
      {/* ── Reject Reason Dialog ── */}
      <RejectReasonDialog
        open={!!rejectRow}
        mapping={rejectRow}
        onClose={() => setRejectRow(null)}
        onConfirm={handleDecision}
        loading={acting}
      />
    </Box>
  );
}
 