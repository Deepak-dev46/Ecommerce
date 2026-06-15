/**
 * TicketHierarchyPanel.jsx  — Sprint 5 Feature 4 (UPDATED)
 *
 * Drop-in component for parent-child ticket hierarchy visualization.
 *
 * Changes vs original:
 *  - `navigatePath` prop allows caller to override the link route
 *    (ITSM uses /itsm/tickets/:id, end-user uses /my-tickets/:id)
 *  - Returns null when there is no meaningful hierarchy (no parent + no children)
 *  - Visual polish per design spec
 *
 * Usage (ITSM):
 *   <TicketHierarchyPanel ticketId={ticket.id} />
 *
 * Usage (end-user, read-only):
 *   <TicketHierarchyPanel ticketId={ticket.id} navigatePath="/my-tickets" />
 */

import React, { useEffect, useState } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import {
  Box, Typography, Chip, CircularProgress, Alert,
  Collapse, IconButton, Tooltip, Divider,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { getTicketHierarchy } from '../../api/ticketRelationshipApi';
import { Button } from '../itsm/UI';


// ✅ ADDED: Split Ticket dialog state
// ── Status colour map ──────────────────────────────────────────────────────────
const STATUS_COLOR = {
  OPEN: { bg: '#E3F2FD', color: '#1565C0' },
  IN_PROGRESS: { bg: '#FFF3E0', color: '#E65100' },
  ON_HOLD: { bg: '#F3E5F5', color: '#6A1B9A' },
  RESOLVED: { bg: '#E8F5E9', color: '#2E7D32' },
  CLOSED: { bg: '#EEEEEE', color: '#424242' },
  REOPENED: { bg: '#FFF9C4', color: '#F57F17' },
  CANCELLED: { bg: '#FFEBEE', color: '#C62828' },
};

// ── Recursive hierarchy node ───────────────────────────────────────────────────
function HierarchyNode({ node, depth = 0, navigatePath }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const hasChildren = node.children && node.children.length > 0;
  const statusStyle = STATUS_COLOR[node.status] ?? { bg: '#F5F5F5', color: '#333' };
  const destPath = navigatePath
    ? `${navigatePath}/${node.ticketId}`
    : `/support/tickets/${node.ticketId}`;

  return (
    <Box sx={{ pl: depth > 0 ? 0 : 0, mt: 1 }}>
      {/* Node row */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          p: '8px 12px',
          borderRadius: '10px',
          border: depth === 0 ? '2px solid #97247E' : '1px solid #E0E0E0',
          bgcolor: depth === 0 ? '#FCF0FA' : '#FAFAFA',
          flexWrap: 'wrap',
          transition: 'box-shadow 0.15s',
          '&:hover': {
            boxShadow: depth === 0
              ? '0 2px 12px rgba(151,36,126,0.15)'
              : '0 2px 8px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Expand / collapse */}
        {hasChildren ? (
          <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0.3 }}>
            {open
              ? <ExpandLessIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
              : <ExpandMoreIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
            }
          </IconButton>
        ) : (
          <Box sx={{ width: 28 }} />
        )}

        {/* Ticket number */}
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ color: '#97247E', minWidth: 90, fontFamily: 'monospace' }}
        >
          {node.ticketNumber}
        </Typography>

        {/* Subject */}
        <Typography variant="body2" sx={{ flex: 1, color: '#1F2937', minWidth: 120 }}>
          {node.subject}
        </Typography>

        {/* Relation badge (skip for root) */}
        {node.relationToParent && (
          <Chip
            label={node.relationToParent == 'PARENT_CHILD' ? 'CHILD' : node.relationToParent.replace(/_/g, ' ')}
            size="small"
            sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 600, fontSize: '0.68rem', height: 20 }}
          />
        )}

        {/* Status chip */}
        <Chip
          label={(node.status ?? '').replace(/_/g, ' ')}
          size="small"
          sx={{
            bgcolor: statusStyle.bg,
            color: statusStyle.color,
            fontWeight: 600,
            fontSize: '0.68rem',
            height: 20,
          }}
        />

        {/* Assignee */}
        {node.assigneeName && (
          <Typography variant="caption" color="text.secondary">
            👤 {node.assigneeName}
          </Typography>
        )}

        {/* Navigate */}
        <Tooltip title="Open ticket">
          <IconButton
            size="small"
            onClick={() => navigate(destPath)}
            sx={{ p: 0.3, color: '#97247E' }}
          >
            <OpenInNewIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Children */}
      {hasChildren && (
        <Collapse in={open}>
          <Box sx={{ borderLeft: '2px dashed #CE93D8', ml: 2.5, pl: 1.5, mt: 0.5 }}>
            {node.children.map((child) => (
              <HierarchyNode
                key={child.ticketId}
                node={child}
                depth={depth + 1}
                navigatePath={navigatePath}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
export default function TicketHierarchyPanel({ ticketId, navigatePath }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    getTicketHierarchy(ticketId)
      .then((res) => setHierarchy(res.data?.data ?? null))
      .catch(() => setError('Could not load hierarchy.'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const hasHierarchy =
    hierarchy && (hierarchy.children?.length > 0 || hierarchy.relationToParent);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} sx={{ color: '#97247E' }} />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!hasHierarchy) return null;

  return (
    <Box sx={{ mt: 3, px: 3, pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AccountTreeIcon sx={{ color: '#97247E', fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={700} color="#97247E">
          Ticket Hierarchy
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2, borderColor: '#F3F4F6' }} />
      <HierarchyNode node={hierarchy} depth={0} navigatePath={navigatePath} />
    </Box>
  );
}
