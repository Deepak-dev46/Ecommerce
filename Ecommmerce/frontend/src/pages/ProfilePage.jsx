import { Container, Paper, Typography, Box, Button, Grid, Card, CardContent, Avatar, Divider, TextField, Chip, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import VerifiedIcon from '@mui/icons-material/Verified'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PaymentIcon from '@mui/icons-material/Payment'

export default function ProfilePage() {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: user?.email || 'demo@fastcart.com',
    phone: '+1 (555) 123-4567',
    address: '123 Shopping Street, Commerce City, CC 12345',
  })

  const [tempData, setTempData] = useState(formData)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleEdit = () => {
    setTempData(formData)
    setEditMode(true)
  }

  const handleSave = () => {
    setFormData(tempData)
    setEditMode(false)
  }

  const handleCancel = () => {
    setTempData(formData)
    setEditMode(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTempData((prev) => ({ ...prev, [name]: value }))
  }

  const stats = [
    { icon: ShoppingBagIcon, label: 'Total Orders', value: '12' },
    { icon: LocalShippingIcon, label: 'Delivered', value: '11' },
    { icon: PaymentIcon, label: 'Total Spent', value: '$524.99' },
  ]

  const savedAddresses = [
    { label: 'Home', address: '123 Shopping Street, Commerce City, CC 12345', phone: '+1 (555) 123-4567' },
    { label: 'Office', address: '456 Business Avenue, Corporate Town, CT 67890', phone: '+1 (555) 987-6543' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Profile Header */}
      <Paper sx={{ p: { xs: 3, md: 5 }, mb: 4, background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: { xs: 80, md: 120 },
              height: { xs: 80, md: 120 },
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              position: 'relative',
            }}
          >
            {formData.name.charAt(0).toUpperCase()}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: '#fff',
                border: '3px solid #fff',
                borderRadius: '50%',
                p: 0.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <EditIcon sx={{ fontSize: 20, color: '#6d28d9' }} />
            </Box>
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formData.name}
              </Typography>
              <VerifiedIcon sx={{ color: '#10b981', fontSize: 24 }} />
            </Box>
            <Typography sx={{ color: 'text.secondary', mb: 1 }}>
              Member since June 2024
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Verified Email" color="success" variant="outlined" size="small" />
              <Chip label="Verified Phone" color="success" variant="outlined" size="small" />
              <Chip label="Premium Member" color="primary" variant="outlined" size="small" />
            </Box>
          </Box>

          <Button
            onClick={editMode ? handleSave : handleEdit}
            variant="contained"
            startIcon={editMode ? <SaveIcon /> : <EditIcon />}
            sx={{
              background: editMode ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            {editMode ? 'Save' : 'Edit'}
          </Button>
          {editMode && (
            <Button onClick={handleCancel} variant="outlined" startIcon={<CancelIcon />}>
              Cancel
            </Button>
          )}
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ bgcolor: 'rgba(139, 92, 246, 0.15)', p: 1, borderRadius: 1 }}>
                    <Icon sx={{ color: '#8b5cf6' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid #e5e7eb' }}>
          <Tab label="Personal Info" />
          <Tab label="Addresses" />
          <Tab label="Security" />
          <Tab label="Preferences" />
        </Tabs>

        {/* Personal Info Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={tempData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fieldset: { borderColor: editMode ? '#8b5cf6' : '#e5e7eb' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={tempData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fieldset: { borderColor: editMode ? '#8b5cf6' : '#e5e7eb' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={tempData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fieldset: { borderColor: editMode ? '#8b5cf6' : '#e5e7eb' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={tempData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fieldset: { borderColor: editMode ? '#8b5cf6' : '#e5e7eb' },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Addresses Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Button variant="contained" sx={{ mb: 3, background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              Add New Address
            </Button>
            <Grid container spacing={2}>
              {savedAddresses.map((addr, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card sx={{ border: '2px solid #e5e7eb', '&:hover': { borderColor: '#8b5cf6' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                        <Chip label={addr.label} color="primary" size="small" />
                        <Button size="small" variant="text">
                          Edit
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <LocationOnIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                        <Typography variant="body2">{addr.address}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <PhoneIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                        <Typography variant="body2">{addr.phone}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Security Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Password
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Last changed 3 months ago
                    </Typography>
                  </Box>
                  <Button variant="outlined">Change Password</Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Enhance your account security
                    </Typography>
                  </Box>
                  <Button variant="outlined">Enable 2FA</Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Active Sessions
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Manage your logged-in devices
                    </Typography>
                  </Box>
                  <Button variant="outlined">View Sessions</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Preferences Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Email Notifications
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Receive order and promotional emails
                    </Typography>
                  </Box>
                  <Button variant="outlined">Customize</Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Marketing Preferences
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Manage promotional content
                    </Typography>
                  </Box>
                  <Button variant="outlined">Manage</Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Data & Privacy
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Download or delete your data
                    </Typography>
                  </Box>
                  <Button variant="outlined">Manage</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
