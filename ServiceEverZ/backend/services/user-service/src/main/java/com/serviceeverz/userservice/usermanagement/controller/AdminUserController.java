package com.serviceeverz.userservice.usermanagement.controller;
 
import com.serviceeverz.userservice.location.dto.MapUserLocationRequest;
import com.serviceeverz.userservice.usermanagement.dto.*;
import com.serviceeverz.userservice.usermanagement.service.IUserService;
import com.serviceeverz.userservice.shared.enums.UserStatus;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;
 
@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {
    private final IUserService service;
 
    public AdminUserController(IUserService service) {
        this.service = service;
    }
    
    @PostMapping("/setActive/{email}")
    public ResponseEntity<String> setActiveUser(@PathVariable String email) {
    	return ResponseEntity.ok(service.setActive(email));
    }
    
 
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(service.createUser(req, adminId == null ? 0L : adminId, adminEmail));
    }
 
    @PostMapping("/bulk")
    public ResponseEntity<List<UserResponse>> createBulk(
            @Valid @RequestBody List<CreateUserRequest> requests,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(
            service.createBulkUsers(requests, adminId == null ? 0L : adminId, adminEmail));
    }
 
    @GetMapping
    public ResponseEntity<Page<UserResponse>> all(
            @RequestParam(defaultValue = "0")   int     page,
            @RequestParam(defaultValue = "10")  int     size,
            @RequestParam(required = false)     String  search,
            @RequestParam(required = false)     String  department,
            @RequestParam(required = false)     String  status,
            @RequestParam(required = false)     Long    roleId,
            @RequestParam(required = false)     Boolean hasNoRole,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
 
        UserStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = UserStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
 
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
            service.getUsers(search, department, statusEnum, roleId, hasNoRole, pageable));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(service.getUserById(id));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
            @RequestBody UpdateUserRequest req,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(service.updateUser(id, req, adminEmail));
    }
 
    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        service.disableUser(id, adminEmail);
        return ResponseEntity.noContent().build();
    }
 
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id) {
        return ResponseEntity.ok(service.deleteUserById(id));
    }
 
    @PatchMapping("/{id}/location")
    public ResponseEntity<UserResponse> mapLocation(@PathVariable Long id,
            @Valid @RequestBody MapUserLocationRequest request,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        return ResponseEntity.ok(service.mapLocation(id, request.getLocationId(), adminEmail));
    }
 
    // ── NEW: Get eligible managers (users with manager-type roles) ────────────
    // Frontend calls this to populate the Manager dropdown when creating/editing a user
    @GetMapping("/eligible-managers")
    public ResponseEntity<List<UserResponse>> getEligibleManagers(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(service.getEligibleManagers(role));
    }
 
    // ── NEW: Get all users assigned to a specific manager ─────────────────────
    @GetMapping("/by-manager/{managerId}")
    public ResponseEntity<List<UserResponse>> getUsersByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(service.getUsersByManager(managerId));
    }
}
 