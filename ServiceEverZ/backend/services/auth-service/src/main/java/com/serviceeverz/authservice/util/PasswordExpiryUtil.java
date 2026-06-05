package com.serviceeverz.authservice.util;
 
import org.springframework.stereotype.Component;
 
import java.time.LocalDateTime;
 
@Component
public class PasswordExpiryUtil {
 
    public boolean isExpired(LocalDateTime passwordChangedAt, Integer passwordExpiryDays) {
        if (passwordExpiryDays == null || passwordExpiryDays <= 0) {
            return false;
        }
        if (passwordChangedAt == null) {
            return true;
        }
        LocalDateTime expiryDate = passwordChangedAt.plusDays(passwordExpiryDays);
        return LocalDateTime.now().isAfter(expiryDate);
    }
}

 