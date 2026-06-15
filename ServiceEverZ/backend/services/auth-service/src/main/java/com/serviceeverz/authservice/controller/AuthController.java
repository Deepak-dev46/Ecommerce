package com.serviceeverz.authservice.controller;
 
import com.serviceeverz.authservice.dto.*;
import com.serviceeverz.authservice.service.AuthServiceImpl;
import com.serviceeverz.authservice.service.IForgotPasswordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
 
    private final AuthServiceImpl authService;
    private final IForgotPasswordService forgotPasswordService;
 
    public AuthController(AuthServiceImpl authService, IForgotPasswordService forgotPasswordService) {
        this.authService = authService;
        this.forgotPasswordService = forgotPasswordService;
    }
 
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
 
    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody OtpRequest req) {
        return ResponseEntity.ok(authService.verifyOtp(req));
    }
 
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.forgotPassword(request);
        return ResponseEntity.ok("If account exists, reset instructions sent");
    }
 
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<String> verifyResetOtp(@Valid @RequestBody VerifyResetOtpRequest request) {
        forgotPasswordService.verifyResetOtp(request);
        return ResponseEntity.ok("OTP verified successfully");
    }
 
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }
    
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody OtpRequest req) {
        authService.resendOtp(req);
        return ResponseEntity.ok("OTP resent successfully");
    }
     
}
 