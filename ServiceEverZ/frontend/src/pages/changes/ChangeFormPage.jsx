import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Stack,
  Paper, CircularProgress, Grid, Divider, Chip, Tooltip,
  Select, FormControl, FormHelperText, alpha, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// ── Format Icons ──────────────────────────────────────────────────────────────
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FormatClearIcon from '@mui/icons-material/FormatClear';

import { useNavigate, useParams } from 'react-router-dom';
import { createChangePlan, updateChangePlan, getChangePlanById } from '../../api/changeApi';
import { useAuth } from '../../context/AuthContext';
import toast from '../../utils/toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const CHANGE_TYPES = ['STANDARD', 'NORMAL', 'EMERGENCY'];
const PRIORITIES   = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const PRIORITY_COLORS = {
  LOW:      { dot: '#10B981' },
  MEDIUM:   { dot: '#F59E0B' },
  HIGH:     { dot: '#EF4444' },
  CRITICAL: { dot: '#8B5CF6' },
};

const TYPE_COLORS = {
  STANDARD:  { dot: '#3B82F6' },
  NORMAL:    { dot: '#6366F1' },
  EMERGENCY: { dot: '#EF4444' },
};

const FONT_FAMILIES = ['Sans Serif', 'Serif', 'Monospace', 'Arial', 'Georgia', 'Verdana'];
const FONT_SIZES    = ['Small', 'Normal', 'Large', 'Huge'];

const EMPTY = {
  title:            '',
  description:      '',
  changeType:       'NORMAL',
  priority:         'MEDIUM',
  plannedStartTime: '',
  plannedEndTime:   '',
};

// ─── Shared field styles ──────────────────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFF',
    fontSize: '0.85rem',
    height: 42,
    '&:hover fieldset':        { borderColor: '#27235C' },
    '&.Mui-focused fieldset':  { borderColor: '#27235C', borderWidth: '2px' },
    '&.Mui-focused':           { backgroundColor: '#fff' },
    '&.Mui-error fieldset':    { borderColor: '#E01950' },
  },
  '& .MuiInputLabel-root':              { fontSize: '0.82rem' },
  '& .MuiInputLabel-root.Mui-focused':  { color: '#27235C' },
  '& .MuiFormHelperText-root':          { fontSize: '0.7rem', mt: 0.3, mb: 0 },
};

const selectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFF',
    fontSize: '0.85rem',
    height: 42,
    '&:hover fieldset':       { borderColor: '#27235C' },
    '&.Mui-focused fieldset': { borderColor: '#27235C', borderWidth: '2px' },
    '&.Mui-focused':          { backgroundColor: '#fff' },
    '&.Mui-error fieldset':   { borderColor: '#E01950' },
  },
  '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1, py: 0 },
  '& .MuiInputLabel-root':             { fontSize: '0.82rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#27235C' },
  '& .MuiFormHelperText-root':         { fontSize: '0.7rem', mt: 0.3, mb: 0 },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ children, required }) {
  return (
    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', mb: 0.75, letterSpacing: '0.01em' }}>
      {children}
      {required && <Box component="span" sx={{ color: '#E01950', ml: 0.3 }}>*</Box>}
    </Typography>
  );
}

function Dot({ color }) {
  return <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />;
}

function SectionHeader({ label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
      <Box sx={{ width: 3, height: 16, borderRadius: '2px', background: 'linear-gradient(180deg,#27235C,#97247E)' }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#27235C', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ─── Rich Text Editor — matches sample image toolbar exactly ─────────────────
function RichTextEditor({ value, onChange, error, helperText, placeholder = 'Brief description...' }) {
  const editorRef       = useRef(null);
  const skipNextSync    = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fontFamily, setFontFamily] = useState('Sans Serif');
  const [fontSize,   setFontSize]   = useState('Normal');

  // Mount: set initial HTML once
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value (edit-fetch)
  useEffect(() => {
    if (!editorRef.current) return;
    if (skipNextSync.current) { skipNextSync.current = false; return; }
    const incoming = value || '';
    if (editorRef.current.innerHTML !== incoming) editorRef.current.innerHTML = incoming;
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    skipNextSync.current = true;
    const html = editorRef.current.innerHTML;
    onChange(!html || html === '<br>' ? '' : html);
  }, [onChange]);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  }, [handleInput]);

  const handleFontFamily = (e) => {
    const v = e.target.value;
    setFontFamily(v);
    const map = {
      'Sans Serif': 'Arial, sans-serif',
      'Serif':      'Georgia, serif',
      'Monospace':  '"Courier New", monospace',
      'Arial':      'Arial',
      'Georgia':    'Georgia',
      'Verdana':    'Verdana',
    };
    exec('fontName', map[v] || v);
  };

  const handleFontSize = (e) => {
    const v = e.target.value;
    setFontSize(v);
    exec('fontSize', { Small: '2', Normal: '3', Large: '4', Huge: '5' }[v] || '3');
  };

  // Styles
  const borderColor = error ? '#E01950' : isFocused ? '#27235C' : '#D1D5DB';
  const borderWidth = isFocused || error ? 2 : 1;
  const boxShadow   = isFocused
    ? `0 0 0 3px ${error ? alpha('#E01950', 0.08) : alpha('#27235C', 0.06)}`
    : 'none';

  // Toolbar icon button style
  const iconBtnSx = {
    width: 28,
    height: 28,
    borderRadius: '5px',
    border: '1px solid #E0E0E8',
    backgroundColor: '#fff',
    color: '#374151',
    p: 0,
    flexShrink: 0,
    '&:hover': { backgroundColor: '#F0F1FA', borderColor: '#B0B4CC', color: '#27235C' },
    '&:active': { transform: 'scale(0.95)' },
  };

  // Toolbar dropdown style
  const dropdownSx = {
    height: 28,
    fontSize: '0.76rem',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#fff',
    border: '1px solid #E0E0E8',
    borderRadius: '5px',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '&:hover': { backgroundColor: '#F0F1FA' },
    '& .MuiSelect-select': { py: 0, px: '8px', display: 'flex', alignItems: 'center' },
  };

  // Vertical divider between toolbar groups
  const Vr = () => (
    <Box sx={{ width: '1px', height: 18, backgroundColor: '#E0E0E8', mx: 0.25, flexShrink: 0 }} />
  );

  const isEmpty = !value || value === '<br>';

  return (
    <Box>
      <Box
        sx={{
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow,
          backgroundColor: '#fff',
        }}
      >
        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '4px',
            px: 1.5,
            py: '6px',
            borderBottom: '1px solid #E8E8F0',
            backgroundColor: '#FAFAFA',
          }}
        >
          {/* Group 1: B I U S */}
          <Tooltip title="Bold" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('bold'); }}>
              <FormatBoldIcon sx={{ fontSize: '0.95rem', fontWeight: 900 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('italic'); }}>
              <FormatItalicIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Underline" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('underline'); }}>
              <FormatUnderlinedIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Strikethrough" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('strikeThrough'); }}>
              <StrikethroughSIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Vr />

          {/* Group 2: Font Family + Font Size dropdowns */}
          <Select
            value={fontFamily}
            onChange={handleFontFamily}
            size="small"
            sx={{ ...dropdownSx, minWidth: 108 }}
            MenuProps={{ PaperProps: { sx: { fontSize: '0.78rem' } } }}
          >
            {FONT_FAMILIES.map(f => (
              <MenuItem key={f} value={f} sx={{ fontSize: '0.78rem' }}>{f}</MenuItem>
            ))}
          </Select>

          <Select
            value={fontSize}
            onChange={handleFontSize}
            size="small"
            sx={{ ...dropdownSx, minWidth: 84 }}
            MenuProps={{ PaperProps: { sx: { fontSize: '0.78rem' } } }}
          >
            {FONT_SIZES.map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.78rem' }}>{s}</MenuItem>
            ))}
          </Select>

          <Vr />

          {/* Group 3: Text Color + Highlight (A + highlight icon) */}
          <Tooltip title="Text Color" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} component="label">
              <FormatColorTextIcon sx={{ fontSize: '0.95rem' }} />
              <input
                type="color"
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                onChange={e => exec('foreColor', e.target.value)}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Highlight" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} component="label">
              <BorderColorIcon sx={{ fontSize: '0.95rem' }} />
              <input
                type="color"
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                onChange={e => exec('hiliteColor', e.target.value)}
              />
            </IconButton>
          </Tooltip>

          <Vr />

          {/* Group 4: Alignment (just left shown; expand as needed) */}
          <Tooltip title="Align Left" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); }}>
              <FormatAlignLeftIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Vr />

          {/* Group 5: Ordered + Unordered lists */}
          <Tooltip title="Numbered List" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}>
              <FormatListNumberedIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Bullet List" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}>
              <FormatListBulletedIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Vr />

          {/* Group 6: Indent / Outdent */}
          <Tooltip title="Decrease Indent" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('outdent'); }}>
              <FormatIndentDecreaseIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Increase Indent" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('indent'); }}>
              <FormatIndentIncreaseIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Vr />

          {/* Group 7: Link + Clear Format */}
          <Tooltip title="Insert Link" placement="top" arrow>
            <IconButton
              size="small"
              sx={iconBtnSx}
              onMouseDown={e => {
                e.preventDefault();
                const url = window.prompt('Enter URL:');
                if (url) exec('createLink', url);
              }}
            >
              <InsertLinkIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear Formatting" placement="top" arrow>
            <IconButton size="small" sx={iconBtnSx} onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}>
              <FormatClearIcon sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Content area ─────────────────────────────────────────────── */}
        <Box sx={{ position: 'relative', backgroundColor: '#fff' }}>
          {/* Placeholder */}
          {isEmpty && !isFocused && (
            <Box
              sx={{
                position: 'absolute', top: 0, left: 0, right: 0,
                p: '12px 14px', pointerEvents: 'none',
                fontSize: '0.83rem', color: '#B0B7C3',
                fontStyle: 'italic',
                fontFamily: '"IBM Plex Sans","Roboto",sans-serif',
                lineHeight: 1.65, zIndex: 1,
              }}
            >
              {placeholder}
            </Box>
          )}

          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            sx={{
              minHeight: 140,
              maxHeight: 260,
              overflowY: 'auto',
              p: '12px 14px',
              outline: 'none',
              fontSize: '0.83rem',
              lineHeight: 1.7,
              color: '#1A1A1A',
              fontFamily: '"IBM Plex Sans","Roboto",sans-serif',
              position: 'relative',
              zIndex: 2,
              '& blockquote': {
                borderLeft: '3px solid #27235C',
                margin: '6px 0',
                paddingLeft: '10px',
                color: '#6B7280',
                fontStyle: 'italic',
              },
              '& pre': {
                backgroundColor: '#F3F4F6',
                borderRadius: '5px',
                padding: '6px 10px',
                fontFamily: '"Courier New",Courier,monospace',
                fontSize: '0.75rem',
                overflowX: 'auto',
              },
              '& ul, & ol': { paddingLeft: '20px', margin: '3px 0' },
              '& a': { color: '#27235C', textDecoration: 'underline' },
            }}
          />
        </Box>

        {/* ── Bottom resize bar ─────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 1,
            py: '3px',
            borderTop: '1px solid #F0F2F8',
            backgroundColor: '#FAFAFA',
          }}
        >
          <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', mr: 0.5 }}>
            {[0, 1, 2].map(i => (
              <Box key={i} sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#C4C8D4' }} />
            ))}
          </Box>
          <Box sx={{ color: '#C4C8D4', lineHeight: 1, fontSize: '12px' }}>⊿</Box>
        </Box>
      </Box>

      {helperText && (
        <Typography variant="caption" sx={{ color: error ? '#E01950' : '#9CA3AF', mt: 0.4, ml: 1, display: 'block', fontSize: '0.7rem' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChangeFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { user } = useAuth();
  const isEdit   = Boolean(id);

  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    getChangePlanById(id)
      .then(r => {
        const c = r.data?.data;
        if (!c) return;
        setForm({
          title:            c.title            ?? '',
          description:      c.description      ?? '',
          changeType:       c.changeType        ?? 'NORMAL',
          priority:         c.priority          ?? 'MEDIUM',
          plannedStartTime: c.plannedStartTime  ? c.plannedStartTime.substring(0, 16) : '',
          plannedEndTime:   c.plannedEndTime    ? c.plannedEndTime.substring(0, 16)   : '',
        });
      })
      .catch(() => toast.error('Failed to load change plan'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title            = 'Title is required';
    if (!form.changeType)         e.changeType        = 'Change type is required';
    if (!form.priority)           e.priority          = 'Priority is required';
    if (!form.plannedStartTime)   e.plannedStartTime  = 'Start time is required';
    if (!form.plannedEndTime)     e.plannedEndTime    = 'End time is required';
    if (
      form.plannedStartTime && form.plannedEndTime &&
      form.plannedEndTime <= form.plannedStartTime
    ) e.plannedEndTime = 'End must be after start';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const body = {
        ...form,
        plannedStartTime: form.plannedStartTime ? form.plannedStartTime + ':00' : undefined,
        plannedEndTime:   form.plannedEndTime   ? form.plannedEndTime   + ':00' : undefined,
        createdBySpId: user?.id ?? 1,
      };
      if (isEdit) {
        await updateChangePlan(id, body);
        toast.success('Change plan updated');
      } else {
        await createChangePlan(body);
        toast.success('Change plan created');
      }
      navigate('/support/changeplan');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save change plan');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#27235C' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: 900, mx: 'auto', boxSizing: 'border-box' }}>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
          onClick={() => navigate('/support/changeplan')}
          size="small"
          sx={{
            color: '#9CA3AF', mb: 1.5, pl: 0, fontSize: '0.78rem', textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent', color: '#27235C' },
          }}
        >
          Back to Changes
        </Button>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42, height: 42, borderRadius: '11px',
                background: 'linear-gradient(135deg,#27235C 0%,#97247E 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(39,35,92,0.25)', flexShrink: 0,
              }}
            >
              <AssignmentIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: 800, color: '#27235C', fontSize: '1.08rem', lineHeight: 1.2 }}>
                  {isEdit ? 'Edit Change Plan' : 'New Change Plan'}
                </Typography>
                {!isEdit && (
                  <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: '0.65rem !important' }} />}
                    label="New"
                    size="small"
                    sx={{
                      height: 18, fontSize: '0.6rem', fontWeight: 700,
                      background: 'linear-gradient(135deg,#27235C,#97247E)',
                      color: '#fff', '& .MuiChip-icon': { color: '#fff' },
                    }}
                  />
                )}
              </Stack>
              <Typography sx={{ color: '#B0B7C3', fontSize: '0.72rem', mt: 0.2 }}>
                {isEdit ? 'Update change request details' : 'Fill all required fields to submit for approval'}
              </Typography>
            </Box>
          </Stack>

          {/* Save button in header */}
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg,#27235C,#97247E)',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              px: 2.5,
              height: 38,
              boxShadow: '0 3px 10px rgba(39,35,92,0.22)',
              '&:hover': { background: 'linear-gradient(135deg,#1e1a47,#7a1c65)', boxShadow: '0 4px 14px rgba(39,35,92,0.32)' },
              '&.Mui-disabled': { background: '#D1D5DB', color: '#9CA3AF' },
            }}
          >
            {loading ? 'Saving…' : isEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </Stack>
      </Box>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(39,35,92,0.07)',
          width: '100%',
        }}
      >

        {/* ══ Section 1: Basic Information ══════════════════════════════════ */}
        <Box sx={{ px: { xs: 2.5, md: 3.5 }, pt: 3, pb: 3 }}>
          <SectionHeader label="Basic Information" />

          <Grid container spacing={2.5} alignItems="flex-start">

            {/* Title — full width */}
            <Grid item xs={12}>
              <SectionLabel required>Change Title</SectionLabel>
              <TextField
                fullWidth
                placeholder="e.g. Database schema migration for v2.5"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                sx={fieldSx}
              />
            </Grid>

            {/* Change Type */}
            <Grid item xs={12} sm={6} md={4}>
              <SectionLabel required>Change Type</SectionLabel>
              <FormControl fullWidth error={!!errors.changeType} sx={selectSx}>
                <Select
                  value={form.changeType}
                  onChange={e => handleChange('changeType', e.target.value)}
                  displayEmpty
                  sx={{ height: 42, borderRadius: '8px', backgroundColor: '#F8FAFF', fontSize: '0.85rem' }}
                >
                  {CHANGE_TYPES.map(t => (
                    <MenuItem key={t} value={t} sx={{ fontSize: '0.85rem', gap: 1 }}>
                      <Dot color={TYPE_COLORS[t].dot} />
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
                {errors.changeType && <FormHelperText sx={{ fontSize: '0.7rem', mt: 0.3 }}>{errors.changeType}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} sm={6} md={4}>
              <SectionLabel required>Priority</SectionLabel>
              <FormControl fullWidth error={!!errors.priority} sx={selectSx}>
                <Select
                  value={form.priority}
                  onChange={e => handleChange('priority', e.target.value)}
                  displayEmpty
                  sx={{ height: 42, borderRadius: '8px', backgroundColor: '#F8FAFF', fontSize: '0.85rem' }}
                >
                  {PRIORITIES.map(p => (
                    <MenuItem key={p} value={p} sx={{ fontSize: '0.85rem', gap: 1 }}>
                      <Dot color={PRIORITY_COLORS[p].dot} />
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
                {errors.priority && <FormHelperText sx={{ fontSize: '0.7rem', mt: 0.3 }}>{errors.priority}</FormHelperText>}
              </FormControl>
            </Grid>

          </Grid>
        </Box>

        <Divider sx={{ borderColor: '#F0F2F8' }} />

        {/* ══ Section 2: Schedule ═══════════════════════════════════════════ */}
        <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3, backgroundColor: '#FAFBFF' }}>
          <SectionHeader label="Schedule" />

          <Grid container spacing={2.5} alignItems="flex-start">

            {/* Planned Start Time */}
            <Grid item xs={12} sm={6}>
              <SectionLabel required>Planned Start Time</SectionLabel>
              <TextField
                fullWidth
                type="datetime-local"
                value={form.plannedStartTime}
                onChange={e => handleChange('plannedStartTime', e.target.value)}
                error={!!errors.plannedStartTime}
                helperText={errors.plannedStartTime}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayIcon sx={{ fontSize: 15, color: '#9CA3AF', mr: 1 }} />
                  ),
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Planned End Time */}
            <Grid item xs={12} sm={6}>
              <SectionLabel required>Planned End Time</SectionLabel>
              <TextField
                fullWidth
                type="datetime-local"
                value={form.plannedEndTime}
                onChange={e => handleChange('plannedEndTime', e.target.value)}
                error={!!errors.plannedEndTime}
                helperText={errors.plannedEndTime}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayIcon sx={{ fontSize: 15, color: '#9CA3AF', mr: 1 }} />
                  ),
                }}
                sx={fieldSx}
              />
            </Grid>

          </Grid>
        </Box>

        <Divider sx={{ borderColor: '#F0F2F8' }} />

        {/* ══ Section 3: Description ════════════════════════════════════════ */}
        <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>
          <SectionHeader label="Description" />

          <SectionLabel>Change Description</SectionLabel>
          <RichTextEditor
            value={form.description}
            onChange={v => handleChange('description', v)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Brief description..."
          />
        </Box>

        {/* ══ Form Footer: Cancel + Submit ══════════════════════════════════ */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: 2.25,
            borderTop: '1px solid #F0F2F8',
            backgroundColor: '#FAFBFF',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/support/changeplan')}
            sx={{
              borderRadius: '8px',
              borderColor: '#D1D5DB',
              color: '#6B7280',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              px: 2.5,
              height: 38,
              '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg,#27235C,#97247E)',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              px: 2.5,
              height: 38,
              boxShadow: '0 3px 10px rgba(39,35,92,0.22)',
              '&:hover': { background: 'linear-gradient(135deg,#1e1a47,#7a1c65)' },
              '&.Mui-disabled': { background: '#D1D5DB', color: '#9CA3AF' },
            }}
          >
            {loading ? 'Saving…' : isEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </Box>

      </Paper>
    </Box>
  );
}
