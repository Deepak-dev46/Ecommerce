import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Avatar, IconButton,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton, Tooltip, Divider, Badge, useMediaQuery,
  useTheme, Collapse
} from '@mui/material';
import {
  Dashboard, Person, Lock, Notifications, Menu as MenuIcon,
  ChevronLeft, Logout, Settings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProfilePanel from '../components/user/ProfilePanel';
import { userAxios } from '../api/axiosInstance';
import { toast } from 'react-toastify';

// ── constants ──────────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 220;
const DRAWER_COLLAPSED = 64;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/user/dashboard' },
];

// ── EndUserLayout ──────────────────────────────────────────────────────────────
export default function EndUserLayout() {
  const { user, logout, updateUserSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [profile, setProfile] = useState(user);

  // fetch latest profile once
  React.useEffect(() => {
    userAxios.get('/api/v1/users/profile')
      .then(r => { setProfile(r.data); updateUserSession?.(r.data); })
      .catch(() => { });
  }, []);

  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : '';

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    navigate('/login');
  };

  const handleProfileUpdated = (updated) => {
    setProfile(updated);
    updateUserSession?.(updated);
  };

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1B193F' }}>
      {/* Logo */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        px: sidebarOpen ? 2.5 : 1.5, py: 2,
        minHeight: 64, gap: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
          background: 'linear-gradient(135deg,#97247E,#E01950)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography fontWeight={900} color="#fff" fontSize={16}>S</Typography>
        </Box>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <Typography fontWeight={800} color="#fff" fontSize={14} letterSpacing={0.3}>
                ServiceeverZ
              </Typography>
              <Typography fontSize={10} color="rgba(255,255,255,0.5)" letterSpacing={0.5}>
                USER PORTAL
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              title={!sidebarOpen ? item.label : ''}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => { navigate(item.path); if (isMobile) setSidebarOpen(false); }}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: sidebarOpen ? 1.5 : 1,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    bgcolor: active ? 'rgba(151,36,126,0.25)' : 'transparent',
                    borderLeft: active ? '3px solid #97247E' : '3px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: sidebarOpen ? 36 : 'unset',
                    color: active ? '#97247E' : 'rgba(255,255,255,0.55)',
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 13, fontWeight: active ? 700 : 500,
                            color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Bottom: toggle + logout */}
      <Box sx={{ px: 1, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Tooltip title={sidebarOpen ? 'Collapse' : 'Expand'} placement="right">
          <ListItemButton
            onClick={() => setSidebarOpen(p => !p)}
            sx={{
              borderRadius: 2, minHeight: 40, mb: 0.5,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              px: sidebarOpen ? 1.5 : 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: sidebarOpen ? 36 : 'unset', color: 'rgba(255,255,255,0.45)', justifyContent: 'center' }}>
              <ChevronLeft sx={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
            </ListItemIcon>
            {sidebarOpen && (
              <ListItemText primary="Collapse" primaryTypographyProps={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }} />
            )}
          </ListItemButton>
        </Tooltip>

        <Tooltip title="Logout" placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2, minHeight: 40,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              px: sidebarOpen ? 1.5 : 1,
              '&:hover': { bgcolor: 'rgba(224,25,80,0.15)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: sidebarOpen ? 36 : 'unset', color: '#E01950', justifyContent: 'center' }}>
              <Logout />
            </ListItemIcon>
            {sidebarOpen && (
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13, color: '#E01950', fontWeight: 600 }} />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F5F9' }}>

      {/* ── Sidebar Drawer ── */}
      {isMobile ? (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{ sx: { width: DRAWER_WIDTH, border: 'none' } }}
        >
          <SidebarContent />
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{
            width: sidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED,
            flexShrink: 0,
            transition: 'width 0.3s ease',
          }}
        >
          <Box
            sx={{
              width: sidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED,
              height: '100vh',
              position: 'fixed',
              top: 0, left: 0,
              transition: 'width 0.3s ease',
              zIndex: 1200,
              boxShadow: '2px 0 12px rgba(27,25,63,0.15)',
            }}
          >
            <SidebarContent />
          </Box>
        </Box>
      )}

      {/* ── Main Area ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Navbar ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #F0F0F8',
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: '64px !important' }}>
            {/* Mobile hamburger */}
            {isMobile && (
              <IconButton size="small" onClick={() => setSidebarOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon sx={{ color: '#1B193F' }} />
              </IconButton>
            )}

            {/* Page title derived from route */}
            <Typography variant="subtitle1" fontWeight={700} color="#1B193F" sx={{ flexGrow: 1 }}>
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'User Portal'}
            </Typography>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton size="small">
                <Badge badgeContent={0} color="error">
                  <Notifications sx={{ color: '#6B7280', fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton size="small">
                <Settings sx={{ color: '#6B7280', fontSize: 22 }} />
              </IconButton>
            </Tooltip>

            {/* Avatar → opens ProfilePanel */}
            <Tooltip title="My Account">
              <IconButton onClick={() => setProfilePanelOpen(true)} sx={{ p: 0.5 }}>
                <Avatar
                  src={profile?.profilePicture}
                  sx={{
                    width: 36, height: 36,
                    background: 'linear-gradient(135deg,#27235C,#97247E)',
                    fontSize: 14, fontWeight: 700,
                    border: '2px solid #F0F0F8',
                    cursor: 'pointer',
                  }}
                >
                  {fullName.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* ── Page Content ── */}
        <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
      <ProfilePanel
        open={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />
    </Box>
  );
}


