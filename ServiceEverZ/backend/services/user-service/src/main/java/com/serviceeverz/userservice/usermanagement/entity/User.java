package com.serviceeverz.userservice.usermanagement.entity;

import com.serviceeverz.userservice.location.entity.Location;
import com.serviceeverz.userservice.organization.entity.DepartmentEntity;
import com.serviceeverz.userservice.organization.entity.DesignationEntity;
import com.serviceeverz.userservice.shared.enums.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = { @UniqueConstraint(columnNames = "email"),
		@UniqueConstraint(columnNames = "employeeId") })
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false, unique = true)
	private Long employeeId;
	@Column(nullable = false)
	private String firstName;
	@Column(nullable = false)
	private String lastName;
	@Column(nullable = false, unique = true)
	private String email;
	@Column(nullable = false)
	private String passwordHash;
	
	 
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "department_id", nullable = false)
	private DepartmentEntity department;
	 
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "designation_id", nullable = false)
	private DesignationEntity designation;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserStatus status = UserStatus.PENDINGACTIVATION;
	@Column(nullable = false)
	private boolean firstLogin = true;
	@CreationTimestamp
	private LocalDateTime createdAt;
	@UpdateTimestamp
	private LocalDateTime updatedAt;
	private Long createdBy;
	@Column(nullable = false)
	private int failedAttempts = 0;

	@Column(nullable = false)
	private boolean accountLocked = false;

	private LocalDateTime lockTime;
	
	@Column(length = 20)
    private String mobile;
 
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;

	   @Column(name = "manager_id")
    private Long managerId;
 
// ADD getter and setter anywhere in the getters/setters block:
 
    public Long getManagerId() {
        return managerId;
    }
 
    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
    
    private LocalDateTime passwordChangedAt;
    
    
	
	public LocalDateTime getPasswordChangedAt() {
		return passwordChangedAt;
	}

	public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
		this.passwordChangedAt = passwordChangedAt;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getProfilePicture() {
		return profilePicture;
	}

	public void setProfilePicture(String profilePicture) {
		this.profilePicture = profilePicture;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "location_id")
	private Location location;
	 
	public Location getLocation() {
	    return location;
	}
	 
	public void setLocation(Location location) {
	    this.location = location;
	}
	 


	public Long getId() {
		return id;
	}

	public Long getEmployeeId() {
		return employeeId;
	}

	public void setEmployeeId(Long v) {
		this.employeeId = v;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String v) {
		this.firstName = v;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String v) {
		this.lastName = v;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String v) {
		this.email = v;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String v) {
		this.passwordHash = v;
	}
	
	public DepartmentEntity getDepartment() { return department; }
	public void setDepartment(DepartmentEntity department) { this.department = department; }
	 
	public DesignationEntity getDesignation() { return designation; }
	public void setDesignation(DesignationEntity designation) { this.designation = designation; }
	 



	public UserStatus getStatus() {
		return status;
	}

	public void setStatus(UserStatus v) {
		this.status = v;
	}

	public boolean isFirstLogin() {
		return firstLogin;
	}

	public void setFirstLogin(boolean v) {
		this.firstLogin = v;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long v) {
		this.createdBy = v;
	}
	public int getFailedAttempts() { return failedAttempts; }
	public void setFailedAttempts(int v) { this.failedAttempts = v; }

	public boolean isAccountLocked() { return accountLocked; }
	public void setAccountLocked(boolean v) { this.accountLocked = v; }

	public LocalDateTime getLockTime() { return lockTime; }
	public void setLockTime(LocalDateTime v) { this.lockTime = v; }
}