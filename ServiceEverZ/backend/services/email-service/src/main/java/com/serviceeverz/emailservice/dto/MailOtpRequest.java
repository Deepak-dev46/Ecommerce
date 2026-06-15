package com.serviceeverz.emailservice.dto;

public class MailOtpRequest {


private String email;
    private String otp;

    public MailOtpRequest() {}

    public String getEmail() {
        return email;
    }

public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }


}
