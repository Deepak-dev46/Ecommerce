import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  Tab,
  Tabs,
  Paper,
} from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CancelIcon from '@mui/icons-material/Cancel'
import MoreVertIcon from '@mui/icons-material/MoreVert'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState(0)

  const allOrders = [
    {
      id: 'ORD-10001',
      date: '2024-06-15',
      status: 'Delivered',
      total: 129.99,
      items: [
        { name: 'Flex Runner Sneakers', qty: 1, price: 79.99 },
        { name: 'AeroFit Hoodie', qty: 1, price: 49.99 },
      ],
      progress: 100,
      expectedDate: '2024-06-18',
    },
    {
      id: 'ORD-10002',
      date: '2024-06-18',
      status: 'In Transit',
      total: 98.0,
      items: [{ name: 'Metro Travel Bag', qty: 1, price: 98.0 }],
      progress: 66,
      expectedDate: '2024-06-22',
    },
    {
      id: 'ORD-10003',
      date: '2024-06-19',
      status: 'Processing',
      total: 119.0,
      items: [{ name: 'Classic Denim Jacket', qty: 1, price: 119.0 }],
      progress: 33,
      expectedDate: '2024-06-25',
    },
    {
      id: 'ORD-10004',
      date: '2024-06-10',
      status: 'Cancelled',
      total: 65.0,
      items: [{ name: 'Everyday Backpack', qty: 1, price: 65.0 }],
      progress: 0,
      expectedDate: null,
    },
  ]

  const tabs = ['All', 'Processing', 'In Transit', 'Delivered', 'Cancelled']
  const statusColors = {
    Delivered: '#10b981',
    'In Transit': '#f59e0b',
    Processing: '#3b82f6',
    Cancelled: '#ef4444',
  }
  const statusIcons = {
    Delivered: <CheckCircleIcon />,
    'In Transit': <LocalShippingIcon />,
    Processing: <HourglassEmptyIcon />,
    Cancelled: <CancelIcon />,
  }

  const filteredOrders =
    activeTab === 0
      ? allOrders
      : allOrders.filter((o) => o.status === tabs[activeTab])

  const getSteps = (status) => {
    const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered']
    const stepMap = {
      Processing: 1,
      'In Transit': 2,
      Delivered: 3,
      Cancelled: 0,
    }
    return stepMap[status] || 0
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2, fontSize: '0.85rem' }}>
          Your Account
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Your Orders
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4, border: '1px solid #e5e7eb' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          sx={{
            '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #6d28d9, #4f46e5)' },
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab}
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: activeTab === idx ? 600 : 400,
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Orders List */}
      {activeTab === 0 ? (
        <Grid container spacing={3}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Grid item xs={12} sm={6} md={3} key={order.id}>
              <Card
                sx={{
                  p: 0,
                  transition: 'box-shadow 220ms ease, transform 220ms ease',
                  '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ pb: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Grid Card Header */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
                        {order.id}
                      </Typography>
                      <Chip
                        label={order.status}
                        icon={statusIcons[order.status]}
                        size="small"
                        sx={{
                          bgcolor: statusColors[order.status],
                          color: '#fff',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: '#fff' },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>

                  {/* Items Summary */}
                  <Box sx={{ mb: 1.5, flex: 1 }}>
                    {order.items.slice(0, 2).map((item, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#475569', mb: 0.5 }}>
                        {item.name}
                      </Typography>
                    ))}
                    {order.items.length > 2 && (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        +{order.items.length - 2} more
                      </Typography>
                    )}
                  </Box>

                  {/* Expected Delivery */}
                  {order.expectedDate && order.status !== 'Delivered' && (
                    <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600, mb: 1, display: 'block' }}>
                      Est: {new Date(order.expectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ${order.total.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Button fullWidth variant="outlined" size="small" sx={{ mt: 1.5, textTransform: 'none' }}>
                    Track Order
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb' }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No orders found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                You don't have any {tabs[activeTab].toLowerCase()} orders yet.
              </Typography>
            </Paper>
          </Grid>
        )}
        </Grid>
      ) : (
        <Grid container spacing={3}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card
                sx={{
                  p: 0,
                  transition: 'box-shadow 220ms ease',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <CardContent sx={{ pb: 2 }}>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {order.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={statusIcons[order.status]}
                        label={order.status}
                        sx={{
                          bgcolor: statusColors[order.status],
                          color: '#fff',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: '#fff' },
                        }}
                      />
                      <Button size="small" sx={{ minWidth: 40, p: 1 }}>
                        <MoreVertIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Progress Stepper */}
                  {order.status !== 'Cancelled' && (
                    <Box sx={{ mb: 3 }}>
                      <Stepper
                        activeStep={getSteps(order.status)}
                        sx={{
                          '& .MuiStepLabel-label': { fontSize: '0.75rem' },
                          '& .MuiStepIcon-root': { fontSize: '1.5rem' },
                        }}
                      >
                        <Step>
                          <StepLabel>Order Placed</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Processing</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Shipped</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Delivered</StepLabel>
                        </Step>
                      </Stepper>
                    </Box>
                  )}

                  {/* Expected Delivery */}
                  {order.expectedDate && order.status !== 'Delivered' && (
                    <Box sx={{ p: 1.5, bgcolor: '#f0f9ff', borderRadius: 1, mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#0369a1' }}>
                        Expected Delivery:{' '}
                        {new Date(order.expectedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  )}

                  {/* Items Table */}
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {order.items.map((item, idx) => (
                          <TableCell key={idx} colSpan={3} sx={{ borderBottom: 'none', p: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  Qty: {item.qty}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${item.price.toFixed(2)}
                              </Typography>
                            </Box>
                          </TableCell>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        ${order.total.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small" sx={{ borderRadius: 1 }}>
                        Track Order
                      </Button>
                      <Button variant="text" size="small">
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb' }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No orders found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                You don't have any {tabs[activeTab].toLowerCase()} orders yet.
              </Typography>
            </Paper>
          </Grid>
        )}
        </Grid>
      )}
    </Container>
  )
}
