package com.rvz.actionservice.autoclose.repository;

import com.rvz.actionservice.autoclose.entity.TicketAutoCloseState;
import com.rvz.actionservice.autoclose.enums.AutoCloseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketAutoCloseStateRepository extends JpaRepository<TicketAutoCloseState, Long> {

    Optional<TicketAutoCloseState> findByTicketId(Long ticketId);

    /**
     * Core scheduler query — fetches all PENDING records whose countdown has expired.
     * The composite index on (status, scheduled_close_at) makes this very fast.
     */
    @Query("SELECT t FROM TicketAutoCloseState t " +
           "WHERE t.status = :status AND t.scheduledCloseAt <= :now")
    List<TicketAutoCloseState> findDueForAutoClose(
            @Param("status") AutoCloseStatus status,
            @Param("now") LocalDateTime now);
}
