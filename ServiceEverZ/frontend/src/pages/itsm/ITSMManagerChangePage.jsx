import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Tooltip, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Tabs, Tab, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Drawer,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import {
  getAllChangePlans, getChangePlanById,
  getAllFreezeWindows, createFreezeWindow, deleteFreezeWindow, getActiveFreezeWindows,
} from '../../api/changeApi';
import { ChangeStatusChip, PriorityChip, ChangeTypeChip } from '../../components/change/ChangeStatusChip';
import ChangeDetailPanel from '../../components/change/ChangeDetailPanel';
import { useAuth } from '../../context/AuthContext';
import toast from '../../utils/toast';
import CustomPagination from '../../components/common/CustomPagination';

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';
const fmtShort = (dt) => dt ? new Date(dt).toLocaleDateString() : '—';

const isActiveWindow = (fw) => {
  const now = new Date();
  return new Date(fw.freezeStart) <= now && new Date(fw.freezeEnd) >= now;
};

const EMPTY_FORM = { reason: '', freezeStart: '', freezeEnd: '' };

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', backgroundColor: '#FAFAFA',
    '&:hover fieldset': { borderColor: '#27235C' },
    '&.Mui-focused fieldset': { borderColor: '#27235C', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#27235C' },
};

function FreezeStatusChip({ fw }) {
  const active_ = isActiveWindow(fw);
  const upcoming = new Date(fw.freezeStart) > new Date();
  const label = active_ ? 'Active' : upcoming ? 'Upcoming' : 'Expired';
  const bg = active_ ? '#DBEAFE' : upcoming ? '#FEF3C7' : '#F3F4F6';
  const color = active_ ? '#1E40AF' : upcoming ? '#92400E' : '#6B7280';
  return <Chip label={label} size="small" sx={{ backgroundColor: bg, color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />;
}

function NotifChip({ sent }) {
  return (
    <Chip
      label={sent ? 'Sent' : 'Pending'} size="small"
      sx={{ backgroundColor: sent ? '#D1FAE5' : '#FEE2E2', color: sent ? '#065F46' : '#991B1B', fontWeight: 600, fontSize: '0.7rem', height: 22 }}
    />
  );
}

// ─── Approvals Section ────────────────────────────────────────────────────────
function ApprovalsSection({ user }) {
  const [subTab, setSubTab] = useState(0);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllChangePlans();
      setAll(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load change plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = all.filter((c) => c.status === 'PENDING_APPROVAL');
  const rows = subTab === 0 ? pending : all;

  const openDrawer = async (row) => {
    setSelected(row);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await getChangePlanById(row.id);
      setDetail(res.data?.data ?? row);
    } catch {
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => { setSelected(null); setDetail(null); }, 300);
  };

  const handleRefresh = () => { load(); if (selected) openDrawer(selected); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Box sx={{ flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Tabs
            value={subTab}
            onChange={(_, v) => { setSubTab(v); setPage(0); }}
            sx={{ borderBottom: '2px solid #E5E7EB', minHeight: 38 }}
            TabIndicatorProps={{ style: { backgroundColor: '#27235C' } }}
          >
            <Tab label={`Pending (${pending.length})`} sx={{ minHeight: 38, fontSize: '0.8rem', fontWeight: 600 }} />
            <Tab label={`All Changes (${all.length})`} sx={{ minHeight: 38, fontSize: '0.8rem', fontWeight: 600 }} />
          </Tabs>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small" sx={{ width: 36, height: 36 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', pt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
        ) : rows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              {subTab === 0 ? 'No pending approvals' : 'No change plans found'}
            </Typography>
          </Box>
        ) : (
          <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Change #</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created By</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Planned Start</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => {
                    const isSelected = selected?.id === c.id;
                    return (
                      <TableRow
                        key={c.id} hover selected={isSelected} onClick={() => openDrawer(c)}
                        sx={{ cursor: 'pointer', backgroundColor: isSelected ? '#EEF2FF' : undefined, borderLeft: isSelected ? '3px solid #27235C' : '3px solid transparent', '&:hover': { backgroundColor: '#F5F5FF' } }}
                      >
                        <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#27235C' }}>{c.changeNumber}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</Typography></TableCell>
                        <TableCell><ChangeStatusChip status={c.status} /></TableCell>
                        <TableCell><PriorityChip priority={c.priority} /></TableCell>
                        <TableCell><ChangeTypeChip changeType={c.changeType} /></TableCell>
                        <TableCell><Typography variant="caption">{c.createdBySpName ?? '—'}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{fmtShort(c.submittedAt)}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{fmtShort(c.plannedStartTime)}</Typography></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <CustomPagination
              count={rows.length}
              page={page}
              onPageChange={newPage => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Paper>
        )}
      </Box>

      {/* ── Change Detail Drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 460 }, backgroundColor: '#F7F8FC', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', top: '64px', height: 'calc(100% - 64px)' } }}
      >
        {detailLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : selected && (
          <ChangeDetailPanel
            change={detail ?? selected}
            onClose={closeDrawer}
            onRefresh={handleRefresh}
            currentUserId={user?.id ?? 1}
            isManager={true}
          />
        )}
      </Drawer>
    </Box>
  );
}

// ─── Freeze Windows Section ───────────────────────────────────────────────────
// open / setOpen are now controlled by the parent (ITSMManagerChangePage)
// refreshKey increments from parent to trigger a reload
function FreezeWindowsSection({ user, onFreezeWindowsChange, open, setOpen, refreshKey }) {
  const [windows, setWindows] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, activeRes] = await Promise.all([getAllFreezeWindows(), getActiveFreezeWindows()]);
      const allData = allRes.data?.data ?? [];
      const activeData = activeRes.data?.data ?? [];
      setWindows(allData);
      setActive(activeData);
      onFreezeWindowsChange?.(activeData);
    } catch {
      toast.error('Failed to load freeze windows');
    } finally {
      setLoading(false);
    }
  }, [onFreezeWindowsChange]);

  // Reload whenever the parent increments refreshKey
  useEffect(() => { load(); }, [load, refreshKey]);

  const validate = () => {
    const e = {};
    if (!form.reason.trim()) e.reason = 'Reason is required';
    if (!form.freezeStart) e.freezeStart = 'Freeze start is required';
    if (!form.freezeEnd) e.freezeEnd = 'Freeze end is required';
    if (form.freezeStart && form.freezeEnd && form.freezeEnd <= form.freezeStart)
      e.freezeEnd = 'End must be after start';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await createFreezeWindow({
        reason: form.reason,
        freezeStart: form.freezeStart + ':00',
        freezeEnd: form.freezeEnd + ':00',
        createdByManagerId: user?.id ?? 1,
      });
      toast.success('Freeze window created and all users notified');
      setOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create freeze window');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this freeze window?')) return;
    setDeleting(id);
    try {
      await deleteFreezeWindow(id);
      toast.success('Freeze window deleted');
      load();
    } catch {
      toast.error('Failed to delete freeze window');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={36} /></Box>
      ) : windows.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AcUnitIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No freeze windows defined</Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Freeze Start</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Freeze End</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Notified</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>Created</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {windows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((fw) => (
                  <TableRow key={fw.id} hover>
                    <TableCell><FreezeStatusChip fw={fw} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fw.reason}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption">{fmt(fw.freezeStart)}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{fmt(fw.freezeEnd)}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{fw.createdByManagerName ?? `#${fw.createdByManagerId}`}</Typography></TableCell>
                    <TableCell><NotifChip sent={fw.notificationSent} /></TableCell>
                    <TableCell><Typography variant="caption">{fmtShort(fw.createdAt)}</Typography></TableCell>
                    <TableCell>
                      <Tooltip title="Delete freeze window">
                        <IconButton size="small" color="error" disabled={deleting === fw.id} onClick={() => handleDelete(fw.id)}>
                          {deleting === fw.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={windows.length}
            page={page}
            onPageChange={newPage => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      {/* ── Create Dialog ── controlled by parent via open/setOpen props */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#27235C' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AcUnitIcon sx={{ color: '#27235C' }} />
            <span>New Freeze Window</span>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth size="small" label="Reason" required multiline rows={3}
              value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              error={!!errors.reason} helperText={errors.reason} sx={fieldSx}
            />
            <TextField
              fullWidth size="small" label="Freeze Start" required type="datetime-local"
              value={form.freezeStart} onChange={(e) => setForm((f) => ({ ...f, freezeStart: e.target.value }))}
              error={!!errors.freezeStart} helperText={errors.freezeStart} InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
            <TextField
              fullWidth size="small" label="Freeze End" required type="datetime-local"
              value={form.freezeEnd} onChange={(e) => setForm((f) => ({ ...f, freezeEnd: e.target.value }))}
              error={!!errors.freezeEnd} helperText={errors.freezeEnd} InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
            <Paper elevation={0} sx={{ p: 1.5, backgroundColor: '#FEF3C7', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#92400E' }}>
                ⚠ Creating a freeze window will automatically notify all users via email.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6B7280' }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleCreate} disabled={saving}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Create Freeze Window'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ITSMManagerChangePage() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState(0);
  const [activeFreezeWindows, setActiveFreezeWindows] = useState([]);

  // Lifted state: controls the "New Freeze Window" dialog from the page header
  const [freezeOpen, setFreezeOpen] = useState(false);
  // Incrementing this tells FreezeWindowsSection to reload
  const [freezeRefreshKey, setFreezeRefreshKey] = useState(0);

  const loadActiveFreezeWindows = useCallback(async () => {
    try {
      const res = await getActiveFreezeWindows();
      setActiveFreezeWindows(res.data?.data ?? []);
    } catch {}
  }, []);

  useEffect(() => { loadActiveFreezeWindows(); }, [loadActiveFreezeWindows]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── Page Header ── */}
      <Box sx={{ p: 2, pb: 0, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C' }}>Change Management</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Review change plan approvals and manage deployment freeze windows
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Active freeze window badges */}
            {activeFreezeWindows.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end" sx={{ maxWidth: 400 }}>
                {activeFreezeWindows.map((fw) => (
                  <Tooltip key={fw.id} title={`${fw.reason} · ${fmt(fw.freezeStart)} → ${fmt(fw.freezeEnd)}`} placement="bottom-end">
                    <Chip
                      icon={<AcUnitIcon sx={{ fontSize: '14px !important' }} />}
                      label={`Freeze: ${fw.reason.length > 28 ? fw.reason.substring(0, 28) + '…' : fw.reason}`}
                      size="small"
                      sx={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontWeight: 600, fontSize: '0.72rem', height: 26, border: '1px solid #93C5FD', '& .MuiChip-icon': { color: '#1E40AF' }, cursor: 'default' }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            )}

            {/* "New Freeze Window" + Refresh — only visible on the Freeze Windows tab */}
            {mainTab === 1 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={() => setFreezeRefreshKey((k) => k + 1)}
                    size="small"
                    sx={{ width: 36, height: 36, border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setFreezeOpen(true)}
                  sx={{ backgroundColor: '#27235C', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', '&:hover': { backgroundColor: '#1B193F' } }}
                >
                  New Freeze Window
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* ── Main Tabs ── */}
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v)}
          sx={{ borderBottom: '2px solid #E5E7EB', minHeight: 44 }}
          TabIndicatorProps={{ style: { backgroundColor: '#27235C' } }}
        >
          <Tab
            icon={<FactCheckIcon fontSize="small" />} iconPosition="start" label="Change Approvals"
            sx={{ minHeight: 44, fontSize: '0.85rem', fontWeight: 600, gap: 0.5, color: mainTab === 0 ? '#27235C' : '#6B7280' }}
          />
          <Tab
            icon={<AcUnitIcon fontSize="small" />} iconPosition="start"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <span>Freeze Windows</span>
                {activeFreezeWindows.length > 0 && (
                  <Box sx={{ px: 0.75, py: 0.1, backgroundColor: '#1E40AF', color: '#fff', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.6 }}>
                    {activeFreezeWindows.length}
                  </Box>
                )}
              </Stack>
            }
            sx={{ minHeight: 44, fontSize: '0.85rem', fontWeight: 600, gap: 0.5, color: mainTab === 1 ? '#27235C' : '#6B7280' }}
          />
        </Tabs>
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2, pt: 2 }}>
        {mainTab === 0 && <ApprovalsSection user={user} />}
        {mainTab === 1 && (
          <FreezeWindowsSection
            user={user}
            onFreezeWindowsChange={setActiveFreezeWindows}
            open={freezeOpen}
            setOpen={setFreezeOpen}
            refreshKey={freezeRefreshKey}
          />
        )}
      </Box>
    </Box>
  );
}
