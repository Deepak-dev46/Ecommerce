import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Paper,
  Stack, Breadcrumbs, Link, IconButton, Chip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import toast from 'react-hot-toast';

import { getItemsBySubcategory } from '../../../api/serviceCatalogApi';

const GRADIENT = 'linear-gradient(90deg, #1B193F 0%, #27235C 60%, #97247E 100%)';
const BRAND    = '#27235C';
const ACCENT   = '#97247E';

export default function CreateRequestPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { serviceType, category, subcategory } = state || {};

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [touched, setTouched] = useState(false);

  const itemError = touched && !selectedItem ? 'Please select a service item' : '';

  useEffect(() => {
    if (!subcategory) navigate('/catalog');
  }, [subcategory, navigate]);

  useEffect(() => {
    if (!subcategory) return;
    getItemsBySubcategory(subcategory.id)
      .then(({ data }) => setItems(data))
      .catch(() => toast.error('Failed to load items'));
  }, [subcategory]);

  const handleSubmit = () => {
    setTouched(true);
    if (!selectedItem) return; // inline error shown — no toast
    toast.success('Request submitted successfully');
    navigate('/catalog');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 680, mx: 'auto' }}>

      {/* ─── BREADCRUMB HEADER ─── */}
      <Box sx={{ background: GRADIENT, borderRadius: 3, px: 3, py: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: '0 4px 16px rgba(39,35,92,0.35)' }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'rgba(255,255,255,0.85)', bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', width: 32, height: 32, flexShrink: 0, '&:hover': { bgcolor: 'rgba(151,36,126,0.4)' }, transition: 'all 0.18s' }}>
          <ArrowBackIcon sx={{ fontSize: 15 }} />
        </IconButton>
        <Box sx={{ width: '1px', height: 24, bgcolor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }} />} sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
          <IconButton size="small" onClick={() => navigate('/dashboard')} sx={{ color: 'rgba(255,255,255,0.6)', p: 0.2, '&:hover': { color: '#fff' } }}>
            <HomeOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Link underline="hover" onClick={() => navigate('/catalog')} sx={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>
            Service Catalog
          </Link>
          {serviceType && <Link underline="hover" onClick={() => navigate('/catalog')} sx={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>{serviceType.name}</Link>}
          {category && <Link underline="hover" onClick={() => navigate('/catalog')} sx={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>{category.name}</Link>}
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Create Request</Typography>
        </Breadcrumbs>
      </Box>

      {/* ─── FORM CARD ─── */}
      <Paper sx={{ p: 3.5, borderRadius: 3, boxShadow: '0 2px 16px rgba(39,35,92,0.12)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ConfirmationNumberIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: BRAND, lineHeight: 1.2 }}>New Service Request</Typography>
            {subcategory && <Chip label={subcategory.name} size="small" sx={{ mt: 0.4, bgcolor: 'rgba(39,35,92,0.08)', color: BRAND, fontWeight: 600, fontSize: 11, height: 20 }} />}
          </Box>
        </Box>

        <Stack spacing={2.5}>
          <TextField label="Service Type" value={serviceType?.name || ''} disabled fullWidth sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#444' } }} />
          <TextField label="Category" value={category?.name || ''} disabled fullWidth sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#444' } }} />
          <TextField label="Subcategory" value={subcategory?.name || ''} disabled fullWidth sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#444' } }} />

          {/* ── Dynamic validation on Service Item ── */}
          <TextField
            select
            label="Service Item *"
            value={selectedItem}
            onChange={e => { setSelectedItem(e.target.value); setTouched(true); }}
            onBlur={() => setTouched(true)}
            fullWidth
            error={!!itemError}
            helperText={itemError || (selectedItem ? '✓ Item selected' : 'Select a service item to proceed')}
            FormHelperTextProps={{
              sx: {
                fontSize: '0.76rem',
                color: itemError ? '#E01950' : selectedItem ? '#24A148' : '#9CA3AF',
                mt: 0.5,
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': { borderColor: itemError ? '#E01950' : selectedItem ? '#24A148' : ACCENT },
                '& fieldset': { borderColor: itemError ? '#E01950' : selectedItem ? '#24A148' : undefined },
              },
              '& label.Mui-focused': { color: ACCENT },
            }}
          >
            <MenuItem value="" disabled><em>— Select a service item —</em></MenuItem>
            {items.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
            <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderColor: BRAND, color: BRAND, borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: ACCENT, color: ACCENT } }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} sx={{ background: GRADIENT, borderRadius: 2, fontWeight: 600, flexGrow: 1, boxShadow: '0 2px 10px rgba(151,36,126,0.3)', '&:hover': { opacity: 0.92 } }}>
              Submit Request
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
