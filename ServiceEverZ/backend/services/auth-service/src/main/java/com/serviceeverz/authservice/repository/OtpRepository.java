package com.serviceeverz.authservice.repository;


import com.serviceeverz.authservice.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailOrderByIdDesc(String email);
    long countByEmailAndExpiryTimeAfter(String email, LocalDateTime time);

	long countByEmailAndCreatedAtAfter(String email, LocalDateTime time);
    
}
