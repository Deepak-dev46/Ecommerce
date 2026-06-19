import { Container, Paper, Typography, Box, Button, TextField, FormControlLabel, Checkbox, Link, InputAdornment, IconButton, Divider } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Load remembered email if it exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'

    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      const success = login(email, password)

      if (success) {
        if (rememberMe) {
          localStorage.setItem('remembered_email', email)
        } else {
          localStorage.removeItem('remembered_email')
        }
        const from = location.state?.from?.pathname || '/'
        navigate(from)
      } else {
        setErrors({ general: 'Invalid email or password' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    alert('Google login would be implemented with OAuth2 integration')
  }

  const useDemoCredentials = () => {
    setEmail('demo@fastcart.com')
    setPassword('demopass')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 3,
            background: '#fff',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, mb: 1, color: '#8b5cf6', fontWeight: 700 }}>
              Member login
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Secure access to your account
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Enter your credentials or use your Google account to sign in
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                mb: 2.5,
                borderColor: '#e5e7eb',
                color: '#0f172a',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#8b5cf6',
                  bgcolor: 'rgba(139, 92, 246, 0.05)',
                },
              }}
            >
              Sign in with Google
            </Button>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                OR
              </Typography>
            </Divider>

            {/* General Error */}
            {errors.general && (
              <Box
                sx={{
                  bgcolor: '#fee2e2',
                  color: '#dc2626',
                  p: 1.5,
                  borderRadius: 1,
                  mb: 2,
                  fontSize: '0.9rem',
                }}
              >
                {errors.general}
              </Box>
            )}

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#8b5cf6',
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#8b5cf6',
                },
              }}
            />

            {/* Remember Me & Forgot Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      '&.Mui-checked': {
                        color: '#8b5cf6',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link href="#" sx={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                Forgot password?
              </Link>
            </Box>

            {/* Info Text */}
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
              Enter your business email and password to access the cart and dashboard.
            </Typography>

            {/* Login Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Demo Credentials Button */}
            <Button
              fullWidth
              variant="outlined"
              onClick={useDemoCredentials}
              disabled={loading}
              sx={{
                borderColor: '#e5e7eb',
                color: '#8b5cf6',
                fontWeight: 600,
                mb: 2,
                '&:hover': {
                  borderColor: '#8b5cf6',
                  bgcolor: 'rgba(139, 92, 246, 0.05)',
                },
              }}
            >
              Use demo credentials
            </Button>

            {/* Sign Up Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" sx={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>
                  Create one now
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2024 FastCart. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
