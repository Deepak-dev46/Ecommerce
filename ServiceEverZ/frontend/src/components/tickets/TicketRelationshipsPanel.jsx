/**
 * TicketRelationshipsPanel.jsx  — Sprint 5 Feature 3 (REDESIGN)
 *
 * Shows existing relationships grouped by type and provides
 * an inline form to create new links.
 *
 * Changes vs original:
 *  - Relationships are grouped by type with a section label
 *  - Direction arrow (→ source / ← target) shown per item
 *  - Delete icon only visible on hover, hidden for PARENT_CHILD
 *  - Inline "Add Link" form collapses/expands
 *  - "No linked tickets yet." empty state
 *
 * Usage:
 *   <TicketRelationshipsPanel ticketId={ticket.id} currentUserId={userId} />
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Divider, CircularProgress, Alert,
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip, Stack, Collapse, Paper,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddLinkIcon from '@mui/icons-material/AddLink';
import CloseIcon from '@mui/icons-material/Close';
import {
  getRelationships, linkTickets, removeRelationship,
} from '../../api/ticketRelationshipApi';
import toast from 'react-hot-toast';

const RELATIONSHIP_TYPES = [
  { value: 'RELATED',    label: 'Related — similar topics, independent' },
  { value: 'DEPENDS_ON', label: 'Depends On — blocked by target' },
  { value: 'DUPLICATE',  label: 'Duplicate — exact copy of target' },
];

const REL_COLOR = {
  RELATED:      { bg: '#E3F2FD', color: '#1565C0' },
  DEPENDS_ON:   { bg: '#FFF3E0', color: '#E65100' },
  DUPLICATE:    { bg: '#FFEBEE', color: '#C62828' },
  PARENT_CHILD: { bg: '#EDE7F6', color: '#4527A0' },
};

// Group relationships by type
function groupByType(relationships) {
  return relationships.reduce((acc, rel) => {
    const type = rel.relationshipType ?? 'RELATED';
    if (!acc[type]) acc[type] = [];
    acc[type].push(rel);
    return acc;
  }, {});
}

export default function TicketRelationshipsPanel({ ticketId, currentUserId }) {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [showForm, setShowForm]           = useState(false);
  const [hoveredId, setHoveredId]         = useState(null);

  // Form state
  const [targetTicketId, setTargetTicketId] = useState('');
  const [relType, setRelType]               = useState('RELATED');
  const [notes, setNotes]                   = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState('');

  const fetchRelationships = useCallback(() => {
    setLoading(true);
    getRelationships(ticketId)
      .then((res) => setRelationships(res.data?.data ?? []))
      .catch(() => setError('Could not load relationships.'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => { if (ticketId) fetchRelationships(); }, [fetchRelationships]);

  const handleLink = async () => {
    if (!targetTicketId) { setSubmitError('Target Ticket ID is required.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await linkTickets(ticketId, {
        targetTicketId: Number(targetTicketId),
        relationshipType: relType,
        notes,
        createdBy: currentUserId,
      });
      toast.success('Ticket linked successfully.');
      setTargetTicketId('');
      setNotes('');
      setRelType('RELATED');
      setShowForm(false);
      fetchRelationships();
    } catch (e) {
      setSubmitError(e?.response?.data?.message ?? 'Failed to create link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (relId) => {
    try {
      await removeRelationship(relId);
      toast.success('Link removed.');
      fetchRelationships();
    } catch {
      toast.error('Failed to remove relationship.');
    }
  };

  const grouped = groupByType(relationships);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LinkIcon sx={{ color: '#97247E', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#97247E">
            Linked Tickets
          </Typography>
          {relationships.length > 0 && (
            <Chip
              label={relationships.length}
              size="small"
              sx={{ bgcolor: '#FCF0FA', color: '#97247E', fontWeight: 700, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Stack>
        <Button
          size="small"
          startIcon={showForm ? <CloseIcon /> : <AddLinkIcon />}
          onClick={() => { setShowForm(!showForm); setSubmitError(''); }}
          sx={{
            color: '#97247E', borderColor: '#97247E',
            textTransform: 'none', fontSize: '0.78rem',
          }}
          variant="outlined"
        >
          {showForm ? 'Cancel' : '+ Add Link'}
        </Button>
      </Box>
      <Divider sx={{ mb: 2, borderColor: '#F3F4F6' }} />

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      {/* Add-link form */}
      <Collapse in={showForm}>
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 2.5, borderRadius: '10px', border: '1px solid #CE93D8', bgcolor: '#FCF0FA' }}
        >
          <Stack spacing={1.5}>
            <TextField
              label="Target Ticket ID *"
              size="small"
              type="number"
              value={targetTicketId}
              onChange={(e) => setTargetTicketId(e.target.value)}
              fullWidth
              placeholder="e.g. 1042"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Relationship Type</InputLabel>
              <Select
                value={relType}
                label="Relationship Type"
                onChange={(e) => setRelType(e.target.value)}
                sx={{ bgcolor: '#fff' }}
              >
                {RELATIONSHIP_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notes (optional)"
              size="small"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
            />
            {submitError && <Alert severity="error" sx={{ py: 0.5 }}>{submitError}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                onClick={() => { setShowForm(false); setSubmitError(''); }}
                sx={{ textTransform: 'none', color: '#6B7280' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={submitting}
                onClick={handleLink}
                sx={{
                  bgcolor: '#97247E', ':hover': { bgcolor: '#7B1C6A' },
                  textTransform: 'none',
                }}
              >
                {submitting ? 'Linking…' : 'Link Tickets'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Collapse>

      {/* Relationships list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} sx={{ color: '#97247E' }} />
        </Box>
      ) : relationships.length === 0 ? (
        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
          <LinkIcon sx={{ fontSize: 36, color: '#D1D5DB' }} />
          <Typography variant="body2" color="text.secondary">
            No linked tickets yet.
          </Typography>
          {!showForm && (
            <Button
              size="small"
              startIcon={<AddLinkIcon />}
              onClick={() => setShowForm(true)}
              sx={{ color: '#97247E', textTransform: 'none', fontSize: '0.78rem' }}
            >
              + Add Link
            </Button>
          )}
        </Stack>
      ) : (
        Object.entries(grouped).map(([type, rels]) => {
          const style = REL_COLOR[type] ?? { bg: '#F5F5F5', color: '#333' };
          return (
            <Box key={type} sx={{ mb: 2 }}>
              {/* Type section label */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                <Chip
                  label={type.replace(/_/g, ' ')}
                  size="small"
                  sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                />
                <Divider sx={{ flex: 1 }} />
              </Stack>

              {/* Relationship rows */}
              {rels.map((rel) => {
                const isSource = rel.sourceTicketId === ticketId;
                const otherNum = isSource ? rel.targetTicketNumber : rel.sourceTicketNumber;
                const canDelete = rel.relationshipType !== 'PARENT_CHILD';

                return (
                  <Box
                    key={rel.id}
                    onMouseEnter={() => setHoveredId(rel.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1,
                      p: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #EEE',
                      bgcolor: '#FFF',
                      mb: 0.8,
                      '&:hover': { bgcolor: '#FAFAFA' },
                      transition: 'background-color 0.12s',
                    }}
                  >
                    {/* Direction arrow */}
                    <Typography sx={{ fontWeight: 700, color: style.color, fontSize: '0.85rem', mt: 0.2 }}>
                      {isSource ? '→' : '←'}
                    </Typography>

                    {/* Ticket info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2">
                        <strong style={{ color: '#97247E' }}>{otherNum}</strong>
                        {rel.targetTicketSubject || rel.sourceTicketSubject
                          ? ` · ${isSource ? rel.targetTicketSubject : rel.sourceTicketSubject}`
                          : ''}
                      </Typography>
                      {rel.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {rel.notes}
                        </Typography>
                      )}
                    </Box>

                    {/* Delete button — hover only, hidden for PARENT_CHILD */}
                    {canDelete && (
                      <Tooltip title="Remove link">
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(rel.id)}
                          sx={{
                            opacity: hoveredId === rel.id ? 1 : 0,
                            transition: 'opacity 0.15s',
                            p: 0.3,
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })
      )}
    </Box>
  );
}
