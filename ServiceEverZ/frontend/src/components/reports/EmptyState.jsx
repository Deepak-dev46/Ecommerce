// src/components/reports/EmptyState.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// Issue 4 fix: Professional "Ready to run" empty state
const ReadyToRun = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 10,
      px: 3,
      textAlign: 'center',
    }}
  >
    {/* Stacked icon badge */}
    <Box
      sx={{
        position: 'relative',
        width: 72,
        height: 72,
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '20px',
          bgcolor: 'primary.50',
          border: '1.5px solid',
          borderColor: 'primary.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AssessmentOutlinedIcon sx={{ fontSize: 36, color: 'primary.main', opacity: 0.85 }} />
      </Box>
      {/* Small calendar badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -6,
          right: -6,
          width: 26,
          height: 26,
          borderRadius: '8px',
          bgcolor: 'white',
          border: '1.5px solid',
          borderColor: 'primary.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        }}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
      </Box>
    </Box>

    <Typography
      variant="h6"
      fontWeight={700}
      color="text.primary"
      mb={0.75}
      sx={{ fontSize: '1rem' }}
    >
      Ready to Generate Report
    </Typography>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ maxWidth: 300, lineHeight: 1.6, mb: 2.5 }}
    >
      Select a date range above and click{' '}
      <Box component="span" fontWeight={600} color="primary.main">
        Run Report
      </Box>{' '}
      to fetch and display the data.
    </Typography>

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 2,
        py: 0.75,
        borderRadius: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <PlayArrowRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      <Typography variant="caption" color="text.disabled" fontWeight={500}>
        No data loaded yet
      </Typography>
    </Box>
  </Box>
);

const VARIANTS = {
  default: { icon: InboxOutlinedIcon,        color: 'text.disabled' },
  error:   { icon: ErrorOutlineOutlinedIcon, color: 'error.light'   },
};

const EmptyState = ({
  title    = 'No data found',
  subtitle = 'Try adjusting your filters or date range.',
  variant  = 'default',
  icon,
}) => {
  // Issue 4 fix: special professional layout for "Ready to run" state
  if (variant === 'search') return <ReadyToRun />;

  const cfg      = VARIANTS[variant] || VARIANTS.default;
  const IconComp = cfg.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ mb: 1, color: cfg.color }}>
        {icon || <IconComp sx={{ fontSize: 48, opacity: 0.45 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default EmptyState;
