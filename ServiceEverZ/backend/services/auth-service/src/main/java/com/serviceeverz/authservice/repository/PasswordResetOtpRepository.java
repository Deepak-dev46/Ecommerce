package com.serviceeverz.authservice.repository;
 
import com.serviceeverz.authservice.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.time.LocalDateTime;
import java.util.Optional;
 
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
 
    Optional<PasswordResetOtp> findTopByEmailOrderByIdDesc(String email);
 
    long countByEmailAndCreatedAtAfter(String email, LocalDateTime time);
}
 