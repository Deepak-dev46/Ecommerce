import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Paper, Typography, Stack, CircularProgress, Chip, Button
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LayersIcon from '@mui/icons-material/Layers';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getAssignedTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
 
const STATUS_THEME = {
  OPEN: { label: 'Open', color: '#6366F1', bg: '#EEF2FF', border: '#E0E7FF' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' },
  ON_HOLD: { label: 'On Hold', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
  RESOLVED: { label: 'Resolved', color: '#10B981', bg: '#ECFDF5', border: '#D1FAE5' },
};
 
export default function SupportDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!user?.userId) return;
    getAssignedTickets(user.userId)
      .then(({ data }) => setTickets(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);
 
  // Derived structural metrics
  const metrics = useMemo(() => {
    const total = tickets.length || 0;
    const getCount = (status) => tickets.filter(t => t.status === status).length;
    
    const open = getCount('OPEN');
    const inProgress = getCount('IN_PROGRESS');
    const onHold = getCount('ON_HOLD');
    const resolved = getCount('RESOLVED');
    const breached = tickets.filter(t => t.slaBreached).length;
 
    // Calculate percentage widths for our custom distribution chart
    const pct = (val) => (total > 0 ? (val / total) * 100 : 0);
 
    return {
      total, breached,
      segments: [
        { label: 'Open', count: open, pct: pct(open), color: STATUS_THEME.OPEN.color },
        { label: 'In Progress', count: inProgress, pct: pct(inProgress), color: STATUS_THEME.IN_PROGRESS.color },
        { label: 'On Hold', count: onHold, pct: pct(onHold), color: STATUS_THEME.ON_HOLD.color },
        { label: 'Resolved', count: resolved, pct: pct(resolved), color: STATUS_THEME.RESOLVED.color },
      ]
    };
  }, [tickets]);
 
  return (
    <Box sx={{ 
      p: { xs: 3, md: 5 }, 
      backgroundColor: '#F8FAFC', 
      minHeight: '100vh',
      fontFamily: '"Inter", sans-serif'
    }}>
      
      {/* Header with Glass Card background */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, mb: 4, borderRadius: '20px', 
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
          border: '1px solid #E2E8F0',
          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box sx={{
            width: 54, height: 54, borderRadius: '16px',
            background: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)'
          }}>
            <SupportAgentIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
              Hello, {user?.fullName || 'Agent'} 
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>
              monitoring live queue metrics.
            </Typography>
          </Box>
        </Stack>
 
        {/* Dynamic Micro-Chart (Volume Metrics Breakdown Line) */}
        {!loading && metrics.total > 0 && (
          <Box sx={{ width: { xs: '100%', md: 340 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 14, color: '#2563EB' }} /> Volume Distribution
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {metrics.total} Active Cases
              </Typography>
            </Stack>
            
            {/* Inline dynamic segmented bar chart */}
            <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#E2E8F0', mb: 1.5 }}>
              {metrics.segments.map((seg) => seg.count > 0 && (
                <Box 
                  key={seg.label} 
                  sx={{ 
                    width: `${seg.pct}%`, 
                    backgroundColor: seg.color,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }} 
                />
              ))}
            </Box>
 
            {/* Custom Chart Legend */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {metrics.segments.map((seg) => (
                <Stack key={seg.label} direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: seg.color }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B' }}>
                    {seg.count} {seg.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
 
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
          <CircularProgress thickness={5} sx={{ color: '#0F172A' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          
          {/* Big Statistics Matrix Grid */}
          {metrics.segments.map((card) => {
            const ui = STATUS_THEME[card.label.toUpperCase().replace(' ', '_')] || {};
            return (
              <Grid item xs={12} sm={6} md={3} key={card.label}>
                <Paper
                  elevation={0}
                  onClick={() => navigate('/support/tickets')}
                  sx={{
                    p: 3, borderRadius: '24px', backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0', cursor: 'pointer',
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: ui.color,
                      boxShadow: `0 20px 30px rgba(15, 23, 42, 0.04), 0 4px 12px ${ui.color}10`,
                      '& .metric-count': { transform: 'scale(1.04)' }
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {card.label}
                    </Typography>
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', backgroundColor: ui.bg, border: `1px solid ${ui.border}` }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: ui.color }}>
                        {Math.round(card.pct)}%
                      </Typography>
                    </Box>
                  </Stack>
 
                  <Typography 
                    className="metric-count"
                    sx={{ 
                      fontSize: '3rem', fontWeight: 800, color: '#0F172A', lineHeight: 1,
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'left center'
                    }}
                  >
                    {card.count}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
 
          {/* Attention/SLA Banner block spanning layout */}
          {metrics.breached > 0 && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                onClick={() => navigate('/support/tickets')}
                sx={{
                  p: 2.5, borderRadius: '20px',
                  background: 'linear-gradient(90deg, #FEF2F2 0%, #FFF5F5 100%)',
                  border: '1px solid #FEE2E2', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.005)' }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#EF4444', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
                    <OfflineBoltIcon sx={{ color: '#FFF', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#991B1B' }}>
                      Critical SLA Breaches Detected
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 500 }}>
                      These tickets have exceeded standard response operating targets.
                    </Typography>
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444', pr: 1 }}>
                  {metrics.breached}
                </Typography>
              </Paper>
            </Grid>
          )}
 
          {/* Interactive Live Workspace Feed */}
          {tickets.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LayersIcon sx={{ color: '#0F172A', fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Live Queue Overview
                    </Typography>
                  </Stack>
                  <Button 
                    onClick={() => navigate('/support/tickets')}
                    variant="text" 
                    size="small"
                    sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', textTransform: 'none', '&:hover': { backgroundColor: '#EFF6FF' } }}
                  >
                    View entire system queue →
                  </Button>
                </Box>
 
                {tickets.slice(0, 5).map((t) => {
                  const ui = STATUS_THEME[t.status] || { label: t.status, color: '#475569', bg: '#F1F5F9', border: '#E2E8F0' };
                  return (
                    <Box
                      key={t.id}
                      onClick={() => navigate(`/support/tickets/${t.id}`)}
                      sx={{
                        px: 3, py: 2.5, cursor: 'pointer',
                        borderBottom: '1px solid #F1F5F9',
                        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between', gap: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          backgroundColor: '#F8FAFC',
                          pl: 4 // Creates a smooth indentation shifting effect on hover
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        <Box sx={{ 
                          px: 1.2, py: 0.5, borderRadius: '8px', backgroundColor: '#F1F5F9', 
                          border: '1px solid #E2E8F0', display: 'inline-block' 
                        }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                            {t.ticketNumber}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                          {t.subject}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {t.slaBreached && (
                          <Chip 
                            label="SLA Breached" 
                            size="small" 
                            sx={{ color: '#EF4444', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', height: 22, fontSize: '0.7rem', fontWeight: 700 }} 
                          />
                        )}
                        <Chip 
                          label={ui.label} 
                          size="small" 
                          sx={{ 
                            color: ui.color, backgroundColor: ui.bg, borderColor: ui.border,
                            variant: 'outlined', height: 24, fontSize: '0.72rem', fontWeight: 700, minWidth: 85
                          }} 
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
 