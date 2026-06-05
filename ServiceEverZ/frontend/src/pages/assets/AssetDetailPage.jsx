import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Alert, CircularProgress,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon      from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAssetById, getMappingsByAsset, getHistoryByAsset, markRentalReturned,
} from '../../api/assetApi';
import { AssetStatusChip, OwnershipChip, MappingStatusChip } from '../../components/assets/AssetStatusChip';
 
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ display: 'flex', py: 0.75, borderBottom: '1px solid #F0F0F0' }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#888', width: 180, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.85rem', color: '#1A1A1A', fontWeight: 500 }}>{String(value)}</Typography>
    </Box>
  );
}
 
export default function AssetDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId   = user?.id != null ? Number(user.id) : null;
 
  const [asset, setAsset]       = useState(null);
  const [mappings, setMappings] = useState([]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [returnDialog, setReturnDialog] = useState(false);
  // Fixed: form fields now match RentalReturnRequest { spId, returnedDate, remarks }
  const [returnForm, setReturnForm] = useState({ returnedDate: '', remarks: '' });
  const [returning, setReturning]   = useState(false);
 
  useEffect(() => {
    Promise.all([
      getAssetById(id),
      getMappingsByAsset(id),
      getHistoryByAsset(id),
    ]).then(([a, m, h]) => {
      setAsset(a.data.data);
      setMappings(m.data.data || []);
      setHistory(h.data.data || []);
    }).catch(() => setError('Failed to load asset details'))
      .finally(() => setLoading(false));
  }, [id]);
 
  // Fixed: RentalReturnRequest requires { spId: Long, returnedDate: LocalDate, remarks?: String }
  const handleReturn = async () => {
    if (!returnForm.returnedDate) { setError('Return date is required'); return; }
    setReturning(true);
    try {
      await markRentalReturned(id, {
        spId: userId,
        returnedDate: returnForm.returnedDate,
        remarks: returnForm.remarks || undefined,
      });
      const r = await getAssetById(id);
      setAsset(r.data.data);
      setReturnDialog(false);
      setReturnForm({ returnedDate: '', remarks: '' });
    } catch (e) {
      setError(e.response?.data?.message || 'Return failed');
    } finally { setReturning(false); }
  };
 
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!asset)  return <Box sx={{ p: 3 }}><Alert severity="error">{error || 'Asset not found'}</Alert></Box>;
 
  const isRental = asset.ownershipType === 'RENTAL';
 
  return (
    <Box sx={{ p: 3, maxWidth: 980, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')} sx={{ color: '#27235C' }}>Back</Button>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{asset.name}</Typography>
              <AssetStatusChip status={asset.status} />
              <OwnershipChip type={asset.ownershipType} />
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#888', fontFamily: 'monospace' }}>{asset.assetTag}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isRental && asset.status !== 'RETURNED_TO_VENDOR' && (
            <Button variant="outlined" onClick={() => setReturnDialog(true)}
              sx={{ borderColor: '#97247E', color: '#97247E', '&:hover': { borderColor: '#7A1B66', backgroundColor: '#F9EEF7' } }}>
              Mark Returned
            </Button>
          )}
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/assets/edit/${id}`)}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}>
            Edit
          </Button>
        </Box>
      </Box>
 
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
 
      <Grid container spacing={2}>
        {/* Core Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
            <Typography sx={{ fontWeight: 700, mb: 2, color: '#27235C', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Asset Details
            </Typography>
            <InfoRow label="Category"      value={asset.category?.replace(/_/g,' ')} />
            <InfoRow label="Brand"         value={asset.brand} />
            <InfoRow label="Model"         value={asset.model} />
            <InfoRow label="Serial Number" value={asset.serialNumber} />
            <InfoRow label="Location"      value={asset.location} />
            <InfoRow label="Added by SP"   value={asset.addedBySpName || asset.addedBySpId} />
            <InfoRow label="Assigned To"   value={asset.assignedToUserName || asset.assignedToName || (asset.assignedToUserId ? `User #${asset.assignedToUserId}` : null)} />
            {asset.notes && (
              <Box sx={{ mt: 1.5 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#888', mb: 0.5 }}>Notes</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#444', whiteSpace: 'pre-wrap' }}>{asset.notes}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
 
        {/* Ownership Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
            <Typography sx={{ fontWeight: 700, mb: 2, color: isRental ? '#97247E' : '#27235C', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isRental ? 'Rental Details' : 'Ownership Details'}
            </Typography>
            {!isRental ? (
              <>
                <InfoRow label="Purchase Date"     value={asset.purchaseDate} />
                <InfoRow label="Purchase Cost"     value={asset.purchaseCost ? `₹${asset.purchaseCost.toLocaleString()}` : null} />
                <InfoRow label="Warranty Expiry"   value={asset.warrantyExpiryDate} />
                <InfoRow label="Depreciation Rate" value={asset.depreciationRatePercent ? `${asset.depreciationRatePercent}%` : null} />
              </>
            ) : (
              <>
                <InfoRow label="Vendor Name"    value={asset.rentalVendorName} />
                <InfoRow label="Vendor Contact" value={asset.rentalVendorContact} />
                <InfoRow label="Contract No."   value={asset.rentalContractNumber} />
                <InfoRow label="Rental Period"  value={asset.rentalStartDate && asset.rentalEndDate ? `${asset.rentalStartDate} → ${asset.rentalEndDate}` : null} />
                <InfoRow label="Monthly Cost"   value={asset.rentalCostPerMonth ? `₹${asset.rentalCostPerMonth.toLocaleString()}` : null} />
                <InfoRow label="Deposit Amount" value={asset.rentalDepositAmount ? `₹${asset.rentalDepositAmount.toLocaleString()}` : null} />
                <InfoRow label="Renewal Option" value={asset.rentalRenewalOption != null ? (asset.rentalRenewalOption ? 'Yes' : 'No') : null} />
                <InfoRow label="Returned Date"  value={asset.rentalReturnedDate} />
                {asset.rentalExpiringSoon && (
                  <Box sx={{ mt: 1.5, p: 1, backgroundColor: '#FDEEF2', borderRadius: '8px', border: '1px solid #E0194F33' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#E01950', fontWeight: 600 }}>⚠ Rental expiring soon</Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
 
        {/* Active Mappings */}
        {mappings.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F0F0F0' }}>
                <Typography sx={{ fontWeight: 700, color: '#27235C', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Asset Mappings ({mappings.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Mapping #','Ticket','Requested By','Assigned By SP','Approved By Manager','Status','Created'].map(h =>
                        <TableCell key={h}>{h}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappings.map(m => (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#27235C', fontWeight: 600 }}>{m.mappingNumber}</TableCell>
                        <TableCell>{m.ticketId}</TableCell>
                        <TableCell>{m.requestedByUserName}</TableCell>
                        <TableCell>{m.assignedBySpName || '—'}</TableCell>
                        <TableCell>{m.approvedByManagerName|| '—'}</TableCell>
                        <TableCell><MappingStatusChip status={m.status} /></TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#666' }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
 
        {/* History */}
        {history.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F0F0F0' }}>
                <Typography sx={{ fontWeight: 700, color: '#27235C', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Assignment History ({history.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Mapping #','User','SP Name','From','To','Action'].map(h => <TableCell key={h}>{h}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map(h => (
                      <TableRow key={h.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{h.mappingNumber}</TableCell>
                        <TableCell>{h.userName || h.userId}</TableCell>
                        <TableCell>{h.spName || h.spId}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#666' }}>{h.assignedFrom ? new Date(h.assignedFrom).toLocaleDateString() : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: '#666' }}>{h.assignedTo ? new Date(h.assignedTo).toLocaleDateString() : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>{h.action}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
 
      {/* Rental Return Dialog — fixed fields: returnedDate + remarks + spId */}
      <Dialog open={returnDialog} onClose={() => setReturnDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#97247E' }}>Mark Asset as Returned</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Returned Date *" type="date"
                value={returnForm.returnedDate}
                onChange={e => setReturnForm(f => ({ ...f, returnedDate: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Remarks" multiline rows={3}
                value={returnForm.remarks}
                onChange={e => setReturnForm(f => ({ ...f, remarks: e.target.value }))}
                placeholder="Describe the condition of the asset on return…" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReturnDialog(false)} sx={{ color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={handleReturn} disabled={returning || !returnForm.returnedDate}
            sx={{ backgroundColor: '#97247E', '&:hover': { backgroundColor: '#7A1B66' } }}>
            {returning ? 'Processing…' : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
 
 