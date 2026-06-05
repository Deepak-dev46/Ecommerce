package com.serviceeverz.userservice.passwordpolicy.repository;

import com.serviceeverz.userservice.passwordpolicy.entity.PasswordPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordPolicyRepository extends JpaRepository<PasswordPolicy, Long> {
}