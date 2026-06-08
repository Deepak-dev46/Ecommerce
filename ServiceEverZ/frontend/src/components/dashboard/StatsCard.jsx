import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, InsightsOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
 
const StatsCard = ({
  label,
  value,
  icon,
  color,
  bg,
  trend,
  trendLabel,
  loading,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{ height: '100%' }}
  >
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
      <CardContent sx={{ p: 2.8, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 0.75,
              }}
            >
              {label}
            </Typography>
 
            {loading ? (
              <Skeleton width={72} height={42} />
            ) : (
              <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: '#1B193F', lineHeight: 1 }}>
                {value ?? '—'}
              </Typography>
            )}
 
            {trendLabel && !loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.9 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ fontSize: 14, color: '#24A148' }} />
                ) : trend < 0 ? (
                  <TrendingDown sx={{ fontSize: 14, color: '#E01950' }} />
                ) : (
                  <TrendingFlat sx={{ fontSize: 14, color: '#6B7280' }} />
                )}
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: trend > 0 ? '#24A148' : trend < 0 ? '#E01950' : '#6B7280',
                  }}
                >
                  {trendLabel}
                </Typography>
              </Box>
            )}
          </Box>
 
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              backgroundColor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon || <InsightsOutlined sx={{ color, fontSize: 22 }} />}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);
 
export default StatsCard;