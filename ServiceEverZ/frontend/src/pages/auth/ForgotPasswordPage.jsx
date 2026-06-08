// src/pages/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, TextField } from '@mui/material';
import { MailOutline, ArrowBack, ArrowForward } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

// ── Animated envelope icon ────────────────────────────────────────────────────
const MailIcon = ({ sent }) => (
  <motion.div
    animate={sent ? {
      y: [-40, 40],
      x: [0, 80],
      opacity: [1, 0],
      rotate: [0, 15],
    } : {
      y: [0, -4, 0],
      rotate: [0, -2, 2, 0],
    }}
    transition={sent
      ? { duration: 0.6, ease: 'easeIn' }
      : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    }
    style={{ display: 'inline-flex' }}
  >
    <Box sx={{
      width: 64, height: 64, borderRadius: '18px',
      background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 28px rgba(39,35,92,0.28)',
    }}>
      <MailOutline sx={{ color: '#fff', fontSize: 30 }} />
    </Box>
  </motion.div>
);

// ── Background ────────────────────────────────────────────────────────────────
const Background = () => (
  <>
    <Box sx={{ position: 'fixed', inset: 0, background: 'linear-gradient(160deg, #F4F5F9 0%, #EEF0FF 100%)', zIndex: 0 }} />
    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(151,36,126,0.06) 0%, transparent 70%)',
      }}
    />
  </>
);

// ── Step indicator ────────────────────────────────────────────────────────────
const Steps = ({ active }) => {
  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, mb: 3 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <motion.div
              animate={{
                scale: i === active ? 1 : 1,
                background: i <= active ? 'linear-gradient(135deg,#27235C,#97247E)' : '#E5E7EB',
              }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= active ? 'linear-gradient(135deg, #27235C, #97247E)' : '#E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s',
              }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: i <= active ? '#fff' : '#9CA3AF' }}>
                  {i + 1}
                </Typography>
              </Box>
            </motion.div>
            <Typography sx={{ fontSize: '0.62rem', color: i === active ? '#27235C' : '#9CA3AF', fontWeight: i === active ? 700 : 400, whiteSpace: 'nowrap' }}>
              {s}
            </Typography>
          </Box>
          {i < steps.length - 1 && (
            <Box sx={{
              flex: 1, height: 2, mx: 1, mb: 2.5,
              background: i < active ? 'linear-gradient(90deg, #27235C, #97247E)' : '#E5E7EB',
              transition: 'background 0.4s',
              maxWidth: 48,
            }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authApi.forgotPassword(data);
      setSuccess(res.data?.message || 'OTP sent to your email');
      setSent(true);
      setTimeout(() => {
        navigate('/verify-reset-otp', { state: { email: data.email } });
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process request');
    } finally {
      setLoading(false);
    }
  };

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
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Steps */}
        <motion.div variants={item}>
          <Steps active={0} />
        </motion.div>

        {/* Card */}
        <motion.div variants={item}>
          <Box sx={{
            background: '#fff', borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(39,35,92,0.08)',
            border: '1px solid rgba(39,35,92,0.06)',
            overflow: 'hidden',
          }}>
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #27235C, #97247E)' }} />
            <Box sx={{ p: { xs: 3, sm: 4 } }}>

              {/* Icon + heading */}
              <motion.div variants={item}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <MailIcon sent={sent} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#1B193F', mt: 2, letterSpacing: '-0.02em' }}>
                    Forgot your password?
                  </Typography>
                  <Typography sx={{ fontSize: '0.83rem', color: '#6B7280', mt: 0.75, lineHeight: 1.6, maxWidth: 320, mx: 'auto' }}>
                    No worries. Enter your registered email and we'll send you a one-time code.
                  </Typography>
                </Box>
              </motion.div>

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.8rem' }}>{error}</Alert>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.8rem' }}>{success}</Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <motion.div variants={item}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', mb: 0.75 }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth type="email"
                    placeholder="Enter your registered email"
                    {...register('email', { required: true })}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#27235C', borderWidth: 2 },
                      },
                      '& label.Mui-focused': { color: '#27235C' },
                    }}
                  />
                </motion.div>

                <motion.div variants={item}>
                  <Button
                    type="submit" fullWidth disabled={loading || sent}
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
                      '&:active': { transform: 'translateY(0)' },
                      '&.Mui-disabled': { opacity: 0.6, color: '#fff' },
                      transition: 'all 0.2s ease',
                      mb: 1.5,
                    }}
                  >
                    {loading
                      ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                      : sent
                        ? 'OTP Sent!'
                        : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Send OTP <ArrowForward sx={{ fontSize: 18 }} />
                          </Box>
                        )
                    }
                  </Button>
                </motion.div>

                <motion.div variants={item}>
                  <Button
                    fullWidth variant="text"
                    onClick={() => navigate('/login')}
                    startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                    sx={{
                      color: '#6B7280', fontWeight: 600, fontSize: '0.83rem',
                      borderRadius: '10px', py: 1,
                      '&:hover': { backgroundColor: '#F4F5F9', color: '#27235C' },
                    }}
                  >
                    Back to Sign In
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

export default ForgotPasswordPage;
