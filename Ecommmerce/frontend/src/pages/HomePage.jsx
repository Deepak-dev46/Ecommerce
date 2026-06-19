import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          borderRadius: 4,
          background: '#eef2ff',
          p: { xs: 4, md: 6 },
          boxShadow: '0 32px 80px rgba(99, 102, 241, 0.12)',
          textAlign: 'center',
        }}
      >
        <Typography variant="overline" sx={{ letterSpacing: 2, mb: 2, display: 'block' }}>
          Welcome to your shop
        </Typography>
        <Typography variant="h3" component="h1" sx={{ mb: 2, color: '#111827' }}>
          Build a modern ecommerce experience with React and MUI.
        </Typography>
        <Typography sx={{ maxWidth: 720, mx: 'auto', mb: 4, color: '#475569' }}>
          Explore products, manage your shopping cart, and secure the cart route with client-side authentication.
        </Typography>
        <Button component={RouterLink} to="/shop" variant="contained" size="large">
          Start shopping
        </Button>
      </Box>
    </Container>
  )
}
