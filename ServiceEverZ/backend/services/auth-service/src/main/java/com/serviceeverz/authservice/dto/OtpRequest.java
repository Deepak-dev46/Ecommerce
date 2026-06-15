package com.serviceeverz.authservice.dto;

public class OtpRequest {
    private String email;
    private String otp;
    
   
    public OtpRequest(String email, String otp) {
		super();
		this.email = email;
		this.otp = otp;
	}
	public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }

    public String getOtp() { return otp; }
    public void setOtp(String v) { this.otp = v; }
}