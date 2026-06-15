package com.serviceeverz.userservice.usermanagement.controller;
 
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import com.serviceeverz.userservice.passwordpolicy.dto.PasswordPolicyResponse;
import com.serviceeverz.userservice.passwordpolicy.service.IPasswordPolicyService;
import com.serviceeverz.userservice.usermanagement.dto.ChangePasswordRequest;
import com.serviceeverz.userservice.usermanagement.dto.ProfileResponse;
import com.serviceeverz.userservice.usermanagement.dto.UpdateProfileRequest;
import com.serviceeverz.userservice.usermanagement.service.IProfileService;
 
import jakarta.validation.Valid;
 
@RestController
@RequestMapping("/api/v1/users")
public class ProfileController {
 
    private final IProfileService profileService;
    private final IPasswordPolicyService passwordPolicyService;
 
    public ProfileController(IProfileService profileService,
                             IPasswordPolicyService passwordPolicyService) {
        this.profileService = profileService;
        this.passwordPolicyService = passwordPolicyService;
    }
 
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }
 
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }
 
    // ✅ FIX 1: Photo upload endpoint was MISSING — added now
    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadPhoto(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profileService.uploadProfilePhoto(file));
    }
 
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changeMyPassword(request);
        return ResponseEntity.ok("Password changed successfully");
    }
 
    @PostMapping("/change-first-password")
    public ResponseEntity<String> changeFirstPassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changeFirstLoginPassword(request);
        return ResponseEntity.ok("First login password changed successfully");
    }
 
    @GetMapping("/password-policy")
    public ResponseEntity<PasswordPolicyResponse> getPasswordPolicy() {
        return ResponseEntity.ok(passwordPolicyService.getPolicy());
    }
}
 