package com.serviceeverz.userservice.client.dto;

public class TempPwRequest {
	private String email;
	private String tempPw;
	private String empId;

	public TempPwRequest() {
	}

	public TempPwRequest(String email, String tempPw, String empId) {
		this.email = email;
		this.tempPw = tempPw;
		this.empId = empId;
	}

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