// src/pages/rmo/dashboard/RMODashboardPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar,
  LinearProgress, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Skeleton, Alert, Button, CircularProgress,
} from '@mui/material';
import {
  FolderSpecial as ProjectIcon,
  Groups as ResourceIcon,
  ChairAlt as BenchIcon,
  TrendingUp, Warning, CheckCircle, Person,
  ArrowForward, Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rmoApi } from '../../../api/rmoApi';
import { formatDate } from '../../../utils/formatters';
import PageHeader from '../../../components/common/PageHeader';
 
// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  ACTIVE:    { bg: '#DCFCE7', color: '#15803D', label: 'Active' },
  INACTIVE:  { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive' },
  COMPLETED: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Completed' },
  ON_HOLD:   { bg: '#FEF9C3', color: '#854D0E', label: 'On Hold' },
};
 
const StatusChip = ({ status }) => {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.INACTIVE;
  return (
    <Chip
      label={cfg.label} size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.7rem', height: 22, border: `1px solid ${cfg.color}30` }}
    />
  );
};
 
// ── KPI Card ──────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon: Icon, color, bg, subtitle, onClick, loading, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    style={{ height: '100%' }}
  >
    <Card
      onClick={onClick}
      sx={{
        height: '100%', cursor: onClick ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.18s, box-shadow 0.18s',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' } : {},
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
      <CardContent sx={{ p: 2.5, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75 }}>
              {title}
            </Typography>
            {loading
              ? <Skeleton width={60} height={40} />
              : <Typography sx={{ fontSize: '1.85rem', fontWeight: 800, color: '#1B193F', lineHeight: 1 }}>{value}</Typography>
            }
            {subtitle && !loading && (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.5 }}>{subtitle}</Typography>
            )}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
        </Box>
        {onClick && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', color, fontWeight: 600 }}>View details</Typography>
            <ArrowForward sx={{ fontSize: 13, color }} />
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);
 
// ── Department utilisation bar ────────────────────────────────────────────────
const UtilBar = ({ dept, assigned, total }) => {
  const pct   = total > 0 ? Math.round((assigned / total) * 100) : 0;
  const color = pct >= 90 ? '#E01950' : pct >= 70 ? '#E2B93B' : '#24A148';
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>{dept}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{pct}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={pct}
        sx={{ height: 6, borderRadius: 3, bgcolor: '#F0F0F5', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
      />
    </Box>
  );
};
 
// ─── Main Page ────────────────────────────────────────────────────────────────
const RMODashboardPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
 
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pRes, uRes] = await Promise.all([rmoApi.getProjects(), rmoApi.getUsers()]);
      setProjects(pRes.data || []);
      setUsers(uRes.data || []);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { load(); }, []);
 
  // ── Computed KPIs (frontend) ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const active    = projects.filter((p) => p.status === 'ACTIVE').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const onHold    = projects.filter((p) => p.status === 'ON_HOLD').length;
    // Simple heuristic: users with no project data = bench
    // (real bench = users with no PRIMARY assignment — we surface this from users endpoint)
    const assigned  = users.filter((u) => u.status === 'ACTIVE').length;
    return { total: projects.length, active, completed, onHold, assigned, bench: Math.max(0, users.length - assigned) };
  }, [projects, users]);
 
  // ── Alerts ─────────────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = [];
    projects.forEach((p) => {
      if (!p.resourceOwnerId) list.push({ severity: 'error',   msg: `"${p.projectName}" has no Resource Owner assigned.`, projectId: p.id });
      if (!p.l1ManagerId)     list.push({ severity: 'warning', msg: `"${p.projectName}" has no L1 Manager assigned.`,     projectId: p.id });
      if (!p.l2ManagerId)     list.push({ severity: 'warning', msg: `"${p.projectName}" has no L2 Manager assigned.`,     projectId: p.id });
      if (p.status === 'ON_HOLD') list.push({ severity: 'info', msg: `Project "${p.projectName}" is currently on hold.`, projectId: p.id });
    });
    return list.slice(0, 8);
  }, [projects]);
 
  // ── Department utilisation (approximate from users) ────────────────────────
  const deptUtil = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const d = u.department || 'Unknown';
      if (!map[d]) map[d] = { total: 0, active: 0 };
      map[d].total++;
      if (u.status === 'ACTIVE') map[d].active++;
    });
    return Object.entries(map)
      .map(([dept, { total, active }]) => ({ dept, total, active }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [users]);
 
  // ── Recent projects ────────────────────────────────────────────────────────
  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6),
    [projects]
  );
 
  return (
    <Box>
      <PageHeader
        title="RMO Overview"
        subtitle="Resource & project health at a glance"
        breadcrumbs={[{ label: 'RMO', path: '/rmo/dashboard' }, { label: 'Overview' }]}
        actions={
          <Button variant="outlined" size="small" startIcon={loading ? <CircularProgress size={14} /> : <Refresh />}
            onClick={load} disabled={loading} sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
            Refresh
          </Button>
        }
      />
 
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
 
      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            title: 'Active Projects', value: loading ? '…' : stats.active,
            icon: ProjectIcon, color: '#27235C', bg: '#EEF0FF',
            subtitle: `${stats.total} total · ${stats.completed} completed`,
            onClick: () => navigate('/rmo/projects'),
            delay: 0,
          },
          {
            title: 'Assigned Resources', value: loading ? '…' : stats.assigned,
            icon: ResourceIcon, color: '#97247E', bg: '#FDF4FB',
            subtitle: `${users.length} total employees`,
            onClick: () => navigate('/rmo/resources'),
            delay: 0.07,
          },
          {
            title: 'Resource pool', value: loading ? '…' : stats.bench,
            icon: BenchIcon, color: '#E2B93B', bg: '#FFFBEB',
            subtitle: 'Not in any active project',
            onClick: () => navigate('/rmo/resources'),
            delay: 0.14,
          },
        ].map((card) => (
          <Grid item xs={12} sm={4} key={card.title}>
            <KPICard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>
 
      <Grid container spacing={2.5}>
           {/* ── Operational Alerts ─────────────────────────────────────────── */}
        {/* <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F5' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Operational Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                  {alerts.length > 0 ? `${alerts.length} items need attention` : 'All clear'}
                </Typography>
              </Box>
              {alerts.length > 0 && (
                <Chip label={alerts.filter((a) => a.severity === 'error').length + ' critical'}
                  size="small" sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
              )}
            </Box>
            <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <Box key={i} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F9F9FC' }}>
                    <Skeleton height={20} width="80%" />
                  </Box>
                ))
              ) : alerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CheckCircle sx={{ fontSize: 36, color: '#24A148', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No alerts — everything looks good!</Typography>
                </Box>
              ) : (
                alerts.map((a, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 2.5, py: 1.5,
                      borderBottom: '1px solid #F9F9FC',
                      display: 'flex', alignItems: 'flex-start', gap: 1.5,
                      cursor: a.projectId ? 'pointer' : 'default',
                      '&:hover': { bgcolor: '#F9F9FC' },
                    }}
                    onClick={() => a.projectId && navigate('/rmo/projects')}
                  >
                    <Box sx={{
                      width: 6, height: 6, borderRadius: '50%', mt: 0.7, flexShrink: 0,
                      bgcolor: a.severity === 'error' ? '#E01950' : a.severity === 'warning' ? '#E2B93B' : '#27235C',
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.5 }}>{a.msg}</Typography>
                    </Box>
                    <Chip
                      label={a.severity}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
                        bgcolor: a.severity === 'error' ? '#FEE2E2' : a.severity === 'warning' ? '#FEF9C3' : '#DBEAFE',
                        color:   a.severity === 'error' ? '#B91C1C' : a.severity === 'warning' ? '#854D0E' : '#1D4ED8',
                      }}
                    />
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid> */}
 
        {/* ── Resource Health ─────────────────────────────────────────────── */}
        {/* <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F0F0F5' }}>
              <Typography variant="h6" fontWeight={700}>Resource Health</Typography>
              <Typography variant="body2" color="text.secondary">Active users by department</Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {loading
                ? Array(5).fill(0).map((_, i) => <Skeleton key={i} height={32} sx={{ mb: 1 }} />)
                : deptUtil.length === 0
                ? <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No department data</Typography>
                : deptUtil.map(({ dept, total, active }) => (
                    <UtilBar key={dept} dept={dept} assigned={active} total={total} />
                  ))
              }
            </CardContent>
          </Card>
        </Grid> */}
 
        {/* ── Recent Projects ─────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F5' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Recent Projects</Typography>
                <Typography variant="body2" color="text.secondary">Latest created or updated</Typography>
              </Box>
              <Button size="small" variant="text" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/rmo/projects')} sx={{ color: '#97247E', fontWeight: 600 }}>
                View all
              </Button>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F8FC' }}>
                    {['Project Code', 'Project Name', 'Client', 'Status', 'Department', 'Created'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #F0F0F5' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          {Array(6).fill(0).map((__, j) => (
                            <td key={j} style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5' }}>
                              <div style={{ height: 14, backgroundColor: '#F0F0F5', borderRadius: 4, width: j === 1 ? '80%' : '60%' }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : recentProjects.length === 0
                    ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF', fontSize: '0.875rem' }}>
                            No projects yet. Create your first project.
                          </td>
                        </tr>
                      )
                    : recentProjects.map((p) => (
                        <tr
                          key={p.id}
                          style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F9FC')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => navigate('/rmo/projects')}
                        >
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5', fontFamily: 'monospace', fontSize: '0.8rem', color: '#6B7280' }}>
                            {p.projectCode || '—'}
                          </td>
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5', fontWeight: 600, fontSize: '0.875rem', color: '#1B193F' }}>
                            {p.projectName}
                          </td>
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5', fontSize: '0.825rem', color: '#6B7280' }}>
                            {p.client || '—'}
                          </td>
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5' }}>
                            <StatusChip status={p.status} />
                          </td>
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5', fontSize: '0.825rem' }}>
                            {p.department || '—'}
                          </td>
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F5', fontSize: '0.78rem', color: '#9CA3AF' }}>
                            {formatDate(p.createdAt)}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
 
export default RMODashboardPage;
 