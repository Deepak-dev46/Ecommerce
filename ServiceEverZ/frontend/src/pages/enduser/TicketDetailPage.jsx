
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import ReplyIcon from '@mui/icons-material/Reply';
import DownloadIcon from '@mui/icons-material/Download';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WorkIcon from '@mui/icons-material/Work';
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
  Stack, Tab, Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Send as SendIcon } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addComment,
  cancelTicket,
  getAllowUserReply,
  getTicketById,
  getTicketComments,
  getTicketHistory,
  reopenTicket,
  updateTicketStatus
} from '../../api/ticketApi';
import TicketStatusChip from '../../components/common/TicketStatusChip';
import { useAuth } from '../../context/AuthContext';
import { userAxios } from '../../api/axiosInstance';
import { userApi } from '../../api/userApi';
import { roleApi } from '../../api/roleApi';

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
  RESOLVED: ['reopen'],
  CLOSED: [],
  REOPENED: ['assign', 'inprogress', 'resolve'],
};



const COMMENT_ALLOWED = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'REOPENED'];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    : '—';

const fmtShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    : '—';

function pad(n) { return String(n).padStart(2, '0'); }

function formatDuration(totalSeconds) {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const sign = totalSeconds < 0 ? '-' : '';
  return `${sign}${h > 0 ? `${pad(h)}h ` : ''}${pad(m)}m ${pad(s)}s`;
}

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
      <Typography sx={{
        fontSize: '0.72rem', fontWeight: 700, color: cfg.color,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
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
        <Typography sx={{
          fontSize: '0.7rem', color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2,
        }}>
          {label}
        </Typography>
        <Typography sx={{
          fontSize: '0.82rem', fontWeight: 600,
          color: valueColor || '#1F2937', wordBreak: 'break-word',
        }}>
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
        mb: 2.5,
        width: "100%",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
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
            fontWeight: 700,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {comment.authorName?.[0]?.toUpperCase() ?? "U"}
        </Avatar>
      )}

      <Box sx={{ maxWidth: "75%", minWidth: 120 }}>
        {/* Name and Date */}
        <Box sx={{ mb: 0.8 }}>
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#1F2937",
              textAlign: isOwnMessage ? "right" : "left",
            }}
          >
            {comment.authorName}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "#9CA3AF",
              mt: 0.2,
              textAlign: isOwnMessage ? "right" : "left",
            }}
          >
            {fmtDate(comment.createdAt)}
          </Typography>
        </Box>

        {/* Message Bubble */}
        <Box
          sx={{
            p: 1.8,
            borderRadius: isOwnMessage
              ? "12px 4px 12px 12px"
              : "4px 12px 12px 12px",
            backgroundColor: isOwnMessage
              ? "#EEF0FB"
              : "#FFFFFF",
            border: `1px solid ${isOwnMessage ? "#C7C9E8" : "#E5E7EB"
              }`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              color: "#374151",
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
            fontWeight: 700,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {comment.authorName?.[0]?.toUpperCase() ?? "M"}
        </Avatar>
      )}
    </Stack>
  );
}

/* ─── Worklog helpers ────────────────────────────────────────── */

/** "7:24 AM" */
function formatTimeWorklog(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/** "Sun, 16 Oct, 2022" */
function formatDayHeader(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Strip time → "YYYY-MM-DD" used as Map key for grouping */
function toDateKey(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA'); // YYYY-MM-DD
}

/** Per-status chip config for the Worklog timeline */
const WORKLOG_STATUS_CONFIG = {
  OPEN: { bg: '#EEF0FB', color: '#27235C', border: '#C7C9E8', label: 'Open' },
  IN_PROGRESS: { bg: '#FFF7E6', color: '#B45309', border: '#FDE68A', label: 'In Progress' },
  ON_HOLD: { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB', label: 'On Hold' },
  RESOLVED: { bg: '#EDFAF2', color: '#15803D', border: '#B7EAC9', label: 'Resolved' },
  CLOSED: { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB', label: 'Closed' },
  REOPENED: { bg: '#FEF0EB', color: '#C2410C', border: '#F8C4A9', label: 'Reopened' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', border: '#D1D5DB', label: 'Cancelled' },
};

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

/* ─── HistoryRow (updated — matches reference image layout) ─── */
/**
 * Props
 *   event  : one DB history record  { history_id, changedBy, changedByName?,
 *                                      changedAt, remarks, status, ticket_id }
 *   isLast : boolean — suppresses the downward connector line on the last item
 */
function HistoryRow({ event, isLast }) {
  const time = formatTimeWorklog(event.createdAt);

  console.log(event);


  const isSystem = event.changedByName == 'System';

  const agentName = event.changedByName
    ? event.changedByName
    : isSystem
      ? "System"
      : `User #${event.changedBy}`;

  const initials = isSystem
    ? "SM"
    : event.changedByName
      ? event.changedByName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
      : String(event.changedBy)
        .slice(0, 2)
        .toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        mb: 3,
      }}
    >
      {/* Time */}
      <Box
        sx={{
          width: 90,
          textAlign: "right",
          pr: 2,
          pt: 1,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#6B7280",
            fontWeight: 600,
          }}
        >
          {time}
        </Typography>
      </Box>

      {/* Timeline */}
      <Box
        sx={{
          width: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            fontSize: "0.8rem",
            fontWeight: 700,
            background:
              isSystem
                ? "linear-gradient(135deg,#9CA3AF,#6B7280)"
                : "linear-gradient(135deg,#27235C,#524F7D)",
          }}
        >
          {initials}
        </Avatar>

        {!isLast && (
          <Box
            sx={{
              width: 2,
              flex: 1,
              minHeight: 60,
              backgroundColor: "#E5E7EB",
              mt: 1,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            },
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#111827",
              }}
            >
              {agentName}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#6B7280",
              }}
            >
              {new Date(event.createdAt).toLocaleString()}
            </Typography>
          </Stack>

          {/* Activity */}
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#374151",
              mb: 1,
            }}
          >
            Ticket Activity
          </Typography>

          {/* Remarks */}
          {event.remarks ? (
            <Typography
              sx={{
                fontSize: "0.85rem",
                color: "#4B5563",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {event.remarks}
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#9CA3AF",
                fontStyle: "italic",
              }}
            >
              No remarks available
            </Typography>
          )}

          {/* Status */}
          {event.status && (
            <Box sx={{ mt: 1.5 }}>
              <WorklogStatusBadge
                status={event.status}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

;

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
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row" alignItems="center" justifyContent="space-between"
          sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #F3F4F6' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              backgroundColor: '#F8EDFB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              color: hasError
                ? '#E01950'
                : reason.trim().length >= MIN_LENGTH
                  ? '#24A148'
                  : '#9CA3AF',
              mt: 0.8,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontSize: '0.87rem',
              '&.Mui-error fieldset': { borderColor: '#E01950' },
              '&:not(.Mui-error) fieldset': {
                borderColor: reason.trim().length >= MIN_LENGTH ? '#24A148' : '#E5E7EB',
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
              },
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
            '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
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
        backgroundColor: '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mb: 2, color: '#9CA3AF',
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.83rem', color: '#9CA3AF', textAlign: 'center' }}>{subtitle}</Typography>
    </Stack>
  );
}

/* ─── Tabs Content ───────────────────────────────────────────── */
// function ConversationsTab({ comments, ticket, commentText, setCommentText, onAddComment, submitting, commentsEndRef }) {
//   const canComment = COMMENT_ALLOWED.includes(ticket?.status);
//   console.log(comments);

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
  user  // 🔹 comes from support toggle
}) {
  const canComment =
    COMMENT_ALLOWED.includes(ticket?.status) &&
    allowUserReply;
  // const canComment = COMMENT_ALLOWED.includes(ticket?.status);
  const [me, setMe] = useState("")

  let loadUser = async (id) => {
    let res = await roleApi.getRoleById(id);
    setMe(res.data);
    console.log(me);
  }
  return (
    <Box sx={{ p: 3 }}>
      {comments.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleOutlineIcon />}
          title="No conversations yet"
          subtitle="Replies and notes will appear here"
        />
      ) : (
        <Box sx={{
          mb: 2.5, maxHeight: 460, overflowY: 'auto', pr: 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#E5E7EB', borderRadius: 4 },
        }}>
          {comments.map((c, i) => {
            console.log(c);
            return <CommentBubble key={c.id || i}
              comment={c}
              isOwnMessage={c.userId === user?.userId}
            />
          })}
          <div ref={commentsEndRef} />
        </Box>
      )}

      {/* 🔹 End-user reply box only if support enabled */}
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
            onChange={e => setCommentText(e.target.value)}
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
              }
            }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="contained"
              endIcon={submitting ? <CircularProgress size={13} color="inherit" /> : <SendIcon />}
              onClick={onAddComment}
              disabled={submitting || !commentText.trim()}
              sx={{
                backgroundColor: '#27235C',
                borderRadius: '8px',
                fontSize: '0.82rem',
                '&:hover': { backgroundColor: '#1B193F' }
              }}
            >
              {submitting ? 'Sending…' : 'Send Reply'}
            </Button>
          </Stack>
        </Stack>
      )}

      {/* 🔹 If disabled, show a small note */}
      {COMMENT_ALLOWED.includes(ticket?.status) && !allowUserReply && (
        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: '#9CA3AF' }}>
          Replying is disabled by support personnel.
        </Typography>
      )}
    </Box>
  );
}


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
  ].filter(r => r.value !== null && r.value !== undefined && r.value !== '—' && r.value !== '');

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{
        fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 2,
        textTransform: 'uppercase', letterSpacing: '0.07em',
      }}>
        Request Details
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', borderColor: '#E5E7EB' }}>
        {rows.map((row, i) => (

          <Stack
            key={i}
            direction="row"
            alignItems="center"
            sx={{
              px: 2.5, py: 1.5,
              borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
              '&:hover': { backgroundColor: '#FAFAFA' },
              transition: 'background-color 0.15s',
            }}
          >
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
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
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
          <Typography sx={{
            fontWeight: 700, color: '#111827', fontSize: '0.85rem', mb: 1.5,
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
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

// function RemindersTab() {
//   return (
//     <Box sx={{ p: 3 }}>
//       <EmptyState
//         icon={<AlarmIcon />}
//         title="No reminders"
//         subtitle="Reminders for this ticket will appear here"
//       />
//     </Box>
//   );
// }

function ApprovalsTab({ ticket }) {
  const approvals = ticket.approvals || [];

  if (approvals.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<ThumbUpAltIcon />}
          title="No approvals required"
          subtitle="Approval requests for this ticket will appear here"
        />
      </Box>
    );
  }

  const getStatusStyle = (status) => ({
    px: 1.5,
    py: 0.5,
    minWidth: 100,
    textAlign: "center",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor:
      status === "APPROVED"
        ? "#DCFCE7"
        : status === "REJECTED"
          ? "#FEE2E2"
          : "#FEF3C7",
    color:
      status === "APPROVED"
        ? "#166534"
        : status === "REJECTED"
          ? "#991B1B"
          : "#92400E",
  });

  return (
    <Box sx={{ p: 3 }}>
      {approvals.map((a, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{
            mb: 2,
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <Typography fontWeight={600}>
              Approval Workflow
            </Typography>
          </Box>

          {/* L1 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 2,
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  display: "block",
                }}
              >
                Level 1 Approver
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {a.l1ApproverName || "Not Assigned"}
              </Typography>
            </Box>

            <Box sx={getStatusStyle(a.l1Status)}>
              {a.l1Status || "PENDING"}
            </Box>
          </Box>

          {/* L2 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  display: "block",
                }}
              >
                Level 2 Approver
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {a.l2ApproverName || "Not Assigned"}
              </Typography>
            </Box>

            <Box sx={getStatusStyle(a.l2Status)}>
              {a.l2Status || "PENDING"}
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

/* ─── WorklogTab (updated — date-grouped timeline) ───────────
 *
 * FLOW:
 *   1. Guard  → show EmptyState when history is empty
 *   2. Sort   → newest events first (by changedAt)
 *   3. Group  → Map<dateKey, event[]>  so each calendar day
 *               gets its own section with an orange dot header
 *   4. Render → DateSection header + HistoryRow per event
 *
 * DB fields used:
 *   history_id   → React key (stable)
 *   changedBy   → avatar fallback / isSystem guard
 *   changedByName→ agent display name (optional JOIN from backend)
 *   changedAt   → sort, group, time display
 *   remarks      → content text inside card
 *   status       → WorklogStatusBadge
 * ─────────────────────────────────────────────────────────── */
function WorklogTab({ history }) {

  useEffect(() => { console.log(history); })
  if (!history || history.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<WorkIcon />}
          title="No history available"
          subtitle="Ticket activity will appear here"
        />
      </Box>
    );
  }

  // Oldest first (top → bottom)
  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      ),
    [history]
  );

  const groups = useMemo(() => {
    const map = new Map();

    sorted.forEach((evt) => {
      const key = toDateKey(evt.createdAt);

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(evt);
    });

    return Array.from(map.entries());
  }, [sorted]);

  return (
    <Box sx={{ p: 3 }}>
      {groups.map(([dateKey, events]) => (
        <Box key={dateKey} sx={{ mb: 4 }}>
          {/* Date Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#F97316",
              }}
            />

            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {formatDayHeader(events[0].createdAt)}
            </Typography>
          </Stack>

          {/* Timeline Events */}
          {events.map((event, index) => (
            <HistoryRow
              key={
                event.history_id ||
                `${event.createdAt}-${index}`
              }
              event={event}
              isLast={
                index === events.length - 1
              }
            />
          ))}
        </Box>
      ))}
    </Box>
  );
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
  { label: 'Details', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Conversations', icon: <ChatBubbleOutlineIcon fontSize="small" /> },
  { label: 'Resolution', icon: <CheckCircleIcon fontSize="small" /> },
  { label: 'Approvals', icon: <ThumbUpAltIcon fontSize="small" /> },
  { label: 'Worklog', icon: <WorkIcon fontSize="small" /> },
];

import ResolutionAckSection from './ResolutionAckSection'

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  let { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');


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

  /* ── Load all data ── */
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

    if (tab === 0) commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tab, comments]);

  /* ── Actions ── */
  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!allowUserReply) {
      toast.error("Support has disabled replies for this ticket");
      return;
    }
    if (!trimmed) { toast.error('Comment cannot be empty'); return; }
    setSubmittingComment(true);
    try {
      console.log(trimmed, user.userId, user.name, user.role);
      //let res = await addComment(id, { body: trimmed, authorId: user.userId, authorName: user.fullName, authorRole: user.roles?.[0] });
      // Find the channel of the latest approver message so reply goes to the right thread
      const lastApproverMsg = [...comments].reverse().find(c => c.channel && c.channel !== null);
      const replyChannel = lastApproverMsg?.channel ?? null;

      let res = await addComment(id, {
        body: trimmed,
        authorId: user.userId,
        authorName: user.fullName,
        authorRole: 'END_USER',
        channel: replyChannel   // null → support chat, 'L1_USER'/'L2_USER'/'RESOURCE_USER' → approver thread
      });

      setCommentText('');
      toast.success('Comment added');
      const { data } = await getTicketComments(id);
      setComments(data);

    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (newStatus, label) => {
    setActionLoading(newStatus);
    try {
      await updateTicketStatus(id, { status: newStatus, changedBy: 'Support Agent' });
      toast.success(`Ticket ${label}`);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${label.toLowerCase()}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleReopen = async (reason) => {
    setReopenLoading(true);
    try {
      await reopenTicket(id, {
        reason: reason,

        // ✅ MUST MATCH BACKEND DTO  // ✅ user name
        requestedById: user.userId,   // ✅ user_id
      });

      toast.success('Ticket reopened successfully');

      setReopenModal(false);
      await loadAll();

      setTab(5);

    } catch (err) {
      console.log(err);

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

  /* ── Loading skeleton ── */
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

      {/* ── Top Bar ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            onClick={() => navigate('/user/tickets')}
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
            Tickets /
          </Typography>
          <Typography sx={{ color: '#27235C', fontSize: '0.85rem', fontWeight: 600 }}>
            {ticket.ticketNumber}
          </Typography>
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
              ['Assignee', ticket.assigneeName || 'Unassigned'],
              ['Created At', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ''],
              ['Updated At', ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ''],
              ['Description', `"${(ticket.description || '').replace(/"/g, '""')}"`],
              ['Resolution Notes', `"${(ticket.resolutionNotes || '').replace(/"/g, '""')}"`],
            ];
            const csv = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `ticket-${ticket.ticketNumber || ticket.id}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
          sx={{ borderColor: '#27235C', color: '#27235C', borderRadius: '9px', fontWeight: 600, fontSize: '0.82rem', '&:hover': { backgroundColor: '#EEF0FF' } }}
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
            {/* <ActionButton label="Edit" icon={<EditIcon />} />
            <ActionButton label="Reply" icon={<ReplyIcon />} onClick={() => setTab(0)} />
            <ActionButton label="Add Note" icon={<StickyNote2Icon />} onClick={() => setTab(0)} />
            <ActionButton label="Forward" icon={<ForwardToInboxIcon />} /> */}

            {/* Status-conditional actions */}
            {availableActions.includes('reopen') && (
              <ActionButton
                label="Reopen"
                icon={<ReplayIcon />}
                color="#97247E"
                variant="contained"
                onClick={() => setReopenModal(true)}
              />
            )}
            {ticket?.status === 'OPEN' && (
              <ActionButton
                label="Cancel Ticket"
                icon={<CancelOutlinedIcon />}
                color="#DC2626"
                variant="outlined"
                onClick={() => setCancelModal(true)}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Resolution Acknowledgement Banner ── */}

      {/* Shown ONLY when support has resolved and is waiting for user to acknowledge */}

      {ticket?.status === 'PENDING_USER_ACK' && (
        <ResolutionAckSection

          ticketId={Number(id)}

          userId={user?.userId}

          resolutionNotes={ticket?.resolutionNotes}

          onAcknowledged={loadAll}

        />

      )}

      {/* ── Main Layout ── */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start">



        {/* ── Main Layout ── */}
        {/* <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start"> */}

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
                minHeight: 46, py: 0, px: 2, color: '#6B7280',
                '&.Mui-selected': { color: '#27235C' },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#27235C', height: 2.5, borderRadius: '2px 2px 0 0',
              },
            }}
          >
            {TABS.map((t, i) => (
              <Tab
                key={i}
                icon={t.icon}
                iconPosition="start"
                label={i === 1 ? `${t.label} (${comments.length})` : t.label}
              />
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
              user={user}// ✅ NEW
            />
          )}
          {tab === 2 && <ResolutionTab ticket={ticket} />}
          {tab === 3 && <ApprovalsTab ticket={ticket} />}
          {tab === 4 && <WorklogTab history={history} />}
        </Paper>

        {/* ── Right Sidebar ── */}
        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>

          {/* Ticket Metadata */}
          <Paper sx={{
            p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          }}>
            <Typography sx={{
              fontWeight: 700, fontSize: '0.75rem', color: '#374151',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5,
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
              label="Category"
              value={ticket.category}
            />
            {ticket.subCategory && (
              <SidebarMetaRow
                icon={<GroupIcon sx={{ fontSize: 15 }} />}
                label="Sub-Category"
                value={ticket.subCategory}
              />
            )}
            {ticket.department && (
              <SidebarMetaRow
                icon={<WorkIcon sx={{ fontSize: 15 }} />}
                label="Department"
                value={ticket.department}
              />
            )}
            {ticket.impact && (
              <SidebarMetaRow
                icon={<WarningAmberIcon sx={{ fontSize: 15 }} />}
                label="Impact"
                value={ticket.impact}
              />
            )}
            {ticket.urgency && (
              <SidebarMetaRow
                icon={<FlagIcon sx={{ fontSize: 15 }} />}
                label="Urgency"
                value={ticket.urgency}
              />
            )}
            <SidebarMetaRow
              icon={<AccessTimeIcon sx={{ fontSize: 15 }} />}
              label="Due By (SLA)"
              value={
                ticket.slaDeadline
                  ? ticket.slaBreached
                    ? `Overdue — ${fmtShortDate(ticket.slaDeadline)}`
                    : fmtShortDate(ticket.slaDeadline)
                  : 'Not configured'
              }
              valueColor={ticket.slaBreached ? '#E01950' : undefined}
            />
            {ticket.resolvedAt && (
              <SidebarMetaRow
                icon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                label="Resolved At"
                value={fmtShortDate(ticket.resolvedAt)}
                valueColor="#24A148"
              />
            )}
            {ticket.closedAt && (
              <SidebarMetaRow
                icon={<TaskAltIcon sx={{ fontSize: 15 }} />}
                label="Closed At"
                value={fmtShortDate(ticket.closedAt)}
              />
            )}
          </Paper>

          {/* Attachments */}
          <Paper sx={{
            p: 2.5, borderRadius: '14px',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{
                fontWeight: 700, fontSize: '0.75rem', color: '#374151',
                textTransform: 'uppercase', letterSpacing: '0.08em',
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
                <Stack
                  key={i}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    py: 0.8, px: 1, borderRadius: '8px',
                    '&:hover': { backgroundColor: '#F9FAFB' },
                  }}
                >
                  <AttachFileIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{
                    fontSize: '0.78rem', color: '#3B82F6',
                    textDecoration: 'none', cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
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
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5,
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

      {/* ── Cancel Ticket Modal ── */}
      <Dialog open={cancelModal} onClose={() => { setCancelModal(false); setCancelReason(''); setCancelTouched(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CancelOutlinedIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Cancel Ticket</Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.82rem', color: '#6B7280' }}>Please provide a reason for cancelling this ticket</Typography>
            </Box>
            <IconButton onClick={() => { setCancelModal(false); setCancelReason(''); setCancelTouched(false); }} size="small" sx={{ color: '#9CA3AF' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ p: 2, backgroundColor: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA', mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#991B1B' }}>
              Cancelling this ticket will permanently close it. This action cannot be undone.
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Cancellation Reason"
            placeholder="Describe why you are cancelling this ticket (minimum 10 characters)..."
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            error={cancelTouched && (!cancelReason.trim() || cancelReason.trim().length < 10)}
            helperText={cancelTouched && (!cancelReason.trim() ? 'A reason is required to cancel this ticket.' : cancelReason.trim().length < 10 ? `At least 10 characters required (${cancelReason.trim().length}/10)` : '')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.875rem' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #F3F4F6', gap: 1 }}>
          <Button onClick={() => { setCancelModal(false); setCancelReason(''); setCancelTouched(false); }} variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' } }}>
            Keep Ticket
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            disabled={cancelLoading}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, backgroundColor: '#DC2626', '&:hover': { backgroundColor: '#B91C1C' }, '&:disabled': { backgroundColor: '#FCA5A5' } }}
          >
            {cancelLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Cancel Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
