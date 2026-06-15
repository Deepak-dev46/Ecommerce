// src/components/layout/ITSMLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_W } from './Sidebar';
import Navbar from './Navbar';

const ITSMLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(prev => !prev);
    else setOpen(prev => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}> {/* ✅ dark bg */}
      <Sidebar open={open} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{
        flexGrow: 1,
        transition: theme.transitions.create(['margin', 'width'], { duration: 250 }),
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}>
        <Navbar onMenuToggle={toggleSidebar} />
        <Box sx={{
          flexGrow: 1,
          p: 0,                          // ✅ remove padding — each page controls its own
          pt: { xs: '64px', md: '64px' }, // just navbar offset
          overflow: 'auto',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ITSMLayout;
