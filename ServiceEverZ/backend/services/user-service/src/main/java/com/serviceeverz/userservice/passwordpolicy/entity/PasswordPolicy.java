package com.serviceeverz.userservice.passwordpolicy.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_policy")
public class PasswordPolicy {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private int minLength = 8;
	private boolean requireUppercase = true;
	private boolean requireLowercase = true;
	private boolean requireDigit = true;
	private boolean requireSpecialChar = true;
	private int passwordExpiryDays = 90;
	private int passwordHistoryCount = 5;
	private int maxFailedAttempts = 5;
	private int lockoutDurationMinutes = 30;
	@UpdateTimestamp
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public int getMinLength() {
		return minLength;
	}

	public void setMinLength(int v) {
		this.minLength = v;
	}

	public boolean isRequireUppercase() {
		return requireUppercase;
	}

	public void setRequireUppercase(boolean v) {
		this.requireUppercase = v;
	}

	public boolean isRequireLowercase() {
		return requireLowercase;
	}

	public void setRequireLowercase(boolean v) {
		this.requireLowercase = v;
	}

	public boolean isRequireDigit() {
		return requireDigit;
	}

	public void setRequireDigit(boolean v) {
		this.requireDigit = v;
	}

	public boolean isRequireSpecialChar() {
		return requireSpecialChar;
	}

	public void setRequireSpecialChar(boolean v) {
		this.requireSpecialChar = v;
	}

	public int getPasswordExpiryDays() {
		return passwordExpiryDays;
	}

	public void setPasswordExpiryDays(int v) {
		this.passwordExpiryDays = v;
	}

	public int getPasswordHistoryCount() {
		return passwordHistoryCount;
	}

	public void setPasswordHistoryCount(int v) {
		this.passwordHistoryCount = v;
	}

	public int getMaxFailedAttempts() {
		return maxFailedAttempts;
	}

	public void setMaxFailedAttempts(int v) {
		this.maxFailedAttempts = v;
	}

	public int getLockoutDurationMinutes() {
		return lockoutDurationMinutes;
	}

	public void setLockoutDurationMinutes(int v) {
		this.lockoutDurationMinutes = v;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}