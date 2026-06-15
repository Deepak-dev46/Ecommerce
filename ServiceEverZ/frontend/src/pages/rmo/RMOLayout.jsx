// src/pages/rmo/RMOLayout.jsx
// Reuses the exact same RootLayout shell — sidebar already shows RMO nav
// when user has RMO role (handled in Sidebar.jsx)
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_W } from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
 
const RMOLayout = () => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen]      = useState(true);
  const [mobileOpen, setMob] = useState(false);
 
  const toggleSidebar = () => {
    if (isMobile) setMob((p) => !p);
    else setOpen((p) => !p);
  };
 
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F9' }}>
      <Sidebar open={open} mobileOpen={mobileOpen} onMobileClose={() => setMob(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin-left', { duration: 250 }),
          display: 'flex', flexDirection: 'column', minHeight: '100vh',
        }}
      >
        <Navbar onMenuToggle={toggleSidebar} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pt: { xs: 9.5, md: 10 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
 
export default RMOLayout;
 