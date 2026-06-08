package com.serviceeverz.userservice.usermanagement.service;
 
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.serviceeverz.userservice.passwordpolicy.dto.PasswordPolicyResponse;
import com.serviceeverz.userservice.passwordpolicy.service.IPasswordPolicyService;
import com.serviceeverz.userservice.usermanagement.entity.PasswordHistory;
import com.serviceeverz.userservice.usermanagement.repository.PasswordHistoryRepository;
 
@Service
public class PasswordHistoryServiceImpl implements IPasswordHistoryService {
 
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final IPasswordPolicyService passwordPolicyService;
 
    public PasswordHistoryServiceImpl(PasswordHistoryRepository passwordHistoryRepository,
                                      PasswordEncoder passwordEncoder,
                                      IPasswordPolicyService passwordPolicyService) {
        this.passwordHistoryRepository = passwordHistoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyService = passwordPolicyService;
    }
 
    @Override
    public void savePassword(Long userId, String passwordHash) {
        passwordHistoryRepository.save(new PasswordHistory(userId, passwordHash));
    }
 
    @Override
    public void validatePasswordReuse(Long userId, String rawPassword, String currentPasswordHash) {
        if (passwordEncoder.matches(rawPassword, currentPasswordHash)) {
            throw new RuntimeException("New password must be different from current password");
        }
 
        PasswordPolicyResponse policy = passwordPolicyService.getPolicy();
        int historyCount = policy.getPasswordHistoryCount();
 
        List<PasswordHistory> history = passwordHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(historyCount)
                .toList();
 
        boolean reused = history.stream()
                .anyMatch(item -> passwordEncoder.matches(rawPassword, item.getPasswordHash()));
 
        if (reused) {
            throw new RuntimeException("New password must not match any of the last " + historyCount + " passwords");
        }
    }
}
 