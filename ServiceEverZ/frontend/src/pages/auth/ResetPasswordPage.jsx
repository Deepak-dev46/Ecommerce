// src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography,
  CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel, LockReset, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { toast } from 'react-toastify';

// ── Fetch policy ──────────────────────────────────────────────────────────────
const fetchPasswordPolicy = async () => {
  try {
    const res = await authApi.getPublicPasswordPolicy();
    return res.data;
  } catch {
    return { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSpecialChars: true };
  }
};

// ── Rule row ──────────────────────────────────────────────────────────────────
const RuleRow = ({ passed, label }) => (
  <motion.div
    animate={{ x: passed ? [0, 4, 0] : 0 }}
    transition={{ duration: 0.25 }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <motion.div animate={{ scale: passed ? [1.3, 1] : 1 }} transition={{ duration: 0.2 }}>
        {passed
          ? <CheckCircle sx={{ fontSize: 14, color: '#24A148' }} />
          : <Cancel sx={{ fontSize: 14, color: '#D1D5DB' }} />
        }
      </motion.div>
      <Typography sx={{ fontSize: '0.76rem', color: passed ? '#374151' : '#9CA3AF', fontWeight: passed ? 600 : 400, transition: 'color 0.2s' }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

// ── Strength ──────────────────────────────────────────────────────────────────
const getStrength = (passedCount, totalCount) => {
  if (totalCount === 0) return { value: 0, label: '', color: '#E5E7EB' };
  const pct = (passedCount / totalCount) * 100;
  if (pct === 100) return { value: 100, label: 'Strong', color: '#24A148' };
  if (pct >= 60)   return { value: pct,  label: 'Medium', color: '#E2B93B' };
  if (pct >= 30)   return { value: pct,  label: 'Weak',   color: '#E01950' };
  return { value: pct, label: 'Too weak', color: '#E01950' };
};

// ── Step indicator (step 3) ───────────────────────────────────────────────────
const Steps = ({ active }) => {
  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, mb: 3 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
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
            <Typography sx={{ fontSize: '0.62rem', color: i === active ? '#27235C' : '#9CA3AF', fontWeight: i === active ? 700 : 400, whiteSpace: 'nowrap' }}>
              {s}
            </Typography>
          </Box>
          {i < steps.length - 1 && (
            <Box sx={{
              flex: 1, height: 2, mx: 1, mb: 2.5,
              background: i < active ? 'linear-gradient(90deg, #27235C, #97247E)' : '#E5E7EB',
              transition: 'background 0.4s', maxWidth: 48,
            }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otp   = location.state?.otp;

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [policy, setPolicy]                   = useState(null);

  useEffect(() => { fetchPasswordPolicy().then(setPolicy); }, []);

  const rules = policy ? [
    policy.requireUppercase    && { key: 'upper',   label: 'At least one uppercase letter',         passed: /[A-Z]/.test(newPassword) },
    policy.requireLowercase    && { key: 'lower',   label: 'At least one lowercase letter',         passed: /[a-z]/.test(newPassword) },
    policy.requireNumbers      && { key: 'number',  label: 'At least one number',                   passed: /[0-9]/.test(newPassword) },
    policy.requireSpecialChars && { key: 'special', label: 'At least one special character',        passed: /[^A-Za-z0-9]/.test(newPassword) },
    policy.minLength           && { key: 'length',  label: `Minimum ${policy.minLength} characters`,passed: newPassword.length >= policy.minLength },
  ].filter(Boolean) : [];

  const passedCount    = rules.filter(r => r.passed).length;
  const allPassed      = rules.length > 0 && passedCount === rules.length;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const strength       = getStrength(passedCount, rules.length);

  const handleSubmit = async () => {
    setError('');
    if (!allPassed) { setError('Password does not meet the policy requirements.'); return; }
    if (!passwordsMatch) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      '&.Mui-focused fieldset': { borderColor: '#97247E', borderWidth: 2 },
    },
    '& label.Mui-focused': { color: '#97247E' },
  };

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F4F5F9 0%, #EEF0FF 100%)', px: 2, position: 'relative',
    }}>
      {/* bg orbs */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(151,36,126,0.1) 0%, transparent 70%)' }} />
        <motion.div animate={{ y: [0, 16, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: -80, left: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(39,35,92,0.08) 0%, transparent 70%)' }} />
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Steps */}
        <motion.div variants={item}><Steps active={2} /></motion.div>

        {/* Card */}
        <motion.div variants={item}>
          <Box sx={{
            background: '#fff', borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(39,35,92,0.08)',
            border: '1px solid rgba(39,35,92,0.06)', overflow: 'hidden',
          }}>
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #27235C, #97247E)' }} />
            <Box sx={{ p: { xs: 3, sm: 4 } }}>

              {/* Header */}
              <motion.div variants={item}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{
                    width: 46, height: 46, borderRadius: '13px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(39,35,92,0.08), rgba(151,36,126,0.08))',
                    border: '1px solid rgba(151,36,126,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LockReset sx={{ color: '#97247E', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#1B193F', letterSpacing: '-0.02em' }}>
                      Create New Password
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', mt: 0.25 }}>
                      For <Box component="span" sx={{ fontWeight: 700, color: '#97247E' }}>{email}</Box>
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                    <Box sx={{
                      mb: 2.5, px: 2, py: 1.2, borderRadius: '10px',
                      background: '#FFF1F2', border: '1px solid #FECDD3',
                      display: 'flex', alignItems: 'center', gap: 1,
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#E01950', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#BE123C' }}>{error}</Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* New password */}
              <motion.div variants={item}>
                <TextField
                  fullWidth label="New Password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  sx={fieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNew(p => !p)} sx={{ color: '#9CA3AF', '&:hover': { color: '#97247E' } }}>
                          {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              {/* Strength bar + rules */}
              <AnimatePresence>
                {newPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>Password strength</Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>{strength.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                        {[25, 50, 75, 100].map((threshold, i) => (
                          <Box key={i} sx={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: strength.value >= threshold ? strength.color : '#E5E7EB',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </Box>

                      {policy && (
                        <Box sx={{ p: 1.5, borderRadius: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', mb: 1 }}>
                            Requirements
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.25 }}>
                            {rules.map(r => <RuleRow key={r.key} passed={r.passed} label={r.label} />)}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm password */}
              <motion.div variants={item}>
                <TextField
                  fullWidth label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && !passwordsMatch}
                  helperText={
                    confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match'
                    : confirmPassword.length > 0 && passwordsMatch ? '✓ Passwords match' : ''
                  }
                  FormHelperTextProps={{ sx: { color: passwordsMatch ? '#24A148' : '#E01950', fontWeight: 600 } }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&.Mui-focused fieldset': {
                        borderColor: confirmPassword && passwordsMatch ? '#24A148' : '#97247E',
                        borderWidth: 2,
                      },
                    },
                    '& label.Mui-focused': { color: '#97247E' },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {confirmPassword && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                              {passwordsMatch
                                ? <CheckCircle sx={{ fontSize: 16, color: '#24A148' }} />
                                : <Cancel sx={{ fontSize: 16, color: '#E01950' }} />
                              }
                            </motion.div>
                          )}
                          <IconButton size="small" onClick={() => setShowConfirm(p => !p)} sx={{ color: '#9CA3AF', '&:hover': { color: '#97247E' } }}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              {/* Submit */}
              <motion.div variants={item}>
                <Button
                  fullWidth disabled={loading || !allPassed || !passwordsMatch}
                  onClick={handleSubmit}
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
                    '&.Mui-disabled': { opacity: 0.55, color: '#fff' },
                    transition: 'all 0.2s ease', mb: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Reset Password'}
                </Button>

                <Button
                  variant="text" fullWidth
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
        </motion.div>

        <motion.div variants={item}>
          <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.72rem', color: '#C4C9D4' }}>
            © {new Date().getFullYear()} Relevantz Technology Services
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default ResetPasswordPage;
