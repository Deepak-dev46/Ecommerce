package com.rvz.serviceeverz.dto.request;

import jakarta.validation.constraints.NotBlank;

public class WorkaroundRequest {

	@NotBlank(message = "Workaround description is required")
	private String workaround;

	public String getWorkaround() {
		return workaround;
	}

	public void setWorkaround(String workaround) {
		this.workaround = workaround;
	}
}
