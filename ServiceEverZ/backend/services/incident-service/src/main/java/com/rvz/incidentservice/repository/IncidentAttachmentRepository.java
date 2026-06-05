package com.rvz.incidentservice.repository;
 
import com.rvz.incidentservice.entity.IncidentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, Long> {
    Optional<IncidentAttachment> findByIncidentId(Long incidentId);
}
 