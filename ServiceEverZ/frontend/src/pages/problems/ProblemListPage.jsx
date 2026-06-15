import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Button, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Tooltip, IconButton, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import SearchIcon  from '@mui/icons-material/Search';
import AddIcon     from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { getAllProblems, getProblemById, searchProblems } from '../../api/problemApi';
import { ProblemStatusChip, PriorityChip, ImpactChip } from '../../components/problem/ProblemStatusChip';
import ProblemDetailPanel from '../../components/problem/ProblemDetailPanel';
import toast from '../../utils/toast';

const ALL_STATUSES = [
  'All',
  'LOGGED',
  'UNDER_INVESTIGATION',
  'RCA_IN_PROGRESS',
  'WORKAROUND_PROVIDED',
  'KNOWN_ERROR',
  'CLOSED',
];

const TAB_LABELS = {
  All:                 'All',
  LOGGED:              'Logged',
  UNDER_INVESTIGATION: 'Investigating',
  RCA_IN_PROGRESS:     'RCA',
  WORKAROUND_PROVIDED: 'Workaround',
  KNOWN_ERROR:         'Known Error',
  CLOSED:              'Closed',
};

const PRIORITIES = ['All', 'LOW', 'MEDIUM', 'HIGH'];
const IMPACTS    = ['All', 'LOW', 'MEDIUM', 'HIGH'];

const fmt = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

export default function ProblemListPage() {
  const navigate = useNavigate();
  const [tab, setTab]                   = useState('All');
  const [problems, setProblems]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [search, setSearch]             = useState('');
  const [priorityFilter, setPriority]   = useState('All');
  const [impactFilter, setImpact]       = useState('All');
  const [loading, setLoading]           = useState(false);
  const [selected, setSelected]         = useState(null);
  const [detail, setDetail]             = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getAllProblems();
      const list = res.data?.data ?? [];
      setProblems(list);
    } catch {
      setProblems([]);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = problems;
    if (tab !== 'All') list = list.filter((p) => p.status === tab);
    if (priorityFilter !== 'All') list = list.filter((p) => p.priority === priorityFilter);
    if (impactFilter   !== 'All') list = list.filter((p) => p.impact   === impactFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.problemNumber?.toLowerCase().includes(q) ||
          p.createdBySpName?.toLowerCase().includes(q),
      );
    }
    setFiltered(list);
  }, [problems, tab, search, priorityFilter, impactFilter]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length >= 3) {
      try {
        const res  = await searchProblems(val.trim());
        const list = res.data?.data ?? [];
        const tabFiltered = tab === 'All' ? list : list.filter((p) => p.status === tab);
        setFiltered(tabFiltered);
      } catch { /* fall back to client filter */ }
    }
  };

  const selectRow = async (row) => {
    setSelected(row);
    setDetailLoading(true);
    try {
      const res = await getProblemById(row.id);
      setDetail(res.data?.data ?? row);
    } catch {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefresh = () => { load(); if (selected) selectRow(selected); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' ,overflow: 'hidden' }}>

      {/* ── Page header ── */}
      <Box sx={{ p: 2, pb: 0, flexShrink: 0}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 , display:'flex', justifyContent:'space-between'}}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#27235C' }}>
              Problem Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Problem Lifecycle — track, investigate, and resolve recurring issues
            </Typography>
          </Box>

          {/* ── Top-right actions ── */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{display:'flex',gap:'10px'}}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small" sx={{width:'50px',height:'50px'}}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/support/problem-records/create')}
              sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
            >
              New Problem
            </Button>
          </Stack>
        </Stack>

        {/* Status tabs */}
        <Stack
          direction="row"
          spacing={0}
          sx={{
            borderBottom: '2px solid #E5E7EB',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {ALL_STATUSES.map((s) => {
            const count  = s === 'All' ? problems.length : problems.filter((p) => p.status === s).length;
            const active = tab === s;
            return (
              <Box
                key={s}
                onClick={() => setTab(s)}
                sx={{
                  px: 2, pb: 1, cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: active ? '2px solid #27235C' : '2px solid transparent',
                  mb: '-2px',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: active ? 700 : 500, color: active ? '#27235C' : '#6B7280' }}
                >
                  {TAB_LABELS[s]}
                  {count > 0 && (
                    <Box
                      component="span"
                      sx={{
                        ml: 0.75, px: 0.75, py: 0.1,
                        background: active ? '#27235C' : '#E5E7EB',
                        color: active ? '#fff' : '#374151',
                        borderRadius: 10, fontSize: '0.6rem', fontWeight: 700,
                      }}
                    >
                      {count}
                    </Box>
                  )}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Table area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', px: 2, py: 2 }}>

          {/* Search + filters row */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, flexShrink: 0, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by title, number, SP…"
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: '1 1 220px', maxWidth: 360 }}
            />

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={priorityFilter}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>{p === 'All' ? 'All Priorities' : p.charAt(0) + p.slice(1).toLowerCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Impact</InputLabel>
              <Select
                label="Impact"
                value={impactFilter}
                onChange={(e) => setImpact(e.target.value)}
              >
                {IMPACTS.map((i) => (
                  <MenuItem key={i} value={i}>{i === 'All' ? 'All Impacts' : i.charAt(0) + i.slice(1).toLowerCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No problems found</Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid #E5E7EB', borderRadius: 2, flex: 1, overflow: 'auto' }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Number</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Impact</TableCell>
                    <TableCell>Assigned SP</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((p) => {
                    const isSelected = selected?.id === p.id;
                    return (
                      <TableRow
                        key={p.id}
                        hover
                        selected={isSelected}
                        onClick={() => selectRow(p)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#EEF2FF' : undefined,
                          borderLeft: isSelected ? '3px solid #27235C' : '3px solid transparent',
                          '&:hover': { backgroundColor: '#F5F5FF' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#27235C' }}>
                            {p.problemNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {p.title}
                          </Typography>
                        </TableCell>
                        <TableCell><ProblemStatusChip status={p.status} /></TableCell>
                        <TableCell><PriorityChip priority={p.priority} /></TableCell>
                        <TableCell><ImpactChip impact={p.impact} /></TableCell>
                        <TableCell>
                          <Typography variant="caption">{p.createdBySpName ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{fmt(p.createdAt)}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Detail panel */}
        {selected && (
          detailLoading ? (
            <Box
              sx={{
                width: 420,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: '1px solid #E5E7EB',
                flexShrink: 0,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : (
            <ProblemDetailPanel
              problem={detail ?? selected}
              onClose={() => { setSelected(null); setDetail(null); }}
              onRefresh={handleRefresh}
            />
          )
        )}
      </Box>
    </Box>
  );
}
