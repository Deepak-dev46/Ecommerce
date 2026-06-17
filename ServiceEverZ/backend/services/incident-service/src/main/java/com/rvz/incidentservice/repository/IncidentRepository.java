package com.rvz.incidentservice.repository;

import com.rvz.incidentservice.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    /** All incidents raised by a specific user — powers "My Tickets" for incidents */
    List<Incident> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** All incidents assigned to a specific support person */
    List<Incident> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);
}
