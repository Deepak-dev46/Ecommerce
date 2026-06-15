package com.serviceeverz.userservice.config;
 
import com.serviceeverz.userservice.location.entity.Location;
import com.serviceeverz.userservice.location.repository.LocationRepository;
import com.serviceeverz.userservice.organization.entity.DepartmentEntity;
import com.serviceeverz.userservice.organization.entity.DesignationEntity;
import com.serviceeverz.userservice.organization.repository.DepartmentRepository;
import com.serviceeverz.userservice.organization.repository.DesignationRepository;
import com.serviceeverz.userservice.shared.enums.UserStatus;
import com.serviceeverz.userservice.usermanagement.entity.User;
import com.serviceeverz.userservice.usermanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
 
@Component
public class DataSeeder implements ApplicationRunner {
 
    @Value("${admin.default.email:admin@serviceeverz.com}")
    private String adminEmail;
 
    @Value("${admin.default.password:Admin@123}")
    private String adminPassword;
 
    @Value("${admin.default.firstName:Admin}")
    private String adminFirstName;
 
    @Value("${admin.default.lastName:User}")
    private String adminLastName;
 
    @Value("${admin.default.employeeId:1001}")
    private Long adminEmployeeId;
 
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final LocationRepository locationRepository;
 
    public DataSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            DepartmentRepository departmentRepository,
            DesignationRepository designationRepository,
            LocationRepository locationRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.locationRepository = locationRepository;
    }
 
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        DepartmentEntity management = departmentRepository.findByNameIgnoreCase("MANAGEMENT")
                .orElseGet(() -> {
                    DepartmentEntity d = new DepartmentEntity();
                    d.setName("MANAGEMENT");
                    d.setActive(true);
                    d.setCreatedBy(0L);
                    return departmentRepository.save(d);
                });
 
        DesignationEntity director = designationRepository
                .findByNameIgnoreCaseAndDepartmentId("DIRECTOR", management.getId())
                .orElseGet(() -> {
                    DesignationEntity d = new DesignationEntity();
                    d.setName("DIRECTOR");
                    d.setDepartment(management);
                    d.setActive(true);
                    d.setCreatedBy(0L);
                    return designationRepository.save(d);
                });
 
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmployeeId(adminEmployeeId);
            admin.setFirstName(adminFirstName);
            admin.setLastName(adminLastName);
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setDepartment(management);
            admin.setDesignation(director);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setFirstLogin(false);
            admin.setCreatedBy(0L);
 
            userRepository.save(admin);
            System.out.println("[DataSeeder] Admin user seeded: " + adminEmail);
        } else {
            System.out.println("[DataSeeder] Admin user already exists — skipping.");
        }
    }
    private void seedLocations() {
        if (!locationRepository.existsByNameIgnoreCase("Chennai")) {
            locationRepository.save(new Location("Chennai"));
        }
 
        if (!locationRepository.existsByNameIgnoreCase("Virudhunagar")) {
            locationRepository.save(new Location("Virudhunagar"));
        }
    }
}
 