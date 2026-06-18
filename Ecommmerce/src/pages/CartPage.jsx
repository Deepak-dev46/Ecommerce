import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  TextField,
  Chip,
  Paper,
  Alert,
} from '@mui/material'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlineOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import DiscountIcon from '@mui/icons-material/Discount'
import SecurityIcon from '@mui/icons-material/Security'
import { useCart } from '../context/CartContext'
import { Link as RouterLink } from 'react-router-dom'
import { useState } from 'react'

const formatPrice = (value) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

export default function CartPage() {
  const { cartItems, addProduct, removeProduct, total, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const cartProducts = Object.values(cartItems)

  const shippingCost = total > 100 ? 0 : 10
  const taxRate = 0.08
  const taxAmount = (total - total * (discountPercent / 100)) * taxRate
  const finalTotal = (total - total * (discountPercent / 100)) + taxAmount + shippingCost

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscountPercent(10)
    } else if (couponCode.toUpperCase() === 'SAVE20') {
      setDiscountPercent(20)
    } else {
      setDiscountPercent(0)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ letterSpacing: 2, color: '#8b5cf6', fontWeight: 700 }}>
          Shopping Cart
        </Typography>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {cartProducts.length === 0 ? 'Your cart is empty' : `You have ${cartProducts.length} item${cartProducts.length !== 1 ? 's' : ''}`}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Review and manage your selected items before checkout
        </Typography>
      </Box>

      {cartProducts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)' }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Your cart is empty
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Add products from the shop page to get started with your shopping experience.
          </Typography>
          <Button component={RouterLink} to="/shop" variant="contained" size="large" sx={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {/* Promo Banner */}
              <Alert severity="info" sx={{ mb: 1 }}>
                💡 Use coupon <strong>SAVE10</strong> or <strong>SAVE20</strong> for discounts!
              </Alert>

              {/* Cart Items */}
              {cartProducts.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    transition: 'all 220ms ease',
                    '&:hover': { transform: 'translateX(4px)', boxShadow: 3 },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                      {/* Product Image Placeholder */}
                      <Box
                        sx={{
                          width: { xs: 100, md: 120 },
                          height: 120,
                          background: `linear-gradient(135deg, ${item.color || '#8b5cf6'} 0%, ${item.color || '#7c3aed'}dd 100%)`,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          p: 1,
                          flexShrink: 0,
                        }}
                      >
                        {item.name}
                      </Box>

                      {/* Product Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                            {item.category}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                            Unit Price: {formatPrice(item.price)}
                          </Typography>
                          <Chip
                            icon={<LocalShippingIcon />}
                            label="Est. Delivery: Jun 25-27"
                            size="small"
                            sx={{ bgcolor: '#f0fdf4', color: '#10b981' }}
                          />
                        </Box>

                        {/* Quantity Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => removeProduct(item.id)}
                              sx={{
                                '&:hover': { bgcolor: '#fee2e2' },
                              }}
                            >
                              <RemoveCircleOutlineIcon sx={{ fontSize: 24, color: '#ef4444' }} />
                            </IconButton>
                            <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => addProduct(item)}
                              sx={{
                                '&:hover': { bgcolor: '#dcfce7' },
                              }}
                            >
                              <AddCircleOutlineIcon sx={{ fontSize: 24, color: '#10b981' }} />
                            </IconButton>
                          </Box>

                          {/* Price and Delete */}
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 100, textAlign: 'right' }}>
                              {formatPrice(item.price * item.quantity)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeProduct(item.id)}
                              sx={{
                                '&:hover': { bgcolor: '#fee2e2' },
                              }}
                            >
                              <DeleteIcon sx={{ color: '#ef4444' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Continue Shopping Button */}
              <Button component={RouterLink} to="/shop" variant="text" sx={{ mt: 2 }}>
                ← Continue Shopping
              </Button>
            </Stack>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* Coupon Section */}
              <Card sx={{ border: '2px solid #e5e7eb' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DiscountIcon sx={{ color: '#8b5cf6' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Apply Coupon
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" onClick={handleApplyCoupon} size="small">
                      Apply
                    </Button>
                  </Box>
                  {discountPercent > 0 && (
                    <Chip label={`${discountPercent}% saved!`} color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card sx={{ border: '2px solid #8b5cf6' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Price Breakdown */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatPrice(total)}
                      </Typography>
                    </Box>

                    {discountPercent > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#10b981' }}>
                          Discount ({discountPercent}%)
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                          -{formatPrice(total * (discountPercent / 100))}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Shipping</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: shippingCost === 0 ? '#10b981' : 'inherit' }}>
                        {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Tax ({(taxRate * 100).toFixed(0)}%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatPrice(taxAmount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                      {formatPrice(finalTotal)}
                    </Typography>
                  </Box>

                  {/* Checkout Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Proceed to Checkout
                  </Button>

                  {/* Security Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                    <SecurityIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Secure checkout powered by SSL
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Clear Cart */}
              <Button variant="outlined" color="error" fullWidth onClick={clearCart}>
                Clear Cart
              </Button>

              {/* Shipping Info */}
              <Paper sx={{ p: 2, background: '#f0fdf4' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <LocalShippingIcon sx={{ color: '#10b981', fontSize: 20, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981', mb: 0.5 }}>
                      Free shipping available
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {total > 100 ? 'Applied to your order!' : `Add ${formatPrice(100 - total)} more for free shipping`}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}
