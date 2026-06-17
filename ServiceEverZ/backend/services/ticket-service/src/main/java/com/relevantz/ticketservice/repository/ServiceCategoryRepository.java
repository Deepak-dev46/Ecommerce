package com.relevantz.ticketservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.relevantz.ticketservice.model.ServiceCategory;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {}