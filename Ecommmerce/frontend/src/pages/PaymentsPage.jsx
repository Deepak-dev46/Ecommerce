import { Container, Paper, Typography, Box, Button } from '@mui/material'

export default function PaymentsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
          Payments
        </Typography>
        <Typography variant="h4" sx={{ my: 2 }}>
          Payment methods
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Add or manage your saved payment methods used at checkout.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained">Add card</Button>
          <Button variant="outlined">Manage billing</Button>
        </Box>
      </Paper>
    </Container>
  )
}
