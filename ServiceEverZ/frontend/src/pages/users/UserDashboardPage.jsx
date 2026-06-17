
 
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip,
  IconButton, Skeleton, Divider, Paper, Button, List,
  ListItem, ListItemText, ListItemIcon, Tooltip, Badge,
} from '@mui/material';
import {
  HeadsetMic, Computer, ReportProblem, CheckCircle,
  HourglassEmpty, Schedule, Campaign, PlayCircle,
  Person, Security, Notifications,
  AccountCircle,          // ← profile icon in topbar
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAxios } from '../../api/axiosInstance';
 
// ⬇️  Import the new unified panel (path may differ in your project)
import ProfilePanel from '../../components/users/ProfilePanel';
 
const MotionCard = motion(Card);
const MotionBox  = motion(Box);
 
// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    sx={{
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(39,35,92,0.08)',
      border: '1px solid #F0F0F8',
      textAlign: 'center',
      height: '100%',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{
        width: 52, height: 52, borderRadius: '50%',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 1.5,
      }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
      </Box>
      <Typography variant="h4" fontWeight={700} color="#1B193F">{value}</Typography>
      <Typography variant="body2" color="#6B7280" mt={0.5}>{label}</Typography>
    </CardContent>
  </MotionCard>
);
 
// ─────────────────────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
 
  const [profile, setProfile]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [activeTab, setActiveTab]           = useState('details'); // for deep-linking tabs
 
  useEffect(() => { fetchProfile(); }, []);
 
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAxios.get('/api/v1/users/profile');
      setProfile(res.data);
    } catch (err) {
      // ⚠️  Do NOT use setProfile(user) — AuthContext user is {token} only,
      //     has no firstName/lastName, which causes all fields to show "—"
      console.error('Profile API error:', err?.response?.status, err?.response?.data?.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
 
  // Helper: open panel on a specific tab
  const openPanel = (tab = 'details') => {
    setActiveTab(tab);
    setProfilePanelOpen(true);
  };
 
  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : '';
 
  const stats = [
    { icon: <Schedule />,       label: 'Open Requests',                             value: 0, color: '#27235C', delay: 0   },
    { icon: <HourglassEmpty />, label: 'Waiting for Approval / Request for Information', value: 0, color: '#97247E', delay: 0.1 },
    { icon: <CheckCircle />,    label: 'Closed Requests',                            value: 0, color: '#22c55e', delay: 0.2 },
  ];
 
  const assets = profile?.assets || [
    {
      name:  profile?.employeeId ? `${profile.employeeId}.company.com` : 'No Asset Assigned',
      model: profile?.department?.replace(/_/g, ' ') || '—',
    },
  ];
 
  const announcements = profile?.announcements || [];
 
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F4F5F9', minHeight: '100vh' }}>
 
      {/* ── Top-bar profile icon (add this to your Layout/Topbar component) ──
          If your avatar icon is already in a shared Layout, move the onClick
          there instead of rendering it here.  Shown here for clarity. */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        {/* <Tooltip title="My Account">
          <IconButton onClick={() => openPanel('details')} sx={{ p: 0.5 }}>
            <Avatar
              src={profile?.profilePicture}
              sx={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg,#27235C,#97247E)',
                fontSize: 14, fontWeight: 700,
                border: '2px solid #F0F0F8',
              }}
            >
              {fullName.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip> */}
      </Box>
 
      {/* ── Hero ── */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #27235C 0%, #97247E 60%, #E01950 100%)',
          p: { xs: 4, md: 6 },
          mb: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(39,35,92,0.25)',
        }}
      >
        <Box sx={{ position: 'absolute', left: -60, top: -60, width: 220, height: 220,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', right: -40, bottom: -80, width: 280, height: 280,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
 
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5,
        }}>
          <HeadsetMic sx={{ fontSize: 50, color: '#fff' }} />
        </Box>
 
        <Typography variant="h5" fontWeight={700} color="#fff" mb={0.5}>
          {loading
            ? <Skeleton width={200} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto' }} />
            : `Welcome, ${fullName || 'User'}!`}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
          How can we help you today?asjdkjh
        </Typography>
 
        <Button
          variant="contained"
          startIcon={<PlayCircle />}
          sx={{
            bgcolor: '#fff', color: '#27235C', fontWeight: 700,
            borderRadius: 3, px: 3.5, py: 1, fontSize: 15,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#f0f0f8' },
          }}
        >
          Training Video
        </Button>
      </MotionBox>
 
      {/* ── Stats ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>
 
      {/* ── Assets + Announcements ── */}
      <Grid container spacing={3}>
 
        {/* My Assets */}
        <Grid item xs={12} md={7}>
          <MotionCard
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(39,35,92,0.08)', border: '1px solid #F0F0F8' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B193F" mb={2}>My Assets</Typography>
 
              {loading
                ? [...Array(2)].map((_, i) => <Skeleton key={i} height={56} sx={{ mb: 1 }} />)
                : assets.length > 0
                  ? assets.map((asset, i) => (
                    <Box key={i} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 2, borderRadius: 2, border: '1px solid #F0F0F8', mb: 1.5,
                      '&:hover': { bgcolor: '#F4F5F9' }, transition: 'background 0.2s',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 44, height: 44, borderRadius: 2, bgcolor: '#27235C18',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Computer sx={{ color: '#27235C', fontSize: 22 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="#1B193F">{asset.name}</Typography>
                          <Typography variant="caption" color="#6B7280">{asset.model}</Typography>
                        </Box>
                      </Box>
                      <Button size="small" startIcon={<ReportProblem sx={{ fontSize: 14 }} />}
                        sx={{
                          borderRadius: 2, border: '1px solid #27235C', color: '#27235C',
                          fontWeight: 600, fontSize: 12, px: 1.5,
                          '&:hover': { bgcolor: '#27235C', color: '#fff' }, transition: 'all 0.2s',
                        }}>
                        Report an Issue
                      </Button>
                    </Box>
                  ))
                  : (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#6B7280' }}>
                      <Computer sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2">No assets assigned</Typography>
                    </Box>
                  )}
            </CardContent>
          </MotionCard>
        </Grid>
 
        {/* Announcements */}
        <Grid item xs={12} md={5}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(39,35,92,0.08)', border: '1px solid #F0F0F8', height: '100%' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Campaign sx={{ color: '#97247E', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#1B193F">Announcements</Typography>
              </Box>
 
              {loading
                ? [...Array(3)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)
                : announcements.length > 0
                  ? (
                    <List dense disablePadding>
                      {announcements.map((ann, i) => (
                        <React.Fragment key={i}>
                          <ListItem disableGutters sx={{ py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#97247E', mt: 0.5 }} />
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
                    <Box sx={{ textAlign: 'center', py: 6, color: '#6B7280' }}>
                      <Campaign sx={{ fontSize: 44, opacity: 0.2, mb: 1 }} />
                      <Typography variant="body2" color="#9CA3AF">No data</Typography>
                    </Box>
                  )}
            </CardContent>
          </MotionCard>
        </Grid>
 
      
        {/* <Grid item xs={12}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(39,35,92,0.08)', border: '1px solid #F0F0F8' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B193F" mb={2}>Quick Actions</Typography>
              <Grid container spacing={2}>
                {[
                  {
                    label:  'View My Profile',
                    icon:   <Person />,
                    color:  '#27235C',
                    // ↓ opens panel on "details" tab
                    action: () => openPanel('details'),
                  },
                  {
                    label:  'Change Password',
                    icon:   <Security />,
                    color:  '#97247E',
                    // ↓ opens panel on "password" tab
                    action: () => openPanel('password'),
                  },
                  {
                    label:  'Notifications',
                    icon:   <Notifications />,
                    color:  '#E01950',
                    action: () => {},
                  },
                ].map((item, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Box
                      onClick={item.action}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        p: 2, borderRadius: 2, cursor: 'pointer',
                        border: '1px solid #F0F0F8',
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
                        width: 40, height: 40, borderRadius: 2,
                        bgcolor: `${item.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 20 } })}
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="#1B193F">{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </MotionCard>
        </Grid> */}
 
      </Grid>
 
      {/* ── Profile Panel (My Details + Change Password) ── */}
      <ProfilePanel
        open={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        profile={profile}
        loading={loading}
        defaultTab={activeTab}         // pass the tab to pre-select
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </Box>
  );
}
 

