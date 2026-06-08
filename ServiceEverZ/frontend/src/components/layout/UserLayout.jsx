// src/components/layout/UserLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_W } from './Sidebar';
import Navbar from './Navbar';

const UserLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(prev => !prev);
    else setOpen(prev => !prev);
  };

  const sidebarWidth = isMobile ? 0 : (open ? SIDEBAR_WIDTH : COLLAPSED_W);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F9' }}>
      
      {/* ✅ Sidebar (can later be customized per role) */}
      <Sidebar
        open={open}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        role="END_USER" // ✅ optional: helps you customize menu inside Sidebar
      />

      {/* ✅ Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin', 'width'], { duration: 250 }),
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* ✅ Navbar */}
        <Navbar onMenuToggle={toggleSidebar} />

        {/* ✅ Page content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pt: { xs: 9.5, md: 10 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;