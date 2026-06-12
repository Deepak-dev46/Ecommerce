import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

// Material UI Core
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

// Material UI Icons

import TimelineIcon from '@mui/icons-material/Timeline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WorkIcon from '@mui/icons-material/Work';
import { Send as SendIcon } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';

// API & Context
import {
  addComment,
  cancelTicket,
  getAllowUserReply,
  getTicketById,
  getTicketComments,
  getTicketHistory,
  reopenTicket,
  updateTicketStatus,
} from '../../api/ticketApi';
import TicketStatusChip from '../../components/common/TicketStatusChip';
import { useAuth } from '../../context/AuthContext';
import ResolutionAckSection from './ResolutionAckSection';

/* ─── Configuration & Constants ─────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  LOW: { color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
  MEDIUM: { color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
  HIGH: { color: '#E85D26', bg: '#FEF0EB', border: '#F8C4A9' },
  CRITICAL: { color: '#E01950', bg: '#FDEDF2', border: '#F4A7BB' },
};

const STATUS_ACTIONS = {
  OPEN: ['assign', 'inprogress', 'resolve', 'close'],
  ASSIGNED: ['inprogress', 'resolve', 'close'],
  IN_PROGRESS: ['resolve', 'close', 'onhold'],
  ON_HOLD: ['inprogress', 'resolve', 'close'],
  RESOLVED: ['reopen'],
  CLOSED: [],
  REOPENED: ['assign', 'inprogress', 'resolve'],
};

const WORKLOG_STATUS_CONFIG = {
  OPEN: { bg: '#EEF0FB', color: '#27235C', border: '#C7C9E8', label: 'Open' },
  IN_PROGRESS: { bg: '#FFF7E6', color: '#B45309', border: '#FDE68A', label: 'In Progress' },
  ON_HOLD: { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB', label: 'On Hold' },
  RESOLVED: { bg: '#EDFAF2', color: '#15803D', border: '#B7EAC9', label: 'Resolved' },
  CLOSED: { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB', label: 'Closed' },
  REOPENED: { bg: '#FEF0EB', color: '#C2410C', border: '#F8C4A9', label: 'Reopened' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', border: '#D1D5DB', label: 'Cancelled' },
};

const COMMENT_ALLOWED = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'REOPENED'];

const TABS = [
  { label: 'Details', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Conversations', icon: <ChatBubbleOutlineIcon fontSize="small" /> },
  { label: 'Resolution', icon: <CheckCircleIcon fontSize="small" /> },
  { label: 'Approvals', icon: <ThumbUpAltIcon fontSize="small" /> },
  { label: 'History', icon: <WorkIcon fontSize="small" /> },
];

/* ─── Helper Functions ──────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '—';

const fmtShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : '—';

const formatTimeWorklog = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const formatDayHeader = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const toDateKey = (dateStr) => new Date(dateStr).toLocaleDateString('en-CA');

/* ─── Shared UI Sub-components ─────────────────────────────────────────── */
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.2,
        py: 0.35,
        borderRadius: '6px',
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cfg.color }} />
      <Typography
        sx={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: cfg.color,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
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
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            mb: 0.2,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: valueColor || '#1F2937',
            wordBreak: 'break-word',
          }}
        >
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

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
        whiteSpace: 'nowrap',
        ...(variant === 'contained'
          ? {
            backgroundColor: color,
            color: '#fff',
            '&:hover': { backgroundColor: color, filter: 'brightness(0.88)' },
          }
          : {
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

function EmptyState({ icon, title, subtitle }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 6, px: 3 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: '#9CA3AF',
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.83rem', color: '#9CA3AF', textAlign: 'center' }}>{subtitle}</Typography>
    </Stack>
  );
}

function WorklogStatusBadge({ status }) {
  const cfg = WORKLOG_STATUS_CONFIG[status] || WORKLOG_STATUS_CONFIG.OPEN;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 20,
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: '5px',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

/* ─── Conversations & Chat Elements ────────────────────────────────────── */
function CommentBubble({ comment, isOwnMessage }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        mb: 2.5,
        width: '100%',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      }}
    >
      {!isOwnMessage && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #97247E 0%, #C45AA8 100%)',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {comment.authorName?.[0]?.toUpperCase() ?? 'U'}
        </Avatar>
      )}

      <Box sx={{ maxWidth: '75%', minWidth: 120 }}>
        <Box sx={{ mb: 0.8 }}>
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#1F2937',
              textAlign: isOwnMessage ? 'right' : 'left',
            }}
          >
            {comment.authorName}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: '#9CA3AF',
              mt: 0.2,
              textAlign: isOwnMessage ? 'right' : 'left',
            }}
          >
            {fmtDate(comment.createdAt)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.8,
            borderRadius: isOwnMessage ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            backgroundColor: isOwnMessage ? '#EEF0FB' : '#FFFFFF',
            border: `1px solid ${isOwnMessage ? '#C7C9E8' : '#E5E7EB'}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color: '#374151',
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
            background: 'linear-gradient(135deg, #27235C 0%, #524F7D 100%)',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {comment.authorName?.[0]?.toUpperCase() ?? 'M'}
        </Avatar>
      )}
    </Stack>
  );
}

const MAX_CHARS = 100;

function ConversationsTab({
  comments,
  ticket,
  commentText,
  setCommentText,
  onAddComment,
  submitting,
  commentsEndRef,
  allowUserReply,
  user,
}) {
  const canComment = COMMENT_ALLOWED.includes(ticket?.status) && allowUserReply;
  const charCount = commentText.length;
  const isEmpty = commentText.trim().length === 0;

  const getCounterColor = () => {
    if (charCount >= MAX_CHARS) return '#EF4444';
    if (charCount >= MAX_CHARS * 0.8) return '#F59E0B';
    return '#9CA3AF';
  };

  const getBorderColor = (isHover = false) => {
    if (charCount >= MAX_CHARS) return '#EF4444';
    if (charCount > 0) return isHover ? '#1A9A3C' : '#24A148';
    return isHover ? '#D1D5DB' : '#E5E7EB';
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* Comments List */}
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
          {comments.map((c, i) => (
            <CommentBubble
              key={c.id || i}
              comment={c}
              isOwnMessage={c.userId === user?.userId}
            />
          ))}
          <div ref={commentsEndRef} />
        </Box>
      )}

      {/* Reply Input */}
      {canComment && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
            Add Reply
          </Typography>

          <TextField
            multiline
            minRows={3}
            maxRows={8}
            placeholder="Type your reply here..."
            value={commentText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setCommentText(e.target.value);
              }
            }}
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{ alignSelf: 'flex-end', mb: 1.2, mr: 0.5 }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: getCounterColor(),
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {charCount}/{MAX_CHARS}
                  </Typography>
                </InputAdornment>
              ),
            }}
            helperText={isEmpty ? 'Reply cannot be empty' : ''}
            FormHelperTextProps={{
              sx: {
                fontSize: '0.74rem',
                color: '#9CA3AF',
                mt: 0.5,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '0.87rem',
                alignItems: 'flex-start',
                '& fieldset': {
                  borderColor: getBorderColor(),
                  transition: 'border-color 0.2s ease',
                },
                '&:hover fieldset': {
                  borderColor: getBorderColor(true),
                },
                '&.Mui-focused fieldset': {
                  borderColor: charCount >= MAX_CHARS ? '#EF4444' : '#24A148',
                },
              },
            }}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="contained"
              endIcon={
                submitting
                  ? <CircularProgress size={13} color="inherit" />
                  : <SendIcon />
              }
              onClick={onAddComment}
              disabled={submitting || isEmpty || charCount >= MAX_CHARS}
              sx={{
                backgroundColor: '#27235C',
                borderRadius: '8px',
                fontSize: '0.82rem',
                '&:hover': { backgroundColor: '#1B193F' },
                '&.Mui-disabled': {
                  backgroundColor: '#E5E7EB',
                  color: '#9CA3AF',
                },
              }}
            >
              {submitting ? 'Sending…' : 'Send Reply'}
            </Button>
          </Stack>
        </Stack>
      )}

      {/* Disabled Reply Notice */}
      {COMMENT_ALLOWED.includes(ticket?.status) && !allowUserReply && (
        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: '#9CA3AF' }}>
          Replying is disabled by support personnel.
        </Typography>
      )}

    </Box>
  );
}

/* ─── Timeline History Elements ─────────────────────────────────────────── */
function HistoryRow({ event, isLast }) {
  const time = formatTimeWorklog(event.createdAt);
  const isSystem = event.createdByName === 'System';

  const agentName = event.createdByName ? event.createdByName : isSystem ? 'System' : `User #${event.changedBy}`;

  const initials = isSystem
    ? 'SM'
    : event.createdByName
      ? event.createdByName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      : String(event.changedBy).slice(0, 2).toUpperCase();

  return (
    <Box sx={{ display: 'flex', position: 'relative', mb: 3 }}>
      {/* Time column */}
      <Box sx={{ width: 90, textAlign: 'right', pr: 2, pt: 1, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
          {time}
        </Typography>
      </Box>

      {/* Connection Graphics */}
      <Box sx={{ width: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            fontSize: '0.8rem',
            fontWeight: 700,
            background: isSystem ? 'linear-gradient(135deg,#9CA3AF,#6B7280)' : 'linear-gradient(135deg, #97247E 0%, #C45AA8 100%)',
          }}
        >
          {initials}
        </Avatar>
        {!isLast && <Box sx={{ width: 2, flex: 1, minHeight: 60, backgroundColor: '#E5E7EB', mt: 1 }} />}
      </Box>

      {/* Information Cards */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.10)' },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{agentName}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
              {new Date(event.createdAt).toLocaleString()}
            </Typography>
          </Stack>

          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', mb: 1 }}>
            Ticket Activity
          </Typography>

          {event.remarks ? (
            <Typography sx={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {event.remarks}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', fontStyle: 'italic' }}>
              No remarks available
            </Typography>
          )}

          {event.status && (
            <Box sx={{ mt: 1.5 }}>
              <WorklogStatusBadge status={event.status} />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

// function WorklogTab({ history }) {
//   if (!history || history.length === 0) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <EmptyState icon={<WorkIcon />} title="No history available" subtitle="Ticket activity will appear here" />
//       </Box>
//     );
//   }

//   const sorted = useMemo(() => [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [history]);

//   const groups = useMemo(() => {
//     const map = new Map();
//     sorted.forEach((evt) => {
//       const key = toDateKey(evt.createdAt);
//       if (!map.has(key)) map.set(key, []);
//       map.get(key).push(evt);
//     });
//     return Array.from(map.entries());
//   }, [sorted]);

//   return (
//     <Box sx={{ p: 3 }}>
//       {groups.map(([dateKey, events]) => (
//         <Box key={dateKey} sx={{ mb: 4 }}>
//           <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
//             <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F97316' }} />
//             <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//               {formatDayHeader(events[0].createdAt)}
//             </Typography>
//           </Stack>

//           {events.map((event, index) => (
//             <HistoryRow key={event.history_id || `${event.createdAt}-${index}`} event={event} isLast={index === events.length - 1} />
//           ))}
//         </Box>
//       ))}
//     </Box>
//   );
// }

/* ─── Fully Redesigned Interactive Worklog Tab ────────────────── */
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

  // Order chronologically to construct lifecycle progression paths correctly
  const ascendingHistory = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, backgroundColor: '#F8FAFC' }}>

      {/* Dynamic Activity Header Metadata */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <TimelineIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Lifecycle Progression Pipeline
          </Typography>
        </Stack>
        <Chip
          label={`${history.length} Event Logs`}
          size="small"
          sx={{ fontWeight: 700, fontSize: '0.72rem', backgroundColor: '#E0E7FF', color: '#4338CA', px: 0.5 }}
        />
      </Stack>

      <Box sx={{ position: 'relative', pl: { xs: 0, sm: 1 } }}>
        {ascendingHistory.map((event, idx) => {
          // Identify previous system status states safely
          const prevStatus = idx > 0 ? ascendingHistory[idx - 1].status : null;
          const isLast = idx === ascendingHistory.length - 1;

          return (
            <InteractiveHistoryRow
              key={event.history_id || idx}
              event={event}
              isLast={isLast}
              index={idx}
              prevStatus={prevStatus}
            />
          );
        })}
      </Box>
    </Box>
  );
}

/* ─── Modern Connected History Row Component ───────────────────── */
function InteractiveHistoryRow({ event, isLast, index, prevStatus }) {
  const createdAt = new Date(event.createdAt);
  const date = createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const isSystem = event.changedBy === 0;
  const actor = isSystem ? 'System Engine' : event.createdByName || 'Support Agent';

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>

      {/* Dynamic Connector Track and Pipeline Nodes */}
      <Stack alignItems="center" sx={{ mr: 3, flexShrink: 0 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: isSystem ? '#F1F5F9' : '#EEF2FF',
            border: `2px solid ${isSystem ? '#94A3B8' : '#4F46E5'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSystem ? '#64748B' : '#4F46E5',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          {isSystem ? <StorageIcon sx={{ fontSize: 15 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
        </Box>

        {!isLast && (
          <Box
            sx={{
              width: 2,
              flexGrow: 1,
              background: `linear-gradient(to bottom, ${isSystem ? '#94A3B8' : '#4F46E5'} 0%, #E2E8F0 100%)`,
              my: 0.5,
              minHeight: 50,
            }}
          />
        )}
      </Stack>

      {/* Interactive Activity Box Card */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          p: 2,
          mb: isLast ? 0 : 3,
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFF',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: isSystem ? '#64748B' : '#4F46E5',
            transform: 'translateX(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
              {actor}
            </Typography>
            <Chip
              label={isSystem ? 'Automated' : 'Agent Action'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 600,
                backgroundColor: isSystem ? '#F8FAFC' : '#EFF6FF',
                color: isSystem ? '#64748B' : '#2563EB'
              }}
            />
          </Stack>
          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>
            {date} • {time}
          </Typography>
        </Stack>

        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500, mb: 1.5, lineHeight: 1.5 }}>
          {event.remarks}
        </Typography>

        {/* Dynamic State Pipeline Transition Badge */}
        {event.status && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
              State Progression:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              {prevStatus && prevStatus !== event.status && (
                <>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, opacity: 0.7 }}>
                    {prevStatus.replace('_', ' ')}
                  </span>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>➔</Typography>
                </>
              )}
              <TicketStatusChip status={event.status} />
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}


/* ─── Static/Functional Tabs ────────────────────────────────────────────── */
function DetailsTab({ ticket }) {
  const rows = [
    { label: 'Ticket Number', value: ticket.ticketNumber },
    { label: 'Status', value: <TicketStatusChip status={ticket.status} /> },
    { label: 'Priority', value: <PriorityBadge priority={ticket.priority} /> },
    { label: 'Impact', value: ticket.impact },
    { label: 'Urgency', value: ticket.urgency },
    { label: 'Type', value: ticket.type },
    { label: 'Service Type', value: ticket.serviceType },
    { label: 'Category', value: ticket.category },
    { label: 'Sub-Category', value: ticket.subCategory },
    { label: 'Item', value: ticket.item },
    { label: 'Department', value: ticket.department },
    { label: 'Requester', value: ticket.requesterName },
    { label: 'Requester Email', value: ticket.requesterEmail },
    { label: 'Assignee', value: ticket.assigneeName || 'Unassigned' },
    { label: 'Assigned Group', value: ticket.assignedGroup },
    { label: 'Mode', value: ticket.mode },
    { label: 'Location', value: ticket.location },
    { label: 'Phone', value: ticket.mobileNumber },
    { label: 'Created At', value: fmtDate(ticket.createdAt) },
    { label: 'Last Updated', value: fmtDate(ticket.updatedAt) },
    { label: 'Resolved At', value: ticket.resolvedAt ? fmtDate(ticket.resolvedAt) : null },
    { label: 'Closed At', value: ticket.closedAt ? fmtDate(ticket.closedAt) : null },
  ].filter((r) => r.value !== null && r.value !== undefined && r.value !== '—' && r.value !== '');

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Request Details
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', borderColor: '#E5E7EB' }}>
        {rows.map((row, i) => (
          <Stack
            key={i}
            direction="row"
            alignItems="center"
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
              '&:hover': { backgroundColor: '#FAFAFA' },
              transition: 'background-color 0.15s',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', width: 160, flexShrink: 0 }}>{row.label}</Typography>
            {typeof row.value === 'string' ? (
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>{row.value}</Typography>
            ) : (
              row.value
            )}
          </Stack>
        ))}
      </Paper>

      {ticket.description && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Description
          </Typography>
          <Box sx={{ p: 2.5, backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </Typography>
          </Box>
        </Box>
      )}

      {ticket.resolutionNotes && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Resolution Notes
          </Typography>
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

function ResolutionTab({ ticket }) {
  if (!ticket.resolutionNotes) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState icon={<CheckCircleIcon />} title="No resolution recorded" subtitle="Resolution notes will appear here when the ticket is resolved" />
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

function ApprovalsTab({ ticket }) {
  const approvals = ticket.approvals || [];

  if (approvals.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState icon={<ThumbUpAltIcon />} title="No approvals required" subtitle="Approval requests for this ticket will appear here" />
      </Box>
    );
  }

  const getStatusStyle = (status) => ({
    px: 1.5,
    py: 0.5,
    minWidth: 100,
    textAlign: 'center',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: status === 'APPROVED' ? '#DCFCE7' : status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
    color: status === 'APPROVED' ? '#166534' : status === 'REJECTED' ? '#991B1B' : '#92400E',
  });

  return (
    <Box sx={{ p: 3 }}>
      {approvals.map((a, i) => (
        <Paper key={i} elevation={0} sx={{ mb: 2, border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <Typography fontWeight={600}>Approval Workflow</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 2, borderBottom: '1px solid #F3F4F6' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>Level 1 Approver</Typography>
              <Typography sx={{ fontWeight: 600, color: '#111827' }}>{a.l1ApproverName || 'Not Assigned'}</Typography>
            </Box>
            <Box sx={getStatusStyle(a.l1Status)}>{a.l1Status || 'PENDING'}</Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>Level 2 Approver</Typography>
              <Typography sx={{ fontWeight: 600, color: '#111827' }}>{a.l2ApproverName || 'Not Assigned'}</Typography>
            </Box>
            <Box sx={getStatusStyle(a.l2Status)}>{a.l2Status || 'PENDING'}</Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

/* ─── Operational Modals ────────────────────────────────────────────────── */
function ReopenModal({ open, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const MIN_LENGTH = 20;
  const tooShort = reason.trim().length > 0 && reason.trim().length < MIN_LENGTH;
  const isEmpty = reason.trim().length === 0;
  const hasError = touched && (isEmpty || tooShort);

  const handleClose = () => {
    setReason('');
    setTouched(false);
    onClose();
  };
  const handleSubmit = () => {
    setTouched(true);
    if (isEmpty || tooShort) return;
    onConfirm(reason.trim());
    setReason('');
    setTouched(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #E5E7EB' } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #F3F4F6' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', backgroundColor: '#F8EDFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReplayIcon sx={{ color: '#97247E', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Reopen Ticket</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>Please provide a reason to reopen this ticket</Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#9CA3AF' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Alert severity="info" icon={<ReplayIcon fontSize="small" />} sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.82rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
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
          placeholder="Describe why this ticket needs to be reopened..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setTouched(true); }}
          error={hasError}
          helperText={hasError ? (isEmpty ? 'A reason is required.' : `At least ${MIN_LENGTH} characters required.`) : `${reason.trim().length} characters entered`}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.87rem' } }}
        />

        <Box sx={{ mt: 1.5 }}>
          <LinearProgress variant="determinate" value={Math.min(100, (reason.trim().length / MIN_LENGTH) * 100)} sx={{ height: 3, borderRadius: 2 }} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #F3F4F6', gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: '9px' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ backgroundColor: '#97247E', borderRadius: '9px', '&:hover': { backgroundColor: '#7B1D68' } }}>
          {loading ? 'Reopening…' : 'Reopen Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [reopenModal, setReopenModal] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTouched, setCancelTouched] = useState(false);
  const [allowUserReply, setAllowUserReply] = useState(false);

  const commentsEndRef = useRef(null);

  const loadAll = useCallback(async () => {
    try {
      const [{ data: t }, { data: c }, { data: h }, { data: r }] = await Promise.all([
        getTicketById(id),
        getTicketComments(id),
        getTicketHistory(id),
        getAllowUserReply(id),
      ]);
      setTicket(t);
      setComments(c);
      setHistory(h);
      setAllowUserReply(r);
    } catch (err) {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (tab === 1) commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tab, comments]);

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!allowUserReply) {
      toast.error('Support has disabled replies for this ticket');
      return;
    }
    if (!trimmed) {
      toast.error('Comment cannot be empty');
      return;
    }
    setSubmittingComment(true);
    try {
      const lastApproverMsg = [...comments].reverse().find((c) => c.channel && c.channel !== null);
      const replyChannel = lastApproverMsg?.channel ?? null;

      await addComment(id, {
        body: trimmed,
        authorId: user.userId,
        authorName: user.fullName,
        authorRole: 'END_USER',
        channel: replyChannel,
      });

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

  const handleReopen = async (reason) => {
    setReopenLoading(true);
    try {
      await reopenTicket(id, {
        reason: reason,
        requestedById: user.userId,
      });
      toast.success('Ticket reopened successfully');
      setReopenModal(false);
      await loadAll();
      setTab(4); // Switches directly to history
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen ticket');
    } finally {
      setReopenLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelTouched(true);
    if (!cancelReason.trim() || cancelReason.trim().length < 10) return;
    setCancelLoading(true);
    try {
      await cancelTicket(id, {
        reason: cancelReason.trim(),
        cancelledBy: 'End User',
        cancelledById: ticket?.requesterId || null,
      });
      toast.success('Ticket cancelled successfully');
      setCancelModal(false);
      setCancelReason('');
      setCancelTouched(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel ticket');
    } finally {
      setCancelLoading(false);
    }
  };

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

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
      {/* Navigation & Export Top bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            onClick={() => navigate('/user/tickets')}
            size="small"
            sx={{ backgroundColor: '#27235C', color: '#fff', borderRadius: '10px', width: 36, height: 36, '&:hover': { backgroundColor: '#1B193F' } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ color: '#6B7280', fontSize: '0.85rem' }}>Tickets /</Typography>
          <Typography sx={{ color: '#27235C', fontSize: '0.85rem', fontWeight: 600 }}>{ticket.ticketNumber}</Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            const rows = [
              ['Field', 'Value'],
              ['Ticket Number', ticket.ticketNumber || ''],
              ['Subject', `"${(ticket.subject || '').replace(/"/g, '""')}"`],
              ['Status', ticket.status || ''],
              ['Priority', ticket.priority || ''],
              ['Category', ticket.category || ''],
              ['Description', `"${(ticket.description || '').replace(/"/g, '""')}"`],
            ];
            const csv = rows.map((r) => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `ticket-${ticket.ticketNumber}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
          sx={{ borderColor: '#27235C', color: '#27235C', borderRadius: '9px', fontWeight: 600 }}
        >
          Export CSV
        </Button>
      </Stack>

      {/* Primary Header Card */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 2.5, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
              <Box sx={{ px: 1.2, py: 0.3, borderRadius: '6px', backgroundColor: '#EEF0FB', border: '1px solid #C7C9E8' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#27235C', fontFamily: 'monospace' }}>{ticket.ticketNumber}</Typography>
              </Box>
              <TicketStatusChip status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: { xs: '1.1rem', md: '1.35rem' }, mb: 1 }}>
              {ticket.subject}
            </Typography>
            <Stack direction="row" spacing={2.5} flexWrap="wrap" sx={{ gap: 1 }}>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <PersonIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>{ticket.requesterName}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>{fmtDate(ticket.createdAt)}</Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: 1, flexShrink: 0 }}>
            {availableActions.includes('reopen') && (
              <ActionButton label="Reopen" icon={<ReplayIcon />} color="#97247E" variant="contained" onClick={() => setReopenModal(true)} />
            )}
            {ticket?.status === 'OPEN' && (
              <ActionButton label="Cancel Ticket" icon={<CancelOutlinedIcon />} color="#DC2626" variant="outlined" onClick={() => setCancelModal(true)} />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Banner Action Acknowledgement Notification */}
      {ticket?.status === 'PENDING_USER_ACK' && (
        <ResolutionAckSection ticketId={Number(id)} userId={user?.userId} resolutionNotes={ticket?.resolutionNotes} onAcknowledged={loadAll} />
      )}

      {/* Main Structural View split into Tabs and Right Sidebar */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start">
        <Paper sx={{ flex: 1, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', minWidth: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #F3F4F6',
              backgroundColor: '#FAFAFA',
              minHeight: 46,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', minHeight: 46, color: '#6B7280', '&.Mui-selected': { color: '#27235C' } },
              '& .MuiTabs-indicator': { backgroundColor: '#27235C', height: 2.5 },
            }}
          >
            {TABS.map((t, i) => (
              <Tab key={i} icon={t.icon} iconPosition="start" label={i === 1 ? `${t.label} (${comments.length})` : t.label} />
            ))}
          </Tabs>

          {tab === 0 && <DetailsTab ticket={ticket} />}
          {tab === 1 && (
            <ConversationsTab
              comments={comments}
              ticket={ticket}
              commentText={commentText}
              setCommentText={setCommentText}
              onAddComment={handleAddComment}
              submitting={submittingComment}
              commentsEndRef={commentsEndRef}
              allowUserReply={allowUserReply}
              user={user}
            />
          )}
          {tab === 2 && <ResolutionTab ticket={ticket} />}
          {tab === 3 && <ApprovalsTab ticket={ticket} />}
          {tab === 4 && <WorklogTab history={history} />}
        </Paper>

        {/* Sidebar Info Panels */}
        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Paper sx={{ p: 2.5, borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', textTransform: 'uppercase', mb: 1.5 }}>Ticket Info</Typography>
            <Divider sx={{ mb: 1.5 }} />
            <SidebarMetaRow icon={<FlagIcon sx={{ fontSize: 15 }} />} label="Status" value={<TicketStatusChip status={ticket.status} />} />
            <SidebarMetaRow icon={<WarningAmberIcon sx={{ fontSize: 15 }} />} label="Priority" value={<PriorityBadge priority={ticket.priority} />} />
            <SidebarMetaRow icon={<PersonIcon sx={{ fontSize: 15 }} />} label="Technician" value={ticket.assigneeName || 'Unassigned'} />
            <SidebarMetaRow icon={<GroupIcon sx={{ fontSize: 15 }} />} label="Category" value={ticket.category} />
          </Paper>

          {/* Attachments Section */}
          <Paper sx={{ p: 2.5, borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', textTransform: 'uppercase' }}>Attachments</Typography>
              <Badge badgeContent={ticket.attachments?.length || 0} color="primary">
                <AttachFileIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
              </Badge>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            {ticket.attachments?.length > 0 ? (
              // ticket.attachments.map((a, i) => (
              //   <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ py: 0.8 }}>
              //     <AttachFileIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
              //     <Typography sx={{ fontSize: '0.78rem', color: '#3B82F6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              //       {a.fileName || `Attachment ${i + 1}`}
              //     </Typography>
              //   </Stack>
              // ))
              ticket.attachments.map((a, i) => {
                // const handleOpen = () => {
                //   if (!a.file) return;
                //   const byteChars = atob(a.file);
                //   const byteArray = new Uint8Array(byteChars.length);
                //   for (let j = 0; j < byteChars.length; j++) {
                //     byteArray[j] = byteChars.charCodeAt(j);
                //   }
                //   const blob = new Blob([byteArray], { type: a.mimeType || 'application/octet-stream' });
                //   const url = URL.createObjectURL(blob);
                //   window.open(url, '_blank');
                // };
                const openOrDownload = (forceDownload) => {
  if (!a.file) return;
  const byteChars = atob(a.file);
  const byteArray = new Uint8Array(byteChars.length);
  for (let j = 0; j < byteChars.length; j++) {
    byteArray[j] = byteChars.charCodeAt(j);
  }
  const blob = new Blob([byteArray], { type: a.mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  if (forceDownload) {
    link.download = a.filename || `attachment-${i + 1}`;
  } else {
    link.target = '_blank';
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
 
                return (
                  <Stack key={a.attachmentID || i} direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ py: 0.8 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden' }}>
                      <AttachFileIcon sx={{ fontSize: 14, color: '#9CA3AF', flexShrink: 0 }} />
                      <Typography
                        onClick={() => openOrDownload(false)}
                        sx={{ fontSize: '0.78rem', color: '#3B82F6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {a.filename || `Attachment ${i + 1}`}
                      </Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => openOrDownload(true)} title="Download">
                      <DownloadIcon sx={{ fontSize: 15, color: '#6B7280' }} />
                    </IconButton>
                  </Stack>
                );
              })

            ) : (
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center', py: 1 }}>No attachments</Typography>
            )}
          </Paper>

          {/* Requestor Identification Metadata Profile */}
          <Paper sx={{ p: 2.5, borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', textTransform: 'uppercase', mb: 1.5 }}>Requester</Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #97247E 0%, #C45AA8 100%)', fontWeight: 700 }}>
                {ticket.requesterName?.[0]?.toUpperCase() ?? '?'}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.87rem', color: '#111827' }}>{ticket.requesterName}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Employee ID: {ticket.requesterId}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      <ReopenModal open={reopenModal} onClose={() => setReopenModal(false)} onConfirm={handleReopen} loading={reopenLoading} />

      {/* Cancellation Validation Form Modal overlay */}
      <Dialog open={cancelModal} onClose={() => { setCancelModal(false); setCancelReason(''); setCancelTouched(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CancelOutlinedIcon sx={{ fontSize: 18, color: '#DC2626' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Cancel Ticket</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#6B7280' }}>Please provide a reason for cancellation</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => { setCancelModal(false); setCancelReason(''); setCancelTouched(false); }} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ p: 2, backgroundColor: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA', mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#991B1B' }}>Cancelling this ticket will permanently close it. This action cannot be undone.</Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cancellation Reason"
            placeholder="Describe why you are cancelling this ticket (minimum 10 characters)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            error={cancelTouched && (!cancelReason.trim() || cancelReason.trim().length < 10)}
            helperText={cancelTouched && (!cancelReason.trim() ? 'A reason is required.' : cancelReason.trim().length < 10 ? `At least 10 characters required (${cancelReason.trim().length}/10)` : '')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.875rem' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #F3F4F6', gap: 1 }}>
          <Button onClick={() => { setCancelModal(false); setCancelReason(''); setCancelTouched(false); }} variant="outlined">Keep Ticket</Button>
          <Button onClick={handleCancel} variant="contained" disabled={cancelLoading} sx={{ backgroundColor: '#DC2626', '&:hover': { backgroundColor: '#B91C1C' } }}>
            {cancelLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Cancel Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}