import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  IconButton, InputAdornment, Divider, LinearProgress, Alert,
  CircularProgress, Skeleton,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, CheckCircle, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { userAxios } from '../../api/axiosInstance';
import PageHeader from '../../components/common/PageHeader';
 
// ─── Strength levels (unchanged) ─────────────────────────────────────────────
const strengthLevels = [
  { label: 'Very Weak', color: '#E01950', min: 0  },
  { label: 'Weak',      color: '#ff6b35', min: 20 },
  { label: 'Fair',      color: '#f59e0b', min: 40 },
  { label: 'Good',      color: '#3b82f6', min: 60 },
  { label: 'Strong',    color: '#22c55e', min: 80 },
];
 
// ─── Strength score driven by policy (not hardcoded) ─────────────────────────
function calcStrength(pwd, policy) {
  if (!pwd || !policy) return 0;
  let score = 0;
  if (pwd.length >= policy.minLength)                        score += 20;
  if (pwd.length >= Math.max(policy.minLength + 4, 12))     score += 10;
  if (!policy.requireUppercase || /[A-Z]/.test(pwd))        score += 20;
  if (!policy.requireLowercase || /[a-z]/.test(pwd))        score += 15;
  if (!policy.requireDigit    || /\d/.test(pwd))            score += 20;
  if (!policy.requireSpecialChar || /[^A-Za-z0-9]/.test(pwd)) score += 15;
  return Math.min(100, score);
}
 
const CheckRow = ({ label, met }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
    {met
      ? <CheckCircle sx={{ fontSize: 14, color: '#22c55e' }} />
      : <Cancel     sx={{ fontSize: 14, color: '#d1d5db' }} />}
    <Typography variant="caption" color={met ? '#22c55e' : '#9ca3af'}>{label}</Typography>
  </Box>
);
 
// ─── Default fallback policy (used only if API call fails) ───────────────────
const DEFAULT_POLICY = {
  minLength:          8,
  requireUppercase:   true,
  requireLowercase:   true,
  requireDigit:       true,
  requireSpecialChar: true,
};
 
export default function ChangePasswordPage() {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow]     = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
 
  // ── Policy state ──────────────────────────────────────────────────────────
  const [policy, setPolicy]         = useState(null);   // null = not loaded yet
  const [policyLoading, setPolicyLoading] = useState(true);
 
  // ── Fetch policy from backend on mount ────────────────────────────────────
  useEffect(() => {
    userAxios.get('/api/v1/users/password-policy')
      .then(res => setPolicy(res.data))
      .catch(() => setPolicy(DEFAULT_POLICY))   // graceful fallback
      .finally(() => setPolicyLoading(false));
  }, []);
 
  // ── Strength & checks (driven by fetched policy) ─────────────────────────
  const activePolicy   = policy || DEFAULT_POLICY;
  const strength       = calcStrength(form.newPassword, activePolicy);
  const strengthLevel  = strengthLevels.filter(l => strength >= l.min).pop();
 
  const checks = {
    // Always check length (uses policy.minLength)
    length: form.newPassword.length >= activePolicy.minLength,
    // Only check if policy requires it
    upper:  !activePolicy.requireUppercase  || /[A-Z]/.test(form.newPassword),
    lower:  !activePolicy.requireLowercase  || /[a-z]/.test(form.newPassword),
    digit:  !activePolicy.requireDigit      || /\d/.test(form.newPassword),
    special:!activePolicy.requireSpecialChar|| /[^A-Za-z0-9]/.test(form.newPassword),
    match:  form.newPassword && form.newPassword === form.confirmPassword,
  };
 
  // Build only the requirement rows that are ACTIVE in the policy
  const requirementRows = [
    { key: 'length',  label: `At least ${activePolicy.minLength} characters`,  met: checks.length,  always: true },
    { key: 'upper',   label: 'At least one uppercase letter',                   met: checks.upper,   show: activePolicy.requireUppercase  },
    { key: 'lower',   label: 'At least one lowercase letter',                   met: checks.lower,   show: activePolicy.requireLowercase  },
    { key: 'digit',   label: 'At least one number',                             met: checks.digit,   show: activePolicy.requireDigit      },
    { key: 'special', label: 'At least one special character',                  met: checks.special, show: activePolicy.requireSpecialChar },
  ].filter(r => r.always || r.show);
 
  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    if (!form.currentPassword) {
      setError('Current password is required');
      return;
    }
    // Validate all active policy checks
    const failedCheck = requirementRows.find(r => !r.met);
    if (failedCheck) {
      setError(failedCheck.label + ' is required');
      return;
    }
    if (!checks.match) {
      setError('Passwords do not match');
      return;
    }
 
    try {
      setLoading(true);
      await userAxios.post('/api/v1/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
 
  const toggle = (field) => setShow(p => ({ ...p, [field]: !p[field] }));
 
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F4F5F9', minHeight: '100vh' }}>
      <PageHeader
        title="Change Password"
        subtitle="Update your account password"
        breadcrumbs={[
          { label: 'Dashboard', href: '/user/dashboard' },
          { label: 'Change Password' },
        ]}
      />
 
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(39,35,92,0.08)', border: '1px solid #F0F0F8' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  background: 'linear-gradient(135deg,#27235C,#97247E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Lock sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#1B193F">Update Password</Typography>
              </Box>
              <Typography variant="body2" color="#6B7280" mb={3}>
                Choose a strong password. You'll be asked to log in again after changing it.
              </Typography>
 
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
 
              {/* Current Password */}
              <TextField
                label="Current Password" type={show.current ? 'text' : 'password'}
                fullWidth size="small" sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                value={form.currentPassword}
                onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => toggle('current')}>
                        {show.current ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
 
              <Divider sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="#6B7280">New Password</Typography>
              </Divider>
 
              {/* New Password */}
              <TextField
                label="New Password" type={show.new ? 'text' : 'password'}
                fullWidth size="small" sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                value={form.newPassword}
                onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => toggle('new')}>
                        {show.new ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
 
              {/* Strength Bar */}
              {form.newPassword && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="#6B7280">Password Strength</Typography>
                    <Typography variant="caption" fontWeight={600} color={strengthLevel?.color}>
                      {strengthLevel?.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate" value={strength}
                    sx={{
                      borderRadius: 4, height: 6, bgcolor: '#F0F0F8',
                      '& .MuiLinearProgress-bar': { bgcolor: strengthLevel?.color, borderRadius: 4 },
                    }}
                  />
                </Box>
              )}
 
              {/* ── Password Requirements (dynamic) ── */}
              <Box sx={{ bgcolor: '#F8F8FC', borderRadius: 2, p: 2, mb: 2.5 }}>
                <Typography variant="caption" fontWeight={600} color="#1B193F" display="block" mb={1}>
                  Password Requirements
                </Typography>
 
                {/* Show skeleton while policy is loading */}
                {policyLoading
                  ? [1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} height={20} sx={{ mb: 0.5 }} />
                  ))
                  : requirementRows.map(r => (
                    <CheckRow key={r.key} label={r.label} met={r.met} />
                  ))
                }
              </Box>
 
              {/* Confirm Password */}
              <TextField
                label="Confirm New Password" type={show.confirm ? 'text' : 'password'}
                fullWidth size="small" sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                error={!!form.confirmPassword && !checks.match}
                helperText={form.confirmPassword && !checks.match ? 'Passwords do not match' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => toggle('confirm')}>
                        {show.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
 
              <Button
                variant="contained" fullWidth size="large"
                onClick={handleSubmit} disabled={loading || policyLoading}
                sx={{
                  borderRadius: 2, fontWeight: 700, py: 1.2,
                  background: 'linear-gradient(135deg,#27235C,#97247E)',
                  '&:hover': { background: 'linear-gradient(135deg,#1e1a4a,#7a1d66)' },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}