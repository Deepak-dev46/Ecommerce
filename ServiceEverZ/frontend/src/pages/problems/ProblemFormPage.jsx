import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Paper,
  CircularProgress,
  Grid,
  Divider,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import TitleIcon from '@mui/icons-material/Title';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useNavigate } from 'react-router-dom';
 
import { createProblem, getAllCategories } from '../../api/problemApi';
import {
  PRIORITY_COLORS,
  IMPACT_COLORS,
} from '../../components/problem/ProblemStatusChip';
import toast from '../../utils/toast';
 
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const IMPACTS    = ['LOW', 'MEDIUM', 'HIGH'];
 
const HAS_LETTER  = /[a-zA-Z]/;
const ONLY_DIGITS = /^\d+$/;
 
function validateField(field, value) {
  if (!value) return '';
  if (
    (field === 'title' || field === 'description') &&
    !HAS_LETTER.test(value)
  ) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must contain at least one letter`;
  }
  if (field === 'triggeringIncidentId' && !ONLY_DIGITS.test(value)) {
    return 'Incident ID must contain numbers only';
  }
  return '';
}
 
/* ── Reusable uppercase label (matches screenshot style) ── */
function FieldLabel({ label, required }) {
  return (
    <Typography
      sx={{
        display: 'block',
        mb: 0.75,
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.07em',
        color: '#374151',
        textTransform: 'uppercase',
      }}
    >
      {label}
      {required && (
        <Box component="span" sx={{ color: '#97247E', ml: 0.4 }}>
          *
        </Box>
      )}
    </Typography>
  );
}
 
/* ── Shared input styles ── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#FAFAFA',
    fontSize: '0.9rem',
    '&:hover fieldset':    { borderColor: '#27235C' },
    '&.Mui-focused fieldset': {
      borderColor: '#27235C',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#27235C' },
};
 
/* ════════════════════════════════════════════════════════════ */
export default function ProblemFormPage() {
  const navigate = useNavigate();
 
  const [saving, setSaving]           = useState(false);
  const [categories, setCategories]   = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors]           = useState({});
 
  const [form, setForm] = useState({
    title:               '',
    description:         '',
    priority:            '',
    impact:              '',
    categoryId:          '',
    subCategoryId:       '',
    ciName:              '',
    createdBySpId:       '',
    triggeringIncidentId:'',
  });
 
  useEffect(() => {
    getAllCategories(true)
      .then((r) => setCategories(r.data?.data ?? []))
      .catch(() => {});
  }, []);
 
  const handleFieldChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: validateField(field, value) }));
  };
 
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat   = categories.find((c) => c.id === catId);
    setSubCategories(cat?.subCategories ?? []);
    setForm((f) => ({ ...f, categoryId: catId, subCategoryId: '' }));
  };
 
  const handleSubmit = async () => {
    const titleErr    = validateField('title', form.title);
    const descErr     = validateField('description', form.description);
    const incidentErr = validateField('triggeringIncidentId', form.triggeringIncidentId);
 
    setErrors({ title: titleErr, description: descErr, triggeringIncidentId: incidentErr });
 
    if (!form.title || !form.description || !form.priority || !form.impact || !form.categoryId) {
      toast.error('Please fill all required fields');
      return;
    }
    if (titleErr || descErr || incidentErr) {
      toast.error('Please fix validation errors before submitting');
      return;
    }
 
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoryId:           Number(form.categoryId),
        subCategoryId:        form.subCategoryId ? Number(form.subCategoryId) : null,
        createdBySpId:        Number(form.createdBySpId),
        triggeringIncidentId: form.triggeringIncidentId ? Number(form.triggeringIncidentId) : null,
      };
      await createProblem(payload);
      toast.success('Problem created successfully');
      navigate('/support/problem-records');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create problem');
    } finally {
      setSaving(false);
    }
  };
 
  /* ── Render ── */
 return (
    <Box sx={{ minHeight: '100vh', background: '#F4F4F6', p: { xs: 2, md: 4 } }}>
 
      {/* ── Page Header (Back btn LEFT of title, matching screenshot) ── */}
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate('/support/problem-records')}
          sx={{
            mt: 0.4,
            borderColor: '#D1D5DB',
            color: '#374151',
            borderRadius: '10px',
            textTransform: 'none',
            flexShrink: 0,
            '&:hover': {
              borderColor: '#27235C',
              backgroundColor: '#EEF2FF',
              color: '#27235C',
            },
          }}
        >
          Back
        </Button>
 
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C', lineHeight: 1.3 }}>
            Create Problem
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.3 }}>
            Create and classify a new problem record
          </Typography>
        </Box>
      </Stack>
 
      {/* ── Form Card (flat white, no inner gradient header) ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '18px',
          border: '1px solid #E5E7EB',
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Grid container spacing={3}>
 
            {/* TITLE */}
            <Grid item xs={12}>
              <FieldLabel label="Title" required />
              <TextField
                fullWidth
                size="small"
                placeholder="Problem title (letters and numbers only)"
                value={form.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Grid>
 
            {/* CATEGORY + SUB-CATEGORY */}
            <Grid item xs={12} md={6}>
              <FieldLabel label="Category" required />
              <TextField
                fullWidth
                size="small"
                select
                value={form.categoryId}
                onChange={handleCategoryChange}
                SelectProps={{ displayEmpty: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                    Select category...
                  </Typography>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
 
            <Grid item xs={12} md={6}>
              <FieldLabel label="Sub Category" />
              <TextField
                fullWidth
                size="small"
                select
                value={form.subCategoryId}
                onChange={(e) => handleFieldChange('subCategoryId', e.target.value)}
                disabled={!subCategories.length}
                SelectProps={{ displayEmpty: true }}
                sx={inputSx}
              >
                <MenuItem value="">
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                    Select sub-category...
                  </Typography>
                </MenuItem>
                {subCategories.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
 <Grid item xs={12}>
              <FieldLabel label="Description" required />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={4}
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                sx={inputSx}
              />
            </Grid>
 
            {/* ── Divider between primary info and classification ── */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: '#F3F4F6' }} />
            </Grid>
 
            {/* PRIORITY + IMPACT */}
            <Grid item xs={12} md={6}>
              <FieldLabel label="Priority" required />
              <TextField
                fullWidth
                size="small"
                select
                value={form.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                SelectProps={{ displayEmpty: true }}
                sx={inputSx}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Select priority...</Typography>
                </MenuItem>
                {PRIORITIES.map((p) => {
                  const c = PRIORITY_COLORS[p];
                  return (
                    <MenuItem key={p} value={p}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c?.color }} />
                        <Typography sx={{ color: c?.color, fontWeight: 600, fontSize: '0.875rem' }}>{p}</Typography>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
 
            <Grid item xs={12} md={6}>
              <FieldLabel label="Impact" required />
              <TextField
                fullWidth
                size="small"
                select
                value={form.impact}
                onChange={(e) => handleFieldChange('impact', e.target.value)}
                SelectProps={{ displayEmpty: true }}
                sx={inputSx}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Select impact...</Typography>
                </MenuItem>
                {IMPACTS.map((i) => {
                  const c = IMPACT_COLORS[i];
                  return (
                    <MenuItem key={i} value={i}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c?.color }} />
                        <Typography sx={{ color: c?.color, fontWeight: 600, fontSize: '0.875rem' }}>{i}</Typography>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
 
            {/* CI NAME */}
            <Grid item xs={12} md={6}>
              <FieldLabel label="Configuration Item (CI)" />
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Server-01"
                value={form.ciName}
                onChange={(e) => handleFieldChange('ciName', e.target.value)}
                sx={inputSx}
              />
            </Grid>
 
            {/* TRIGGERING INCIDENT ID */}
            <Grid item xs={12} md={6}>
              <FieldLabel label="Triggering Incident ID" />
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="Enter incident ID"
                value={form.triggeringIncidentId}
                onChange={(e) => handleFieldChange('triggeringIncidentId', e.target.value)}
                error={!!errors.triggeringIncidentId}
                helperText={errors.triggeringIncidentId}
                sx={inputSx}
              />
            </Grid>
 
          </Grid>
 
          {/* ── Footer Actions ── */}
          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate('/support/problem-records')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: '#D1D5DB',
                color: '#374151',
                '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
              }}
            >
              Cancel
            </Button>
 
            <Button
              variant="contained"
              startIcon={
                saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />
              }
              disabled={saving}
              onClick={handleSubmit}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 3,
                background: 'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
                boxShadow: '0 4px 10px rgba(39,35,92,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1B193F 0%, #3A3478 100%)',
                },
              }}
            >
              {saving ? 'Creating...' : 'Create Problem'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
 