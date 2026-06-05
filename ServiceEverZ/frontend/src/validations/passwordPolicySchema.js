// src/validations/passwordPolicySchema.js
import * as yup from 'yup';
 
export const passwordPolicySchema = yup.object({
  minLength: yup.number().min(6, 'Min 6').max(32, 'Max 32').required('Required'),
  requireUppercase: yup.boolean(),
  requireLowercase: yup.boolean(),
  requireDigit: yup.boolean(),
  requireSpecialChar: yup.boolean(),
  passwordExpiryDays: yup.number().min(0).max(365).required('Required'),
  passwordHistoryCount: yup.number().min(0).max(24).required('Required'),
  maxFailedAttempts: yup.number().min(1, 'Min 1').max(20, 'Max 20').required('Required'),
  lockoutDurationMinutes: yup.number().min(1).max(1440).required('Required'),
});
 