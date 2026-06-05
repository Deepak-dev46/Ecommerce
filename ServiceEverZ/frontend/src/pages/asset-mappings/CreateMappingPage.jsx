import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Paper, CircularProgress,
  List, ListItem, ListItemText, Chip, InputAdornment,
  ClickAwayListener, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, Alert,
  Tooltip,
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
import TuneIcon               from '@mui/icons-material/Tune';
import RefreshIcon            from '@mui/icons-material/Refresh';
import AssignmentIcon         from '@mui/icons-material/Assignment';
import InfoOutlinedIcon       from '@mui/icons-material/InfoOutlined';
import { useNavigate }        from 'react-router-dom';
import { useAuth }            from '../../context/AuthContext';
import {
  createMapping,
  searchAvailableAssets,
  searchAssetsBySpecs,
  getSpecTemplate,
  getHardwareInProgressTickets,
} from '../../api/assetApi';
import toast from '../../utils/toast';

/* ── Google Fonts – Roboto ────────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href  = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap';
fontLink.rel   = 'stylesheet';
if (!document.head.querySelector('[href*="Roboto"]')) document.head.appendChild(fontLink);

/* ── Design tokens ────────────────────────────────────────────────────── */
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

/* ── Styles ───────────────────────────────────────────────────────────── */
const sectionSx = {
  backgroundColor: CARD_BG,
  borderRadius: '16px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
  overflow: 'visible',  // needed for dropdown to not be clipped
  mb: 1.5,
};

const sectionHeaderSx = (color = BRAND) => ({
  px: 3, py: 1.5,
  background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
  borderBottom: `1px solid ${BORDER}`,
  borderRadius: '16px 16px 0 0',
  display: 'flex', alignItems: 'center', gap: 1.5,
});

const inputSx = {
  fontFamily: FONT,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontFamily: FONT, fontSize: '0.875rem',
    backgroundColor: '#FAFBFF', transition: 'box-shadow 0.2s, border-color 0.2s',
    '&:hover fieldset':        { borderColor: BRAND },
    '&.Mui-focused fieldset':  { borderColor: BRAND, borderWidth: '2px' },
    '&.Mui-error fieldset':    { borderColor: '#E01950' },
  },
  '& .MuiInputLabel-root':            { fontFamily: FONT, fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND },
  '& .MuiFormHelperText-root':         { fontFamily: FONT, fontSize: '0.72rem', mt: 0.5 },
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

function TicketPriorityChip({ priority }) {
  const map = {
    HIGH:     { color: '#DC2626', bg: '#FEE2E2' },
    MEDIUM:   { color: '#D97706', bg: '#FEF3C7' },
    LOW:      { color: '#16A34A', bg: '#DCFCE7' },
    CRITICAL: { color: '#7C3AED', bg: '#EDE9FE' },
  };
  const s = map[priority?.toUpperCase()] || { color: TEXT_SEC, bg: '#F3F4F6' };
  return (
    <Chip label={priority || 'N/A'} size="small" sx={{
      fontFamily: FONT, fontWeight: 600, fontSize: '0.65rem',
      color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}33`,
      height: 18, borderRadius: '5px',
    }} />
  );
}

/* ── Validation ───────────────────────────────────────────────────────── */
function validateForm(form, hasAsset, hasTicket) {
  const e = {};
  if (!hasAsset) e.assetId = 'Please search and select an asset';
  if (!hasTicket) e.ticketId = 'Please select a ticket from the list';
  return e;
}

/* ── Main Component ───────────────────────────────────────────────────── */
export default function CreateMappingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // SP ID is always the logged-in user's ID
  const loggedInSpId = String(user?.userId ?? '');

  const [form, setForm] = useState({
    assetId: '', ticketId: '',
    assignedBySpId: loggedInSpId, spRemarks: '',
  });

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  /* ── Asset search ── */
  const [assetQuery,       setAssetQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [assetSuggestions, setAssetSuggestions] = useState([]);
  const [selectedAsset,    setSelectedAsset]    = useState(null);
  const [searchLoading,    setSearchLoading]    = useState(false);
  const [showSuggestions,  setShowSuggestions]  = useState(false);
  const debounceRef = useRef(null);

  /* ── Specification search filters ── */
  const [specTemplate,        setSpecTemplate]        = useState({}); // { key: hint }
  const [specFilters,         setSpecFilters]         = useState({}); // { key: value }
  const [specTemplateLoading, setSpecTemplateLoading] = useState(false);
  const [showSpecFilter,      setShowSpecFilter]      = useState(false);
  const [hasActiveSpecFilter, setHasActiveSpecFilter] = useState(false);

  /* ── Ticket list (from backend) ── */
  const [tickets,        setTickets]        = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketSearch,   setTicketSearch]   = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAllTickets, setShowAllTickets] = useState(false);
  // Whether the ticket grid is collapsed (after selection)
  const [ticketGridCollapsed, setTicketGridCollapsed] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ── Load spec template when category changes ── */
  useEffect(() => {
    if (!selectedCategory) {
      setSpecTemplate({});
      setSpecFilters({});
      setShowSpecFilter(false);
      setHasActiveSpecFilter(false);
      return;
    }
    setSpecTemplateLoading(true);
    getSpecTemplate(selectedCategory)
      .then(r => {
        const fields = r.data?.data?.fields || {};
        setSpecTemplate(fields);
        setSpecFilters({});
        setHasActiveSpecFilter(false);
      })
      .catch(() => setSpecTemplate({}))
      .finally(() => setSpecTemplateLoading(false));
  }, [selectedCategory]);

  /* ── Fetch hardware IN_PROGRESS tickets for SP ── */
  useEffect(() => {
    if (!form.assignedBySpId) { setTickets([]); return; }
    loadTickets(form.assignedBySpId, ticketSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.assignedBySpId]);

  const loadTickets = async (spId, keyword) => {
    setTicketsLoading(true);
    try {
      const res = await getHardwareInProgressTickets(spId, keyword);
      setTickets(res.data?.data || res.data || []);
    } catch {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleTicketSearchChange = (val) => {
    setTicketSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadTickets(form.assignedBySpId, val);
    }, 350);
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setForm(v => ({ ...v, ticketId: String(ticket.id) }));
    setTouched(p => ({ ...p, ticketId: true }));
    setErrors(p => ({ ...p, ticketId: '' }));
    setTicketGridCollapsed(true);   // collapse grid once a ticket is chosen
  };

  const handleClearTicket = () => {
    setSelectedTicket(null);
    setForm(v => ({ ...v, ticketId: '' }));
    setTicketGridCollapsed(false);  // re-expand grid
    setShowAllTickets(false);
  };

  /* ── Asset search with optional spec filters ── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!selectedCategory) { setAssetSuggestions([]); setShowSuggestions(false); return; }
    if (selectedAsset && assetQuery === selectedAsset.name) return;

    const activeSpecs = Object.fromEntries(
      Object.entries(specFilters).filter(([, v]) => v?.trim())
    );
    const useSpecSearch = Object.keys(activeSpecs).length > 0;

    // Fire immediately when spec filters are active; otherwise require ≥2 chars typed
    if (!useSpecSearch && assetQuery.trim().length < 2) {
      setAssetSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        let assets = [];
        if (useSpecSearch) {
          const res = await searchAssetsBySpecs(activeSpecs, assetQuery.trim(), selectedCategory);
          assets = res.data?.data || res.data || [];
        } else {
          const res = await searchAvailableAssets(assetQuery.trim(), selectedCategory);
          assets = res.data?.data || res.data || [];
        }
        const filtered = Array.isArray(assets)
          ? assets.filter(a => !a.category || a.category === selectedCategory)
          : [];
        setAssetSuggestions(filtered);
        setShowSuggestions(true);
      } catch {
        setAssetSuggestions([]);
      } finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetQuery, selectedCategory, specFilters]);

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

  const handleSpecFilterChange = (key, val) => {
    const updated = { ...specFilters, [key]: val };
    setSpecFilters(updated);
    setHasActiveSpecFilter(Object.values(updated).some(v => v?.trim()));
    if (selectedAsset) handleClearAsset();
  };

  const handleClearSpecFilters = () => {
    setSpecFilters({});
    setHasActiveSpecFilter(false);
    if (selectedAsset) handleClearAsset();
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setTouched({ assetId: true, ticketId: true, assignedBySpId: true });
    const errs = validateForm(form, !!selectedAsset, !!selectedTicket);
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
            <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: '1.35rem', color: TEXT_PRI, letterSpacing: '-0.02em' }}>
              New Asset Mapping
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT_SEC, mt: 0.3 }}>
              Create a new asset assignment request
            </Typography>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════
            SECTION 1 — TICKET SELECTION (compact cards)
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          <SectionHeader
            icon={<AssignmentIcon />}
            title="Ticket Selection"
            subtitle="Select an IN_PROGRESS Hardware ticket assigned to this SP"
            color={ACCENT}
          />
          <Box sx={{ p: 2 }}>

            {/* Selected ticket banner — shown at top when a ticket is picked */}
            {selectedTicket && (
              <Box sx={{
                mb: 2, p: 1.5, borderRadius: '10px',
                border: `1.5px solid ${ACCENT}40`,
                background: `linear-gradient(135deg, ${ACCENT}08 0%, ${ACCENT}03 100%)`,
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}12)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircleIcon sx={{ color: ACCENT, fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.8} flexWrap="wrap">
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT_PRI }}>
                      {selectedTicket.subject}
                    </Typography>
                    <Chip
                      label={selectedTicket.ticketNumber || `#${selectedTicket.id}`} size="small"
                      sx={{ height: 18, fontSize: '0.63rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 700, backgroundColor: ACCENT, color: '#fff', borderRadius: '5px' }}
                    />
                    {selectedTicket.priority && <TicketPriorityChip priority={selectedTicket.priority} />}
                  </Stack>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: TEXT_SEC, mt: 0.2 }}>
                    {[
                      selectedTicket.requesterName && `Requester: ${selectedTicket.requesterName}`,
                      selectedTicket.location,
                      selectedTicket.subCategory,
                    ].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
                <Button
                  size="small" onClick={handleClearTicket}
                  startIcon={<CancelIcon sx={{ fontSize: '13px !important' }} />}
                  sx={{
                    flexShrink: 0, minWidth: 0, color: '#E01950', fontSize: '0.7rem',
                    fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                    borderRadius: '6px', px: 1,
                    '&:hover': { backgroundColor: '#FFF0F3' },
                  }}
                >
                  Change
                </Button>
              </Box>
            )}

            {/* Search + count row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth size="small"
                  placeholder="Search by subject, ticket number, or requester…"
                  value={ticketSearch}
                  onChange={e => handleTicketSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {ticketsLoading
                          ? <CircularProgress size={15} sx={{ color: BRAND }} />
                          : <SearchIcon sx={{ fontSize: 17, color: '#aaa' }} />}
                      </InputAdornment>
                    ),
                    endAdornment: ticketSearch && (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => { setTicketSearch(''); loadTickets(form.assignedBySpId, ''); }}
                          sx={{ minWidth: 0, color: TEXT_SEC, fontSize: '0.7rem', fontFamily: FONT, textTransform: 'none', p: 0.3 }}
                        >
                          ✕
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>
              {!ticketsLoading && tickets.length > 0 && (
                <Box sx={{
                  px: 1.5, py: 0.6, borderRadius: '8px', flexShrink: 0,
                  backgroundColor: `${BRAND}08`, border: `1px solid ${BRAND}20`,
                }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 700, color: BRAND }}>
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Ticket grid */}
            {ticketGridCollapsed ? null : ticketsLoading && !tickets.length ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, px: 1 }}>
                <CircularProgress size={16} sx={{ color: ACCENT }} />
                <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT_SEC }}>
                  Fetching tickets…
                </Typography>
              </Box>
            ) : tickets.length === 0 ? (
              <Box sx={{
                border: `1.5px dashed ${BORDER}`, borderRadius: '12px', p: 2.5,
                textAlign: 'center', backgroundColor: '#FAFBFF',
              }}>
                <InfoOutlinedIcon sx={{ fontSize: 26, color: '#CCC', mb: 0.8 }} />
                <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT_SEC }}>
                  {ticketSearch ? `No tickets match "${ticketSearch}"` : 'No IN_PROGRESS Hardware tickets found.'}
                </Typography>
              </Box>
            ) : (() => {
              // Show only 2 initially (or all if expanded / searching)
              const visibleTickets = (showAllTickets || ticketSearch) ? tickets : tickets.slice(0, 2);
              return (
                <>
                  <Grid container spacing={1}>
                    {visibleTickets.map((ticket) => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      return (
                        <Grid item xs={12} sm={6} key={ticket.id}>
                          <Box
                            onClick={() => handleSelectTicket(ticket)}
                            sx={{
                              p: 1.4, borderRadius: '10px', cursor: 'pointer',
                              border: `1.5px solid ${isSelected ? ACCENT : BORDER}`,
                              backgroundColor: isSelected ? `${ACCENT}07` : CARD_BG,
                              transition: 'all 0.15s',
                              position: 'relative',
                              '&:hover': {
                                borderColor: isSelected ? ACCENT : `${BRAND}50`,
                                backgroundColor: isSelected ? `${ACCENT}10` : `${BRAND}04`,
                                boxShadow: '0 2px 8px rgba(39,35,92,0.08)',
                              },
                            }}
                          >
                            {/* Ticket number + priority row */}
                            <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mb: 0.6 }}>
                              <Chip
                                label={ticket.ticketNumber || `#${ticket.id}`} size="small"
                                sx={{
                                  height: 17, fontSize: '0.6rem', fontFamily: "'Roboto Mono', monospace",
                                  fontWeight: 700, backgroundColor: isSelected ? ACCENT : `${BRAND}15`,
                                  color: isSelected ? '#fff' : BRAND, borderRadius: '4px',
                                }}
                              />
                              {ticket.priority && <TicketPriorityChip priority={ticket.priority} />}
                              {isSelected && (
                                <CheckCircleIcon sx={{ color: ACCENT, fontSize: 14, ml: 'auto !important' }} />
                              )}
                            </Stack>

                            {/* Subject */}
                            <Typography sx={{
                              fontFamily: FONT, fontWeight: 600, fontSize: '0.8rem',
                              color: TEXT_PRI,
                              lineHeight: 1.3, mb: 0.4,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {ticket.subject || 'Untitled Ticket'}
                            </Typography>

                            {/* Meta row */}
                            <Typography sx={{
                              fontFamily: FONT, fontSize: '0.68rem', color: TEXT_SEC,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {[
                                ticket.requesterName,
                                ticket.location,
                                ticket.subCategory,
                              ].filter(Boolean).join(' · ') || 'No additional info'}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Show all / Show less toggle — only when not searching */}
                  {!ticketSearch && tickets.length > 2 && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setShowAllTickets(v => !v)}
                        sx={{
                          fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600,
                          textTransform: 'none', color: BRAND,
                          '&:hover': { backgroundColor: `${BRAND}08` },
                        }}
                      >
                        {showAllTickets
                          ? `Show less`
                          : `Show all ${tickets.length} tickets`}
                      </Button>
                      {!showAllTickets && (
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: TEXT_SEC }}>
                          (+{tickets.length - 2} more)
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              );
            })()}

            {touched.ticketId && errors.ticketId && (
              <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#E01950', mt: 1 }}>
                {errors.ticketId}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* ══════════════════════════════════════════════
            SECTION 2 — ASSET SELECTION (with spec filter)
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
                <FormControl size="small" fullWidth sx={selectSx}>
                  <Select
                    value={selectedCategory}
                    displayEmpty
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      handleClearAsset();
                    }}
                    renderValue={v => v
                      ? <Typography sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>{v.replace(/_/g, ' ')}</Typography>
                      : <Typography sx={{ fontFamily: FONT, fontSize: '0.875rem', color: '#AAA' }}>— Choose a category first —</Typography>
                    }
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon sx={{ fontSize: 18, color: selectedCategory ? BRAND : '#aaa' }} />
                      </InputAdornment>
                    }
                  >
                    {CATEGORIES.map(c => (
                      <MenuItem key={c} value={c} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>
                        {c.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedCategory && (
                  <Button
                    size="small" onClick={handleClearCategory}
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
                <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#16A34A', mt: 0.6 }}>
                  ✓ Showing only <strong>{selectedCategory.replace(/_/g, ' ')}</strong> assets
                </Typography>
              )}
            </Box>

            {/* Spec filter toggle */}
            {selectedCategory && Object.keys(specTemplate).length > 0 && (
              <>
                <Divider sx={{ borderColor: BORDER, mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: showSpecFilter ? 1.5 : 0 }}>
                    <Button
                      size="small"
                      startIcon={<TuneIcon />}
                      onClick={() => setShowSpecFilter(v => !v)}
                      sx={{
                        fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem',
                        textTransform: 'none', borderRadius: '8px', px: 2, py: 0.7,
                        color: BRAND,
                        border: `1px solid ${hasActiveSpecFilter ? BRAND : BORDER}`,
                        backgroundColor: hasActiveSpecFilter ? `${BRAND}10` : `${BRAND}06`,
                        '&:hover': { backgroundColor: `${BRAND}14`, borderColor: BRAND },
                      }}
                    >
                      Filter by Specifications
                      {hasActiveSpecFilter && (
                        <Chip label="Active" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem', fontFamily: FONT, fontWeight: 700, backgroundColor: BRAND, color: '#fff', borderRadius: '4px' }} />
                      )}
                    </Button>
                    {hasActiveSpecFilter && (
                      <Button
                        size="small" onClick={handleClearSpecFilters}
                        sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#E01950', textTransform: 'none', fontWeight: 600 }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </Box>

                  {showSpecFilter && (
                    <Box sx={{
                      border: `1px solid ${BRAND}25`, borderRadius: '12px', p: 2,
                      backgroundColor: `${BRAND}04`,
                    }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 700, color: BRAND, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Specification Filters · {selectedCategory.replace(/_/g, ' ')}
                      </Typography>
                      <Grid container spacing={1.5}>
                        {Object.entries(specTemplate).map(([key, hint]) => (
                          <Grid item xs={12} sm={6} md={4} key={key}>
                            <TextField
                              fullWidth size="small"
                              label={key}
                              placeholder={hint}
                              value={specFilters[key] || ''}
                              onChange={e => handleSpecFilterChange(key, e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px', fontSize: '0.82rem', backgroundColor: '#FFFFFF',
                                  '&:hover fieldset': { borderColor: BRAND },
                                  '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: '2px' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: BRAND },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: TEXT_SEC, mt: 1.5 }}>
                        💡 Fill one or more fields — matching assets appear below as you type.
                      </Typography>

                      {/* ── Inline spec-results panel ── */}
                      {hasActiveSpecFilter && (
                        <Box sx={{ mt: 2 }}>
                          {searchLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                              <CircularProgress size={14} sx={{ color: BRAND }} />
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: TEXT_SEC }}>Searching assets…</Typography>
                            </Box>
                          ) : assetSuggestions.length === 0 ? (
                            <Box sx={{ py: 1.5, textAlign: 'center', borderRadius: '8px', border: `1px dashed ${BORDER}`, backgroundColor: '#FAFBFF' }}>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: TEXT_SEC }}>
                                No available {selectedCategory?.replace(/_/g, ' ')} assets match these specs
                              </Typography>
                            </Box>
                          ) : (
                            <>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 700, color: BRAND, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {assetSuggestions.length} matching asset{assetSuggestions.length !== 1 ? 's' : ''}
                              </Typography>
                              <Grid container spacing={1}>
                                {assetSuggestions.map(asset => (
                                  <Grid item xs={12} sm={6} key={asset.id}>
                                    <Box
                                      onClick={() => { handleSelectAsset(asset); setShowSpecFilter(false); }}
                                      sx={{
                                        p: 1.4, borderRadius: '10px', cursor: 'pointer',
                                        border: `1.5px solid ${selectedAsset?.id === asset.id ? BRAND : BORDER}`,
                                        backgroundColor: selectedAsset?.id === asset.id ? `${BRAND}07` : '#FFFFFF',
                                        transition: 'all 0.15s',
                                        '&:hover': { borderColor: BRAND, backgroundColor: `${BRAND}05`, boxShadow: '0 2px 8px rgba(39,35,92,0.08)' },
                                      }}
                                    >
                                      <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.5 }}>
                                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: TEXT_PRI, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {asset.name}
                                        </Typography>
                                        {selectedAsset?.id === asset.id
                                          ? <CheckCircleIcon sx={{ color: BRAND, fontSize: 15, flexShrink: 0 }} />
                                          : <Chip label={`#${asset.id}`} size="small" sx={{ height: 16, fontSize: '0.6rem', fontFamily: FONT, fontWeight: 700, backgroundColor: `${BRAND}15`, color: BRAND, borderRadius: '4px', flexShrink: 0 }} />}
                                      </Stack>
                                      <Typography sx={{ fontFamily: FONT, fontSize: '0.69rem', color: TEXT_SEC, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {[asset.brand, asset.model, asset.assetTag].filter(Boolean).join(' · ')}
                                      </Typography>
                                      {Array.isArray(asset.specifications) && asset.specifications.length > 0 && (
                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                          {asset.specifications.slice(0, 3).map(s => (
                                            <Chip key={s.specKey} label={`${s.specKey}: ${s.specValue}`} size="small"
                                              sx={{ height: 16, fontSize: '0.6rem', fontFamily: FONT, backgroundColor: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD', borderRadius: '4px' }}
                                            />
                                          ))}
                                        </Stack>
                                      )}
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </>
            )}

            <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />

            {/* Step 2 — Asset Search Field */}
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box sx={{ position: 'relative' }}>
                <FieldLabel required>Search Asset</FieldLabel>
                <TextField
                  fullWidth size="small"
                  placeholder={selectedCategory ? `Search ${selectedCategory.replace(/_/g, ' ')} assets by name, tag or serial…` : 'Select a category first…'}
                  value={assetQuery}
                  disabled={!selectedCategory}
                  onChange={(e) => {
                    setAssetQuery(e.target.value);
                    if (selectedAsset) handleClearAsset();
                  }}
                  onFocus={() => {
                    if (selectedCategory && !selectedAsset && assetQuery.trim().length >= 2) setShowSuggestions(true);
                  }}
                  onBlur={() => setTouched(p => ({ ...p, assetId: true }))}
                  error={touched.assetId && !!errors.assetId}
                  helperText={touched.assetId && errors.assetId ? errors.assetId : (selectedCategory && !selectedAsset && !hasActiveSpecFilter ? 'Type at least 2 characters to search, or use spec filters above to find assets' : '')}
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
                          size="small" onClick={handleClearAsset}
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

                {/* Dropdown — hidden when spec-inline-panel is showing results instead */}
                {showSuggestions && assetSuggestions.length > 0 && !hasActiveSpecFilter && (
                  <Paper elevation={8} sx={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    zIndex: 1300, mt: 0.5, borderRadius: '12px',
                    overflow: 'hidden', maxHeight: 300, overflowY: 'auto',
                    border: `1px solid ${BORDER}`,
                    boxShadow: `0 8px 32px rgba(39,35,92,0.14)`,
                  }}>
                    <Box sx={{
                      px: 2.5, py: 1, backgroundColor: `${BRAND}06`,
                      borderBottom: `1px solid ${BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: TEXT_SEC, fontWeight: 600 }}>
                        {hasActiveSpecFilter
                          ? <>Spec-filtered <strong style={{ color: BRAND }}>{selectedCategory?.replace(/_/g, ' ')}</strong> assets</>
                          : assetQuery.trim()
                          ? <>Results for &ldquo;{assetQuery}&rdquo; in <strong style={{ color: BRAND }}>{selectedCategory?.replace(/_/g, ' ')}</strong></>
                          : <>All available <strong style={{ color: BRAND }}>{selectedCategory?.replace(/_/g, ' ')}</strong> assets</>}
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
                              <Box>
                                <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: TEXT_SEC, mt: 0.3 }}>
                                  {[
                                    asset.category?.replace(/_/g, ' '),
                                    asset.brand, asset.model, asset.assetTag,
                                  ].filter(Boolean).join(' · ')}
                                </Typography>
                                {/* Show spec values inline */}
                                {Array.isArray(asset.specifications) && asset.specifications.length > 0 && (
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                    {asset.specifications.slice(0, 4).map(s => (
                                      <Chip
                                        key={s.specKey}
                                        label={`${s.specKey}: ${s.specValue}`}
                                        size="small"
                                        sx={{
                                          height: 17, fontSize: '0.63rem', fontFamily: FONT,
                                          backgroundColor: '#F0F9FF', color: '#0284C7',
                                          border: '1px solid #BAE6FD', borderRadius: '4px',
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}

                {/* No results */}
                {showSuggestions && !searchLoading && assetSuggestions.length === 0 && !hasActiveSpecFilter && (
                  <Paper elevation={4} sx={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    zIndex: 1300, mt: 0.5, borderRadius: '10px', p: 2.5,
                    border: `1px solid ${BORDER}`,
                    boxShadow: `0 4px 16px rgba(39,35,92,0.08)`,
                  }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.82rem', color: TEXT_SEC, textAlign: 'center' }}>
                      {hasActiveSpecFilter
                        ? <>No available <strong>{selectedCategory?.replace(/_/g, ' ')}</strong> assets match the spec filters</>
                        : assetQuery.trim()
                        ? <>No available <strong>{selectedCategory?.replace(/_/g, ' ')}</strong> assets found for &ldquo;{assetQuery}&rdquo;</>
                        : <>No available <strong>{selectedCategory?.replace(/_/g, ' ')}</strong> assets found</>}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

            {/* Selected Asset Card */}
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
                    {[selectedAsset.category?.replace(/_/g, ' '), selectedAsset.brand, selectedAsset.model].filter(Boolean).join(' · ')}
                    {selectedAsset.assetTag && (
                      <span style={{ fontFamily: "'Roboto Mono', monospace", marginLeft: 6, color: '#999' }}>
                        {selectedAsset.assetTag}
                      </span>
                    )}
                  </Typography>
                  {/* Spec tags on selected asset */}
                  {Array.isArray(selectedAsset.specifications) && selectedAsset.specifications.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.8, flexWrap: 'wrap' }}>
                      {selectedAsset.specifications.map(s => (
                        <Chip
                          key={s.specKey}
                          label={`${s.specKey}: ${s.specValue}`}
                          size="small"
                          sx={{
                            height: 18, fontSize: '0.64rem', fontFamily: FONT,
                            backgroundColor: '#F0F9FF', color: '#0284C7',
                            border: '1px solid #BAE6FD', borderRadius: '5px',
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
                <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20, flexShrink: 0, mt: 0.3 }} />
              </Box>
            )}
          </Box>
        </Paper>

        {/* ══════════════════════════════════════════════
            SECTION 3 — REMARKS
        ══════════════════════════════════════════════ */}
        <Paper elevation={0} sx={{ ...sectionSx, overflow: 'hidden' }}>
          <SectionHeader
            icon={<NotesIcon />}
            title="Support Personnel Remarks"
            subtitle="Add any notes or context about this assignment request"
            color={ACCENT}
          />
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth size="small"
              placeholder="Add any notes or context about this assignment request…"
              value={form.spRemarks}
              onChange={e => {
                const val = e.target.value.replace(/[^A-Za-z0-9 .,\-]/g, '');
                setForm(v => ({ ...v, spRemarks: val }));
              }}
              multiline rows={3}
              sx={inputSx}
            />
            <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: TEXT_SEC, mt: 0.7 }}>
              Optional · Visible to manager during review
            </Typography>
          </Box>
        </Paper>

        {/* ── Footer Actions ── */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, pt: 1, pb: 4 }}>
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
