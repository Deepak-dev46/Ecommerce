// src/main/java/com/serviceeverz/userservice/sla/repository/SlaEscalationLevelRepository.java
package com.serviceeverz.userservice.sla.repository;
 
import com.serviceeverz.userservice.sla.entity.SlaEscalationLevel;
import com.serviceeverz.userservice.sla.enums.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface SlaEscalationLevelRepository extends JpaRepository<SlaEscalationLevel, Long> {
 
    List<SlaEscalationLevel> findByPriorityOrderByEscalationLevelAsc(TicketPriority priority);
 
    Optional<SlaEscalationLevel> findByPriorityAndEscalationLevel(TicketPriority priority, int escalationLevel);
 
    List<SlaEscalationLevel> findAllByOrderByPriorityAscEscalationLevelAsc();
}
 