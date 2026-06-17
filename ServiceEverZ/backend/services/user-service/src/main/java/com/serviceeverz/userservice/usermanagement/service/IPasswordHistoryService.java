package com.serviceeverz.userservice.usermanagement.service;
 
public interface IPasswordHistoryService {
 
    void savePassword(Long userId, String passwordHash);
 
    void validatePasswordReuse(Long userId, String rawPassword, String currentPasswordHash);
}
 