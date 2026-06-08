package com.serviceeverz.userservice.usermanagement.controller;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.serviceeverz.userservice.usermanagement.dto.InternalResetPasswordRequest;
import com.serviceeverz.userservice.usermanagement.dto.InternalUserDetailDto;
import com.serviceeverz.userservice.usermanagement.dto.UserResponse;
import com.serviceeverz.userservice.usermanagement.repository.UserRepository;
import com.serviceeverz.userservice.usermanagement.service.UserServiceImpl;

@RestController
@RequestMapping("/api/v1/internal/users")
public class InternalUserController {

    private final UserServiceImpl service;
    private final UserRepository repo;

    public InternalUserController(UserRepository repo, UserServiceImpl service) {
        this.service = service;
        this.repo = repo;
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<InternalUserDetailDto> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(InternalUserDetailDto.fromUser(repo.findByEmail(email).orElseThrow()));
    }

    @GetMapping("/{userId}/active")
    public ResponseEntity<Boolean> active(@PathVariable Long userId) {
        return ResponseEntity.ok(repo.findById(userId)
                .map(u -> u.getStatus() == com.serviceeverz.userservice.shared.enums.UserStatus.ACTIVE
                        || u.getStatus() == com.serviceeverz.userservice.shared.enums.UserStatus.PENDINGACTIVATION)
                .orElse(false));
    }

    @PostMapping("/{email}/failed-attempt")
    public ResponseEntity<Void> incrementFailed(@PathVariable String email) {
        service.incrementFailedAttempts(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{email}/reset-attempt")
    public ResponseEntity<Void> resetAttempts(@PathVariable String email) {
        service.resetFailedAttempts(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{email}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable String email,
            @RequestBody InternalResetPasswordRequest request) {
        service.resetPasswordAfterOtp(email, request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{email}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable String email) {
        service.activateUser(email);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsersInternal() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    // ── NEW: bulk fetch users by a comma-separated list of IDs ───────────────
    // Called by ticket-service collaborationApi.js for @mention support-agent lookup
    // Example: GET /api/v1/internal/users/by-ids?ids=1,2,5,11
    @GetMapping("/by-ids")
    public ResponseEntity<List<UserResponse>> getUsersByIds(
            @RequestParam("ids") String ids) {

        List<Long> idList = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());

        List<UserResponse> users = repo.findByIdIn(idList)
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }
}
