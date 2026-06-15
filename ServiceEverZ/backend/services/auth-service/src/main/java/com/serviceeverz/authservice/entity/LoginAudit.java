package com.serviceeverz.authservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LoginAudit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String email;
	private boolean success;
	private LocalDateTime createdAt = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String v) {
		this.email = v;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean v) {
		this.success = v;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}