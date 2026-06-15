package com.relevantz.ticketservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.ServiceType;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {}