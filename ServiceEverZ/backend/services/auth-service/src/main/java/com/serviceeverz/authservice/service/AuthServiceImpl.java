// FILE: auth-service/src/main/java/com/serviceeverz/authservice/service/AuthServiceImpl.java
package com.serviceeverz.authservice.service;
 
import com.serviceeverz.authservice.client.EmailClient;
import com.serviceeverz.authservice.client.RmoServiceClient;
import com.serviceeverz.authservice.client.RoleServiceClient;
import com.serviceeverz.authservice.client.UserServiceClient;
import com.serviceeverz.authservice.dto.LoginRequest;
import com.serviceeverz.authservice.dto.LoginResponse;
import com.serviceeverz.authservice.dto.OtpRequest;
import com.serviceeverz.authservice.dto.UserDetailDto;
import com.serviceeverz.authservice.entity.OtpVerification;
import com.serviceeverz.authservice.repository.OtpRepository;
import com.serviceeverz.authservice.util.JwtUtil;
import com.serviceeverz.authservice.util.PasswordExpiryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
 
@Service
public class AuthServiceImpl {
 
    private final UserServiceClient userServiceClient;
    private final RoleServiceClient roleServiceClient;
    private final RmoServiceClient rmoServiceClient;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final OtpRepository otpRepository;
    private final EmailClient emailClient;
    private final PasswordExpiryUtil passwordExpiryUtil;
 
    @Autowired
    public AuthServiceImpl(UserServiceClient userServiceClient,
                           RoleServiceClient roleServiceClient,
                           RmoServiceClient rmoServiceClient,
                           JwtUtil jwtUtil,
                           PasswordEncoder passwordEncoder,
                           OtpRepository otpRepository,
                           EmailClient emailClient,
                           PasswordExpiryUtil passwordExpiryUtil) {
        this.userServiceClient = userServiceClient;
        this.roleServiceClient = roleServiceClient;
        this.rmoServiceClient  = rmoServiceClient;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.otpRepository = otpRepository;
        this.emailClient = emailClient;
        this.passwordExpiryUtil = passwordExpiryUtil;
    }
 
    // ── Helper: fetch effective roles (project-level roles) ──────────────────
    // Returns roles derived from being l1_manager_id, l2_manager_id,
    // resource_owner_id on any active project.
    // Falls back gracefully if rmo-service is unavailable.
    private List<String> fetchEffectiveRoles(Long userId, List<String> assignedRoles) {
        // Only compute effective roles for END_USER
        // ADMIN / RMO already have full access via their assigned role
        if (assignedRoles.contains("ADMIN") || assignedRoles.contains("RMO")) {
            return new ArrayList<>(assignedRoles);
        }
 
        List<String> effective = new ArrayList<>(assignedRoles);
        try {
            List<String> projectRoles = rmoServiceClient.getEffectiveRolesForUser(userId);
            if (projectRoles != null) {
                for (String r : projectRoles) {
                    if (!effective.contains(r)) effective.add(r);
                }
            }
        } catch (Exception e) {
            // rmo-service unavailable — return assigned roles only
            System.err.println("[AuthService] Could not fetch effective roles: " + e.getMessage());
        }
        return effective;
    }
 
    public LoginResponse login(LoginRequest req) {
        UserDetailDto user;
        try {
            user = userServiceClient.getUserByEmail(req.getEmail());
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }
 
        if (user == null) throw new RuntimeException("Invalid email or password");
        if (user.isAccountLocked()) throw new RuntimeException("Account is locked. Try again later.");
 
        String status = user.getStatus();
        if (!"ACTIVE".equals(status) && !"PENDINGACTIVATION".equals(status)) {
            throw new RuntimeException("Account is disabled or inactive. Contact your administrator.");
        }
 
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            userServiceClient.incrementFailedAttempt(req.getEmail());
            throw new RuntimeException("Invalid email or password");
        }
 
        userServiceClient.resetFailedAttempt(req.getEmail());
 
        if ("PENDINGACTIVATION".equals(status)) {
            try { userServiceClient.activateUser(req.getEmail()); }
            catch (Exception e) { System.err.println("Failed to activate user: " + e.getMessage()); }
        }
 
        List<String> roles;
        try {
            roles = roleServiceClient.getRolesForUser(user.getId());
        } catch (Exception e) {
            roles = List.of();
        }
 
        boolean passwordExpired = passwordExpiryUtil.isExpired(user.getPasswordChangedAt(), 90);
        boolean isAdmin = roles.contains("ADMIN");
 
        if (isAdmin) {
            long recentOtpCount = otpRepository.countByEmailAndExpiryTimeAfter(
                    user.getEmail(), LocalDateTime.now().minusSeconds(1));
            if (recentOtpCount > 0) {
                throw new RuntimeException("OTP already sent. Please wait 2 min.");
            }
 
            String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
            otpRepository.save(new OtpVerification(user.getEmail(), otp,
                    LocalDateTime.now().plusMinutes(2), false));
            emailClient.sendOtp(new OtpRequest(user.getEmail(), otp));
 
            LoginResponse response = new LoginResponse();
            response.setMessage("OTP sent to registered email");
            response.setRequiresOtp(true);
            response.setFirstLogin(user.isFirstLogin());
            response.setPasswordExpired(passwordExpired);
            return response;
 
        } else {
            // Non-admin: compute effective roles from project assignments
            List<String> effectiveRoles = fetchEffectiveRoles(user.getId(), roles);
 
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), effectiveRoles);
 
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setTokenType("Bearer");
            response.setExpiresIn(jwtUtil.getExpiration());
            response.setUserId(user.getId());
            response.setEmail(user.getEmail());
            response.setFullName(user.getFirstName() + " " + user.getLastName());
            response.setRoles(roles);                  // assigned roles (ADMIN/RMO/END_USER)
            response.setEffectiveRoles(effectiveRoles);// assigned + project-derived
            response.setFirstLogin(user.isFirstLogin());
            response.setPasswordExpired(passwordExpired);
            response.setRequiresOtp(false);
            return response;
        }
    }
 
    public LoginResponse verifyOtp(OtpRequest req) {
        OtpVerification otpData = otpRepository.findTopByEmailOrderByIdDesc(req.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found"));
        if (otpData.isVerified()) throw new RuntimeException("OTP already used");
        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) throw new RuntimeException("OTP expired");
        if (!otpData.getOtp().equals(req.getOtp())) throw new RuntimeException("Invalid OTP");
 
        otpData.setVerified(true);
        otpRepository.save(otpData);
 
        UserDetailDto user = userServiceClient.getUserByEmail(req.getEmail());
        if ("PENDINGACTIVATION".equals(user.getStatus())) {
            try { userServiceClient.activateUser(req.getEmail()); }
            catch (Exception e) { System.err.println("Failed to activate admin: " + e.getMessage()); }
        }
 
        List<String> roles;
        try { roles = roleServiceClient.getRolesForUser(user.getId()); }
        catch (Exception e) { roles = List.of(); }
 
        // Admin OTP path — compute effective roles too
        List<String> effectiveRoles = fetchEffectiveRoles(user.getId(), roles);
 
        boolean passwordExpired = passwordExpiryUtil.isExpired(user.getPasswordChangedAt(), 90);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), effectiveRoles);
 
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtUtil.getExpiration());
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFirstName() + " " + user.getLastName());
        response.setRoles(roles);
        response.setEffectiveRoles(effectiveRoles);
        response.setFirstLogin(user.isFirstLogin());
        response.setPasswordExpired(passwordExpired);
        response.setRequiresOtp(false);
        return response;
    }
 
    public void resendOtp(OtpRequest req) {
        UserDetailDto user;
        try { user = userServiceClient.getUserByEmail(req.getEmail()); }
        catch (Exception e) { throw new RuntimeException("User not found"); }
 
        List<String> roles;
        try { roles = roleServiceClient.getRolesForUser(user.getId()); }
        catch (Exception e) { roles = List.of(); }
 
        if (!roles.contains("ADMIN")) throw new RuntimeException("Resend OTP is only valid for admin users");
 
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpRepository.save(new OtpVerification(req.getEmail(), otp, LocalDateTime.now().plusMinutes(5), false));
        emailClient.sendOtp(new OtpRequest(req.getEmail(), otp));
    }
}
 