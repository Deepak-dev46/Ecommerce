import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
 
const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
  const navigate = useNavigate();
 
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 14 }} />} sx={{ mb: 0.5 }}>
          {breadcrumbs.map((b, i) =>
            i < breadcrumbs.length - 1 ? (
              <Link
                key={i}
                underline="hover"
                sx={{ fontSize: '0.75rem', color: '#9CA3AF', cursor: 'pointer' }}
                onClick={() => b.path && navigate(b.path)}
              >
                {b.label}
              </Link>
            ) : (
              <Typography key={i} sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                {b.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
 
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1B193F' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
 
        {actions && (
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};
 
export default PageHeader;
 