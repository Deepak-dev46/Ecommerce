package com.serviceeverz.userservice.usermanagement.service;
 
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
 
import com.serviceeverz.userservice.shared.enums.UserStatus;
import com.serviceeverz.userservice.usermanagement.dto.CreateUserRequest;
import com.serviceeverz.userservice.usermanagement.dto.CsvUploadResponse;
import com.serviceeverz.userservice.usermanagement.dto.InternalUserDetailDto;
import com.serviceeverz.userservice.usermanagement.dto.UpdateUserRequest;
import com.serviceeverz.userservice.usermanagement.dto.UserResponse;
 
public interface IUserService {
    UserResponse createUser(CreateUserRequest req, Long adminId, String adminEmail);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    InternalUserDetailDto getUserByEmail(String email);
    UserResponse updateUser(Long id, UpdateUserRequest req, String adminEmail);
    void disableUser(Long id, String adminEmail);
    boolean isUserActive(Long id);
    List<UserResponse> createBulkUsers(List<CreateUserRequest> requests, Long adminId, String adminEmail);
    CsvUploadResponse createUsersFromCsv(MultipartFile file, Long adminId, String adminEmail);
    String deleteUserById(Long id);
    UserResponse mapLocation(Long userId, Long locationId, String adminEmail);
    void incrementFailedAttempts(String email);
    void resetFailedAttempts(String email);
    void resetPasswordAfterOtp(String email, String newPassword);
    void activateUser(String email);
 
    Page<UserResponse> getUsers(String search, String department, UserStatus status,
                                Long roleId, Boolean hasNoRole, Pageable pageable);
 
    // ── NEW ───────────────────────────────────────────────────────────────────
    // Returns users who hold manager-type roles (via role-service)
    // role param optional: filter by specific role name e.g. "ITSM_MANAGER"
    List<UserResponse> getEligibleManagers(String role);
 
    // Returns all END_USERs assigned to the given managerId
    List<UserResponse> getUsersByManager(Long managerId);
	String setActive(String email);
}
 