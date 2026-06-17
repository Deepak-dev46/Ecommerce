// src/validations/loginSchema.js
import * as yup from 'yup';
 
export const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});
 
export const otpSchema = yup.object({
  otp: yup
    .string()
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});
 