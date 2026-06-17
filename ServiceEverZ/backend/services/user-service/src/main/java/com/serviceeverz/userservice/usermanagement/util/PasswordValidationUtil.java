package com.serviceeverz.userservice.usermanagement.util;
 
import org.springframework.stereotype.Component;

import com.serviceeverz.userservice.passwordpolicy.dto.PasswordPolicyResponse;
import com.serviceeverz.userservice.passwordpolicy.service.IPasswordPolicyService;
 
@Component
public class PasswordValidationUtil {
 
    private final IPasswordPolicyService passwordPolicyService;
 
    public PasswordValidationUtil(IPasswordPolicyService passwordPolicyService) {
        this.passwordPolicyService = passwordPolicyService;
    }
 
    public void validate(String password) {
        PasswordPolicyResponse policy = passwordPolicyService.getPolicy();
 
        if (password == null || password.length() < policy.getMinLength()) {
            throw new RuntimeException("Password must be at least " + policy.getMinLength() + " characters");
        }
        if (policy.isRequireUppercase() && password.chars().noneMatch(Character::isUpperCase)) {
            throw new RuntimeException("Password must contain at least one uppercase letter");
        }
        if (policy.isRequireLowercase() && password.chars().noneMatch(Character::isLowerCase)) {
            throw new RuntimeException("Password must contain at least one lowercase letter");
        }
        if (policy.isRequireDigit() && password.chars().noneMatch(Character::isDigit)) {
            throw new RuntimeException("Password must contain at least one digit");
        }
        if (policy.isRequireSpecialChar() && password.chars().allMatch(Character::isLetterOrDigit)) {
            throw new RuntimeException("Password must contain at least one special character");
        }
    }
}
 