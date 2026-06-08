// src/components/reports/Loader.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ text = 'Loading…' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 10,
      gap: 2,
    }}
  >
    <CircularProgress size={36} thickness={4} />
    <Typography variant="body2" color="text.secondary" fontWeight={500}>
      {text}
    </Typography>
  </Box>
);

export default Loader;
