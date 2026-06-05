// src/main/java/com/serviceeverz/userservice/sla/repository/SlaPolicyRepository.java
package com.serviceeverz.userservice.sla.repository;
 
import com.serviceeverz.userservice.sla.entity.SlaPolicy;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.Optional;
 
@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {
 
    Optional<SlaPolicy> findByPriority(TicketPriority priority);
 
    boolean existsByPriority(TicketPriority priority);
}
 