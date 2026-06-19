import {
  Container,
  Grid,
  TextField,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Paper,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import { useCart } from "../context/CartContext";
import { Link as RouterLink } from "react-router-dom";
import { MenuItem, FormControl, Select, InputAdornment } from "@mui/material";
import { productApi } from "../api/api";
export default function BrowseProductsPage() {
  const { addProduct } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(true);
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      let { data } = await productApi.getAllProducts();
      setProducts(data.response);
    } catch (error) {
      console.err(error);
      setProducts([])
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategories, priceRange]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 200]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{ letterSpacing: 2, color: "#8b5cf6", fontWeight: 700 }}
        >
          Welcome to FastCart
        </Typography>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
          Browse Our Collection
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 600 }}>
          Discover premium products across all categories. Use search and
          filters to find exactly what you're looking for.
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
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "1rem",
              "&:hover fieldset": {
                borderColor: "#8b5cf6",
              },
            },
          }}
        />
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: "1px solid #e5e7eb",
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={selectedCategories[0] || ""}
                onChange={(e) =>
                  setSelectedCategories(e.target.value ? [e.target.value] : [])
                }
              >
                <MenuItem value="">All Categories</MenuItem>

                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Price */}
          <Grid item xs={12} sm={6} md={3}>
            <Box px={2}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ${priceRange[0]} - ${priceRange[1]}
              </Typography>

              <Slider
                value={priceRange}
                onChange={(e, value) => setPriceRange(value)}
                min={0}
                max={200}
                step={10}
                valueLabelDisplay="auto"
                sx={{
                  color: "#8b5cf6",
                }}
              />
            </Box>
          </Grid>

          {/* Reset */}
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={resetFilters}
              sx={{
                height: 56,
                borderColor: "#8b5cf6",
                color: "#8b5cf6",
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3} alignItems="stretch">
        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {filteredProducts.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                background: "linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                No products found
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 3 }}>
                Try adjusting your search or filters to find what you're looking
                for.
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
                      height: "100%",
                      width: 350,
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 220ms ease",
                      position: "relative",
                      overflow: "visible",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* <Card
                    sx={{
                      height: 480,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid #0050ef",//#e5e7eb
                      transition: "all 0.25s ease",

                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                      },
                    }}
                  > */}
                    {/* Product Image */}
                    <Box
                      sx={{
                        height: 200,
                        background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}dd 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textAlign: "center",
                        p: 2,
                        position: "relative",
                      }}
                    >
                      {/* <Box
                      sx={{
                        height: 220,
                        background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}dd 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        p: 2,
                        position: "relative",
                      }}
                    > */}
                      {/* Price Badge */}
                      <Chip
                        label={`$${product.price}`}
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: "#fff",
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      />

                      {/* Badge Ribbon */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: -8,
                          bgcolor: "#ef4444",
                          color: "#fff",
                          px: 2,
                          py: 0.5,
                          transform: "rotate(-45deg)",
                          transformOrigin: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.badge}
                      </Box>

                      {product.name}
                    </Box>

                    {/* <CardContent
                      sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                    > */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                      }}
                    >
                      {/* Category */}
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        {product.category}
                      </Typography>

                      {/* Product Name */}
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}
                      >
                        {product.name}
                      </Typography>

                      {/* Rating */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1.5,
                        }}
                      >
                        <StarIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          4.8
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 1,
                          minHeight: 66,

                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.description}
                      </Typography>

                      {/* Add to Cart Button */}
                      <Box sx={{ mt: "auto", pt: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => addProduct(product)}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            background:
                              "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)",

                            "&:hover": {
                              background:
                                "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)",
                            },
                          }}
                        >
                          Add to Cart
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Results Count */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Showing {filteredProducts.length} of {products.length} products
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

function Stack({ children, spacing, ...props }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: spacing
          ? spacing === 2
            ? "16px"
            : spacing === 3
              ? "24px"
              : spacing === 1
                ? "8px"
                : spacing
          : "8px",
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
