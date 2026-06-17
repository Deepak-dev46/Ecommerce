package com.rvz.serviceeverz.dto.response;

public class UserEmailResponse {
	private Long id;
	private String fullName, email;

	public UserEmailResponse() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long v) {
		id = v;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String v) {
		fullName = v;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String v) {
		email = v;
	}
}
