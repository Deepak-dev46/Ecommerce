package com.serviceeverz.userservice.usermanagement.repository;
 
import com.serviceeverz.userservice.usermanagement.entity.PasswordHistory;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
 
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {
 
    List<PasswordHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
 