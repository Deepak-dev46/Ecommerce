// src/pages/admin/PasswordPolicyPage.jsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Grid, Card, CardContent, Typography, TextField,
  Switch, Button, Alert, CircularProgress, Divider,
  LinearProgress, InputAdornment, Chip, Tooltip, Slider,
} from '@mui/material';
import {
  Security, CheckCircle, Cancel, Refresh, Save,
  Visibility, LockOutlined, InfoOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { passwordPolicySchema } from '../../validations/passwordPolicySchema';
import { passwordApi } from '../../services/passwordApi';

// ──────────────────────────────────────────────
//  Password Strength Tester (frontend only)
// ──────────────────────────────────────────────
const testPassword = (pwd, policy) => {
  if (!pwd) return { score: 0, checks: {}, label: '', color: '#E5E7EB' };
  const checks = {
    length: pwd.length >= (policy.minLength || 8),
    upper: !policy.requireUppercase || /[A-Z]/.test(pwd),
    lower: !policy.requireLowercase || /[a-z]/.test(pwd),
    digit: !policy.requireDigit || /[0-9]/.test(pwd),
    special: !policy.requireSpecialChar || /[^A-Za-z0-9]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;
  const score = Math.round((passed / total) * 100);
  const label = score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : score >= 40 ? 'Weak' : 'Very weak';
  const color = score >= 80 ? '#24A148' : score >= 60 ? '#27235C' : score >= 40 ? '#E2B93B' : '#E01950';
  return { score, checks, label, color };
};

const CheckItem = ({ ok, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {ok
      ? <CheckCircle sx={{ fontSize: 14, color: '#24A148' }} />
      : <Cancel sx={{ fontSize: 14, color: '#E01950' }} />
    }
    <Typography sx={{ fontSize: '0.775rem', color: ok ? '#24A148' : '#E01950' }}>{label}</Typography>
  </Box>
);

const SectionCard = ({ title, description, icon: Icon, children, iconColor = '#27235C' }) => (
  <Card sx={{ mb: 2.5 }}>
    <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: `${iconColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
        <Icon sx={{ fontSize: 18, color: iconColor }} />
      </Box>
      <Box>
        <Typography fontWeight={700} fontSize="0.9rem">{title}</Typography>
        {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
      </Box>
    </Box>
    <Divider />
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
  </Card>
);

const ToggleRow = ({ label, description, checked, onChange, disabled }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    py: 1.25, px: 2, borderRadius: 2, border: '1px solid',
    borderColor: checked ? '#27235C28' : '#F0F0F5',
    backgroundColor: checked ? '#F5F4FF' : '#FAFAFA',
    transition: 'all 0.15s',
    mb: 1,
  }}>
    <Box>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#1B193F' }}>{label}</Typography>
      {description && <Typography sx={{ fontSize: '0.73rem', color: '#9CA3AF' }}>{description}</Typography>}
    </Box>
    <Switch
      checked={Boolean(checked)}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: '#27235C' },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#27235C' },
      }}
    />
  </Box>
);

// ──────────────────────────────────────────────
//  Default policy (matches backend schema)
// ──────────────────────────────────────────────
const DEFAULT = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
  passwordExpiryDays: 90,
  passwordHistoryCount: 5,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
};

const PasswordPolicyPage = () => {
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testPwd, setTestPwd] = useState('');

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(passwordPolicySchema),
    defaultValues: DEFAULT,
    mode: 'onChange',
  });

  const watched = watch();
  const strength = testPassword(testPwd, watched);

  useEffect(() => {
    passwordApi.getPolicy()
      .then((res) => reset({ ...DEFAULT, ...res.data }))
      .catch(() => reset(DEFAULT))
      .finally(() => setFetchLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await passwordApi.savePolicy(data);
      setSuccess('Password policy saved successfully.');
      reset(data); // mark form clean
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save policy.');
    } finally { setSaving(false); }
  };

  if (fetchLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
      <CircularProgress sx={{ color: '#27235C' }} />
    </Box>
  );

  // Compute overall strength from current policy toggles
  const policyStrengthChecks = [
    watched.requireUppercase,
    watched.requireLowercase,
    watched.requireDigit,
    watched.requireSpecialChar,
    watched.minLength >= 8,
    watched.passwordExpiryDays > 0 && watched.passwordExpiryDays <= 90,
    watched.maxFailedAttempts <= 5,
    watched.passwordHistoryCount >= 5,
  ];
  const policyScore = Math.round((policyStrengthChecks.filter(Boolean).length / policyStrengthChecks.length) * 100);
  const policyLabel = policyScore >= 80 ? 'Strong policy' : policyScore >= 60 ? 'Moderate policy' : 'Weak policy';
  const policyColor = policyScore >= 80 ? '#24A148' : policyScore >= 60 ? '#E2B93B' : '#E01950';

  return (
    <Box>
      <PageHeader
        title="Password policy"
        subtitle="Configure organization-wide password security settings"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Password policy' }]}
      />

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2.5}>
          {/* Left column — settings */}
          <Grid item xs={12} lg={8}>

            {/* 1. Password requirements */}
            <SectionCard
              title="Password requirements"
              description="Character types that must be present in every password"
              icon={LockOutlined}
            >
              <Controller name="requireUppercase" control={control}
                render={({ field }) => (
                  <ToggleRow label="Require uppercase letters" description="At least one A–Z character" checked={field.value} onChange={field.onChange} />
                )}
              />
              <Controller name="requireLowercase" control={control}
                render={({ field }) => (
                  <ToggleRow label="Require lowercase letters" description="At least one a–z character" checked={field.value} onChange={field.onChange} />
                )}
              />
              <Controller name="requireDigit" control={control}
                render={({ field }) => (
                  <ToggleRow label="Require numbers" description="At least one 0–9 digit" checked={field.value} onChange={field.onChange} />
                )}
              />
              <Controller name="requireSpecialChar" control={control}
                render={({ field }) => (
                  <ToggleRow label="Require special characters" description="At least one !@#$%^&* character" checked={field.value} onChange={field.onChange} />
                )}
              />
            </SectionCard>

            {/* 2. Length & History */}
            <SectionCard
              title="Password length & history"
              description="Minimum length and reuse restrictions"
              icon={Security}
              iconColor="#97247E"
            >
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('minLength')}
                    label="Minimum length"
                    type="number"
                    fullWidth
                    error={!!errors.minLength}
                    helperText={errors.minLength?.message || 'Minimum characters required'}
                    inputProps={{ min: 6, max: 32 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>chars</Typography></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('passwordHistoryCount')}
                    label="Password history"
                    type="number"
                    fullWidth
                    error={!!errors.passwordHistoryCount}
                    helperText={errors.passwordHistoryCount?.message || "Can't reuse last N passwords"}
                    inputProps={{ min: 0, max: 24 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>passwords</Typography></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('passwordExpiryDays')}
                    label="Password expiry"
                    type="number"
                    fullWidth
                    error={!!errors.passwordExpiryDays}
                    helperText={errors.passwordExpiryDays?.message || '0 = never expires'}
                    inputProps={{ min: 0, max: 365 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>days</Typography></InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* 3. Lockout */}
            <SectionCard
              title="Account lockout"
              description="Protect accounts against brute-force attacks"
              icon={Security}
              iconColor="#E01950"
            >
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('maxFailedAttempts')}
                    label="Max failed attempts"
                    type="number"
                    fullWidth
                    error={!!errors.maxFailedAttempts}
                    helperText={errors.maxFailedAttempts?.message || 'Before account is locked'}
                    inputProps={{ min: 1, max: 20 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>attempts</Typography></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('lockoutDurationMinutes')}
                    label="Lockout duration"
                    type="number"
                    fullWidth
                    error={!!errors.lockoutDurationMinutes}
                    helperText={errors.lockoutDurationMinutes?.message || 'Minutes account stays locked'}
                    inputProps={{ min: 1, max: 1440 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>min</Typography></InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>

          {/* Right column — live tester + policy strength */}
          <Grid item xs={12} lg={4}>
            {/* Policy strength card */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography fontWeight={700} fontSize="0.9rem" mb={0.5}>Policy strength</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Based on your current settings
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{policyLabel}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: policyColor }}>{policyScore}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={policyScore}
                  sx={{
                    mb: 2,
                    '& .MuiLinearProgress-bar': { backgroundColor: policyColor },
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {[
                    { ok: watched.requireUppercase, label: 'Uppercase required' },
                    { ok: watched.requireLowercase, label: 'Lowercase required' },
                    { ok: watched.requireDigit, label: 'Numbers required' },
                    { ok: watched.requireSpecialChar, label: 'Special chars required' },
                    { ok: watched.minLength >= 8, label: 'Length ≥ 8 characters' },
                    { ok: watched.passwordExpiryDays > 0 && watched.passwordExpiryDays <= 90, label: 'Expiry ≤ 90 days' },
                    { ok: watched.maxFailedAttempts <= 5, label: 'Lockout ≤ 5 attempts' },
                    { ok: watched.passwordHistoryCount >= 5, label: 'History ≥ 5 passwords' },
                  ].map((c) => (
                    <CheckItem key={c.label} ok={c.ok} label={c.label} />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Live password tester */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Visibility sx={{ fontSize: 17, color: '#97247E' }} />
                  <Typography fontWeight={700} fontSize="0.9rem">Live password tester</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Type a password to check against this policy
                </Typography>
                <TextField
                  label="Test password"
                  type="text"
                  fullWidth
                  value={testPwd}
                  onChange={(e) => setTestPwd(e.target.value)}
                  placeholder="Enter any password..."
                  sx={{ mb: 1.5 }}
                />
                {testPwd && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Strength</Typography>
                      <Chip
                        label={strength.label}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, backgroundColor: `${strength.color}18`, color: strength.color }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={strength.score}
                      sx={{
                        mb: 2,
                        '& .MuiLinearProgress-bar': { backgroundColor: strength.color },
                      }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <CheckItem ok={strength.checks.length} label={`Min ${watched.minLength || 8} characters`} />
                      {watched.requireUppercase && <CheckItem ok={strength.checks.upper} label="Uppercase letter" />}
                      {watched.requireLowercase && <CheckItem ok={strength.checks.lower} label="Lowercase letter" />}
                      {watched.requireDigit && <CheckItem ok={strength.checks.digit} label="Number" />}
                      {watched.requireSpecialChar && <CheckItem ok={strength.checks.special} label="Special character" />}
                    </Box>
                  </motion.div>
                )}
                {!testPwd && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#D1D5DB', textAlign: 'center', py: 2 }}>
                    Enter a password above to test it
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Save / Reset actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1, pb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => reset(DEFAULT)}
            sx={{ borderColor: '#E5E7EB', color: '#374151' }}
          >
            Reset defaults
          </Button>
          <Button
            type="submit"
            variant="contained"
            style={{ color: 'white' }}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
            disabled={saving || !isDirty}
          >
            {saving ? 'Saving...' : 'Save policy'}
          </Button>

        </Box>
      </Box>
    </Box>
  );
};

export default PasswordPolicyPage;
