package com.rvz.serviceeverz.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PermanentFixRequest {

	@NotBlank(message = "Permanent fix description is required")
	private String permanentFix;

	private String symptoms;

	@NotNull(message = "Support Personnel ID is required")
	private Long spId;

	public String getPermanentFix() {
		return permanentFix;
	}

	public void setPermanentFix(String permanentFix) {
		this.permanentFix = permanentFix;
	}

	public String getSymptoms() {
		return symptoms;
	}

	public void setSymptoms(String symptoms) {
		this.symptoms = symptoms;
	}

	public Long getSpId() {
		return spId;
	}

	public void setSpId(Long spId) {
		this.spId = spId;
	}
}
