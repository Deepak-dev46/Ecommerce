import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Paper,
  Stack, Chip, CircularProgress, FormControl, InputLabel, Select,
  Stepper, Step, StepLabel, Divider, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import toast from '../../../utils/toast';

import {
  getServiceTypes,
  getServiceCategories,
  getSubcategoriesByCategory,
  getItemsBySubcategory,
  submitServiceRequest,
} from '../../../api/serviceCatalogApi';

/* ── Design tokens ── */
const NAVY   = '#27235C';
const PURPLE = '#97247E';
const RED    = '#E01950';
const WHITE  = '#FFFFFF';

const BORDER     = '#EBEBF5';
const SURFACE    = '#F7F6FC';
const TEXT_MUTED = '#9CA3AF';

/* ── step config ── */
const STEPS = ['Service Type', 'Category', 'Subcategory', 'Item & Details'];

const selectSx = (focused) => ({
  borderRadius: '9px',
  fontSize: '0.85rem',
  bgcolor: WHITE,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: focused ? NAVY : BORDER },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7D2FE' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: NAVY },
});

/* ── small breadcrumb badge ── */
function ContextBadge({ label, value, color = NAVY }) {
  if (!value) return null;
  return (
    <Chip
      label={<><span style={{ opacity: 0.6, fontSize: '0.65rem' }}>{label}: </span>{value}</>}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.75rem',
        fontWeight: 600,
        bgcolor: `${color}12`,
        color,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
      }}
    />
  );
}

export default function CreateRequestPage() {
  const navigate = useNavigate();

  /* ── cascade state ── */
  const [serviceTypes,  setServiceTypes]  = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items,         setItems]         = useState([]);

  const [selTypeId, setSelTypeId] = useState('');
  const [selCatId,  setSelCatId]  = useState('');
  const [selSubId,  setSelSubId]  = useState('');
  const [selItemId, setSelItemId] = useState('');
  const [itemData,  setItemData]  = useState(null);

  /* ── form ── */
  const [accessDate,  setAccessDate]  = useState('');
  const [notes,       setNotes]       = useState('');
  const [touched,     setTouched]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  /* ── loading flags ── */
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  /* ── active wizard step ── */
  const activeStep = useMemo(() => {
    if (!selTypeId) return 0;
    if (!selCatId)  return 1;
    if (!selSubId)  return 2;
    return 3;
  }, [selTypeId, selCatId, selSubId]);

  /* ── derived lookups ── */
  const selType = serviceTypes.find(t => t.id === selTypeId || String(t.id) === String(selTypeId));
  const selCat  = categories.find(c => c.id === selCatId || String(c.id) === String(selCatId));
  const selSub  = subcategories.find(s => s.id === selSubId || String(s.id) === String(selSubId));

  const filteredCats = useMemo(
    () => categories.filter(c => !selTypeId || String(c.serviceTypeId) === String(selTypeId)),
    [categories, selTypeId]
  );
  const filteredSubs = useMemo(
    () => subcategories.filter(s => !selCatId || String(s.categoryId) === String(selCatId)),
    [subcategories, selCatId]
  );

  /* ── validation ── */
  const itemError       = touched && !selItemId ? 'Please select a service item' : '';
  const accessDateError = touched && itemData?.accessDateRequired && !accessDate
    ? 'Access date is required for this item' : '';

  /* ── load service types on mount ── */
  useEffect(() => {
    getServiceTypes()
      .then(({ data }) => setServiceTypes(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load service types'));
  }, []);

  /* ── load categories when service type changes ── */
  useEffect(() => {
    if (!selTypeId) return;
    setLoadingCats(true);
    getServiceCategories()
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoadingCats(false));
  }, [selTypeId]);

  /* ── load subcategories when category changes ── */
  useEffect(() => {
    if (!selCatId) return;
    setLoadingSubs(true);
    getSubcategoriesByCategory(selCatId)
      .then(({ data }) => setSubcategories(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load subcategories'))
      .finally(() => setLoadingSubs(false));
  }, [selCatId]);

  /* ── load items when subcategory changes ── */
  useEffect(() => {
    if (!selSubId) return;
    setLoadingItems(true);
    getItemsBySubcategory(selSubId)
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load items'))
      .finally(() => setLoadingItems(false));
  }, [selSubId]);

  /* ── reset downstream on type change ── */
  const handleTypeChange = (e) => {
    setSelTypeId(e.target.value);
    setSelCatId(''); setSelSubId(''); setSelItemId('');
    setItemData(null); setAccessDate('');
    setCategories([]); setSubcategories([]); setItems([]);
  };

  /* ── reset downstream on category change ── */
  const handleCatChange = (e) => {
    setSelCatId(e.target.value);
    setSelSubId(''); setSelItemId('');
    setItemData(null); setAccessDate('');
    setSubcategories([]); setItems([]);
  };

  /* ── reset downstream on subcategory change ── */
  const handleSubChange = (e) => {
    setSelSubId(e.target.value);
    setSelItemId(''); setItemData(null); setAccessDate('');
    setItems([]);
  };

  /* ── item change ── */
  const handleItemChange = (e) => {
    const id   = e.target.value;
    const item = items.find(i => String(i.id) === String(id)) ?? null;
    setSelItemId(id);
    setItemData(item);
    setAccessDate('');
    setTouched(true);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setTouched(true);
    if (!selItemId) return;
    if (itemData?.accessDateRequired && !accessDate) return;
    setSubmitting(true);
    try {
      await submitServiceRequest(selItemId, {
        requestedBy: 1,
        notes,
        ...(itemData?.accessDateRequired ? { accessDate } : {}),
      });
      toast.success('Request submitted successfully');
      navigate('/catalog');
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 680, mx: 'auto' }}>

      {/* Back nav */}
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
        onClick={() => navigate('/catalog')}
        sx={{
          textTransform: 'none', fontSize: '0.8rem', color: TEXT_MUTED,
          mb: 2, px: 0, '&:hover': { bgcolor: 'transparent', color: NAVY },
        }}
      >
        Back to Service Catalog
      </Button>

      <Paper sx={{
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(39,35,92,0.10)',
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
      }}>

        {/* ── Header ── */}
        <Box sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #3D3490 60%, ${PURPLE} 100%)`,
          px: 3.5, py: 3,
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: WHITE, letterSpacing: -0.3 }}>
            Create Service Request
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
            Select a service type, category, and subcategory to find the right item
          </Typography>

          {/* Breadcrumb context badges */}
          {(selType || selCat || selSub) && (
            <Stack direction="row" spacing={0.8} mt={1.5} flexWrap="wrap">
              {selType && <ContextBadge label="Type" value={selType.name} color={WHITE} />}
              {selCat  && <ContextBadge label="Category" value={selCat.name} color={WHITE} />}
              {selSub  && <ContextBadge label="Subcategory" value={selSub.name} color={WHITE} />}
            </Stack>
          )}
        </Box>

        {/* ── Stepper ── */}
        <Box sx={{ px: 3.5, pt: 2.5, pb: 1, bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label, idx) => (
              <Step key={label} completed={idx < activeStep}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.7rem', fontWeight: idx === activeStep ? 700 : 500,
                      color: idx === activeStep ? NAVY : TEXT_MUTED,
                    },
                    '& .MuiStepIcon-root.Mui-active':    { color: NAVY },
                    '& .MuiStepIcon-root.Mui-completed': { color: PURPLE },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* ── Form body ── */}
        <Box sx={{ px: 3.5, py: 3 }}>
          <Stack spacing={2.5}>

            {/* ── STEP 0: Service Type ── */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8 }}>
                Step 1 — Service Type
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.85rem' }}>Service Type *</InputLabel>
                <Select
                  value={selTypeId}
                  label="Service Type *"
                  onChange={handleTypeChange}
                  sx={selectSx(!!selTypeId)}
                >
                  <MenuItem value="" disabled><em>— Choose a service type —</em></MenuItem>
                  {serviceTypes.map(t => (
                    <MenuItem key={t.id} value={t.id} sx={{ fontSize: '0.85rem' }}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* ── STEP 1: Category ── */}
            {selTypeId && (
              <>
                <Divider sx={{ borderColor: BORDER }} />
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8 }}>
                    Step 2 — Category
                  </Typography>
                  <FormControl fullWidth size="small" disabled={loadingCats}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Category *</InputLabel>
                    <Select
                      value={selCatId}
                      label="Category *"
                      onChange={handleCatChange}
                      sx={selectSx(!!selCatId)}
                      endAdornment={loadingCats ? <CircularProgress size={14} sx={{ mr: 2 }} /> : null}
                    >
                      <MenuItem value="" disabled>
                        <em>{loadingCats ? 'Loading…' : filteredCats.length === 0 ? 'No categories for this type' : '— Choose a category —'}</em>
                      </MenuItem>
                      {filteredCats.map(c => (
                        <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.85rem' }}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!loadingCats && filteredCats.length === 0 && (
                    <Alert severity="info" sx={{ mt: 1, fontSize: '0.78rem', py: 0.5 }}>
                      No categories found for this service type.
                    </Alert>
                  )}
                </Box>
              </>
            )}

            {/* ── STEP 2: Subcategory ── */}
            {selCatId && (
              <>
                <Divider sx={{ borderColor: BORDER }} />
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8 }}>
                    Step 3 — Subcategory
                  </Typography>
                  <FormControl fullWidth size="small" disabled={loadingSubs}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Subcategory *</InputLabel>
                    <Select
                      value={selSubId}
                      label="Subcategory *"
                      onChange={handleSubChange}
                      sx={selectSx(!!selSubId)}
                      endAdornment={loadingSubs ? <CircularProgress size={14} sx={{ mr: 2 }} /> : null}
                    >
                      <MenuItem value="" disabled>
                        <em>{loadingSubs ? 'Loading…' : filteredSubs.length === 0 ? 'No subcategories for this category' : '— Choose a subcategory —'}</em>
                      </MenuItem>
                      {filteredSubs.map(s => (
                        <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.85rem' }}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!loadingSubs && filteredSubs.length === 0 && (
                    <Alert severity="info" sx={{ mt: 1, fontSize: '0.78rem', py: 0.5 }}>
                      No subcategories found for this category.
                    </Alert>
                  )}
                </Box>
              </>
            )}

            {/* ── STEP 3: Item + Details ── */}
            {selSubId && (
              <>
                <Divider sx={{ borderColor: BORDER }} />
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8 }}>
                    Step 4 — Service Item &amp; Details
                  </Typography>

                  {/* Item picker */}
                  <FormControl fullWidth size="small" disabled={loadingItems} sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Service Item *</InputLabel>
                    <Select
                      value={selItemId}
                      label="Service Item *"
                      onChange={handleItemChange}
                      onBlur={() => setTouched(true)}
                      error={!!itemError}
                      sx={{
                        ...selectSx(!!selItemId),
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: itemError ? RED : selItemId ? '#24A148' : BORDER,
                        },
                      }}
                      endAdornment={loadingItems ? <CircularProgress size={14} sx={{ mr: 2 }} /> : null}
                    >
                      <MenuItem value="" disabled>
                        <em>{loadingItems ? 'Loading…' : items.length === 0 ? 'No items for this subcategory' : '— Choose a service item —'}</em>
                      </MenuItem>
                      {items.map(item => (
                        <MenuItem key={item.id} value={item.id} sx={{ fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {item.name}
                            {item.slaHours && (
                              <Chip label={`SLA: ${item.slaHours}h`} size="small" sx={{
                                height: 18, fontSize: '0.6rem', fontWeight: 700,
                                bgcolor: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE',
                              }} />
                            )}
                            {item.accessDateRequired && (
                              <Chip label="Access Date" size="small" sx={{
                                height: 18, fontSize: '0.6rem', fontWeight: 700,
                                bgcolor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD',
                              }} />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {itemError && (
                      <Typography sx={{ fontSize: '0.74rem', color: RED, mt: 0.4, ml: 1.5 }}>{itemError}</Typography>
                    )}
                    {selItemId && !itemError && (
                      <Typography sx={{ fontSize: '0.74rem', color: '#24A148', mt: 0.4, ml: 1.5, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <CheckCircleIcon sx={{ fontSize: 13 }} /> Item selected
                      </Typography>
                    )}
                    {!loadingItems && items.length === 0 && (
                      <Alert severity="info" sx={{ mt: 1, fontSize: '0.78rem', py: 0.5 }}>
                        No items found for this subcategory.
                      </Alert>
                    )}
                  </FormControl>

                  {/* Access date (conditional) */}
                  {itemData?.accessDateRequired && (
                    <Box sx={{
                      p: 2, borderRadius: '10px', mb: 2,
                      border: `1.5px solid ${accessDateError ? RED : '#C4B5FD'}`,
                      bgcolor: '#F5F3FF',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label="Access Date Required" size="small" sx={{
                          height: 20, fontSize: '0.65rem', fontWeight: 700,
                          bgcolor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD',
                        }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.78rem', color: '#4B5563', mb: 1.5 }}>
                        This item requires an access start date. Please specify when you need access to begin.
                      </Typography>
                      <TextField
                        label="Access Start Date *"
                        type="date"
                        value={accessDate}
                        onChange={e => setAccessDate(e.target.value)}
                        onBlur={() => setTouched(true)}
                        fullWidth size="small"
                        error={!!accessDateError}
                        helperText={accessDateError || (accessDate ? '✓ Date selected' : 'Select your access start date')}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        InputLabelProps={{ shrink: true }}
                        FormHelperTextProps={{
                          sx: { fontSize: '0.76rem', color: accessDateError ? RED : accessDate ? '#24A148' : TEXT_MUTED },
                        }}
                        sx={{
                          bgcolor: WHITE, borderRadius: '8px',
                          '& .MuiOutlinedInput-root fieldset': {
                            borderColor: accessDateError ? RED : accessDate ? '#24A148' : '#C4B5FD',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Notes */}
                  <TextField
                    label="Notes (optional)"
                    multiline rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    fullWidth size="small"
                    placeholder="Add any additional details or context for your request…"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '9px', fontSize: '0.85rem',
                        '& fieldset': { borderColor: BORDER },
                        '&:hover fieldset': { borderColor: '#C7D2FE' },
                        '&.Mui-focused fieldset': { borderColor: NAVY },
                      },
                    }}
                  />
                </Box>
              </>
            )}

            {/* ── Submit ── */}
            {selSubId && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || !selItemId}
                sx={{
                  mt: 0.5,
                  background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)`,
                  '&:hover': { background: `linear-gradient(135deg, #1e1a4f 0%, #7a1c66 100%)` },
                  '&.Mui-disabled': { background: '#E5E7EB', color: TEXT_MUTED },
                  borderRadius: '10px', fontWeight: 700,
                  textTransform: 'none', fontSize: '0.9rem',
                  py: 1.2, boxShadow: 'none',
                }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: WHITE }} /> Submitting…
                  </Box>
                ) : 'Submit Request'}
              </Button>
            )}

          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
