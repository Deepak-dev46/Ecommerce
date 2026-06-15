package com.serviceeverz.rmoservice.client;
 
import com.serviceeverz.rmoservice.client.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
 
import java.util.List;
 
@FeignClient(name = "user-service")
public interface UserServiceClient {
 
    // Used by ProjectAssignmentServiceImpl to validate users are active
    @GetMapping("/api/v1/internal/users/{userId}/active")
    boolean isUserActive(@PathVariable("userId") Long userId);
 
    // ✅ FIXED: use internal endpoint that returns plain List, not paginated
    @GetMapping("/api/v1/internal/users")
    List<UserResponse> getAllUsers();
 
    // Used by RmoUserController to get one user
    @GetMapping("/api/v1/admin/users/{userId}")
    UserResponse getUserById(@PathVariable("userId") Long userId);
}
 