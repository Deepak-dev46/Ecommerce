import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Stack, CircularProgress
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { getAssignedTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
 
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
 
  const cards = [
    { label: 'Total Assigned', count: tickets.length,                                         color: '#27235C', bg: '#EEF0FF', border: '#C7C9E8' },
    { label: 'Open',           count: tickets.filter(t => t.status === 'OPEN').length,        color: '#524F7D', bg: '#F0EFF8', border: '#C7C9E8' },
    { label: 'In Progress',    count: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: '#E2B93B', bg: '#FDF8EC', border: '#F0DFA0' },
    { label: 'On Hold',        count: tickets.filter(t => t.status === 'ON_HOLD').length,     color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
    { label: 'Resolved',       count: tickets.filter(t => t.status === 'RESOLVED').length,    color: '#24A148', bg: '#EDFAF2', border: '#B7EAC9' },
    { label: 'SLA Breached',   count: tickets.filter(t => t.slaBreached).length,              color: '#E01950', bg: '#FEF2F2', border: '#FECACA' },
  ];
 
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#F4F5F9', minHeight: '100vh' }}>
 
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: '10px',
          background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SupportAgentIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#27235C', lineHeight: 1.2 }}>
            Support Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.2 }}>
            Welcome back, {user?.fullName || 'Agent'} — here's your ticket summary
          </Typography>
        </Box>
      </Stack>
 
      {/* Stat Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#27235C' }} />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map(({ label, count, color, bg, border }) => (
            <Grid item xs={12} sm={6} md={2} key={label}>
              <Paper
                elevation={0}
                onClick={() => navigate('/support/tickets')}
                sx={{
                  px: 2.5, py: 2.5, borderRadius: '14px',
                  backgroundColor: bg, border: `1px solid ${border}`,
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${color}22` },
                }}
              >
                <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1 }}>
                  {count}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color, fontWeight: 600, mt: 0.5, opacity: 0.85 }}>
                  {label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
 
      {/* Recent tickets quick view */}
      {!loading && tickets.length > 0 && (
        <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#27235C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Assigned Tickets
            </Typography>
          </Box>
          {tickets.slice(0, 5).map((t) => (
            <Stack
              key={t.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => navigate(`/support/tickets/${t.id}`)}
              sx={{
                px: 2.5, py: 1.5, cursor: 'pointer',
                borderBottom: '1px solid #F9FAFB',
                '&:hover': { backgroundColor: '#F8F8FC' },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ px: 1, py: 0.3, borderRadius: '6px', backgroundColor: '#EEF0FF', border: '1px solid #C7C9E8' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#27235C' }}>
                    {t.ticketNumber}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1F2937' }}>
                  {t.subject}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                {t.status?.replace('_', ' ')}
              </Typography>
            </Stack>
          ))}
          {tickets.length > 5 && (
            <Box sx={{ px: 2.5, py: 1.5, textAlign: 'center' }}>
              <Typography
                onClick={() => navigate('/support/tickets')}
                sx={{ fontSize: '0.8rem', color: '#97247E', fontWeight: 600, cursor: 'pointer' }}
              >
                View all {tickets.length} tickets →
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
 