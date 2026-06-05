// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Lock, Email, AdminPanelSettings,
  ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence, resolveElements } from 'framer-motion';
import { loginSchema } from '../../validations/loginSchema';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
 
// ── Floating orb component ────────────────────────────────────────────────────
const Orb = ({ style }) => (
  <motion.div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      opacity: 0.18,
      pointerEvents: 'none',
      ...style,
    }}
    animate={{
      y: [0, -28, 0],
      x: [0, 14, 0],
      scale: [1, 1.08, 1],
    }}
    transition={{
      duration: style.duration || 7,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: style.delay || 0,
    }}
  />
);
 
// ── Animated grid dots ────────────────────────────────────────────────────────
const GridDots = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);
 
// ── Diagonal wave divider ─────────────────────────────────────────────────────
const WaveDivider = () => (
  <svg
    viewBox="0 0 120 800"
    preserveAspectRatio="none"
    style={{
      position: 'absolute',
      right: -2,
      top: 0,
      height: '100%',
      width: 120,
      zIndex: 2,
    }}
  >
    <path
      d="M120,0 C80,100 40,200 70,400 C100,600 50,700 120,800 L120,800 L120,0 Z"
      fill="#F4F5F9"
    />
  </svg>
);
 
// ── Stat badge ────────────────────────────────────────────────────────────────
const StatBadge = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12,
      padding: '12px 20px',
      backdropFilter: 'blur(8px)',
      flex: 1,
      textAlign: 'center',
    }}
  >
    <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', marginTop: 4 }}>{label}</div>
  </motion.div>
);
 
// ── Custom input field ────────────────────────────────────────────────────────
const AuthField = ({ label, type, register, error, helperText, startIcon, endAction, autoComplete }) => {
  const [focused, setFocused] = useState(false);
 
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', mb: 0.75, letterSpacing: '0.02em' }}>
        {label}
      </Typography>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        border: '1.5px solid',
        borderColor: error ? '#E01950' : focused ? '#27235C' : '#E5E7EB',
        borderRadius: '10px',
        px: 1.5, py: 0,
        backgroundColor: focused ? '#FAFBFF' : '#fff',
        transition: 'all 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(39,35,92,0.1)' : 'none',
      }}>
        <Box sx={{ color: focused ? '#27235C' : '#9CA3AF', display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}>
          {startIcon}
        </Box>
        <Box
          component="input"
          {...register}
          type={type}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          sx={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.875rem', color: '#1B193F', py: 1.3,
            fontFamily: '"Inter", sans-serif',
            '&::placeholder': { color: '#C4C9D4' },
          }}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        {endAction}
      </Box>
      {helperText && (
        <Typography sx={{ fontSize: '0.72rem', color: '#E01950', mt: 0.5, ml: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
 
// ── Main LoginPage ────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });
 
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data);
      const response = res.data;
 
      if (response.requiresOtp) {
        navigate('/verify-otp', { state: { email: data.email } });
        return;
      }
 
      login(response, response.token);
     
 
      if (response.firstLogin) {
        navigate('/force-change-password', { replace: true });
        return;
      }
      let resp=await userApi.setActive(data.email);
      console.log(resp);
     
      const roles = response.roles || [];
      if      (roles.includes('ADMIN'))               navigate('/dashboard');
      else if (roles.includes('RMO'))                 navigate('/rmo/dashboard');
      else if (roles.includes('ITSM_MANAGER'))        navigate('/itsm/dashboard');
      else if (roles.includes('SUPPORT_PERSONNEL'))   navigate('/support/dashboard');
      else if (roles.includes('END_USER')) {
        const effective = response.effectiveRoles || [];
        if      (effective.includes('APPROVAL_MANAGER_L1')) navigate('/l1/approvals');
        else if (effective.includes('APPROVAL_MANAGER_L2')) navigate('/l2/approvals');
        else if (effective.includes('RESOURCE_OWNER'))      navigate('/resource-owner/dashboard');
        else if (effective.includes('ITSM_MANAGER'))        navigate('/itsm/dashboard');
        else                                                navigate('/user/dashboard');
      }
 
      else navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
 
  // stagger children
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };
 
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: '"Inter", sans-serif' }}>
 
      {/* ── LEFT BRAND PANEL ── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '46%',
        background: 'linear-gradient(160deg, #1B193F 0%, #27235C 45%, #3D2270 75%, #97247E 100%)',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 7, py: 8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <GridDots />
        <WaveDivider />
 
        {/* Orbs */}
        <Orb style={{ width: 320, height: 320, top: -80, right: -60, background: '#97247E', duration: 9, delay: 0 }} />
        <Orb style={{ width: 260, height: 260, bottom: -60, left: -60, background: '#27235C', duration: 11, delay: 2 }} />
        <Orb style={{ width: 180, height: 180, top: '45%', right: '20%', background: '#AC5098', duration: 7, delay: 1 }} />
 
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'backOut' }}
          style={{ position: 'relative', zIndex: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{
              width: 58, height: 58, borderRadius: '16px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <AdminPanelSettings sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                ServiceEverZ
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', mt: 0.3 }}>
                Ticket Management System
              </Typography>
            </Box>
          </Box>
 
          <Typography sx={{
            color: '#fff', fontWeight: 800,
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            lineHeight: 1.2, mb: 2, letterSpacing: '-0.03em',
          }}>
            Manage. Track.{'\n'}
            <Box component="span" sx={{
              background: 'linear-gradient(90deg, #AC5098, #E879C0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Resolve.
            </Box>
          </Typography>
 
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.7, mb: 6, maxWidth: 340 }}>
            One unified platform for IT service management, approvals, and real‑time ticket resolution across your organization.
          </Typography>
 
     
 
          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
          </motion.div>
        </motion.div>
      </Box>
 
      {/* ── RIGHT FORM PANEL ── */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #F4F5F9 0%, #EEF0FF 100%)',
        px: { xs: 2, sm: 5 }, py: 4,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle bg circle */}
        <Box sx={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(151,36,126,0.06) 0%, transparent 70%)',
          top: -100, right: -100, pointerEvents: 'none',
        }} />
 
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          {/* Mobile logo */}
          <motion.div variants={childVariants}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: '12px',
                background: 'linear-gradient(135deg, #27235C, #97247E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(39,35,92,0.3)',
              }}>
                <AdminPanelSettings sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#1B193F', letterSpacing: '-0.02em' }}>
                ServiceEverZ
              </Typography>
            </Box>
          </motion.div>
 
          {/* Card */}
          <motion.div variants={childVariants}>
            <Box sx={{
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 4px 24px rgba(39,35,92,0.08), 0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid rgba(39,35,92,0.06)',
              p: { xs: 3, sm: 4 },
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Top accent bar */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #27235C 0%, #97247E 100%)',
              }} />
 
              {/* Header */}
              <motion.div variants={childVariants}>
                <Box sx={{ mb: 3.5, mt: 0.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#1B193F', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                    Welcome back
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mt: 0.5 }}>
                    Sign in to{' '}
                    <Box component="span" sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #27235C, #97247E)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      ServiceEverZ
                    </Box>
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
                    <Alert
                      severity="error"
                      sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.8rem', border: '1px solid #FECDD3' }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
 
              {/* Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <motion.div variants={childVariants}>
                  <AuthField
                    label="Email Address"
                    type="email"
                    register={register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    autoComplete="email"
                    startIcon={<Email sx={{ fontSize: 18 }} />}
                  />
                </motion.div>
 
                <motion.div variants={childVariants}>
                  <AuthField
                    label="Password"
                    type={showPwd ? 'text' : 'password'}
                    register={register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    autoComplete="current-password"
                    startIcon={<Lock sx={{ fontSize: 18 }} />}
                    endAction={
                      <IconButton size="small" onClick={() => setShowPwd(p => !p)} sx={{ color: '#9CA3AF', '&:hover': { color: '#27235C' }, p: 0.5 }}>
                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    }
                  />
                </motion.div>
 
                {/* Forgot password */}
                <motion.div variants={childVariants}>
                  <Box sx={{ textAlign: 'right', mt: -1, mb: 2.5 }}>
                    <Box
                      component="span"
                      onClick={() => navigate('/forgot-password')}
                      sx={{
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        color: '#97247E',
                        '&:hover': { color: '#27235C', textDecoration: 'underline' },
                        transition: 'color 0.2s',
                      }}
                    >
                      Forgot password?
                    </Box>
                  </Box>
                </motion.div>
 
                {/* Submit */}
                <motion.div variants={childVariants}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.4,
                      background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
                      color: '#fff',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      letterSpacing: '0.01em',
                      boxShadow: '0 4px 16px rgba(39,35,92,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1B193F 0%, #7a1d68 100%)',
                        boxShadow: '0 6px 24px rgba(39,35,92,0.35)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': { transform: 'translateY(0px)' },
                      '&.Mui-disabled': { opacity: 0.6, color: '#fff' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {loading
                      ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                      : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Sign in
                          <ArrowForward sx={{ fontSize: 18 }} />
                        </Box>
                      )
                    }
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
 
          {/* Footer */}
          <motion.div variants={childVariants}>
            <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.72rem', color: '#C4C9D4' }}>
              © {new Date().getFullYear()} Relevantz Technology Services. All rights reserved.
            </Typography>
          </motion.div>
        </motion.div>
      </Box>
    </Box>
  );
};
 
export default LoginPage;
