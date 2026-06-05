
import React, { useEffect, useState, useRef, useCallback } from 'react';
import InternalNotesPanel from '../../components/collaboration/InternalNotesPanel';
import {
  Box, Paper, Typography, Stack, Tab, Tabs, Divider,
  TextField, Button, CircularProgress, Avatar, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Badge, LinearProgress, Skeleton,
  Menu, MenuItem, Fade, Collapse, Switch, FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import TimerIcon from '@mui/icons-material/Timer';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ReplyIcon from '@mui/icons-material/Reply';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AlarmIcon from '@mui/icons-material/Alarm';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import WorkIcon from '@mui/icons-material/Work';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getTicketById,
  getTicketComments,
  getTicketHistory,
  addComment,
  getTicketSla,
  updateTicketStatus,
  reopenTicket,
} from '../../api/ticketApi';
import TicketStatusChip from '../../components/common/TicketStatusChip';
import { updateAllowUserReply } from '../../api/ticketApi';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import { triggerFeedback } from '../../api/csatApi';
import { useAuth } from '../../context/AuthContext';
import TicketHierarchyPanel from '../../components/tickets/TicketHierarchyPanel';
import TicketRelationshipsPanel from '../../components/tickets/TicketRelationshipsPanel';
import SplitTicketDialog from '../../components/tickets/SplitTicketDialog';
import { positionalKeys } from 'framer-motion';
import { TicketAutoCloseState } from '../../components/itsm/AutoCloseConfigPanel';
import ResolveSection from './ResolutionSection';



/* ─── Constants ─────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  LOW: { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9', dot: '🟢' },
  MEDIUM: { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0', dot: '🟡' },
  HIGH: { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9', dot: '🟠' },
  CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB', dot: '🔴' },
};

const STATUS_ACTIONS = {

  OPEN: ['assign', 'inprogress', 'resolve', 'close'],

  ASSIGNED: ['inprogress', 'resolve', 'close'],

  IN_PROGRESS: ['resolve', 'close', 'onhold'],

  ON_HOLD: ['inprogress', 'resolve', 'close'],

  PENDING_USER_ACK: ['close'],

  RESOLVED: ['close', 'reopen'],

  REOPENED: ['assign', 'inprogress', 'resolve', 'close'],

};



const COMMENT_ALLOWED = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'REOPENED'];
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtShortDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';



function pad(n) { return String(n).padStart(2, '0'); }
function formatDuration(totalSeconds) {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const sign = totalSeconds < 0 ? '-' : '';
  return `${sign}${h > 0 ? `${pad(h)}h ` : ''}${pad(m)}m ${pad(s)}s`;
}

const handleStatusUpdate = async (newStatus, label) => {
  setActionLoading(newStatus);
  try {
    await updateTicketStatus(id, {
      status: newStatus,
      changedBy: user?.fullName || user?.email || 'Support Agent',
      changedById: user?.userId || 1,
      // ✅ FIX 7b: Provide requesterEmail so CSAT survey email is triggered
      requesterEmail: ticket?.requesterEmail || '',
    });
    toast.success(`Ticket ${label}`);
    await loadAll();
  } catch (err) {
    toast.error(err.response?.data?.message || `Failed to ${label.toLowerCase()}`);
  } finally {
    setActionLoading('');
  }
};

/* ─── Sub-components ─────────────────────────────────────────── */


function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.6,
      px: 1.2, py: 0.35, borderRadius: '6px',
      backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cfg.color }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {priority || 'Medium'}
      </Typography>
    </Box>
  );
}

function SidebarMetaRow({ icon, label, value, valueColor }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.8 }}>
      <Box sx={{ color: '#9CA3AF', mt: 0.15, flexShrink: 0, display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: valueColor || '#1F2937', wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

function CommentBubble({ comment, isOwnMessage }) {
  console.log(comment)
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        width: "100%",
        mb: 2.5,
        justifyContent: isOwnMessage ? "flex-end" : "flex-start"
      }}
    >
      {!isOwnMessage && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background:
              "linear-gradient(135deg, #97247E 0%, #C45AA8 100%)",
            fontSize: "0.78rem",
            fontWeight: 700
          }}
        >
          {comment.authorName?.[0]?.toUpperCase() ?? "U"}
        </Avatar>
      )}
 
      <Box sx={{ maxWidth: "75%", minWidth: 120 }}>
        <Box sx={{ mb: 0.8 }}>
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#1F2937",
              textAlign: isOwnMessage ? "right" : "left"
            }}
          >
            {comment.authorName}
          </Typography>
 
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "#9CA3AF",
              mt: 0.2,
              textAlign: isOwnMessage ? "right" : "left"
            }}
          >
            {fmtDate(comment.createdAt)}
          </Typography>
        </Box>
 
        <Box
          sx={{
            p: 1.8,
            borderRadius: isOwnMessage
              ? "12px 4px 12px 12px"
              : "4px 12px 12px 12px",
            backgroundColor: isOwnMessage
              ? "#EEF0FB"
              : "#FFFFFF",
            border: `1px solid ${
              isOwnMessage ? "#C7C9E8" : "#E5E7EB"
            }`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              color: "#374151"
            }}
          >
            {comment.comment}
          </Typography>
        </Box>
      </Box>
 
      {isOwnMessage && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background:
              "linear-gradient(135deg, #27235C 0%, #524F7D 100%)",
            fontSize: "0.78rem",
            fontWeight: 700
          }}
        >
          {comment.authorName?.[0]?.toUpperCase() ?? "M"}
        </Avatar>
      )}
    </Stack>
  );
}

function HistoryRow({ event }) {
  const createdAt = new Date(event.createdAt);

  const date = createdAt.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const time = createdAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const actor =
    event.changed_by === 0
      ? 'System'
      : event.changed_by_name || 'Support Agent';

  const showStatusChip =
    event.status &&
    !event.remarks?.toLowerCase().includes(event.status.toLowerCase());

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <Box sx={{ pt: 0.9 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: event.changed_by === 0 ? '#9CA3AF' : '#27235C',
          }}
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mb: 0.4 }}>
          {date} • {time} • {actor}
        </Typography>

        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, mb: 0.6 }}>
          {event.remarks}
        </Typography>

        {showStatusChip && <TicketStatusChip status={event.status} />}
      </Box>
    </Stack>
  );
}

/* ─── SLA Timer ─────────────────────────────────────────────── */
function SlaTimerCard({ ticket }) {
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [loadingSla, setLoadingSla] = useState(true);
  const intervalRef = useRef(null);
  const isOnHold = ticket.status === 'ON_HOLD';



  const isResolved = ticket.status === 'RESOLVED';
  const isPaused = ticket.status === 'ON_HOLD';
  const isClosed = ticket.status === 'CLOSED';
  const noSlaStatus = isClosed || isResolved;

  useEffect(() => {
    if (noSlaStatus) { setLoadingSla(false); return; }
    getTicketSla(ticket.id)
      .then(({ data }) => { setSlaData(data); setSecondsRemaining(data.remainingSeconds ?? null); })
      .catch(() => { })
      .finally(() => setLoadingSla(false));
  }, [ticket.id, ticket.status]);

  useEffect(() => {
    if (isOnHold || secondsRemaining === null || noSlaStatus) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => setSecondsRemaining(p => p !== null ? p - 1 : null), 1000);
    return () => clearInterval(intervalRef.current);
  }, [isOnHold, secondsRemaining === null, noSlaStatus]);

  if (noSlaStatus || loadingSla || !slaData) return null;

  const isBreached = secondsRemaining !== null && secondsRemaining < 0;
  const isWarning = !isBreached && secondsRemaining !== null && secondsRemaining < 3600;
  const timerColor = isBreached ? '#E01950' : isWarning ? '#E2B93B' : '#24A148';
  const timerBg = isBreached ? '#FDEDF2' : isWarning ? '#FDF8EC' : '#EDFAF2';

  const pct = slaData.totalSeconds
    ? Math.max(0, Math.min(100, (secondsRemaining / slaData.totalSeconds) * 100))
    : null;

  return (
    // <Paper sx={{
    //   p: 2.5, borderRadius: '14px',
    //   border: `1.5px solid ${timerColor}20`,
    //   backgroundColor: timerBg,
    //   boxShadow: `0 4px 16px ${timerColor}18`,
    // }}>
    //   <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    //     {isOnHold ? <PauseCircleIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
    //       : isBreached ? <WarningAmberIcon sx={{ color: '#E01950', fontSize: 18 }} />
    //         : <TimerIcon sx={{ color: timerColor, fontSize: 18 }} />}
    //     <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
    //       SLA Countdown
    //     </Typography>
    //     <Box sx={{ ml: 'auto !important' }}>
    //       <Chip
    //         label={isBreached ? 'Breached' : isWarning ? 'Warning' : isOnHold ? 'Paused' : 'On Track'}
    //         size="small"
    //         sx={{
    //           height: 18, fontSize: '0.6rem', fontWeight: 700,
    //           backgroundColor: `${timerColor}20`, color: timerColor,
    //         }}
    //       />
    //     </Box>
    //   </Stack>

    //   <Typography sx={{
    //     fontSize: '1.7rem', fontWeight: 800, color: timerColor,
    //     letterSpacing: '0.03em', fontFamily: '"JetBrains Mono", monospace',
    //     lineHeight: 1,
    //   }}>
    //     {secondsRemaining !== null ? formatDuration(secondsRemaining) : '—'}
    //   </Typography>

    //   {pct !== null && (
    //     <Box sx={{ mt: 1.5 }}>
    //       <LinearProgress
    //         variant="determinate"
    //         value={isBreached ? 100 : pct}
    //         sx={{
    //           height: 5, borderRadius: 3,
    //           backgroundColor: `${timerColor}25`,
    //           '& .MuiLinearProgress-bar': { backgroundColor: timerColor, borderRadius: 3 },
    //         }}
    //       />
    //     </Box>
    //   )}

    //   <Divider sx={{ my: 1.5, borderColor: `${timerColor}25` }} />
    //   <Stack spacing={0.5}>
    //     <Stack direction="row" justifyContent="space-between">
    //       <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>Deadline</Typography>
    //       <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151' }}>{fmtDate(slaData.deadline)}</Typography>
    //     </Stack>
    //     {slaData.policyName && (
    //       <Stack direction="row" justifyContent="space-between">
    //         <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>Policy</Typography>
    //         <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151' }}>{slaData.policyName}</Typography>
    //       </Stack>
    //     )}
    //   </Stack>
    // </Paper>
    <Paper
      sx={{
        p: 2.5,
        borderRadius: '14px',
        border: `1.5px solid ${timerColor}20`,
        backgroundColor: timerBg,
        boxShadow: `0 4px 16px ${timerColor}18`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        {isPaused ? (
          <PauseCircleIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
        ) : isBreached ? (
          <WarningAmberIcon sx={{ color: '#E01950', fontSize: 18 }} />
        ) : (
          <TimerIcon sx={{ color: timerColor, fontSize: 18 }} />
        )}
        <Typography
          sx={{
            fontWeight: 700,
            color: '#374151',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          SLA Countdown
        </Typography>
        <Box sx={{ ml: 'auto !important' }}>
          <Chip
            label={
              isBreached ? 'Breached' : isWarning ? 'Warning' : isPaused ? 'Paused' : 'On Track'
            }
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              backgroundColor: `${timerColor}20`,
              color: timerColor,
            }}
          />
        </Box>
      </Stack>

      <Typography
        sx={{
          fontSize: '1.7rem',
          fontWeight: 800,
          color: timerColor,
          letterSpacing: '0.03em',
          fontFamily: '"JetBrains Mono", monospace',
          lineHeight: 1,
        }}
      >
        {secondsRemaining !== null ? formatDuration(secondsRemaining) : '—'}
      </Typography>

      {pct !== null && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={isBreached ? 100 : pct}
            sx={{
              height: 5,
              borderRadius: 3,
              backgroundColor: `${timerColor}25`,
              '& .MuiLinearProgress-bar': { backgroundColor: timerColor, borderRadius: 3 },
            }}
          />
        </Box>
      )}

      <Divider sx={{ my: 1.5, borderColor: `${timerColor}25` }} />
      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>Deadline</Typography>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151' }}>
            {fmtDate(slaData.deadline)}
          </Typography>
        </Stack>
        {slaData.policyName && (
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>Policy</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151' }}>
              {slaData.policyName}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Pause / Resume buttons */}
      {/* {!isClosed && !isResolved && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {!isPaused ? (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={
                slaActionLoading === 'pause' ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <PauseCircleIcon />
                )
              }
              disabled={!!slaActionLoading}
              onClick={handlePause}
              sx={{
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderColor: '#9CA3AF',
                color: '#6B7280',
                '&:hover': { backgroundColor: '#F3F4F6', borderColor: '#6B7280' },
              }}
            >
              {slaActionLoading === 'pause' ? 'Pausing…' : 'Pause SLA'}
            </Button>
          ) : (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={
                slaActionLoading === 'resume' ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <PlayArrowIcon />
                )
              }
              disabled={!!slaActionLoading}
              onClick={handleResume}
              sx={{
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderColor: '#24A148',
                color: '#24A148',
                '&:hover': { backgroundColor: '#EDFAF2', borderColor: '#24A148' },
              }}
            >
              {slaActionLoading === 'resume' ? 'Resuming…' : 'Resume SLA'}
            </Button>
          )}
        </Stack>
      )} */}

      {/* //Mark here */}
    </Paper>
  );
}

/* ─── Reopen Modal ──────────────────────────────────────────── */
function ReopenModal({ open, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const MIN_LENGTH = 20;
  const tooShort = reason.trim().length > 0 && reason.trim().length < MIN_LENGTH;
  const isEmpty = reason.trim().length === 0;
  const hasError = touched && (isEmpty || tooShort);

  const handleClose = () => { setReason(''); setTouched(false); onClose(); };
  const handleSubmit = () => {
    setTouched(true);
    if (isEmpty || tooShort) return;
    onConfirm(reason.trim());
    setReason('');
    setTouched(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid #E5E7EB',
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between"
          sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #F3F4F6' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              backgroundColor: '#F8EDFB', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ReplayIcon sx={{ color: '#97247E', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>
                Reopen Ticket
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                Please provide a reason to reopen this ticket
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#9CA3AF' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Alert
          severity="info"
          icon={<ReplayIcon fontSize="small" />}
          sx={{
            mb: 2.5, borderRadius: '10px', fontSize: '0.82rem',
            backgroundColor: '#EFF6FF', color: '#1D4ED8',
            border: '1px solid #BFDBFE',
            '& .MuiAlert-icon': { color: '#3B82F6' },
          }}
        >
          Reopening this ticket will set its status back to <strong>Open</strong> and notify the assigned technician.
        </Alert>

        <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#374151', mb: 1 }}>
          Reason for Reopening <Box component="span" sx={{ color: '#E01950' }}>*</Box>
        </Typography>

        <TextField
          multiline
          minRows={4}
          maxRows={8}
          fullWidth
          placeholder="Describe why this ticket needs to be reopened (minimum 20 characters)..."
          value={reason}
          onChange={e => { setReason(e.target.value); setTouched(true); }}
          error={hasError}
          helperText={
            hasError
              ? isEmpty
                ? 'A reason is required to reopen this ticket.'
                : `Reason is too short. Please enter at least ${MIN_LENGTH} characters (${reason.trim().length}/${MIN_LENGTH}).`
              : `${reason.trim().length} characters entered${reason.trim().length < MIN_LENGTH ? ` (minimum ${MIN_LENGTH})` : ''}`
          }
          FormHelperTextProps={{
            sx: {
              fontSize: '0.76rem',
              color: hasError ? '#E01950' : reason.trim().length >= MIN_LENGTH ? '#24A148' : '#9CA3AF',
              mt: 0.8,
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.87rem',
              '&.Mui-error fieldset': { borderColor: '#E01950' },
              '&:not(.Mui-error) fieldset': {
                borderColor: reason.trim().length >= MIN_LENGTH ? '#24A148' : '#E5E7EB'
              },
            },
          }}
        />

        {/* Character progress bar */}
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (reason.trim().length / MIN_LENGTH) * 100)}
            sx={{
              height: 3, borderRadius: 2,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                backgroundColor: reason.trim().length >= MIN_LENGTH ? '#24A148' : '#E2B93B',
                borderRadius: 2,
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #F3F4F6', gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: '#E5E7EB', color: '#6B7280', borderRadius: '9px',
            '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <ReplayIcon />}
          sx={{
            backgroundColor: '#97247E', borderRadius: '9px',
            '&:hover': { backgroundColor: '#7B1D68' },
            '&:disabled': { backgroundColor: '#D1D5DB' },
          }}
        >
          {loading ? 'Reopening…' : 'Reopen Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Empty Tab State ─────────────────────────────────────────── */
function EmptyState({ icon, title, subtitle }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 6, px: 3 }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '16px',
        backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
        mb: 2, color: '#9CA3AF',
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.83rem', color: '#9CA3AF', textAlign: 'center' }}>{subtitle}</Typography>
    </Stack>
  );
}

/* ─── CSV Export ─────────────────────────────────────────────── */
function exportTicketCSV(ticket, comments, history) {
  const ticketRows = [
    ['Field', 'Value'],
    ['Ticket Number', ticket.ticketNumber || ''],
    ['Subject', `"${(ticket.subject || '').replace(/"/g, '""')}"`],
    ['Status', ticket.status || ''],
    ['Priority', ticket.priority || ''],
    ['Type', ticket.type || ''],
    ['Category', ticket.category || ''],
    ['Sub-Category', ticket.subCategory || ''],
    ['Requester', ticket.requesterName || ''],
    ['Assignee', ticket.assigneeName || 'Unassigned'],
    ['Created At', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ''],
    ['Updated At', ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ''],
    ['SLA Deadline', ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : ''],
    ['Description', `"${(ticket.description || '').replace(/"/g, '""')}"`],
    ['Resolution Notes', `"${(ticket.resolutionNotes || '').replace(/"/g, '""')}"`],
  ];
  const commentRows = [
    [], ['--- COMMENTS ---'],
    ['Author', 'Role', 'Comment', 'Date'],
    ...comments.map(c => [
      c.authorName || 'Support Agent', c.authorRole || '',
      `"${(c.comment || '').replace(/"/g, '""')}"`,
      c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
    ]),
  ];
  const historyRows = [
    [], ['--- HISTORY ---'],
    ['Remarks', 'Status', 'Changed By', 'Date'],
    ...history.map(h => [
      `"${(h.remarks || '').replace(/"/g, '""')}"`, h.status || '',
      h.changed_by_name || (h.changed_by === 0 ? 'System' : 'Support Agent'),
      h.createdAt ? new Date(h.createdAt).toLocaleString() : '',
    ]),
  ];
  const csv = [...ticketRows, ...commentRows, ...historyRows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `ticket-${ticket.ticketNumber || ticket.id}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Tabs Content ───────────────────────────────────────────── */
// function ConversationsTab({ comments, ticket, commentText, setCommentText, onAddComment, submitting, commentsEndRef, allowUserReply, onToggleUserReply }) {
//   const canComment = COMMENT_ALLOWED.includes(ticket?.status);
//   return (
//     <Box sx={{ p: 3 }}>
//       {comments.length === 0 ? (
//         <EmptyState
//           icon={<ChatBubbleOutlineIcon />}
//           title="No conversations yet"
//           subtitle="Replies and notes will appear here"
//         />
//       ) : (
//         <Box sx={{
//           mb: 2.5, maxHeight: 460, overflowY: 'auto', pr: 1,
//           '&::-webkit-scrollbar': { width: 4 },
//           '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
//           '&::-webkit-scrollbar-thumb': { backgroundColor: '#E5E7EB', borderRadius: 4 },
//         }}>
//           {comments.map((c, i) => (
//             <CommentBubble key={c.id || i} comment={c} isSupport={c.authorRole === 'SUPPORT'} />
//           ))}
//           <div ref={commentsEndRef} />
//         </Box>
//       )}

//       {canComment && (
//         <>
//           <Divider sx={{ mb: 2 }} />
//           {/* ── Allow End-User Reply Toggle ── */}
//           <Stack direction="row" alignItems="center" justifyContent="space-between"
//             sx={{ mb: 2, p: 1.5, borderRadius: '10px', backgroundColor: allowUserReply ? '#EDFAF2' : '#F8F8FC', border: `1px solid ${allowUserReply ? '#B7EAC9' : '#E5E7EB'}` }}>
//             <Stack direction="row" spacing={1} alignItems="center">
//               <ReplyAllIcon sx={{ fontSize: 18, color: allowUserReply ? '#24A148' : '#9CA3AF' }} />
//               <Box>
//                 <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: allowUserReply ? '#1A5C34' : '#374151' }}>
//                   Allow End-User Reply
//                 </Typography>
//                 <Typography sx={{ fontSize: '0.72rem', color: allowUserReply ? '#24A148' : '#9CA3AF' }}>
//                   {allowUserReply ? 'User can reply to this ticket' : 'User reply is disabled'}
//                 </Typography>
//               </Box>
//             </Stack>
//             <Switch
//               checked={allowUserReply}
//               onChange={onToggleUserReply}
//               size="small"
//               sx={{
//                 '& .MuiSwitch-switchBase.Mui-checked': { color: '#24A148' },
//                 '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#24A148' },
//               }}
//             />
//           </Stack>
//           <Stack spacing={1.5}>
//             <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Add Reply / Note</Typography>
//             <TextField
//               multiline minRows={3} maxRows={8}
//               placeholder="Type your reply or internal note here..."
//               value={commentText}
//               onChange={e => setCommentText(e.target.value)}
//               fullWidth variant="outlined"
//               helperText={
//                 commentText.trim().length > 0
//                   ? `${commentText.trim().length} characters`
//                   : 'Reply cannot be empty'
//               }
//               FormHelperTextProps={{
//                 sx: {
//                   fontSize: '0.74rem',
//                   color: commentText.trim().length > 0 ? '#24A148' : '#9CA3AF',
//                   mt: 0.5,
//                 }
//               }}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: '10px', fontSize: '0.87rem',
//                   '& fieldset': {
//                     borderColor: commentText.trim().length > 0 ? '#24A148' : '#E5E7EB',
//                   },
//                   '&:hover fieldset': { borderColor: commentText.trim().length > 0 ? '#24A148' : '#D1D5DB' },
//                 }
//               }}
//             />
//             <Stack direction="row" justifyContent="flex-end" spacing={1}>
//               <Button
//                 variant="contained"
//                 endIcon={submitting ? <CircularProgress size={13} color="inherit" /> : <SendIcon />}
//                 onClick={onAddComment}
//                 disabled={submitting || !commentText.trim()}
//                 sx={{
//                   backgroundColor: '#27235C', borderRadius: '8px', fontSize: '0.82rem',
//                   '&:hover': { backgroundColor: '#1B193F' }
//                 }}
//               >
//                 {submitting ? 'Sending…' : 'Send Reply'}
//               </Button>
//             </Stack>
//           </Stack>
//         </>
//       )}
//     </Box>
//   );
// }
function ConversationsTab({
  comments,
  ticket,
  commentText,
  setCommentText,
  onAddComment,
  submitting,
  commentsEndRef,
  allowUserReply,
  onToggleUserReply
}) {
  const canComment = COMMENT_ALLOWED.includes(ticket?.status);

  return (
    <Box sx={{ p: 3 }}>
      {comments.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleOutlineIcon />}
          title="No conversations yet"
          subtitle="Replies and notes will appear here"
        />
      ) : (
        <Box
          sx={{
            mb: 2.5,
            maxHeight: 460,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#E5E7EB', borderRadius: 4 },
          }}
        >
          {comments.map((c, i) => {
          const isSupport = c.authRole === "SUPPORT_PERSONNEL";
 
            console.log(
            "Author:",
             c.authorName,
              "Role:",
              c.authorRole,
              "isSupport:",
              isSupport
            );
 
  return (
    <CommentBubble
      key={c.id || i}
      comment={c}
      isOwnMessage={isSupport}
    />
  );
})}
          <div ref={commentsEndRef} />
        </Box>
      )}

      {canComment && (
        <>
          <Divider sx={{ mb: 2 }} />

          {/* ── Toggle for End-User Reply ── */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: '10px',
              backgroundColor: allowUserReply ? '#EDFAF2' : '#F8F8FC',
              border: `1px solid ${allowUserReply ? '#B7EAC9' : '#E5E7EB'}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ReplyAllIcon
                sx={{ fontSize: 18, color: allowUserReply ? '#24A148' : '#9CA3AF' }}
              />
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: allowUserReply ? '#1A5C34' : '#374151',
                  }}
                >
                  Allow End-User Reply
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: allowUserReply ? '#24A148' : '#9CA3AF',
                  }}
                >
                  {allowUserReply
                    ? 'User can reply to this ticket'
                    : 'User reply is disabled'}
                </Typography>
              </Box>
            </Stack>
            <Switch
              checked={allowUserReply}
              onChange={onToggleUserReply}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#24A148' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#24A148',
                },
              }}
            />
          </Stack>

          {/* ── Support Personnel Reply Box ── */}
          <Stack spacing={1.5}>
            <Typography
              sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}
            >
              Add Reply / Note
            </Typography>
            <TextField
              multiline
              minRows={3}
              maxRows={8}
              placeholder="Type your reply or internal note here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              fullWidth
              variant="outlined"
              helperText={
                commentText.trim().length > 0
                  ? `${commentText.trim().length} characters`
                  : 'Reply cannot be empty'
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: '0.74rem',
                  color: commentText.trim().length > 0 ? '#24A148' : '#9CA3AF',
                  mt: 0.5,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: '0.87rem',
                  '& fieldset': {
                    borderColor:
                      commentText.trim().length > 0 ? '#24A148' : '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor:
                      commentText.trim().length > 0 ? '#24A148' : '#D1D5DB',
                  },
                },
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                variant="contained"
                endIcon={
                  submitting ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                onClick={onAddComment}
                disabled={submitting || !commentText.trim()}
                sx={{
                  backgroundColor: '#27235C',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  '&:hover': { backgroundColor: '#1B193F' },
                }}
              >
                {submitting ? 'Sending…' : 'Send Reply'}
              </Button>
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
}


/* ─── Tabs Content ───────────────────────────────────────────── */

function DetailsTab({ ticket }) {
  const rows = [
    { label: 'Ticket Number', value: ticket.ticketNumber },
    { label: 'Status', value: <TicketStatusChip status={ticket.status} /> },
    { label: 'Priority', value: <PriorityBadge priority={ticket.priority} /> },
    { label: 'Type', value: ticket.type },
    { label: 'Category', value: ticket.category },
    { label: 'Sub-Category', value: ticket.subCategory },
    { label: 'Item', value: ticket.item },
    { label: 'Requester', value: ticket.requesterName },
    { label: 'Assignee', value: ticket.assigneeName || 'Unassigned' },
    { label: 'Mode', value: ticket.mode },
    { label: 'Location', value: ticket.location },
    { label: 'Phone', value: ticket.mobileNumber },
    { label: 'Created At', value: fmtDate(ticket.createdAt) },
    { label: 'Last Updated', value: fmtDate(ticket.updatedAt) },
    { label: 'SLA Deadline', value: fmtDate(ticket.slaDeadline) },
  ].filter(r => r.value !== null && r.value !== undefined && r.value !== '—' && r.value !== '');

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{
        fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 2,
        textTransform: 'uppercase', letterSpacing: '0.07em'
      }}>
        Request Details
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', borderColor: '#E5E7EB' }}>
        {rows.map((row, i) => (
          <Stack key={i} direction="row" alignItems="center"
            sx={{
              px: 2.5, py: 1.5,
              borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
              '&:hover': { backgroundColor: '#FAFAFA' },
              transition: 'background-color 0.15s',
            }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 160, flexShrink: 0 }}>
              {row.label}
            </Typography>
            {typeof row.value === 'string'
              ? <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{row.value}</Typography>
              : row.value
            }
          </Stack>
        ))}
      </Paper>

      {ticket.description && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{
            fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5,
            textTransform: 'uppercase', letterSpacing: '0.07em'
          }}>Description</Typography>
          <Box sx={{ p: 2.5, backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </Typography>
          </Box>
        </Box>
      )}

      {ticket.resolutionNotes && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{
            fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5,
            textTransform: 'uppercase', letterSpacing: '0.07em'
          }}>Resolution Notes</Typography>
          <Box sx={{ p: 2.5, backgroundColor: '#EDFAF2', borderRadius: '12px', border: '1px solid #B7EAC9' }}>
            <Typography sx={{ fontSize: '0.87rem', color: '#1A5C34', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {ticket.resolutionNotes}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function TasksTab() {
  return (
    <Box sx={{ p: 3 }}>
      <EmptyState
        icon={<TaskAltIcon />}
        title="No tasks yet"
        subtitle="Tasks associated with this ticket will appear here"
      />
    </Box>
  );
}



function ResolutionTab({ ticket }) {
  if (!ticket.resolutionNotes) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<CheckCircleIcon />}
          title="No resolution recorded"
          subtitle="Resolution notes will appear here when the ticket is resolved"
        />
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ p: 2.5, backgroundColor: '#EDFAF2', borderRadius: '12px', border: '1px solid #B7EAC9' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <CheckCircleIcon sx={{ color: '#24A148', fontSize: 18 }} />
          <Typography sx={{ fontWeight: 700, color: '#1A5C34', fontSize: '0.85rem' }}>Resolution</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.87rem', color: '#1A5C34', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {ticket.resolutionNotes}
        </Typography>
      </Box>
    </Box>
  );
}

function RemindersTab() {
  return (
    <Box sx={{ p: 3 }}>
      <EmptyState
        icon={<AlarmIcon />}
        title="No reminders"
        subtitle="Reminders for this ticket will appear here"
      />
    </Box>
  );
}



function WorklogTab({ history }) {
  if (!history || history.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<WorkIcon />}
          title="No worklog entries"
          subtitle="Activity and time logs will appear here"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {[...history].reverse().map((event) => (
        <HistoryRow key={event.history_id} event={event} />
      ))}
    </Box>
  );
}


function HierarchyTab({ ticket, user, splitOpen, setSplitOpen }) {
  const loadAll = useCallback(async () => {
    try {
      // Core ticket data — these must succeed
      const [{ data: t }, { data: c }, { data: h }] = await Promise.all([
        getTicketById(id),
        getTicketComments(id),
        getTicketHistory(id),
      ]);
      setTicket(t);
      setComments(c);
      setHistory(h);
    } catch (err) {
      toast.error('Failed to load ticket');
      return; // stop here if core data fails
    }
  })
  const isClosed = ticket.status == "CLOSED";
  return (
    <Box >
      {/* ✅ ADDED: Split Ticket button */}
      <Box sx={{ display: 'flex', justifyContent: 'end', marginRight: '3%', marginTop: '1%' }}>
        {isClosed ? '' : <ActionButton
          label="Split Ticket"
          icon={<LinkIcon />}
          color="#27235C"
          variant="outlined"
          onClick={() => setSplitOpen(true)}
        />}
      </Box>
      <TicketHierarchyPanel ticketId={ticket.id} />
      <TicketRelationshipsPanel ticketId={ticket.id} currentUserId={user?.userId} />
      <SplitTicketDialog
        open={splitOpen}
        onClose={() => setSplitOpen(false)}
        parentTicket={ticket}
        currentUserId={user?.userId}
        onSplitSuccess={(children) => { loadAll(); }}
      />
    </Box>
  )
}

/* ─── Action Button Component ──────────────────────────────── */
function ActionButton({ label, icon, onClick, color = '#27235C', disabled, variant = 'outlined', loading }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size="small"
      startIcon={loading ? <CircularProgress size={13} color="inherit" /> : icon}
      sx={{
        borderRadius: '8px',
        fontSize: '0.78rem',
        fontWeight: 600,
        py: 0.75,
        px: 1.8,
        // position:'relative',
        // right:'10px',
        whiteSpace: 'nowrap',
        ...(variant === 'contained' ? {
          backgroundColor: color,
          color: '#fff',
          '&:hover': { backgroundColor: color, filter: 'brightness(0.88)' },
        } : {
          borderColor: '#E5E7EB',
          color: color || '#374151',
          '&:hover': { backgroundColor: `${color}10`, borderColor: color },
        }),
      }}
    >
      {loading ? 'Loading…' : label}
    </Button>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
const TABS = [
  { label: 'Conversations', icon: <ChatBubbleOutlineIcon fontSize="small" /> },
  { label: 'Details', icon: <AssignmentIcon fontSize="small" /> },
  // { label: 'Tasks', icon: <TaskAltIcon fontSize="small" /> },
  { label: 'Resolution', icon: <CheckCircleIcon fontSize="small" /> },
  // { label: 'Reminders', icon: <AlarmIcon fontSize="small" /> },
  { label: 'Worklog', icon: <WorkIcon fontSize="small" /> },
  { label: 'Work Notes', icon: <StickyNote2Icon fontSize="small" /> },  // ← Added by atchu
  { label: 'Ticket Hierarchy', icon: <StickyNote2Icon fontSize="small" /> },  // ← Added by atchu
];


export default function SupportTicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [splitOpen, setSplitOpen] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [reopenModal, setReopenModal] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [allowUserReply, setAllowUserReply] = useState(true);

  const commentsEndRef = useRef(null);

  /* Load all data */
  // ✅ REPLACE WITH THIS:
  const loadAll = useCallback(async () => {
    try {
      // Core ticket data — these must succeed
      const [{ data: t }, { data: c }, { data: h }] = await Promise.all([
        getTicketById(id),
        getTicketComments(id),
        getTicketHistory(id),
      ]);
      setTicket(t);
      setComments(c);
      setHistory(h);
    } catch (err) {
      toast.error('Failed to load ticket');
      return; // stop here if core data fails
    } finally {
      setLoading(false);
    }

    // Optional call — failure should NOT crash the page
    try {
      const { data: r } = await getAllowUserReply(id);
      setAllowUserReply(r);
    } catch {
      setAllowUserReply(true); // safe default — allow reply
    }
  }, [id]);


  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    if (tab === 0) commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tab, comments]);

  /* Actions */
  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) { return; } // inline validation shown in TextField
    setSubmittingComment(true);
    try {
      await addComment(id, { body: trimmed, authorId:user?.userId, authorName: user?.fullName, authorRole: user?.roles?.[0]});
      setCommentText('');
      toast.success('Comment added');
      const { data } = await getTicketComments(id);
      setComments(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // ============================================================
  // PATCH ONLY — replace BOTH handleStatusUpdate functions
  // inside SupportTicketDetailPage.jsx
  //
  // There are 2 copies: one at ~line 90 (outer scope),
  // and one at ~line 1263 (inner component scope).
  // Replace BOTH with this version.
  //
  // ✅ FIX 7b: Same fix as ITSM page — pass requesterEmail.
  // ============================================================

  // ── INSTANCE 1 (outer scope, ~line 90) ───────────────────────
  const handleStatusUpdate = async (newStatus, label) => {
    setActionLoading(newStatus);
    if (newStatus == 'RESOLVED') {
      let res = await triggerFeedback(id, 'deepak.mani@relevantz.com');// To be changed..
      toast.success(res.data);
    }
    try {
      await updateTicketStatus(id, {
        status: newStatus,
        changedBy: user?.fullName || user?.email || 'Support Agent',
        changedById: user?.userId || 1,
        // ✅ FIX 7b: Provide requesterEmail so CSAT survey email is triggered
        requesterEmail: ticket?.requesterEmail || '',
      });
      toast.success(`Ticket ${label}`);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${label.toLowerCase()}`);
    } finally {
      setActionLoading('');
    }
  };

  // ── INSTANCE 2 (inner component scope, ~line 1263) ───────────
  // (This is inside the JSX section — same change)



  const handleReopen = async (reason) => {
    setReopenLoading(true);
    try {
      await reopenTicket(id, { reason, requestedBy: 'Support Agent' });
      toast.success('Ticket reopened successfully');
      setReopenModal(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen ticket');
    } finally {
      setReopenLoading(false);
    }
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Skeleton variant="rounded" width={240} height={36} sx={{ mb: 2, borderRadius: '10px' }} />
        <Paper sx={{ p: 3, borderRadius: '16px', mb: 2 }}>
          <Skeleton variant="rounded" width="60%" height={28} sx={{ mb: 1.5, borderRadius: '8px' }} />
          <Skeleton variant="rounded" width="35%" height={18} sx={{ borderRadius: '8px' }} />
        </Paper>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px' }} />
          </Box>
          <Box sx={{ width: { lg: 300 }, flexShrink: 0 }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px' }} />
          </Box>
        </Stack>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>Ticket not found or access denied.</Alert>
      </Box>
    );
  }

  const availableActions = STATUS_ACTIONS[ticket.status] || [];


  const isClosed = ticket.status=="CLOSED"
  const isResolved = ticket.status=="RESOLVED"
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>

      {/* ── Top Bar ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            onClick={() => navigate('/support/tickets')}
            size="small"
            sx={{
              backgroundColor: '#27235C', color: '#fff', borderRadius: '10px',
              width: 36, height: 36,
              '&:hover': { backgroundColor: '#1B193F' },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
            Support / Tickets /
          </Typography>
          <Typography sx={{ color: '#27235C', fontSize: '0.85rem', fontWeight: 600 }}>
            {ticket.ticketNumber}
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportTicketCSV(ticket, comments, history)}
          sx={{
            borderColor: '#27235C', color: '#27235C', borderRadius: '9px',
            fontWeight: 600, fontSize: '0.82rem',
            '&:hover': { backgroundColor: '#EEF0FF', borderColor: '#27235C' },
          }}
        >
          Export CSV
        </Button>
      </Stack>

      {/* ── Ticket Header Card ── */}
      <Paper sx={{
        p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 2.5,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
          {/* Left: Title & meta */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center',
                px: 1.2, py: 0.3, borderRadius: '6px',
                backgroundColor: '#EEF0FB', border: '1px solid #C7C9E8',
              }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#27235C', fontFamily: 'monospace' }}>
                  {ticket.ticketNumber}
                </Typography>
              </Box>
              <TicketStatusChip status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </Stack>

            <Typography variant="h5" sx={{
              fontWeight: 700, color: '#111827', fontSize: { xs: '1.1rem', md: '1.35rem' },
              lineHeight: 1.35, mb: 1,
            }}>
              {ticket.subject}
            </Typography>

            <Stack direction="row" spacing={2.5} flexWrap="wrap" sx={{ gap: 1 }}>
              {ticket.requesterName && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <PersonIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{ticket.requesterName}</Box>
                  </Typography>
                </Stack>
              )}
              {ticket.createdAt && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    {fmtDate(ticket.createdAt)}
                  </Typography>
                </Stack>
              )}
              {ticket.category && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <FlagIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>{ticket.category}</Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Right: Action buttons */}
          <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: 1, flexShrink: 0 }}>
            {/* Always visible */}
            {/*  */}

            {/* Status-conditional actions */}
            {/* {availableActions.includes('assign') && (
              <ActionButton
                label="Assign"
                icon={<PersonAddIcon />}
                color="#27235C" variant="outlined"
                loading={actionLoading === 'ASSIGNED'}
                onClick={() => handleStatusUpdate('ASSIGNED', 'Assigned')}
              />
            )} */}

            {/* IN Progress and On Hold by Support pannel */}
            {/* {availableActions.includes('inprogress') && (
              <ActionButton
                label="In Progress"
                icon={<WorkIcon />}
                color="#E2B93B" variant="outlined"
                loading={actionLoading === 'IN_PROGRESS'}
                onClick={() => handleStatusUpdate('IN_PROGRESS', 'Marked In Progress')}
              />
            )}
            {availableActions.includes('onhold') && (
              <ActionButton
                label="On Hold"
                icon={<PauseCircleIcon />}
                color="#9CA3AF" variant="outlined"
                loading={actionLoading === 'ON_HOLD'}
                onClick={() => handleStatusUpdate('ON_HOLD', 'Placed On Hold')}
              />
            )} */}

            {/* Pause / Resume Toggle */}
            {/* {['IN_PROGRESS', 'ON_HOLD'].includes(ticket.status) && (
  <ActionButton
    label={ticket.status === 'ON_HOLD' ? 'Resume Work' : 'Pause Work'}
    icon={ticket.status === 'ON_HOLD' ? <PlayArrowIcon /> : <PauseCircleIcon />}
    color={ticket.status === 'ON_HOLD' ? '#24A148' : '#9CA3AF'}
    variant="outlined"
    loading={
      ticket.status === 'ON_HOLD'
        ? actionLoading === 'IN_PROGRESS'
        : actionLoading === 'ON_HOLD'
    }
    onClick={() =>
      handleStatusUpdate(
        ticket.status === 'ON_HOLD' ? 'IN_PROGRESS' : 'ON_HOLD',
        ticket.status === 'ON_HOLD' ? 'Resumed Work' : 'Paused Work'
      )
    }
  />
)} */}

            {isResolved && (
              <ActionButton
                label="Close"
                icon={<CloseIcon />}
                color="#E01950" variant="contained"
                loading={actionLoading === 'CLOSED'}
                onClick={() => handleStatusUpdate('CLOSED', 'Closed')}
              />
            )}
            {/*
            {availableActions.includes('resolve') && (
              <ActionButton
                label="Resolve"
                icon={<CheckCircleIcon />}
                color="#24A148"
                variant="contained"
                loading={actionLoading === 'RESOLVED'}
                onClick={() => handleStatusUpdate('RESOLVED', 'Resolved')}
              />
            )} */}
            {availableActions.includes('resolve') && (
              <ResolveSection

                ticketId={Number(id)}

                supportPersonId={user?.userId}

                supportPersonName={user?.fullName || user?.email || 'Support'}

                onResolved={loadAll}

              />

            )}



          </Stack>
        </Stack>
      </Paper>

      {/* ── Main Layout ── */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start">

        {/* ── Center: Tabs ── */}
        <Paper sx={{
          flex: 1, borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          minWidth: 0,
        }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #F3F4F6',
              backgroundColor: '#FAFAFA',
              minHeight: 46,
              '& .MuiTab-root': {
                textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                minHeight: 46, py: 0, display: 'flex', justifyContent: 'space-evenly', gap: '2px', alignItems: 'center', color: '#6B7280',
                '&.Mui-selected': { color: '#27235C' },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#27235C', height: 2.5, borderRadius: '2px 2px 0 0' },
            }}
          >
            {TABS.map((t, i) => (
              <Tab
                key={i}
                icon={t.icon}
                iconPosition="start"
                label={i === 0 ? `${t.label}` : t.label}
              />
            ))}
          </Tabs>

          {tab === 0 && (

            <ConversationsTab
              comments={comments}
              ticket={ticket}
              commentText={commentText}
              setCommentText={setCommentText}
              onAddComment={handleAddComment}
              submitting={submittingComment}
              commentsEndRef={commentsEndRef}
              allowUserReply={allowUserReply}
              // onToggleUserReply={() => setAllowUserReply(prev => !prev)}
              onToggleUserReply={async () => {
                try {
                  const newValue = !allowUserReply;

                  await updateAllowUserReply(id, newValue);

                  setAllowUserReply(newValue);

                  toast.success(
                    newValue
                      ? "User reply enabled"
                      : "User reply disabled"
                  );

                } catch (err) {
                  toast.error("Failed to update reply permission");
                }
              }}
            />

          )}

          {tab === 1 && <DetailsTab ticket={ticket} />}
          {/* {tab === 2 && <TasksTab />} */}
          {tab === 2 && <ResolutionTab ticket={ticket} />}
          {/* {tab === 4 && <RemindersTab />} */}
          {tab === 3 && <WorklogTab history={history} />}
          {tab === 4 && <InternalNotesPanel ticketId={id} isClosed={ticket.status == "CLOSED"} />}  {/*added by atchu*/}
          {tab === 5 && <HierarchyTab ticket={ticket} user={user} splitOpen={splitOpen} setSplitOpen={setSplitOpen} />}  {/*added by atchu*/}
        </Paper>

        {/* ── Right Sidebar ── */}
        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>

          {/* SLA Timer */}
          <SlaTimerCard ticket={ticket} />

          {/* Auto-Close Timer */}
          {ticket?.status === 'RESOLVED' && (
            <TicketAutoCloseState ticketId={ticket.id} />
          )}

          {/* Ticket Metadata */}
          <Paper sx={{
            p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          }}>
            <Typography sx={{
              fontWeight: 700, fontSize: '0.75rem', color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5
            }}>
              Ticket Info
            </Typography>
            <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />

            <SidebarMetaRow
              icon={<FlagIcon sx={{ fontSize: 15 }} />}
              label="Status"
              value={<TicketStatusChip status={ticket.status} />}
            />
            <SidebarMetaRow
              icon={<WarningAmberIcon sx={{ fontSize: 15 }} />}
              label="Priority"
              value={<PriorityBadge priority={ticket.priority} />}
            />
            <SidebarMetaRow
              icon={<PersonIcon sx={{ fontSize: 15 }} />}
              label="Technician"
              value={ticket.assigneeName || 'Unassigned'}
              valueColor={ticket.assigneeName ? '#1F2937' : '#9CA3AF'}
            />
            <SidebarMetaRow
              icon={<GroupIcon sx={{ fontSize: 15 }} />}
              label="Group & Site"
              value={ticket.category}
            />
            <SidebarMetaRow
              icon={<AccessTimeIcon sx={{ fontSize: 15 }} />}
              label="Due By"
              value={ticket.slaDeadline
                ? ticket.slaBreached
                  ? `Overdue — ${fmtShortDate(ticket.slaDeadline)}`
                  : fmtShortDate(ticket.slaDeadline)
                : 'Not configured'}
              valueColor={ticket.slaBreached ? '#E01950' : undefined}
            />
          </Paper>

          {/* Attachments */}
          <Paper sx={{
            p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{
                fontWeight: 700, fontSize: '0.75rem', color: '#374151',
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                Attachments
              </Typography>
              <Badge
                badgeContent={ticket.attachments?.length || 0}
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
              >
                <AttachFileIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
              </Badge>
            </Stack>
            <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />
            {ticket.attachments?.length > 0 ? (
              ticket.attachments.map((a, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{
                  py: 0.8, px: 1, borderRadius: '8px',
                  '&:hover': { backgroundColor: '#F9FAFB' },
                }}>
                  <AttachFileIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{
                    fontSize: '0.78rem', color: '#3B82F6', textDecoration: 'none', cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}>
                    {a.fileName || `Attachment ${i + 1}`}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', py: 1 }}>
                No attachments
              </Typography>
            )}
          </Paper>

          {/* Requester Card */}
          <Paper sx={{
            p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          }}>
            <Typography sx={{
              fontWeight: 700, fontSize: '0.75rem', color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5
            }}>
              Requester
            </Typography>
            <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, #97247E 0%, #C45AA8 100%)',
                fontSize: '0.9rem', fontWeight: 700,
                boxShadow: '0 2px 8px rgba(151,36,126,0.25)',
              }}>
                {ticket.requesterName?.[0]?.toUpperCase() ?? '?'}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.87rem', color: '#111827' }}>
                  {ticket.requesterName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Employee ID: {ticket.requesterId}
                </Typography>
              </Box>
            </Stack>
          </Paper>

        </Stack>
      </Stack>

      {/* ── Reopen Modal ── */}
      <ReopenModal
        open={reopenModal}
        onClose={() => setReopenModal(false)}
        onConfirm={handleReopen}
        loading={reopenLoading}
      />

      {/* ✅ ADDED: Hierarchy, Relationships panels and Split Ticket dialog
       */}
    </Box>
  );
}
