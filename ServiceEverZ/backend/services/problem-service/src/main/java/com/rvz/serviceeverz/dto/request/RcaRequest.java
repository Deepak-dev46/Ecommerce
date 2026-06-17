package com.rvz.serviceeverz.dto.request;



import jakarta.validation.constraints.NotBlank;

public class RcaRequest {

	@NotBlank(message = "Root cause description is required")
	private String rootCause;

	public String getRootCause() {
		return rootCause;
	}

	public void setRootCause(String rootCause) {
		this.rootCause = rootCause;
	}
}
