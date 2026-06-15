import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, Avatar, Typography,
  Badge, Tooltip, Menu, MenuItem, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsOutlined as BellIcon,
  SettingsOutlined as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfilePanel from '../users/ProfilePanel';
import { userAxios } from '../../api/axiosInstance';
 
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  const [loading, setLoading] = useState(true);
  const [anchor, setAnchor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
 
  useEffect(() => {
    fetchProfile();
  }, []);
 
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAxios.get('/api/v1/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Profile API error:', err?.response?.status, err?.response?.data?.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
 
  const handleLogout = async () => {
    try {
      setAnchor(null);
      setLogoutDialogOpen(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };
 
  const openLogoutDialog = () => {
    setAnchor(null);
    setLogoutDialogOpen(true);
  };
 
  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };
 
  const openPanel = (tab = 'details') => {
    setActiveTab(tab);
    setProfilePanelOpen(true);
  };
 
  const initials = (user?.fullName || user?.email || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
 
  const fontStack = '"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", sans-serif';
 
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#1D1B44',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: '58px', sm: '66px' }, gap: { xs: 1, sm: 2 }, px: { xs: 2, md: 4 } }}>
 
        <IconButton
          size="small"
          onClick={onMenuToggle}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}
        >
          <MenuIcon fontSize="medium" />
        </IconButton>
 
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.2,
            py: 0.6,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              '& .brand-logo-frame': {
                transform: 'scale(1.02)',
                boxShadow: '0 4px 12px rgba(151, 36, 126, 0.4)'
              }
            }
          }}
          onClick={() => navigate('/')}
        >
          <Box
            className="brand-logo-frame"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #97247E 0%, #E01950 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontFamily: fontStack,
              fontSize: '0.95rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(151, 36, 126, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            S
          </Box>
 
          <Typography
            sx={{
              fontFamily: fontStack,
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '-0.1px',
              color: '#FFFFFF',
              display: { xs: 'none', sm: 'block' },
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            ServiceeverZ
          </Typography>
        </Box>
 
        <Box sx={{ flexGrow: 1 }} />
 
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
          <Tooltip title="Log out">
            <IconButton
              size="small"
              onClick={openLogoutDialog}
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': { color: '#E01950', backgroundColor: 'rgba(224, 25, 80, 0.12)' }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
 
        <Box
          onClick={() => openPanel('details')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            ml: 1,
            pl: { xs: 1.5, sm: 2.5 },
            borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
            height: '36px',
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .profile-avatar-node': {
                transform: 'scale(1.03)',
                borderColor: '#97247E'
              },
              '& .profile-user-string': { color: '#97247E' }
            }
          }}
        >
          <Avatar
            className="profile-avatar-node"
            src={profile?.profilePicture}
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
              fontFamily: fontStack,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {initials}
          </Avatar>
 
          <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
            <Typography
              className="profile-user-string"
              sx={{
                fontFamily: fontStack,
                fontSize: '0.85rem',
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#FFFFFF',
                transition: 'color 0.2s ease',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {user?.fullName || user?.email}
            </Typography>
            <Typography
              sx={{
                fontFamily: fontStack,
                fontSize: '0.68rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 500,
                mt: 0.15,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              {user?.roles?.[0] || 'ADMIN'}
            </Typography>
          </Box>
        </Box>
 
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 230,
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              backgroundColor: '#FFFFFF',
              color: '#27235C',
              border: '1px solid rgba(39, 35, 92, 0.1)',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ px: 2.5, py: 2, backgroundColor: 'rgba(39, 35, 92, 0.03)' }}>
            <Typography sx={{ fontFamily: fontStack, fontWeight: 700, fontSize: '0.875rem', color: '#27235C' }}>
              {user?.fullName}
            </Typography>
            <Typography sx={{ fontFamily: fontStack, fontSize: '0.75rem', color: 'rgba(39, 35, 92, 0.6)', mb: 1.2 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {user?.roles?.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  sx={{
                    fontFamily: fontStack,
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    background: 'rgba(39, 35, 92, 0.08)',
                    color: '#27235C',
                    borderRadius: '4px'
                  }}
                />
              ))}
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(39, 35, 92, 0.08)' }} />
          <MenuItem
            dense
            onClick={() => { setAnchor(null); navigate('/password-policy'); }}
            sx={{
              fontFamily: fontStack,
              fontSize: '0.825rem',
              py: 1.2,
              px: 2.5,
              color: '#27235C',
              '&:hover': { backgroundColor: 'rgba(39, 35, 92, 0.04)' }
            }}
          >
            <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'rgba(39, 35, 92, 0.5)' }} /> Settings
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(39, 35, 92, 0.08)' }} />
          <MenuItem
            dense
            onClick={openLogoutDialog}
            sx={{
              fontFamily: fontStack,
              fontSize: '0.825rem',
              py: 1.2,
              px: 2.5,
              color: '#E01950',
              '&:hover': { backgroundColor: 'rgba(224, 25, 80, 0.06)' }
            }}
          >
            <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign out
          </MenuItem>
        </Menu>
 
        <Dialog
          open={logoutDialogOpen}
          onClose={closeLogoutDialog}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: { xs: '90%', sm: 380 },
              backgroundColor: '#FFFFFF',
            }
          }}
        >
          <DialogTitle
            id="logout-dialog-title"
            sx={{
              fontFamily: fontStack,
              fontWeight: 700,
              color: '#27235C',
              pb: 1,
            }}
          >
            Confirm logout
          </DialogTitle>
 <DialogContent>
            <DialogContentText
              id="logout-dialog-description"
              sx={{
                fontFamily: fontStack,
                fontSize: '0.95rem',
                color: 'rgba(39, 35, 92, 0.75)',
              }}
            >
              Are you sure you want to log out of your account?
            </DialogContentText>
          </DialogContent>
 
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={closeLogoutDialog}
              variant="outlined"
              sx={{
                fontFamily: fontStack,
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: 'rgba(39, 35, 92, 0.2)',
                color: '#27235C',
                '&:hover': {
                  borderColor: '#27235C',
                  backgroundColor: 'rgba(39, 35, 92, 0.04)',
                }
              }}
            >
              Cancel
            </Button>
 
            <Button
              onClick={handleLogout}
              variant="contained"
              autoFocus
              sx={{
                fontFamily: fontStack,
                textTransform: 'none',
                borderRadius: '8px',
                backgroundColor: '#E01950',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#C51645',
                }
              }}
            >
              Yes, log out
            </Button>
          </DialogActions>
        </Dialog>
 
      </Toolbar>
 
      <ProfilePanel
        open={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        profile={profile}
        loading={loading}
        defaultTab={activeTab}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </AppBar>
  );
};
 
export default Navbar;
 