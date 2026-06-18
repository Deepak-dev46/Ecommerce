import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

const formatPrice = (value) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

export default function ShopPage() {
  const { addProduct } = useCart()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="overline" sx={{ letterSpacing: 2, color: '#6366f1' }}>
          Product catalog
        </Typography>
        <Typography variant="h4">Shop our featured selections</Typography>
      </Box>

      {isMobile ? (
        <List>
          {products.map((product) => (
            <ListItem key={product.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: product.color || '#e2e8f0', color: '#0f172a' }}>
                  {product.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" sx={{ display: 'block', color: '#475569' }}>
                      {product.description}
                    </Typography>
                    <Typography component="span" variant="subtitle2" sx={{ display: 'block', fontWeight: 700, mt: 0.5 }}>
                      {formatPrice(product.price)}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" color="primary" variant="contained" onClick={() => addProduct(product)}>
                  Add
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'stretch' }}>
          {products.map((product) => (
            <Box key={product.id} sx={{ display: 'flex', position: 'relative', width: '100%' }}>
              {/* price overlay */}
              <Chip
                label={formatPrice(product.price)}
                color="secondary"
                size="small"
                sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2, fontWeight: 700 }}
              />

              {/* ribbon badge */}
              {product.badge ? (
                <Box
                  sx={{
                    position: 'absolute',
                    left: -36,
                    top: 12,
                    transform: 'rotate(-45deg)',
                    bgcolor: 'primary.main',
                    color: '#fff',
                    px: 4,
                    py: 0.5,
                    zIndex: 2,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {product.badge}
                </Box>
              ) : null}

              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  minHeight: { xs: 380, md: 460 },
                  transition: 'transform 220ms ease, box-shadow 220ms ease',
                  boxShadow: 1,
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ p: 0 }}>
                  <Box
                    sx={{
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${product.color || '#f8fafc'}, rgba(255,255,255,0.06))`,
                      color: '#0f172a',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ color: '#f59e0b', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        4.8
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#475569',
                      mb: 2,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatPrice(product.price)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ mt: 'auto', p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => addProduct(product)}
                    sx={{
                      background: 'linear-gradient(90deg,#6d28d9,#4f46e5)',
                      '&:hover': { background: 'linear-gradient(90deg,#5b21b6,#4338ca)' },
                    }}
                  >
                    Add to cart
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}
