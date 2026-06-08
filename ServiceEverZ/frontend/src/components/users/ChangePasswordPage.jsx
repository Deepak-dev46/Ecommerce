import React, { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { tokenUtils } from '../../utils/tokenUtils';

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await authApi.changePassword({
        newPassword: passwords.newPassword
      });

      // ✅ update firstLogin = false in localStorage
      const user = tokenUtils.getUser();
      user.firstLogin = false;
      tokenUtils.setUser(user);

      // ✅ redirect based on role
      if (user.roles?.includes("RMO")) {
        navigate('/rmo/dashboard');
      } else {
        navigate('/admin/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Change Password
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="New Password"
          fullWidth
          type="password"
          name="newPassword"
          sx={{ mt: 2 }}
          onChange={handleChange}
        />

        <TextField
          label="Confirm Password"
          fullWidth
          type="password"
          name="confirmPassword"
          sx={{ mt: 2 }}
          onChange={handleChange}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          Change Password
        </Button>
      </Card>
    </Box>
  );
};

export default ChangePasswordPage;