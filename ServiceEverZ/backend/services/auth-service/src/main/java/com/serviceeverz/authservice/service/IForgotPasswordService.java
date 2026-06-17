package com.serviceeverz.authservice.service;
 
import com.serviceeverz.authservice.dto.ForgotPasswordRequest;
import com.serviceeverz.authservice.dto.ResetPasswordRequest;
import com.serviceeverz.authservice.dto.VerifyResetOtpRequest;
 
public interface IForgotPasswordService {
 
    void forgotPassword(ForgotPasswordRequest request);
 
    void verifyResetOtp(VerifyResetOtpRequest request);
 
    void resetPassword(ResetPasswordRequest request);
}
 