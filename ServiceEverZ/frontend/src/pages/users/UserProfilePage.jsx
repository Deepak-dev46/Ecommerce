import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Button,
  TextField, Divider, CircularProgress, Skeleton, Chip, IconButton, Tooltip
} from '@mui/material';
import {
  Edit, Save, Cancel, PhotoCamera, Badge, Email,
  Phone, Business, Work, CalendarToday, Security, CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { userAxios } from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
 
const labelStyle = { fontSize: 12, color: '#6B7280', mb: 0.3, display: 'block', fontWeight: 500 };
const valueStyle = { fontWeight: 600, color: '#1B193F', fontSize: 14 };
 
const InfoBlock = ({ label, value, required }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={labelStyle}>
      {label}{required && <span style={{ color: '#E01950', marginLeft: 2 }}>*</span>}
    </Typography>
    <Typography sx={valueStyle}>{value || '—'}</Typography>
  </Box>
);
 
const SectionCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(39,35,92,0.08)', border: '1px solid #F0F0F8', mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} color="#1B193F" mb={0.5}>{title}</Typography>
        <Divider sx={{ mb: 2.5 }} />
        {children}
      </CardContent>
    </Card>
  </motion.div>
);
 
export default function UserProfilePage() {
  const { user, updateUserSession } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '' });
 
  useEffect(() => {
    fetchProfile();
  }, []);
 
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAxios.get('/api/v1/users/profile');
      setProfile(res.data);
      setForm({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        mobile: res.data.mobile,
      });
    } catch {
      setProfile(user);
      if (user) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', mobile: user.mobile || '' });
    } finally {
      setLoading(false);
    }
  };
 
  const handleSave = async () => {
    if (!form.firstName.trim()) { toast.error('First name is required'); return; }
    if (!form.lastName.trim()) { toast.error('Last name is required'); return; }
    try {
      setSaving(true);
      const res = await userAxios.put('/api/v1/users/profile', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobile: form.mobile.trim(),
      });
      setProfile(res.data);
      updateUserSession?.(res.data);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
 
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await userAxios.post('/api/v1/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = { ...profile, profilePicture: res.data?.profilePicture || res.data?.url };
      setProfile(updated);
      updateUserSession?.(updated);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };
 
  const cancelEdit = () => {
    setEditing(false);
    setForm({ firstName: profile?.firstName || '', lastName: profile?.lastName || '', mobile: profile?.mobile || '' });
  };
 
  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';
 
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F4F5F9', minHeight: '100vh' }}>
      <PageHeader
        title="My Profile"
        subtitle="View and update your personal information"
        breadcrumbs={[{ label: 'Dashboard', href: '/user/dashboard' }, { label: 'My Profile' }]}
        actions={
          !loading && (
            editing ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined" size="small"
                  startIcon={<Cancel />} onClick={cancelEdit}
                  sx={{ borderRadius: 2, borderColor: '#E01950', color: '#E01950', fontWeight: 600 }}
                >Cancel</Button>
                <Button
                  variant="contained" size="small"
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save />}
                  onClick={handleSave} disabled={saving}
                  sx={{
                    borderRadius: 2, fontWeight: 600,
                    background: 'linear-gradient(135deg,#27235C,#97247E)',
                    '&:hover': { background: 'linear-gradient(135deg,#1e1a4a,#7a1d66)' },
                  }}
                >{saving ? 'Saving...' : 'Save Changes'}</Button>
              </Box>
            ) : (
              <Button
                variant="contained" size="small"
                startIcon={<Edit />} onClick={() => setEditing(true)}
                sx={{
                  borderRadius: 2, fontWeight: 600,
                  background: 'linear-gradient(135deg,#27235C,#97247E)',
                  '&:hover': { background: 'linear-gradient(135deg,#1e1a4a,#7a1d66)' },
                }}
              >Edit Profile</Button>
            )
          )
        }
      />
 
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} md={i === 1 ? 4 : 8} key={i}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
                {[1, 2, 3, 4].map(j => <Skeleton key={j} height={40} sx={{ mb: 1 }} />)}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {/* Left — Avatar + Status */}
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(39,35,92,0.08)', border: '1px solid #F0F0F8', mb: 3 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  {/* Avatar */}
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      src={profile?.profilePicture}
                      sx={{
                        width: 100, height: 100,
                        background: 'linear-gradient(135deg,#27235C,#97247E)',
                        fontSize: 32, fontWeight: 700,
                        border: '3px solid #F0F0F8',
                        mx: 'auto',
                      }}
                    >
                      {fullName.charAt(0)}
                    </Avatar>
                    <Tooltip title="Change profile photo">
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        sx={{
                          position: 'absolute', bottom: 0, right: 0,
                          bgcolor: '#27235C', color: '#fff',
                          width: 30, height: 30,
                          '&:hover': { bgcolor: '#97247E' },
                        }}
                      >
                        {uploadingPhoto
                          ? <CircularProgress size={14} color="inherit" />
                          : <PhotoCamera sx={{ fontSize: 15 }} />}
                      </IconButton>
                    </Tooltip>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                  </Box>
 
                  <Typography variant="h6" fontWeight={700} color="#1B193F">{fullName || '—'}</Typography>
                  <Typography variant="body2" color="#6B7280" mb={1.5}>{profile?.email}</Typography>
                  <StatusChip status={profile?.status} />
 
                  <Divider sx={{ my: 2 }} />
 
                  <Box sx={{ textAlign: 'left' }}>
                    {[
                      { icon: <Badge sx={{ fontSize: 16, color: '#97247E' }} />, label: 'Employee ID', value: `#${profile?.employeeId || '—'}` },
                      { icon: <Work sx={{ fontSize: 16, color: '#97247E' }} />, label: 'Designation', value: profile?.designation?.replace(/_/g, ' ') },
                      { icon: <Business sx={{ fontSize: 16, color: '#97247E' }} />, label: 'Department', value: profile?.department?.replace(/_/g, ' ') },
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        {item.icon}
                        <Box>
                          <Typography sx={{ ...labelStyle, mb: 0 }}>{item.label}</Typography>
                          <Typography sx={{ ...valueStyle, fontSize: 13 }}>{item.value || '—'}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
 
          {/* Right — Details */}
          <Grid item xs={12} md={8}>
            {/* Personal Information */}
            <SectionCard title="Personal Information" delay={0.1}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>First Name <span style={{ color: '#E01950' }}>*</span></Typography>
                  {editing ? (
                    <TextField
                      size="small" fullWidth value={form.firstName}
                      onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  ) : <Typography sx={valueStyle}>{profile?.firstName || '—'}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>Last Name <span style={{ color: '#E01950' }}>*</span></Typography>
                  {editing ? (
                    <TextField
                      size="small" fullWidth value={form.lastName}
                      onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  ) : <Typography sx={valueStyle}>{profile?.lastName || '—'}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Employee ID" value={profile?.employeeId} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Account Status" value={profile?.status?.replace(/_/g, ' ')} />
                </Grid>
              </Grid>
            </SectionCard>
 
            {/* Contact Information */}
            <SectionCard title="Contact Information" delay={0.2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Email" value={profile?.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>Mobile</Typography>
                  {editing ? (
                    <TextField
                      size="small" fullWidth value={form.mobile}
                      onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  ) : <Typography sx={valueStyle}>{profile?.mobile || '—'}</Typography>}
                </Grid>
              </Grid>
            </SectionCard>
 
            {/* Department Details */}
            <SectionCard title="Department Details" delay={0.3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Department Name" value={profile?.department?.replace(/_/g, ' ')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Job Title (Designation)" value={profile?.designation?.replace(/_/g, ' ')} />
                </Grid>
              </Grid>
            </SectionCard>
 
            {/* Account Details */}
            <SectionCard title="Account Details" delay={0.4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Member Since" value={profile?.createdAt ? formatDate(profile.createdAt) : '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBlock label="Last Updated" value={profile?.updatedAt ? formatDate(profile.updatedAt) : '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBlock
                    label="Password Last Changed"
                    value={profile?.passwordChangedAt ? formatDate(profile.passwordChangedAt) : 'Never'}
                  />
                </Grid>
              </Grid>
 
              {editing && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={cancelEdit}
                    sx={{ borderRadius: 2, borderColor: '#E01950', color: '#E01950', fontWeight: 600 }}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained" onClick={handleSave} disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    sx={{
                      borderRadius: 2, fontWeight: 600,
                      background: 'linear-gradient(135deg,#27235C,#97247E)',
                      '&:hover': { background: 'linear-gradient(135deg,#1e1a4a,#7a1d66)' },
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
