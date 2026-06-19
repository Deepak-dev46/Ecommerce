import { Box, Button, Card, CardContent, Chip, Container, Grid, Paper, Typography, Divider } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PaymentIcon from '@mui/icons-material/Payment'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontIcon from '@mui/icons-material/Storefront'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SecurityIcon from '@mui/icons-material/Security'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export default function DashboardPage() {
  const stats = [
    { icon: ShoppingBagIcon, label: 'Total Orders', value: '12', color: '#3b82f6' },
    { icon: LocalShippingIcon, label: 'In Transit', value: '2', color: '#f59e0b' },
    { icon: PaymentIcon, label: 'Total Spent', value: '$524.99', color: '#10b981' },
    { icon: TrendingUpIcon, label: 'Rewards Points', value: '2,450', color: '#8b5cf6' },
  ]

  const quickActions = [
    { icon: ShoppingBagIcon, label: 'Continue Shopping', path: '/shop', color: '#3b82f6' },
    { icon: LocalShippingIcon, label: 'Track Orders', path: '/orders', color: '#f59e0b' },
    { icon: PaymentIcon, label: 'Manage Payments', path: '/payments', color: '#10b981' },
    { icon: PersonIcon, label: 'Edit Profile', path: '/profile', color: '#8b5cf6' },
  ]

  const recentOrders = [
    { id: 'ORD-10001', status: 'Delivered', date: 'Jun 15, 2024', amount: '$129.99' },
    { id: 'ORD-10002', status: 'In Transit', date: 'Jun 18, 2024', amount: '$98.00' },
    { id: 'ORD-10003', status: 'Processing', date: 'Jun 19, 2024', amount: '$119.00' },
  ]

  const statusColors = {
    Delivered: '#10b981',
    'In Transit': '#f59e0b',
    Processing: '#3b82f6',
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          color: '#fff',
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 300,
            height: 300,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, mb: 1, opacity: 0.9 }}>
            Welcome back
          </Typography>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Your Shopping Hub
          </Typography>
          <Typography sx={{ mb: 3, opacity: 0.95, maxWidth: 500 }}>
            Manage orders, track shipments, and access your account settings all in one place.
          </Typography>
          <Button
            component={RouterLink}
            to="/shop"
            variant="contained"
            size="large"
            sx={{
              background: '#fff',
              color: '#6d28d9',
              fontWeight: 600,
              '&:hover': { background: '#f3f4f6' },
            }}
          >
            Continue Shopping <ArrowForwardIcon sx={{ ml: 1 }} />
          </Button>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  transition: 'transform 220ms ease, box-shadow 220ms ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: `${stat.color}20`,
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ color: stat.color, fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Button
                      component={RouterLink}
                      to={action.path}
                      fullWidth
                      sx={{
                        p: 2,
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        textAlign: 'left',
                        textTransform: 'none',
                        color: '#0f172a',
                        transition: 'all 220ms ease',
                        '&:hover': {
                          bgcolor: `${action.color}10`,
                          borderColor: action.color,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                        <Icon sx={{ color: action.color, fontSize: 24 }} />
                        <Typography variant="button" sx={{ fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>
                          {action.label}
                        </Typography>
                        <ArrowForwardIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                      </Box>
                    </Button>
                  </Grid>
                )
              })}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Orders
              </Typography>
              <Button
                component={RouterLink}
                to="/orders"
                variant="text"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                View all
              </Button>
            </Box>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {recentOrders.map((order, idx) => (
                <Box key={idx}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      bgcolor: '#f9fafb',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {order.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {order.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={order.status}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[order.status]}20`,
                          color: statusColors[order.status],
                          fontWeight: 600,
                          height: 24,
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                        {order.amount}
                      </Typography>
                    </Box>
                  </Box>
                  {idx < recentOrders.length - 1 && <Divider sx={{ my: 0.5 }} />}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Features Highlight */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Why shop with us?
            </Typography>
            <Grid container spacing={3}>
              {[
                { icon: SecurityIcon, title: 'Secure Checkout', desc: 'SSL encrypted payments' },
                { icon: LocalShippingIcon, title: 'Fast Shipping', desc: 'Delivery in 2-3 days' },
                { icon: PaymentIcon, title: 'Flexible Payment', desc: 'Multiple payment options' },
              ].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <Grid item xs={12} sm={4} key={idx}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          bgcolor: '#fff',
                          p: 2,
                          borderRadius: 2,
                          display: 'inline-flex',
                          mb: 1.5,
                          border: '2px solid #e5e7eb',
                        }}
                      >
                        <Icon sx={{ color: '#6d28d9', fontSize: 32 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
