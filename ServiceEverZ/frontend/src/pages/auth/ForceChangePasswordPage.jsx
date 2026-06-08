// src/pages/auth/ForceChangePasswordPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Alert, CircularProgress,
  InputAdornment, IconButton, TextField,
} from '@mui/material';
import { LockReset, Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { changeFirstPassword } from '../../api/userSelfApi';
import { tokenUtils } from '../../utils/tokenUtils';
import { useAuth } from '../../context/AuthContext';

// ── Password strength helper ──────────────────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#E01950', '#E2B93B', '#27235C', '#24A148'];

// ── Requirement row ───────────────────────────────────────────────────────────
const Req = ({ met, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
    <motion.div
      animate={{ scale: met ? [1.3, 1] : 1 }}
      transition={{ duration: 0.25 }}
    >
      {met
        ? <CheckCircle sx={{ fontSize: 14, color: '#24A148' }} />
        : <Cancel sx={{ fontSize: 14, color: '#D1D5DB' }} />}
    </motion.div>
    <Typography sx={{ fontSize: '0.75rem', color: met ? '#374151' : '#9CA3AF' }}>
      {label}
    </Typography>
  </Box>
);

// ── Decorative background ─────────────────────────────────────────────────────
const Background = () => (
  <>
    <Box sx={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #F4F5F9 0%, #EEF0FF 100%)',
      zIndex: 0,
    }} />
    {/* top-right orb */}
    <motion.div
      animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'fixed', top: -120, right: -120,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(151,36,126,0.12) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
    {/* bottom-left orb */}
    <motion.div
      animate={{ y: [0, 20, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      style={{
        position: 'fixed', bottom: -100, left: -100,
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(39,35,92,0.1) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  </>
);

// ── Main component ────────────────────────────────────────────────────────────
const ForceChangePasswordPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const user = tokenUtils.getUser();
    if ((user?.roles || []).includes('ADMIN')) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(form.newPassword);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggleShow = (field) => setShow(p => ({ ...p, [field]: !p[field] }));

  const validate = () => {
    if (!form.oldPassword.trim()) return 'Current password is required';
    if (!form.newPassword.trim()) return 'New password is required';
    if (!form.confirmPassword.trim()) return 'Confirm password is required';
    if (form.newPassword !== form.confirmPassword) return 'Passwords do not match';
    if (form.oldPassword === form.newPassword) return 'New password must differ from current';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      setLoading(true);
      await changeFirstPassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (field) => (
    <InputAdornment position="end">
      <IconButton size="small" onClick={() => toggleShow(field)}
        sx={{ color: '#9CA3AF', '&:hover': { color: '#27235C' } }}>
        {show[field] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, position: 'relative' }}>
      <Background />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
      >
        {/* Header logo */}
        <motion.div variants={item}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              <Box sx={{
                width: 60, height: 60, borderRadius: '16px', mx: 'auto',
                background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(39,35,92,0.25)',
              }}>
                <LockReset sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
            </motion.div>
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1B193F', mt: 1.5, letterSpacing: '-0.02em' }}>
              ServiceEverZ
            </Typography>
          </Box>
        </motion.div>

        {/* Card */}
        <motion.div variants={item}>
          <Box sx={{
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(39,35,92,0.08)',
            border: '1px solid rgba(39,35,92,0.06)',
            overflow: 'hidden',
          }}>
            {/* Top accent */}
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #27235C, #97247E)' }} />

            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Heading */}
              <motion.div variants={item}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1,
                    background: 'linear-gradient(135deg, rgba(39,35,92,0.06), rgba(151,36,126,0.06))',
                    border: '1px solid rgba(151,36,126,0.15)',
                    borderRadius: '8px', px: 1.5, py: 0.5, mb: 1.5,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#E01950', animation: 'pulse 2s infinite' }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#97247E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      First Login Detected
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#1B193F', letterSpacing: '-0.02em' }}>
                    Set Your New Password
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', mt: 0.5, lineHeight: 1.6 }}>
                    For security, you must change your temporary password before continuing.
                  </Typography>
                </Box>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.8rem' }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Current password */}
                <motion.div variants={item}>
                  <TextField
                    fullWidth label="Current Password" name="oldPassword"
                    type={show.oldPassword ? 'text' : 'password'}
                    value={form.oldPassword} onChange={handleChange}
                    autoComplete="current-password"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#27235C', borderWidth: 2 },
                      },
                      '& label.Mui-focused': { color: '#27235C' },
                    }}
                    InputProps={{ endAdornment: eyeBtn('oldPassword') }}
                  />
                </motion.div>

                {/* New password */}
                <motion.div variants={item}>
                  <TextField
                    fullWidth label="New Password" name="newPassword"
                    type={show.newPassword ? 'text' : 'password'}
                    value={form.newPassword} onChange={handleChange}
                    autoComplete="new-password"
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#27235C', borderWidth: 2 },
                      },
                      '& label.Mui-focused': { color: '#27235C' },
                    }}
                    InputProps={{ endAdornment: eyeBtn('newPassword') }}
                  />
                </motion.div>

                {/* Strength meter */}
                <AnimatePresence>
                  {form.newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mb: 2 }}>
                        {/* Bar */}
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                          {[1, 2, 3, 4].map((s) => (
                            <motion.div
                              key={s}
                              animate={{ scaleX: strength >= s ? 1 : 0.3, opacity: strength >= s ? 1 : 0.3 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                flex: 1, height: 4, borderRadius: 4, transformOrigin: 'left',
                                background: strength >= s ? strengthColors[strength] : '#E5E7EB',
                              }}
                            />
                          ))}
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: strengthColors[strength] }}>
                          {strengthLabels[strength]}
                        </Typography>

                        {/* Requirements */}
                        <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.25 }}>
                          <Req met={form.newPassword.length >= 8} label="At least 8 characters" />
                          <Req met={/[A-Z]/.test(form.newPassword)} label="Uppercase letter" />
                          <Req met={/[0-9]/.test(form.newPassword)} label="Number" />
                          <Req met={/[^A-Za-z0-9]/.test(form.newPassword)} label="Special character" />
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Confirm password */}
                <motion.div variants={item}>
                  <TextField
                    fullWidth label="Confirm New Password" name="confirmPassword"
                    type={show.confirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={handleChange}
                    autoComplete="new-password"
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': {
                          borderColor: form.confirmPassword && form.confirmPassword === form.newPassword ? '#24A148' : '#27235C',
                          borderWidth: 2,
                        },
                      },
                      '& label.Mui-focused': { color: '#27235C' },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {form.confirmPassword && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                              >
                                {form.confirmPassword === form.newPassword
                                  ? <CheckCircle sx={{ fontSize: 16, color: '#24A148' }} />
                                  : <Cancel sx={{ fontSize: 16, color: '#E01950' }} />}
                              </motion.div>
                            )}
                            {eyeBtn('confirmPassword')}
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                {/* Submit */}
                <motion.div variants={item}>
                  <Button
                    type="submit" fullWidth disabled={loading}
                    sx={{
                      py: 1.4,
                      background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
                      color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                      boxShadow: '0 4px 16px rgba(39,35,92,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1B193F 0%, #7a1d68 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 24px rgba(39,35,92,0.35)',
                      },
                      '&:active': { transform: 'translateY(0px)' },
                      '&.Mui-disabled': { opacity: 0.6, color: '#fff' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Change Password & Continue'}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Footer */}
        <motion.div variants={item}>
          <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.72rem', color: '#C4C9D4' }}>
            © {new Date().getFullYear()} Relevantz Technology Services
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default ForceChangePasswordPage;
