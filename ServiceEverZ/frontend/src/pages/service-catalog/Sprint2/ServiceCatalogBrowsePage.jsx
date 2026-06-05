import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Box, Typography, Drawer, TextField, InputAdornment,
  Paper, Button, IconButton, Chip, Skeleton,
} from '@mui/material';
import { Stack } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getServiceTypes,
  getCategoriesByType,
  getSubcategoriesByCategory,
} from '../../../api/serviceCatalogApi';
import { OpenContext } from '../../../components/common/OpenProvider';

/* ── Design tokens ── */
const NAV_GRADIENT = 'linear-gradient(135deg, #1B193F 0%, #27235C 55%, #97247E 100%)';
const ACCENT = '#97247E';
const ACCENT_LIGHT = 'rgba(151,36,126,0.15)';
const SURFACE_DARK = '#12103A';
const SURFACE_MID = '#1C1A47';
const SURFACE_CARD = '#221F52';
const BORDER_SUBTLE = 'rgba(255,255,255,0.07)';
const TEXT_DIM = 'rgba(255,255,255,0.45)';
const TEXT_MED = 'rgba(255,255,255,0.72)';

/* ── View metadata ── */
const VIEW_META = {
  types: { label: 'Service Types', Icon: CategoryOutlinedIcon },
  categories: { label: 'Categories', Icon: LayersOutlinedIcon },
  subcategories: { label: 'Subcategories', Icon: ListAltOutlinedIcon },
};

/* ── Animated catalog card ── */
function CatalogCard({ label, description, index, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        bgcolor: SURFACE_CARD,
        border: `1px solid ${BORDER_SUBTLE}`,
        borderRadius: '12px',
        px: 2.5, py: 2, mb: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        overflow: 'hidden',
        animation: `fadeSlideIn 0.22s ease both`,
        animationDelay: `${index * 40}ms`,
        '@keyframes fadeSlideIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0, top: 0, bottom: 0, width: '3px',
          background: ACCENT,
          opacity: 0,
          transition: 'opacity 0.18s',
          borderRadius: '12px 0 0 12px',
        },
        '&:hover': {
          bgcolor: SURFACE_MID,
          borderColor: 'rgba(151,36,126,0.4)',
          transform: 'translateX(3px)',
          '&::before': { opacity: 1 },
        },
        transition: 'all 0.18s ease',
      }}
    >
      <Box sx={{
        width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
        background: ACCENT_LIGHT,
        border: `1px solid rgba(151,36,126,0.25)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ListAltOutlinedIcon sx={{ fontSize: 17, color: '#c86ab8' }} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: '0.875rem', fontWeight: 600, color: '#fff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </Typography>
        {description && (
          <Typography sx={{
            fontSize: '0.72rem', color: TEXT_DIM, mt: 0.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {description}
          </Typography>
        )}
      </Box>

      <ArrowForwardIosIcon sx={{ fontSize: 11, color: TEXT_DIM, flexShrink: 0 }} />
    </Box>
  );
}

/* ── Skeleton loader ── */
function CardSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map(i => (
        <Box key={i} sx={{
          bgcolor: SURFACE_CARD, border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: '12px', px: 2.5, py: 2, mb: 1,
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Skeleton variant="rounded" width={36} height={36}
            sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '9px', flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="55%" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            <Skeleton variant="text" width="35%" sx={{ bgcolor: 'rgba(255,255,255,0.04)', mt: 0.5 }} />
          </Box>
        </Box>
      ))}
    </>
  );
}

/* ── Step progress pills ── */
function StepDots({ current }) {
  const steps = ['types', 'categories', 'subcategories'];
  const activeIdx = steps.indexOf(current);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
      {steps.map((s, i) => (
        <Box key={s} sx={{
          width: activeIdx >= i ? 18 : 6,
          height: 6,
          borderRadius: 3,
          bgcolor: activeIdx >= i ? ACCENT : 'rgba(255,255,255,0.18)',
          transition: 'all 0.28s ease',
        }} />
      ))}
    </Box>
  );
}

export default function ServiceCatalogBrowsePage() {
  const navigate = useNavigate();

  const location = useLocation();
  const { open, setOpen } = useContext(OpenContext);
  const [view, setView] = useState('types');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [serviceTypes, setServiceTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* Load service types */
  useEffect(() => {
    setLoading(true);
    setOpen(true);
    getServiceTypes()
      .then(({ data }) => setServiceTypes(data))
      .catch(() => toast.error('Failed to load service types'))
      .finally(() => setLoading(false));
  }, []);

  const loadCategories = useCallback(async (type) => {
    setLoading(true);
    try {
      const { data } = await getCategoriesByType(type.id);
      setCategories(data);
      setSelectedType(type);
      setSearch('');
      setView('categories');
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, []);

  const loadSubcategories = useCallback(async (category) => {
    setLoading(true);
    try {
      const { data } = await getSubcategoriesByCategory(category.id);
      setSubcategories(data);
      setSelectedCategory(category);
      setSearch('');
      setView('subcategories');
    } catch { toast.error('Failed to load subcategories'); }
    finally { setLoading(false); }
  }, []);

  const handleBack = () => {
    setSearch('');
    setLoading(false);
    if (view === 'subcategories') setView('categories');
    else if (view === 'categories') setView('types');
  };
  const currentUrl = location.pathname;
  const index = currentUrl.indexOf('service-catalog');

  const handleClose = () => {
    setOpen(false);
    if (index !== -1) {
      navigate(currentUrl.substring(0, index));
    } else {
      navigate(currentUrl);
    }
    setTimeout(() => {
      setView('types'); setSearch('');
      setSelectedType(null); setSelectedCategory(null);
    }, 300);
  };

  const filtered = (list) =>
    list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const currentList = view === 'types' ? serviceTypes : view === 'categories' ? categories : subcategories;
  const filteredList = filtered(currentList);
  const { label: viewLabel, Icon: ViewIcon } = VIEW_META[view];

  /* ── Breadcrumb ── */
  const BreadcrumbTrail = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.4, flexWrap: 'nowrap' }}>
      <Typography
        onClick={() => { setView('types'); setSearch(''); }}
        sx={{
          fontSize: '0.72rem',
          color: view === 'types' ? '#fff' : TEXT_DIM,
          fontWeight: view === 'types' ? 700 : 400,
          cursor: view !== 'types' ? 'pointer' : 'default',
          '&:hover': view !== 'types' ? { color: '#fff' } : {},
          transition: 'color 0.15s', userSelect: 'none',
        }}
      >
        Catalog
      </Typography>

      {(view === 'categories' || view === 'subcategories') && selectedType && (<>
        <NavigateNextIcon sx={{ fontSize: 11, color: TEXT_DIM }} />
        <Typography
          onClick={() => { if (view === 'subcategories') { setView('categories'); setSearch(''); } }}
          sx={{
            fontSize: '0.72rem',
            color: view === 'categories' ? '#fff' : TEXT_DIM,
            fontWeight: view === 'categories' ? 700 : 400,
            cursor: view === 'subcategories' ? 'pointer' : 'default',
            '&:hover': view === 'subcategories' ? { color: '#fff' } : {},
            transition: 'color 0.15s', userSelect: 'none',
            maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {selectedType.name}
        </Typography>
      </>)}

      {view === 'subcategories' && selectedCategory && (<>
        <NavigateNextIcon sx={{ fontSize: 11, color: TEXT_DIM }} />
        <Typography sx={{
          fontSize: '0.72rem', color: '#fff', fontWeight: 700, userSelect: 'none',
          maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {selectedCategory.name}
        </Typography>
      </>)}
    </Box>
  );

  return (
    <>


      {/* ── Drawer ── */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 200,
          '& .MuiDrawer-paper': {
            width: 460,
            bgcolor: SURFACE_DARK,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            top: 0,
            borderLeft: `1px solid rgba(151,36,126,0.25)`,
            boxShadow: '-8px 0 48px rgba(0,0,0,0.55)',
          },
        }}
      >
        {/* ── HEADER ── */}
        <Box sx={{
          background: NAV_GRADIENT,
          px: 3, pt: 3, pb: 2.5,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""', position: 'absolute',
            right: -50, bottom: -50,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          },
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {view !== 'types' ? (
                <IconButton size="small" onClick={handleBack} sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  width: 30, height: 30,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                  transition: 'all 0.15s',
                }}>
                  <ArrowBackIcon sx={{ fontSize: 14 }} />
                </IconButton>
              ) : (
                <Box sx={{
                  width: 40, height: 40, borderRadius: '11px',
                  bgcolor: 'rgba(255,255,255,0.13)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ConfirmationNumberIcon sx={{ fontSize: 19, color: '#fff' }} />
                </Box>
              )}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, color: '#fff' }}>
                  Raise a Request
                </Typography>
                <BreadcrumbTrail />
              </Box>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' }, mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Progress + count row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2.5 }}>
            <StepDots current={view} />
            <Chip
              label={`${filteredList.length} ${viewLabel}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.68rem', fontWeight: 600, height: 22,
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          </Box>
        </Box>

        {/* ── SEARCH ── */}
        <Box sx={{
          px: 3, py: 2,
          bgcolor: SURFACE_MID,
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
          flexShrink: 0,
        }}>
          <TextField
            placeholder={`Search ${viewLabel}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: TEXT_DIM, fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ color: TEXT_DIM }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: SURFACE_DARK,
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.85rem',
                '& fieldset': { borderColor: BORDER_SUBTLE },
                '&:hover fieldset': { borderColor: 'rgba(151,36,126,0.4)' },
                '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: '1.5px' },
              },
            }}
          />
        </Box>

        {/* ── SECTION LABEL ── */}
        <Box sx={{
          px: 3, py: 1.2,
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: SURFACE_DARK,
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
          flexShrink: 0,
        }}>
          <ViewIcon sx={{ fontSize: 14, color: ACCENT }} />
          <Typography sx={{
            fontSize: '0.68rem', fontWeight: 700, color: TEXT_DIM,
            textTransform: 'uppercase', letterSpacing: 1.2,
          }}>
            {viewLabel}
          </Typography>
        </Box>

        {/* ── LIST ── */}
        <Box sx={{
          flexGrow: 1, overflowY: 'auto', px: 2.5, py: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(151,36,126,0.4)', borderRadius: 2 },
        }}>
          {loading ? (
            <CardSkeleton />
          ) : filteredList.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.4 }}>
              <SearchIcon sx={{ fontSize: 36, mb: 1, display: 'block', mx: 'auto' }} />
              <Typography fontSize={13}>No results found</Typography>
            </Box>
          ) : (
            <>
              {view === 'types' && filteredList.map((t, i) => (
                <CatalogCard key={t.id} label={t.name} description={t.description}
                  index={i} onClick={() => {loadCategories(t)}}/>
              ))}
              {view === 'categories' && filteredList.map((c, i) => (
                <CatalogCard key={c.id} label={c.name} description={c.description}
                  index={i} onClick={() => loadSubcategories(c)} />
              ))}
              {view === 'subcategories' && filteredList.map((s, i) => (
                <CatalogCard key={s.id} label={s.name} description={s.description}
                  index={i} onClick={() => {
                    if (selectedType.name=='Incident') {
                      navigate(`${currentUrl}/create/incident`, {
                        state: { serviceType: selectedType, category: selectedCategory, subcategory: s },
                      })
                    }
                    else {
                      navigate(`${currentUrl}/create/request`, {
                        state: { serviceType: selectedType, category: selectedCategory, subcategory: s },
                      })
                    }
                  }} />
              ))}
            </>
          )}
        </Box>

        {/* ── FOOTER ── */}
        <Box sx={{
          px: 3, py: 1.8,
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          bgcolor: SURFACE_MID,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography sx={{ fontSize: '0.72rem', color: TEXT_DIM }}>
            Service Catalog
          </Typography>
          <Button onClick={handleClose} size="small" sx={{
            color: TEXT_MED, textTransform: 'none', fontSize: '0.78rem',
            borderRadius: '8px', px: 1.5,
            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
          }}>
            Cancel
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
