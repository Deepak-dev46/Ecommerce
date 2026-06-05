import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Alert, CircularProgress,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Stack,
  IconButton, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAssetById, getMappingsByAsset, getHistoryByAsset, markRentalReturned,
} from '../../api/assetApi';
import { AssetStatusChip, OwnershipChip, MappingStatusChip } from '../../components/assets/AssetStatusChip';

/* ── Design tokens ──────────────────────────────────────────────────── */
const BRAND    = '#27235C';
const ACCENT   = '#97247E';
const BORDER   = '#E8E8F0';
const TEXT_PRI = '#1A1A2E';
const TEXT_SEC = '#6B6B8A';
const FONT     = "'Inter', 'Segoe UI', sans-serif";

const cardSx = {
  borderRadius: '14px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
  overflow: 'hidden',
};

const cardHeaderSx = (color = BRAND) => ({
  px: 2.5, py: 1.5,
  background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
  borderBottom: `1px solid ${BORDER}`,
  display: 'flex', alignItems: 'center', gap: 1.5,
});

function CardHeader({ icon, title, color = BRAND }) {
  return (
    <Box sx={cardHeaderSx(color)}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '8px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 16 } })}
      </Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: TEXT_PRI, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Box sx={{ display: 'flex', py: 0.9, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={{ fontSize: '0.78rem', color: TEXT_SEC, width: 190, flexShrink: 0, fontFamily: FONT, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.84rem', color: TEXT_PRI, fontWeight: 500, fontFamily: FONT }}>{String(value)}</Typography>
    </Box>
  );
}

export default function AssetDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId   = user?.userId != null ? Number(user.userId) : null;

  const [asset, setAsset]       = useState(null);
  const [mappings, setMappings] = useState([]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [returnDialog, setReturnDialog] = useState(false);
  const [returnForm, setReturnForm]     = useState({ returnedDate: '', remarks: '' });
  const [returning, setReturning]       = useState(false);

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

  const handleDownloadInvoice = () => {
    if (!asset?.invoiceUrl) return;
    const link = document.createElement('a');
    link.href = asset.invoiceUrl;
    link.setAttribute('download', asset.invoiceFileName || 'invoice');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: BRAND }} /></Box>;
  if (!asset)  return <Box sx={{ p: 3 }}><Alert severity="error">{error || 'Asset not found'}</Alert></Box>;

  const isRental = asset.ownershipType === 'RENTAL';

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/assets')}
            sx={{ color: BRAND, textTransform: 'none', fontFamily: FONT, fontWeight: 500,
                  border: `1px solid ${BORDER}`, borderRadius: '10px', px: 2 }}
          >
            Back
          </Button>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography sx={{ fontWeight: 800, fontFamily: FONT, fontSize: '1.3rem', color: TEXT_PRI }}>{asset.name}</Typography>
              <AssetStatusChip status={asset.status} />
              <OwnershipChip type={asset.ownershipType} />
            </Stack>
            <Typography sx={{ fontSize: '0.78rem', color: TEXT_SEC, fontFamily: 'monospace', mt: 0.2 }}>{asset.assetTag}</Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          {isRental && asset.status !== 'RETURNED_TO_VENDOR' && (
            <Button variant="outlined" onClick={() => setReturnDialog(true)}
              sx={{ borderColor: ACCENT, color: ACCENT, textTransform: 'none', fontFamily: FONT, fontWeight: 600,
                    borderRadius: '10px', '&:hover': { borderColor: '#7A1B66', backgroundColor: '#F9EEF7' } }}>
              Mark Returned
            </Button>
          )}
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/assets/edit/${id}`)}
            sx={{ backgroundColor: BRAND, fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                  borderRadius: '10px', '&:hover': { backgroundColor: '#1B193F' } }}>
            Edit Asset
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2}>

        {/* ── Asset Details Card ── */}
        <Grid item xs={12} md={isRental ? 6 : 7}>
          <Paper elevation={0} sx={cardSx}>
            <CardHeader icon={<InventoryIcon />} title="Asset Details" />
            <Box sx={{ p: 2.5 }}>
              <InfoRow label="Asset ID / Tag"  value={asset.assetTag} />
              <InfoRow label="Category"        value={asset.category?.replace(/_/g, ' ')} />
              <InfoRow label="Brand"           value={asset.brand} />
              <InfoRow label="Model"           value={asset.model} />
              <InfoRow label="Serial Number"   value={asset.serialNumber} />
              <InfoRow label="Location"        value={asset.location} />
              <InfoRow label="Status"          value={asset.status?.replace(/_/g, ' ')} />
              <InfoRow label="Added By"        value={asset.addedBySpName || '—'} />
              <InfoRow label="Assigned To"     value={asset.assignedToUserName || asset.assignedToName || (asset.status === 'ASSIGNED' ? 'Assigned' : null)} />
              <InfoRow label="Created At"      value={asset.createdAt ? new Date(asset.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            </Box>
          </Paper>
        </Grid>

        {/* ── Ownership Details Card ── */}
        <Grid item xs={12} md={isRental ? 6 : 5}>
          <Paper elevation={0} sx={cardSx}>
            <CardHeader
              icon={<BusinessIcon />}
              title={isRental ? 'Rental Details' : 'Ownership Details'}
              color={isRental ? ACCENT : BRAND}
            />
            <Box sx={{ p: 2.5 }}>
              {!isRental ? (
                <>
                  <InfoRow label="Ownership"       value="Owned" />
                  <InfoRow label="Purchase Date"   value={asset.purchaseDate} />
                  <InfoRow label="Purchase Cost"   value={asset.purchaseCost ? `₹${Number(asset.purchaseCost).toLocaleString('en-IN')}` : null} />
                  <InfoRow label="Warranty Expiry" value={asset.warrantyExpiryDate} />
                </>
              ) : (
                <>
                  <InfoRow label="Vendor Name"    value={asset.rentalVendorName} />
                  <InfoRow label="Vendor Contact" value={asset.rentalVendorContact} />
                  <InfoRow label="Vendor Email"   value={asset.rentalVendorEmail} />
                  <InfoRow label="Contract No."   value={asset.rentalContractNumber} />
                  <InfoRow label="Rental Start"   value={asset.rentalStartDate} />
                  <InfoRow label="Rental End"     value={asset.rentalEndDate} />
                  <InfoRow label="Monthly Cost"   value={asset.rentalCostPerMonth ? `₹${Number(asset.rentalCostPerMonth).toLocaleString('en-IN')}` : null} />
                  <InfoRow label="Deposit Amount" value={asset.rentalDepositAmount ? `₹${Number(asset.rentalDepositAmount).toLocaleString('en-IN')}` : null} />
                  <InfoRow label="Renewal Option" value={asset.rentalRenewalOption != null ? (asset.rentalRenewalOption ? 'Yes' : 'No') : null} />
                  <InfoRow label="Returned Date"  value={asset.rentalReturnedDate} />
                  {asset.rentalExpiringSoon && (
                    <Box sx={{ mt: 1.5, p: 1, backgroundColor: '#FDEEF2', borderRadius: '8px', border: '1px solid #E0194F33' }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#E01950', fontWeight: 600, fontFamily: FONT }}>⚠ Rental expiring soon</Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Specifications Card ── */}
        {Array.isArray(asset.specifications) && asset.specifications.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={cardSx}>
              <CardHeader icon={<TuneIcon />} title="Specifications" color="#0EA5E9" />
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={0}>
                  {asset.specifications.map((spec, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Box sx={{
                        py: 1, px: 1.5, mr: 1, mb: 1,
                        borderRadius: '10px',
                        backgroundColor: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                      }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>
                          {spec.specKey}
                        </Typography>
                        <Typography sx={{ fontSize: '0.84rem', color: TEXT_PRI, fontWeight: 500, fontFamily: FONT, mt: 0.3 }}>
                          {spec.specValue || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* ── Invoice Card ── */}
        {asset.invoiceUrl && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={cardSx}>
              <CardHeader icon={<InsertDriveFileIcon />} title="Invoice / Purchase Document" color="#D97706" />
              <Box sx={{ p: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  border: '1.5px solid #D9770633', borderRadius: '12px', p: 2,
                  background: 'linear-gradient(135deg, #FFF7ED, #FFFDF9)',
                }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #FEF3C7, #FFF7ED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <InsertDriveFileIcon sx={{ color: '#D97706', fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.9rem', color: TEXT_PRI, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.invoiceFileName || 'Invoice Document'}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.73rem', color: TEXT_SEC, mt: 0.3 }}>
                      Purchase invoice attached to this asset
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Preview Invoice">
                      <Button
                        variant="outlined" size="small"
                        startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                        onClick={() => window.open(asset.invoiceUrl, '_blank')}
                        sx={{
                          fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                          fontSize: '0.78rem', borderRadius: '8px',
                          borderColor: '#D97706', color: '#D97706',
                          '&:hover': { backgroundColor: '#FFF7ED', borderColor: '#B45309' },
                        }}
                      >
                        Preview
                      </Button>
                    </Tooltip>
                    <Tooltip title="Download Invoice">
                      <Button
                        variant="contained" size="small"
                        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                        onClick={handleDownloadInvoice}
                        sx={{
                          fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                          fontSize: '0.78rem', borderRadius: '8px',
                          backgroundColor: '#D97706',
                          '&:hover': { backgroundColor: '#B45309' },
                        }}
                      >
                        Download
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* ── Active Mappings ── */}
        {mappings.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${BORDER}`, background: `linear-gradient(135deg, ${BRAND}08, ${BRAND}04)` }}>
                <Typography sx={{ fontWeight: 700, color: BRAND, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>
                  Asset Mappings ({mappings.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                      {['Mapping #', 'Ticket', 'Requested By', 'Assigned By SP', 'Approved By Manager', 'Status', 'Created'].map(h => (
                        <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappings.map(m => (
                      <TableRow key={m.id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFF' } }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: BRAND, fontWeight: 600 }}>{m.mappingNumber}</TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>{m.ticketId}</TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>{m.requestedByUserName || '—'}</TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>{m.assignedBySpName || '—'}</TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>{m.approvedByManagerName || '—'}</TableCell>
                        <TableCell><MappingStatusChip status={m.status} /></TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', color: TEXT_SEC, fontFamily: FONT }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* ── History ── */}
        {history.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${BORDER}`, background: `linear-gradient(135deg, ${BRAND}08, ${BRAND}04)` }}>
                <Typography sx={{ fontWeight: 700, color: BRAND, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>
                  Assignment History ({history.length})
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                      {['Mapping #', 'Assigned User', 'SP Name', 'From', 'To', 'Action'].map(h => (
                        <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map(h => (
                      <TableRow key={h.id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFF' } }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: BRAND }}>{h.mappingNumber || '—'}</TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 500 }}>{h.userName || h.userFullName || '—'}</TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 500 }}>{h.spName || h.spFullName || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', color: TEXT_SEC, fontFamily: FONT }}>{h.assignedFrom ? new Date(h.assignedFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', color: TEXT_SEC, fontFamily: FONT }}>{h.assignedTo ? new Date(h.assignedTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', fontFamily: FONT }}>{h.action || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

      </Grid>

      {/* ── Rental Return Dialog ── */}
      <Dialog open={returnDialog} onClose={() => setReturnDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: ACCENT, fontFamily: FONT }}>Mark Asset as Returned</DialogTitle>
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
          <Button onClick={() => setReturnDialog(false)} sx={{ color: '#666', fontFamily: FONT }}>Cancel</Button>
          <Button variant="contained" onClick={handleReturn} disabled={returning || !returnForm.returnedDate}
            sx={{ backgroundColor: ACCENT, fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                  '&:hover': { backgroundColor: '#7A1B66' } }}>
            {returning ? 'Processing…' : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
