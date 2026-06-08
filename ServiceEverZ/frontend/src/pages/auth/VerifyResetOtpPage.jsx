// src/pages/auth/VerifyResetOtpPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Key, MailOutline, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const OTP_TTL = 120;
const OTP_LENGTH = 6;

// ── OTP Box Input (shared style with OtpVerifyPage) ───────────────────────────
const OtpBoxInput = ({ onChange, hasError, resetSignal }) => {
  const [values, setValues] = useState(Array(OTP_LENGTH).fill(''));
  const [masked, setMasked] = useState(Array(OTP_LENGTH).fill(false));
  const inputs = useRef([]);

  useEffect(() => {
    setValues(Array(OTP_LENGTH).fill(''));
    setMasked(Array(OTP_LENGTH).fill(false));
    inputs.current[0]?.focus();
  }, [resetSignal]);

  const handleChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);
    onChange(newValues.join(''));
    if (index > 0) {
      const newMasked = [...masked];
      newMasked[index - 1] = true;
      setMasked(newMasked);
    }
    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else {
      setTimeout(() => setMasked(prev => { const m = [...prev]; m[OTP_LENGTH - 1] = true; return m; }), 500);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newValues = [...values];
      const newMasked = [...masked];
      if (newValues[index]) {
        newValues[index] = ''; newMasked[index] = false;
        setValues(newValues); setMasked(newMasked); onChange(newValues.join(''));
      } else if (index > 0) {
        newValues[index - 1] = ''; newMasked[index - 1] = false;
        setValues(newValues); setMasked(newMasked); onChange(newValues.join(''));
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newValues = Array(OTP_LENGTH).fill('');
    const newMasked = Array(OTP_LENGTH).fill(false);
    pasted.split('').forEach((ch, i) => { newValues[i] = ch; if (i < pasted.length - 1) newMasked[i] = true; });
    setValues(newValues); setMasked(newMasked); onChange(newValues.join(''));
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <Box sx={{ display: 'flex', gap: { xs: 0.8, sm: 1.2 }, justifyContent: 'center', mb: 2.5 }}>
      {values.map((val, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
        >
          <Box
            component="input"
            ref={el => (inputs.current[i] = el)}
            value={masked[i] ? '•' : val}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            sx={{
              width: { xs: 40, sm: 48 }, height: { xs: 50, sm: 56 },
              textAlign: 'center',
              fontSize: masked[i] ? '1.5rem' : '1.25rem',
              fontWeight: 700, fontFamily: '"Inter", monospace',
              border: '2px solid',
              borderColor: hasError ? '#E01950' : val ? '#97247E' : '#E5E7EB',
              borderRadius: '12px', outline: 'none',
              background: val ? 'linear-gradient(135deg, rgba(151,36,126,0.04), rgba(39,35,92,0.04))' : '#fff',
              color: '#1B193F', caretColor: 'transparent', cursor: 'text',
              transition: 'all 0.2s ease',
              boxShadow: val ? '0 2px 8px rgba(151,36,126,0.12)' : 'none',
              '&:focus': {
                borderColor: hasError ? '#E01950' : '#97247E',
                boxShadow: hasError ? '0 0 0 3px rgba(224,25,80,0.15)' : '0 0 0 3px rgba(151,36,126,0.15)',
              },
            }}
          />
        </motion.div>
      ))}
    </Box>
  );
};

// ── Circle Countdown ──────────────────────────────────────────────────────────
const CircleCountdown = ({ ttl, total }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = (ttl / total) * circ;
  const isLow = ttl <= 30;
  const color = ttl === 0 ? '#E01950' : isLow ? '#E2B93B' : '#97247E';
  const mins = String(Math.floor(ttl / 60)).padStart(2, '0');
  const secs = String(ttl % 60).padStart(2, '0');

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={72} height={72}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="#F0F0F5" strokeWidth={4} />
        <motion.circle
          cx={36} cy={36} r={r} fill="none"
          stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - progress }}
          transition={{ duration: 1, ease: 'linear' }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color, lineHeight: 1 }}>
          {ttl === 0 ? 'Exp' : `${mins}:${secs}`}
        </Typography>
      </Box>
    </Box>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ type, message }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
        <Box sx={{
          mb: 2, px: 2, py: 1.2, borderRadius: '10px',
          background: isError ? '#FFF1F2' : '#F0FDF4',
          border: `1px solid ${isError ? '#FECDD3' : '#BBF7D0'}`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isError ? '#E01950' : '#22C55E' }} />
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: isError ? '#BE123C' : '#15803D' }}>
            {message}
          </Typography>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Step indicator (step 2 of 3) ──────────────────────────────────────────────
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
const VerifyResetOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [ttl, setTtl] = useState(OTP_TTL);
  const [resetSignal, setResetSignal] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { if (!email) navigate('/forgot-password'); }, [email, navigate]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTtl(OTP_TTL);
    timerRef.current = setInterval(() => {
      setTtl(c => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; });
    }, 1000);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const handleVerify = async () => {
    if (otpValue.length < OTP_LENGTH) { setOtpError('Please enter the complete 6-digit OTP'); return; }
    setLoading(true); setError(''); setOtpError('');
    try {
      await authApi.verifyResetOtp({ email, otp: otpValue });
      navigate('/reset-password', { state: { email, otp: otpValue } });
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true); setError(''); setResendSuccess('');
    try {
      await authApi.forgotPassword({ email });
      setOtpValue(''); setResetSignal(p => p + 1);
      setResendSuccess('A new OTP has been sent to your email.');
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const isExpired = ttl === 0;

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F4F5F9 0%, #EEF0FF 100%)', px: 2, position: 'relative',
    }}>
      {/* bg orbs */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(151,36,126,0.1) 0%, transparent 70%)' }} />
        <motion.div animate={{ y: [0, 18, 0] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(39,35,92,0.08) 0%, transparent 70%)' }} />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Steps */}
        <Steps active={1} />

        {/* Card */}
        <Box sx={{
          background: '#fff', borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(39,35,92,0.08)',
          border: '1px solid rgba(39,35,92,0.06)', overflow: 'hidden',
        }}>
          <Box sx={{ height: 3, background: 'linear-gradient(90deg, #27235C, #97247E)' }} />
          <Box sx={{ p: { xs: 3, sm: 4 } }}>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Box sx={{
                  width: 46, height: 46, borderRadius: '13px', mb: 1.5,
                  background: 'linear-gradient(135deg, rgba(39,35,92,0.08), rgba(151,36,126,0.08))',
                  border: '1px solid rgba(151,36,126,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Key sx={{ color: '#97247E', fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#1B193F', letterSpacing: '-0.02em' }}>
                  Enter Reset OTP
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                  <MailOutline sx={{ fontSize: 14, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    Sent to <Box component="span" sx={{ fontWeight: 700, color: '#97247E' }}>{email}</Box>
                  </Typography>
                </Box>
              </Box>
              <CircleCountdown ttl={ttl} total={OTP_TTL} />
            </Box>

            {/* Messages */}
            <Toast type="error" message={error} />
            <Toast type="success" message={resendSuccess} />

            {/* OTP boxes */}
            <OtpBoxInput
              onChange={(val) => { setOtpValue(val); if (otpError) setOtpError(''); }}
              hasError={!!otpError}
              resetSignal={resetSignal}
            />

            <AnimatePresence>
              {otpError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#E01950', textAlign: 'center', mt: -1.5, mb: 2 }}>
                    {otpError}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify button */}
            <Button
              fullWidth
              disabled={loading || isExpired || otpValue.length < OTP_LENGTH}
              onClick={handleVerify}
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
                transition: 'all 0.2s ease', mb: 2,
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Verify OTP'}
            </Button>

            {/* Resend */}
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#6B7280' }}>
                Didn't receive it?{' '}
                {!isExpired ? (
                  <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 600, cursor: 'default' }}>
                    Resend OTP
                  </Box>
                ) : resendLoading ? (
                  <CircularProgress size={12} sx={{ color: '#97247E', verticalAlign: 'middle', ml: 0.5 }} />
                ) : (
                  <Box component="span" onClick={handleResend} sx={{
                    color: '#97247E', fontWeight: 700, cursor: 'pointer',
                    textDecoration: 'underline', textUnderlineOffset: '2px',
                    '&:hover': { color: '#27235C' }, transition: 'color 0.2s',
                  }}>
                    Resend OTP
                  </Box>
                )}
              </Typography>
            </Box>

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
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.72rem', color: '#C4C9D4' }}>
          © {new Date().getFullYear()} Relevantz Technology Services
        </Typography>
      </motion.div>
    </Box>
  );
};

export default VerifyResetOtpPage;
