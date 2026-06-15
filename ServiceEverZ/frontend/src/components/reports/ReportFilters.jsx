// src/components/reports/ReportFilters.jsx
// US-95: All filters in one non-scrollable row.
// Date labels hidden (user request); From/To shown as compact prefix adornment.
// Support Person & Category are Select dropdowns (not text inputs).

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Stack, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, InputAdornment, Typography, Tooltip,
} from '@mui/material';
import PlayArrowIcon     from '@mui/icons-material/PlayArrow';
import RefreshIcon       from '@mui/icons-material/Refresh';
import { masterApi, userApi } from '../../api/ourApi';

/* ── Date helpers ─────────────────────────────────────────────────────────── */
const todayStr   = () => new Date().toISOString().split('T')[0];
const yearAgoStr = () => {
  const d = new Date(); d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
};

/* ── Static options ───────────────────────────────────────────────────────── */
const STATUSES   = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/* ── Shared tiny-input style ──────────────────────────────────────────────── */
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    bgcolor: '#F8FAFC',
    fontSize: '0.78rem',
    height: 32,
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    '& input': { padding: '0 6px', fontSize: '0.78rem' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
};

const selectSx = {
  borderRadius: 1.5,
  bgcolor: '#F8FAFC',
  fontSize: '0.78rem',
  height: 32,
  '& .MuiSelect-select': { padding: '0 24px 0 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center' },
};

/* ── Prefix adornment (replaces floating label for date fields) ───────────── */
const PrefixAdornment = ({ text }) => (
  <InputAdornment position="start" sx={{ mr: 0 }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', whiteSpace: 'nowrap', mr: 0.25 }}>
      {text}
    </Typography>
  </InputAdornment>
);

/* ── Component ────────────────────────────────────────────────────────────── */
const ReportFilters = ({ onApply, onReset, loading = false }) => {
  const [startDate,    setStartDate]    = useState(yearAgoStr());
  const [endDate,      setEndDate]      = useState(todayStr());
  const [status,       setStatus]       = useState('');
  const [priority,     setPriority]     = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const [supportPersons, setSupportPersons] = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [optLoading,     setOptLoading]     = useState(true);

  /* ── Fetch dropdown options on mount ──────────────────────────────────── */
  useEffect(() => {
    setOptLoading(true);

    const fetchPersons = userApi
      .searchByName('')
      .then((res) => {
        const raw = res?.data?.content ?? res?.content ?? res?.data ?? res ?? [];
        const arr = Array.isArray(raw) ? raw : [];
        return [...new Set(
          arr.map((u) =>
            u.firstName && u.lastName
              ? `${u.firstName} ${u.lastName}`.trim()
              : u.username || u.email || ''
          ).filter(Boolean)
        )].sort();
      })
      .catch(() => []);

    const fetchCategories = masterApi
      .getTypes()
      .then(async (types) => {
        const typeArr = Array.isArray(types) ? types : [];
        const nested  = await Promise.all(
          typeArr.map((t) => masterApi.getCategories(t.id ?? t.typeId).catch(() => []))
        );
        return [...new Set(
          nested.flat()
            .map((c) => c?.name ?? c?.categoryName ?? c)
            .filter((v) => v && typeof v === 'string')
        )].sort();
      })
      .catch(() => []);

    Promise.all([fetchPersons, fetchCategories])
      .then(([persons, cats]) => {
        setSupportPersons(persons);
        setCategories(cats);
      })
      .finally(() => setOptLoading(false));
  }, []);

  /* ── Handlers ──────────────────────────────────────────────────────────── */
  const handleApply = useCallback(() => {
    onApply({
      startDate,
      endDate,
      status:       status       || undefined,
      priority:     priority     || undefined,
      assigneeName: assigneeName || undefined,
      categoryName: categoryName || undefined,
    });
  }, [startDate, endDate, status, priority, assigneeName, categoryName, onApply]);

  const handleReset = useCallback(() => {
    setStartDate(yearAgoStr()); setEndDate(todayStr());
    setStatus(''); setPriority(''); setAssigneeName(''); setCategoryName('');
    onReset?.();
  }, [onReset]);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    /*
     * Outer Box fills the filter bar width exactly.
     * overflow: hidden — no scrollbar ever appears.
     * The inner Stack uses flex so items naturally fit.
     */
    <Box sx={{ width: '100%', overflow: 'auto', height:'100%', display:'flex', gap:'10px' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ width: '100%', flexWrap: 'nowrap' }}
      >

        {/* ── From date — NO label, prefix adornment shows "From" ── */}
        <TextField
          size="small"
          type="date"
          value={startDate}
          inputProps={{ max: endDate }}
          onChange={(e) => setStartDate(e.target.value)}
          InputProps={{ startAdornment: <PrefixAdornment text="From" /> }}
          sx={{ flex: '0 0 140px', ...fieldSx }}
        />

        {/* ── To date — NO label, prefix adornment shows "To" ── */}
        <TextField
          size="small"
          type="date"
          value={endDate}
          inputProps={{ min: startDate, max: todayStr() }}
          onChange={(e) => setEndDate(e.target.value)}
          InputProps={{ startAdornment: <PrefixAdornment text="To" /> }}
          sx={{ flex: '0 0 128px', ...fieldSx }}
        />

        {/* ── Status ── */}
        <FormControl size="small" sx={{ flex: '1 1 95px', minWidth: 0 }}>
          <InputLabel sx={{ fontSize: '0.75rem', top: '-4px', '&.MuiInputLabel-shrink': { top: 0 } }}>
            Status
          </InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
            sx={selectSx}
          >
            <MenuItem value=""><em style={{ fontSize: '0.78rem' }}>All</em></MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.78rem' }}>
                {s.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Priority ── */}
        <FormControl size="small" sx={{ flex: '1 1 90px', minWidth: 0 }}>
          <InputLabel sx={{ fontSize: '0.75rem', top: '-4px', '&.MuiInputLabel-shrink': { top: 0 } }}>
            Priority
          </InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value)}
            sx={selectSx}
          >
            <MenuItem value=""><em style={{ fontSize: '0.78rem' }}>All</em></MenuItem>
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p} sx={{ fontSize: '0.78rem' }}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Support Person — dropdown ── */}
        <FormControl size="small" sx={{ flex: '1 1 120px', minWidth: 0 }}>
          <InputLabel sx={{ fontSize: '0.75rem', top: '-4px', '&.MuiInputLabel-shrink': { top: 0 } }}>
            Support Person
          </InputLabel>
          <Select
            value={assigneeName}
            label="Support Person"
            onChange={(e) => setAssigneeName(e.target.value)}
            sx={selectSx}
            endAdornment={optLoading
              ? <CircularProgress size={10} sx={{ mr: 2.5, color: 'text.disabled' }} />
              : null}
          >
            <MenuItem value=""><em style={{ fontSize: '0.78rem' }}>All</em></MenuItem>
            {supportPersons.map((n) => (
              <MenuItem key={n} value={n} sx={{ fontSize: '0.78rem' }}>{n}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Category — dropdown ── */}
        <FormControl size="small" sx={{ flex: '1 1 110px', minWidth: 0 }}>
          <InputLabel sx={{ fontSize: '0.75rem', top: '-4px', '&.MuiInputLabel-shrink': { top: 0 } }}>
            Category
          </InputLabel>
          <Select
            value={categoryName}
            label="Category"
            onChange={(e) => setCategoryName(e.target.value)}
            sx={selectSx}
            endAdornment={optLoading
              ? <CircularProgress size={10} sx={{ mr: 2.5, color: 'text.disabled' }} />
              : null}
          >
            <MenuItem value=""><em style={{ fontSize: '0.78rem' }}>All</em></MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c} sx={{ fontSize: '0.78rem' }}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Run Report button ── */}
        <Button
          variant="contained"
          size="small"
          onClick={handleApply}
          disabled={loading}
          startIcon={!loading && <PlayArrowIcon sx={{ fontSize: 13 }} />}
          sx={{
            width:'100px',
            flex: '0 0 auto',
            borderRadius: 1.5,
            px: 1.75,
            height: 32,
            fontWeight: 600,
            fontSize: '0.78rem',
            textTransform: 'none',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {loading ? 'Running…' : 'Run Report'}
        </Button>

        {/* ── Reset — icon only to save space ── */}
        <Tooltip title="Reset all filters" arrow>
          <span>
            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
              disabled={loading}
              sx={{
                flex: '0 0 auto',
                borderRadius: 1.5,
                minWidth: 32,
                width: 32,
                height: 32,
                p: 0,
                borderColor: '#E2E8F0',
                color: 'text.secondary',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'grey.50' },
              }}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </Button>
          </span>
        </Tooltip>

      </Stack>
    </Box>
  );
};

export default ReportFilters;
