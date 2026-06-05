import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  FormControl, FormHelperText, Grid, Paper, CircularProgress,
  Divider, FormControlLabel, Checkbox, Chip, Stack,
  LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import ArrowBackIcon            from '@mui/icons-material/ArrowBack';
import SaveIcon                 from '@mui/icons-material/Save';
import InventoryIcon            from '@mui/icons-material/Inventory';
import BusinessIcon             from '@mui/icons-material/Business';
import HandshakeIcon            from '@mui/icons-material/Handshake';
import PhoneIcon                from '@mui/icons-material/Phone';
import EmailIcon                from '@mui/icons-material/Email';
import CalendarMonthIcon        from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon          from '@mui/icons-material/AttachMoney';
import TuneIcon                 from '@mui/icons-material/Tune';
import ReceiptLongIcon          from '@mui/icons-material/ReceiptLong';
import UploadFileIcon           from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon        from '@mui/icons-material/DeleteOutline';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth }              from '../../context/AuthContext';
import { addAsset, updateAsset, getAssetById, fileToBase64, getSpecTemplate } from '../../api/assetApi';
import { validateAssetForm }    from '../../utils/validators';
import toast                    from '../../utils/toast';

/* ── Google Fonts – Roboto ────────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href  = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap';
fontLink.rel   = 'stylesheet';
if (!document.head.querySelector('[href*="Roboto"]')) document.head.appendChild(fontLink);

/* ── Constants ────────────────────────────────────────────────────────── */
const CATEGORIES = [
  'LAPTOP','DESKTOP','MONITOR','PRINTER','PROJECTOR',
  'SERVER','NETWORK_DEVICE','MOBILE','TABLET','PERIPHERAL','OTHER',
];
const LOCATIONS = ['Chennai','Virudhunagar','Pune','Hyderabad','Atlanta','Georgia'];
const STATUSES  = [
  'AVAILABLE','ASSIGNED','UNDER_MAINTENANCE','RETIRED','LOST','RETURNED_TO_VENDOR',
];
const today = new Date().toISOString().split('T')[0];

const makeEmpty = (spId = '') => ({
  name: '', category: '', brand: '', model: '', serialNumber: '',
  location: '', addedBySpId: spId,
  ownershipType: 'OWNED', status: 'AVAILABLE',
  purchaseDate: '', purchaseCost: '', warrantyExpiryDate: '',
  rentalVendorName: '', rentalVendorContact: '', rentalContractNumber: '',
  rentalVendorEmail: '',
  rentalStartDate: '', rentalEndDate: '', rentalCostPerMonth: '',
  rentalDepositAmount: '', rentalRenewalOption: false, rentalReturnCondition: '',
  // invoice
  invoiceData: '', invoiceContentType: '', invoiceFileName: '',
  // specs: built dynamically
});

/* ── Helpers ──────────────────────────────────────────────────────────── */
const toAlphanumeric = (v, strict = false) =>
  strict ? v.replace(/[^A-Za-z0-9\-]/g, '') : v.replace(/[^A-Za-z0-9 ]/g, '');

const validateVendorContact = (v) => {
  if (!v?.trim()) return '';
  return /^(\+\d{1,3})?[\s\-]?\d{10}$/.test(v.trim())
    ? '' : 'Enter a valid 10-digit mobile number';
};

const validateVendorEmail = (v) => {
  if (!v?.trim()) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ? '' : 'Enter a valid email address';
};

/* ── Design tokens ────────────────────────────────────────────────────── */
const BRAND   = '#27235C';
const ACCENT  = '#97247E';
const BG      = '#F7F8FC';
const CARD_BG = '#FFFFFF';
const BORDER  = '#E8E8F0';
const TEXT_PRI   = '#1A1A2E';
const TEXT_SEC   = '#6B6B8A';
const FONT = "'Roboto', sans-serif";

const sectionSx = {
  backgroundColor: CARD_BG,
  borderRadius: '16px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
  overflow: 'hidden',
  mb: 2.5,
};

const sectionHeaderSx = (color = BRAND) => ({
  px: 3, py: 2,
  background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
  borderBottom: `1px solid ${BORDER}`,
  display: 'flex', alignItems: 'center', gap: 1.5,
});

const inputSx = {
  fontFamily: FONT,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontFamily: FONT, fontSize: '0.875rem',
    backgroundColor: '#FAFBFF', transition: 'box-shadow 0.2s, border-color 0.2s',
    '&:hover fieldset': { borderColor: BRAND },
    '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: '2px' },
    '&.Mui-error fieldset': { borderColor: '#E01950' },
  },
  '& .MuiInputLabel-root': { fontFamily: FONT, fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND },
  '& .MuiFormHelperText-root': { fontFamily: FONT, fontSize: '0.72rem', mt: 0.5 },
};

const selectSx = {
  ...inputSx,
  '& .MuiSelect-select': { fontFamily: FONT, fontSize: '0.875rem' },
};

/* ── Sub-components ───────────────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, color = BRAND }) {
  return (
    <Box sx={sectionHeaderSx(color)}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '10px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 18 } })}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: TEXT_PRI, letterSpacing: '0.01em' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: TEXT_SEC, mt: 0.1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function FieldLabel({ children, required }) {
  return (
    <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600, color: TEXT_SEC, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.6 }}>
      {children}{required && <span style={{ color: '#E01950', marginLeft: 3 }}>*</span>}
    </Typography>
  );
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE:            { label: 'Available',           color: '#16A34A', bg: '#DCFCE7' },
    ASSIGNED:             { label: 'Assigned',            color: '#2563EB', bg: '#DBEAFE' },
    UNDER_MAINTENANCE:    { label: 'Maintenance',         color: '#D97706', bg: '#FEF3C7' },
    RETIRED:              { label: 'Retired',             color: '#6B7280', bg: '#F3F4F6' },
    LOST:                 { label: 'Lost',                color: '#DC2626', bg: '#FEE2E2' },
    RETURNED_TO_VENDOR:   { label: 'Returned to Vendor',  color: '#7C3AED', bg: '#EDE9FE' },
  };
  const s = map[status] || { label: status, color: TEXT_SEC, bg: '#F3F4F6' };
  return (
    <Chip label={s.label} size="small" sx={{
      fontFamily: FONT, fontWeight: 600, fontSize: '0.72rem',
      color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}33`,
      height: 22, borderRadius: '6px',
    }} />
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */
// Works in two modes:
//  1. Standalone route: reads id from URL params (useParams)
//  2. Dialog mode: receives assetId + onSuccess + onCancel as props (from AssetManagementPage)
export default function AssetFormPage({ assetId: propAssetId, onSuccess, onCancel } = {}) {
  const navigate  = useNavigate();
  const params    = useParams();
  // Prefer prop-based id (dialog mode) over URL param (route mode)
  const id        = propAssetId != null ? String(propAssetId) : params.id;
  const isEdit    = Boolean(id);
  const isDialog  = Boolean(onSuccess || onCancel); // running inside a Dialog
  const { user }  = useAuth();

  // SP ID comes from logged-in user
  const loggedInSpId = String(user?.userId ?? '');

  const [form, setForm]       = useState(makeEmpty(loggedInSpId));
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  /* ── Specification state ── */
  const [specTemplate,        setSpecTemplate]        = useState({});  // { key: hint }
  const [specValues,          setSpecValues]          = useState({});  // { key: value }
  const [specTemplateLoading, setSpecTemplateLoading] = useState(false);

  /* ── Invoice state ── */
  const [invoiceFile,    setInvoiceFile]    = useState(null);
  const [invoiceUploading, setInvoiceUploading] = useState(false);

  /* ── Load spec template when category changes ── */
  useEffect(() => {
    const cat = form.category;
    if (!cat) { setSpecTemplate({}); setSpecValues({}); return; }
    setSpecTemplateLoading(true);
    getSpecTemplate(cat)
      .then(r => {
        const fields = r.data?.data?.fields || {};
        setSpecTemplate(fields);
        // Preserve existing values for keys that still exist
        setSpecValues(prev => {
          const next = {};
          Object.keys(fields).forEach(k => { next[k] = prev[k] || ''; });
          return next;
        });
      })
      .catch(() => { setSpecTemplate({}); setSpecValues({}); })
      .finally(() => setSpecTemplateLoading(false));
  }, [form.category]);

  /* ── Load asset for edit ── */
  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    getAssetById(id)
      .then(r => {
        const a = r.data.data;
        setForm({
          name: a.name || '', category: a.category || '', brand: a.brand || '',
          model: a.model || '', serialNumber: a.serialNumber || '',
          location: a.location || '',
          addedBySpId: a.addedBySpId || loggedInSpId,
          ownershipType: a.ownershipType || 'OWNED',
          status: a.status || 'AVAILABLE',
          purchaseDate: a.purchaseDate || '', purchaseCost: a.purchaseCost || '',
          warrantyExpiryDate: a.warrantyExpiryDate || '',
          rentalVendorName: a.rentalVendorName || '',
          rentalVendorContact: a.rentalVendorContact || '',
          rentalContractNumber: a.rentalContractNumber || '',
          rentalVendorEmail: a.rentalVendorEmail || '',
          rentalStartDate: a.rentalStartDate || '', rentalEndDate: a.rentalEndDate || '',
          rentalCostPerMonth: a.rentalCostPerMonth || '',
          rentalDepositAmount: a.rentalDepositAmount || '',
          rentalRenewalOption: a.rentalRenewalOption || false,
          rentalReturnCondition: a.rentalReturnCondition || '',
          invoiceData: '',                          // base64 not returned by backend (write-only)
          invoiceContentType: a.invoiceContentType || '',
          invoiceFileName: a.invoiceFileName || '',
          // hasInvoice flag – used to show the existing-invoice UI in edit mode
          hasInvoice: a.hasInvoice || false,
        });
        // Re-populate spec values from saved specifications
        if (Array.isArray(a.specifications) && a.specifications.length > 0) {
          const saved = {};
          a.specifications.forEach(s => { saved[s.specKey] = s.specValue || ''; });
          setSpecValues(saved);
        }
        // Note: additionalInfo field not tracked separately
      })
      .catch(() => toast.error('Failed to load asset'))
      .finally(() => setFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const markTouched = (field) => setTouched(p => ({ ...p, [field]: true }));

  const set = (field) => (e) => {
    let value = e.target.value;
    if (['name','brand','rentalVendorName','rentalReturnCondition'].includes(field))
      value = toAlphanumeric(value);
    if (field === 'model') value = value.replace(/[^a-zA-Z0-9 \-]/g, '');
    if (['serialNumber','rentalContractNumber'].includes(field))
      value = toAlphanumeric(value, true);
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) setErrors(validateExt({ ...form, [field]: value }, isEdit));
  };

  const setCheck = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }));

  const handleBlur = (field) => {
    markTouched(field);
    setErrors(validateExt(form, isEdit));
  };

  const validateExt = (f, isEdit) => {
    const e = validateAssetForm(f, isEdit);
    if (f.model?.trim() && !/^[a-zA-Z0-9 \-]+$/.test(f.model.trim()))
      e.model = 'Letters, numbers, spaces and hyphens only';
    if (f.ownershipType !== 'RENTAL' && f.purchaseDate && f.purchaseDate > today)
      e.purchaseDate = 'Cannot be a future date';
    if (f.ownershipType === 'RENTAL') {
      const ce = validateVendorContact(f.rentalVendorContact);
      if (ce) e.rentalVendorContact = ce;
      const ee = validateVendorEmail(f.rentalVendorEmail);
      if (ee) e.rentalVendorEmail = ee;
      if (f.rentalStartDate && f.rentalStartDate > today)
        e.rentalStartDate = 'Cannot be a future date';
    }
    return e;
  };

  /* ── Invoice file handler — converts to base64 in-browser, no separate upload ── */
  const handleInvoiceFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, JPG, or PNG invoices are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Invoice file must be under 10 MB');
      return;
    }
    setInvoiceFile(file);
    setInvoiceUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setForm(f => ({
        ...f,
        invoiceData: base64,
        invoiceContentType: file.type,
        invoiceFileName: file.name,
        hasInvoice: true,
      }));
      toast.success('Invoice ready — will be saved with the asset');
    } catch {
      toast.error('Failed to read invoice file');
      setInvoiceFile(null);
    } finally { setInvoiceUploading(false); }
  };

  const handleRemoveInvoice = () => {
    setInvoiceFile(null);
    setForm(f => ({ ...f, invoiceData: '', invoiceContentType: '', invoiceFileName: '', hasInvoice: false }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const allTouched = {};
    ['name','category','location','addedBySpId','serialNumber',
     'rentalVendorName','rentalStartDate','rentalEndDate']
      .forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);
    const errs = validateExt(form, isEdit);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the validation errors before submitting.');
      return;
    }
    setLoading(true);
    try {
      // Build specifications array from specValues (skip empty values)
      const specifications = Object.entries(specValues)
        .filter(([, v]) => v?.trim())
        .map(([specKey, specValue]) => ({ specKey, specValue: specValue.trim() }));

      const payload = {
        ...form,
        addedBySpId:             Number(form.addedBySpId),
        purchaseCost:            form.purchaseCost            ? Number(form.purchaseCost)            : null,
        rentalCostPerMonth:      form.rentalCostPerMonth      ? Number(form.rentalCostPerMonth)      : null,
        rentalDepositAmount:     form.rentalDepositAmount      ? Number(form.rentalDepositAmount)     : null,
        rentalVendorEmail:       form.rentalVendorEmail || null,
        invoiceData:             form.invoiceData || null,
        invoiceContentType:      form.invoiceContentType || null,
        invoiceFileName:         form.invoiceFileName || null,
        specifications,
      };
      if (isEdit) await updateAsset(id, payload);
      else        await addAsset(payload);
      toast.success(isEdit ? '✅ Asset updated successfully!' : '✅ Asset added successfully!');
      if (isDialog && onSuccess) {
        setTimeout(() => onSuccess(), 800);
      } else {
        setTimeout(() => navigate('/support/asset-service'), 1200);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: BRAND }} />
    </Box>
  );

  const isRental = form.ownershipType === 'RENTAL';

  /* fieldProps factory — keeps JSX clean */
  const fp = (name, type = 'text') => ({
    fullWidth: true, size: 'small', type,
    value: form[name],
    onChange: set(name),
    onBlur: () => handleBlur(name),
    error: touched[name] && !!errors[name],
    helperText: touched[name] ? errors[name] : '',
    sx: inputSx,
  });

  /* ── Render ── */
  return (
    <Box sx={{ fontFamily: FONT, backgroundColor: isDialog ? 'transparent' : BG, minHeight: isDialog ? 'auto' : '100vh', p: isDialog ? 0 : { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>

        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
          {!isDialog && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/support/asset-service')}
              sx={{
                fontFamily: FONT, fontWeight: 500, color: BRAND, textTransform: 'none',
                borderRadius: '10px', px: 2, py: 0.8,
                border: `1px solid ${BORDER}`, backgroundColor: CARD_BG,
                '&:hover': { backgroundColor: `${BRAND}08`, borderColor: BRAND },
              }}
            >
              Back
            </Button>
          )}

          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: '1.4rem', color: TEXT_PRI, letterSpacing: '-0.02em' }}>
                {isEdit ? 'Edit Asset' : 'Add New Asset'}
              </Typography>
              {isEdit && form.status && <StatusBadge status={form.status} />}
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT_SEC, mt: 0.3 }}>
              {isEdit ? `Updating asset · ID #${id}` : 'Register a new asset into the system'}
            </Typography>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════
            SECTION 1 — BASIC INFORMATION
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          <SectionHeader
            icon={<InventoryIcon />}
            title="Basic Information"
            subtitle="Core asset identification details"
          />

          <Box sx={{ p: 3 }}>
            <Grid container spacing={2.5}>

              {/* Row 1: Asset Name | Category */}
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Asset Name</FieldLabel>
                <TextField placeholder="e.g. Dell Latitude Laptop" {...fp('name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Category</FieldLabel>
                <FormControl fullWidth size="small" error={touched.category && !!errors.category} sx={selectSx}>
                  <Select
                    value={form.category}
                    onChange={set('category')}
                    onBlur={() => handleBlur('category')}
                    displayEmpty
                    renderValue={v => v
                      ? <Typography sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>{v.replace(/_/g, ' ')}</Typography>
                      : <Typography sx={{ fontFamily: FONT, fontSize: '0.875rem', color: '#AAA' }}>Select category</Typography>
                    }
                  >
                    {CATEGORIES.map(c => (
                      <MenuItem key={c} value={c} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>
                        {c.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.category && errors.category && (
                    <FormHelperText sx={{ fontFamily: FONT }}>{errors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Row 2: Brand | Model */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Brand</FieldLabel>
                <TextField placeholder="e.g. Dell, HP, Apple" {...fp('brand')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel>Model</FieldLabel>
                <TextField placeholder="e.g. Latitude5520" {...fp('model')} inputProps={{ inputMode: 'text' }} />
              </Grid>

              {/* Row 3: Serial Number | Location */}
              <Grid item xs={12} sm={6}>
                <FieldLabel>Serial Number</FieldLabel>
                <TextField
                  placeholder="SN-ABC12345"
                  {...fp('serialNumber')}
                  InputProps={{ sx: { fontFamily: "'Roboto Mono', monospace", fontSize: '0.875rem' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Location</FieldLabel>
                <FormControl fullWidth size="small" error={touched.location && !!errors.location} sx={selectSx}>
                  <Select
                    value={form.location}
                    onChange={set('location')}
                    onBlur={() => handleBlur('location')}
                    displayEmpty
                    renderValue={v => v
                      ? <Typography sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>{v}</Typography>
                      : <Typography sx={{ fontFamily: FONT, fontSize: '0.875rem', color: '#AAA' }}>Select location</Typography>
                    }
                  >
                    {LOCATIONS.map(l => (
                      <MenuItem key={l} value={l} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>{l}</MenuItem>
                    ))}
                  </Select>
                  {touched.location && errors.location && (
                    <FormHelperText sx={{ fontFamily: FONT }}>{errors.location}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Row 4 (edit only): Status */}
              {isEdit && (
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Status</FieldLabel>
                  <FormControl fullWidth size="small" sx={selectSx}>
                    <Select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      renderValue={v => (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <StatusBadge status={v} />
                        </Stack>
                      )}
                    >
                      {STATUSES.map(s => (
                        <MenuItem key={s} value={s} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>
                          <StatusBadge status={s} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {isEdit && <Grid item xs={12} sm={6} />}

            </Grid>
          </Box>
        </Paper>

        {/* ══════════════════════════════════════════════
            SECTION 2 — CATEGORY SPECIFICATIONS (dynamic)
        ══════════════════════════════════════════════ */}
        {form.category && (
          <Paper elevation={0} sx={sectionSx}>
            <SectionHeader
              icon={<TuneIcon />}
              title={`${form.category.replace(/_/g, ' ')} Specifications`}
              subtitle="Category-specific technical details"
              color={BRAND}
            />
            <Box sx={{ p: 3 }}>
              {specTemplateLoading ? (
                <Box sx={{ py: 2 }}>
                  <LinearProgress sx={{ borderRadius: 4, backgroundColor: `${BRAND}22`, '& .MuiLinearProgress-bar': { backgroundColor: BRAND } }} />
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: TEXT_SEC, mt: 1 }}>
                    Loading specification fields…
                  </Typography>
                </Box>
              ) : Object.keys(specTemplate).length === 0 ? (
                <Typography sx={{ fontFamily: FONT, fontSize: '0.82rem', color: TEXT_SEC, fontStyle: 'italic' }}>
                  No specific fields required for {form.category.replace(/_/g, ' ')}.
                </Typography>
              ) : (
                <>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: BRAND, mb: 2, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Fill in the relevant specifications — all fields are optional
                  </Typography>
                  <Grid container spacing={2.5}>
                    {Object.entries(specTemplate).map(([key, hint]) => (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <FieldLabel>{key}</FieldLabel>
                        <TextField
                          fullWidth size="small"
                          placeholder={hint}
                          value={specValues[key] || ''}
                          onChange={e => setSpecValues(prev => ({ ...prev, [key]: e.target.value }))}
                          sx={inputSx}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {/* Preview chips of filled specs */}
                  {Object.entries(specValues).some(([, v]) => v?.trim()) && (
                    <Box sx={{ mt: 2.5 }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: BRAND, fontWeight: 600, mb: 1 }}>
                        Preview:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {Object.entries(specValues)
                          .filter(([, v]) => v?.trim())
                          .map(([k, v]) => (
                            <Chip
                              key={k}
                              label={`${k}: ${v}`}
                              size="small"
                              sx={{
                                height: 20, fontSize: '0.68rem', fontFamily: FONT,
                                backgroundColor: `${BRAND}10`, color: BRAND,
                                border: `1px solid ${BRAND}30`, borderRadius: '5px',
                              }}
                            />
                          ))}
                      </Stack>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3 — INVOICE UPLOAD
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          <SectionHeader
            icon={<ReceiptLongIcon />}
            title="Invoice / Bill Upload"
            subtitle="Attach the purchase or rental invoice (PDF, JPG, PNG)"
            color="#059669"
          />
          <Box sx={{ p: 3 }}>
            {invoiceUploading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress sx={{ borderRadius: 4, backgroundColor: '#D1FAE5', '& .MuiLinearProgress-bar': { backgroundColor: '#059669' } }} />
                <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#059669', mt: 0.7 }}>
                  Uploading invoice…
                </Typography>
              </Box>
            )}

            {form.hasInvoice ? (
              /* Already uploaded */
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 2, p: 2,
                border: `1.5px solid #059669`, borderRadius: '12px',
                backgroundColor: '#F0FDF4',
              }}>
                <ReceiptLongIcon sx={{ color: '#059669', fontSize: 28, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: TEXT_PRI, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.invoiceFileName || 'Invoice uploaded'}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#059669', mt: 0.2 }}>
                    ✓ Invoice attached successfully
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Preview available on the detail panel after saving">
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: '#059669', fontStyle: 'italic', alignSelf: 'center', px: 1 }}>
                      Preview after save
                    </Typography>
                  </Tooltip>
                  <Tooltip title="Remove invoice">
                    <IconButton
                      size="small"
                      onClick={handleRemoveInvoice}
                      sx={{ color: '#E01950', '&:hover': { backgroundColor: '#FFF0F3' } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ) : (
              /* Upload zone */
              <Box
                component="label"
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${invoiceFile ? '#059669' : '#D1FAE5'}`,
                  borderRadius: '12px', p: 3, cursor: 'pointer',
                  backgroundColor: '#F0FDF4', transition: 'all 0.2s',
                  '&:hover': { borderColor: '#059669', backgroundColor: '#ECFDF5' },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 36, color: '#059669', mb: 1 }} />
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.88rem', color: TEXT_PRI }}>
                  Click to upload invoice
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: TEXT_SEC, mt: 0.5 }}>
                  PDF, JPG or PNG · max 10 MB
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={handleInvoiceFileChange}
                  disabled={invoiceUploading}
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* ══════════════════════════════════════════════
            SECTION 4 — OWNERSHIP TYPE
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          <SectionHeader
            icon={<BusinessIcon />}
            title="Ownership Type"
            subtitle="Choose how this asset is owned or acquired"
            color={isRental ? ACCENT : BRAND}
          />

          <Box sx={{ p: 3 }}>
            {/* Radio toggle */}
            <Box sx={{
              display: 'inline-flex', borderRadius: '12px', border: `1.5px solid ${BORDER}`,
              overflow: 'hidden', mb: 3, backgroundColor: '#F7F8FC',
            }}>
              {[
                { value: 'OWNED',  label: 'Owned',  color: BRAND },
                { value: 'RENTAL', label: 'Rental', color: ACCENT },
              ].map(opt => (
                <Box
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, ownershipType: opt.value }))}
                  sx={{
                    px: 3.5, py: 1.2, cursor: 'pointer', fontFamily: FONT,
                    fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.01em',
                    transition: 'all 0.18s ease',
                    color: form.ownershipType === opt.value ? '#fff' : TEXT_SEC,
                    backgroundColor: form.ownershipType === opt.value ? opt.color : 'transparent',
                    '&:hover': form.ownershipType !== opt.value
                      ? { backgroundColor: `${opt.color}10`, color: opt.color }
                      : {},
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 3, borderColor: BORDER }} />

            {/* ── OWNED fields ── */}
            {!isRental ? (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={4}>
                  <FieldLabel>Purchase Date</FieldLabel>
                  <TextField type="date" {...fp('purchaseDate','date')} InputLabelProps={{ shrink: true }} inputProps={{ max: today }} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FieldLabel>Purchase Cost (₹)</FieldLabel>
                  <TextField type="number" placeholder="0.00" {...fp('purchaseCost','number')} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FieldLabel>Warranty Expiry</FieldLabel>
                  <TextField type="date" {...fp('warrantyExpiryDate','date')} InputLabelProps={{ shrink: true }} inputProps={{ min: today }} />
                </Grid>
              </Grid>

            ) : (
              /* ── RENTAL fields ── */
              <>
                {/* Sub-section: Vendor */}
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <HandshakeIcon sx={{ fontSize: 16, color: ACCENT }} />
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.78rem', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Vendor Information
                    </Typography>
                  </Stack>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel required>Vendor Name</FieldLabel>
                      <TextField placeholder="e.g. TechRent Solutions" {...fp('rentalVendorName')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>Contract Number</FieldLabel>
                      <TextField placeholder="CONTRACT-001" {...fp('rentalContractNumber')} InputProps={{ sx: { fontFamily: "'Roboto Mono', monospace", fontSize: '0.875rem' } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>Contact Number</FieldLabel>
                      <TextField
                        placeholder="9876543210 or +91 9876543210" {...fp('rentalVendorContact')}
                        inputProps={{ inputMode: 'tel', maxLength: 15 }}
                        InputProps={{ startAdornment: <PhoneIcon sx={{ fontSize: 16, color: TEXT_SEC, mr: 0.5 }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>Vendor Email</FieldLabel>
                      <TextField
                        type="email" placeholder="vendor@company.com" {...fp('rentalVendorEmail')}
                        inputProps={{ inputMode: 'email' }}
                        InputProps={{ startAdornment: <EmailIcon sx={{ fontSize: 16, color: TEXT_SEC, mr: 0.5 }} /> }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />

                {/* Sub-section: Rental Period */}
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16, color: ACCENT }} />
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.78rem', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Rental Period &amp; Costs
                    </Typography>
                  </Stack>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel required>Rental Start Date</FieldLabel>
                      <TextField type="date" {...fp('rentalStartDate','date')} InputLabelProps={{ shrink: true }} inputProps={{ max: today }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel required>Rental End Date</FieldLabel>
                      <TextField type="date" {...fp('rentalEndDate','date')} InputLabelProps={{ shrink: true }} inputProps={{ min: form.rentalStartDate || today }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>Monthly Cost (₹)</FieldLabel>
                      <TextField type="number" placeholder="0.00" {...fp('rentalCostPerMonth','number')} InputProps={{ startAdornment: <AttachMoneyIcon sx={{ fontSize: 16, color: TEXT_SEC, mr: 0.5 }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>Deposit Amount (₹)</FieldLabel>
                      <TextField type="number" placeholder="0.00" {...fp('rentalDepositAmount','number')} InputProps={{ startAdornment: <AttachMoneyIcon sx={{ fontSize: 16, color: TEXT_SEC, mr: 0.5 }} /> }} />
                    </Grid>
                    <Grid item xs={12}>
                      <FieldLabel>Return Condition Notes</FieldLabel>
                      <TextField placeholder="Describe expected return condition…" {...fp('rentalReturnCondition')} multiline rows={2} />
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'inline-flex', alignItems: 'center',
                          border: `1.5px solid ${form.rentalRenewalOption ? ACCENT : BORDER}`,
                          borderRadius: '10px', px: 2, py: 0.8,
                          backgroundColor: form.rentalRenewalOption ? `${ACCENT}08` : '#FAFBFF',
                          cursor: 'pointer', transition: 'all 0.18s',
                        }}
                        onClick={() => setForm(f => ({ ...f, rentalRenewalOption: !f.rentalRenewalOption }))}
                      >
                        <Checkbox
                          checked={form.rentalRenewalOption}
                          onChange={setCheck('rentalRenewalOption')}
                          onClick={e => e.stopPropagation()}
                          size="small"
                          sx={{ color: ACCENT, p: 0.5, mr: 1, '&.Mui-checked': { color: ACCENT } }}
                        />
                        <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: form.rentalRenewalOption ? ACCENT : TEXT_SEC }}>
                          Renewal option available
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        </Paper>

        {/* ── Footer Actions ── */}
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          gap: 2, pt: 1, pb: 3,
        }}>
          <Button
            onClick={() => isDialog ? (onCancel && onCancel()) : navigate('/support/asset-service')}
            sx={{
              fontFamily: FONT, fontWeight: 500, textTransform: 'none',
              color: TEXT_SEC, borderRadius: '10px', px: 3, py: 1,
              border: `1px solid ${BORDER}`,
              '&:hover': { backgroundColor: '#F0F0F8', borderColor: '#C0C0D0' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              fontFamily: FONT, fontWeight: 700, textTransform: 'none',
              borderRadius: '10px', px: 4, py: 1,
              background: `linear-gradient(135deg, ${BRAND}, #3D3698)`,
              boxShadow: `0 4px 14px ${BRAND}40`,
              '&:hover': { background: `linear-gradient(135deg, #1B193F, ${BRAND})`, boxShadow: `0 6px 20px ${BRAND}55` },
              '&:disabled': { background: '#CCC', boxShadow: 'none' },
            }}
          >
            {loading ? 'Saving…' : isEdit ? 'Update Asset' : 'Save Asset'}
          </Button>
        </Box>

      </Box>
    </Box>
  );
}
