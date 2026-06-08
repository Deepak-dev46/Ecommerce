import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Divider, Button, Chip, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import EditIcon           from '@mui/icons-material/Edit';
import DeleteIcon         from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon     from '@mui/icons-material/Visibility';
import DownloadIcon       from '@mui/icons-material/Download';
import CloseIcon          from '@mui/icons-material/Close';
import InventoryIcon      from '@mui/icons-material/Inventory';
import BusinessIcon       from '@mui/icons-material/Business';
import TuneIcon           from '@mui/icons-material/Tune';
import TimelineIcon       from '@mui/icons-material/Timeline';
import LinkIcon           from '@mui/icons-material/Link';
import { AssetStatusChip } from '../common/AssetStatusChip';
import { getMappingsByAsset, getHistoryByAsset, getInvoiceStreamUrl, downloadInvoiceBlob } from '../../api/assetApi';

/* ── Design tokens ─────────────────────────────────────────────────── */
const BRAND    = '#27235C';
const ACCENT   = '#97247E';
const BORDER   = '#E8E8F0';
const TEXT_PRI = '#1A1A2E';
const TEXT_SEC = '#6B6B8A';
const FONT     = "'Inter', 'Segoe UI', sans-serif";

/* ── Mapping status chip ─────────────────────────────────────────── */
function MappingStatusChip({ status }) {
  const map = {
    PENDING_SP_APPROVAL:      { label: 'Pending SP',      color: '#D97706', bg: '#FEF3C7' },
    PENDING_MANAGER_APPROVAL: { label: 'Pending Manager', color: '#2563EB', bg: '#DBEAFE' },
    ACTIVE:                   { label: 'Active',          color: '#16A34A', bg: '#DCFCE7' },
    REJECTED:                 { label: 'Rejected',        color: '#DC2626', bg: '#FEE2E2' },
    RELEASED:                 { label: 'Released',        color: '#6B7280', bg: '#F3F4F6' },
  };
  const s = map[status] || { label: status, color: TEXT_SEC, bg: '#F3F4F6' };
  return (
    <Chip
      label={s.label} size="small"
      sx={{ fontSize: '0.68rem', fontWeight: 700, color: s.color, backgroundColor: s.bg,
            border: `1px solid ${s.color}33`, height: 20, borderRadius: '5px' }}
    />
  );
}

/* ── Small helper components ────────────────────────────────────── */
function SectionHeader({ icon, title, color = BRAND }) {
  return (
    <Box sx={{
      px: 2, py: 1.2,
      background: `linear-gradient(135deg, ${color}08, ${color}04)`,
      borderBottom: `1px solid ${BORDER}`,
      display: 'flex', alignItems: 'center', gap: 1.2,
    }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: '7px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 14 } })}
      </Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem', color: TEXT_PRI,
                        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </Typography>
    </Box>
  );
}

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Box sx={{ display: 'flex', py: 0.75, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={{ width: 160, flexShrink: 0, fontSize: '0.75rem', color: TEXT_SEC, fontFamily: FONT, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', color: TEXT_PRI, fontWeight: 500, fontFamily: FONT, wordBreak: 'break-word' }}>
        {String(value)}
      </Typography>
    </Box>
  );
}

const cardSx = {
  borderRadius: '12px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 8px rgba(39,35,92,0.05)',
  overflow: 'hidden',
  mb: 2,
};

/* ── Main Component ─────────────────────────────────────────────── */
export default function AssetDetailPanel({ asset, onEdit, onDelete }) {
  const [mappings, setMappings] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);

  useEffect(() => {
    if (!asset?.id) return;
    setLoadingExtra(true);
    Promise.all([
      getMappingsByAsset(asset.id),
      getHistoryByAsset(asset.id),
    ]).then(([m, h]) => {
      setMappings(m.data.data || []);
      setHistory(h.data.data || []);
    }).catch(() => {
      // silently ignore — mappings/history are bonus info
    }).finally(() => setLoadingExtra(false));
  }, [asset?.id]);

  if (!asset) return null;

  const isRental = asset.ownershipType === 'RENTAL';

  const handleDownloadInvoice = async () => {
    if (!asset?.hasInvoice) return;
    try {
      const res = await downloadInvoiceBlob(asset.id);
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', asset.invoiceFileName || 'invoice');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // silently ignore download errors
    }
  };

  return (
    <Box sx={{ fontFamily: FONT }}>

      {/* ── Asset Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '0.68rem', color: ACCENT, fontWeight: 700, letterSpacing: '0.08em', mb: 0.3, fontFamily: 'monospace' }}>
            {asset.assetTag}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: TEXT_PRI, fontFamily: FONT, mb: 0.5 }}>
            {asset.name}
          </Typography>
          <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
            <AssetStatusChip status={asset.status} />
            <Chip label={asset.category?.replace(/_/g, ' ')} size="small"
              sx={{ fontSize: '0.68rem', fontWeight: 600, backgroundColor: '#EEEDF8', color: BRAND, height: 20, borderRadius: '5px' }} />
            <Chip label={asset.ownershipType} size="small"
              sx={{ fontSize: '0.68rem', fontWeight: 600, backgroundColor: '#F9EEFA', color: ACCENT, height: 20, borderRadius: '5px' }} />
            {asset.rentalExpiringSoon && (
              <Chip label="⚠ Expiring Soon" size="small"
                sx={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#D97706', height: 20, borderRadius: '5px' }} />
            )}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<EditIcon />} variant="outlined" onClick={onEdit}
            sx={{ borderColor: BRAND, color: BRAND, fontFamily: FONT, textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                  fontSize: '0.78rem', '&:hover': { backgroundColor: '#EEEDF8' } }}>
            Edit
          </Button>
          <Button size="small" startIcon={<DeleteIcon />} variant="outlined" onClick={onDelete}
            sx={{ borderColor: '#E01950', color: '#E01950', fontFamily: FONT, textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                  fontSize: '0.78rem', '&:hover': { backgroundColor: '#FFF0F3' } }}>
            Delete
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2, borderColor: BORDER }} />

      <Grid container spacing={2}>

        {/* ── Basic Info ── */}
        <Grid item xs={12} md={isRental ? 6 : 7}>
          <Paper elevation={0} sx={cardSx}>
            <SectionHeader icon={<InventoryIcon />} title="Asset Details" />
            <Box sx={{ p: 1.5 }}>
              <Row label="Asset Tag"      value={asset.assetTag} />
              <Row label="Brand"          value={asset.brand} />
              <Row label="Model"          value={asset.model} />
              <Row label="Serial Number"  value={asset.serialNumber} />
              <Row label="Location"       value={asset.location} />
              <Row label="Added By SP"    value={asset.addedBySpName || (asset.addedBySpId ? `SP #${asset.addedBySpId}` : null)} />
              <Row label="Assigned To"    value={asset.assignedToUserName || asset.assignedToName || (asset.status === 'ASSIGNED' ? '(Assigned)' : null)} />
              <Row label="Created At"     value={asset.createdAt ? new Date(asset.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
              <Row label="Updated At"     value={asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
            </Box>
          </Paper>
        </Grid>

        {/* ── Ownership / Rental Details ── */}
        <Grid item xs={12} md={isRental ? 6 : 5}>
          <Paper elevation={0} sx={cardSx}>
            <SectionHeader
              icon={<BusinessIcon />}
              title={isRental ? 'Rental Details' : 'Ownership Details'}
              color={isRental ? ACCENT : BRAND}
            />
            <Box sx={{ p: 1.5 }}>
              {!isRental ? (
                <>
                  <Row label="Ownership"       value="Owned" />
                  <Row label="Purchase Date"   value={asset.purchaseDate} />
                  <Row label="Purchase Cost"   value={asset.purchaseCost != null ? `₹${Number(asset.purchaseCost).toLocaleString('en-IN')}` : null} />
                  <Row label="Warranty Expiry" value={asset.warrantyExpiryDate} />
                  <Row label="Depreciation"    value={asset.depreciationRatePercent != null ? `${asset.depreciationRatePercent}%` : null} />
                </>
              ) : (
                <>
                  <Row label="Vendor Name"    value={asset.rentalVendorName} />
                  <Row label="Vendor Contact" value={asset.rentalVendorContact} />
                  <Row label="Vendor Email"   value={asset.rentalVendorEmail} />
                  <Row label="Contract No."   value={asset.rentalContractNumber} />
                  <Row label="Rental Start"   value={asset.rentalStartDate} />
                  <Row label="Rental End"     value={asset.rentalEndDate} />
                  <Row label="Monthly Cost"   value={asset.rentalCostPerMonth != null ? `₹${Number(asset.rentalCostPerMonth).toLocaleString('en-IN')}` : null} />
                  <Row label="Deposit Amount" value={asset.rentalDepositAmount != null ? `₹${Number(asset.rentalDepositAmount).toLocaleString('en-IN')}` : null} />
                  <Row label="Renewal Option" value={asset.rentalRenewalOption != null ? (asset.rentalRenewalOption ? 'Yes' : 'No') : null} />
                  <Row label="Return Condition" value={asset.rentalReturnCondition} />
                  <Row label="Returned Date"  value={asset.rentalReturnedDate} />
                  {asset.rentalExpiringSoon && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #D9770633' }}>
                      <Typography sx={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 700, fontFamily: FONT }}>
                        ⚠ Rental expiring soon
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Specifications ── */}
        {Array.isArray(asset.specifications) && asset.specifications.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader icon={<TuneIcon />} title="Specifications" color="#0EA5E9" />
              <Box sx={{ p: 1.5 }}>
                <Grid container spacing={1}>
                  {asset.specifications.map((spec, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Box sx={{
                        py: 0.8, px: 1.2, borderRadius: '8px',
                        backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD',
                      }}>
                        <Typography sx={{ fontSize: '0.65rem', color: '#0369A1', fontWeight: 700,
                                          textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>
                          {spec.specKey}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: TEXT_PRI, fontWeight: 500, fontFamily: FONT, mt: 0.2 }}>
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
        {asset.hasInvoice && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={cardSx}>
              <SectionHeader icon={<InsertDriveFileIcon />} title="Invoice / Purchase Document" color="#D97706" />
              <Box sx={{ p: 1.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  border: '1.5px solid #D9770633', borderRadius: '10px', p: 1.5,
                  background: 'linear-gradient(135deg, #FFF7ED, #FFFDF9)',
                }}>
                  <Box sx={{
                    width: 42, height: 42, borderRadius: '9px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #FEF3C7, #FFF7ED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <InsertDriveFileIcon sx={{ color: '#D97706', fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: TEXT_PRI,
                                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.invoiceFileName || 'Invoice Document'}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.71rem', color: TEXT_SEC, mt: 0.2 }}>
                      Purchase / rental invoice attached
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.8}>
                    <Tooltip title="Preview Invoice">
                      <Button
                        variant="outlined" size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setInvoicePreviewOpen(true)}
                        sx={{
                          fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                          fontSize: '0.74rem', borderRadius: '7px',
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
                        startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                        onClick={handleDownloadInvoice}
                        sx={{
                          fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                          fontSize: '0.74rem', borderRadius: '7px',
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

        {/* ── Invoice Preview Dialog (inline — no new tab) ── */}
        <Dialog
          open={invoicePreviewOpen}
          onClose={() => setInvoicePreviewOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px', height: '90vh' } }}
        >
          <DialogTitle sx={{
            fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: TEXT_PRI,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${BORDER}`, py: 1.5, px: 2.5,
          }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <InsertDriveFileIcon sx={{ color: '#D97706', fontSize: 20 }} />
              <span>{asset.invoiceFileName || 'Invoice Preview'}</span>
            </Stack>
            <IconButton size="small" onClick={() => setInvoicePreviewOpen(false)} sx={{ color: TEXT_SEC }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
            {asset.invoiceContentType?.startsWith('image/') ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'auto' }}>
                <img
                  src={getInvoiceStreamUrl(asset.id)}
                  alt={asset.invoiceFileName || 'Invoice'}
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
                />
              </Box>
            ) : (
              <iframe
                src={getInvoiceStreamUrl(asset.id)}
                title={asset.invoiceFileName || 'Invoice'}
                style={{ flex: 1, border: 'none', width: '100%', height: '100%', minHeight: '70vh' }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${BORDER}`, px: 2.5, py: 1.5 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
              onClick={handleDownloadInvoice}
              variant="outlined"
              sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                    borderRadius: '8px', borderColor: '#D97706', color: '#D97706',
                    '&:hover': { backgroundColor: '#FFF7ED' } }}
            >
              Download
            </Button>
            <Button
              size="small"
              onClick={() => setInvoicePreviewOpen(false)}
              variant="contained"
              sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                    borderRadius: '8px', backgroundColor: BRAND,
                    '&:hover': { backgroundColor: '#1B193F' } }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Asset Mappings ── */}
        {loadingExtra ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={22} sx={{ color: BRAND }} />
            </Box>
          </Grid>
        ) : (
          <>
            {mappings.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={cardSx}>
                  <SectionHeader icon={<LinkIcon />} title={`Asset Mappings (${mappings.length})`} color={BRAND} />
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                          {['Mapping #', 'Ticket', 'Requested By', 'SP', 'Manager', 'Status', 'Date'].map(h => (
                            <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.68rem',
                                                     color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.04em', py: 1 }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mappings.map(m => (
                          <TableRow key={m.id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFF' } }}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: BRAND, fontWeight: 600 }}>
                              {m.mappingNumber}
                            </TableCell>
                            <TableCell sx={{ fontFamily: FONT, fontSize: '0.79rem' }}>{m.ticketId || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: FONT, fontSize: '0.79rem' }}>{m.requestedByUserName || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: FONT, fontSize: '0.79rem' }}>{m.assignedBySpName || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: FONT, fontSize: '0.79rem' }}>{m.approvedByManagerName || '—'}</TableCell>
                            <TableCell><MappingStatusChip status={m.status} /></TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: TEXT_SEC, fontFamily: FONT }}>
                              {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* ── Assignment History ── */}
            {history.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={cardSx}>
                  <SectionHeader icon={<TimelineIcon />} title={`Assignment History (${history.length})`} color={ACCENT} />
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                          {['Mapping #', 'User', 'SP', 'From', 'To', 'Action'].map(h => (
                            <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.68rem',
                                                     color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.04em', py: 1 }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map(h => (
                          <TableRow key={h.id} hover sx={{ '&:hover': { backgroundColor: '#FDF9FF' } }}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: ACCENT }}>{h.mappingNumber}</TableCell>
                            <TableCell sx={{ fontFamily: FONT, fontSize: '0.79rem' }}>{h.userName || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: FONT, fontSize: '0.79rem' }}>{h.spName || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: TEXT_SEC, fontFamily: FONT }}>
                              {h.assignedFrom ? new Date(h.assignedFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: TEXT_SEC, fontFamily: FONT }}>
                              {h.assignedTo ? new Date(h.assignedTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.79rem', fontFamily: FONT, color: TEXT_PRI }}>{h.action}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {mappings.length === 0 && history.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ py: 1.5, px: 2, borderRadius: '10px', backgroundColor: '#F7F8FC',
                            border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.78rem', color: TEXT_SEC, fontFamily: FONT }}>
                    No mappings or assignment history yet
                  </Typography>
                </Box>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
}
