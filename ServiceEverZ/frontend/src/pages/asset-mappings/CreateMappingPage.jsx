import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Paper, CircularProgress,
  List, ListItem, ListItemText, Chip, InputAdornment,
  ClickAwayListener, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import SaveIcon               from '@mui/icons-material/Save';
import SearchIcon             from '@mui/icons-material/Search';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import CancelIcon             from '@mui/icons-material/Cancel';
import DevicesIcon            from '@mui/icons-material/Devices';
import CategoryIcon           from '@mui/icons-material/Category';
import LinkIcon               from '@mui/icons-material/Link';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import NotesIcon              from '@mui/icons-material/Notes';
import { useNavigate }        from 'react-router-dom';
import { createMapping, searchAvailableAssets } from '../../api/assetApi';
import toast from '../../utils/toast';
 
/* ── Google Fonts – Roboto ────────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href  = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap';
fontLink.rel   = 'stylesheet';
if (!document.head.querySelector('[href*="Roboto"]')) document.head.appendChild(fontLink);
 
/* ── Design tokens (mirrors AssetFormPage) ────────────────────────────── */
const BRAND    = '#27235C';
const ACCENT   = '#97247E';
const BG       = '#F7F8FC';
const CARD_BG  = '#FFFFFF';
const BORDER   = '#E8E8F0';
const TEXT_PRI = '#1A1A2E';
const TEXT_SEC = '#6B6B8A';
const FONT     = "'Roboto', sans-serif";

const CATEGORIES = [
  'LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'PROJECTOR',
  'SERVER', 'NETWORK_DEVICE', 'MOBILE', 'TABLET', 'PERIPHERAL', 'OTHER',
];
 
const DEFAULT_SP_ID = '1';
 
/* ── Reusable styles ──────────────────────────────────────────────────── */
const sectionSx = {
  backgroundColor: CARD_BG,
  borderRadius: '16px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
  // NOTE: overflow must NOT be 'hidden' here — the asset-search dropdown
  // is absolutely-positioned and would be clipped by overflow:hidden on
  // the parent Paper, making suggestions invisible.
  overflow: 'visible',
  mb: 1.5,
};
 
const sectionHeaderSx = (color = BRAND) => ({
  px: 3, py: 1.5,
  background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
  borderBottom: `1px solid ${BORDER}`,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
});
 
const inputSx = {
  fontFamily: FONT,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: FONT,
    fontSize: '0.875rem',
    backgroundColor: '#FAFBFF',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    '&:hover fieldset':        { borderColor: BRAND },
    '&.Mui-focused fieldset':  { borderColor: BRAND, borderWidth: '2px' },
    '&.Mui-error fieldset':    { borderColor: '#E01950' },
  },
  '& .MuiInputLabel-root':            { fontFamily: FONT, fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND },
  '& .MuiFormHelperText-root':         { fontFamily: FONT, fontSize: '0.72rem', mt: 0.5 },
};
 
/* ── Sub-components ───────────────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, color = BRAND }) {
  return (
    <Box sx={sectionHeaderSx(color)}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '10px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
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
    <Typography sx={{
      fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600, color: TEXT_SEC,
      letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.6,
    }}>
      {children}
      {required && <span style={{ color: '#E01950', marginLeft: 3 }}>*</span>}
    </Typography>
  );
}
 
function AssetStatusChip({ status }) {
  const map = {
    AVAILABLE: { label: 'Available', color: '#16A34A', bg: '#DCFCE7' },
    ASSIGNED:  { label: 'Assigned',  color: '#2563EB', bg: '#DBEAFE' },
    UNDER_MAINTENANCE: { label: 'Maintenance', color: '#D97706', bg: '#FEF3C7' },
  };
  const s = map[status] || { label: status, color: TEXT_SEC, bg: '#F3F4F6' };
  return (
    <Chip label={s.label} size="small" sx={{
      fontFamily: FONT, fontWeight: 600, fontSize: '0.68rem',
      color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}33`,
      height: 20, borderRadius: '6px',
    }} />
  );
}
 
/* ── Validation ───────────────────────────────────────────────────────── */
function validateForm(form, hasAsset) {
  const e = {};
  if (!hasAsset) e.assetId = 'Please search and select an asset';
  if (!form.ticketId?.trim()) e.ticketId = 'Ticket ID is required';
  else if (!/^[A-Za-z0-9\-]+$/.test(form.ticketId.trim()))
    e.ticketId = 'Ticket ID must be alphanumeric';
  return e;
}
 
/* ── Main Component ───────────────────────────────────────────────────── */
export default function CreateMappingPage() {
  const navigate = useNavigate();
 
  const [form, setForm] = useState({
    assetId: '', ticketId: '',
    assignedBySpId: DEFAULT_SP_ID, spRemarks: '',
  });
 
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
 
  const [assetQuery,       setAssetQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [assetSuggestions, setAssetSuggestions] = useState([]);
  const [selectedAsset,    setSelectedAsset]    = useState(null);
  const [searchLoading,    setSearchLoading]    = useState(false);
  const [showSuggestions,  setShowSuggestions]  = useState(false);
  const [searchFocused,    setSearchFocused]    = useState(false);
  const debounceRef = useRef(null);
 
  const [loading, setLoading] = useState(false);
 
  /* ── Field change handler ── */
  const set = (field) => (e) => {
    let value = e.target.value;
    if (['ticketId', 'assignedBySpId'].includes(field))
      value = value.replace(/[^A-Za-z0-9\-]/g, '');
    if (field === 'spRemarks')
      value = value.replace(/[^A-Za-z0-9 .,\-]/g, '');
    setForm(v => ({ ...v, [field]: value }));
    if (touched[field]) {
      setErrors(validateForm({ ...form, [field]: value }, !!selectedAsset));
    }
  };
 
  const handleBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(validateForm(form, !!selectedAsset));
  };
 
  /* ── Asset search debounce ── */
  /* Rules:
     1. A category MUST be selected before any search fires.
     2. Suggestions are ALWAYS filtered to the selected category — the
        backend enforces this; we also guard it here by never calling
        searchAvailableAssets without a category.
     3. With an empty query, the backend returns ALL available assets in
        that category — so users see suggestions immediately on focus.     */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Guard: no category → clear everything and stop.
    if (!selectedCategory) {
      setAssetSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Guard: asset already selected and query unchanged → nothing to do.
    if (selectedAsset && assetQuery === selectedAsset.name) return;

    const delay = assetQuery.trim().length >= 2 ? 350 : 150;
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // Always pass the selected category — never call without it.
        // Empty keyword → backend returns ALL AVAILABLE assets in that category.
        const res    = await searchAvailableAssets(assetQuery.trim(), selectedCategory);
        const assets = res.data.data || res.data || [];
        // Extra client-side guard: only show assets that belong to the
        // selected category (defensive, in case the backend ever omits filter).
        const filtered = Array.isArray(assets)
          ? assets.filter(a => !a.category || a.category === selectedCategory)
          : [];
        setAssetSuggestions(filtered);
        setShowSuggestions(true);
      } catch {
        setAssetSuggestions([]);
      } finally { setSearchLoading(false); }
    }, delay);
    return () => clearTimeout(debounceRef.current);
  }, [assetQuery, selectedCategory]);
 
  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setForm(v => ({ ...v, assetId: String(asset.id) }));
    setAssetQuery(asset.name);
    setShowSuggestions(false);
    setTouched(p => ({ ...p, assetId: true }));
    setErrors(p => ({ ...p, assetId: '' }));
  };
 
  const handleClearAsset = () => {
    setSelectedAsset(null);
    setForm(v => ({ ...v, assetId: '' }));
    setAssetQuery('');
    setAssetSuggestions([]);
  };

  const handleClearCategory = () => {
    setSelectedCategory('');
    handleClearAsset();
  };
 
  /* ── Submit ── */
  const handleSubmit = async () => {
    setTouched({ assetId: true, ticketId: true, assignedBySpId: true });
    const errs = validateForm(form, !!selectedAsset);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the validation errors before submitting.');
      return;
    }
    setLoading(true);
    try {
      await createMapping({
        assetId:        Number(form.assetId),
        ticketId:       Number(form.ticketId),
        assignedBySpId: Number(form.assignedBySpId),
        spRemarks:      form.spRemarks || undefined,
      });
      toast.success('✅ Mapping created successfully!');
      setTimeout(() => navigate('/support/asset-mappings'), 1200);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create mapping');
    } finally { setLoading(false); }
  };
 
  /* ── Render ── */
  return (
    <Box sx={{ fontFamily: FONT, backgroundColor: BG, minHeight: '100vh', p: { xs: 1.5, md: 2 } }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
 
        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/support/asset-mappings')}
            sx={{
              fontFamily: FONT, fontWeight: 500, color: BRAND,
              textTransform: 'none', borderRadius: '10px', px: 2, py: 0.8,
              border: `1px solid ${BORDER}`, backgroundColor: CARD_BG,
              '&:hover': { backgroundColor: `${BRAND}08`, borderColor: BRAND },
            }}
          >
            Back
          </Button>
 
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              
              <Typography sx={{
                fontFamily: FONT, fontWeight: 900, fontSize: '1.35rem',
                color: TEXT_PRI, letterSpacing: '-0.02em',
              }}>
                New Asset Mapping
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT_SEC, mt: 0.3, ml: '50px', marginLeft:'1p  x' }}>
              Create a new asset assignment request
            </Typography>
          </Box>
 
        </Box>
 
        {/* ══════════════════════════════════════════════
            SECTION 1 — ASSET SELECTION
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          <SectionHeader
            icon={<DevicesIcon />}
            title="Asset Selection"
            subtitle="Search and select an available asset to be assigned"
          />
 
          <Box sx={{ p: 2 }}>
            {/* Step 1 — Category Selector */}
            <Box sx={{ mb: 2.5 }}>
              <FieldLabel required>Select Category</FieldLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FormControl size="small" fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px', fontFamily: FONT, fontSize: '0.875rem',
                    backgroundColor: '#FAFBFF',
                    '&:hover fieldset':       { borderColor: BRAND },
                    '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: '2px' },
                  },
                  '& .MuiInputLabel-root':            { fontFamily: FONT, fontSize: '0.875rem' },
                  '& .MuiInputLabel-root.Mui-focused': { color: BRAND },
                }}>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      handleClearAsset();
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon sx={{ fontSize: 18, color: selectedCategory ? BRAND : '#aaa' }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value=""><em style={{ color: TEXT_SEC, fontFamily: FONT }}>— Choose a category first —</em></MenuItem>
                    {CATEGORIES.map(c => (
                      <MenuItem key={c} value={c} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>
                        {c.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedCategory && (
                  <Button
                    size="small"
                    onClick={handleClearCategory}
                    sx={{
                      minWidth: 0, color: '#E01950', fontSize: '0.72rem',
                      fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                      borderRadius: '6px', px: 1.5, whiteSpace: 'nowrap',
                      border: '1px solid #FFCDD2',
                      '&:hover': { backgroundColor: '#FFF0F3' },
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
              {selectedCategory && (
                <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#16A34A', mt: 0.6, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  ✓ Showing only <strong>{selectedCategory.replace(/_/g, ' ')}</strong> assets
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: '#E8E8F0', mb: 2.5 }} />

            {/* Step 2 — Asset Search Field */}
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box sx={{ position: 'relative' }}>
                <FieldLabel required>Search Asset</FieldLabel>
                <TextField
                  fullWidth size="small"
                  placeholder={selectedCategory ? `Search ${selectedCategory.replace(/_/g,' ')} assets by name, tag or serial…` : 'Select a category first…'}
                  value={assetQuery}
                  disabled={!selectedCategory}
                  onChange={(e) => {
                    setAssetQuery(e.target.value);
                    if (selectedAsset) handleClearAsset();
                  }}
                  onFocus={() => {
                    // When the user focuses the search field and a category is already
                    // selected, show suggestions immediately (even before typing).
                    if (selectedCategory && !selectedAsset) setShowSuggestions(true);
                  }}
                  onBlur={() => handleBlur('assetId')}
                  error={touched.assetId && !!errors.assetId}
                  helperText={touched.assetId ? errors.assetId : ''}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {searchLoading
                          ? <CircularProgress size={16} sx={{ color: BRAND }} />
                          : selectedAsset
                          ? <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                          : <SearchIcon sx={{ color: '#aaa', fontSize: 20 }} />}
                      </InputAdornment>
                    ),
                    endAdornment: selectedAsset && (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={handleClearAsset}
                          startIcon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
                          sx={{
                            minWidth: 0, color: '#E01950', fontSize: '0.72rem',
                            fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                            borderRadius: '6px', px: 1,
                            '&:hover': { backgroundColor: '#FFF0F3' },
                          }}
                        >
                          Clear
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
 
                {/* Dropdown suggestions */}
                {showSuggestions && assetSuggestions.length > 0 && (
                  <Paper elevation={8} sx={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    zIndex: 1300, mt: 0.5, borderRadius: '12px',
                    overflow: 'hidden', maxHeight: 300, overflowY: 'auto',
                    border: `1px solid ${BORDER}`,
                    boxShadow: `0 8px 32px rgba(39,35,92,0.14)`,
                  }}>
                    {/* Header showing context: filtered by category, with result count */}
                    <Box sx={{
                      px: 2.5, py: 1, backgroundColor: `${BRAND}06`,
                      borderBottom: `1px solid ${BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: TEXT_SEC, fontWeight: 600 }}>
                        {assetQuery.trim()
                          ? <>Results for &ldquo;{assetQuery}&rdquo; in <strong style={{color: BRAND}}>{selectedCategory?.replace(/_/g,' ')}</strong></>
                          : <>All available <strong style={{color: BRAND}}>{selectedCategory?.replace(/_/g,' ')}</strong> assets</>}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: TEXT_SEC }}>
                        {assetSuggestions.length} found
                      </Typography>
                    </Box>
                    <List dense disablePadding>
                      {assetSuggestions.map((asset, idx) => (
                        <ListItem
                          key={asset.id}
                          onClick={() => handleSelectAsset(asset)}
                          sx={{
                            py: 1.4, px: 2.5,
                            borderBottom: idx < assetSuggestions.length - 1 ? `1px solid ${BORDER}` : 'none',
                            cursor: 'pointer', transition: 'background 0.12s',
                            '&:hover': { backgroundColor: `${BRAND}08` },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.88rem', color: TEXT_PRI }}>
                                  {asset.name}
                                </Typography>
                                <Chip
                                  label={`#${asset.id}`} size="small"
                                  sx={{ height: 18, fontSize: '0.68rem', fontFamily: FONT, fontWeight: 600, backgroundColor: BRAND, color: '#fff', borderRadius: '5px' }}
                                />
                                {asset.status && <AssetStatusChip status={asset.status} />}
                              </Box>
                            }
                            secondary={
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: TEXT_SEC, mt: 0.3 }}>
                                {[
                                  asset.category?.replace(/_/g, ' '),
                                  asset.brand,
                                  asset.model,
                                  asset.assetTag,
                                ].filter(Boolean).join(' · ')}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
 
                {/* No results */}
                {showSuggestions && !searchLoading && assetSuggestions.length === 0 && (
                  <Paper elevation={4} sx={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    zIndex: 1300, mt: 0.5, borderRadius: '10px', p: 2.5,
                    border: `1px solid ${BORDER}`,
                    boxShadow: `0 4px 16px rgba(39,35,92,0.08)`,
                  }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.82rem', color: TEXT_SEC, textAlign: 'center' }}>
                      {assetQuery.trim()
                        ? <>No available <strong>{selectedCategory?.replace(/_/g, ' ')}</strong> assets found for &ldquo;{assetQuery}&rdquo;</>
                        : <>No available <strong>{selectedCategory?.replace(/_/g, ' ')}</strong> assets found</>}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
 
            {/* ── Selected Asset Card ── */}
            {selectedAsset && (
              <Box sx={{
                mt: 2.5, p: 2, borderRadius: '12px',
                border: `1.5px solid ${BRAND}33`,
                background: `linear-gradient(135deg, ${BRAND}05 0%, ${BRAND}02 100%)`,
                display: 'flex', alignItems: 'flex-start', gap: 2,
              }}>
                <Box sx={{
                  width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${BRAND}20, ${BRAND}10)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DevicesIcon sx={{ color: BRAND, fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: TEXT_PRI }}>
                      {selectedAsset.name}
                    </Typography>
                    <Chip
                      label={`ID #${selectedAsset.id}`} size="small"
                      sx={{ height: 20, fontSize: '0.68rem', fontFamily: FONT, fontWeight: 600, backgroundColor: BRAND, color: '#fff', borderRadius: '5px' }}
                    />
                    {selectedAsset.status && <AssetStatusChip status={selectedAsset.status} />}
                  </Stack>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.76rem', color: TEXT_SEC, mt: 0.4 }}>
                    {[
                      selectedAsset.category?.replace(/_/g, ' '),
                      selectedAsset.brand,
                      selectedAsset.model,
                    ].filter(Boolean).join(' · ')}
                    {selectedAsset.assetTag && (
                      <span style={{ fontFamily: "'Roboto Mono', monospace", marginLeft: 6, color: '#999' }}>
                        {selectedAsset.assetTag}
                      </span>
                    )}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20, flexShrink: 0, mt: 0.3 }} />
              </Box>
            )}
          </Box>
        </Paper>
 
        {/* ══════════════════════════════════════════════
            SECTION 2 — MAPPING DETAILS
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          <SectionHeader
            icon={<ConfirmationNumberIcon />}
            title="Mapping Details"
            subtitle="Provide the ticket and any additional remarks"
            color={ACCENT}
          />
 
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
 
              {/* Ticket ID */}
              <Grid item xs={12} sm={6}>
                <FieldLabel required>Ticket ID</FieldLabel>
                <TextField
                  fullWidth size="small"
                  placeholder="e.g. 101"
                  value={form.ticketId}
                  onChange={set('ticketId')}
                  onBlur={() => handleBlur('ticketId')}
                  error={touched.ticketId && !!errors.ticketId}
                  helperText={touched.ticketId ? errors.ticketId : ''}
                  inputProps={{ maxLength: 30 }}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ConfirmationNumberIcon sx={{ fontSize: 16, color: TEXT_SEC }} />
                      </InputAdornment>
                    ),
                    sx: { fontFamily: "'Roboto Mono', monospace", fontSize: '0.875rem' },
                  }}
                />
              </Grid>
 
              {/* Spacer to keep 2-col grid balanced */}
              <Grid item xs={12} sm={6} />
 
              {/* SP Remarks — full width */}
              <Grid item xs={12}>
                <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <NotesIcon sx={{ fontSize: 15, color: ACCENT }} />
                  <Typography sx={{
                    fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem',
                    color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    Support Personnel Remarks
                  </Typography>
                </Stack>
                <TextField
                  fullWidth size="small"
                  placeholder="Add any notes or context about this assignment request…"
                  value={form.spRemarks}
                  onChange={set('spRemarks')}
                  multiline rows={3}
                  sx={inputSx}
                />
                <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: TEXT_SEC, mt: 0.7 }}>
                  Optional · Visible to manager during review
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
 
        {/* ── Footer Actions ── */}
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          gap: 2, pt: 1, pb: 4,
        }}>
          <Button
            onClick={() => navigate('/support/asset-mappings')}
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
              background: `linear-gradient(135deg, ${BRAND}, #292387)`,
              boxShadow: `0 4px 14px ${BRAND}40`,
              '&:hover': { background: `linear-gradient(135deg, #1B193F, ${BRAND})`, boxShadow: `0 6px 20px ${BRAND}55` },
              '&:disabled': { background: '#CCC', boxShadow: 'none' },
            }}
          >
            {loading ? 'Creating…' : 'Create Mapping'}
          </Button>
        </Box>
 
      </Box>
    </Box>
  );
}
