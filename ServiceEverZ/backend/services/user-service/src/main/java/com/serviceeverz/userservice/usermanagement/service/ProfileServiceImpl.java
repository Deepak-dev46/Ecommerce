package com.serviceeverz.userservice.usermanagement.service;
 
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.serviceeverz.userservice.shared.exception.ResourceNotFoundException;
import com.serviceeverz.userservice.usermanagement.dto.ChangePasswordRequest;
import com.serviceeverz.userservice.usermanagement.dto.ProfileResponse;
import com.serviceeverz.userservice.usermanagement.dto.UpdateProfileRequest;
import com.serviceeverz.userservice.usermanagement.entity.User;
import com.serviceeverz.userservice.usermanagement.repository.UserRepository;
import com.serviceeverz.userservice.usermanagement.util.PasswordValidationUtil;

 
@Service
public class ProfileServiceImpl implements IProfileService {
 
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidationUtil passwordValidationUtil;
    private final IPasswordHistoryService passwordHistoryService;
    

 
    public ProfileServiceImpl(UserRepository userRepository,
                              PasswordEncoder passwordEncoder,
                              PasswordValidationUtil passwordValidationUtil,
                              IPasswordHistoryService passwordHistoryService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordValidationUtil = passwordValidationUtil;
        this.passwordHistoryService = passwordHistoryService;
    }
    

@Override
@Transactional
public ProfileResponse uploadProfilePhoto(MultipartFile file) {

    User user = getAuthenticatedUser();

    try {
        // ✅ Convert file → base64
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());

        String imageData = "data:" + file.getContentType() + ";base64," + base64;

               user.setProfilePicture(imageData);

               userRepository.save(user);

               return ProfileResponse.from(user);

           } catch (Exception e) {
               throw new RuntimeException("Image upload failed");
           }
       }



@Override
@Transactional
public ProfileResponse getMyProfile() {

    String email = SecurityContextHolder.getContext()
            .getAuthentication().getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    System.out.println(user.getFirstName());

    return ProfileResponse.from(user);
}


 
    @Override
    @Transactional
    public ProfileResponse updateMyProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
 
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getMobile() != null) {
            user.setMobile(request.getMobile().trim());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture().trim());
        }
 
        return ProfileResponse.from(userRepository.save(user));
    }
 
    @Override
    @Transactional
    public void changeMyPassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
 
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
 
        passwordValidationUtil.validate(request.getNewPassword());
        passwordHistoryService.validatePasswordReuse(user.getId(), request.getNewPassword(), user.getPasswordHash());
        passwordHistoryService.savePassword(user.getId(), user.getPasswordHash());
 
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
 
        userRepository.save(user);
    }
 
    @Override
    @Transactional
    public void changeFirstLoginPassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        List<User> users=userRepository.findAll();
        
        
        System.out.println(user.isFirstLogin()+" this is the data");
 
        if (!user.isFirstLogin()) {
            throw new RuntimeException("First login password change is not required");
        }
 
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
 
        passwordValidationUtil.validate(request.getNewPassword());
        passwordHistoryService.validatePasswordReuse(user.getId(), request.getNewPassword(), user.getPasswordHash());
        passwordHistoryService.savePassword(user.getId(), user.getPasswordHash());
 
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        user.setLockTime(null);
        user.setFirstLogin(false);
 
        userRepository.save(user);
    }
 
    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
 
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new RuntimeException("Unauthorized access");
        }
 
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
 