package com.rvz.incidentservice.repository;
 
import com.rvz.incidentservice.entity.IncidentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, Long> {
    Optional<IncidentAttachment> findByIncidentId(Long incidentId);
    List<IncidentAttachment> findAllByIncidentId(Long incidentId);
}
 