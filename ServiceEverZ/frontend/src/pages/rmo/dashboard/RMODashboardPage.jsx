// src/pages/rmo/dashboard/RMODashboardPage.jsx
import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar,
  LinearProgress, Skeleton, Alert, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, IconButton, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, Tooltip,
  Stack, TextField, InputAdornment,
} from '@mui/material';
import {
  FolderSpecial as ProjectIcon,
  Groups as ResourceIcon,
  PersonOff as BenchIcon,
  TrendingUp, TrendingDown, TrendingFlat,
  Person,
  Refresh, Close, Search,
  ExpandCircleDown,
  Timeline as TimelineIcon,
  EmojiEvents,
  Group,
  WorkOutline,
  BadgeOutlined,
  EmailOutlined,
  BusinessOutlined,
  CalendarTodayOutlined,
  PeopleAltOutlined,
  FolderOpenOutlined,
  LocationOnOutlined,
  CodeOutlined,
  PersonOutline,
  Handshake,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, AreaChart, Area,
} from 'recharts';
 
import PageHeader  from '../../../components/common/PageHeader';
import { rmoApi } from '../../../api/rmoApi';
import { formatDate, formatRelativeTime } from '../../../utils/formatters';
import { useAuth } from '../../../context/AuthContext';
 
/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const C = {
  navy:   '#27235C',
  purple: '#97247E',
  accent: '#AC5098',
  red:    '#E01950',
  green:  '#24A148',
  yellow: '#E2B93B',
  blue:   '#1976d2',
  gray:   '#6B7280',
  teal:   '#0891b2',
};
 
const STATUS_CFG = {
  ACTIVE:    { bg: '#ECFDF5', color: '#24A148', border: '#24A14830', label: 'Active',    dot: '#24A148' },
  INACTIVE:  { bg: '#F4F5F9', color: '#6B7280', border: '#6B728030', label: 'Inactive',  dot: '#6B7280' },
  COMPLETED: { bg: '#EFF6FF', color: '#1976d2', border: '#1976d230', label: 'Completed', dot: '#1976d2' },
  ON_HOLD:   { bg: '#FFFBEB', color: '#E2B93B', border: '#E2B93B30', label: 'On Hold',   dot: '#E2B93B' },
};
 
const USER_STATUS_CFG = {
  ACTIVE:            { bg: '#ECFDF5', color: '#24A148', label: 'Active' },
  INACTIVE:          { bg: '#F4F5F9', color: '#6B7280', label: 'Inactive' },
  DISABLED:          { bg: '#FFF1F3', color: '#E01950', label: 'Disabled' },
  PENDINGACTIVATION: { bg: '#FFFBEB', color: '#E2B93B', label: 'Pending' },
};
 
const AVATAR_GRADIENTS = [
  ['#27235C','#97247E'], ['#97247E','#AC5098'],
  ['#1976d2','#0891b2'], ['#24A148','#0891b2'],
  ['#E2B93B','#E01950'], ['#AC5098','#1976d2'],
];
 
const avatarGradient = (id) =>
  AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];
 
/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const StatusDot = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.INACTIVE;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.dot,
        boxShadow: `0 0 0 2.5px ${cfg.dot}28` }} />
      <Typography sx={{ fontSize: '0.73rem', fontWeight: 700, color: cfg.color }}>
        {cfg.label}
      </Typography>
    </Box>
  );
};
 
const UserStatusChip = ({ status }) => {
  const cfg = USER_STATUS_CFG[status] || USER_STATUS_CFG.INACTIVE;
  return (
    <Chip label={cfg.label} size="small" sx={{
      bgcolor: cfg.bg, color: cfg.color,
      fontWeight: 700, fontSize: '0.62rem', height: 18,
      '& .MuiChip-label': { px: 0.75 },
    }} />
  );
};
 
const getInitials = (u) =>
  `${(u?.firstName || '')[0] || ''}${(u?.lastName || '')[0] || ''}`.toUpperCase() || '?';
 
/* ─── Animated counter ─────────────────────────── */
const AnimatedNumber = ({ to, duration = 1.2 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{display}</>;
};
 
/* ─── Live pulse ───────────────────────────────── */
const LivePulse = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <motion.div
      animate={{ scale: [1, 1.45, 1], opacity: [1, 0.45, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: C.green }} />
    </motion.div>
    <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: C.green }}>Live</Typography>
  </Box>
);
 
/* ═══════════════════════════════════════════════
   MINI DONUT — for resource cards
═══════════════════════════════════════════════ */
const MiniDonut = ({ used, total, color }) => {
  const pct   = total > 0 ? Math.round((used / total) * 100) : 0;
  const data  = [
    { value: used,         fill: color },
    { value: total - used, fill: `${color}20` },
  ];
  return (
    <Box sx={{ position: 'relative', width: 64, height: 64 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={22} outerRadius={30}
            startAngle={90} endAngle={-270}
            paddingAngle={2} dataKey="value"
          >
            {data.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color }}>
          {pct}%
        </Typography>
      </Box>
    </Box>
  );
};
 
/* ─── Mini sparkline (fake trend using user/project counts) ── */
const MiniSparkline = ({ data, color }) => (
  <Box sx={{ width: 80, height: 36 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey="v"
          stroke={color} strokeWidth={2}
          fill={`url(#spark-${color.replace('#','')})`}
          dot={false} isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
);
 
/* ═══════════════════════════════════════════════
   KPI CARD  — redesigned with mini chart
═══════════════════════════════════════════════ */
const KPICard = ({
  title, value, icon: Icon, color, bg,
  subtitle, trend, trendVal, loading, delay = 0,
  onClick, miniChart, miniDonut, donutUsed, donutTotal,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -5, transition: { duration: 0.18 } }}
    style={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <Card sx={{
      height: '100%', overflow: 'hidden', position: 'relative',
      border: `1.5px solid ${color}22`,
      transition: 'box-shadow 0.22s',
      '&:hover': onClick ? { boxShadow: `0 14px 44px ${color}28` } : {},
    }}>
      {/* Gradient top strip */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color} 0%, ${color}66 100%)`,
      }} />
      <CardContent sx={{ p: 2.5, pt: 3 }}>
        {/* Top row: title + icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography sx={{
            fontSize: '0.67rem', fontWeight: 700, color: '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: '0.09em',
          }}>
            {title}
          </Typography>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2,
            background: `linear-gradient(135deg, ${bg}, ${color}22)`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon sx={{ color, fontSize: 20 }} />
          </Box>
        </Box>
 
        {/* Value row with mini chart / donut */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            {loading
              ? <Skeleton width={60} height={48} />
              : (
                <Typography sx={{ fontSize: '2.4rem', fontWeight: 900, color: '#1B193F', lineHeight: 1 }}>
                  <AnimatedNumber to={Number(value) || 0} />
                </Typography>
              )
            }
            {subtitle && !loading && (
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.5, lineHeight: 1.4 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
 
          {/* Mini donut OR sparkline */}
          {!loading && miniDonut && (
            <MiniDonut used={donutUsed} total={donutTotal} color={color} />
          )}
          {!loading && miniChart && !miniDonut && (
            <MiniSparkline data={miniChart} color={color} />
          )}
        </Box>
 
        {/* Trend */}
        {trendVal != null && !loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
            {trend > 0
              ? <TrendingUp sx={{ fontSize: 13, color: C.green }} />
              : trend < 0
              ? <TrendingDown sx={{ fontSize: 13, color: C.red }} />
              : <TrendingFlat sx={{ fontSize: 13, color: C.gray }} />}
            <Typography sx={{
              fontSize: '0.69rem', fontWeight: 700,
              color: trend > 0 ? C.green : trend < 0 ? C.red : C.gray,
            }}>
              {trendVal}
            </Typography>
          </Box>
        )}
 
        {/* Tap hint */}
        {onClick && !loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5,
            pt: 1.5, borderTop: `1px dashed ${color}30` }}>
            <Typography sx={{ fontSize: '0.68rem', color, fontWeight: 700 }}>
              View details
            </Typography>
            <ExpandCircleDown sx={{ fontSize: 13, color }} />
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);
 
/* ═══════════════════════════════════════════════
   PROJECT DETAIL MODAL — read only, rich info
═══════════════════════════════════════════════ */
const ProjectDetailModal = ({ open, onClose, project, users, members, membersLoading }) => {
  if (!project) return null;
 
  const getUserName = (id) => {
    if (!id) return '—';
    const u = users.find((u) => u.id === id || u.id === Number(id));
    return u ? `${u.firstName} ${u.lastName}` : `#${id}`;
  };
 
  const cfg = STATUS_CFG[project.status] || STATUS_CFG.INACTIVE;
 
  const infoRow = (icon, label, value) => (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.75, alignItems: 'flex-start' }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#F4F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {React.cloneElement(icon, { sx: { fontSize: 16, color: C.navy } })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1B193F' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );
 
  return (
    <Dialog
      open={open} onClose={onClose}
      maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh', overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.purple} 100%)`,
        px: 3, py: 3, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', right: 30, bottom: -20, width: 80, height: 80,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
 
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
              <Box sx={{ px: 1.25, py: 0.35, borderRadius: 1.5,
                bgcolor: `${cfg.color}22`, border: `1px solid ${cfg.color}44` }}>
                <StatusDot status={project.status} />
              </Box>
              {project.projectCode && (
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                  {project.projectCode}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', mb: 0.25 }}>
              {project.projectName}
            </Typography>
            {project.displayName && project.displayName !== project.projectName && (
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                {project.displayName}
              </Typography>
            )}
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', mt: 0.5 }}>
              {project.client}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small"
            sx={{ color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
 
        {/* Quick stats row */}
        <Box sx={{ display: 'flex', gap: 2.5, mt: 2.5, flexWrap: 'wrap' }}>
          {[
            { label: 'Members', value: membersLoading ? '…' : members.length },
            { label: 'Department', value: project.department },
            { label: 'Region', value: project.region },
            { label: 'Engagement', value: project.engagementModel },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ textAlign: 'center', minWidth: 72 }}>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.25 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                {value || '—'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
 
      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Grid container>
          {/* Left column — project details */}
          <Grid item xs={12} md={7} sx={{ borderRight: { md: '1px solid #F0F0F5' }, p: 3 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
              Project Details
            </Typography>
 
            <Grid container spacing={0}>
              <Grid item xs={12} sm={6}>
                {infoRow(<BusinessOutlined />, 'Business Unit', project.businessUnit)}
                {infoRow(<WorkOutline />,      'Practice',      project.practice)}
                {infoRow(<LocationOnOutlined />, 'Region',      project.region)}
                {infoRow(<CodeOutlined />,     'Category',      project.category)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {infoRow(<Handshake />,        'Engagement Model', project.engagementModel)}
                {infoRow(<FolderOpenOutlined />, 'Type',        project.type)}
                {infoRow(<BadgeOutlined />,    'Division',      project.division)}
                {infoRow(<CalendarTodayOutlined />, 'Created',  formatDate(project.createdAt))}
              </Grid>
            </Grid>
 
            {project.description && (
              <Box sx={{ mt: 0.5, p: 2, bgcolor: '#F8F8FC', borderRadius: 2, border: '1px solid #F0F0F5' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF',
                  textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                  Description
                </Typography>
                <Typography sx={{ fontSize: '0.825rem', color: '#374151', lineHeight: 1.65 }}>
                  {project.description}
                </Typography>
              </Box>
            )}
 
            {/* Managers */}
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.08em', mt: 2.5, mb: 1.5 }}>
              Management Team
            </Typography>
            <Grid container spacing={1.5}>
              {[
                { label: 'Resource Owner', id: project.resourceOwnerId, icon: PersonOutline },
                { label: 'L1 Manager',     id: project.l1ManagerId,     icon: PersonOutline },
                { label: 'L2 Manager',     id: project.l2ManagerId,     icon: PersonOutline },
              ].map(({ label, id, icon: Ic }) => {
                const u = users.find((u) => u.id === id || u.id === Number(id));
                return (
                  <Grid item xs={12} sm={4} key={label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: id ? '#F4F5F9' : '#FAFAFA',
                      border: `1px solid ${id ? C.navy + '22' : '#F0F0F5'}` }}>
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                        {label}
                      </Typography>
                      {u ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{
                            width: 26, height: 26, fontSize: '0.65rem', fontWeight: 800,
                            background: `linear-gradient(135deg, ${avatarGradient(u.id)[0]}, ${avatarGradient(u.id)[1]})`,
                          }}>
                            {getInitials(u)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#1B193F' }}>
                              {u.firstName} {u.lastName}
                            </Typography>
                            <Typography noWrap sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
                              {u.designation || u.department || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '0.78rem', color: id ? '#1B193F' : '#D1D5DB', fontWeight: 600 }}>
                          {id ? `#${id}` : 'Not assigned'}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
 
          {/* Right column — members */}
          <Grid item xs={12} md={5} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Assigned Employees
              </Typography>
              <Chip label={membersLoading ? '…' : `${members.length} total`}
                size="small" sx={{ bgcolor: '#EEF0FF', color: C.navy, fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
            </Box>
 
            {membersLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}><Skeleton width="60%" height={14} /><Skeleton width="40%" height={12} sx={{ mt: 0.5 }} /></Box>
                </Box>
              ))
            ) : members.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Group sx={{ fontSize: 36, color: '#E5E7EB', mb: 1 }} />
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                  No employees assigned yet
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 380, overflow: 'auto', pr: 0.5 }}>
                {members.map((m, i) => {
                  const u = users.find((u) => u.id === m.userId || u.id === Number(m.userId));
                  const grad = avatarGradient(m.userId || i);
                  const isPrimary = m.membershipType === 'PRIMARY';
                  return (
                    <motion.div
                      key={m.userId || i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        py: 1.25, borderBottom: '1px solid #F5F5F8',
                        '&:last-child': { borderBottom: 'none' },
                      }}>
                        <Avatar sx={{
                          width: 36, height: 36, fontSize: '0.72rem', fontWeight: 800,
                          background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                          flexShrink: 0,
                        }}>
                          {u ? getInitials(u) : (m.userId || '?').toString().slice(0, 2)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1B193F' }}>
                            {u ? `${u.firstName} ${u.lastName}` : `Employee #${m.userId}`}
                          </Typography>
                          <Typography noWrap sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                            {u?.designation || u?.department || '—'}
                          </Typography>
                        </Box>
                        <Chip
                          label={isPrimary ? 'Primary' : 'Secondary'}
                          size="small"
                          sx={{
                            bgcolor: isPrimary ? '#EEF0FF' : '#F4F5F9',
                            color:   isPrimary ? C.navy    : C.gray,
                            fontWeight: 700, fontSize: '0.6rem', height: 18,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
 
/* ═══════════════════════════════════════════════
   PROJECTS LIST MODAL  — click active card
   Read-only list of active projects → click row → ProjectDetailModal
═══════════════════════════════════════════════ */
const ActiveProjectsModal = ({ open, onClose, projects, users, loading }) => {
  const [search, setSearch]         = useState('');
  const [detailProject, setDetail]  = useState(null);
  const [members, setMembers]       = useState([]);
  const [membersLoading, setML]     = useState(false);
 
  const active = useMemo(() => {
    const list = projects.filter((p) => p.status === 'ACTIVE');
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((p) =>
      p.projectName?.toLowerCase().includes(q) ||
      p.client?.toLowerCase().includes(q) ||
      p.projectCode?.toLowerCase().includes(q)
    );
  }, [projects, search]);
 
  const openDetail = async (proj) => {
    setDetail(proj);
    setML(true);
    setMembers([]);
    try {
      const r = await rmoApi.getProjectMembers(proj.id);
      setMembers(r.data || []);
    } catch { setMembers([]); }
    finally { setML(false); }
  };
 
  return (
    <>
      <Dialog
        open={open} onClose={onClose}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '88vh' } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{
            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.purple} 100%)`,
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                Active Projects
              </Typography>
              <Typography sx={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)', mt: 0.2 }}>
                {active.length} active project{active.length !== 1 ? 's' : ''} — click any row to view full details
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small"
              sx={{ color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          {/* Search bar */}
          <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #F0F0F5', bgcolor: '#FAFAFC',
            display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              placeholder="Search by name, code, client…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              size="small" sx={{ width: 280 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>,
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}><Close sx={{ fontSize: 14 }} /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography sx={{ fontSize: '0.73rem', color: '#9CA3AF', ml: 'auto' }}>
              {active.length} result{active.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </DialogTitle>
 
        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Box key={i} sx={{ px: 3, py: 1.75, borderBottom: '1px solid #F5F5F8', display: 'flex', gap: 2 }}>
                <Skeleton width={80} height={14} />
                <Skeleton width={160} height={14} />
                <Skeleton width={100} height={14} sx={{ ml: 'auto' }} />
              </Box>
            ))
          ) : active.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <ProjectIcon sx={{ fontSize: 40, color: '#E5E7EB', mb: 1 }} />
              <Typography sx={{ color: '#9CA3AF' }}>No active projects found</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Code', 'Project', 'Client', 'Dept', 'Region', 'Engagement', 'Created'].map((h) => (
                      <TableCell key={h} sx={{
                        fontSize: '0.66rem', fontWeight: 800, color: C.navy,
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        bgcolor: '#F8F8FC', borderBottom: '2px solid #F0F0F5',
                        whiteSpace: 'nowrap',
                      }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {active.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      component={TableRow}
                      hover
                      onClick={() => openDetail(p)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#EEF0FF' },
                        transition: 'background 0.12s',
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {p.projectCode || '—'}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.845rem', color: '#1B193F' }}>
                            {p.projectName}
                          </Typography>
                          {p.displayName && p.displayName !== p.projectName && (
                            <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{p.displayName}</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#6B7280' }}>{p.client || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem' }}>{p.department || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#6B7280' }}>{p.region || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#6B7280' }}>{p.engagementModel || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.73rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {formatDate(p.createdAt)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
      </Dialog>
 
      {/* Drill-down: project detail */}
      <ProjectDetailModal
        open={!!detailProject}
        onClose={() => setDetail(null)}
        project={detailProject}
        users={users}
        members={members}
        membersLoading={membersLoading}
      />
    </>
  );
};
 
/* ═══════════════════════════════════════════════
   RESOURCES MODAL — rich employee info
═══════════════════════════════════════════════ */
const ResourcesModal = ({ open, onClose, users, title, subtitle, filter, loading, accentColor }) => {
  const [search, setSearch] = useState('');
 
  const displayed = useMemo(() => {
    let list = filter ? users.filter(filter) : users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.designation?.toLowerCase().includes(q) ||
        String(u.employeeId || '').includes(q)
      );
    }
    return list;
  }, [users, filter, search]);
 
  // Dept breakdown for mini chart
  const deptBreakdown = useMemo(() => {
    const map = {};
    displayed.forEach((u) => {
      const d = u.department || 'Other';
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name: name.slice(0, 8), count }));
  }, [displayed]);
 
  const col = accentColor || C.purple;
 
  return (
    <Dialog
      open={open} onClose={onClose}
      maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${col} 0%, ${C.accent} 100%)`,
        px: 3, py: 2.5, flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{title}</Typography>
            <Typography sx={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)', mt: 0.2 }}>{subtitle}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small"
            sx={{ color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
 
        {/* Department mini breakdown */}
        {deptBreakdown.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {deptBreakdown.map(({ name, count }) => (
              <Box key={name} sx={{
                px: 1, py: 0.3, borderRadius: 1.5,
                bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>
                  {name} · {count}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
 
      {/* Search + count bar */}
      <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #F0F0F5', bgcolor: '#FAFAFC',
        display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <TextField
          placeholder="Search by name, email, department, ID…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          size="small" sx={{ flex: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>,
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}><Close sx={{ fontSize: 14 }} /></IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography sx={{ fontSize: '0.73rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
          {displayed.length} employee{displayed.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
 
      {/* List */}
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, px: 3, py: 1.75, borderBottom: '1px solid #F5F5F8', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="55%" height={15} />
                <Skeleton width="70%" height={13} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton width={60} height={22} sx={{ borderRadius: 1 }} />
            </Box>
          ))
        ) : displayed.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Group sx={{ fontSize: 40, color: '#E5E7EB', mb: 1 }} />
            <Typography sx={{ color: '#9CA3AF' }}>No employees found</Typography>
          </Box>
        ) : (
          displayed.map((u, i) => {
            const grad = avatarGradient(u.id || i);
            return (
              <motion.div
                key={u.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  px: 3, py: 1.5, borderBottom: '1px solid #F5F5F8',
                  '&:hover': { bgcolor: '#F9F9FC' }, transition: 'background 0.12s',
                }}>
                  {/* Avatar */}
                  <Avatar sx={{
                    width: 40, height: 40, fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
                    background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                  }}>
                    {getInitials(u)}
                  </Avatar>
 
                  {/* Main info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.845rem', color: '#1B193F' }}>
                        {u.firstName} {u.lastName}
                      </Typography>
                      <UserStatusChip status={u.status} />
                    </Box>
 
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {/* Email */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <EmailOutlined sx={{ fontSize: 11, color: '#9CA3AF' }} />
                        <Typography noWrap sx={{ fontSize: '0.7rem', color: '#9CA3AF', maxWidth: 180 }}>{u.email || '—'}</Typography>
                      </Box>
                    </Box>
 
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.35, flexWrap: 'wrap' }}>
                      {/* Department */}
                      {u.department && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <BusinessOutlined sx={{ fontSize: 11, color: '#9CA3AF' }} />
                          <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>
                            {typeof u.department === 'object' ? u.department?.name || u.department?.departmentName || '—' : u.department}
                          </Typography>
                        </Box>
                      )}
                      {/* Designation */}
                      {u.designation && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <BadgeOutlined sx={{ fontSize: 11, color: '#9CA3AF' }} />
                          <Typography sx={{ fontSize: '0.7rem', color: '#6B7280' }}>
                            {typeof u.designation === 'object' ? u.designation?.name || u.designation?.designationName || '—' : u.designation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
 
                  {/* Right: employee ID */}
                  {u.employeeId && (
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#9CA3AF' }}>
                        #{u.employeeId}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </motion.div>
            );
          })
        )}
      </Box>
    </Dialog>
  );
};
 
/* ═══════════════════════════════════════════════
   TOP PROJECTS BAR CHART
═══════════════════════════════════════════════ */
const TopProjectsChart = ({ projects, memberCountMap, loading }) => {
  const data = useMemo(() =>
    [...projects]
      .filter((p) => p.status === 'ACTIVE')
      .sort((a, b) => (memberCountMap[b.id] || 0) - (memberCountMap[a.id] || 0))
      .slice(0, 7)
      .map((p, i) => ({
        name:    p.projectShortName || p.projectName?.slice(0, 10) || '—',
        members: memberCountMap[p.id] || 0,
        fill:    [C.navy, C.purple, C.accent, C.teal, C.blue, C.green, C.yellow][i] || C.navy,
      })),
    [projects, memberCountMap]
  );
 
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EmojiEvents sx={{ fontSize: 18, color: C.navy }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>
            Team size — active projects
          </Typography>
          {data.length > 0 && (
            <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', ml: 'auto' }}>
              Top {data.length}
            </Typography>
          )}
        </Box>
        {loading
          ? <Skeleton variant="rectangular" height={165} sx={{ borderRadius: 2 }} />
          : data.length === 0
          ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <ProjectIcon sx={{ fontSize: 36, color: '#E5E7EB', mb: 1 }} />
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>No active projects</Typography>
            </Box>
          )
          : (
            <Box sx={{ height: 175 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #F0F0F5', fontSize: '0.75rem' }}
                    formatter={(v) => [v, 'Members']}
                  />
                  <Bar dataKey="members" radius={[6, 6, 0, 0]} maxBarSize={38}>
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )
        }
      </CardContent>
    </Card>
  );
};
 
/* ═══════════════════════════════════════════════
   PROJECT STATUS DONUT — compact
═══════════════════════════════════════════════ */
const StatusDonutCard = ({ projects, loading }) => {
  const data = useMemo(() => {
    const map = {};
    projects.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({
      name: STATUS_CFG[status]?.label || status,
      value: count,
      color: STATUS_CFG[status]?.color || C.gray,
    }));
  }, [projects]);
 
  const CustomLabel = ({ cx, cy }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 18, fontWeight: 900, fill: C.navy }}>
      {projects.length}
    </text>
  );
 
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FolderOpenOutlined sx={{ fontSize: 17, color: C.navy }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>
            Project overview
          </Typography>
        </Box>
        {loading
          ? <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto' }} />
          : (
            <>
              <Box sx={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data} cx="50%" cy="50%"
                      innerRadius={44} outerRadius={65}
                      paddingAngle={3} dataKey="value"
                      labelLine={false} label={CustomLabel}
                    >
                      {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #F0F0F5', fontSize: '0.78rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
                {data.map((d) => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
                      <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>{d.name}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1B193F' }}>
                      {d.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )
        }
      </CardContent>
    </Card>
  );
};
 
/* ═══════════════════════════════════════════════
   TIMELINE — recent project activity
═══════════════════════════════════════════════ */
const TimelineCard = ({ projects, loading }) => {
  const events = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8)
      .map((p) => ({
        title:  p.projectName,
        code:   p.projectCode,
        time:   formatRelativeTime(p.createdAt),
        status: p.status,
        client: p.client,
        dept:   p.department,
      })),
    [projects]
  );
 
  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F0F0F5',
        display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon sx={{ fontSize: 17, color: C.navy }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>
          Recent project activity
        </Typography>
      </Box>
      <Box sx={{ p: 2, position: 'relative' }}>
        {/* Vertical line */}
        <Box sx={{ position: 'absolute', left: 28, top: 16, bottom: 16,
          width: 2, bgcolor: '#F0F0F5', borderRadius: 1 }} />
 
        {loading
          ? Array(5).fill(0).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={22} height={22} sx={{ flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))
          : events.length === 0
          ? <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem', textAlign: 'center', py: 3 }}>
              No projects yet
            </Typography>
          : events.map((ev, i) => {
              const cfg = STATUS_CFG[ev.status] || STATUS_CFG.INACTIVE;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Box sx={{
                    display: 'flex', gap: 1.75,
                    mb: i < events.length - 1 ? 2 : 0,
                    alignItems: 'flex-start', position: 'relative', zIndex: 1,
                  }}>
                    {/* Dot */}
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '50%',
                      bgcolor: cfg.bg, border: `2px solid ${cfg.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, mt: 0.1,
                    }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.color }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1B193F' }}>
                        {ev.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, mt: 0.2, alignItems: 'center', flexWrap: 'wrap' }}>
                        {ev.code && (
                          <Typography sx={{ fontSize: '0.63rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                            {ev.code}
                          </Typography>
                        )}
                        {ev.client && (
                          <Typography sx={{ fontSize: '0.68rem', color: '#6B7280' }}>· {ev.client}</Typography>
                        )}
                        {ev.dept && (
                          <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>· {ev.dept}</Typography>
                        )}
                        <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', ml: 'auto' }}>
                          {ev.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              );
            })
        }
      </Box>
    </Card>
  );
};
 
/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const RMODashboardPage = () => {
  const { user } = useAuth();
  const [projects,       setProjects]       = useState([]);
  const [users,          setUsers]          = useState([]);
  const [memberCountMap, setMemberCountMap] = useState({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [lastUpdated,    setLastUpdated]    = useState(null);
 
  // Modal state
  const [modal, setModal] = useState(null);
 
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [pRes, uRes] = await Promise.all([
        rmoApi.getProjects(),
        rmoApi.getUsers(),
      ]);
      const pList = pRes.data?.content || pRes.data || [];
      const uList = uRes.data?.content || uRes.data || [];
      const ps    = Array.isArray(pList) ? pList : [];
      const us    = Array.isArray(uList) ? uList : [];
      setProjects(ps);
      setUsers(us);
 
      // Fetch member counts for active projects (up to 15)
      const active = ps.filter((p) => p.status === 'ACTIVE').slice(0, 15);
      const results = await Promise.allSettled(
        active.map((p) =>
          rmoApi.getProjectMembers(p.id)
            .then((r) => ({ id: p.id, count: (r.data || []).length }))
        )
      );
      const map = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') map[r.value.id] = r.value.count;
      });
      setMemberCountMap(map);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  /* ── Computed KPIs ─────────────────────────────────────── */
  const stats = useMemo(() => {
    const active    = projects.filter((p) => p.status === 'ACTIVE').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const onHold    = projects.filter((p) => p.status === 'ON_HOLD').length;
    const assigned  = users.filter((u) => u.status === 'ACTIVE').length;
    const bench     = Math.max(0, users.length - assigned);
    const util      = users.length > 0 ? Math.round((assigned / users.length) * 100) : 0;
    return { total: projects.length, active, completed, onHold, assigned, bench, util };
  }, [projects, users]);
 
  /* ── Sparkline data (fake trend — last 6 values based on count) */
  const assignedSparkData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      v: Math.max(0, stats.assigned - Math.floor(Math.random() * 3) + i),
    })),
    [stats.assigned]
  );
 
  const benchSparkData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      v: Math.max(0, stats.bench + Math.floor(Math.random() * 2) - i),
    })),
    [stats.bench]
  );
 
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
 
  /* ─────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────── */
  return (
    <Box sx={{ bgcolor: '#F0F2F8', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
 
      {/* ── Header ─────────────────────────────────────────────────── */}
      <PageHeader
        title={`${greeting}, ${user?.fullName?.split(' ')[0] || 'RMO'}`}
        subtitle="Resource & project health at a glance"
        breadcrumbs={[{ label: 'RMO', path: '/rmo/dashboard' }, { label: 'Overview' }]}
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LivePulse />
            {lastUpdated && (
              <Typography sx={{ fontSize: '0.67rem', color: '#9CA3AF' }}>
                {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Button
              variant="outlined" size="small"
              startIcon={loading ? <CircularProgress size={12} /> : <Refresh sx={{ fontSize: 15 }} />}
              onClick={load} disabled={loading}
              sx={{ borderColor: '#E5E7EB', color: '#374151', fontSize: '0.73rem' }}
            >
              Refresh
            </Button>
          </Box>
        }
      />
 
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
 
      {/* ── Row 1: KPI Cards ────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Active Projects */}
        <Grid item xs={12} sm={4}>
          <KPICard
            title="Active projects"
            value={stats.active}
            icon={ProjectIcon}
            color={C.navy} bg="#EEF0FF"
            subtitle={`${stats.total} total · ${stats.completed} completed · ${stats.onHold} on hold`}
            trend={1} trendVal={`${stats.completed} completed`}
            delay={0}
            onClick={() => setModal('activeProjects')}
            miniChart={[
              { v: Math.max(0, stats.active - 2) }, { v: Math.max(0, stats.active - 1) },
              { v: stats.active }, { v: stats.active }, { v: stats.active }, { v: stats.active },
            ]}
            loading={loading}
          />
        </Grid>
 
        {/* Assigned Resources */}
        <Grid item xs={12} sm={4}>
          <KPICard
            title="Assigned resources"
            value={stats.assigned}
            icon={ResourceIcon}
            color={C.purple} bg="#F9EFF7"
            subtitle={`${users.length} total · ${stats.util}% utilisation rate`}
            trend={stats.util > 70 ? 1 : 0}
            trendVal={`${stats.util}% utilised`}
            delay={0.08}
            onClick={() => setModal('resources')}
            miniDonut donutUsed={stats.assigned} donutTotal={users.length}
            loading={loading}
          />
        </Grid>
 
        {/* Resource Pool */}
        <Grid item xs={12} sm={4}>
          <KPICard
            title="Resource pool"
            value={stats.bench}
            icon={BenchIcon}
            color={C.yellow} bg="#FFFBEB"
            subtitle="Available for project assignment"
            trend={stats.bench > 5 ? -1 : 0}
            trendVal={stats.bench > 5 ? 'High — review assignments' : 'Within normal range'}
            delay={0.16}
            onClick={() => setModal('bench')}
            miniChart={benchSparkData}
            loading={loading}
          />
        </Grid>
      </Grid>
 
      {/* ── Row 2: Donut + Bar Chart + Timeline ─────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Project overview donut */}
        <Grid item xs={12} sm={6} md={3}>
          <StatusDonutCard projects={projects} loading={loading} />
        </Grid>
 
        {/* Top projects by team size */}
        <Grid item xs={12} sm={6} md={4}>
          <TopProjectsChart
            projects={projects}
            memberCountMap={memberCountMap}
            loading={loading}
          />
        </Grid>
 
        {/* Recent activity timeline */}
        <Grid item xs={12} md={5}>
          <TimelineCard projects={projects} loading={loading} />
        </Grid>
      </Grid>
 
      {/* ══════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════ */}
 
      {/* Active projects list → drill down to detail */}
      <ActiveProjectsModal
        open={modal === 'activeProjects'}
        onClose={() => setModal(null)}
        projects={projects}
        users={users}
        loading={loading}
      />
 
      {/* Assigned resources */}
      <ResourcesModal
        open={modal === 'resources'}
        onClose={() => setModal(null)}
        users={users}
        loading={loading}
        title="Assigned Resources"
        subtitle={`${stats.assigned} active employees`}
        filter={(u) => u.status === 'ACTIVE'}
        accentColor={C.purple}
      />
 
      {/* Resource pool / bench */}
      <ResourcesModal
        open={modal === 'bench'}
        onClose={() => setModal(null)}
        users={users}
        loading={loading}
        title="Resource Pool"
        subtitle={`${stats.bench} employees available for assignment`}
        filter={(u) => u.status !== 'ACTIVE'}
        accentColor={C.yellow}
      />
    </Box>
  );
};
 
export default RMODashboardPage;