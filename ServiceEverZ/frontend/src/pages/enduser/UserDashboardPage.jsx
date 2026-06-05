import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  IconButton, Skeleton, Divider, Button, List,
  ListItem, ListItemText, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, useTheme, useMediaQuery,
} from '@mui/material';
import {
  HeadsetMic, Computer, ReportProblem, CheckCircle,
  HourglassEmpty, Schedule, Campaign, PlayCircle,
  Person, Close, ConfirmationNumber, ArrowForwardIos,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAxios } from '../../api/axiosInstance';
import { ticketApi } from '../../api/ourApi';
import ProfilePanel from '../../components/users/ProfilePanel';
 
const MotionCard = motion(Card);
const MotionBox  = motion(Box);
 
// ─── Status chip ─────────────────────────────────────────────────────────────
const statusMeta = {
  OPEN:        { label: 'Open',        color: '#27235C', bg: '#27235C18' },
  SUBMITTED:   { label: 'Submitted',   color: '#27235C', bg: '#27235C18' },
  IN_PROGRESS: { label: 'In Progress', color: '#97247E', bg: '#97247E18' },
  ON_HOLD:     { label: 'On Hold',     color: '#f59e0b', bg: '#f59e0b18' },
  RESOLVED:    { label: 'Resolved',    color: '#22c55e', bg: '#22c55e18' },
  CLOSED:      { label: 'Closed',      color: '#22c55e', bg: '#22c55e18' },
  CANCELLED:   { label: 'Cancelled',   color: '#ef4444', bg: '#ef444418' },
  DRAFT:       { label: 'Draft',       color: '#6B7280', bg: '#6B728018' },
};
 
const StatusChip = ({ status }) => {
  const meta = statusMeta[status] || { label: status, color: '#6B7280', bg: '#6B728018' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 1.2, py: 0.3, borderRadius: 10,
      bgcolor: meta.bg, border: `1px solid ${meta.color}30`,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.color, mr: 0.7, flexShrink: 0 }} />
      <Typography variant="caption" fontWeight={600} sx={{ color: meta.color, lineHeight: 1 }}>
        {meta.label}
      </Typography>
    </Box>
  );
};
 
// ─── Priority chip ────────────────────────────────────────────────────────────
const priorityColor = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e', CRITICAL: '#7c3aed' };
const PriorityChip = ({ priority }) => {
  const color = priorityColor[priority] || '#6B7280';
  return (
    <Typography variant="caption" fontWeight={700} sx={{ color }}>
      {priority || '—'}
    </Typography>
  );
};
 
// ─── Ticket Modal ─────────────────────────────────────────────────────────────
const TicketModal = ({ open, onClose, tickets, title, color, loading, onViewTicket }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
 
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          overflow: 'hidden',
          maxHeight: isMobile ? '100%' : '80vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        p: 0,
        background: 'linear-gradient(135deg, #27235C 0%, #97247E 60%, #E01950 100%)',
      }}>
        <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ConfirmationNumber sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#fff">{title}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                {loading ? '...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
 
      {/* Body */}
      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)}
          </Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#6B7280' }}>
            <ConfirmationNumber sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
            <Typography variant="body2">No tickets in this category</Typography>
          </Box>
        ) : isMobile ? (
          /* ── Mobile: card list ── */
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Box
                  onClick={() => onViewTicket && onViewTicket(ticket.id)}
                  sx={{
                    p: 1.5, borderRadius: 2, border: '1px solid #F0F0F8',
                    bgcolor: '#fff', cursor: onViewTicket ? 'pointer' : 'default',
                    transition: 'all 0.18s',
                    '&:hover': onViewTicket
                      ? { bgcolor: '#F4F5F9', borderColor: color, transform: 'translateX(3px)' }
                      : {},
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} color={color}>
                      #{ticket.id}
                    </Typography>
                    <StatusChip status={ticket.status} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="#1B193F" noWrap>
                    {ticket.title || ticket.subject || 'Untitled'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="#6B7280">
                      {ticket.category || ticket.type || '—'}
                    </Typography>
                    <PriorityChip priority={ticket.priority} />
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        ) : (
          /* ── Desktop: table ── */
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F4F5F9' }}>
                  {['ID', 'Title', 'Category', 'Priority', 'Status', 'Created'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#1B193F', fontSize: 12, py: 1.2 }}>
                      {h}
                    </TableCell>
                  ))}
                  {onViewTicket && (
                    <TableCell sx={{ fontWeight: 700, color: '#1B193F', fontSize: 12, py: 1.2 }} />
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket, i) => (
                  <motion.tr
                    key={ticket.id || i}
                    component="tr"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ cursor: onViewTicket ? 'pointer' : 'default' }}
                    onClick={() => onViewTicket && onViewTicket(ticket.id)}
                  >
                    <TableCell sx={{ color, fontWeight: 700, fontSize: 12 }}>#{ticket.id}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="body2" fontWeight={500} color="#1B193F" noWrap>
                        {ticket.title || ticket.subject || 'Untitled'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="#6B7280">
                        {ticket.category || ticket.type || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell><PriorityChip priority={ticket.priority} /></TableCell>
                    <TableCell><StatusChip status={ticket.status} /></TableCell>
                    <TableCell>
                      <Typography variant="caption" color="#6B7280">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    {onViewTicket && (
                      <TableCell>
                        <IconButton size="small" sx={{ color }}>
                          <ArrowForwardIos sx={{ fontSize: 12 }} />
                        </IconButton>
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
 
      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F0F0F8' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ borderColor: '#27235C', color: '#27235C', borderRadius: 2 }}
        >
          Close
        </Button>
 
      </DialogActions>
    </Dialog>
  );
};
 
// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, delay = 0, loading, onClick, active }) => (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={!loading ? onClick : undefined}
    whileHover={!loading ? { y: -3, scale: 1.02 } : {}}
    whileTap={!loading ? { scale: 0.97 } : {}}
    sx={{
      borderRadius: 2,
      boxShadow: active
        ? `0 4px 20px ${color}35`
        : '0 2px 10px rgba(39,35,92,0.08)',
      border: active ? `2px solid ${color}` : '1px solid #F0F0F8',
      textAlign: 'center',
      height: '100%',
      cursor: loading ? 'default' : 'pointer',
      transition: 'all 0.22s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': !loading ? {
        boxShadow: `0 6px 24px ${color}30`,
        borderColor: color,
      } : {},
    }}
  >
    {/* top colour stripe */}
    <Box sx={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${color}, ${color}88)`,
      opacity: active ? 1 : 0,
      transition: 'opacity 0.2s',
    }} />
 
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{
        width: 42, height: 42, borderRadius: '50%',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 1,
      }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
      </Box>
 
      {loading
        ? <Skeleton width={40} height={32} sx={{ mx: 'auto' }} />
        : (
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h5" fontWeight={700} color="#1B193F">{value}</Typography>
          </motion.div>
        )}
 
      <Typography variant="caption" color="#6B7280" mt={0.3} display="block">{label}</Typography>
 
      {!loading && (
        <Typography variant="caption" sx={{
          color, fontSize: 10, mt: 0.3, display: 'block', opacity: 0.7, letterSpacing: 0.3,
        }}>
          Click to view →
        </Typography>
      )}
    </CardContent>
  </MotionCard>
);
 
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('sm'));
 
  const [profile, setProfile]                   = useState(null);
  const [profileLoading, setProfileLoading]     = useState(true);
  const [ticketLoading, setTicketLoading]       = useState(true);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [activeTab, setActiveTab]               = useState('details');
  const [allTickets, setAllTickets]             = useState([]);
  const [ticketCounts, setTicketCounts]         = useState({ open: 0, inProgress: 0, closed: 0 });
  const [modal, setModal]                       = useState({ open: false, type: null });
 
  useEffect(() => {
    fetchProfile();
    if (user?.userId) fetchTicketCounts(user.userId);
  }, [user?.userId]);
 
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await userAxios.get('/api/v1/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Profile API error:', err?.response?.status);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };
 
  const fetchTicketCounts = async (userId) => {
    try {
      setTicketLoading(true);
      const tickets = await ticketApi.getByUser(userId);
      const arr = Array.isArray(tickets) ? tickets : [];
      setAllTickets(arr);
      const open       = arr.filter(t => t.status === 'OPEN' || t.status === 'SUBMITTED').length;
      const inProgress = arr.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ON_HOLD').length;
      const closed     = arr.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED' || t.status === 'CANCELLED').length;
      setTicketCounts({ open, inProgress, closed });
    } catch (err) {
      console.error('Ticket count error:', err);
    } finally {
      setTicketLoading(false);
    }
  };
 
  const ticketGroups = {
    open:       allTickets.filter(t => t.status === 'OPEN' || t.status === 'SUBMITTED'),
    inProgress: allTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ON_HOLD'),
    closed:     allTickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED' || t.status === 'CANCELLED'),
  };
 
  const modalConfig = {
    open:       { title: 'Open Tickets',        color: '#27235C' },
    inProgress: { title: 'In Progress Tickets',  color: '#97247E' },
    closed:     { title: 'Closed Tickets',       color: '#22c55e' },
  };
 
  const openPanel = (tab = 'details') => {
    setActiveTab(tab);
    setProfilePanelOpen(true);
  };
 
  const handleViewTicket = (ticketId) => {
    if (ticketId === 'all') {
      navigate('/user/my-tickets');
    } else {
      navigate(`/user/tickets/${ticketId}`);
    }
  };
 
  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : '';
 
  const stats = [
    {
      icon: <Schedule />, label: 'Open', value: ticketCounts.open,
      color: '#27235C', delay: 0, loading: ticketLoading,
      onClick: () => setModal({ open: true, type: 'open' }),
      active: modal.open && modal.type === 'open',
    },
    {
      icon: <HourglassEmpty />, label: 'In Progress', value: ticketCounts.inProgress,
      color: '#97247E', delay: 0.1, loading: ticketLoading,
      onClick: () => setModal({ open: true, type: 'inProgress' }),
      active: modal.open && modal.type === 'inProgress',
    },
    {
      icon: <CheckCircle />, label: 'Closed', value: ticketCounts.closed,
      color: '#22c55e', delay: 0.2, loading: ticketLoading,
      onClick: () => setModal({ open: true, type: 'closed' }),
      active: modal.open && modal.type === 'closed',
    },
  ];
 
  const assets = profile?.assets || [
    {
      name:  profile?.employeeId ? `${profile.employeeId}.company.com` : 'No Asset Assigned',
      model: profile?.department?.replace(/_/g, ' ') || '—',
    },
  ];
 
  const announcements   = profile?.announcements || [];
  const currentModal    = modal.type ? modalConfig[modal.type] : null;
  const currentTickets  = modal.type ? ticketGroups[modal.type] : [];
 
  return (
    <Box sx={{
      p: { xs: 1, sm: 1.5, md: 2 },
      bgcolor: '#F4F5F9',
      height: { xs: 'auto', md: 'calc(100vh - 64px)' },
      minHeight: { xs: '100vh', md: 'auto' },
      overflow: { xs: 'auto', md: 'hidden' },
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1, sm: 1.5 },
      boxSizing: 'border-box',
    }}>
 
      {/* ── Hero banner ── */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #27235C 0%, #97247E 60%, #E01950 100%)',
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1.2, sm: 1.5 },
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(39,35,92,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ position: 'absolute', left: -40, top: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', right: -30, bottom: -60, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
 
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 2 }, zIndex: 1, minWidth: 0 }}>
          <Box sx={{
            width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <HeadsetMic sx={{ fontSize: { xs: 22, sm: 26 }, color: '#fff' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1" fontWeight={700} color="#fff" lineHeight={1.3}
              sx={{ fontSize: { xs: 13, sm: 16 }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {profileLoading
                ? <Skeleton width={160} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                : `Welcome, ${fullName || 'User'}!`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: { xs: 10, sm: 12 } }}>
              How can we help you today?
            </Typography>
          </Box>
        </Box>
 
        <Button
          variant="contained"
          startIcon={!isMobile && <PlayCircle sx={{ fontSize: 16 }} />}
          size="small"
          sx={{
            bgcolor: '#fff', color: '#27235C', fontWeight: 700,
            borderRadius: 2, px: { xs: 1.2, sm: 2 }, py: 0.7,
            fontSize: { xs: 10, sm: 12 },
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            zIndex: 1, flexShrink: 0, ml: 1,
            '&:hover': { bgcolor: '#f0f0f8' },
          }}
        >
          {isMobile ? <PlayCircle sx={{ fontSize: 16 }} /> : 'Training Video'}
        </Button>
      </MotionBox>
 
      {/* ── Ticket Stats ── */}
      <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ flexShrink: 0 }}>
        {stats.map((s, i) => (
          <Grid item xs={4} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>
 
      {/* ── Assets + Announcements ── */}
      <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{
        flex: { xs: 'unset', md: 1 },
        minHeight: 0,
        overflow: 'hidden',
      }}>
 
        {/* ── Left: My Assets + Quick Actions ── */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <MotionCard
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(39,35,92,0.08)',
              border: '1px solid #F0F0F8',
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 }, flex: 1 }}>
 
              {/* My Assets heading */}
              <Typography variant="body2" fontWeight={700} color="#1B193F" mb={1.5}>
                My Assets
              </Typography>
 
              {profileLoading
                ? [...Array(2)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
                : assets.length > 0
                  ? assets.map((asset, i) => (
                    <Box key={i} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: { xs: 1, sm: 1.5 }, borderRadius: 2, border: '1px solid #F0F0F8', mb: 1,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1,
                      '&:hover': { bgcolor: '#F4F5F9' }, transition: 'background 0.2s',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 1.5, bgcolor: '#27235C18',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Computer sx={{ color: '#27235C', fontSize: 18 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} color="#1B193F" noWrap>
                            {asset.name}
                          </Typography>
                          <Typography variant="caption" color="#6B7280">{asset.model}</Typography>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<ReportProblem sx={{ fontSize: 13 }} />}
                        sx={{
                          borderRadius: 2, border: '1px solid #27235C', color: '#27235C',
                          fontWeight: 600, fontSize: 11, px: 1.2, whiteSpace: 'nowrap', flexShrink: 0,
                          '&:hover': { bgcolor: '#27235C', color: '#fff' }, transition: 'all 0.2s',
                        }}
                      >
                        Report Issue
                      </Button>
                    </Box>
                  ))
                  : (
                    <Box sx={{ textAlign: 'center', py: 2, color: '#6B7280' }}>
                      <Computer sx={{ fontSize: 34, opacity: 0.3, mb: 0.5 }} />
                      <Typography variant="caption">No assets assigned</Typography>
                    </Box>
                  )}
 
              {/* Quick Actions */}
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" fontWeight={700} color="#1B193F" mb={1}>
                Quick Actions
              </Typography>
 
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  {
                    label: 'View My Profile',
                    sub: 'View and edit your info',
                    icon: <Person />,
                    color: '#27235C',
                    action: () => openPanel('details'),
                  },
                ].map((item, i) => (
                  <Box
                    key={i}
                    onClick={item.action}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: 2, cursor: 'pointer',
                      border: '1px solid #F0F0F8',
                      flex: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#F4F5F9',
                        borderColor: item.color,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${item.color}22`,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 34, height: 34, borderRadius: 1.5,
                      bgcolor: `${item.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 18 } })}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#1B193F" lineHeight={1.3}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="#6B7280">
                        {item.sub}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
 
            </CardContent>
          </MotionCard>
        </Grid>
 
        {/* ── Right: Announcements ── */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(39,35,92,0.08)',
              border: '1px solid #F0F0F8',
              flex: 1,
              overflow: 'auto',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Campaign sx={{ color: '#97247E', fontSize: 18 }} />
                <Typography variant="body2" fontWeight={700} color="#1B193F">Announcements</Typography>
              </Box>
 
              {profileLoading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} height={34} sx={{ mb: 0.5 }} />)
                : announcements.length > 0
                  ? (
                    <List dense disablePadding>
                      {announcements.map((ann, i) => (
                        <React.Fragment key={i}>
                          <ListItem disableGutters sx={{ py: 0.7 }}>
                            <ListItemIcon sx={{ minWidth: 26 }}>
                              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#97247E', mt: 0.3 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={ann.title}
                              secondary={ann.date}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: '#1B193F' }}
                              secondaryTypographyProps={{ variant: 'caption', color: '#6B7280' }}
                            />
                          </ListItem>
                          {i < announcements.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 5, color: '#6B7280' }}>
                      <Campaign sx={{ fontSize: 38, opacity: 0.2, mb: 0.5 }} />
                      <Typography variant="caption" color="#9CA3AF">No announcements</Typography>
                    </Box>
                  )}
            </CardContent>
          </MotionCard>
        </Grid>
 
      </Grid>
 
      {/* ── Profile Panel ── */}
      <ProfilePanel
        open={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        profile={profile}
        loading={profileLoading}
        defaultTab={activeTab}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
 
      {/* ── Ticket Detail Modal ── */}
      {currentModal && (
        <TicketModal
          open={modal.open}
          onClose={() => setModal({ open: false, type: null })}
          tickets={currentTickets}
          title={currentModal.title}
          color={currentModal.color}
          loading={ticketLoading}
          onViewTicket={handleViewTicket}
        />
      )}
 
    </Box>
  );
}

