package com.serviceeverz.userservice.usermanagement.dto;
 
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
 
public class UpdateProfileRequest {
 
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
 
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
 
    @Pattern(regexp = "^[0-9]{10}$|^$|^\\+?[0-9]{10,15}$", message = "Mobile number format is invalid")
    private String mobile;
   
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;
 
    public String getFirstName() {
        return firstName;
    }
 
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
 
    public String getLastName() {
        return lastName;
    }
 
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
 
    public String getMobile() {
        return mobile;
    }
 
    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
 
    public String getProfilePicture() {
        return profilePicture;
    }
 
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
 