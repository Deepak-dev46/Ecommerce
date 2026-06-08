import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Tooltip, Stepper, Step, StepLabel, Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getMyRequests, cancelRequest } from '../../../api/serviceCatalogApi';
import PageHeader from '../../../components/common/PageHeader';

const STATUS_META = {
  PENDING_APPROVAL: { label: 'Pending Approval', bg: '#FDF8EC', color: '#D97706', border: '#FDE68A' },
  APPROVED:         { label: 'Approved',          bg: '#EDFAF2', color: '#24A148', border: '#A7F3D0' },
  IN_PROGRESS:      { label: 'In Progress',       bg: '#EEF2FF', color: '#27235C', border: '#C7D2FE' },
  FULFILLED:        { label: 'Fulfilled',          bg: '#EDFAF2', color: '#24A148', border: '#A7F3D0' },
  REJECTED:         { label: 'Rejected',           bg: '#FFF6F8', color: '#E01950', border: '#FECACA' },
  CANCELLED:        { label: 'Cancelled',          bg: '#F4F4F6', color: '#888888', border: '#E5E7EB' },
};

function RequestStatusChip({ status }) {
  const meta = STATUS_META[status] ?? { label: status, bg: '#F4F4F6', color: '#666', border: '#ddd' };
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        fontSize: '0.7rem',
        height: 22,
        fontWeight: 700,
        backgroundColor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
      }}
    />
  );
}

const canCancel = status => ['PENDING_APPROVAL'].includes(status);
const fmt = d => (d ? new Date(d).toLocaleString() : '—');

// ─── Cancel Dialog ────────────────────────────────────────────────────────────
function CancelDialog({ open, request, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    setLoading(true);
    await onConfirm(request, reason);
    setLoading(false);
    setReason('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#E01950' }}>
        Cancel Request
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }}>
          You are about to cancel your request for <strong>{request?.serviceName}</strong>.
          This action cannot be undone once submitted.
        </Alert>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
          Reason for cancellation <span style={{ color: '#E01950' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          placeholder="Please explain why you are cancelling this request…"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Keep Request
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Cancelling…' : 'Cancel Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Approval Progress Dialog ─────────────────────────────────────────────────
function ApprovalProgressDialog({ open, request, onClose }) {
  if (!request) return null;
  const steps = request.approvalSteps ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Request Progress</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, mb: 0.5 }}>
          {request.serviceName}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#666', mb: 2 }}>
          Submitted: {fmt(request.createdAt)}
        </Typography>

        <RequestStatusChip status={request.status} />

        {steps.length > 0 ? (
          <Box sx={{ mt: 2.5 }}>
            <Stepper orientation="vertical" nonLinear>
              {steps.map((step, idx) => {
                const isComplete = step.status === 'APPROVED';
                const isRejected = step.status === 'REJECTED';
                return (
                  <Step key={idx} active completed={isComplete}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: isRejected
                            ? '#E01950 !important'
                            : isComplete
                            ? '#24A148 !important'
                            : '#E2B93B !important',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            {step.approverRole}
                          </Typography>
                          {step.approverName && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>
                              {step.approverName}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={step.status ?? 'Pending'}
                          size="small"
                          sx={{
                            fontSize: '0.68rem',
                            height: 20,
                            fontWeight: 700,
                            backgroundColor: isComplete ? '#EDFAF2' : isRejected ? '#FFF6F8' : '#FDF8EC',
                            color: isComplete ? '#24A148' : isRejected ? '#E01950' : '#D97706',
                          }}
                        />
                      </Stack>
                      {step.comment && (
                        <Typography sx={{ fontSize: '0.78rem', color: '#555', mt: 0.5, fontStyle: 'italic' }}>
                          "{step.comment}"
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        ) : (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2, borderRadius: 2 }}>
            This service is auto-approved — no manual approval steps.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyRequestsPage() {
  const [requests, setRequests]   = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  const [cancelTarget, setCancelTarget]     = useState(null);
  const [progressTarget, setProgressTarget] = useState(null);

  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await getMyRequests();
      setRequests(data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (request, reason) => {
    try {
      await cancelRequest(request.id, { reason });
      toast.success('Request cancelled successfully');
      setCancelTarget(null);
      await load();
    } catch {
      toast.error('Failed to cancel request');
    }
  };

  const STATUS_CARD_CONFIG = [
    { label: 'Total',            key: null,              color: '#27235C' },
    { label: 'Pending Approval', key: 'PENDING_APPROVAL', color: '#D97706' },
    { label: 'In Progress',      key: 'IN_PROGRESS',     color: '#27235C' },
    { label: 'Fulfilled',        key: 'FULFILLED',       color: '#24A148' },
    { label: 'Cancelled',        key: 'CANCELLED',       color: '#888888' },
  ];

  const count = key =>
    requests.filter(r => (key ? r.status === key : true)).length;

  const filtered = requests.filter(r =>
    `${r.serviceName ?? ''} ${r.requestNumber ?? ''} ${r.status ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="My Requests"
        subtitle="Track and manage your service catalog requests"
        actionIcon={<InboxIcon />}
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STATUS_CARD_CONFIG.map(({ label, key, color }) => (
          <Grid item xs={6} sm={4} md={2.4} key={label}>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 2,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                borderTop: `3px solid ${color}`,
                textAlign: 'center',
              }}
            >
              {loading ? (
                <Skeleton variant="text" width={40} height={44} sx={{ mx: 'auto' }} />
              ) : (
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>
                  {count(key)}
                </Typography>
              )}
              <Typography sx={{ fontSize: '0.75rem', color: '#666', mt: 0.5 }}>
                {label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by service name, request #, or status…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2.5, backgroundColor: '#fff', borderRadius: '8px' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#A9A7BE' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(39,35,92,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Request #', 'Service', 'Status', 'Submitted', 'SLA Due', 'Actions'].map(h => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#999' }}>
                  Loading requests…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#999' }}>
                  {search ? `No requests found matching "${search}"` : 'You have no service requests yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(req => (
                <TableRow
                  key={req.id}
                  hover
                  sx={{
                    cursor: 'default',
                    ...(req.status === 'PENDING_APPROVAL' && {
                      backgroundColor: '#FFFBEB',
                    }),
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#524F7D' }}>
                      {req.requestNumber ?? req.id}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {req.serviceName}
                    </Typography>
                    {req.category && (
                      <Typography sx={{ fontSize: '0.72rem', color: '#888' }}>{req.category}</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <RequestStatusChip status={req.status} />
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.82rem', color: '#555' }}>
                    {fmt(req.createdAt)}
                  </TableCell>

                  <TableCell>
                    {req.slaDueAt ? (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#A9A7BE' }} />
                        <Typography sx={{ fontSize: '0.82rem', color: '#555' }}>
                          {new Date(req.slaDueAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography sx={{ color: '#ccc', fontSize: '0.8rem' }}>—</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View approval progress">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                          onClick={() => setProgressTarget(req)}
                          sx={{
                            fontSize: '0.72rem',
                            py: 0.4,
                            px: 1,
                            borderColor: '#27235C',
                            color: '#27235C',
                            '&:hover': { backgroundColor: '#EEF2FF' },
                          }}
                        >
                          Progress
                        </Button>
                      </Tooltip>

                      {canCancel(req.status) && (
                        <Tooltip title="Cancel this request">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => setCancelTarget(req)}
                            sx={{ fontSize: '0.72rem', py: 0.4, px: 1 }}
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cancel Dialog */}
      <CancelDialog
        open={Boolean(cancelTarget)}
        request={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />

      {/* Approval Progress Dialog */}
      <ApprovalProgressDialog
        open={Boolean(progressTarget)}
        request={progressTarget}
        onClose={() => setProgressTarget(null)}
      />
    </Box>
  );
}
