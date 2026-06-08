package com.relevantz.ticketservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.ServiceItem;

public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {}
