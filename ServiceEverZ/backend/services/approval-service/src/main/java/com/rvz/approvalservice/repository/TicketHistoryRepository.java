package com.rvz.approvalservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rvz.approvalservice.entity.TicketHistory;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long>{

}
