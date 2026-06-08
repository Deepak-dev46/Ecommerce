import { Card, CardContent, Typography, Box } from '@mui/material';
 
export default function FormCard({ title, subtitle, children }) {
  return (
    <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(39,35,92,0.08)' }}>
      {(title || subtitle) && (
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          {title    && <Typography variant="h6" sx={{ color: '#27235C', fontWeight: 700 }}>{title}</Typography>}
          {subtitle && <Typography variant="body2" sx={{ color: '#666', mt: 0.3 }}>{subtitle}</Typography>}
        </Box>
      )}
      <CardContent sx={{ px: 3, pb: '24px !important' }}>
        {children}
      </CardContent>
    </Card>
  );
}
 