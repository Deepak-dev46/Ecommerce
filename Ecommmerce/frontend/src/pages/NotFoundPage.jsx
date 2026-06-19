import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Page not found
      </Typography>
      <Typography sx={{ color: '#475569', mb: 4 }}>
        The page you are looking for does not exist. Use the navigation to return home.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Go to home
      </Button>
    </Container>
  )
}
