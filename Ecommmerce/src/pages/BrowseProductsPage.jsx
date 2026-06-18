import { Container, Grid, TextField, Box, Button, Typography, Card, CardContent, Chip, Paper, Checkbox, FormGroup, FormControlLabel, Slider } from '@mui/material'
import { useState, useMemo } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import StarIcon from '@mui/icons-material/Star'
import { useCart } from '../context/CartContext'
import { Link as RouterLink } from 'react-router-dom'
import products from '../data/products'

export default function BrowseProductsPage() {
  const { addProduct } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [showFilters, setShowFilters] = useState(true)

  const categories = [...new Set(products.map((p) => p.category))]

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category)

      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [searchQuery, selectedCategories, priceRange])

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setPriceRange([0, 200])
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ letterSpacing: 2, color: '#8b5cf6', fontWeight: 700 }}>
          Welcome to FastCart
        </Typography>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
          Browse Our Collection
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 600 }}>
          Discover premium products across all categories. Use search and filters to find exactly what you're looking for.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search products by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '1rem',
              '&:hover fieldset': {
                borderColor: '#8b5cf6',
              },
            },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Filters */}
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
            </Box>
            <Button size="small" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide' : 'Show'}
            </Button>
          </Box>

          {showFilters && (
            <Stack spacing={3}>
              {/* Categories */}
              <Paper sx={{ p: 2, border: '1px solid #e5e7eb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Categories
                </Typography>
                <FormGroup>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                        />
                      }
                      label={category}
                      sx={{
                        '& .MuiCheckbox-root': {
                          '&.Mui-checked': {
                            color: '#8b5cf6',
                          },
                        },
                      }}
                    />
                  ))}
                </FormGroup>
              </Paper>

              {/* Price Range */}
              <Paper sx={{ p: 2, border: '1px solid #e5e7eb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Price Range
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={priceRange}
                    onChange={(e, newValue) => setPriceRange(newValue)}
                    min={0}
                    max={200}
                    step={10}
                    marks={[
                      { value: 0, label: '$0' },
                      { value: 200, label: '$200' },
                    ]}
                    valueLabelDisplay="auto"
                    sx={{
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#8b5cf6',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#8b5cf6',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    ${priceRange[0]} - ${priceRange[1]}
                  </Typography>
                </Box>
              </Paper>

              {/* Reset Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={resetFilters}
                sx={{
                  borderColor: '#8b5cf6',
                  color: '#8b5cf6',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    bgcolor: 'rgba(139, 92, 246, 0.05)',
                  },
                }}
              >
                Reset Filters
              </Button>
            </Stack>
          )}
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {filteredProducts.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                No products found
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Try adjusting your search or filters to find what you're looking for.
              </Typography>
              <Button variant="outlined" onClick={resetFilters}>
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 220ms ease',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      sx={{
                        height: 200,
                        background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        p: 2,
                        position: 'relative',
                      }}
                    >
                      {/* Price Badge */}
                      <Chip
                        label={`$${product.price}`}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: '#fff',
                          color: '#0f172a',
                          fontWeight: 700,
                        }}
                      />

                      {/* Badge Ribbon */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: -8,
                          bgcolor: '#ef4444',
                          color: '#fff',
                          px: 2,
                          py: 0.5,
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'left',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.badge}
                      </Box>

                      {product.name}
                    </Box>

                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Category */}
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
                        {product.category}
                      </Typography>

                      {/* Product Name */}
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>

                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          4.8
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
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

                      {/* Add to Cart Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => addProduct(product)}
                        sx={{
                          background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                          fontWeight: 600,
                          mt: 'auto',
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Results Count */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Showing {filteredProducts.length} of {products.length} products
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

function Stack({ children, spacing, ...props }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing ? (spacing === 2 ? '16px' : spacing === 3 ? '24px' : spacing === 1 ? '8px' : spacing) : '8px',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
