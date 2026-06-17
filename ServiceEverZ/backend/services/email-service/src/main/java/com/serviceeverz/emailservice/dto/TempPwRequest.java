package com.serviceeverz.emailservice.dto;

public class TempPwRequest {
	private String email;
	private String tempPw;
	private String empId;

	public String getEmail() {
		return email;
	}

	public void setEmail(String v) {
		this.email = v;
	}

	public String getTempPw() {
		return tempPw;
	}

	public void setTempPw(String v) {
		this.tempPw = v;
	}

	public String getEmpId() {
		return empId;
	}

	public void setEmpId(String v) {
		this.empId = v;
	}
}