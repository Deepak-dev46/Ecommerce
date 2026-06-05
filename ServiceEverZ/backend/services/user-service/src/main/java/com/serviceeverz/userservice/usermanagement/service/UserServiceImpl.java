package com.serviceeverz.userservice.usermanagement.service;
 
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
// ✅ CORRECT Spring imports (NOT java.awt.print.Pageable)
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
// ✅ CORRECT Transactional import (NOT jakarta.transaction.Transactional)
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.serviceeverz.userservice.client.EmailClient;
import com.serviceeverz.userservice.client.RoleServiceClient;
import com.serviceeverz.userservice.client.dto.TempPwRequest;
import com.serviceeverz.userservice.config.DataSeeder;
import com.serviceeverz.userservice.location.entity.Location;
import com.serviceeverz.userservice.location.repository.LocationRepository;
import com.serviceeverz.userservice.organization.entity.DepartmentEntity;
import com.serviceeverz.userservice.organization.entity.DesignationEntity;
import com.serviceeverz.userservice.organization.repository.DepartmentRepository;
import com.serviceeverz.userservice.organization.repository.DesignationRepository;
import com.serviceeverz.userservice.passwordpolicy.service.IPasswordPolicyService;
import com.serviceeverz.userservice.shared.enums.UserStatus;
import com.serviceeverz.userservice.shared.exception.BusinessException;
import com.serviceeverz.userservice.shared.exception.ResourceNotFoundException;
import com.serviceeverz.userservice.usermanagement.dto.CreateUserRequest;
import com.serviceeverz.userservice.usermanagement.dto.CsvUploadResponse;
import com.serviceeverz.userservice.usermanagement.dto.InternalUserDetailDto;
import com.serviceeverz.userservice.usermanagement.dto.UpdateUserRequest;
import com.serviceeverz.userservice.usermanagement.dto.UserResponse;
import com.serviceeverz.userservice.usermanagement.entity.User;
import com.serviceeverz.userservice.usermanagement.repository.UserRepository;
import com.serviceeverz.userservice.usermanagement.util.PasswordValidationUtil;
 
@Service
public class UserServiceImpl implements IUserService {
 
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final String TEMP_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
 
    private final DataSeeder dataSeeder;
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final EmailClient emailClient;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final LocationRepository locationRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final PasswordValidationUtil passwordValidationUtil;
    private final IPasswordHistoryService passwordHistoryService;
    private final IPasswordPolicyService passwordPolicyService;
    private final RoleServiceClient roleServiceClient;
 
    public UserServiceImpl(
            UserRepository repo,
            PasswordEncoder encoder,
            EmailClient emailClient,
            DataSeeder dataSeeder,
            DepartmentRepository departmentRepository,
            DesignationRepository designationRepository,
            LocationRepository locationRepository,
            PasswordValidationUtil passwordValidationUtil,
            IPasswordHistoryService passwordHistoryService,
            IPasswordPolicyService passwordPolicyService,
            RoleServiceClient roleServiceClient
    ) {
        this.repo = repo;
        this.encoder = encoder;
        this.emailClient = emailClient;
        this.dataSeeder = dataSeeder;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.locationRepository = locationRepository;
        this.passwordValidationUtil = passwordValidationUtil;
        this.passwordHistoryService = passwordHistoryService;
        this.passwordPolicyService = passwordPolicyService;
        this.roleServiceClient = roleServiceClient;
    }
 
    // ── Helpers ──────────────────────────────────────────────────────────────
 
    private synchronized Long nextEmployeeId() {
        return repo.findAll()
                .stream()
                .mapToLong(User::getEmployeeId)
                .max()
                .orElse(10000L) + 1;
    }
 
    private DepartmentEntity getDepartmentOrThrow(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .filter(DepartmentEntity::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active department not found: " + departmentId));
    }
 
    private DesignationEntity getDesignationOrThrow(Long designationId) {
        return designationRepository.findById(designationId)
                .filter(DesignationEntity::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active designation not found: " + designationId));
    }
 
    private Location getLocationOrThrow(Long locationId) {
        return locationRepository.findById(locationId)
                .filter(Location::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active location not found: " + locationId));
    }
 
    private void validateDepartmentDesignation(DepartmentEntity department, DesignationEntity designation) {
        if (department == null || designation == null) {
            throw new BusinessException("Department and designation are required");
        }
        if (designation.getDepartment() == null || designation.getDepartment().getId() == null) {
            throw new BusinessException("Designation is not mapped to any department");
        }
        if (!designation.getDepartment().getId().equals(department.getId())) {
            throw new BusinessException("Designation does not belong to selected department");
        }
    }
 
    private String generateTempPassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(secureRandom.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
 
    private boolean hasColumn(List<String> headers, String expected) {
        return headers.stream().anyMatch(h -> h.equalsIgnoreCase(expected));
    }
 
    private String value(CSVRecord row, String header) {
        String v = row.get(header);
        return v == null ? "" : v.trim();
    }
 
    // ── User activation ───────────────────────────────────────────────────────
 
    public void activateUserOnFirstLogin(String email) {
        repo.findByEmail(email).ifPresent(user -> {
            if (user.getStatus() == UserStatus.PENDINGACTIVATION) {
                user.setStatus(UserStatus.ACTIVE);
                user.setFirstLogin(false);
                repo.save(user);
            }
        });
    }
 
    public void activateUser(String email) {
        repo.findByEmail(email).ifPresent(user -> {
            if (user.getStatus() == UserStatus.PENDINGACTIVATION) {
                user.setStatus(UserStatus.ACTIVE);
                repo.save(user);
            }
        });
    }
 
    // ── Create ────────────────────────────────────────────────────────────────
 
    @Override
    public UserResponse createUser(CreateUserRequest req, Long adminId, String adminEmail) {
        if (repo.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email already exists");
        }
 
        DepartmentEntity department = getDepartmentOrThrow(req.getDepartmentId());
        DesignationEntity designation = getDesignationOrThrow(req.getDesignationId());
        validateDepartmentDesignation(department, designation);
 
        Location location = null;
        if (req.getLocationId() != null) {
            location = getLocationOrThrow(req.getLocationId());
        }
 
        long empId = nextEmployeeId();
        String tempPassword = generateTempPassword();
 
        User u = new User();
        u.setEmployeeId(empId);
        u.setFirstName(req.getFirstName().trim());
        u.setLastName(req.getLastName().trim());
        u.setEmail(req.getEmail().trim());
        u.setPasswordHash(encoder.encode(tempPassword));
        u.setDepartment(department);
        u.setDesignation(designation);
        u.setLocation(location);
        u.setFirstLogin(true);
        u.setStatus(UserStatus.PENDINGACTIVATION);
        u.setCreatedBy(adminId == null ? 0L : adminId);
 
        // ── Set manager ──────────────────────────────────────────────────────
        if (req.getManagerId() != null) {
            repo.findById(req.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found: " + req.getManagerId()));
            u.setManagerId(req.getManagerId());
        }
 
        User saved = repo.save(u);
 
        emailClient.sendTempPassword(
                new TempPwRequest(
                        saved.getEmail(),
                        tempPassword,
                        String.valueOf(saved.getEmployeeId())
                )
        );
 
        return UserResponse.fromUser(saved);
    }
 
    @Override
    public List<UserResponse> createBulkUsers(List<CreateUserRequest> requests, Long adminId, String adminEmail) {
        List<UserResponse> responses = new ArrayList<>();
        for (CreateUserRequest req : requests) {
            try {
                responses.add(createUser(req, adminId, adminEmail));
            } catch (Exception ignored) {
            }
        }
        return responses;
    }
 
   @Override
    public CsvUploadResponse createUsersFromCsv(MultipartFile file, Long adminId, String adminEmail) {
        List<UserResponse> created = new ArrayList<>();
        List<String> failed = new ArrayList<>();
 
        try (
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
                CSVParser parser = new CSVParser(
                        reader,
                        CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())
        ) {
            List<String> headers = parser.getHeaderNames();
            List<String> requiredHeaders = List.of("firstName", "lastName", "email", "department", "designation");
 
            for (String required : requiredHeaders) {
                if (headers.stream().noneMatch(h -> h.equalsIgnoreCase(required))) {
                    throw new RuntimeException("Missing required CSV header: " + required);
                }
            }
 
            for (CSVRecord row : parser) {
                long rowNumber = row.getRecordNumber() + 1;
                try {
                    String firstName = value(row, "firstName");
                    String lastName = value(row, "lastName");
                    String email = value(row, "email");
                    String departmentRaw = value(row, "department");
                    String designationRaw = value(row, "designation");
                    String locationRaw = hasColumn(headers, "location") ? value(row, "location") : "";
 
                    List<String> rowErrors = new ArrayList<>();
 
                    if (firstName.isBlank()) rowErrors.add("firstName is missing");
                    if (lastName.isBlank()) rowErrors.add("lastName is missing");
 
                    if (email.isBlank()) {
                        rowErrors.add("email is missing");
                    } else if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                        rowErrors.add("email is invalid");
                    } else if (repo.existsByEmail(email)) {
                        rowErrors.add(email + " already exists");
                    }
 
                    DepartmentEntity department = null;
                    if (departmentRaw.isBlank()) {
                        rowErrors.add("department is missing");
                    } else {
                        department = departmentRepository.findByNameIgnoreCase(departmentRaw)
                                .filter(DepartmentEntity::isActive).orElse(null);
                        if (department == null) rowErrors.add("invalid department: " + departmentRaw);
                    }
 
                    DesignationEntity designation = null;
                    if (designationRaw.isBlank()) {
                        rowErrors.add("designation is missing");
                    } else if (department != null) {
                        designation = designationRepository
                                .findByNameIgnoreCaseAndDepartmentId(designationRaw, department.getId())
                                .filter(DesignationEntity::isActive).orElse(null);
                        if (designation == null) {
                            rowErrors.add("invalid designation: " + designationRaw + " under department: " + departmentRaw);
                        }
                    }
 
                   Location location = null;
                    if (!locationRaw.isBlank()) {
                        location = locationRepository.findByNameIgnoreCase(locationRaw)
                                .filter(Location::isActive).orElse(null);
                        if (location == null) rowErrors.add("invalid location: " + locationRaw);
                    }
 
                    if (!rowErrors.isEmpty()) {
                        failed.add("Row " + rowNumber + ": " + String.join(", ", rowErrors));
                        continue;
                    }
 
                    long empId = nextEmployeeId();
                    String tempPw = generateTempPassword();
 
                    User u = new User();
                    u.setEmployeeId(empId);
                    u.setFirstName(firstName);
                    u.setLastName(lastName);
                    u.setEmail(email);
                    u.setPasswordHash(encoder.encode(tempPw));
                    u.setDepartment(department);
                    u.setDesignation(designation);
                    u.setLocation(location);
                    u.setFirstLogin(true);
                    u.setStatus(UserStatus.PENDINGACTIVATION);
                    u.setCreatedBy(adminId == null ? 0L : adminId);
 
                    User saved = repo.save(u);
                    emailClient.sendTempPassword(
                            new TempPwRequest(saved.getEmail(), tempPw, String.valueOf(saved.getEmployeeId())));
                    created.add(UserResponse.fromUser(saved));
 
                } catch (Exception e) {
                    failed.add("Row " + rowNumber + ": " + e.getMessage());
                }
            }
 
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV: " + e.getMessage());
        }
 
        return new CsvUploadResponse(
                created.size() + failed.size(),
                created.size(),
                failed.size(),
                created,
                failed
        );
    }
 // ── Read ──────────────────────────────────────────────────────────────────
 
    @Override
    public List<UserResponse> getAllUsers() {
        return repo.findAll()
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }
 
    @Override
    public UserResponse getUserById(Long id) {
        return UserResponse.fromUser(
                repo.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id))
        );
    }
 
    @Override
    public InternalUserDetailDto getUserByEmail(String email) {
        return InternalUserDetailDto.fromUser(
                repo.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email))
        );
    }
 
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, String department, UserStatus status,
                                       Long roleId, Boolean hasNoRole, Pageable pageable) {
 
        Set<Long> roleUserIds = null;
        if (roleId != null) {
            try {
                roleUserIds = new HashSet<>(roleServiceClient.getUserIdsByRole(roleId));
            } catch (Exception e) {
                roleUserIds = Collections.emptySet();
            }
        }
 
        Set<Long> usersWithAnyRole = null;
        if (Boolean.TRUE.equals(hasNoRole)) {
            try {
                usersWithAnyRole = new HashSet<>(roleServiceClient.getAllAssignedUserIds());
            } catch (Exception e) {
                usersWithAnyRole = Collections.emptySet();
            }
        }
 
        final Set<Long> finalRoleUserIds = roleUserIds;
        final Set<Long> finalUsersWithRole = usersWithAnyRole;
 
        List<User> allUsers = repo.findByFilters(search, department, status, Pageable.unpaged()).getContent();
 
        List<UserResponse> filtered = allUsers.stream()
                .filter(u -> {
                    if (finalRoleUserIds != null && !finalRoleUserIds.contains(u.getId())) return false;
                    if (finalUsersWithRole != null && finalUsersWithRole.contains(u.getId())) return false;
                    return true;
                })
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
 
        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);
        List<UserResponse> pageContent = (start >= total)
                ? Collections.emptyList()
                : filtered.subList(start, end);
 
        return new PageImpl<>(pageContent, pageable, total);
    }
 // ── Update ────────────────────────────────────────────────────────────────
 
    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest req, String adminEmail) {
        User u = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
 
        if (req.getFirstName() != null && !req.getFirstName().isBlank())
            u.setFirstName(req.getFirstName().trim());
 
        if (req.getLastName() != null && !req.getLastName().isBlank())
            u.setLastName(req.getLastName().trim());
 
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(u.getEmail()) && repo.existsByEmail(newEmail)) {
                throw new BusinessException("Email already exists");
            }
            u.setEmail(newEmail);
        }
 
        DepartmentEntity department = u.getDepartment();
        DesignationEntity designation = u.getDesignation();
 
        if (req.getDepartmentId() != null) department = getDepartmentOrThrow(req.getDepartmentId());
        if (req.getDesignationId() != null) designation = getDesignationOrThrow(req.getDesignationId());
 
        validateDepartmentDesignation(department, designation);
        u.setDepartment(department);
        u.setDesignation(designation);
 
        if (req.getLocationId() != null) {
            u.setLocation(getLocationOrThrow(req.getLocationId()));
        }
 
        // ── Update manager ────────────────────────────────────────────────────
        if (req.getManagerId() != null) {
            repo.findById(req.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found: " + req.getManagerId()));
            u.setManagerId(req.getManagerId());
        }
 
        if (req.getStatus() != null) u.setStatus(req.getStatus());
 
        return UserResponse.fromUser(repo.save(u));
    }
 
    @Override
    public UserResponse mapLocation(Long userId, Long locationId, String adminEmail) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setLocation(getLocationOrThrow(locationId));
        return UserResponse.fromUser(repo.save(user));
    }
 // ── NEW: get eligible managers ─────────────────────────────────────────────
 
    @Override
    public List<UserResponse> getEligibleManagers(String role) {
        List<String> managerRoles = (role != null && !role.isBlank())
                ? List.of(role)
                : List.of("ITSM_MANAGER", "APPROVAL_MANAGER_L1", "APPROVAL_MANAGER_L2", "RESOURCE_OWNER");
 
        try {
            Set<Long> managerUserIds = new java.util.HashSet<>();
 
            for (String roleName : managerRoles) {
                List<Long> ids = roleServiceClient.getUserIdsByRoleName(roleName);
                managerUserIds.addAll(ids);
            }
 
            if (managerUserIds.isEmpty()) return List.of();
 
            return repo.findByIdIn(new java.util.ArrayList<>(managerUserIds))
                    .stream()
                    .filter(u -> u.getStatus() == UserStatus.ACTIVE
                            || u.getStatus() == UserStatus.PENDINGACTIVATION)
                    .map(UserResponse::fromUser)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }
 
    // ── NEW: get all users whose managerId = given managerId ──────────────────
 
    @Override
    public List<UserResponse> getUsersByManager(Long managerId) {
        return repo.findByManagerId(managerId)
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }
 
    // ── Status / security ─────────────────────────────────────────────────────
 
    @Override
    public void disableUser(Long id, String adminEmail) {
        User u = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        u.setStatus(UserStatus.DISABLED);
        repo.save(u);
    }
 
    @Override
    public boolean isUserActive(Long id) {
        return repo.findById(id)
                .map(u -> u.getStatus() == UserStatus.ACTIVE
                        || u.getStatus() == UserStatus.PENDINGACTIVATION)
                .orElse(false);
    }
 
    public void incrementFailedAttempts(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setAccountLocked(true);
            user.setLockTime(LocalDateTime.now());
        }
        repo.save(user);
    }
 
    public void resetFailedAttempts(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        user.setLockTime(null);
        repo.save(user);
    }
  @Override
    public void resetPasswordAfterOtp(String email, String newPassword) {
        User user = repo.findByEmail(email).orElseThrow();
        passwordValidationUtil.validate(newPassword);
        passwordHistoryService.validatePasswordReuse(user.getId(), newPassword, user.getPasswordHash());
        passwordHistoryService.savePassword(user.getId(), user.getPasswordHash());
        user.setPasswordHash(encoder.encode(newPassword));
        user.setFirstLogin(false);
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        user.setLockTime(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        repo.save(user);
    }
 
    // ── Delete ────────────────────────────────────────────────────────────────
 
    @Override
    public String deleteUserById(Long id) {
        User u = repo.findById(id).orElse(null);
        if (u == null) return "No User Found";
        repo.delete(u);
        return "User Deleted!";
    }

	@Override
	public String setActive(String email) {
		User u = repo.findByEmail(email).orElseThrow();
        if (u == null) return "No User Found";
        u.setStatus(UserStatus.ACTIVE);
        repo.save(u);
		return "Status:ACTIVE";
	}
}
