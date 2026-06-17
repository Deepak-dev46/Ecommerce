package com.serviceeverz.userservice.usermanagement.service;
 
import org.springframework.web.multipart.MultipartFile;

import com.serviceeverz.userservice.usermanagement.dto.ChangePasswordRequest;
import com.serviceeverz.userservice.usermanagement.dto.ProfileResponse;
import com.serviceeverz.userservice.usermanagement.dto.UpdateProfileRequest;
 
public interface IProfileService {
 
    ProfileResponse updateMyProfile(UpdateProfileRequest request);
 
    void changeMyPassword(ChangePasswordRequest request);
 
    void changeFirstLoginPassword(ChangePasswordRequest request);

	ProfileResponse uploadProfilePhoto(MultipartFile file);
	ProfileResponse getMyProfile();
}
 