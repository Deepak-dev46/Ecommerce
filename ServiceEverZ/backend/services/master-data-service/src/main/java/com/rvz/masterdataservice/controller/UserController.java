package com.rvz.masterdataservice.controller;

import com.rvz.masterdataservice.dto.ApiResponse;
import com.rvz.masterdataservice.dto.response.UserResponse;
import com.rvz.masterdataservice.entity.User;
import com.rvz.masterdataservice.exception.ResourceNotFoundException;
import com.rvz.masterdataservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/master/users")
@CrossOrigin(origins = "http://localhost:5173/")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/master/users/{id}
     * Returns user details including email — consumed by ticket-service to
     * resolve the requester's actual email address instead of using a hardcoded value.
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        log.info("GET /api/master/users/{}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("User fetched successfully");
        response.setData(toResponse(user));
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/master/users?status=ACTIVE
     * Returns all active users (useful for admin dropdowns / user search).
     * ── EXISTING ENDPOINT – NOT MODIFIED ──
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers(
            @RequestParam(required = false, defaultValue = "ACTIVE") String status) {
        log.info("GET /api/master/users?status={}", status);
        List<User> users;
        try {
            User.Status statusEnum = User.Status.valueOf(status.toUpperCase());
            users = userRepository.findByStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            users = userRepository.findAll();
        }
        List<UserResponse> data = users.stream().map(this::toResponse).collect(Collectors.toList());
        ApiResponse<List<UserResponse>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Users fetched successfully");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/master/users/email/{email}
     * ── NEW ENDPOINT – Added for email-ticket-service (Story 22) ──
     *
     * Called by email-ticket-service to validate that the sender's email
     * exists in the system before creating a ticket.
     * UserRepository.findByEmail() already exists — no repository change needed.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(
            @PathVariable String email) {
        log.info("GET /api/master/users/email/{}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("User fetched successfully");
        response.setData(toResponse(user));
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    // ── Private mapper ──────────────────────────────────────────────────────
    private UserResponse toResponse(User entity) {
        UserResponse dto = new UserResponse();
        dto.setId(entity.getId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setEmployeeId(entity.getEmployeeId());
        dto.setDepartment(entity.getDepartment() != null ? entity.getDepartment().name() : null);
        dto.setDesignation(entity.getDesignation() != null ? entity.getDesignation().name() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        return dto;
    }
}
