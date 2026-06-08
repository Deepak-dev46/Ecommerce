import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { MappingStatusChip } from '../common/AssetStatusChip';
import {
  spDecision,
  managerDecision,
  submitAdditionalDetails,
  releaseAsset,
} from '../../api/assetApi';
import toast from '../../utils/toast';

/* ---------- Reusable Row ---------- */
function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ display: 'flex', py: 0.5 }}>
      <Typography
        sx={{
          width: 200,
          flexShrink: 0,
          fontSize: '0.77rem',
          color: '#888',
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#1c1a3a', fontWeight: 500 }}>
        {String(value)}
      </Typography>
    </Box>
  );
}

/* ---------- Main Component ---------- */
export default function AssetMappingPanel({
  mapping,
  currentUserId,
  userRole,
  onRefresh,
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [spForm, setSpForm] = useState({
    decision: '',
    remarks: '',
    additionalDetailsRequest: '',
  });

  const [mgrForm, setMgrForm] = useState({
    decision: '',
    remarks: '',
    additionalDetailsRequest: '',
  });

  const [detailsForm, setDetailsForm] = useState({ details: '' });
  const [releaseForm, setReleaseForm] = useState({ remarks: '' });

  if (!mapping) return null;

  const status = mapping.status;

  /* ---------- Permissions ---------- */
  const canSpDecide = status === 'PENDING_SP_APPROVAL';
  const canManagerDecide =
    status === 'PENDING_MANAGER_APPROVAL' || status === 'SP_APPROVED';
  const canSubmitDetails =
    status === 'ADDITIONAL_DETAILS_REQUESTED_BY_SP' ||
    status === 'ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER';
  const canRelease = status === 'ACTIVE' || status === 'MANAGER_APPROVED';

  /* ---------- Handlers ---------- */

  const handleSpDecision = async () => {
    if (!spForm.decision) {
      setError('Select a decision.');
      return;
    }

    if (
      spForm.decision === 'REQUEST_ADDITIONAL_DETAILS' &&
      !spForm.additionalDetailsRequest.trim()
    ) {
      setError('Please specify the additional details required.');
      return;
    }

    setError('');
    setActionLoading(true);

    try {
      await spDecision(mapping.id, {
        decision: spForm.decision,
        remarks: spForm.remarks,
        additionalDetailsRequest:
          spForm.decision === 'REQUEST_ADDITIONAL_DETAILS'
            ? spForm.additionalDetailsRequest
            : null,
      });

      toast.success('SP decision recorded');
      onRefresh?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagerDecision = async () => {
    if (!mgrForm.decision) {
      setError('Select a decision.');
      return;
    }

    if (
      mgrForm.decision === 'REQUEST_ADDITIONAL_DETAILS' &&
      !mgrForm.additionalDetailsRequest.trim()
    ) {
      setError('Please specify the additional details required.');
      return;
    }

    setError('');
    setActionLoading(true);

    try {
      await managerDecision(mapping.id, {
        decision: mgrForm.decision,
        remarks: mgrForm.remarks,
        additionalDetailsRequest:
          mgrForm.decision === 'REQUEST_ADDITIONAL_DETAILS'
            ? mgrForm.additionalDetailsRequest
            : null,
      });

      toast.success('Manager decision recorded');
      onRefresh?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdditionalDetails = async () => {
    if (!detailsForm.details.trim()) {
      setError('Details cannot be empty.');
      return;
    }

    setError('');
    setActionLoading(true);

    try {
      await submitAdditionalDetails(mapping.id, {
        details: detailsForm.details,
      });

      toast.success('Additional details submitted');
      onRefresh?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    setError('');
    setActionLoading(true);

    try {
      await releaseAsset(mapping.id, {
        remarks: releaseForm.remarks || null,
      });

      toast.success('Asset released');
      onRefresh?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#97247E' }}>
        {mapping.mappingNumber}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {mapping.assetName}
      </Typography>
      <MappingStatusChip status={status} />

      <Divider sx={{ my: 2 }} />

      <Row label="Asset Tag" value={mapping.assetTag} />
      <Row label="Asset ID" value={mapping.assetId} />
      <Row label="Ticket ID" value={mapping.ticketId} />
      <Row label="Requested By" value={mapping.requestedByUserId} />
      <Row label="SP Remarks" value={mapping.spRemarks} />
      <Row label="Manager Remarks" value={mapping.managerRemarks} />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* ---------- SP Decision ---------- */}
      {canSpDecide && (
        <Box sx={{ mt: 3 }}>
          <Typography fontWeight={700}>SP Decision</Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Decision"
            value={spForm.decision}
            onChange={(e) =>
              setSpForm((f) => ({ ...f, decision: e.target.value }))
            }
            sx={{ mt: 1 }}
          >
            <MenuItem value="APPROVE">Approve</MenuItem>
            <MenuItem value="REJECT">Reject</MenuItem>
            <MenuItem value="REQUEST_ADDITIONAL_DETAILS">
              Request Additional Details
            </MenuItem>
          </TextField>

          <TextField
            fullWidth
            size="small"
            label="Remarks"
            multiline
            rows={2}
            sx={{ mt: 1 }}
            value={spForm.remarks}
            onChange={(e) =>
              setSpForm((f) => ({ ...f, remarks: e.target.value }))
            }
          />

          {spForm.decision === 'REQUEST_ADDITIONAL_DETAILS' && (
            <TextField
              fullWidth
              size="small"
              label="Details to Request"
              multiline
              rows={2}
              sx={{ mt: 1 }}
              value={spForm.additionalDetailsRequest}
              onChange={(e) =>
                setSpForm((f) => ({
                  ...f,
                  additionalDetailsRequest: e.target.value,
                }))
              }
            />
          )}

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={actionLoading}
            onClick={handleSpDecision}
          >
            {actionLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              'Submit Decision'
            )}
          </Button>
        </Box>
      )}

      {/* ---------- Manager & Other Sections remain same pattern ---------- */}
    </Box>
  );
}
