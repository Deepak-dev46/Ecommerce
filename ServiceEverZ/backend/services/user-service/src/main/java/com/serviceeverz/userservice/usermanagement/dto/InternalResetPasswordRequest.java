package com.serviceeverz.userservice.usermanagement.dto;
 
public class InternalResetPasswordRequest {
 
    private String newPassword;
 
    public String getNewPassword() {
        return newPassword;
    }
 
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
