package com.serviceeverz.authservice.service;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.serviceeverz.authservice.client.EmailClient;
import com.serviceeverz.authservice.client.RoleServiceClient;
import com.serviceeverz.authservice.client.UserServiceClient;
import com.serviceeverz.authservice.dto.ForgotPasswordRequest;
import com.serviceeverz.authservice.dto.OtpRequest;
import com.serviceeverz.authservice.dto.ResetPasswordRequest;
import com.serviceeverz.authservice.dto.UserDetailDto;
import com.serviceeverz.authservice.dto.VerifyResetOtpRequest;
import com.serviceeverz.authservice.entity.PasswordResetOtp;
import com.serviceeverz.authservice.repository.PasswordResetOtpRepository;
 
@Service
public class ForgotPasswordServiceImpl implements IForgotPasswordService {
 
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_RETRY_LIMIT = 5;
    private static final int OTP_RATE_LIMIT_SECONDS = 30;
 
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final UserServiceClient userServiceClient;
    private final EmailClient emailClient;
    private RoleServiceClient roleServiceClient;
    public ForgotPasswordServiceImpl(PasswordResetOtpRepository passwordResetOtpRepository,
                                     UserServiceClient userServiceClient,
                                     EmailClient emailClient, RoleServiceClient roleServiceClient) {
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.userServiceClient = userServiceClient;
        this.emailClient = emailClient;
        this.roleServiceClient=roleServiceClient;
    }
 
    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        try {
            UserDetailDto user = userServiceClient.getUserByEmail(request.getEmail());
            
         // In forgotPassword() after fetching user, add role check:
            List<String> roles = roleServiceClient.getRolesForUser(user.getId());
            if (roles.contains("ADMIN")) {
                return; // silently ignore for admin
            }
             
 
            if (!"ACTIVE".equals(user.getStatus()) && !"PENDINGACTIVATION".equals(user.getStatus())) {
                return;
            }
 
            long recentCount = passwordResetOtpRepository.countByEmailAndCreatedAtAfter(
                    request.getEmail(),
                    LocalDateTime.now().minusSeconds(OTP_RATE_LIMIT_SECONDS)
            );
 
            if (recentCount > 0) {
                return;
            }
 
            String otp = generateOtp();
            PasswordResetOtp entity = new PasswordResetOtp(
                    request.getEmail(),
                    otp,
                    LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
            );
 
            passwordResetOtpRepository.save(entity);
            emailClient.sendOtp(new OtpRequest(request.getEmail(), otp));
        } catch (Exception ignored) {
        }
    }
 
    @Override
    @Transactional
    public void verifyResetOtp(VerifyResetOtpRequest request) {
        PasswordResetOtp otp = passwordResetOtpRepository.findTopByEmailOrderByIdDesc(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
 
        if (otp.isConsumed()) {
            throw new RuntimeException("OTP already used");
        }
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        if (otp.getAttempts() >= OTP_RETRY_LIMIT) {
            throw new RuntimeException("Maximum OTP attempts exceeded");
        }
        if (!otp.getOtp().equals(request.getOtp())) {
            otp.setAttempts(otp.getAttempts() + 1);
            passwordResetOtpRepository.save(otp);
            throw new RuntimeException("Invalid OTP");
        }
 
        otp.setVerified(true);
        passwordResetOtpRepository.save(otp);
    }
 
    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp otp = passwordResetOtpRepository.findTopByEmailOrderByIdDesc(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Reset request not found"));
 
        if (!otp.isVerified() || otp.isConsumed()) {
            throw new RuntimeException("OTP verification required");
        }
        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
 
        userServiceClient.resetPasswordAfterOtp(
                request.getEmail(),
                Map.of("newPassword", request.getNewPassword())
        );
 
        otp.setConsumed(true);
        passwordResetOtpRepository.save(otp);
    }
 
    private String generateOtp() {
        int value = 100000 + new Random().nextInt(900000);
        return String.valueOf(value);
    }
}

 