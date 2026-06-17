package com.serviceeverz.userservice.passwordpolicy.service;
 
import java.util.regex.Pattern;
 
import org.springframework.stereotype.Component;
 
import com.serviceeverz.userservice.passwordpolicy.entity.PasswordPolicy;
import com.serviceeverz.userservice.shared.exception.BusinessException;
 
@Component
public class PasswordPolicyValidator {
 
    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9]");
 
    public void validate(String password, PasswordPolicy policy) {
        if (password == null || password.isBlank()) {
            throw new BusinessException("New password is required");
        }
 
        if (password.length() < policy.getMinLength()) {
            throw new BusinessException("Password must be at least " + policy.getMinLength() + " characters long");
        }
 
        if (policy.isRequireUppercase() && !UPPERCASE.matcher(password).find()) {
            throw new BusinessException("Password must contain at least one uppercase letter");
        }
 
        if (policy.isRequireLowercase() && !LOWERCASE.matcher(password).find()) {
            throw new BusinessException("Password must contain at least one lowercase letter");
        }
 
        if (policy.isRequireDigit() && !DIGIT.matcher(password).find()) {
            throw new BusinessException("Password must contain at least one number");
        }
 
        if (policy.isRequireSpecialChar() && !SPECIAL.matcher(password).find()) {
            throw new BusinessException("Password must contain at least one special character");
        }
    }
}
 