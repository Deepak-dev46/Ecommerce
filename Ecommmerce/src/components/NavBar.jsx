import { AppBar, Badge, Box, Button, Link as MuiLink, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Profile', path: '/profile' },
    { label: 'Orders', path: '/orders' },
    { label: 'Payments', path: '/payments' },
  ]

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          color: '#fff',
          borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            py: 1.5,
          }}
        >
          {/* Logo */}
          <MuiLink component={RouterLink} to="/" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                p: 1,
                borderRadius: 1,
                display: 'flex',
              }}
            >
              <ShoppingBagIcon sx={{ color: '#fff', fontWeight: 700 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}>
              FastCart
            </Typography>
          </MuiLink>

          {/* Desktop Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, flex: 1, ml: 6 }}>
            {navLinks.map((link) => (
              <MuiLink
                key={link.path}
                component={RouterLink}
                to={link.path}
                underline="none"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                  position: 'relative',
                  transition: 'color 220ms ease',
                  '&:hover': {
                    color: '#fff',
                    '&::after': {
                      width: '100%',
                    },
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    width: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                    transition: 'width 220ms ease',
                  },
                }}
              >
                {link.label}
              </MuiLink>
            ))}
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Hi, {user.name}!
              </Typography>
            )}
            <Button
              component={RouterLink}
              to="/cart"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(139, 92, 246, 0.5)',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#8b5cf6',
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                },
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              <Badge badgeContent={itemCount} color="secondary" sx={{ mr: 1 }}>
                <ShoppingBagIcon fontSize="small" />
              </Badge>
              Cart
            </Button>
            {user ? (
              <Button
                onClick={handleLogout}
                variant="contained"
                size="small"
                sx={{
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)',
                  },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                sx={{
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Login
              </Button>
            )}
            {/* Mobile Menu */}
            <Button
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            marginTop: '64px',
          },
        }}
      >
        <List sx={{ p: 2 }}>
          {navLinks.map((link) => (
            <ListItem
              button
              component={RouterLink}
              to={link.path}
              key={link.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                color: '#fff',
                borderRadius: 1,
                mb: 1,
                '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.15)' },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
          <ListItem
            button
            component={RouterLink}
            to="/cart"
            onClick={() => setMobileOpen(false)}
            sx={{ color: '#fff', borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.15)' } }}
          >
            <ListItemText primary={`Cart (${itemCount})`} />
          </ListItem>
        </List>
      </Drawer>
    </>
  )
}
