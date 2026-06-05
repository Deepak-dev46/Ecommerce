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
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
 
import { createProblem, getAllCategories } from '../../api/problemApi';
import {
  PRIORITY_COLORS,
  IMPACT_COLORS,
} from '../../components/problem/ProblemStatusChip';
import toast from '../../utils/toast';
 
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const IMPACTS = ['LOW', 'MEDIUM', 'HIGH'];
 
const HAS_LETTER = /[a-zA-Z]/;
const ONLY_DIGITS = /^\d+$/;
 
function validateField(field, value) {
  if (!value) return '';
 
  if (
    (field === 'title' || field === 'description') &&
    !HAS_LETTER.test(value)
  ) {
    return `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } must contain at least one letter`;
  }
 
  if (field === 'triggeringIncidentId' && value && !ONLY_DIGITS.test(value)) {
    return 'Incident ID must contain numbers only';
  }
 
  return '';
}
 
function Field({
  label,
  field,
  required,
  multiline,
  rows,
  type = 'text',
  form,
  onFieldChange,
  errors,
  children,
}) {
  const errorMsg = errors?.[field] || '';
 
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      required={required}
      value={form[field]}
      onChange={(e) => onFieldChange(field, e.target.value)}
      multiline={multiline}
      rows={rows}
      type={type}
      select={!!children}
      error={!!errorMsg}
      helperText={errorMsg}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          backgroundColor: '#FAFAFA',
          '&:hover fieldset': {
            borderColor: '#27235C',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#27235C',
            borderWidth: '1.5px',
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#27235C',
        },
      }}
    >
      {children}
    </TextField>
  );
}
 
export default function ProblemFormPage() {
  const navigate = useNavigate();
 
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors] = useState({});
 
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: '',
    impact: '',
    categoryId: '',
    subCategoryId: '',
    ciName: '',
    createdBySpId: '',
    triggeringIncidentId: '',
  });
 
  useEffect(() => {
    getAllCategories(true)
      .then((r) => setCategories(r.data?.data ?? []))
      .catch(() => {});
  }, []);
 
  const handleFieldChange = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
 
    const errMsg = validateField(field, value);
 
    setErrors((e) => ({
      ...e,
      [field]: errMsg,
    }));
  };
 
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
 
    const cat = categories.find((c) => c.id === catId);
 
    setSubCategories(cat?.subCategories ?? []);
 
    setForm((f) => ({
      ...f,
      categoryId: catId,
      subCategoryId: '',
    }));
  };
 
  const handleSubmit = async () => {
    const titleErr = validateField('title', form.title);
    const descErr = validateField('description', form.description);
    const incidentErr = validateField(
      'triggeringIncidentId',
      form.triggeringIncidentId
    );
 
    const newErrors = {
      title: titleErr,
      description: descErr,
      triggeringIncidentId: incidentErr,
    };
 
    setErrors(newErrors);
 
    if (
      !form.title ||
      !form.description ||
      !form.priority ||
      !form.impact ||
      !form.categoryId
    ) {
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
        categoryId: Number(form.categoryId),
        subCategoryId: form.subCategoryId
          ? Number(form.subCategoryId)
          : null,
        createdBySpId: Number(form.createdBySpId),
        triggeringIncidentId: form.triggeringIncidentId
          ? Number(form.triggeringIncidentId)
          : null,
      };
 
      await createProblem(payload);
 
      toast.success('Problem created successfully');
 
      navigate('/support/problem-records');
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'Failed to create problem'
      );
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F4F4F6',
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#27235C',
              mb: 0.5,
            }}
          >
            Create Problem
          </Typography>
 
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
            }}
          >
            Create and classify a new problem record
          </Typography>
        </Box>
 
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate('/support/problem-records')}
          sx={{
            borderColor: '#27235C',
            color: '#27235C',
            borderRadius: '10px',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#27235C',
              backgroundColor: '#EEF2FF',
            },
          }}
        >
          Back
        </Button>
      </Stack>
 
      {/* Single Page Form */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '18px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background:
              'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <InfoOutlinedIcon sx={{ color: '#fff' }} />
            </Box>
 
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                Problem Information
              </Typography>
 
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Fill in all mandatory details
              </Typography>
            </Box>
          </Stack>
 
          <Chip
            label="Draft"
            sx={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: 600,
            }}
          />
        </Box>
 
        {/* Form Content */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <Field
                label="Problem Title"
                field="title"
                required
                form={form}
                onFieldChange={handleFieldChange}
                errors={errors}
              />
            </Grid>
 
            {/* Description */}
            <Grid item xs={12}>
              <Field
                label="Description"
                field="description"
                required
                multiline
                rows={4}
                form={form}
                onFieldChange={handleFieldChange}
                errors={errors}
              />
            </Grid>
 
            {/* Priority */}
            <Grid item xs={12} md={6}>
              <Field
                label="Priority"
                field="priority"
                required
                form={form}
                onFieldChange={handleFieldChange}
                errors={errors}
              >
                {PRIORITIES.map((p) => {
                  const c = PRIORITY_COLORS[p];
 
                  return (
                    <MenuItem key={p} value={p}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: c?.color,
                          }}
                        />
 
                        <Typography
                          sx={{
                            color: c?.color,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {p}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </Field>
            </Grid>
 
            {/* Impact */}
            <Grid item xs={12} md={6}>
              <Field
                label="Impact"
                field="impact"
                required
                form={form}
                onFieldChange={handleFieldChange}
                errors={errors}
              >
                {IMPACTS.map((i) => {
                  const c = IMPACT_COLORS[i];
 
                
   return (
                    <MenuItem key={i} value={i}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: c?.color,
                          }}
                        />
 
                        <Typography
                          sx={{
                            color: c?.color,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {i}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </Field>
            </Grid>
 
            {/* Category */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Category"
                required
                select
                value={form.categoryId}
                onChange={handleCategoryChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#FAFAFA',
                    '&:hover fieldset': {
                      borderColor: '#27235C',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#27235C',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#27235C',
                  },
                }}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
 
            {/* Sub Category */}
            <Grid item xs={12} md={6}>
              <Field
                label="Sub Category"
                field="subCategoryId"
                form={form}
                onFieldChange={handleFieldChange}
              >
                {subCategories.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Field>
            </Grid>
 
            {/* CI Name */}
            <Grid item xs={12}>
              <Field
                label="Configuration Item (CI)"
                field="ciName"
                form={form}
                onFieldChange={handleFieldChange}
              />
            </Grid>
 
 
            {/* Incident */}
            <Grid item xs={12} md={6}>
              <Field
                label="Triggering Incident ID"
                field="triggeringIncidentId"
                type="number"
                form={form}
                onFieldChange={handleFieldChange}
                errors={errors}
              />
            </Grid>
          </Grid>
 
          {/* Footer Buttons */}
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
              }}
            >
              Cancel
            </Button>
 
            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={saving}
              onClick={handleSubmit}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 3,
                background:
                  'linear-gradient(135deg, #27235C 0%, #4A4490 100%)',
                boxShadow: '0 4px 10px rgba(39,35,92,0.25)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #1B193F 0%, #3A3478 100%)',
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
 